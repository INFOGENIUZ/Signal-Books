import React from 'react';
import { Star, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';

export const FavoritesPage: React.FC = () => {
  const { books, favorites, clearAllFavorites, setActivePage } = useLibrary();

  const favoriteBooks = books.filter(b => favorites.includes(b.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-950/80">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>Saqlangan asarlar</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            ⭐ Sevimli kitoblar
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Sizga ma’qul kelgan va qayta mutolaa qilish uchun saqlab qo‘yilgan kitoblar to‘plami
          </p>
        </div>

        {favoriteBooks.length > 0 && (
          <button
            onClick={clearAllFavorites}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Barcha sevimlilarni tozalash</span>
          </button>
        )}
      </div>

      {favoriteBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {favoriteBooks.map(book => (
            <div key={book.id} className="relative group">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#140E0A] border border-amber-950/80 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            ⭐
          </div>
          <h3 className="font-heading text-lg font-bold text-stone-100">
            Hozircha sevimli kitoblaringiz yo‘q.
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
            O‘zingizga yoqqan kitoblarni belgilab, istalgan paytda tezkor mutolaaga qayting. Sevimlilar bazasi muvaffaqiyatli tozalandi.
          </p>
          <button
            onClick={() => setActivePage('books')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <span>Kitoblarni ko‘rish</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      )}
    </div>
  );
};
