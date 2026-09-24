import React from 'react';
import { Star, Bookmark, BookText, AudioLines, Eye, Headphones } from 'lucide-react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { openBookDetails, startReading, favorites, toggleFavorite } = useLibrary();

  const isFav = favorites.includes(book.id);
  const isAudioOnly = Boolean(
    book.hasAudio && 
    (!book.pdfUrl || book.pdfUrl === '#' || book.pages === 0 || (book.format && book.format.length === 1 && book.format[0] === 'AUDIO'))
  );

  return (
    <div 
      className="group relative flex flex-col rounded-2xl bg-[#15100B]/90 border border-amber-950/70 p-2.5 sm:p-3 hover:border-amber-500/50 hover:bg-[#1E1610] hover:shadow-[0_12px_30px_-5px_rgba(245,158,11,0.2)] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
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

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08]/90 via-transparent to-black/25 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Badges on top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {book.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
              Yangi
            </span>
          )}
          {book.hasAudio && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
              <AudioLines className="w-2.5 h-2.5 text-amber-400" />
              <span>Audio</span>
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(book.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            isFav 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
              : 'bg-stone-900/70 text-stone-300 hover:text-amber-300 hover:bg-stone-900/90'
          }`}
          title={isFav ? "Sevimlilardan o‘chirish" : "Sevimlilarga saqlash"}
          aria-label="Saqlash"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Read/Listen Button on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openBookDetails(book);
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            {isAudioOnly ? (
              <>
                <Headphones className="w-3.5 h-3.5 text-stone-950" />
                <span>Tinglash</span>
              </>
            ) : (
              <>
                <BookText className="w-3.5 h-3.5 text-stone-950" />
                <span>O‘qish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-medium text-amber-400/90 truncate">
              {book.categoryName}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{book.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => openBookDetails(book)}
            className="font-serif-title font-semibold text-sm text-stone-100 line-clamp-1 group-hover:text-amber-400 cursor-pointer transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
            {book.authorName}
          </p>
        </div>

        {/* Footer info: views */}
        <div className="pt-3 mt-2 border-t border-amber-950/60 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{book.views.toLocaleString()}</span>
          </span>
          <span className="text-stone-400 font-mono text-[10px]">
            {isAudioOnly ? (book.audioDuration || 'Audio kitob') : `${book.pages} bet`}
          </span>
        </div>
      </div>
    </div>
  );
};
