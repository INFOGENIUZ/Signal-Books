import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Icon3D } from '../components/common/Icon3D';

export const HistoryPage: React.FC = () => {
  const { readingHistory, books, startReading, removeFromHistory, clearHistory, setActivePage } = useLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-950/80">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Icon3D name="history" size={20} />
            <span>Mutolaa xotirasi</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            O‘qish tarixi
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Yaqinda ochilgan va o‘qilgan kitoblaringiz ro‘yxati
          </p>
        </div>

        {readingHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Icon3D name="trash" size={18} />
            <span>Barcha tarixni tozalash</span>
          </button>
        )}
      </div>

      {readingHistory.length > 0 ? (
        <div className="space-y-4">
          {readingHistory.map(item => {
            const currentBook = books.find(b => b.id === item.bookId);
            return (
              <div 
                key={item.bookId}
                className="group relative flex flex-col sm:flex-row items-center justify-between gap-5 p-4 sm:p-5 rounded-2xl bg-[#140E0A] border border-amber-950/80 hover:border-amber-500/50 hover:bg-[#1C140E] transition-all shadow-md hover:shadow-xl duration-200"
              >
                {/* Delete X Button on Top Right of Card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.bookId);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-xl bg-stone-900/80 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-800 hover:border-rose-500/40 transition-all z-10 cursor-pointer"
                  title="Tarixdan o‘chirish"
                  aria-label="Tarixdan o‘chirish"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 w-full sm:w-auto min-w-0 pr-8 sm:pr-0">
                  <div className="relative shrink-0">
                    <img
                      src={item.coverUrl || undefined}
                      alt={item.bookTitle}
                      className="w-16 h-24 rounded-xl object-cover shadow-lg border border-amber-500/30 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-stone-100 truncate group-hover:text-amber-300 transition-colors pr-2">
                      {item.bookTitle}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {item.authorName}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-400">
                      <span className="font-mono">{item.totalPages} sahifa</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Icon3D name="clock" size={16} />
                        <span>{item.lastReadAt}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {currentBook && (
                  <button
                    onClick={() => startReading(currentBook, 1)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all shrink-0 hover:scale-[1.02] active:scale-95 font-heading cursor-pointer"
                  >
                    <Icon3D name="books" size={20} />
                    <span>Kitobni o‘qish</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#140E0A] border border-amber-950/80 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Icon3D name="history" size={36} />
          </div>
          <h3 className="font-heading text-lg font-bold text-stone-100">
            Hozircha o‘qish tarixi mavjud emas
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
            Istalgan kitobni oching va mutolaa jarayoni avtomatik ravishda bu yerda saqlanadi.
          </p>
          <button
            onClick={() => setActivePage('books')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mx-auto hover:scale-[1.02] cursor-pointer"
          >
            <span>Kitob tanlash</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      )}
    </div>
  );
};
