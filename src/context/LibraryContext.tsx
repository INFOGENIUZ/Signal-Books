import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Book, Category, SubCategory, Author, User, ReadingHistoryItem, AudioTrack, ActivePage } from '../types';
import { StorageService } from '../services/storageService';
import { FirebaseService } from '../services/firebaseService';
import { TelegramService, TelegramUser } from '../services/telegramService';
import { parseGoogleDriveUrl, generateFirstPageBookCover } from '../utils/googleDrive';
import { ADMIN_USER, DEMO_USER } from '../data/mockData';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface LibraryContextType {
  books: Book[];
  categories: Category[];
  authors: Author[];
  favorites: string[];
  toggleFavorite: (bookId: string) => void;
  readingHistory: ReadingHistoryItem[];
  updateReadingProgress: (book: Book, page: number) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedBook: Book | null;
  openBookDetails: (book: Book) => void;
  trackBookOpen: (bookId: string) => void;
  selectedCategory: Category | null;
  openCategoryPage: (category: Category | string, initialSubcategoryId?: string) => void;
  activeReadingBook: Book | null;
  activeReadingPage: number;
  startReading: (book: Book, startPage?: number) => void;
  closeReader: (overridePage?: number) => void;
  getBookSavedPage: (bookId: string) => number;
  isBookRead: (bookId: string) => boolean;
  userId: string;
  isTelegramWebApp: boolean;
  telegramUser: TelegramUser | null;
  activeAudioTrack: AudioTrack | null;
  isPlayingAudio: boolean;
  playAudio: (track: AudioTrack) => void;
  pauseAudio: () => void;
  togglePlayAudio: () => void;
  audioCurrentTime: number;
  setAudioCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  audioDuration: number;
  audioPlaybackRate: number;
  setAudioPlaybackRate: (rate: number) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  loginAsAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (catId: string | null) => void;
  selectedSubCategoryFilter: string | null;
  setSelectedSubCategoryFilter: (subId: string | null) => void;
  addBook: (newBookData: Partial<Book>) => void;
  updateBook: (id: string, updatedFields: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addCategory: (newCategory: Omit<Category, 'id' | 'booksCount'> & { id?: string; booksCount?: number }) => void;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubCategory: (categoryId: string, name: string, description?: string) => void;
  updateSubCategory: (categoryId: string, subcategoryId: string, name: string, description?: string) => void;
  deleteSubCategory: (categoryId: string, subcategoryId: string) => void;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [user, setUserState] = useState<User | null>(null);

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Reader state
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [activeReadingPage, setActiveReadingPage] = useState<number>(1);

  // Audio player state
  const [activeAudioTrack, setActiveAudioTrack] = useState<AudioTrack | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(45);
  const [audioDuration] = useState<number>(1820); // sample chapter duration
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Telegram Web App detection & User identification
  const userId = useMemo(() => TelegramService.getUserId(), []);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Xush kelibsiz',
      message: 'Signal Books elektron kutubxona platformasiga xush kelibsiz! Barcha kitoblar haqiqiy nusxada taqdim etiladi.',
      time: 'Hozir',
      read: false
    }
  ]);

  useEffect(() => {
    // 1. Initialize Telegram WebApp if present
    TelegramService.init();
    setIsTelegramWebApp(TelegramService.isInsideTelegram);
    const tgUser = TelegramService.getTelegramUser();
    setTelegramUser(tgUser);

    // 2. Instant cache load from local storage
    setBooks(StorageService.getBooks());
    setCategories(StorageService.getCategories());
    setAuthors(StorageService.getAuthors());
    setFavorites(StorageService.getFavorites());
    setReadingHistory(StorageService.getReadingHistory());
    
    const storedUser = StorageService.getUser();
    if (storedUser) {
      setUserState(storedUser);
    } else if (tgUser) {
      const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 
        (tgUser.username ? `@${tgUser.username}` : 'Telegram Kitobxon');
      const customTgUser: User = {
        id: `tg_${tgUser.id}`,
        name,
        email: tgUser.username ? `@${tgUser.username}` : `tg_${tgUser.id}@telegram.org`,
        avatar: tgUser.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: 'USER',
        joinedDate: 'Bugun',
        stats: {
          booksRead: 0,
          readingHours: 0,
          favoriteCount: 0,
          audioListenedHours: 0
        }
      };
      setUserState(customTgUser);
      StorageService.saveUser(customTgUser);
    }

    // 3. Real-time Firebase cloud sync: all users see newly added books instantly!
    const unsubBooks = FirebaseService.subscribeBooks((cloudBooks) => {
      if (Array.isArray(cloudBooks)) {
        const deletedIds = new Set(JSON.parse(localStorage.getItem('signal_deleted_book_ids') || '[]'));
        const cleanBooks = cloudBooks.filter(b => b && b.id && !deletedIds.has(b.id));
        setBooks(cleanBooks);
        StorageService.saveBooks(cleanBooks);
      }
    });

    const unsubCats = FirebaseService.subscribeCategories((cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        setCategories(cloudCats);
        StorageService.saveCategories(cloudCats);
      }
    });

    const unsubAuthors = FirebaseService.subscribeAuthors((cloudAuthors) => {
      if (cloudAuthors && cloudAuthors.length > 0) {
        setAuthors(cloudAuthors);
        StorageService.saveAuthors(cloudAuthors);
      }
    });

    // Check if URL has ?page=admin or #admin to open Admin panel via link
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const pageParam = urlParams.get('page')?.toLowerCase();
      const adminSecretParam = urlParams.get('admin');

      if (pageParam === 'admin' || hash === '#admin' || hash === '#/admin' || adminSecretParam !== null) {
        setActivePage('admin');
      }
    } catch {
      // ignore
    }

    // Listen to hash changes (e.g. user navigates or clicks link to #admin)
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        setActivePage('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      unsubBooks();
      unsubCats();
      unsubAuthors();
    };
  }, []);

  // Sync native Telegram WebApp Back Button
  useEffect(() => {
    if (activeReadingBook) {
      TelegramService.setBackButton(true, () => {
        closeReader(activeReadingPage);
      });
    } else if (activePage !== 'home') {
      TelegramService.setBackButton(true, () => {
        if (activePage === 'book-details') {
          setActivePage('books');
        } else {
          setActivePage('home');
        }
      });
    } else {
      TelegramService.setBackButton(false);
    }
  }, [activePage, activeReadingBook, activeReadingPage]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleFavorite = (bookId: string) => {
    TelegramService.hapticSelection();
    const updated = StorageService.toggleFavorite(bookId);
    setFavorites(updated);
    const isNowFav = updated.includes(bookId);
    const targetBook = books.find(b => b.id === bookId);
    const bookTitle = targetBook ? `"${targetBook.title}"` : 'Kitob';
    if (isNowFav) {
      showToast(`${bookTitle} sevimlilar ro‘yxatiga qo‘shildi ⭐`, 'success');
    } else {
      showToast(`${bookTitle} sevimlilardan olib tashlandi`, 'info');
    }
  };

  const updateReadingProgress = (_book: Book, _page: number) => {
    // Reading position tracking removed as requested
  };

  const getBookSavedPage = (_bookId: string): number => {
    return 1;
  };

  const isBookRead = (_bookId: string): boolean => {
    return false;
  };

  const trackBookOpen = (bookId: string) => {
    if (!bookId) return;
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, views: (b.views || 0) + 1 } : b));
    setSelectedBook(prev => prev && prev.id === bookId ? { ...prev, views: (prev.views || 0) + 1 } : prev);
    StorageService.incrementBookViews(bookId);
    FirebaseService.incrementBookViews(bookId).catch(() => {});
  };

  const openBookDetails = (book: Book) => {
    TelegramService.hapticImpact('light');
    trackBookOpen(book.id);
    setSelectedBook({ ...book, views: (book.views || 0) + 1 });
    setActivePage('book-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategoryPage = (target: Category | string, initialSubcategoryId?: string) => {
    TelegramService.hapticImpact('light');
    let cat: Category | undefined;
    if (typeof target === 'string') {
      cat = categories.find(c => c.id === target || c.slug === target);
    } else {
      cat = target;
    }
    if (cat) {
      setSelectedCategory(cat);
      setSelectedCategoryFilter(cat.id);
      setSelectedSubCategoryFilter(initialSubcategoryId || null);
      setActivePage('category-details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startReading = (book: Book, startPage?: number) => {
    TelegramService.hapticImpact('light');
    trackBookOpen(book.id);
    setActiveReadingBook({ ...book, views: (book.views || 0) + 1 });
    const pageToUse = (typeof startPage === 'number' && startPage > 0) ? startPage : 1;
    setActiveReadingPage(pageToUse);
  };

  const closeReader = (_overridePage?: number) => {
    TelegramService.hapticSelection();
    setActiveReadingBook(null);
  };

  const playAudio = (track: AudioTrack) => {
    setActiveAudioTrack(track);
    setIsPlayingAudio(true);
    showToast(`"${track.title}" audio kitobi ijro etilmoqda 🎧`, 'info');
  };

  const pauseAudio = () => {
    setIsPlayingAudio(false);
  };

  const togglePlayAudio = () => {
    setIsPlayingAudio(prev => !prev);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    StorageService.saveUser(newUser);
  };

  const isAdmin = Boolean(user && user.role === 'ADMIN');

  const loginAsAdmin = (password: string): boolean => {
    const trimmed = password.trim();
    if (trimmed === 'm2oo50304' || trimmed === 'm20050304') {
      setUser(ADMIN_USER);
      showToast(`Xush kelibsiz, Bosh administrator ${ADMIN_USER.name}! 👑`, 'success');
      return true;
    }
    showToast('Noto‘g‘ri parol! Faqat administrator uchun ruxsat berilgan.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setUser(null);
    setActivePage('home');
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.location.hash = '';
    }
    showToast('Administrator sessiyasi yakunlandi.', 'info');
  };

  const addBook = (newBookData: Partial<Book>) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Saytga yangi kitobni faqat administrator qo‘sha oladi!', 'error');
      return;
    }

    const newId = `book-${Date.now()}`;
    const rawDriveUrl = newBookData.googleDriveUrl || (newBookData.pdfUrl?.includes('drive.google.com') ? newBookData.pdfUrl : '');
    const driveInfo = rawDriveUrl ? parseGoogleDriveUrl(rawDriveUrl) : null;
    
    // Choose PDF url: if Google Drive, prefer drive preview / download or original
    const effectivePdfUrl = driveInfo && driveInfo.isDrive 
      ? driveInfo.previewUrl 
      : (newBookData.pdfUrl || '#');

    const targetCategoryId = newBookData.categoryId || (categories[0]?.id || 'cat-1');
    const targetCategory = categories.find(c => c.id === targetCategoryId) || categories[0];
    const targetSubCategory = targetCategory?.subcategories?.find(s => s.id === newBookData.subcategoryId);

    // 1-sahifani avtomatik muqova sifatida belgilash (Rasm yuklamaslik)
    const autoCoverUrl = (newBookData.coverUrl && !newBookData.coverUrl.includes('unsplash.com'))
      ? newBookData.coverUrl
      : (driveInfo && driveInfo.isDrive && driveInfo.thumbnailUrl)
        ? driveInfo.thumbnailUrl
        : generateFirstPageBookCover(
            newBookData.title || 'Yangi Kitob',
            newBookData.authorName || 'Abdulla Qodiriy',
            targetCategory ? targetCategory.name : 'Badiiy adabiyot',
            newBookData.publicationYear || 2024
          );

    const fullBook: Book = {
      id: newId,
      title: newBookData.title || 'Yangi Kitob',
      slug: (newBookData.title || 'yangi-kitob').toLowerCase().replace(/\s+/g, '-'),
      authorId: newBookData.authorId || 'auth-1',
      authorName: newBookData.authorName || 'Abdulla Qodiriy',
      categoryId: targetCategory ? targetCategory.id : 'cat-1',
      categoryName: targetCategory ? targetCategory.name : 'Badiiy adabiyot',
      subcategoryId: newBookData.subcategoryId || undefined,
      subcategoryName: targetSubCategory?.name || newBookData.subcategoryName || undefined,
      description: newBookData.description || 'Kitob tavsifi...',
      coverUrl: autoCoverUrl,
      pdfUrl: effectivePdfUrl,
      googleDriveUrl: rawDriveUrl || undefined,
      language: newBookData.language || 'O‘zbekcha',
      publicationYear: newBookData.publicationYear || 2024,
      pages: newBookData.pages || 250,
      isbn: newBookData.isbn || `978-9943-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      fileSize: newBookData.fileSize || '10.5 MB',
      format: newBookData.format || ['PDF'],
      rating: 5.0,
      ratingsCount: 1,
      views: 1,
      downloads: 0,
      isFeatured: false,
      isNew: true,
      hasAudio: newBookData.hasAudio || false,
      audioDuration: newBookData.audioDuration,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      chapters: newBookData.chapters || [
        { id: 'ch-1', title: '1-bob. Kirish qismi', pageNumber: 1 },
        { id: 'ch-2', title: '2-bob. Asosiy bob', pageNumber: 50 }
      ],
      sampleContent: newBookData.sampleContent || [
        `${newBookData.title || 'Yangi kitob'} asarining elektron namunaviy sahifasi. Ushbu kitob Signal Books platformasiga muvaffaqiyatli yuklangan.`
      ]
    };

    const updated = [fullBook, ...books];
    setBooks(updated);
    StorageService.saveBooks(updated);
    FirebaseService.saveBook(fullBook).catch(err => {
      console.error('Firebase saveBook error:', err);
    });

    // Update category booksCount
    const updatedCats = categories.map(c => 
      c.id === fullBook.categoryId ? { ...c, booksCount: (c.booksCount || 0) + 1 } : c
    );
    setCategories(updatedCats);
    StorageService.saveCategories(updatedCats);
    const targetCatToUpdate = updatedCats.find(c => c.id === fullBook.categoryId);
    if (targetCatToUpdate) {
      FirebaseService.saveCategory(targetCatToUpdate).catch(console.error);
    }

    showToast(`"${fullBook.title}" muvaffaqiyatli qo‘shildi!`, 'success');

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Yangi kitob qo‘shildi',
      message: `"${fullBook.title}" asari kutubxona fondiga qo‘shildi.`,
      time: 'Hozir',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Kitob ma’lumotlarini faqat administrator tahrirlay oladi!', 'error');
      return;
    }

    let finalFields = { ...updatedFields };
    if (updatedFields.googleDriveUrl) {
      const driveInfo = parseGoogleDriveUrl(updatedFields.googleDriveUrl);
      if (driveInfo.isDrive) {
        finalFields.pdfUrl = driveInfo.previewUrl;
      }
    }

    if (updatedFields.subcategoryId) {
      const catId = updatedFields.categoryId || books.find(b => b.id === id)?.categoryId;
      const cat = categories.find(c => c.id === catId);
      const sub = cat?.subcategories?.find(s => s.id === updatedFields.subcategoryId);
      if (sub) {
        finalFields.subcategoryName = sub.name;
      }
    }

    const updated = books.map(b => b.id === id ? { ...b, ...finalFields, updatedAt: new Date().toISOString().split('T')[0] } : b);
    setBooks(updated);
    StorageService.saveBooks(updated);
    const updatedBook = updated.find(b => b.id === id);
    if (updatedBook) {
      FirebaseService.saveBook(updatedBook).catch(err => {
        console.error('Firebase updateBook error:', err);
      });
    }

    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(prev => prev ? { ...prev, ...finalFields } : null);
    }
    showToast('Kitob ma’lumotlari yangilandi', 'success');
  };

  const deleteBook = async (id: string) => {
    if (!isAdmin && (!user || user.role !== 'ADMIN')) {
      showToast('Ruxsat etilmadi: Kitobni faqat administrator o‘chira oladi!', 'error');
      return;
    }

    const target = books.find(b => b.id === id);
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    StorageService.deleteBook(id);

    try {
      await FirebaseService.deleteBook(id);
    } catch (err) {
      console.error('Firebase deleteBook error:', err);
    }

    if (target) {
      const updatedCats = categories.map(c => 
        c.id === target.categoryId ? { ...c, booksCount: Math.max(0, (c.booksCount || 1) - 1) } : c
      );
      setCategories(updatedCats);
      StorageService.saveCategories(updatedCats);
      const catToUpdate = updatedCats.find(c => c.id === target.categoryId);
      if (catToUpdate) {
        FirebaseService.saveCategory(catToUpdate).catch(console.error);
      }
    }

    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(null);
      if (activePage === 'book-details') {
        setActivePage('books');
      }
    }

    showToast(`"${target?.title || 'Kitob'}" butunlay o‘chirildi`, 'info');
  };

  const addCategory = (newCategoryData: Omit<Category, 'id' | 'booksCount'> & { id?: string; booksCount?: number }) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Yangi bo‘limni faqat administrator qo‘sha oladi!', 'error');
      return;
    }

    const newId = newCategoryData.id || `cat-${Date.now()}`;
    const slug = newCategoryData.slug || newCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const fullCat: Category = {
      id: newId,
      name: newCategoryData.name,
      slug,
      iconName: newCategoryData.iconName || 'BookOpen',
      booksCount: newCategoryData.booksCount || 0,
      color: newCategoryData.color || '#3B82F6',
      description: newCategoryData.description || 'Yangi bo‘lim adabiyotlari va qo‘llanmalari',
      subcategories: newCategoryData.subcategories || []
    };

    const updated = [...categories, fullCat];
    setCategories(updated);
    StorageService.saveCategories(updated);
    FirebaseService.saveCategory(fullCat).catch(console.error);
    showToast(`"${fullCat.name}" yangi bo‘limi qo‘shildi!`, 'success');
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Bo‘limni faqat administrator tahrirlay oladi!', 'error');
      return;
    }

    const updated = categories.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCategories(updated);
    StorageService.saveCategories(updated);
    const updatedCat = updated.find(c => c.id === id);
    if (updatedCat) {
      FirebaseService.saveCategory(updatedCat).catch(console.error);
    }
    if (selectedCategory && selectedCategory.id === id) {
      setSelectedCategory(prev => prev ? { ...prev, ...updatedFields } : null);
    }
    showToast('Bo‘lim ma’lumotlari yangilandi', 'success');
  };

  const deleteCategory = (id: string) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Bo‘limni faqat administrator o‘chira oladi!', 'error');
      return;
    }

    const target = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    StorageService.saveCategories(updated);
    FirebaseService.deleteCategory(id).catch(console.error);
    showToast(`"${target?.name || 'Bo‘lim'}" o‘chirildi`, 'info');
  };

  const addSubCategory = (categoryId: string, name: string, description?: string) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Ichki bo‘lim yoki sinfni faqat administrator qo‘sha oladi!', 'error');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) return;

    const subId = `sub-${Date.now()}`;
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || subId;
    const newSub: SubCategory = {
      id: subId,
      categoryId,
      name: trimmedName,
      slug,
      description
    };

    const updated = categories.map(c => {
      if (c.id === categoryId) {
        const existingSubs = c.subcategories || [];
        return {
          ...c,
          subcategories: [...existingSubs, newSub]
        };
      }
      return c;
    });

    setCategories(updated);
    StorageService.saveCategories(updated);

    const parentCat = updated.find(c => c.id === categoryId);
    if (parentCat) {
      FirebaseService.saveCategory(parentCat).catch(console.error);
    }

    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory(prev => prev ? {
        ...prev,
        subcategories: [...(prev.subcategories || []), newSub]
      } : null);
    }

    showToast(`"${trimmedName}" ichki bo‘limi qo‘shildi!`, 'success');
  };

  const updateSubCategory = (categoryId: string, subcategoryId: string, name: string, description?: string) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Ichki bo‘lim yoki sinfni faqat administrator tahrirlay oladi!', 'error');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) return;

    const updated = categories.map(c => {
      if (c.id === categoryId && c.subcategories) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => s.id === subcategoryId ? {
            ...s,
            name: trimmedName,
            slug: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || s.slug,
            description: description !== undefined ? description : s.description
          } : s)
        };
      }
      return c;
    });

    setCategories(updated);
    StorageService.saveCategories(updated);

    const parentCat = updated.find(c => c.id === categoryId);
    if (parentCat) {
      FirebaseService.saveCategory(parentCat).catch(console.error);
    }

    // Update books tagged with this subcategory
    const updatedBooks = books.map(b => b.subcategoryId === subcategoryId ? { ...b, subcategoryName: trimmedName } : b);
    setBooks(updatedBooks);
    StorageService.saveBooks(updatedBooks);
    updatedBooks.filter(b => b.subcategoryId === subcategoryId).forEach(b => {
      FirebaseService.saveBook(b).catch(console.error);
    });

    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory(prev => prev && prev.subcategories ? {
        ...prev,
        subcategories: prev.subcategories.map(s => s.id === subcategoryId ? { 
          ...s, 
          name: trimmedName,
          description: description !== undefined ? description : s.description
        } : s)
      } : prev);
    }

    showToast('Ichki bo‘lim yangilandi', 'success');
  };

  const deleteSubCategory = (categoryId: string, subcategoryId: string) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Ruxsat etilmadi: Ichki bo‘lim yoki sinfni faqat administrator o‘chira oladi!', 'error');
      return;
    }

    const targetCat = categories.find(c => c.id === categoryId);
    const targetSub = targetCat?.subcategories?.find(s => s.id === subcategoryId);

    const updated = categories.map(c => {
      if (c.id === categoryId && c.subcategories) {
        return {
          ...c,
          subcategories: c.subcategories.filter(s => s.id !== subcategoryId)
        };
      }
      return c;
    });

    setCategories(updated);
    StorageService.saveCategories(updated);

    const parentCat = updated.find(c => c.id === categoryId);
    if (parentCat) {
      FirebaseService.saveCategory(parentCat).catch(console.error);
    }

    // Clear subcategory association on books
    const updatedBooks = books.map(b => b.subcategoryId === subcategoryId ? { ...b, subcategoryId: undefined, subcategoryName: undefined } : b);
    setBooks(updatedBooks);
    StorageService.saveBooks(updatedBooks);
    updatedBooks.filter(b => b.subcategoryId === subcategoryId).forEach(b => {
      FirebaseService.saveBook(b).catch(console.error);
    });

    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory(prev => prev && prev.subcategories ? {
        ...prev,
        subcategories: prev.subcategories.filter(s => s.id !== subcategoryId)
      } : prev);
    }

    if (selectedSubCategoryFilter === subcategoryId) {
      setSelectedSubCategoryFilter(null);
    }

    showToast(`"${targetSub?.name || 'Ichki bo‘lim'}" o‘chirildi`, 'info');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        categories,
        authors,
        favorites,
        toggleFavorite,
        readingHistory,
        updateReadingProgress,
        activePage,
        setActivePage,
        selectedBook,
        openBookDetails,
        trackBookOpen,
        selectedCategory,
        openCategoryPage,
        activeReadingBook,
        activeReadingPage,
        startReading,
        closeReader,
        getBookSavedPage,
        isBookRead,
        userId,
        isTelegramWebApp,
        telegramUser,
        activeAudioTrack,
        isPlayingAudio,
        playAudio,
        pauseAudio,
        togglePlayAudio,
        audioCurrentTime,
        setAudioCurrentTime,
        audioDuration,
        audioPlaybackRate,
        setAudioPlaybackRate,
        user,
        setUser,
        isAdmin,
        loginAsAdmin,
        logoutAdmin,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedSubCategoryFilter,
        setSelectedSubCategoryFilter,
        addBook,
        updateBook,
        deleteBook,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        notifications,
        markNotificationsAsRead,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
