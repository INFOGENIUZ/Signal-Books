import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  X, 
  Sparkles
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';

export const AllBooksPage: React.FC = () => {
  const { 
    books, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    selectedCategoryFilter, 
    setSelectedCategoryFilter,
    setActivePage,
    isAdmin
  } = useLibrary();

  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'alphabet' | 'rating'>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 12;

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryFilter) {
      result = result.filter(b => b.categoryId === selectedCategoryFilter);
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.publicationYear - a.publicationYear);
    } else if (sortBy === 'alphabet') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [books, searchQuery, selectedCategoryFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter(null);
    setCurrentPage(1);
  };

  const activeCategory = categories.find(c => c.id === selectedCategoryFilter);
  const hasActiveQueryOrCategory = Boolean(searchQuery.trim()) || Boolean(selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-950/80">
        <div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight flex items-center gap-2">
            <span>📚 Barcha kitoblar</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Jami: <span className="font-bold text-amber-400">{filteredBooks.length}</span> ta kitob
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 bg-[#18120C]/90 px-3.5 py-2 rounded-xl border border-amber-950/80 self-start sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-xs text-stone-400">Saralash:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs text-stone-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-[#18120C] text-stone-200">Eng mashhur</option>
            <option value="newest" className="bg-[#18120C] text-stone-200">Eng yangi</option>
            <option value="rating" className="bg-[#18120C] text-stone-200">Reyting bo‘yicha</option>
            <option value="alphabet" className="bg-[#18120C] text-stone-200">Alifbo bo‘yicha</option>
          </select>
        </div>
      </div>

      {/* Active Search / Category Indicator */}
      {hasActiveQueryOrCategory && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#18120C]/80 border border-amber-950/80">
          <span className="text-xs text-stone-400 font-medium">Holat:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Qidiruv: "{searchQuery}"
              <button 
                onClick={() => setSearchQuery('')}
                className="hover:text-white"
                aria-label="Qidiruvni tozalash"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {activeCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Kategoriya: {activeCategory.name}
              <button 
                onClick={() => setSelectedCategoryFilter(null)}
                className="hover:text-white"
                aria-label="Kategoriyani bekor qilish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            Barchasini ko‘rsatish
          </button>
        </div>
      )}

      {/* Full-width Books Grid */}
      {paginatedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {paginatedBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#16110C]/80 border border-amber-950/80 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#1E1711] border border-amber-950/60 flex items-center justify-center mx-auto mb-4 text-3xl">
            📖
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100">
            {books.length === 0 ? 'Kutubxona fondi hozircha bo‘sh' : 'Hech qanday kitob topilmadi'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 mb-6">
            {books.length === 0 
              ? 'Barcha soxta ma’lumotlar tozalangan. Administrator boshqaruv paneli orqali yangi kitoblar yuklanishi bilan shu yerda aks etadi.'
              : 'Qidiruv so‘zini o‘zgartirib yoki tozalab qayta urinib ko‘ring.'}
          </p>
          {books.length === 0 && isAdmin ? (
            <button
              onClick={() => setActivePage('admin')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg transition-all"
            >
              👑 Kitob qo‘shish (Admin Panel)
            </button>
          ) : books.length > 0 ? (
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg transition-all"
            >
              Barcha kitoblarni ko‘rsatish
            </button>
          ) : null}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-[#18120C] border border-amber-950/80 text-xs font-medium text-stone-300 disabled:opacity-40 disabled:hover:bg-[#18120C] hover:bg-[#221911] transition-colors"
          >
            Oldingi
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-[#18120C] border border-amber-950/80 text-stone-400 hover:text-white hover:bg-[#221911]'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-[#18120C] border border-amber-950/80 text-xs font-medium text-stone-300 disabled:opacity-40 disabled:hover:bg-[#18120C] hover:bg-[#221911] transition-colors"
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
};
