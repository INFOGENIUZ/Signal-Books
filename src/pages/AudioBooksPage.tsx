import React from 'react';
import { Headphones, Play, Clock, Sparkles, Star, Eye } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { AudioTrack } from '../types';

export const AudioBooksPage: React.FC = () => {
  const { books, playAudio, activeAudioTrack, isPlayingAudio, openBookDetails } = useLibrary();

  const audioBooks = books.filter(b => b.hasAudio);

  const handlePlay = (book: typeof books[0]) => {
    const track: AudioTrack = {
      id: `audio-${book.id}`,
      bookId: book.id,
      title: book.title,
      author: book.authorName,
      coverUrl: book.coverUrl,
      duration: 2100,
      narrator: 'Professional suxandon'
    };
    playAudio(track);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#1C130B] to-orange-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider">
            <Headphones className="w-3.5 h-3.5" />
            <span>OVOZLI KUTUBXONA</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
            🎧 Audio kitoblar olami
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Yo‘lda, sport bilan shug‘ullanganda yoki dam olayotganda milliy va jahon adabiyoti durdonalarini tinglang.
          </p>
        </div>
      </div>

      {/* Grid of Audiobooks */}
      {audioBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {audioBooks.map(book => {
            const isCurrentTrack = activeAudioTrack?.bookId === book.id;
            return (
              <div
                key={book.id}
                className={`group flex flex-col rounded-2xl bg-[#18120B]/85 border p-4 transition-all duration-300 hover:shadow-xl ${
                  isCurrentTrack 
                    ? 'border-amber-500/70 bg-[#22180F] shadow-[0_0_25px_rgba(245,158,11,0.25)]' 
                    : 'border-amber-950/80 hover:border-amber-500/40 hover:bg-[#1E1610]'
                }`}
              >
                {/* Cover */}
                <div 
                  onClick={() => openBookDetails(book)}
                  className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-950 mb-3 cursor-pointer shadow-md"
                >
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-amber-300 text-[11px] font-mono backdrop-blur-md border border-amber-500/30 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{book.audioDuration || 'Davomiylik'}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(book);
                    }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isCurrentTrack && isPlayingAudio
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 scale-110 shadow-[0_0_20px_#f59e0b]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 group-hover:scale-110 font-bold'
                    }`}
                    title="Tinglash"
                  >
                    <Play className="w-5 h-5 ml-0.5 fill-current text-stone-950" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-amber-400 font-semibold text-[11px]">{book.categoryName}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{book.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 
                      onClick={() => openBookDetails(book)}
                      className="font-serif-title font-bold text-sm text-stone-100 line-clamp-1 group-hover:text-amber-400 cursor-pointer transition-colors"
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {book.authorName}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-amber-950/80 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{book.views.toLocaleString()}</span>
                    </span>

                    <button
                      onClick={() => handlePlay(book)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isCurrentTrack && isPlayingAudio ? 'Ijro etilmoqda' : 'Tinglash'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#16110C]/80 border border-amber-950/80 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#1E1711] border border-amber-950/60 flex items-center justify-center mx-auto mb-4 text-3xl">
            🎧
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100">Hozircha audio kitoblar mavjud emas</h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Kutubxonaga audio formatdagi yangi kitoblar yuklanganda ushbu sahifada avtomatik aks etadi.
          </p>
        </div>
      )}
    </div>
  );
};
