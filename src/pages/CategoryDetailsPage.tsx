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
  Sparkles,
  Music,
  Folder,
  SlidersHorizontal,
  Headphones,
  FileText,
  PlusCircle,
  ExternalLink,
  Check,
  X,
  Layers,
  ChevronDown,
  Tag
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
  Sparkles,
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

  // If no category is selected, fallback to first category or redirect
  const category = selectedCategory || categories[0];

  const IconComponent = category ? (ICON_MAP[category.iconName] || BookOpen) : BookOpen;
  const themeColor = category?.color || '#F59E0B';

  const subcategories = category?.subcategories || [];
  const activeSubcategory = subcategories.find(s => s.id === selectedSubCategoryFilter);

  // Helper to count books in a specific subcategory
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

  // Filter books strictly belonging to this category and active subcategory
  const categoryBooks = useMemo(() => {
    if (!category) return [];
    
    // Match either by categoryId or matching categoryName or slug
    let filtered = books.filter(b => 
      b.categoryId === category.id || 
      b.categoryName?.toLowerCase() === category.name?.toLowerCase()
    );

    // Apply subcategory filter if selected
    if (selectedSubCategoryFilter) {
      const currentSub = subcategories.find(s => s.id === selectedSubCategoryFilter);
      filtered = filtered.filter(b => 
        b.subcategoryId === selectedSubCategoryFilter || 
        (currentSub && b.subcategoryName?.toLowerCase() === currentSub.name.toLowerCase()) ||
        (currentSub && b.title.toLowerCase().includes(currentSub.name.toLowerCase()))
      );
    }

    // Apply format filter
    if (selectedFormat === 'PDF') {
      filtered = filtered.filter(b => b.format.includes('PDF'));
    } else if (selectedFormat === 'AUDIO') {
      filtered = filtered.filter(b => b.hasAudio || b.format.includes('AUDIO'));
    }

    // Apply local search
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }

    // Sort
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
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/25"
        >
          Barcha bo‘limlarga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePage('categories')}
          className="group flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Barcha bo‘limlar katalogiga qaytish</span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActivePage('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Admin panel orqali kitob qo‘shish</span>
          </button>
        )}
      </div>

      {/* Hero Category Banner with dynamic theme color */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-amber-950/80 p-6 sm:p-10 shadow-2xl"
        style={{
          background: `radial-gradient(ellipse at top right, rgba(245,158,11,0.18), transparent 70%), linear-gradient(135deg, #1C130B 0%, #110B07 100%)`
        }}
      >
        {/* Subtle background glow circle */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none bg-amber-500"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-amber-500/30 bg-amber-500/15 text-amber-400"
            >
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/30"
                >
                  Bo‘lim sahifasi
                </span>
                <span className="text-xs text-amber-400/70 font-mono">
                  #{category.slug}
                </span>
              </div>

              <h1 className="font-serif-title text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                {category.name}
              </h1>

              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                {category.description || 'Ushbu bo‘limda eng sara kitoblar, ilmiy adabiyotlar va mutolaa materiallari jamlangan.'}
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-start md:justify-end">
            <div className="bg-[#18120B]/90 border border-amber-950/90 rounded-2xl p-3.5 text-center min-w-[105px] shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-stone-100">
                {categoryBooks.length}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5 font-medium">Mavjud kitoblar</div>
            </div>

            <div className="bg-[#18120B]/90 border border-amber-950/90 rounded-2xl p-3.5 text-center min-w-[105px] shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">
                {totalAudioCount}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5 font-medium">Audio kitoblar</div>
            </div>

            {subcategories.length > 0 && (
              <div className="bg-[#18120B]/90 border border-amber-950/90 rounded-2xl p-3.5 text-center min-w-[105px] shadow-md">
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {subcategories.length}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 font-medium">
                  {category.id === 'cat-2' ? 'Sinflar' : 'Ichki bo‘lim'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories (Sinflar / Ichki bo'limlar) Navigation */}
      <div className="bg-[#140E0A]/95 border border-amber-950/80 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {category.id === 'cat-2' ? <GraduationCap className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                  {category.id === 'cat-2' ? 'Sinflar bo‘yicha darsliklar' : 'Ichki bo‘limlar & Yo‘nalishlar'}
                </h3>
                {subcategories.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#1F1610] border border-amber-950 text-[11px] text-stone-400 font-mono">
                    {subcategories.length} ta
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {category.id === 'cat-2' 
                  ? 'Kerakli sinfni tanlab, unga tegishli darsliklarni tezkor toping'
                  : 'Mavzuni tanlab, kerakli yo‘nalishdagi kitoblarni saralang'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick dropdown selector for fast navigation */}
            {subcategories.length > 0 && (
              <div className="relative">
                <select
                  value={selectedSubCategoryFilter || ''}
                  onChange={(e) => setSelectedSubCategoryFilter(e.target.value ? e.target.value : null)}
                  className="bg-[#1C140E] border border-amber-950/90 hover:border-amber-500/40 text-stone-200 text-xs rounded-xl px-3 py-1.5 pr-8 focus:border-amber-500 focus:outline-none appearance-none cursor-pointer transition-colors shadow-sm"
                >
                  <option value="">
                    {category.id === 'cat-2' ? 'Barcha sinflar' : 'Barcha yo‘nalishlar'} ({books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length})
                  </option>
                  {subcategories.map(sub => {
                    const count = getSubcategoryBookCount(sub.id, sub.name);
                    return (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} {count > 0 ? `(${count} ta kitob)` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsAddSubModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Yangi {category.id === 'cat-2' ? 'sinf' : 'ichki bo‘lim'}</span>
              </button>
            )}
          </div>
        </div>

        {subcategories.length > 0 ? (
          <div className="space-y-3">
            {/* Wrap-grid of subcategories: clearly visible, easy to click, no awkward scroll */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-1">
              {/* All button */}
              <button
                onClick={() => setSelectedSubCategoryFilter(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
                  !selectedSubCategoryFilter
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40 scale-[1.02]'
                    : 'bg-[#1C140E] text-stone-300 hover:text-amber-300 hover:bg-[#251A12] border border-amber-950/90 hover:border-amber-500/40'
                }`}
              >
                <span>{category.id === 'cat-2' ? 'Barcha sinflar' : 'Barchasi'}</span>
                {books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    !selectedSubCategoryFilter ? 'bg-black/25 text-stone-950' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length}
                  </span>
                )}
              </button>

              {/* Individual subcategory items */}
              {subcategories.map(sub => {
                const count = getSubcategoryBookCount(sub.id, sub.name);
                const isSelected = selectedSubCategoryFilter === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategoryFilter(isSelected ? null : sub.id)}
                    className={`group flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50 scale-[1.02]'
                        : 'bg-[#1A120C] text-stone-200 hover:text-amber-300 hover:bg-[#24180F] border border-amber-950/90 hover:border-amber-500/40'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-stone-950 shrink-0 stroke-[2.5]" />
                    ) : category.id === 'cat-2' ? (
                      <GraduationCap className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400/80 transition-colors shrink-0" />
                    ) : (
                      <Tag className="w-3 h-3 text-stone-500 group-hover:text-amber-400/70 transition-colors shrink-0" />
                    )}
                    <span>{sub.name}</span>
                    {count > 0 ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-black/25 text-stone-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        +{count}
                      </span>
                    ) : null}
                    {isSelected && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubCategoryFilter(null);
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-black/20 text-stone-950"
                        title="Filtrni tozalash"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active subcategory info badge */}
            {activeSubcategory && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#1C140E] border border-amber-500/30 text-xs mt-2">
                <div className="flex items-center gap-2 text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 font-bold">Tanlangan: {activeSubcategory.name}</span>
                  {activeSubcategory.description && (
                    <span className="text-stone-400 hidden md:inline">— {activeSubcategory.description}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSubCategoryFilter(null)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold self-end sm:self-auto"
                >
                  <X className="w-3 h-3" />
                  <span>Filtrni tozalash (Barcha kitoblarni ko‘rsatish)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 px-4 rounded-xl bg-[#1C140E] text-xs text-stone-400 flex items-center justify-between">
            <span>Ushbu bo‘limda hozircha ichki bo‘limlar belgilanmagan.</span>
            {isAdmin ? (
              <button
                onClick={() => setIsAddSubModalOpen(true)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Birinchi bo‘lib qo‘shish
              </button>
            ) : (
              <span className="text-stone-500 text-[11px]">Darsliklar va kitoblar barcha ro‘yxatda mavjud</span>
            )}
          </div>
        )}
      </div>

      {/* Control bar: search, formats, and sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#140E0A]/90 border border-amber-950/80 p-3 sm:p-4 rounded-2xl">
        {/* Search within this category */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`"${category.name}" bo‘yicha qidirish...`}
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
          {/* Format pills */}
          <div className="flex items-center gap-1 bg-[#1C140E] p-1 rounded-xl border border-amber-950/90">
            <button
              onClick={() => setSelectedFormat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Barchasi ({books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length})
            </button>
            <button
              onClick={() => setSelectedFormat('PDF')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'PDF'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Elektron PDF</span>
            </button>
            <button
              onClick={() => setSelectedFormat('AUDIO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === 'AUDIO'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>
          </div>

          {/* Sort selector */}
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
        <div className="text-center py-16 sm:py-20 rounded-3xl bg-[#140E0A]/90 border border-amber-950/80 p-6 sm:p-8 shadow-xl">
          <div 
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30 bg-amber-500/15 text-amber-400"
          >
            <IconComponent className="w-8 h-8" />
          </div>
          <h3 className="font-serif-title text-lg sm:text-xl font-bold text-stone-100 mb-2">
            {localSearch ? 'Qidiruv bo‘yicha kitob topilmadi' : `"${category.name}" bo‘limida hali kitoblar mavjud emas`}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
            {localSearch 
              ? 'Boshqa kalit so‘z kiritib ko‘ring yoki qidiruv filtrini tozalang.'
              : 'Admin panel orqali ushbu yangi bo‘limga Google Drive havolasi yoki elektron PDF kitob yuklashingiz mumkin.'
            }
          </p>

          <div className="flex items-center justify-center gap-3">
            {localSearch ? (
              <button
                onClick={() => setLocalSearch('')}
                className="px-4 py-2 rounded-xl bg-[#1E1610] border border-amber-950 text-stone-200 text-xs font-semibold hover:bg-[#251C15] transition-colors"
              >
                Qidiruvni tozalash
              </button>
            ) : (
              <button
                onClick={() => setActivePage('admin')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02]"
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
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Yangi {category.id === 'cat-2' ? 'sinf' : 'ichki bo‘lim'} qo‘shish</span>
              </h3>
              <button
                onClick={() => setIsAddSubModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800/50"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>{category.name}</strong> bo‘limi tarkibiga yangi sinf yoki yo‘nalish kiriting (Masalan: {category.id === 'cat-2' ? '“1-sinf”, “9-sinf”, “Olimpiada darsliklari”' : '“Boshlang‘ich”, “Akademik”, “Lug‘atlar”'}).
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
                  placeholder={category.id === 'cat-2' ? 'Masalan: 10-sinf' : 'Masalan: Jahon tarixi'}
                  className="w-full bg-[#1C140E] border border-amber-950/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  Tavsif yoki izoh <span className="text-stone-500 font-normal">(ixtiyoriy)</span>
                </label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder="Ushbu sinf yoki bo‘limga qanday kitoblar tegishli..."
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25"
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
