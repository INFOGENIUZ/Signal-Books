import React from 'react';
import { History, BookOpen, Clock, ArrowRight, BookMarked } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const HistoryPage: React.FC = () => {
  const { readingHistory, books, startReading, setActivePage } = useLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-amber-950/80">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
          <History className="w-4 h-4" />
          <span>Mutolaa xotirasi</span>
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
          O‘qish tarixi
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Yaqinda ochilgan kitoblaringiz va to‘xtagan sahifalaringiz
        </p>
      </div>

      {readingHistory.length > 0 ? (
        <div className="space-y-4">
          {readingHistory.map(item => {
            const currentBook = books.find(b => b.id === item.bookId);
            return (
              <div 
                key={item.bookId}
                className="group flex flex-col sm:flex-row items-center justify-between gap-5 p-4 sm:p-5 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 hover:border-amber-500/40 hover:bg-[#1C140E] transition-all shadow-md hover:shadow-xl duration-200"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={item.coverUrl}
                      alt={item.bookTitle}
                      className="w-16 h-24 rounded-xl object-cover shadow-lg border border-amber-500/30 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif-title font-bold text-base sm:text-lg text-stone-100 truncate group-hover:text-amber-300 transition-colors">
                      {item.bookTitle}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {item.authorName}
                    </p>

                    {/* Progress Bar in warm Amber & Gold */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-36 sm:w-56 h-2 rounded-full bg-[#251A12] overflow-hidden border border-amber-950">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          style={{ width: `${Math.min(100, item.progressPercent || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.progressPercent}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                      <span className="font-mono">{item.currentPage} / {item.totalPages} sahifa</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500/80" />
                        <span>{item.lastReadAt}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {currentBook && (
                  <button
                    onClick={() => startReading(currentBook, item.currentPage)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all shrink-0 hover:scale-[1.02] active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-stone-950" />
                    <span>Davom ettirish</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#16100B]/60 border border-amber-950/80 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <History className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100 mb-2">
            Hozircha o‘qish tarixi mavjud emas
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed mb-6">
            Istalgan kitobni oching va mutolaa jarayoni avtomatik ravishda bu yerda saqlanadi.
          </p>
          <button
            onClick={() => setActivePage('books')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mx-auto hover:scale-[1.02]"
          >
            <span>Kitob tanlash</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      )}
    </div>
  );
};
