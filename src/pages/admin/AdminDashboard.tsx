import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  BookOpen, 
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
  Divide,
  Globe,
  Microscope,
  Smile,
  Languages,
  Brain,
  Briefcase,
  Scale,
  Palette,
  HeartPulse,
  History,
  Music,
  Folder,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Lock,
  Key,
  ShieldCheck,
  LogOut,
  Link,
  Copy
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, Category, BookLanguage } from '../../types';
import { parseGoogleDriveUrl, GoogleDriveParsedInfo, generateFirstPageBookCover } from '../../utils/googleDrive';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  GraduationCap,
  Laptop,
  Divide,
  Globe,
  Microscope,
  Smile,
  Languages,
  Brain,
  Briefcase,
  Scale,
  Palette,
  HeartPulse,
  History,
  Compass,
  Music,
  Folder
};

const THEME_COLORS = [
  { name: 'Ko‘k (Electric Blue)', value: '#3B82F6' },
  { name: 'Moviy (Cyan)', value: '#06B6D4' },
  { name: 'Zumrad (Emerald)', value: '#10B981' },
  { name: 'Siyohrang (Violet)', value: '#8B5CF6' },
  { name: 'Yantar (Amber)', value: '#F59E0B' },
  { name: 'Qizil (Rose)', value: '#F43F5E' },
  { name: 'Pushti (Pink)', value: '#EC4899' },
  { name: 'Kulrang (Slate)', value: '#64748B' },
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
    user, 
    isAdmin,
    loginAsAdmin,
    logoutAdmin,
    setActivePage,
    showToast 
  } = useLibrary();

  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'books' | 'add' | 'categories'>('stats');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Book editing state
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    iconName: 'BookOpen',
    color: '#3B82F6',
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
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    description: '',
    googleDriveUrl: '',
    pdfUrl: '',
    hasAudio: false,
    audioDuration: '4 soat 30 daqiqa'
  });

  // Live parsed Google Drive info for Add Book Form
  const driveInfo: GoogleDriveParsedInfo = useMemo(() => {
    return parseGoogleDriveUrl(formData.googleDriveUrl);
  }, [formData.googleDriveUrl]);

  // Live parsed Google Drive info for Edit Book Form
  const editDriveInfo: GoogleDriveParsedInfo = useMemo(() => {
    return parseGoogleDriveUrl(editingBook?.googleDriveUrl || editingBook?.pdfUrl || '');
  }, [editingBook?.googleDriveUrl, editingBook?.pdfUrl]);

  // Live auto-generated 1st page cover for Add Book Form (No manual upload needed!)
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

  // Calculate high-level stats
  const totalBooks = books.length;
  const driveConnectedBooks = books.filter(b => !!b.googleDriveUrl || (b.pdfUrl && b.pdfUrl.includes('drive.google.com'))).length;
  const totalViews = books.reduce((acc, b) => acc + (b.views || 0), 0);
  const totalDownloads = books.reduce((acc, b) => acc + (b.downloads || 0), 0) + Math.round(totalViews * 0.35);
  const totalCategories = categories.length;

  const filteredTableBooks = books.filter(b => {
    const matchesSearch = 
      b.title.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      b.authorName.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchTableQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || b.categoryId === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Add Book Submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.authorName || !formData.description) {
      showToast('Iltimos, barcha majburiy maydonlarni to‘ldiring', 'error');
      return;
    }

    const targetCategory = categories.find(c => c.id === formData.categoryId) || categories[0];
    const matchedAuthor = authors.find(a => a.name.toLowerCase() === formData.authorName.toLowerCase());
    const chosenSub = targetCategory.subcategories?.find(s => s.id === formData.subcategoryId);

    const newBookPayload: Partial<Book> = {
      title: formData.title,
      authorId: matchedAuthor ? matchedAuthor.id : 'auth-custom',
      authorName: formData.authorName,
      categoryId: targetCategory.id,
      categoryName: targetCategory.name,
      subcategoryId: chosenSub ? chosenSub.id : undefined,
      subcategoryName: chosenSub ? chosenSub.name : undefined,
      description: formData.description,
      coverUrl: autoCoverPreview,
      pages: Number(formData.pages) || 200,
      publicationYear: Number(formData.publicationYear) || 2024,
      language: formData.language,
      googleDriveUrl: formData.googleDriveUrl.trim() || undefined,
      pdfUrl: driveInfo.isDrive ? driveInfo.previewUrl : (formData.pdfUrl || '#'),
      fileSize: '6.5 MB',
      hasAudio: formData.hasAudio,
      audioDuration: formData.hasAudio ? formData.audioDuration : undefined,
    };

    addBook(newBookPayload);

    // Reset form without requiring any picture upload
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
      audioDuration: '4 soat 30 daqiqa'
    });

    setActiveAdminTab('books');
  };

  // Handle Book Update Submit
  const handleUpdateBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    const targetCat = categories.find(c => c.id === editingBook.categoryId);
    const chosenSub = targetCat?.subcategories?.find(s => s.id === editingBook.subcategoryId);
    const updatedDrive = editDriveInfo.isDrive ? editingBook.googleDriveUrl : editingBook.googleDriveUrl;

    updateBook(editingBook.id, {
      ...editingBook,
      categoryName: targetCat ? targetCat.name : editingBook.categoryName,
      subcategoryId: chosenSub ? chosenSub.id : undefined,
      subcategoryName: chosenSub ? chosenSub.name : undefined,
      googleDriveUrl: updatedDrive,
      pdfUrl: editDriveInfo.isDrive ? editDriveInfo.previewUrl : editingBook.pdfUrl
    });

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
    } else {
      addSubCategory(
        subCategoryParentCategory.id, 
        subCategoryNameInput.trim(), 
        subCategoryDescInput.trim() || undefined
      );
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
        color: cat.color || '#3B82F6',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        slug: '',
        iconName: 'BookOpen',
        color: '#3B82F6',
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
    } else {
      addCategory({
        name: categoryFormData.name,
        slug,
        iconName: categoryFormData.iconName,
        color: categoryFormData.color,
        description: categoryFormData.description
      });
    }

    setIsCategoryModalOpen(false);
  };

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
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#17100B] border border-amber-950/90 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Faqat Administrator uchun</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-100">
              Himoyalangan Boshqaruv
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md mx-auto">
              Kutubxonaga yangi kitoblar yuklash, yangi bo‘limlar va sinflarni ochish hamda tahrirlash huquqi faqat sayt administratoriga berilgan.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left max-w-sm mx-auto pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span>Admin maxfiy paroli</span>
                <span className="text-[11px] text-amber-500/80">Maxfiy kalit</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Admin parolingizni kiriting..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none pr-10"
                />
                <Key className="w-4 h-4 text-stone-500 absolute right-3 top-3 pointer-events-none" />
              </div>
              {passwordError && (
                <p className="text-xs text-rose-400 font-medium">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator sifatida kirish</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePage('home')}
                className="w-full py-2 rounded-xl bg-transparent hover:bg-stone-800/40 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors"
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-amber-950/60 space-y-2 text-[11px] text-stone-400">
            <div>
              Bosh administrator pochtasi: <span className="text-amber-300 font-mono font-medium">muxiddin980001@gmail.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-stone-500">
              <Link className="w-3 h-3 text-amber-500/70" />
              <span>To‘g‘ridan-to‘g‘ri havola: <code className="text-amber-400/90 font-mono">#admin</code></span>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-950/80">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrator Markazi • Pro</span>
            </div>
            <span className="text-xs text-stone-400 font-mono bg-stone-900/80 px-2.5 py-0.5 rounded-full border border-stone-800">
              muxiddin980001@gmail.com
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase Cloud DB Faol</span>
            </span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            Kutubxona Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Google Drive bazasi, dinamik sahifali bo‘limlar va barcha kitoblar nazorati
          </p>
        </div>

        {/* Tab Buttons & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap p-1.5 rounded-2xl bg-[#140E0A] border border-amber-950/80 self-start md:self-auto gap-1 shadow-md">
            <button
              onClick={() => setActiveAdminTab('stats')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'stats' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1C140E]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistika</span>
            </button>
            
            <button
              onClick={() => setActiveAdminTab('books')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'books' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1C140E]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kitoblar ({books.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'categories' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1C140E]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bo‘limlar & Sahifalar ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('add')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'add' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1C140E]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Kitob</span>
            </button>
          </div>

          <button
            onClick={copyAdminLink}
            title="Admin panel havolasini nusxalash"
            className="p-2.5 rounded-2xl bg-[#140E0A] hover:bg-[#201710] text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold"
          >
            <Copy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Havolani nusxalash</span>
          </button>

          <button
            onClick={logoutAdmin}
            title="Administrator rejimidan chiqish"
            className="p-2.5 rounded-2xl bg-[#140E0A] hover:bg-rose-950/30 text-stone-400 hover:text-rose-400 border border-amber-950/80 hover:border-rose-900/60 transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATS VIEW */}
      {/* ============================================================== */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 space-y-2 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-semibold">Jami kitoblar</span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100">
                {totalBooks}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>Katalog to‘liq faol</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 space-y-2 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-semibold">Google Drive bazasi</span>
                <div className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {driveConnectedBooks}
              </div>
              <div className="text-[11px] text-stone-400">
                Bulutli PDF havolalari ulangan
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 space-y-2 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-semibold">Faol Bo‘limlar (Sahifalar)</span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">
                {totalCategories}
              </div>
              <div className="text-[11px] text-stone-400">
                Har biri shaxsiy sahifaga ega
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 space-y-2 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-semibold">Ko‘rishlar & Yuklashlar</span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100">
                {(totalViews + totalDownloads).toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                <span>{totalDownloads.toLocaleString()} ta yuklab olish</span>
              </div>
            </div>
          </div>

          {/* Quick Category Pages Overview Grid */}
          <div className="p-6 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100">Dinamik Bo‘limlar va Ularning Sahifalari</h3>
                <p className="text-xs text-stone-400">Har bir bo‘lim qo‘shilganda u avtomatik ravishda alohida sahifa va filtrga aylanadi</p>
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/25 self-start sm:self-auto"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Yangi bo‘lim (sahifa) ochish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {categories.map(cat => {
                const count = books.filter(b => b.categoryId === cat.id || b.categoryName === cat.name).length;
                const IconComponent = CATEGORY_ICONS[cat.iconName] || BookOpen;
                return (
                  <div 
                    key={cat.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1C140E] border border-amber-950/90 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/30 bg-amber-500/15 text-amber-400"
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-100 truncate">{cat.name}</div>
                        <div className="text-[11px] text-stone-400">{count} ta kitob</div>
                      </div>
                    </div>

                    <button
                      onClick={() => openCategoryPage(cat)}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0"
                    >
                      <span>Sahifani ochish</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOOKS LIST & MANAGEMENT VIEW */}
      {/* ============================================================== */}
      {activeAdminTab === 'books' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#150F0A]/90 border border-amber-950/80 p-4 rounded-2xl shadow-lg">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Kitob nomi, muallif yoki bo‘lim..."
                className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Barcha bo‘limlar ({books.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setActiveAdminTab('add')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/25 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi kitob</span>
              </button>
            </div>
          </div>

          {/* Books Table */}
          <div className="rounded-2xl border border-amber-950/80 bg-[#150F0A]/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-amber-950/90 bg-[#1E1610]/80 text-amber-400/90 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Muqova & Kitob</th>
                    <th className="py-3.5 px-4">Muallif</th>
                    <th className="py-3.5 px-4">Bo‘lim</th>
                    <th className="py-3.5 px-4">Google Drive / Fayl</th>
                    <th className="py-3.5 px-4">Nashr yili</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-950/60">
                  {filteredTableBooks.map(book => {
                    const hasDrive = !!book.googleDriveUrl || (book.pdfUrl && book.pdfUrl.includes('drive.google.com'));
                    const parsed = parseGoogleDriveUrl(book.googleDriveUrl || book.pdfUrl);

                    return (
                      <tr key={book.id} className="hover:bg-[#1E150F]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-10 h-14 rounded-lg object-cover shadow border border-amber-950/80 shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                onClick={() => openBookDetails(book)}
                                className="font-semibold text-stone-100 hover:text-amber-400 text-left line-clamp-1 transition-colors"
                              >
                                {book.title}
                              </button>
                              <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                                {book.pages} sahifa • {book.language}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-stone-300 font-medium">
                          {book.authorName}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {book.categoryName}
                            </span>
                            {book.subcategoryName && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                📌 {book.subcategoryName}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {hasDrive && parsed.isDrive ? (
                            <a
                              href={parsed.viewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Google Drive faol</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C140E] text-stone-400 border border-amber-950/60 text-[11px]">
                              <span>Standart PDF</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-stone-400 font-mono">
                          {book.publicationYear}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openBookDetails(book)}
                              title="Sahifada ko‘rish"
                              className="p-1.5 rounded-lg bg-[#1E1610] hover:bg-[#251C15] text-stone-300 hover:text-white transition-colors border border-amber-950/60"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingBook(book)}
                              title="Tahrirlash"
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/30"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setBookToDelete(book)}
                              title="O‘chirish"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/30 active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTableBooks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        Kitoblar topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CATEGORIES & DYNAMIC PAGES MANAGEMENT */}
      {/* ============================================================== */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#150F0A]/90 border border-amber-950/80 p-5 rounded-2xl shadow-lg">
            <div>
              <h2 className="font-serif-title text-lg font-bold text-stone-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Bo‘limlar va Ularning Dinamik Sahifalari</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Yangi bo‘lim qo‘shganingizda ushbu bo‘limga xos to‘laqonli shaxsiy sahifa yaratiladi
              </p>
            </div>

            <button
              onClick={() => handleOpenCategoryModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/25 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi bo‘lim (sahifa) yaratish</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const IconComponent = CATEGORY_ICONS[cat.iconName] || BookOpen;
              const count = books.filter(b => b.categoryId === cat.id || b.categoryName === cat.name).length;

              return (
                <div 
                  key={cat.id}
                  className="p-5 rounded-2xl bg-[#150F0A]/90 border border-amber-950/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-500/30 bg-amber-500/15 text-amber-400"
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg bg-[#1E1610] hover:bg-[#251C15] text-stone-300 hover:text-white transition-colors border border-amber-950/60"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          title="O‘chirish"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif-title text-base font-bold text-stone-100">{cat.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1610] text-amber-400/70 border border-amber-950/60">
                          #{cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                        {cat.description || 'Bo‘lim adabiyotlari va mutolaa resurslari.'}
                      </p>
                    </div>

                    {/* Subcategories (Sinflar / Ichki bo'limlar) */}
                    <div className="pt-3 border-t border-amber-950/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{cat.id === 'cat-2' ? 'Sinflar' : 'Ichki bo‘limlar'} ({cat.subcategories?.length || 0})</span>
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
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {cat.subcategories.map(sub => {
                            const subBookCount = books.filter(b => 
                              (b.categoryId === cat.id || b.categoryName === cat.name) && 
                              (b.subcategoryId === sub.id || b.subcategoryName === sub.name)
                            ).length;

                            return (
                              <div
                                key={sub.id}
                                className="group/sub inline-flex items-center gap-1.5 bg-[#1C140E] border border-amber-950/80 hover:border-amber-500/40 rounded-lg px-2 py-1 text-[11px] text-stone-300 transition-colors"
                              >
                                <span 
                                  onClick={() => openCategoryPage(cat, sub.id)}
                                  className="cursor-pointer hover:text-amber-300 font-medium"
                                  title="Ushbu sinf/bo‘lim kitoblarini ko‘rish"
                                >
                                  {sub.name}
                                </span>
                                <span className="text-[9px] font-mono text-stone-500 bg-stone-900 px-1 py-0.2 rounded">
                                  {subBookCount}
                                </span>
                                <div className="flex items-center gap-1 ml-1 opacity-70 group-hover/sub:opacity-100">
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
                          Hali ichki bo‘lim yoki sinflar qo‘shilmagan
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-950/80 flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-300">
                      {count} ta kitob
                    </div>

                    <button
                      onClick={() => openCategoryPage(cat)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
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
      {/* ADD NEW BOOK VIEW (GOOGLE DRIVE INTEGRATION) */}
      {/* ============================================================== */}
      {activeAdminTab === 'add' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#150F0A]/90 border border-amber-950/80 space-y-6 shadow-xl">
            <div>
              <h2 className="font-serif-title text-xl font-bold text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Yangi kitob qo‘shish (Google Drive PDF)</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Admin Google Drivedan fayl havolasini (linkini) ko‘chirib olib qo‘shadi. Tizim uni avtomatik tahlil qilib, o‘qish va yuklab olish uchun tayyorlaydi.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* GOOGLE DRIVE SECTION (PRO HIGHLIGHT) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-[#140E0A] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <label className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                      Google Drive Havolasi (PDF Link)
                    </label>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold">Asosiy ma’lumotlar bazasi</span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={formData.googleDriveUrl}
                    onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/1X-example-link/view?usp=sharing"
                    className="w-full bg-[#1C140E] border border-amber-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <p className="text-[11px] text-stone-400">
                  💡 <span className="text-amber-400 font-semibold">Muhim eslatma:</span> Google Drive fayl sozlamasida kirish huquqini «Havolaga ega barcha foydalanuvchilar» (<span className="text-stone-300">Anyone with the link</span>) deb belgilang, shunda kitob to‘siqlarsiz ochiladi va o‘qiladi.
                </p>

                {/* Live validation feedback */}
                {formData.googleDriveUrl && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    driveInfo.isDrive 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  }`}>
                    {driveInfo.isDrive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="font-semibold text-emerald-300">
                            Google Drive fayl identifikatori tasdiqlandi: <span className="font-mono text-white">{driveInfo.fileId}</span>
                          </div>
                          <div className="text-[11px] text-emerald-400/80">
                            PDF Reader ko‘rish va yuklab olish uchun avtomatik ravishda tayyorlandi.
                          </div>
                          <div className="pt-1">
                            <a
                              href={driveInfo.viewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 underline hover:text-emerald-300"
                            >
                              <span>Havolani tekshirish (Google Driveda ochish)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          Ushbu havola Google Drive formatiga o‘xshamaydi. Shunda ham to‘g‘ridan-to‘g‘ri havola sifatida saqlanadi.
                        </div>
                      </>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Maslahat:</strong> Google Drive-da faylni o‘ng tugma bilan bosib, <em>"Havolani nusxalash" (Copy Link)</em> qilib oling va shu yerga qo‘ying.
                </p>
              </div>

              {/* BOOK DETAILS FORM */}
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
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category (DYNAMIC DROPDOWN) */}
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
                        subcategoryId: '' // reset subcategory on category change
                      });
                    }}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory (Sinf yoki ichki bo'lim) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-300">
                      Ichki bo‘lim / Sinf <span className="text-stone-500 font-normal">(ixtiyoriy)</span>
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
                      <span>Yangi sinf/bo‘lim</span>
                    </button>
                  </div>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— Belgilanmagan (Asosiy umumiy) —</option>
                    {categories.find(c => c.id === formData.categoryId)?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Quick Select Buttons */}
                  {categories.find(c => c.id === formData.categoryId)?.subcategories && (categories.find(c => c.id === formData.categoryId)!.subcategories?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, subcategoryId: '' })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          !formData.subcategoryId
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-[#150F0A] text-stone-400 hover:text-stone-200 border border-amber-950/80'
                        }`}
                      >
                        Umumiy
                      </button>
                      {categories.find(c => c.id === formData.categoryId)?.subcategories?.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, subcategoryId: s.id })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            formData.subcategoryId === s.id
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold shadow-sm'
                              : 'bg-[#150F0A] text-stone-300 hover:text-amber-300 hover:bg-[#1E150F] border border-amber-950/80'
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
                    Til
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as BookLanguage })}
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Automatic 1st Page Book Cover Card */}
                <div className="space-y-2 sm:col-span-2 p-4 rounded-2xl bg-[#140E0A] border border-amber-500/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-2">
                          <span>Kitob muqovasi (1-sahifadan avtomatik)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Rasm yuklash shart emas
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-400">
                          Yuklangan kitobning 1-sahifasi avtomatik ravishda rasmiy muqova sifatida belgilanadi.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-amber-950/80">
                    <div className="w-16 h-24 rounded-lg overflow-hidden border border-amber-950/90 bg-[#1C140E] shadow-lg shrink-0">
                      <img 
                        src={autoCoverPreview} 
                        alt="1-sahifa muqova ko‘rinishi" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-stone-100">
                        {formData.title || 'Kitob nomi'}
                      </div>
                      <div className="text-stone-400 text-[11px]">
                        Muallif: {formData.authorName || 'Muallif'} • 1-sahifa
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {driveInfo.isDrive 
                            ? 'Google Drive 1-sahifa muqovasi tayyor' 
                            : 'Kitobning 1-sahifa titul muqovasi tayyor'}
                        </span>
                      </div>
                    </div>
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
                    className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Audio book toggle */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-[#1C140E] border border-amber-950/90 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-100">Audio kitob mavjudmi?</div>
                    <div className="text-[11px] text-stone-400">Audio formati bo‘lsa audio pleyerda tinglash imkoniyati ochiladi</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hasAudio}
                    onChange={(e) => setFormData({ ...formData, hasAudio: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('books')}
                  className="px-5 py-2.5 rounded-xl bg-[#1E1610] hover:bg-[#251C15] text-stone-300 text-xs font-semibold transition-colors border border-amber-950/60"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kitobni Saqlash & Nashr qilish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT BOOK MODAL */}
      {/* ============================================================== */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#17100B] border border-amber-950/90 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/80">
              <h3 className="font-serif-title text-lg font-bold text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Kitob ma’lumotlarini tahrirlash</span>
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="p-1.5 rounded-xl bg-[#1E1610] hover:bg-[#251C15] text-stone-400 hover:text-white border border-amber-950/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBookSubmit} className="space-y-4">
              {/* Google Drive Link Input for existing book */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <label className="text-xs font-bold text-stone-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Google Drive Havolasi</span>
                </label>
                <input
                  type="url"
                  value={editingBook.googleDriveUrl || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, googleDriveUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-[#1C140E] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                />
                {editDriveInfo.isDrive && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fayl ID: {editDriveInfo.fileId}</span>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-stone-300">Ichki bo‘lim / Sinf</label>
                    <button
                      type="button"
                      onClick={() => {
                        const curCat = categories.find(c => c.id === editingBook.categoryId);
                        if (curCat) handleOpenSubCategoryModal(curCat);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300"
                    >
                      + Yangi sinf
                    </button>
                  </div>
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

                  {/* Quick Select Buttons */}
                  {categories.find(c => c.id === editingBook.categoryId)?.subcategories && (categories.find(c => c.id === editingBook.categoryId)!.subcategories?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingBook({ ...editingBook, subcategoryId: undefined, subcategoryName: undefined })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          !editingBook.subcategoryId
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-[#150F0A] text-stone-400 hover:text-stone-200 border border-amber-950/80'
                        }`}
                      >
                        Umumiy
                      </button>
                      {categories.find(c => c.id === editingBook.categoryId)?.subcategories?.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setEditingBook({ ...editingBook, subcategoryId: s.id, subcategoryName: s.name })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            editingBook.subcategoryId === s.id
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold shadow-sm'
                              : 'bg-[#150F0A] text-stone-300 hover:text-amber-300 hover:bg-[#1E150F] border border-amber-950/80'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
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
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-300 hover:text-white border border-amber-950/60"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25"
                >
                  O‘zgarishlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CATEGORY (DYNAMIC PAGE) MODAL */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#17100B] border border-amber-950/90 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/80">
              <h3 className="font-serif-title text-lg font-bold text-stone-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>{editingCategory ? 'Bo‘limni tahrirlash' : 'Yangi bo‘lim va sahifa qo‘shish'}</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#1E1610] hover:bg-[#251C15] text-stone-400 hover:text-white border border-amber-950/60"
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
                  URL kaliti (Slug / Sahifa identifikatori)
                </label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="tibbiyot-salomatlik"
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Icon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Piktogramma (Belgi)
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 rounded-xl bg-[#1C140E] border border-amber-950/90 max-h-36 overflow-y-auto">
                  {Object.keys(CATEGORY_ICONS).map(iconKey => {
                    const IconComp = CATEGORY_ICONS[iconKey];
                    const isSelected = categoryFormData.iconName === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setCategoryFormData({ ...categoryFormData, iconName: iconKey })}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-amber-500 text-stone-950 shadow-md font-bold' 
                            : 'text-stone-400 hover:text-white hover:bg-[#251C15]'
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
                  Bo‘lim rangi (Aksent)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {THEME_COLORS.map(c => {
                    const isSelected = categoryFormData.color === c.value;
                    return (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setCategoryFormData({ ...categoryFormData, color: c.value })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-125 ring-2 ring-amber-400 shadow-lg' : 'hover:scale-110'
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
                  Bo‘lim tavsifi
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Ushbu bo‘limda qanday kitoblar to‘plangan..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-300 hover:text-white border border-amber-950/60"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25"
                >
                  {editingCategory ? 'Bo‘limni yangilash' : 'Bo‘lim va Sahifani yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBCATEGORY (SINFLAR / ICHKI BO‘LIMLAR) MODAL */}
      {/* ============================================================== */}
      {isSubCategoryModalOpen && subCategoryParentCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#17100B] border border-amber-950/90 rounded-3xl p-6 sm:p-7 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>
                  {editingSubCategoryId ? 'Ichki bo‘limni tahrirlash' : 'Yangi ichki bo‘lim / sinf qo‘shish'}
                </span>
              </h3>
              <button
                onClick={() => setIsSubCategoryModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#1E1610] hover:bg-[#251C15] text-stone-400 hover:text-white border border-amber-950/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#1E140D] border border-amber-950/80 text-xs text-stone-300 flex items-center gap-2">
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
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-300 hover:text-white border border-amber-950/60"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25"
                >
                  {editingSubCategoryId ? 'O‘zgarishlarni saqlash' : 'Sinf / Bo‘limni qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Deletion Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18110B] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-stone-100">Kitobni butunlay o‘chirish</h3>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              Haqiqatan ham «<span className="font-semibold text-white">{bookToDelete.title}</span>» kitobini butunlay o‘chirmoqchimisiz?
              <br />
              <span className="text-xs text-stone-400 mt-1 block">
                Ushbu kitob kutubxona katalogidan, bulutli bazadan va foydalanuvchilar ro‘yxatidan butunlay olib tashlanadi.
              </span>
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#221810] text-stone-300 text-xs font-semibold hover:bg-[#2A1E14] transition-colors"
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
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
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
