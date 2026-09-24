import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
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
  Music,
  Folder,
  Headphones,
  FileText,
  PlusCircle,
  Check,
  X,
  Layers,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Music,
  Folder
};

export const CategoryDetailsPage: React.FC = () => {
  const { 
    selectedCategory, 
    categories,
    books, 
    setActivePage,
    selectedSubCategoryFilter,
    setSelectedSubCategoryFilter,
    addSubCategory,
    isAdmin,
    showToast,
    user 
  } = useLibrary();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'PDF' | 'AUDIO'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'pages'>('popular');
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  // Fallback category
  const category = selectedCategory || categories[0];

  const IconComponent = category ? (ICON_MAP[category.iconName] || BookOpen) : BookOpen;
  const themeColor = category?.color || '#F59E0B';

  const subcategories = category?.subcategories || [];
  const activeSubcategory = subcategories.find(s => s.id === selectedSubCategoryFilter);

  // Count books in subcategory
  const getSubcategoryBookCount = (subId: string, subName: string) => {
    if (!category) return 0;
    return books.filter(b => {
      const inCat = b.categoryId === category.id || b.categoryName?.toLowerCase() === category.name?.toLowerCase();
      if (!inCat) return false;
      return b.subcategoryId === subId || 
             b.subcategoryName?.toLowerCase() === subName.toLowerCase() ||
             (subName && b.title.toLowerCase().includes(subName.toLowerCase()));
    }).length;
  };

  // Filter books strictly for this category and selected filters
  const categoryBooks = useMemo(() => {
    if (!category) return [];
    
    let filtered = books.filter(b => 
      b.categoryId === category.id || 
      b.categoryName?.toLowerCase() === category.name?.toLowerCase()
    );

    if (selectedSubCategoryFilter) {
      const currentSub = subcategories.find(s => s.id === selectedSubCategoryFilter);
      filtered = filtered.filter(b => 
        b.subcategoryId === selectedSubCategoryFilter || 
        (currentSub && b.subcategoryName?.toLowerCase() === currentSub.name.toLowerCase()) ||
        (currentSub && b.title.toLowerCase().includes(currentSub.name.toLowerCase()))
      );
    }

    if (selectedFormat === 'PDF') {
      filtered = filtered.filter(b => b.format.includes('PDF'));
    } else if (selectedFormat === 'AUDIO') {
      filtered = filtered.filter(b => b.hasAudio || b.format.includes('AUDIO'));
    }

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.publicationYear - a.publicationYear;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'pages') return b.pages - a.pages;
      return (b.views + b.downloads) - (a.views + a.downloads);
    });
  }, [category, books, selectedSubCategoryFilter, subcategories, selectedFormat, localSearch, sortBy]);

  const handleCreateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Ruxsat cheklangan: Sinflar va ichki bo‘limlarni faqat administrator qo‘sha oladi!', 'error');
      return;
    }
    if (!newSubName.trim() || !category) return;
    addSubCategory(category.id, newSubName.trim(), newSubDesc.trim() || undefined);
    setNewSubName('');
    setNewSubDesc('');
    setIsAddSubModalOpen(false);
  };

  const totalAudioCount = useMemo(() => {
    if (!category) return 0;
    return books.filter(b => 
      (b.categoryId === category.id || b.categoryName === category.name) && (b.hasAudio || b.format.includes('AUDIO'))
    ).length;
  }, [category, books]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-400">Bo‘lim topilmadi.</p>
        <button
          onClick={() => setActivePage('categories')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold text-xs shadow-lg"
        >
          Barcha bo‘limlarga qaytish
        </button>
      </div>
    );
  }

  const isSchool = category.id === 'cat-2' || category.slug.includes('maktab');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <button
          onClick={() => setActivePage('categories')}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#140E0A] hover:bg-[#1C140E] border border-amber-950/80 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 text-xs font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-amber-500" />
          <span>Barcha bo‘limlar katalogi</span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActivePage('admin')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Admin panel: Kitob yuklash</span>
          </button>
        )}
      </div>

      {/* Modern High-End Hero Banner */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-amber-950/80 p-6 sm:p-8 md:p-10 shadow-2xl transition-all"
        style={{
          background: `radial-gradient(ellipse at top right, ${themeColor}22, transparent 65%), linear-gradient(145deg, #1A120B 0%, #0E0A07 100%)`
        }}
      >
        <div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border border-amber-500/30 text-amber-400"
              style={{
                backgroundColor: `${themeColor}1a`,
                borderColor: `${themeColor}4d`,
                color: themeColor
              }}
            >
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border font-mono"
                  style={{
                    backgroundColor: `${themeColor}18`,
                    color: themeColor,
                    borderColor: `${themeColor}38`
                  }}
                >
                  Bo‘lim Fondi
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  #{category.slug}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
                {category.name}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                {category.description || 'Ushbu bo‘limda eng sara kitoblar, darsliklar va elektron mutolaa materiallari jamlangan.'}
              </p>
            </div>
          </div>

          {/* Stats Cards Ribbon */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-5 border-t border-amber-950/70">
            <div className="flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-2xl bg-black/40 border border-stone-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mavjud kitoblar</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-stone-100 mt-1">
                {categoryBooks.length}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-2xl bg-black/40 border border-stone-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                <Headphones className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Audio kitoblar</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-300 mt-1">
                {totalAudioCount}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-2xl bg-black/40 border border-stone-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                {isSchool ? <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" /> : <Layers className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{isSchool ? 'Sinflar' : 'Yo‘nalishlar'}</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                {subcategories.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories & Classes Filter Section */}
      <div className="rounded-3xl bg-[#140E0A] border border-amber-950/80 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {isSchool ? <GraduationCap className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100 font-heading tracking-tight">
                  {isSchool ? 'Sinflar bo‘yicha darsliklar' : 'Ichki yo‘nalishlar va janrlar'}
                </h3>
                {subcategories.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-mono font-bold">
                    {subcategories.length} ta
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {isSchool 
                  ? 'Sinf darsliklarini alohida ajratib ko‘rish uchun kerakli sinf tugmasini bosing'
                  : 'Mavzu bo‘yicha saralash uchun kerakli yo‘nalishni tanlang'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddSubModalOpen(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Yangi {isSchool ? 'sinf' : 'yo‘nalish'}</span>
            </button>
          )}
        </div>

        {subcategories.length > 0 ? (
          <div className="space-y-3">
            {/* Interactive Segmented Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedSubCategoryFilter(null)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
                  !selectedSubCategoryFilter
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#1C140E] text-stone-300 hover:text-amber-300 hover:bg-[#251A12] border border-stone-800'
                }`}
              >
                <span>{isSchool ? 'Barcha sinflar' : 'Barchasi'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !selectedSubCategoryFilter ? 'bg-black/30 text-stone-950' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length}
                </span>
              </button>

              {subcategories.map(sub => {
                const count = getSubcategoryBookCount(sub.id, sub.name);
                const isSelected = selectedSubCategoryFilter === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategoryFilter(isSelected ? null : sub.id)}
                    className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-md shadow-amber-500/25'
                        : 'bg-[#1C140E] text-stone-300 hover:text-amber-200 hover:bg-[#251A12] border border-stone-800/90 hover:border-amber-500/40'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 text-stone-950 shrink-0 stroke-[2.5]" />
                    ) : isSchool ? (
                      <GraduationCap className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors shrink-0" />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors shrink-0" />
                    )}
                    <span>{sub.name}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-black/30 text-stone-950' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Subcategory Context Info */}
            {activeSubcategory && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#1C140E] border border-amber-500/30 text-xs mt-2">
                <div className="flex items-center gap-2 text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300 font-bold">Tanlangan filter: {activeSubcategory.name}</span>
                  {activeSubcategory.description && (
                    <span className="text-stone-400 hidden md:inline">— {activeSubcategory.description}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSubCategoryFilter(null)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold self-end sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Filtrni tozalash</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3.5 px-4 rounded-2xl bg-[#18120C] text-xs text-stone-400 flex items-center justify-between border border-stone-800">
            <span>Ushbu bo‘limda hozircha alohida ichki yo‘nalishlar belgilanmagan.</span>
            {isAdmin && (
              <button
                onClick={() => setIsAddSubModalOpen(true)}
                className="text-amber-400 hover:underline font-semibold"
              >
                + Yo‘nalish qo‘shish
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Bar: Search within category, format tabs, sort selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-[#140E0A] border border-amber-950/80 p-3.5 sm:p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`"${category.name}" bo‘yicha qidiruv...`}
            className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
            >
              Tozalash
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#1C140E] p-1 rounded-xl border border-amber-950/90">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Barchasi ({books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length})
            </button>
            <button
              onClick={() => setSelectedFormat('PDF')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'PDF'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Darsliklar</span>
            </button>
            <button
              onClick={() => setSelectedFormat('AUDIO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'AUDIO'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1C140E] border border-amber-950/90 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="popular">🔥 Eng ommabop</option>
            <option value="newest">✨ Eng yangi nashrlar</option>
            <option value="rating">⭐ Yuqori reytingli</option>
            <option value="pages">📄 Hajmi bo‘yicha</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {categoryBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {categoryBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 rounded-3xl bg-[#140E0A] border border-amber-950/80 p-6 sm:p-8 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30 bg-amber-500/15 text-amber-400">
            <IconComponent className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-100 mb-2">
            {localSearch ? 'Qidiruv bo‘yicha kitob topilmadi' : `"${category.name}" bo‘limida hali kitoblar mavjud emas`}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
            {localSearch 
              ? 'Boshqa kalit so‘z kiritib ko‘ring yoki qidiruv filtrini tozalang.'
              : 'Admin panel orqali ushbu bo‘limga Google Drive havolasi yoki elektron PDF kitob yuklashingiz mumkin.'
            }
          </p>

          <div className="flex items-center justify-center gap-3">
            {localSearch ? (
              <button
                onClick={() => setLocalSearch('')}
                className="px-4 py-2 rounded-xl bg-[#1E1610] border border-amber-950 text-stone-200 text-xs font-semibold hover:bg-[#251C15]"
              >
                Qidiruvni tozalash
              </button>
            ) : (
              <button
                onClick={() => setActivePage('admin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 text-xs font-bold shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ushbu bo‘limga kitob qo‘shish</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAdmin && isAddSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#17100B] border border-amber-950/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
              <h3 className="font-heading text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Yangi {isSchool ? 'sinf' : 'ichki bo‘lim'} qo‘shish</span>
              </h3>
              <button
                onClick={() => setIsAddSubModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>{category.name}</strong> bo‘limiga yangi sinf yoki yo‘nalish nomini kiriting.
            </p>

            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Nomi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder={isSchool ? 'Masalan: 10-sinf' : 'Masalan: Jahon tarixi'}
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Izoh <span className="text-stone-500 font-normal">(ixtiyoriy)</span>
                </label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder="Ushbu sinf yoki yo‘nalishga qanday kitoblar kiradi..."
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1610] text-xs text-stone-400 hover:text-stone-200 border border-amber-950/60"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 text-xs font-bold shadow-lg"
                >
                  Qo‘shish & Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
