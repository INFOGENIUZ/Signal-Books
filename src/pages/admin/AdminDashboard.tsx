import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  BookText,
  Users, 
  Eye, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Filter,
  Compass,
  TrendingUp,
  FolderPlus,
  ShieldAlert,
  ExternalLink,
  Layers,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Laptop,
  Code2,
  Divide,
  Binary,
  Globe,
  Microscope,
  Atom,
  Smile,
  Sparkles,
  Languages,
  Brain,
  BrainCircuit,
  Briefcase,
  Scale,
  Palette,
  HeartPulse,
  Activity,
  History,
  Music,
  Music2,
  Folder,
  FolderGit2,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Lock,
  Key,
  ShieldCheck,
  LogOut,
  Link,
  Copy,
  LayoutGrid,
  List,
  EyeOff,
  Headphones,
  AudioLines,
  SlidersHorizontal,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, Category, BookLanguage } from '../../types';
import { parseGoogleDriveUrl, GoogleDriveParsedInfo, generateFirstPageBookCover } from '../../utils/googleDrive';
import { AiBookAnalysisCard } from '../../components/admin/AiBookAnalysisCard';
import { AiBookAnalysisResult, analyzeBookWithAI } from '../../services/aiBookAnalysisService';
import { AdminAudioBookUploadCard } from '../../components/admin/AdminAudioBookUploadCard';
import { AdminAiKnowledgePanel } from '../../components/admin/AdminAiKnowledgePanel';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen: BookText,
  BookText,
  GraduationCap,
  Laptop: Code2,
  Code2,
  Divide: Binary,
  Binary,
  Globe: Compass,
  Compass,
  Microscope: Atom,
  Atom,
  Smile: Sparkles,
  Sparkles,
  Languages,
  Brain: BrainCircuit,
  BrainCircuit,
  Briefcase,
  Scale,
  Palette,
  HeartPulse: Activity,
  Activity,
  History,
  Music: Music2,
  Music2,
  Folder: FolderGit2,
  FolderGit2
};

const THEME_COLORS = [
  { name: 'Oltin (Golden Amber)', value: '#F59E0B' },
  { name: 'Ko‘k (Royal Blue)', value: '#3B82F6' },
  { name: 'Moviy (Cyan Ocean)', value: '#06B6D4' },
  { name: 'Zumrad (Emerald Green)', value: '#10B981' },
  { name: 'Siyohrang (Deep Violet)', value: '#8B5CF6' },
  { name: 'Qizil (Ruby Rose)', value: '#F43F5E' },
  { name: 'Pushti (Magenta)', value: '#EC4899' },
  { name: 'Kulrang (Obsidian Slate)', value: '#64748B' },
];

export const AdminDashboard: React.FC = () => {
  const { 
    books, 
    categories, 
    authors, 
    addBook, 
    updateBook, 
    deleteBook, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addSubCategory, 
    updateSubCategory, 
    deleteSubCategory, 
    openCategoryPage, 
    openBookDetails, 
    startReading,
    user, 
    isAdmin,
    loginAsAdmin,
    logoutAdmin,
    setActivePage,
    showToast 
  } = useLibrary();

  // Login states
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Dashboard tab and view states
  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'books' | 'categories' | 'add' | 'add-audio' | 'ai-knowledge'>('stats');
  const [booksViewMode, setBooksViewMode] = useState<'table' | 'grid'>('table');
  
  // Books list filter & sort states
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterDriveOnly, setFilterDriveOnly] = useState<'all' | 'drive' | 'direct'>('all');
  const [filterAudioOnly, setFilterAudioOnly] = useState<'all' | 'audio' | 'pdf'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'pages' | 'title'>('newest');
  
  // Book editing & deletion states
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    iconName: 'BookOpen',
    color: '#F59E0B',
    description: ''
  });

  // Subcategory modal state
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryParentCategory, setSubCategoryParentCategory] = useState<Category | null>(null);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [subCategoryNameInput, setSubCategoryNameInput] = useState('');
  const [subCategoryDescInput, setSubCategoryDescInput] = useState('');

  // New Book Form State
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    categoryId: categories[0]?.id || 'cat-1',
    subcategoryId: '',
    language: 'O‘zbekcha' as BookLanguage,
    pages: 250,
    publicationYear: 2024,
    coverUrl: '',
    description: '',
    googleDriveUrl: '',
    pdfUrl: '',
    hasAudio: false,
    audioDuration: '3 soat 45 daqiqa'
  });

  // State for AI re-analysis inside Edit Book modal
  const [isEditAnalyzing, setIsEditAnalyzing] = useState(false);

  // Apply AI analysis results to new book form
  const handleApplyAiAnalysis = (analysis: AiBookAnalysisResult) => {
    setFormData(prev => ({
      ...prev,
      title: analysis.title || prev.title,
      authorName: analysis.authorName || prev.authorName,
      categoryId: analysis.categoryId || prev.categoryId,
      subcategoryId: analysis.subcategoryId !== undefined ? analysis.subcategoryId : prev.subcategoryId,
      language: analysis.language || prev.language,
      pages: analysis.pages || prev.pages,
      publicationYear: analysis.publicationYear || prev.publicationYear,
      description: analysis.description || prev.description,
    }));
  };

  // Re-analyze existing book inside Edit Modal
  const handleReAnalyzeEditingBook = async () => {
    if (!editingBook || (!editingBook.googleDriveUrl && !editingBook.pdfUrl)) {
      showToast('Kitobda Google Drive havolasi mavjud emas', 'info');
      return;
    }
    setIsEditAnalyzing(true);
    try {
      const res = await analyzeBookWithAI({
        googleDriveUrl: editingBook.googleDriveUrl || editingBook.pdfUrl,
        titleHint: editingBook.title,
        categories
      });
      if (res.success && res.analysis) {
        const a = res.analysis;
        setEditingBook(prev => prev ? ({
          ...prev,
          title: a.title || prev.title,
          authorName: a.authorName || prev.authorName,
          categoryId: a.categoryId || prev.categoryId,
          categoryName: a.categoryName || prev.categoryName,
          subcategoryId: a.subcategoryId || prev.subcategoryId,
          subcategoryName: a.subcategoryName || prev.subcategoryName,
          language: a.language || prev.language,
          pages: a.pages || prev.pages,
          publicationYear: a.publicationYear || prev.publicationYear,
          description: a.description || prev.description,
        }) : null);
        showToast(`«${a.title}» maʼlumotlari AI orqali qayta yangilandi!`, 'success');
      } else {
        showToast(res.error || 'Qayta tahlil qilib bo‘lmadi', 'error');
      }
    } catch {
      showToast('Tahlilda xatolik yuz berdi', 'error');
    } finally {
      setIsEditAnalyzing(false);
    }
  };

  // Live parsed Google Drive info for Add Book Form
  const driveInfo: GoogleDriveParsedInfo = useMemo(() => {
    return parseGoogleDriveUrl(formData.googleDriveUrl);
  }, [formData.googleDriveUrl]);

  // Live parsed Google Drive info for Edit Book Form
  const editDriveInfo: GoogleDriveParsedInfo = useMemo(() => {
    return parseGoogleDriveUrl(editingBook?.googleDriveUrl || editingBook?.pdfUrl || '');
  }, [editingBook?.googleDriveUrl, editingBook?.pdfUrl]);

  // Live auto-generated 1st page cover for Add Book Form
  const autoCoverPreview = useMemo(() => {
    if (driveInfo.isDrive && driveInfo.thumbnailUrl) {
      return driveInfo.thumbnailUrl;
    }
    const targetCat = categories.find(c => c.id === formData.categoryId);
    return generateFirstPageBookCover(
      formData.title || 'Kitob nomi',
      formData.authorName || 'Muallif',
      targetCat?.name || 'Badiiy adabiyot',
      formData.publicationYear || 2024
    );
  }, [driveInfo.isDrive, driveInfo.thumbnailUrl, formData.title, formData.authorName, formData.categoryId, formData.publicationYear, categories]);

  // High-level statistics
  const totalBooks = books.length;
  const driveConnectedBooks = books.filter(b => !!b.googleDriveUrl || (b.pdfUrl && b.pdfUrl.includes('drive.google.com'))).length;
  const audioBooksCount = books.filter(b => b.hasAudio || !!b.audioUrl).length;
  const totalViews = books.reduce((acc, b) => acc + (b.views || 0), 0);
  const totalDownloads = books.reduce((acc, b) => acc + (b.downloads || 0), 0) + Math.round(totalViews * 0.4);
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0);

  // Filtered & Sorted books for table / grid
  const filteredAndSortedBooks = useMemo(() => {
    const list = books.filter(b => {
      const q = searchTableQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.subcategoryName && b.subcategoryName.toLowerCase().includes(q));

      const matchesCat = filterCategory === 'all' || b.categoryId === filterCategory;
      const matchesLang = filterLanguage === 'all' || b.language === filterLanguage;

      const isDrive = !!b.googleDriveUrl || (b.pdfUrl && b.pdfUrl.includes('drive.google.com'));
      const matchesDrive = 
        filterDriveOnly === 'all' ? true :
        filterDriveOnly === 'drive' ? isDrive : !isDrive;

      const isAudio = Boolean(b.hasAudio || b.audioUrl || (b.format && b.format.includes('AUDIO')));
      const matchesAudio = 
        filterAudioOnly === 'all' ? true :
        filterAudioOnly === 'audio' ? isAudio : !isAudio;

      return matchesSearch && matchesCat && matchesLang && matchesDrive && matchesAudio;
    });

    return list.sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'pages') return (b.pages || 0) - (a.pages || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // default: newest
      return (b.publicationYear || 0) - (a.publicationYear || 0);
    });
  }, [books, searchTableQuery, filterCategory, filterLanguage, filterDriveOnly, filterAudioOnly, sortBy]);

  // Top books by views
  const topReadBooks = useMemo(() => {
    return [...books].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [books]);

  // Handle Add Book Submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.authorName.trim() || !formData.description.trim()) {
      showToast('Iltimos, barcha majburiy maydonlarni to‘ldiring', 'error');
      return;
    }

    const targetCategory = categories.find(c => c.id === formData.categoryId) || categories[0];
    const matchedAuthor = authors.find(a => a.name.toLowerCase() === formData.authorName.toLowerCase());
    const chosenSub = targetCategory?.subcategories?.find(s => s.id === formData.subcategoryId);

    const newBookPayload: Partial<Book> = {
      title: formData.title.trim(),
      authorId: matchedAuthor ? matchedAuthor.id : 'auth-custom',
      authorName: formData.authorName.trim(),
      categoryId: targetCategory.id,
      categoryName: targetCategory.name,
      subcategoryId: chosenSub ? chosenSub.id : undefined,
      subcategoryName: chosenSub ? chosenSub.name : undefined,
      description: formData.description.trim(),
      coverUrl: autoCoverPreview,
      pages: Number(formData.pages) || 200,
      publicationYear: Number(formData.publicationYear) || 2024,
      language: formData.language,
      googleDriveUrl: formData.googleDriveUrl.trim() || undefined,
      pdfUrl: driveInfo.isDrive ? driveInfo.previewUrl : (formData.pdfUrl || '#'),
      fileSize: '7.2 MB',
      hasAudio: formData.hasAudio,
      audioDuration: formData.hasAudio ? formData.audioDuration : undefined,
    };

    addBook(newBookPayload);
    showToast(`«${formData.title}» kitobi muvaffaqiyatli nashr qilindi!`, 'success');

    // Reset form
    setFormData({
      title: '',
      authorName: '',
      categoryId: categories[0]?.id || 'cat-1',
      subcategoryId: '',
      language: 'O‘zbekcha',
      pages: 250,
      publicationYear: 2024,
      coverUrl: '',
      description: '',
      googleDriveUrl: '',
      pdfUrl: '',
      hasAudio: false,
      audioDuration: '3 soat 45 daqiqa'
    });

    setActiveAdminTab('books');
  };

  // Handle Book Update Submit
  const handleUpdateBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    const targetCat = categories.find(c => c.id === editingBook.categoryId);
    const chosenSub = targetCat?.subcategories?.find(s => s.id === editingBook.subcategoryId);

    updateBook(editingBook.id, {
      ...editingBook,
      categoryName: targetCat ? targetCat.name : editingBook.categoryName,
      subcategoryId: chosenSub ? chosenSub.id : undefined,
      subcategoryName: chosenSub ? chosenSub.name : undefined,
      googleDriveUrl: editingBook.googleDriveUrl?.trim() || undefined,
      pdfUrl: editDriveInfo.isDrive ? editDriveInfo.previewUrl : editingBook.pdfUrl
    });

    showToast(`«${editingBook.title}» ma’lumotlari yangilandi!`, 'success');
    setEditingBook(null);
  };

  // SubCategory Modal Handlers
  const handleOpenSubCategoryModal = (cat: Category, subIdToEdit?: string) => {
    setSubCategoryParentCategory(cat);
    if (subIdToEdit) {
      const targetSub = cat.subcategories?.find(s => s.id === subIdToEdit);
      setEditingSubCategoryId(subIdToEdit);
      setSubCategoryNameInput(targetSub?.name || '');
      setSubCategoryDescInput(targetSub?.description || '');
    } else {
      setEditingSubCategoryId(null);
      setSubCategoryNameInput('');
      setSubCategoryDescInput('');
    }
    setIsSubCategoryModalOpen(true);
  };

  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategoryParentCategory || !subCategoryNameInput.trim()) return;

    if (editingSubCategoryId) {
      updateSubCategory(
        subCategoryParentCategory.id, 
        editingSubCategoryId, 
        subCategoryNameInput.trim(), 
        subCategoryDescInput.trim() || undefined
      );
      showToast('Ichki bo‘lim muvaffaqiyatli tahrirlandi!', 'success');
    } else {
      addSubCategory(
        subCategoryParentCategory.id, 
        subCategoryNameInput.trim(), 
        subCategoryDescInput.trim() || undefined
      );
      showToast('Yangi sinf/bo‘lim qo‘shildi!', 'success');
    }

    setIsSubCategoryModalOpen(false);
  };

  // Handle Category Modal Open
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        name: cat.name,
        slug: cat.slug,
        iconName: cat.iconName || 'BookOpen',
        color: cat.color || '#F59E0B',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        slug: '',
        iconName: 'BookOpen',
        color: '#F59E0B',
        description: ''
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Handle Category Submit
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Iltimos, bo‘lim nomini kiriting', 'error');
      return;
    }

    const slug = categoryFormData.slug.trim() || categoryFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryFormData.name,
        slug,
        iconName: categoryFormData.iconName,
        color: categoryFormData.color,
        description: categoryFormData.description
      });
      showToast('Bo‘lim ma’lumotlari yangilandi!', 'success');
    } else {
      addCategory({
        name: categoryFormData.name,
        slug,
        iconName: categoryFormData.iconName,
        color: categoryFormData.color,
        description: categoryFormData.description
      });
      showToast('Yangi bo‘lim va unga xos sahifa yaratildi!', 'success');
    }

    setIsCategoryModalOpen(false);
  };

  // 1. UNPROTECTED LOGIN SCREEN (Cyber Luxury Aesthetic)
  if (!isAdmin) {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminPasswordInput.trim()) {
        setPasswordError('Iltimos, administrator parolini kiriting!');
        return;
      }
      const ok = loginAsAdmin(adminPasswordInput);
      if (!ok) {
        setPasswordError('Parol noto‘g‘ri! Faqat rasmiy administrator kirishi mumkin.');
      } else {
        setPasswordError('');
        setAdminPasswordInput('');
      }
    };

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Subtle Luxury Atmospheric Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#140E0A]/95 border border-amber-500/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-7 text-center relative overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="relative inline-block mx-auto">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <Lock className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500 text-stone-950 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Himoyalangan Boshqaruv Markazi</span>
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                Signal Books Admin
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                Kutubxona katalogi, Google Drive integratsiyasi va barcha bo‘limlarni boshqarish markazi.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Administrator Maxfiy Paroli</span>
                  <span className="text-[11px] text-amber-400/80 font-mono">Boshqaruv kaliti</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    autoFocus
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Maxfiy parolni kiriting..."
                    className="w-full bg-[#1C140E] border border-amber-900/80 focus:border-amber-500 rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-400 transition-colors p-1"
                    title={showLoginPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs sm:text-sm font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-stone-950" />
                  <span>Boshqaruvga kirish</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-stone-900/40 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
                >
                  Kutubxona bosh sahifasiga qaytish
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-amber-950/80 space-y-2 text-[11px] text-stone-400">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-stone-500">Bosh admin pochtasi:</span>
                <span className="text-amber-300 font-mono font-semibold">muxiddin980001@gmail.com</span>
              </div>
              <div className="text-stone-500 font-mono text-[10px]">
                Tezkor havola: <span className="text-amber-400">#admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const copyAdminLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#admin`;
    navigator.clipboard?.writeText(link);
    showToast('Admin panel havolasi nusxalandi (#admin)! 📋', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* 2. TOP MODERN COMMAND HEADER */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1A120B] via-[#140E0A] to-[#0E0A07] border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Brand & System Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Signal Books • Admin Console</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase Cloud DB Faol</span>
              </div>

              <span className="text-xs text-stone-400 font-mono bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800">
                muxiddin980001@gmail.com
              </span>
            </div>

            <div>
              <h1 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-100 tracking-tight flex items-center gap-3">
                <span>Kutubxona Boshqaruv Markazi</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
                Google Drive PDF bazasi, dinamik sahifali bo‘limlar, sinflar va audio kitoblarni to‘liq nazorat qilish markazi.
              </p>
            </div>
          </div>

          {/* Quick Utility Launchers */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={() => setActivePage('home')}
              title="Kutubxona tashqi ko‘rinishiga o‘tish"
              className="px-3.5 py-2.5 rounded-2xl bg-[#1F1610] hover:bg-[#2A1E16] text-stone-300 hover:text-white border border-amber-900/60 hover:border-amber-500/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-md active:scale-95"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Kutubxonani ko‘rish</span>
            </button>

            <button
              onClick={copyAdminLink}
              title="Admin panel havolasini nusxalash"
              className="p-2.5 rounded-2xl bg-[#1F1610] hover:bg-[#2A1E16] text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Havola (#admin)</span>
            </button>

            <button
              onClick={logoutAdmin}
              title="Administrator rejimidan chiqish"
              className="px-3 py-2.5 rounded-2xl bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-900/50 transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>

        {/* MODERN SEGMENTED TAB NAVIGATOR */}
        <div className="mt-6 pt-6 border-t border-amber-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#120D08]/90 border border-amber-950/90 gap-1.5 shadow-inner backdrop-blur-xl">
            <button
              onClick={() => setActiveAdminTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeAdminTab === 'stats' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistika & Tahlil</span>
            </button>
            
            <button
              onClick={() => setActiveAdminTab('books')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeAdminTab === 'books' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <BookText className="w-4 h-4" />
              <span>Kitoblar</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeAdminTab === 'books' ? 'bg-stone-950/30 text-stone-950' : 'bg-stone-800 text-amber-400'
              }`}>
                {books.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeAdminTab === 'categories' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Bo‘limlar & Sahifalar</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeAdminTab === 'categories' ? 'bg-stone-950/30 text-stone-950' : 'bg-stone-800 text-amber-400'
              }`}>
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('add')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'add' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Kitob (PDF)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('add-audio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'add-audio' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-md shadow-orange-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <Headphones className="w-4 h-4 text-orange-400" />
              <span>Audio Kitob Yuklash</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeAdminTab === 'add-audio' ? 'bg-stone-950/40 text-stone-950' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
              }`}>
                Yangi 🎧
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('ai-knowledge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'ai-knowledge' 
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/30' 
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Bilim Bazasi & RAG</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeAdminTab === 'ai-knowledge' ? 'bg-stone-950/40 text-stone-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                AI 🤖
              </span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Signal Books 2026 Admin Pro Engine</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. STATS & ANALYTICS OVERVIEW VIEW */}
      {/* ============================================================== */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Total Books */}
            <div className="group p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Kutubxona Katalogi</span>
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <BookText className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-stone-100 font-serif-title tracking-tight">
                  {totalBooks}
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    100% to‘liq
                  </span>
                  <span>• {audioBooksCount} ta audio kitob</span>
                </div>
              </div>
            </div>

            {/* 2. Google Drive Storage */}
            <div className="group p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400/80">Google Drive Bazasi</span>
                <div className="p-2.5 rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30 group-hover:scale-110 transition-transform">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-amber-400 font-serif-title tracking-tight">
                  {driveConnectedBooks}
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bulutli havola
                  </span>
                  <span>• Tezkor ochilish</span>
                </div>
              </div>
            </div>

            {/* 3. Categories & Classes */}
            <div className="group p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/20 transition-colors" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80">Bo‘limlar & Sahifalar</span>
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-stone-100 font-serif-title tracking-tight">
                  {totalCategories}
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span className="text-amber-400 font-semibold">{totalSubcategories} ta ichki sinf</span>
                  <span>• Alohida sahifalar</span>
                </div>
              </div>
            </div>

            {/* 4. Total Reads & Downloads */}
            <div className="group p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">Kitobxonlar Faolligi</span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-stone-100 font-serif-title tracking-tight">
                  {(totalViews + totalDownloads).toLocaleString()}
                </div>
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span className="text-amber-400 font-semibold">{totalDownloads.toLocaleString()} ta yuklash</span>
                  <span>• {totalViews.toLocaleString()} mutolaa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Bento Grid: Distribution + Leaderboard + Quick Launcher */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Category Distribution Progress Bars (2 cols on large screen) */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Bo‘limlar Kesimida Kitoblar Taqsimoti</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Har bir bo‘limning umumiy fonddagi ulushi va kitoblar soni
                  </p>
                </div>
                <button
                  onClick={() => setActiveAdminTab('categories')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Barchasini boshqarish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5 pt-2">
                {categories.map(cat => {
                  const count = books.filter(b => b.categoryId === cat.id || b.categoryName === cat.name).length;
                  const percentage = totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0;
                  const IconComp = CATEGORY_ICONS[cat.iconName] || BookOpen;

                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-950 font-bold shrink-0 text-[10px]"
                            style={{ backgroundColor: cat.color || '#F59E0B' }}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-stone-200 truncate">{cat.name}</span>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                              ({cat.subcategories.length} sinf)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-stone-400 font-mono text-[11px]">{count} ta</span>
                          <span className="text-amber-400 font-mono font-bold text-xs w-9 text-right">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden border border-amber-950/60">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: cat.color || '#F59E0B'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Leaderboard: Top Read Books */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-base font-bold text-stone-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <span>Eng Ko‘p O‘qilgan Kitoblar</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    TOP 5
                  </span>
                </div>

                <div className="space-y-3">
                  {topReadBooks.map((book, idx) => (
                    <div 
                      key={book.id}
                      onClick={() => openBookDetails(book)}
                      className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[#1C140E]/80 hover:bg-[#251A12] border border-amber-950/80 hover:border-amber-500/40 transition-all cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <img 
                        src={book.coverUrl || undefined} 
                        alt={book.title}
                        className="w-9 h-12 rounded-lg object-cover border border-amber-950 shrink-0 shadow-sm"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {book.authorName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-amber-400">
                          {book.views || 0}
                        </div>
                        <div className="text-[10px] text-stone-500">mutolaa</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="pt-4 border-t border-amber-950/80">
                <button
                  onClick={() => setActiveAdminTab('add')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Katalogga Yangi Kitob Qo‘shish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BOOKS LIST & MANAGEMENT VIEW (TABLE & GRID MODES) */}
      {/* ============================================================== */}
      {activeAdminTab === 'books' && (
        <div className="space-y-6 animate-fade-in">
          {/* Creative Command & Filter Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80 pointer-events-none" />
                <input
                  type="text"
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  placeholder="Kitob nomi, muallif, bo‘lim yoki sinf bo‘yicha izlash..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-all"
                />
                {searchTableQuery && (
                  <button
                    onClick={() => setSearchTableQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher & Add New Button */}
              <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
                <div className="flex items-center bg-[#1C140E] p-1 rounded-2xl border border-amber-950/80">
                  <button
                    onClick={() => setBooksViewMode('table')}
                    className={`p-2 rounded-xl transition-colors ${
                      booksViewMode === 'table' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Jadval ko‘rinishi"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setBooksViewMode('grid')}
                    className={`p-2 rounded-xl transition-colors ${
                      booksViewMode === 'grid' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Karta (Grid) ko‘rinishi"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveAdminTab('add')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/25 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Kitob (PDF)</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('add-audio')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md shadow-orange-500/25 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-stone-950" />
                  <span>+ Audio kitob</span>
                </button>
              </div>
            </div>

            {/* Filter Pills / Dropdowns Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-950/60">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mr-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Filtr:</span>
              </div>

              {/* Format Filter (Audio vs PDF) */}
              <select
                value={filterAudioOnly}
                onChange={(e) => setFilterAudioOnly(e.target.value as any)}
                className="bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none"
              >
                <option value="all">Barcha formatlar (PDF & Audio)</option>
                <option value="audio">🎧 Faqat Audio kitoblar ({audioBooksCount})</option>
                <option value="pdf">📄 Faqat PDF kitoblar ({totalBooks - audioBooksCount})</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
              >
                <option value="all">Barcha bo‘limlar ({books.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
              >
                <option value="all">Barcha tillar</option>
                <option value="O‘zbekcha">O‘zbekcha</option>
                <option value="Inglizcha">Inglizcha</option>
                <option value="Ruscha">Ruscha</option>
                <option value="Qoraqalpoqcha">Qoraqalpoqcha</option>
              </select>

              {/* Google Drive Status Filter */}
              <select
                value={filterDriveOnly}
                onChange={(e) => setFilterDriveOnly(e.target.value as 'all' | 'drive' | 'direct')}
                className="bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none"
              >
                <option value="all">Barcha fayl turlari</option>
                <option value="drive">Faqat Google Drive PDF ({driveConnectedBooks})</option>
                <option value="direct">Standart fayllar</option>
              </select>

              {/* Sort selector */}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] text-stone-500 hidden sm:inline">Tartiblash:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none"
                >
                  <option value="newest">Yangi qo‘shilganlar</option>
                  <option value="views">Eng ko‘p o‘qilgan</option>
                  <option value="pages">Sahifalar soni bo‘yicha</option>
                  <option value="title">Alifbo bo‘yicha (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results counter */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span>
                Jami <strong className="text-amber-400 font-mono">{books.length}</strong> ta kitobdan <strong className="text-stone-200 font-mono">{filteredAndSortedBooks.length}</strong> tasi ko‘rsatilmoqda
              </span>
              {(filterCategory !== 'all' || filterLanguage !== 'all' || filterDriveOnly !== 'all' || searchTableQuery) && (
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterLanguage('all');
                    setFilterDriveOnly('all');
                    setSearchTableQuery('');
                  }}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Filtrni tozalash
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE A: TABLE VIEW */}
          {booksViewMode === 'table' && (
            <div className="rounded-3xl border border-amber-950/80 bg-[#150F0A]/95 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-amber-950/90 bg-[#1B130D] text-amber-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6">Kitob & Muallif</th>
                      <th className="py-4 px-4">Bo‘lim & Sinf</th>
                      <th className="py-4 px-4">Google Drive / Fayl</th>
                      <th className="py-4 px-4">Parametrlar</th>
                      <th className="py-4 px-4 text-center">Mutolaa</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-950/60">
                    {filteredAndSortedBooks.map(book => {
                      const hasDrive = !!book.googleDriveUrl || (book.pdfUrl && book.pdfUrl.includes('drive.google.com'));
                      const parsed = parseGoogleDriveUrl(book.googleDriveUrl || book.pdfUrl);

                      return (
                        <tr key={book.id} className="hover:bg-[#1C140E]/80 transition-colors group">
                          {/* Book & Author */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={book.coverUrl || undefined}
                                alt={book.title}
                                className="w-11 h-15 rounded-xl object-cover shadow-md border border-amber-950/80 shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <button
                                  onClick={() => openBookDetails(book)}
                                  className="font-bold text-stone-100 hover:text-amber-400 text-left line-clamp-1 transition-colors text-xs sm:text-sm"
                                >
                                  {book.title}
                                </button>
                                <div className="text-[11px] text-stone-400 mt-0.5">
                                  {book.authorName}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono mt-1">
                                  <span>{book.publicationYear} yil</span>
                                  <span>•</span>
                                  <span>{book.language}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#120B07] border border-amber-900/50 text-[10px] font-mono text-amber-300 font-semibold" title="Kitob unikal ID-si">
                                    <span className="text-stone-500">ID:</span>
                                    <span>{book.id}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(book.id);
                                      showToast(`Kitob ID nusxalandi: ${book.id}`, 'info');
                                    }}
                                    className="p-1 text-stone-500 hover:text-amber-300 rounded hover:bg-amber-500/10 transition-colors"
                                    title="Kitob ID-sini nusxalash"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category & Subcategory */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                {book.categoryName}
                              </span>
                              {book.subcategoryName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                  <span>{book.subcategoryName}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Google Drive Status Link */}
                          <td className="py-3.5 px-4">
                            {hasDrive && parsed.isDrive ? (
                              <button
                                type="button"
                                onClick={() => startReading(book)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="Kitobni sayt ichida ko‘rish"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Drive faol</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900/80 text-stone-400 border border-stone-800 text-[11px]">
                                <span>Standart PDF</span>
                              </span>
                            )}
                          </td>

                          {/* Parameters: Pages, Audio */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="text-stone-300 font-mono text-[11px]">
                                {book.pages} sahifa
                              </div>
                              {book.hasAudio && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                  <Headphones className="w-3 h-3" />
                                  <span>Audio</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Reading Count */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shadow-sm">
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>{(book.views || 0).toLocaleString()} marta</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startReading(book)}
                                title="Kitobni o‘qish"
                                className="p-2 rounded-xl bg-[#1F1610] hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 transition-colors border border-amber-950/80"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setEditingBook(book)}
                                title="Tahrirlash"
                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 transition-colors border border-amber-500/30"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setBookToDelete(book)}
                                title="O‘chirish"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors border border-rose-500/30 active:scale-95"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredAndSortedBooks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-stone-400 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-stone-300">
                            Hech qanday kitob topilmadi
                          </p>
                          <p className="text-xs text-stone-500 max-w-sm mx-auto">
                            Qidiruv so‘zini o‘zgartirib ko‘ring yoki yangi kitob qo‘shing.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE B: CREATIVE GRID CARDS VIEW */}
          {booksViewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredAndSortedBooks.map(book => {
                const hasDrive = !!book.googleDriveUrl || (book.pdfUrl && book.pdfUrl.includes('drive.google.com'));

                return (
                  <div
                    key={book.id}
                    className="group rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 p-4 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      {/* Cover & Badges */}
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-900 border border-amber-950 shadow-inner">
                        <img 
                          src={book.coverUrl || undefined} 
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80" />

                        {/* Top floating badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#140E0A]/90 text-amber-300 border border-amber-500/40 backdrop-blur-md truncate max-w-[120px]">
                            {book.categoryName}
                          </span>

                          {hasDrive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-stone-950 backdrop-blur-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Drive
                            </span>
                          )}
                        </div>

                        {/* Bottom overlay info */}
                        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] text-stone-300 font-mono">
                          <span>{book.pages} bet</span>
                          <span>{book.views || 0} o‘qildi</span>
                        </div>
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h3 
                          onClick={() => openBookDetails(book)}
                          className="font-serif-title text-sm font-bold text-stone-100 hover:text-amber-400 line-clamp-1 cursor-pointer transition-colors"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          {book.authorName}
                        </p>
                        <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-amber-950/60 text-[10px] font-mono">
                          <span className="text-stone-500 truncate" title={book.id}>
                            ID: <span className="text-amber-300 font-semibold">{book.id}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(book.id);
                              showToast(`Kitob ID nusxalandi: ${book.id}`, 'info');
                            }}
                            className="text-stone-500 hover:text-amber-300 p-0.5 transition-colors shrink-0"
                            title="ID dan nusxa olish"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        {book.subcategoryName && (
                          <div className="mt-1.5">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              📌 {book.subcategoryName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Deck */}
                    <div className="pt-3 border-t border-amber-950/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => startReading(book)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Mutolaa</span>
                      </button>

                      <button
                        onClick={() => setEditingBook(book)}
                        title="Tahrirlash"
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setBookToDelete(book)}
                        title="O‘chirish"
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CATEGORIES & DYNAMIC PAGES MANAGEMENT VIEW */}
      {/* ============================================================== */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#150F0A]/95 border border-amber-950/80 p-6 rounded-3xl shadow-xl">
            <div>
              <h2 className="font-serif-title text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Bo‘limlar va Ularning Dinamik Sahifalari</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1 max-w-xl">
                Yangi bo‘lim yoki darslik sinfi ochganingizda, saytda unga mos to‘laqonli shaxsiy sahifa va filtrlar avtomatik tarzda yaratiladi.
              </p>
            </div>

            <button
              onClick={() => handleOpenCategoryModal()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25 self-start sm:self-auto active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Yangi bo‘lim (sahifa) ochish</span>
            </button>
          </div>

          {/* Categories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(cat => {
              const IconComponent = CATEGORY_ICONS[cat.iconName] || BookOpen;
              const count = books.filter(b => b.categoryId === cat.id || b.categoryName === cat.name).length;

              return (
                <div 
                  key={cat.id}
                  className="group p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Header: Icon, slug, edit/delete */}
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-13 h-13 rounded-2xl flex items-center justify-center border shadow-md"
                        style={{ 
                          backgroundColor: `${cat.color || '#F59E0B'}20`, 
                          borderColor: `${cat.color || '#F59E0B'}60`,
                          color: cat.color || '#F59E0B'
                        }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          title="Tahrirlash"
                          className="p-2 rounded-xl bg-[#1E1610] hover:bg-[#281D15] text-stone-300 hover:text-white transition-colors border border-amber-950/80"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          title="O‘chirish"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors border border-rose-500/30 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100">{cat.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1610] text-amber-400/80 border border-amber-950/80">
                          #{cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || 'Bo‘limga tegishli adabiyotlar va to‘liq PDF mutolaa resurslari.'}
                      </p>
                    </div>

                    {/* Subcategories (Sinflar yoki ichki bo'limlar) */}
                    <div className="pt-3.5 border-t border-amber-950/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{cat.id === 'cat-2' ? 'Maktab Sinflari' : 'Ichki bo‘limlar'} ({cat.subcategories?.length || 0})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenSubCategoryModal(cat)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Qo‘shish</span>
                        </button>
                      </div>

                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                          {cat.subcategories.map(sub => {
                            const subBookCount = books.filter(b => 
                              (b.categoryId === cat.id || b.categoryName === cat.name) && 
                              (b.subcategoryId === sub.id || b.subcategoryName === sub.name)
                            ).length;

                            return (
                              <div
                                key={sub.id}
                                className="group/sub inline-flex items-center gap-1.5 bg-[#1C140E] border border-amber-950/90 hover:border-amber-500/40 rounded-xl px-2.5 py-1 text-[11px] text-stone-300 transition-colors shadow-sm"
                              >
                                <span 
                                  onClick={() => openCategoryPage(cat, sub.id)}
                                  className="cursor-pointer hover:text-amber-300 font-medium"
                                  title="Ushbu sinf/bo‘lim kitoblarini ko‘rish"
                                >
                                  {sub.name}
                                </span>
                                <span className="text-[9px] font-mono text-stone-400 bg-stone-900/90 px-1.5 py-0.2 rounded-full">
                                  {subBookCount}
                                </span>
                                <div className="flex items-center gap-1 ml-1 opacity-60 group-hover/sub:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSubCategoryModal(cat, sub.id)}
                                    title="Tahrirlash"
                                    className="text-stone-400 hover:text-amber-400 p-0.5"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteSubCategory(cat.id, sub.id)}
                                    title="O‘chirish"
                                    className="text-stone-400 hover:text-rose-400 p-0.5"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500 italic">
                          Hali sinf yoki ichki bo‘lim qo‘shilmagan
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom footer: Book counter & open page button */}
                  <div className="pt-3.5 border-t border-amber-950/80 flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-300">
                      <strong className="text-amber-400 font-mono">{count}</strong> ta kitob
                    </div>

                    <button
                      onClick={() => openCategoryPage(cat)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-stone-950 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-400 transition-all border border-amber-500/30"
                    >
                      <span>Sahifasiga o‘tish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. ADD NEW BOOK (GOOGLE DRIVE INTEGRATION & LIVE MOCKUP) */}
      {/* ============================================================== */}
      {activeAdminTab === 'add' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: THE FORM (8 Cols on LG) */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 space-y-6 shadow-2xl">
              <div>
                <h2 className="font-serif-title text-xl font-bold text-stone-100 flex items-center gap-2.5">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>Yangi Kitob Nashr Qilish (Google Drive PDF)</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Google Drive havolasini kiriting. Tizim avtomatik ravishda PDF identifikatorini oladi va 1-sahifani kitob muqovasi sifatida tayyorlaydi.
                </p>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                {/* 1. GOOGLE DRIVE PRO LINK SECTION */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-orange-950/15 to-[#120D08] border border-amber-500/40 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <label className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                        Google Drive PDF Havolasi (Link)
                      </label>
                    </div>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Asosiy baza
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={formData.googleDriveUrl}
                      onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/1X-example-link/view?usp=sharing"
                      className="w-full bg-[#1C140E] border border-amber-500/50 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                    />
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    💡 <span className="text-amber-400 font-semibold">Tavsiya:</span> Google Drive fayl sozlamasida kirish huquqini «Havolaga ega barcha foydalanuvchilar» (<span className="text-stone-300">Anyone with the link</span>) deb belgilang, shunda kitob to‘siqsiz ochiladi va yuklab olinadi.
                  </p>

                  {/* Live Drive Link Validation Badge */}
                  {formData.googleDriveUrl && (
                    <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                      driveInfo.isDrive 
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}>
                      {driveInfo.isDrive ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <div className="font-semibold text-emerald-300">
                              Google Drive fayl identifikatori tasdiqlandi: <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{driveInfo.fileId}</span>
                            </div>
                            <div className="text-[11px] text-emerald-400/90">
                              PDF Reader va yuklab olish moduli avtomatik tarzda bog‘landi.
                            </div>
                            <div className="pt-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Havola muvaffaqiyatli bog‘landi (Sayt ichida ochiladi)</span>
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            Ushbu havola Google Drive standart formatiga o‘xshamaydi. Shunda ham to‘g‘ridan-to‘g‘ri PDF manzili sifatida saqlanadi.
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* AI BOOK ANALYSIS & INSPECTOR CARD (GEMINI 3.8 FLASH) */}
                <AiBookAnalysisCard
                  googleDriveUrl={formData.googleDriveUrl}
                  categories={categories}
                  onApplyAnalysis={handleApplyAiAnalysis}
                  showToast={showToast}
                  currentTitle={formData.title}
                />

                {/* 2. UNIQUE BOOK ID SECTION */}
                <div className="p-4 rounded-2xl bg-[#1C140E] border border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs shrink-0">
                      #ID
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-200">Unikal Kitob Identifikatori (ID)</div>
                      <div className="text-[11px] text-stone-400">
                        Har bir kitob yuklanganda individual ID biriktiriladi va ko‘rishlar soni Firestore bazasida aniq hisoblanadi.
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold self-start sm:self-auto">
                    <span>Avtomatik biriktiriladi</span>
                  </div>
                </div>

                {/* 3. BOOK METADATA GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-300">
                      Kitob nomi <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masalan: O‘tkan kunlar"
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Muallif <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="Masalan: Abdulla Qodiriy"
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Bo‘lim (Kategoriya sahifasi) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        setFormData({ 
                          ...formData, 
                          categoryId: newCatId,
                          subcategoryId: '' 
                        });
                      }}
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory / Class Selector */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-300">
                        Ichki bo‘lim yoki Sinf <span className="text-stone-500 font-normal">(ixtiyoriy)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const curCat = categories.find(c => c.id === formData.categoryId);
                          if (curCat) handleOpenSubCategoryModal(curCat);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Yangi sinf/bo‘lim ochish</span>
                      </button>
                    </div>

                    <select
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none"
                    >
                      <option value="">— Belgilanmagan (Asosiy umumiy) —</option>
                      {categories.find(c => c.id === formData.categoryId)?.subcategories?.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    {/* Quick Selection Pills */}
                    {categories.find(c => c.id === formData.categoryId)?.subcategories && (categories.find(c => c.id === formData.categoryId)!.subcategories?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, subcategoryId: '' })}
                          className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                            !formData.subcategoryId
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-[#1C140E] text-stone-400 hover:text-stone-200 border border-amber-950/80'
                          }`}
                        >
                          Umumiy
                        </button>
                        {categories.find(c => c.id === formData.categoryId)?.subcategories?.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, subcategoryId: s.id })}
                            className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                              formData.subcategoryId === s.id
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-sm'
                                : 'bg-[#1C140E] text-stone-300 hover:text-amber-300 border border-amber-950/80'
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Asar tili
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as BookLanguage })}
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none"
                    >
                      <option value="O‘zbekcha">O‘zbekcha</option>
                      <option value="Inglizcha">Inglizcha</option>
                      <option value="Ruscha">Ruscha</option>
                      <option value="Qoraqalpoqcha">Qoraqalpoqcha</option>
                      <option value="Arabcha">Arabcha</option>
                    </select>
                  </div>

                  {/* Pages */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Sahifalar soni
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none"
                    />
                  </div>

                  {/* Publication Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Nashr yili
                    </label>
                    <input
                      type="number"
                      value={formData.publicationYear}
                      onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none"
                    />
                  </div>

                  {/* Audio Book Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">
                      Audio kitob formati
                    </label>
                    <div className="p-2.5 rounded-xl bg-[#1C140E] border border-amber-950/90 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-stone-200">Audio pleyer mavjud</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.hasAudio}
                        onChange={(e) => setFormData({ ...formData, hasAudio: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-300">
                      Kitob haqida qisqacha tavsif <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Asarning mazmuni, o‘quvchiga foydasi haqida..."
                      className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-950/80">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('books')}
                    className="px-5 py-2.5 rounded-xl bg-[#1C140E] hover:bg-[#281D15] text-stone-300 text-xs font-semibold transition-colors border border-amber-950/80"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kitobni Saqlash & Nashr Qilish</span>
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE LIVE MOCKUP (4 Cols on LG) */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 shadow-2xl space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-stone-200">Jonli Ko‘rinish (Live Preview)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Avto-muqova
                </span>
              </div>

              {/* Realistic Card Preview */}
              <div className="p-4 rounded-2xl bg-[#1C140E] border border-amber-500/30 space-y-3.5 shadow-xl">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-900 border border-amber-950 shadow-inner">
                  <img 
                    src={autoCoverPreview || undefined} 
                    alt="Titul 1-sahifa muqovasi"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] text-stone-300 font-mono">
                    <span>{formData.pages || 200} sahifa</span>
                    <span>{formData.publicationYear || 2024}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {categories.find(c => c.id === formData.categoryId)?.name || 'Bo‘lim'}
                    </span>
                    {formData.subcategoryId && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {categories.find(c => c.id === formData.categoryId)?.subcategories?.find(s => s.id === formData.subcategoryId)?.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-title text-sm font-bold text-stone-100 line-clamp-1">
                    {formData.title || 'Kitob nomi'}
                  </h3>
                  <p className="text-xs text-stone-400 truncate">
                    {formData.authorName || 'Muallif ismi'}
                  </p>
                </div>

                <div className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed italic bg-[#120D08] p-2.5 rounded-xl border border-amber-950/60">
                  {formData.description || 'Kitob haqida qisqacha tavsif bu yerda paydo bo‘ladi...'}
                </div>

                <div className="pt-2 border-t border-amber-950/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PDF Reader tayyor</span>
                  </span>
                  {formData.hasAudio && (
                    <span className="text-amber-400 flex items-center gap-1 font-medium">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Audio faol</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                Rasm yuklash talab etilmaydi — Google Drive yoki avtomatik 1-sahifa titul muqovasi tayyorlandi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6.1 DEDICATED AUDIO BOOK UPLOAD (OVOZLI KUTUBXONA STUDIYASI) */}
      {/* ============================================================== */}
      {activeAdminTab === 'add-audio' && (
        <AdminAudioBookUploadCard
          categories={categories}
          authors={authors}
          onAddAudioBook={(bookData) => {
            addBook(bookData);
            setActiveAdminTab('books');
          }}
          showToast={showToast}
          onCancel={() => setActiveAdminTab('books')}
        />
      )}

      {/* ============================================================== */}
      {/* 6.2 AI KNOWLEDGE BASE & RAG ANALYTICS PANEL */}
      {/* ============================================================== */}
      {activeAdminTab === 'ai-knowledge' && (
        <AdminAiKnowledgePanel />
      )}

      {/* ============================================================== */}
      {/* 7. EDIT BOOK MODAL */}
      {/* ============================================================== */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-[#140E0A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/80">
              <h3 className="font-serif-title text-lg font-bold text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Kitob ma’lumotlarini tahrirlash</span>
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="p-2 rounded-xl bg-[#1E1610] hover:bg-[#281D15] text-stone-400 hover:text-white border border-amber-950/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBookSubmit} className="space-y-4">
              {/* Google Drive Link */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <label className="text-xs font-bold text-stone-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Google Drive Havolasi</span>
                </label>
                <input
                  type="url"
                  value={editingBook.googleDriveUrl || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, googleDriveUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-[#1C140E] border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                />
                {editDriveInfo.isDrive && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Drive Fayl ID: {editDriveInfo.fileId}</span>
                    </span>
                    <button
                      type="button"
                      disabled={isEditAnalyzing}
                      onClick={handleReAnalyzeEditingBook}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isEditAnalyzing ? 'AI tahlil qilmoqda...' : 'AI orqali qayta tahlil qilish'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Sarlavha</label>
                  <input
                    type="text"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Muallif</label>
                  <input
                    type="text"
                    value={editingBook.authorName}
                    onChange={(e) => setEditingBook({ ...editingBook, authorName: e.target.value })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Bo‘lim</label>
                  <select
                    value={editingBook.categoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const cat = categories.find(c => c.id === newCatId);
                      setEditingBook({ 
                        ...editingBook, 
                        categoryId: newCatId, 
                        categoryName: cat?.name || editingBook.categoryName,
                        subcategoryId: undefined,
                        subcategoryName: undefined 
                      });
                    }}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Ichki bo‘lim / Sinf</label>
                  <select
                    value={editingBook.subcategoryId || ''}
                    onChange={(e) => {
                      const subId = e.target.value;
                      const cat = categories.find(c => c.id === editingBook.categoryId);
                      const sub = cat?.subcategories?.find(s => s.id === subId);
                      setEditingBook({
                        ...editingBook,
                        subcategoryId: subId || undefined,
                        subcategoryName: sub?.name || undefined
                      });
                    }}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— Belgilanmagan (Umumiy) —</option>
                    {categories.find(c => c.id === editingBook.categoryId)?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Sahifalar soni</label>
                  <input
                    type="number"
                    value={editingBook.pages}
                    onChange={(e) => setEditingBook({ ...editingBook, pages: Number(e.target.value) })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">Nashr yili</label>
                  <input
                    type="number"
                    value={editingBook.publicationYear}
                    onChange={(e) => setEditingBook({ ...editingBook, publicationYear: Number(e.target.value) })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Audio Book Settings in Edit Modal */}
              <div className="p-3.5 rounded-xl bg-[#18120C] border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4" />
                    <span>Audio Kitob Sozlamalari</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBook.hasAudio || false}
                      onChange={(e) => setEditingBook({ ...editingBook, hasAudio: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Audio mavjud</span>
                  </label>
                </div>

                {editingBook.hasAudio && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] text-stone-400">Audio URL yoki Drive havolasi</label>
                      <input
                        type="text"
                        value={editingBook.audioUrl || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, audioUrl: e.target.value })}
                        placeholder="/api/drive-audio?id=... yoki https://..."
                        className="w-full bg-[#110D09] border border-amber-900/40 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-stone-400">Suxandon</label>
                      <input
                        type="text"
                        value={editingBook.narrator || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, narrator: e.target.value })}
                        placeholder="Suxandon ismi"
                        className="w-full bg-[#110D09] border border-amber-900/40 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-300">Tavsif</label>
                <textarea
                  rows={3}
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-5 py-2 rounded-xl bg-[#1C140E] text-xs text-stone-300 hover:text-white border border-amber-950/80"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  O‘zgarishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. CATEGORY MODAL */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-[#140E0A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/80">
              <h3 className="font-serif-title text-lg font-bold text-stone-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>{editingCategory ? 'Bo‘limni tahrirlash' : 'Yangi bo‘lim va sahifa ochish'}</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl bg-[#1E1610] hover:bg-[#281D15] text-stone-400 hover:text-white border border-amber-950/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Bo‘lim nomi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setCategoryFormData({ 
                      ...categoryFormData, 
                      name, 
                      slug: editingCategory ? categoryFormData.slug : autoSlug 
                    });
                  }}
                  placeholder="Masalan: Tibbiyot va Salomatlik"
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  URL identifikatori (Slug)
                </label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="tibbiyot-salomatlik"
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Icon Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Belgi (Piktogramma)
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-[#1C140E] border border-amber-950/90 max-h-36 overflow-y-auto">
                  {Object.keys(CATEGORY_ICONS).map(iconKey => {
                    const IconComp = CATEGORY_ICONS[iconKey];
                    const isSelected = categoryFormData.iconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setCategoryFormData({ ...categoryFormData, iconName: iconKey })}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-md scale-105' 
                            : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
                        }`}
                        title={iconKey}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Bo‘lim aksent rangi
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {THEME_COLORS.map(c => {
                    const isSelected = categoryFormData.color === c.value;
                    return (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setCategoryFormData({ ...categoryFormData, color: c.value })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-125 ring-2 ring-amber-400 shadow-lg' : 'hover:scale-110 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Tavsif
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Ushbu bo‘limda jamlangan kitoblar haqida..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-300 hover:text-white border border-amber-950/80"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  {editingCategory ? 'Bo‘limni yangilash' : 'Bo‘lim va Sahifani yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. SUBCATEGORY (SINFLAR / ICHKI BO‘LIMLAR) MODAL */}
      {/* ============================================================== */}
      {isSubCategoryModalOpen && subCategoryParentCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md bg-[#140E0A] border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>
                  {editingSubCategoryId ? 'Ichki bo‘limni tahrirlash' : 'Yangi ichki bo‘lim / sinf qo‘shish'}
                </span>
              </h3>
              <button
                onClick={() => setIsSubCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#1E1610] hover:bg-[#281D15] text-stone-400 hover:text-white border border-amber-950/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C140E] border border-amber-950/80 text-xs text-stone-300 flex items-center gap-2">
              <span className="text-amber-400 font-semibold">Asosiy bo‘lim:</span>
              <span className="font-bold text-stone-100">{subCategoryParentCategory.name}</span>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Nomi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={subCategoryNameInput}
                  onChange={(e) => setSubCategoryNameInput(e.target.value)}
                  placeholder={subCategoryParentCategory.id === 'cat-2' ? 'Masalan: 10-sinf' : 'Masalan: Jahon tarixi'}
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Tavsif yoki qo‘shimcha ma’lumot <span className="text-stone-500 font-normal">(ixtiyoriy)</span>
                </label>
                <textarea
                  rows={2}
                  value={subCategoryDescInput}
                  onChange={(e) => setSubCategoryDescInput(e.target.value)}
                  placeholder="Ushbu sinf yoki bo‘limga oid ma’lumot..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setIsSubCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-300 hover:text-white border border-amber-950/80"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  {editingSubCategoryId ? 'O‘zgarishlarni saqlash' : 'Sinf / Bo‘limni qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. BOOK DELETION CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#140E0A] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-stone-100">Kitobni butunlay o‘chirish</h3>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              Haqiqatan ham «<span className="font-semibold text-white">{bookToDelete.title}</span>» kitobini o‘chirmoqchimisiz?
              <br />
              <span className="text-xs text-stone-400 mt-1 block">
                Ushbu kitob katalogdan va foydalanuvchilar qidiruvidan olib tashlanadi.
              </span>
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-950/80">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#1E1610] text-stone-300 text-xs font-semibold hover:bg-[#281D15] transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = bookToDelete.id;
                  setBookToDelete(null);
                  await deleteBook(id);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/30 active:scale-95"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
