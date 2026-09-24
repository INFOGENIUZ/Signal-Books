import React from 'react';
import { Star, Eye, Bookmark, BookText, AudioLines } from 'lucide-react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface FeaturedBookCardProps {
  book: Book;
}

export const FeaturedBookCard: React.FC<FeaturedBookCardProps> = ({ book }) => {
  const { openBookDetails, startReading, favorites, toggleFavorite } = useLibrary();
  const isFav = favorites.includes(book.id);

  return (
    <div className="group relative flex flex-col sm:flex-row items-stretch rounded-2xl bg-[#16110D]/90 border border-amber-950/80 p-4 hover:border-amber-500/50 hover:bg-[#1F1711] hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.22)] transition-all duration-300">
      {/* Cover */}
      <div 
        onClick={() => openBookDetails(book)}
        className="relative w-full sm:w-36 md:w-40 aspect-[3/4] rounded-xl overflow-hidden bg-stone-950 cursor-pointer shrink-0 shadow-lg"
      >
        <img
          src={book.coverUrl || undefined}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
        
        {book.hasAudio && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-950/80 text-amber-300 backdrop-blur-md border border-amber-500/30 flex items-center gap-1">
            <AudioLines className="w-2.5 h-2.5 text-amber-400" />
            <span>Audio</span>
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between sm:pl-5 pt-3 sm:pt-0">
        <div>
          {/* Top row: Category, Rating & Bookmark */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
              {book.categoryName}
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{book.rating.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(book.id);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  isFav 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-stone-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                    : 'bg-[#1D1610] border-amber-950/80 text-stone-400 hover:text-amber-300 hover:border-amber-500/40'
                }`}
                title={isFav ? "Sevimlilardan o‘chirish" : "Sevimlilarga saqlash"}
                aria-label="Saqlash"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => openBookDetails(book)}
            className="font-serif-title font-bold text-base sm:text-lg text-stone-100 group-hover:text-amber-400 cursor-pointer transition-colors line-clamp-1 mt-1"
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs sm:text-sm text-stone-300 font-medium mt-0.5">
            {book.authorName}
          </p>

          {/* Short description preview */}
          <p className="text-xs text-stone-400 line-clamp-2 mt-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Bottom stats & Action button */}
        <div className="pt-4 mt-2 border-t border-amber-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>{book.views.toLocaleString()}</span>
            </span>
            <span className="font-mono text-stone-500">
              {book.pages} bet
            </span>
          </div>

          <button
            onClick={() => startReading(book)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.02]"
          >
            <BookText className="w-3.5 h-3.5 text-stone-950" />
            <span>O‘qish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
