import React, { useState, useMemo } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Clock, 
  Star, 
  Eye, 
  Search, 
  Mic2, 
  ExternalLink,
  SlidersHorizontal,
  X,
  Volume2
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { AudioTrack, Book } from '../types';
import { parseGoogleDriveUrl } from '../utils/googleDrive';

export const AudioBooksPage: React.FC = () => {
  const { 
    books, 
    categories, 
    playAudio, 
    togglePlayAudio, 
    activeAudioTrack, 
    isPlayingAudio, 
    openBookDetails,
    isAdmin,
    setActivePage
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'views'>('newest');
  const [driveEmbedBook, setDriveEmbedBook] = useState<Book | null>(null);

  // Only real audiobooks added to the library (no mock or curated SoundHelix placeholders)
  const allAudioBooks = useMemo(() => {
    return books.filter(b => b.hasAudio && (b.audioUrl || b.googleDriveUrl));
  }, [books]);

  // Filtered & sorted audiobooks
  const filteredBooks = useMemo(() => {
    let result = [...allAudioBooks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        (b.narrator && b.narrator.toLowerCase().includes(q)) ||
        b.categoryName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(b => b.categoryId === selectedCategory);
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else {
      // newest
      result.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0));
    }

    return result;
  }, [allAudioBooks, searchQuery, selectedCategory, sortBy]);

  // Handle Play/Pause
  const handlePlayToggle = (book: Book) => {
    if (activeAudioTrack?.bookId === book.id) {
      togglePlayAudio();
      return;
    }

    // Parse audio duration into seconds if available
    let estimatedSec = 0;
    if (book.audioDuration) {
      const hrs = book.audioDuration.match(/(\d+)\s*soat/);
      const mins = book.audioDuration.match(/(\d+)\s*daq/);
      let totalSec = 0;
      if (hrs && hrs[1]) totalSec += parseInt(hrs[1]) * 3600;
      if (mins && mins[1]) totalSec += parseInt(mins[1]) * 60;
      if (totalSec > 0) estimatedSec = totalSec;
    }

    const track: AudioTrack = {
      id: `audio-${book.id}`,
      bookId: book.id,
      title: book.title,
      author: book.authorName,
      coverUrl: book.coverUrl,
      duration: estimatedSec,
      audioSrc: book.audioUrl || book.googleDriveUrl,
      narrator: book.narrator?.trim() && book.narrator !== 'Professional suxandon' ? book.narrator : undefined
    };
    playAudio(track);
  };

  // Categories with audiobooks
  const categoriesWithAudio = useMemo(() => {
    const set = new Set(allAudioBooks.map(b => b.categoryId));
    return categories.filter(c => set.has(c.id));
  }, [categories, allAudioBooks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-amber-950">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Audio kitob, muallif yoki suxandon nomi..."
            className="w-full bg-[#140F0B] border border-amber-900/40 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-400">
          <span>Jami: <strong className="text-amber-400 font-mono">{filteredBooks.length}</strong> ta audio kitob</span>

          <div className="flex items-center gap-1.5 bg-[#140F0B] border border-amber-900/40 rounded-xl px-2.5 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-300 focus:outline-none text-xs cursor-pointer"
            >
              <option value="newest" className="bg-stone-900">Eng yangi</option>
              <option value="rating" className="bg-stone-900">Yuqori reyting</option>
              <option value="views" className="bg-stone-900">Eng ko‘p tinglangan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      {categoriesWithAudio.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-[#140F0B] text-stone-400 hover:text-stone-200 border border-amber-950'
            }`}
          >
            Barchasi ({allAudioBooks.length})
          </button>
          {categoriesWithAudio.map(cat => {
            const count = allAudioBooks.filter(b => b.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#140F0B] text-stone-400 hover:text-stone-200 border border-amber-950'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 3. AUDIOBOOKS GRID (SQUARE 1:1 LUXURY COVERS) */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => {
            const isCurrent = activeAudioTrack?.bookId === book.id;
            const isPlayingThis = isCurrent && isPlayingAudio;
            const driveInfo = parseGoogleDriveUrl(book.googleDriveUrl || book.audioUrl || '');

            return (
              <div
                key={book.id}
                className={`group flex flex-col rounded-2xl bg-[#140F0B] border p-4 transition-all duration-300 hover:shadow-2xl ${
                  isCurrent 
                    ? 'border-amber-500/70 bg-[#1A120C] shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30' 
                    : 'border-amber-950/70 hover:border-amber-500/30 hover:bg-[#18110B]'
                }`}
              >
                {/* 1:1 Square Cover with Vinyl Effect */}
                <div 
                  onClick={() => openBookDetails(book)}
                  className="relative w-full aspect-square rounded-xl overflow-hidden bg-black mb-3.5 cursor-pointer shadow-lg group-hover:shadow-2xl transition-shadow"
                >
                  <img 
                    src={book.coverUrl || undefined} 
                    alt={book.title} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isPlayingThis ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  />
                  
                  {/* Subtle Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90" />

                  {/* Duration Tag */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/80 text-amber-300 text-[11px] font-mono backdrop-blur-sm border border-amber-500/30 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{book.audioDuration || 'Audio'}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayToggle(book);
                    }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isPlayingThis
                        ? 'bg-amber-400 text-stone-950 scale-110 shadow-[0_0_20px_#f59e0b]'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 group-hover:scale-110 font-bold'
                    }`}
                    title={isPlayingThis ? "Pauza" : "Tinglash"}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    )}
                  </button>

                  {/* Live Equalizer indicator when playing */}
                  {isPlayingThis && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-black/80 border border-amber-500/40 flex items-center gap-1 text-[10px] text-amber-400 font-semibold backdrop-blur-sm">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      <span>Ijro</span>
                    </div>
                  )}
                </div>

                {/* Audiobook Information */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-amber-400/90 font-medium text-[11px] truncate max-w-[140px]">{book.categoryName}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{book.rating ? book.rating.toFixed(1) : '5.0'}</span>
                      </div>
                    </div>

                    <h3 
                      onClick={() => openBookDetails(book)}
                      className="font-serif-title font-bold text-sm text-stone-100 line-clamp-1 group-hover:text-amber-300 cursor-pointer transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {book.authorName}
                    </p>

                    {/* Suxandon / Narrator */}
                    {book.narrator && book.narrator.trim() !== '' && book.narrator !== 'Professional suxandon' && book.narrator !== 'Professional ovoz' && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1.5">
                        <Mic2 className="w-3 h-3 text-amber-400/80 shrink-0" />
                        <span className="line-clamp-1">
                          Suxandon: <strong className="text-stone-300 font-normal">{book.narrator}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2.5 border-t border-amber-950/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{(book.views || 0).toLocaleString()}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayToggle(book)}
                        className={`text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isPlayingThis ? 'text-amber-300 font-bold' : 'text-amber-400 hover:text-amber-300'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{isPlayingThis ? 'Pauza' : 'Tinglash'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#140F0B] border border-amber-950 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl">
            <Headphones className="w-8 h-8" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100">
            {searchQuery ? 'Hech qanday audio kitob topilmadi' : 'Hozircha audio kitoblar mavjud emas'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            {searchQuery 
              ? 'Qidiruv so‘zini o‘zgartirib ko‘ring yoki barcha kategoriyalarni tanlang.'
              : 'Admin panel orqali yangi audio kitoblar yuklanganda ular ushbu sahifada avtomatik aks etadi.'}
          </p>
          {isAdmin && !searchQuery && (
            <div className="pt-2">
              <button
                onClick={() => setActivePage('admin')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                👑 Admin panelga o‘tish va Audio kitob yuklash
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. GOOGLE DRIVE EMBED MODAL FOR SPECIFIC BOOK */}
      {driveEmbedBook && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#140E0A] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-serif-title text-base font-bold text-stone-100 line-clamp-1">
                    {driveEmbedBook.title}
                  </h3>
                  <p className="text-xs text-stone-400">Google Drive rasmiy audio oqimi</p>
                </div>
              </div>
              <button
                onClick={() => setDriveEmbedBook(null)}
                className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800">
              {(() => {
                const info = parseGoogleDriveUrl(driveEmbedBook.googleDriveUrl || driveEmbedBook.audioUrl || '');
                return info.fileId ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${info.fileId}/preview`}
                    className="w-full h-full"
                    allow="autoplay"
                    title={driveEmbedBook.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400 text-xs">
                    Google Drive havolasi topilmadi
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Rasmiy Google Drive pleyeri</span>
              <button
                onClick={() => setDriveEmbedBook(null)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
