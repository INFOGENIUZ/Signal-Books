import React from 'react';
import { Star, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';

export const FavoritesPage: React.FC = () => {
  const { books, favorites, toggleFavorite, startReading, openBookDetails, setActivePage } = useLibrary();

  const favoriteBooks = books.filter(b => favorites.includes(b.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-4 border-b border-amber-950/80">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>Saqlangan asarlar</span>
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
          ⭐ Sevimli kitoblar
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Sizga ma’qul kelgan va qayta mutolaa qilish uchun saqlab qo‘yilgan kitoblar to‘plami
        </p>
      </div>

      {favoriteBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteBooks.map(book => (
            <div key={book.id} className="relative group">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty state specified by user */
        <div className="text-center py-20 px-4 rounded-3xl bg-[#18120B]/80 border border-amber-950/80 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            ⭐
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100 mb-2">
            Hozircha sevimli kitoblaringiz yo‘q.
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed mb-6">
            O‘zingizga yoqqan kitoblarni belgilab, istalgan paytda tezkor mutolaaga qayting.
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
