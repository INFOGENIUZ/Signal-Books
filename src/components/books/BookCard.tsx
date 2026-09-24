import React from 'react';
import { Star, Bookmark, BookText, AudioLines, Eye } from 'lucide-react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { isBookNew } from '../../utils/bookUtils';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { openBookDetails, startReading, favorites, toggleFavorite } = useLibrary();

  const isFav = favorites.includes(book.id);

  return (
    <div 
      className="group relative flex flex-col rounded-2xl bg-[#140E0A] border border-amber-950/80 p-3 hover:border-amber-500/60 hover:bg-[#1A120C] hover:shadow-[0_16px_36px_-10px_rgba(245,158,11,0.22)] transition-all duration-300 transform hover:-translate-y-1.5 active:scale-[0.98]"
    >
      {/* Cover Image Container */}
      <div 
        onClick={() => openBookDetails(book)}
        className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-stone-950 cursor-pointer mb-3 shadow-md"
      >
        <img
          src={book.coverUrl || undefined}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/90 via-transparent to-black/20 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Badges on top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {isBookNew(book) && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
              Yangi
            </span>
          )}
          {book.hasAudio && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900/85 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <AudioLines className="w-3 h-3 text-amber-400" />
              <span>Audio</span>
            </span>
          )}
        </div>

        {/* Bookmark Button top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(book.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-md z-10 ${
            isFav 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
              : 'bg-stone-900/75 text-stone-300 hover:text-amber-300 hover:bg-stone-900/95 border border-stone-800'
          }`}
          title={isFav ? "Sevimlilardan o‘chirish" : "Sevimlilarga saqlash"}
          aria-label="Saqlash"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Read Button on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startReading(book);
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-md transition-all"
          >
            <BookText className="w-3.5 h-3.5 text-stone-950" />
            <span>O‘qish</span>
          </button>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-amber-400/90 truncate">
              {book.categoryName}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{book.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Book Title */}
          <h3 
            onClick={() => openBookDetails(book)}
            className="font-heading font-bold text-sm text-stone-100 line-clamp-1 group-hover:text-amber-300 cursor-pointer transition-colors tracking-tight leading-snug"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author Name */}
          <p className="text-xs text-stone-400 line-clamp-1 mt-0.5 font-medium">
            {book.authorName}
          </p>
        </div>

        {/* Card Footer: Views & Page Count */}
        <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between text-[11px] text-stone-400 font-medium">
          <span className="flex items-center gap-1 text-stone-400">
            <Eye className="w-3 h-3 text-amber-500/70" />
            <span>{book.views.toLocaleString()}</span>
          </span>
          <span className="text-stone-400 font-mono text-[10px]">
            {book.pages} bet
          </span>
        </div>
      </div>
    </div>
  );
};
