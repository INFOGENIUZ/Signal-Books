import React from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  AudioLines, 
  ChevronRight,
  BookText,
  Pause
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { FeaturedBookCard } from '../components/books/FeaturedBookCard';
import { BookCard } from '../components/books/BookCard';
import { BookShowcaseSlider } from '../components/home/BookShowcaseSlider';
import { HeroSearchBar } from '../components/home/HeroSearchBar';
import { Book, AudioTrack } from '../types';
import { Icon3D } from '../components/common/Icon3D';
import { isBookNew } from '../utils/bookUtils';

export const HomePage: React.FC = () => {
  const { 
    books, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    setActivePage, 
    setSelectedCategoryFilter,
    playAudio,
    togglePlayAudio,
    activeAudioTrack,
    isPlayingAudio,
    isAdmin 
  } = useLibrary();

  // Featured books
  const featuredBooks = books.filter(b => b.isFeatured).slice(0, 4);
  // New books (uploaded within the last 24 hours)
  const newBooks = books.filter(b => isBookNew(b)).slice(0, 6);
  // Audio books
  const audioBooks = books.filter(b => b.hasAudio).slice(0, 4);
  // Top Categories (first 8)
  const popularCategories = categories.slice(0, 8);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8 overflow-hidden">
        {/* Ambient Glowing Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Main Heading */}
          <h1 className="font-serif-title text-3xl sm:text-5xl md:text-6xl font-extrabold text-stone-100 tracking-tight leading-[1.18] mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]">
              Signal Books
            </span>{' '}
            kutubxonasi
          </h1>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Elektron kitoblar, darsliklar va audio asarlar to‘plami
          </p>

          {/* Creative Large Search Bar with Live Suggestions & Quick Tags */}
          <HeroSearchBar />
        </div>
      </section>

      {/* Dynamic Animated Book Showcase Slider (Auto-slides every 3-4s, gesture drag/swipe) */}
      {books.length > 0 && (
        <div className="pt-6 sm:pt-10 md:pt-12">
          <BookShowcaseSlider books={books} />
        </div>
      )}

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
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Eng sara to‘plam</span>
                  </div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                    Mashhur kitoblar
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
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Yangi nashrlar</span>
                  </div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                    Yangi qo‘shilgan kitoblar
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
                      <AudioLines className="w-3.5 h-3.5" />
                      <span>AUDIO KUTUBXONA</span>
                    </div>
                    <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                      Sevimli kitoblaringizni tinglang
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
                        src={book.coverUrl || undefined} 
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
                          if (activeAudioTrack?.bookId === book.id) {
                            togglePlayAudio();
                            return;
                          }
                          let estSec = 0;
                          if (book.audioDuration) {
                            const hrs = book.audioDuration.match(/(\d+)\s*soat/);
                            const mins = book.audioDuration.match(/(\d+)\s*daq/);
                            if (hrs && hrs[1]) estSec += parseInt(hrs[1]) * 3600;
                            if (mins && mins[1]) estSec += parseInt(mins[1]) * 60;
                          }
                          const track: AudioTrack = {
                            id: `track-${book.id}`,
                            bookId: book.id,
                            title: book.title,
                            author: book.authorName,
                            coverUrl: book.coverUrl,
                            duration: estSec,
                            audioSrc: book.audioUrl || book.googleDriveUrl,
                            narrator: book.narrator?.trim() && book.narrator !== 'Professional suxandon' ? book.narrator : undefined
                          };
                          playAudio(track);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md hover:scale-110 transition-transform cursor-pointer ${
                          activeAudioTrack?.bookId === book.id && isPlayingAudio
                            ? 'bg-amber-400 text-stone-950 shadow-[0_0_12px_#f59e0b]'
                            : 'bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950'
                        }`}
                        title={activeAudioTrack?.bookId === book.id && isPlayingAudio ? "Pauza" : "Tinglash"}
                      >
                        {activeAudioTrack?.bookId === book.id && isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <AudioLines className="w-4 h-4" />
                        )}
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
