import React from 'react';
import { 
  Search, 
  ArrowRight, 
  Flame, 
  Clock, 
  BookOpen, 
  Headphones, 
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { FeaturedBookCard } from '../components/books/FeaturedBookCard';
import { BookCard } from '../components/books/BookCard';
import { DailyQuoteAndReadingTracker } from '../components/home/DailyQuoteAndReadingTracker';
import { Book, AudioTrack } from '../types';

export const HomePage: React.FC = () => {
  const { 
    books, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    setActivePage, 
    setSelectedCategoryFilter,
    startReading, 
    readingHistory,
    playAudio,
    isAdmin 
  } = useLibrary();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('books');
    }
  };

  // Unique authors count from real books
  const uniqueAuthorsCount = new Set(books.map(b => b.authorName.trim()).filter(Boolean)).size;

  // Featured books
  const featuredBooks = books.filter(b => b.isFeatured).slice(0, 4);
  // New books
  const newBooks = books.filter(b => b.isNew || b.publicationYear >= 2020).slice(0, 6);
  // Audio books
  const audioBooks = books.filter(b => b.hasAudio).slice(0, 4);
  // Top Categories (first 8)
  const popularCategories = categories.slice(0, 8);

  // Latest reading history item
  const recentHistoryItem = readingHistory.length > 0 ? readingHistory[0] : null;
  const recentBook = recentHistoryItem ? books.find(b => b.id === recentHistoryItem.bookId) : null;

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        {/* Ambient Glowing Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/12 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Official Glowing Gold Logo Emblem */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex p-1.5 sm:p-2 rounded-2xl bg-[#080604] border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              <img src="/signal-books-icon.svg" alt="Signal Books" className="w-14 h-14 sm:w-16 sm:h-16 object-contain hover:scale-105 transition-transform" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif-title text-3xl sm:text-5xl md:text-6xl font-extrabold text-stone-100 tracking-tight leading-[1.18] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]">
              Signal Books
            </span>{' '}
            kutubxonasiga xush kelibsiz
          </h1>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Sevimli asarlaringizni toping, mutolaa qiling, tinglang va cheksiz bilim olamiga sayohat qiling.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto relative mb-8">
            <div className="relative flex items-center rounded-2xl bg-[#18130E]/90 border border-amber-500/30 p-1 sm:p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.2)] focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500/60 ml-2.5 sm:ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kitob, muallif yoki janr..."
                className="w-full px-2.5 sm:px-3 py-2 sm:py-3 bg-transparent text-xs sm:text-base text-stone-100 placeholder-stone-500 outline-none"
              />
              <button
                type="submit"
                className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shrink-0 hover:scale-[1.02]"
              >
                <span>Qidirish</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950" />
              </button>
            </div>
          </form>

          {/* Real Statistics counter badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-2">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-stone-100">{books.length}</span>
              <span className="text-xs text-stone-400 font-medium">kitob</span>
            </div>
            <div className="h-6 w-[1px] bg-stone-800 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400">{uniqueAuthorsCount}</span>
              <span className="text-xs text-stone-400 font-medium">muallif</span>
            </div>
            <div className="h-6 w-[1px] bg-stone-800 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-orange-400">{categories.length}</span>
              <span className="text-xs text-stone-400 font-medium">kategoriya</span>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Reading Section (if user has active history) */}
      {recentHistoryItem && recentBook && (
        <section className="px-4 max-w-7xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1A130D] to-[#120E0A] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img 
                src={recentHistoryItem.coverUrl} 
                alt={recentHistoryItem.bookTitle} 
                className="w-14 h-20 rounded-xl object-cover shadow-md shrink-0 ring-1 ring-amber-500/40"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    O‘qishni davom ettirish
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-100 truncate">
                  {recentHistoryItem.bookTitle}
                </h4>
                <p className="text-xs text-stone-400">
                  {recentHistoryItem.authorName} • {recentHistoryItem.currentPage} / {recentHistoryItem.totalPages} sahifa ({recentHistoryItem.progressPercent}%)
                </p>
                <div className="w-full max-w-xs h-1.5 rounded-full bg-stone-900 mt-2 overflow-hidden border border-amber-950/60">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${recentHistoryItem.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => startReading(recentBook, recentHistoryItem.currentPage)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4 text-stone-950" />
              <span>Davom ettirish</span>
            </button>
          </div>
        </section>
      )}

      {/* Interactive Reading Hub & Daily Inspiration Section */}
      <DailyQuoteAndReadingTracker />

      {/* When books are empty: Pristine clean state */}
      {books.length === 0 ? (
        <section className="px-4 max-w-3xl mx-auto text-center py-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#16100B]/90 border border-amber-950/80 shadow-2xl relative overflow-hidden space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
              📚
            </div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-100">
              Kutubxona fondi haqiqiy kitoblar uchun tayyor
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
              Barcha soxta ma’lumotlar to‘liq tozalandi. Administrator boshqaruv paneli orqali Google Drive havolalari yordamida maktab darsliklari va elektron kitoblarni to‘g‘ridan-to‘g‘ri yuklashingiz mumkin.
            </p>
            {isAdmin ? (
              <div className="pt-2">
                <button
                  onClick={() => setActivePage('admin')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>👑 Admin Panelga o‘tish va kitob yuklash</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => setActivePage('categories')}
                  className="px-6 py-2.5 rounded-xl bg-[#1C140E] hover:bg-[#251B13] border border-amber-950/80 text-amber-300 text-xs font-semibold transition-all inline-flex items-center gap-2"
                >
                  <span>Kategoriyalarni ko‘rish</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Featured Books Section: 🔥 Mashhur kitoblar */}
          {featuredBooks.length > 0 && (
            <section className="px-4 max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Eng sara to‘plam</span>
                  </div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                    🔥 Mashhur kitoblar
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1">
                    Kitobxonlar orasida eng ko‘p o‘qilayotgan durdona asarlar
                  </p>
                </div>

                <button
                  onClick={() => setActivePage('books')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Barchasini ko‘rish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredBooks.map(book => (
                  <FeaturedBookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* New Books Section */}
          {newBooks.length > 0 && (
            <section className="px-4 max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Yangi nashrlar</span>
                  </div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                    🆕 Yangi qo‘shilgan kitoblar
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1">
                    Kutubxonamizga yaqinda yuklangan sara asarlar va darsliklar
                  </p>
                </div>

                <button
                  onClick={() => setActivePage('books')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Hammasini ko‘rish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {newBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Audio Books Section Preview */}
          {audioBooks.length > 0 && (
            <section className="px-4 max-w-7xl mx-auto">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1C130B] via-[#24170E] to-[#160E08] border border-amber-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>AUDIO KUTUBXONA</span>
                    </div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                      🎧 Sevimli kitoblaringizni tinglang
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 max-w-lg mt-1">
                      Ovozli formatdagi sara kitoblardan rohatlaning.
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePage('audio')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shrink-0"
                  >
                    <span>Barcha audio kitoblar</span>
                    <ArrowRight className="w-4 h-4 text-stone-950" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {audioBooks.map(book => (
                    <div 
                      key={book.id}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-[#130E0A]/90 border border-amber-950/80 hover:border-amber-500/50 hover:bg-[#1E1610] transition-all"
                    >
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-14 h-18 rounded-xl object-cover shadow shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-stone-100 truncate group-hover:text-amber-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                          {book.authorName}
                        </p>
                        <span className="text-[10px] text-amber-400 font-mono block mt-1">
                          ⏱ {book.audioDuration || 'Davomiylik'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const track: AudioTrack = {
                            id: `track-${book.id}`,
                            bookId: book.id,
                            title: book.title,
                            author: book.authorName,
                            coverUrl: book.coverUrl,
                            duration: 1800,
                            narrator: 'Professional suxandon'
                          };
                          playAudio(track);
                        }}
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md hover:scale-110 transition-transform"
                        title="Tinglash"
                      >
                        <Headphones className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
