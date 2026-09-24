import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, BookText, Star, Sparkles, ChevronRight } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Icon3D } from '../common/Icon3D';

export const HeroSearchBar: React.FC = () => {
  const { 
    books, 
    searchQuery, 
    setSearchQuery, 
    setActivePage, 
    openBookDetails, 
    startReading 
  } = useLibrary();

  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter books matching search query for live suggestion popover
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 1) return [];
    const q = searchQuery.toLowerCase().trim();
    return books.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.authorName.toLowerCase().includes(q) ||
      b.categoryName?.toLowerCase().includes(q) ||
      b.subcategoryName?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [books, searchQuery]);

  // Handle Search Form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false);
      setActivePage('books');
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto relative z-10" ref={containerRef}>
      {/* Creative Glassmorphism Search Input Bar */}
      <form onSubmit={handleSearchSubmit}>
        <div 
          className={`relative flex items-center rounded-2xl bg-[#140E0A]/95 border transition-all duration-300 p-1.5 sm:p-2 backdrop-blur-2xl ${
            isFocused 
              ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-[0_0_45px_rgba(245,158,11,0.35)]' 
              : 'border-amber-500/35 hover:border-amber-500/65 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.15)]'
          }`}
        >
          {/* 3D Magnifier Icon */}
          <div className="pl-3 sm:pl-4 pr-2 flex items-center justify-center shrink-0">
            <Icon3D name="search" size={28} className="transition-transform duration-300 hover:scale-110" />
          </div>

          {/* Input text */}
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kitob nomi, muallif yoki mavzu bo‘yicha qidiring..."
            className="w-full bg-transparent px-2 py-2.5 sm:py-3 text-xs sm:text-base text-[#F5F5F4] placeholder-stone-400 outline-none font-sans font-medium tracking-tight"
          />

          {/* Clear text button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800/60 transition-colors mr-1.5 shrink-0"
              title="Tozalash"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            className="px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.45)] transition-all duration-200 shrink-0 hover:scale-[1.03] active:scale-95 cursor-pointer font-heading tracking-tight"
          >
            <span>Qidirish</span>
            <ArrowRight className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Live Auto-Suggestions Dropdown Popover */}
      {isFocused && searchQuery.trim().length > 0 && (
        <div className="absolute top-full inset-x-0 mt-2.5 rounded-2xl bg-[#140E0A]/95 border border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-3.5 sm:p-4 z-50 animate-fade-in space-y-3">
          <div className="flex items-center justify-between px-2 pb-2.5 border-b border-amber-950/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-heading">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Topilgan kitoblar ({searchResults.length} ta)</span>
            </div>
            <button
              onClick={() => {
                setIsFocused(false);
                setActivePage('books');
              }}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 hover:underline"
            >
              <span>Barcha natijalarni ko‘rish</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {searchResults.map(book => (
                <div
                  key={book.id}
                  onClick={() => {
                    setIsFocused(false);
                    openBookDetails(book);
                  }}
                  className="group flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#1A120C]/80 hover:bg-[#251A12] border border-stone-800/80 hover:border-amber-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img 
                      src={book.coverUrl || undefined} 
                      alt={book.title} 
                      className="w-10 h-14 rounded-lg object-cover shadow shrink-0 group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-amber-400/90 truncate">
                          {book.categoryName}
                        </span>
                        <div className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-stone-100 truncate group-hover:text-amber-300 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {book.authorName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFocused(false);
                      startReading(book);
                    }}
                    className="ml-2 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    <BookText className="w-3 h-3 text-amber-400" />
                    <span className="hidden xs:inline">O‘qish</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-stone-400">
              "{searchQuery}" bo‘yicha mos kitob topilmadi. Qidiruv tugmasini bosib barcha katalogdan qidiring.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
