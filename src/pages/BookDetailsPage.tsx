import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  Bookmark, 
  Star, 
  Eye, 
  Headphones, 
  Calendar, 
  FileText, 
  Languages, 
  HardDrive, 
  ShieldCheck, 
  Share2,
  CheckCircle2,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { TelegramService } from '../services/telegramService';
import { BookCard } from '../components/books/BookCard';
import { AudioTrack } from '../types';
import { parseGoogleDriveUrl } from '../utils/googleDrive';

export const BookDetailsPage: React.FC = () => {
  const { 
    selectedBook, 
    setActivePage, 
    startReading, 
    favorites, 
    toggleFavorite, 
    playAudio,
    books, 
    showToast,
    isAdmin,
    deleteBook
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'about' | 'chapters' | 'author'>('about');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!selectedBook) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Kitob tanlanmadi.</p>
        <button
          onClick={() => setActivePage('books')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold shadow-md transition-all"
        >
          Kitoblar ro‘yxatiga qaytish
        </button>
      </div>
    );
  }

  const isFav = favorites.includes(selectedBook.id);
  const driveInfo = parseGoogleDriveUrl(selectedBook.googleDriveUrl || selectedBook.pdfUrl);

  // Sync Telegram native MainButton
  React.useEffect(() => {
    TelegramService.setMainButton({
      show: true,
      text: "Kitobni o'qish (PDF)",
      color: '#F59E0B',
      onClick: () => startReading(selectedBook)
    });

    return () => {
      TelegramService.setMainButton({ show: false });
    };
  }, [selectedBook.id]);

  // Related books
  const relatedBooks = books
    .filter(b => b.id !== selectedBook.id && (b.categoryId === selectedBook.categoryId || b.authorId === selectedBook.authorId))
    .slice(0, 4);

  const handleDownload = () => {
    setIsDownloading(true);
    showToast(`"${selectedBook.title}" PDF fayli yuklanmoqda...`, 'info');
    setTimeout(() => {
      setIsDownloading(false);
      const element = document.createElement('a');
      if (driveInfo.isDrive && driveInfo.fileId) {
        element.href = `/api/drive-pdf?id=${driveInfo.fileId}&download=true&filename=${encodeURIComponent(selectedBook.title + '.pdf')}`;
      } else if (selectedBook.pdfUrl) {
        const checkDrive = parseGoogleDriveUrl(selectedBook.pdfUrl);
        if (checkDrive.isDrive && checkDrive.fileId) {
          element.href = `/api/drive-pdf?id=${checkDrive.fileId}&download=true&filename=${encodeURIComponent(selectedBook.title + '.pdf')}`;
        } else {
          element.href = selectedBook.pdfUrl;
        }
      } else {
        const file = new Blob([`Kitob: ${selectedBook.title}\nMuallif: ${selectedBook.authorName}\nSignal Books raqamli kutubxonasi tomonidan taqdim etildi.`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
      }
      element.download = `${selectedBook.slug || 'kitob'}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`"${selectedBook.title}" yuklab olindi!`, 'success');
    }, 600);
  };

  const handlePlayAudio = () => {
    const track: AudioTrack = {
      id: `audio-${selectedBook.id}`,
      bookId: selectedBook.id,
      title: selectedBook.title,
      author: selectedBook.authorName,
      coverUrl: selectedBook.coverUrl,
      duration: 1800,
      audioSrc: selectedBook.audioUrl,
      narrator: selectedBook.narrator || 'Professional suxandon'
    };
    playAudio(track);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => setActivePage('books')}
        className="flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kutubxonaga qaytish</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT: Book Cover (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-500/30 group">
            <img
              src={selectedBook.coverUrl}
              alt={selectedBook.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {selectedBook.hasAudio && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio mavjud</span>
              </div>
            )}

            <button
              onClick={() => toggleFavorite(selectedBook.id)}
              className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all ${
                isFav 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title={isFav ? "Sevimlilardan o‘chirish" : "Sevimlilarga qo‘shish"}
            >
              <Bookmark className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* RIGHT: Metadata & Actions (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category & Rating */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              {selectedBook.categoryName}
            </span>

            {driveInfo.isDrive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Drive bazasida</span>
              </span>
            )}

            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-[#1A130E] px-3 py-1 rounded-full border border-amber-950/80">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{selectedBook.rating.toFixed(2)}</span>
              <span className="text-stone-500 font-normal">({selectedBook.ratingsCount} sharh)</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-[#1A130E] px-3 py-1 rounded-full border border-amber-950/80">
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>{selectedBook.views.toLocaleString()} marta ko‘rilgan</span>
            </div>
          </div>

          {/* Title & Author */}
          <div className="space-y-2">
            <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
              {selectedBook.title}
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-medium">
              Muallif: <span className="text-amber-400 hover:underline cursor-pointer">{selectedBook.authorName}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => startReading(selectedBook)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-sm font-bold flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-5 h-5 text-stone-950" />
              <span>PDF mutolaa qilish</span>
            </button>

            {selectedBook.hasAudio && (
              <button
                onClick={handlePlayAudio}
                className="px-5 py-3.5 rounded-2xl bg-[#1C140E] hover:bg-[#251B13] text-amber-300 border border-amber-500/30 text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Audioni tinglash</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-3.5 rounded-2xl bg-[#1C140E] hover:bg-[#251B13] text-stone-200 border border-amber-950/80 hover:border-amber-500/40 text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isDownloading ? 'Yuklanmoqda...' : 'PDF yuklab olish'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(selectedBook.id)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isFav 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-[#1C140E] text-stone-300 border-amber-950/80 hover:text-white'
              }`}
              title="Sevimlilarga saqlash"
            >
              <Bookmark className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-2 text-sm font-semibold"
                title="Kitobni o‘chirish"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Kitobni o‘chirish</span>
              </button>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#18120C]/90 border border-amber-950/80 text-xs">
            <div className="space-y-0.5">
              <span className="text-stone-500 block">Til</span>
              <span className="font-semibold text-stone-200 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                {selectedBook.language}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-stone-500 block">Sahifalar soni</span>
              <span className="font-semibold text-stone-200 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                {selectedBook.pages} bet
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-stone-500 block">Nashr yili</span>
              <span className="font-semibold text-stone-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {selectedBook.publicationYear}-yil
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-stone-500 block">Fayl hajmi</span>
              <span className="font-semibold text-stone-200 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                {selectedBook.fileSize}
              </span>
            </div>
          </div>

          {/* Tabs for Description & Chapters */}
          <div className="pt-2">
            <div className="flex border-b border-amber-950/80 text-xs font-bold uppercase tracking-wider mb-4">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 px-4 transition-colors relative ${
                  activeTab === 'about'
                    ? 'text-amber-400'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Kitob haqida
                {activeTab === 'about' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('chapters')}
                className={`pb-3 px-4 transition-colors relative ${
                  activeTab === 'chapters'
                    ? 'text-amber-400'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Mundarija ({selectedBook.chapters?.length || 0})
                {activeTab === 'chapters' && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>
            </div>

            {activeTab === 'about' ? (
              <div className="space-y-4 text-sm text-stone-300 leading-relaxed">
                <p>{selectedBook.description}</p>
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-stone-300 space-y-1">
                  <div className="font-bold text-stone-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Rasmiy sertifikatlangan nashr</span>
                  </div>
                  <p className="text-stone-400">
                    ISBN: {selectedBook.isbn} • Ushbu asar mualliflik huquqlari va adabiy me’yorlar asosida raqamlashtirilgan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedBook.chapters?.map((ch) => (
                  <div 
                    key={ch.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#18120C]/80 border border-amber-950/80 text-xs text-stone-300"
                  >
                    <span>{ch.title}</span>
                    <span className="font-mono text-stone-500">{ch.pageNumber}-bet</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Books: “📚 Sizga ham yoqishi mumkin” */}
      {relatedBooks.length > 0 && (
        <section className="pt-8 border-t border-amber-950/80 space-y-6">
          <div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
              📚 Sizga ham yoqishi mumkin
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Ushbu yo‘nalishdagi o‘xshash sara adabiyotlar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Admin Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18110B] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-stone-100">Kitobni butunlay o‘chirish</h3>
            </div>
            <p className="text-sm text-stone-300">
              Haqiqatan ham «<span className="font-semibold text-white">{selectedBook.title}</span>» kitobini butunlay o‘chirmoqchimisiz? Ushbu amal kutubxona va bulutdan kitobni o‘chiradi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#221810] text-stone-300 text-xs font-semibold hover:bg-[#2A1E14] transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  const idToDelete = selectedBook.id;
                  setShowDeleteModal(false);
                  await deleteBook(idToDelete);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                Ha, o‘chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
