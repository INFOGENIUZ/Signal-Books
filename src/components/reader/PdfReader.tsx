import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Bookmark, 
  Download, 
  Headphones, 
  Pause, 
  Share2, 
  Check, 
  RotateCcw,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { StorageService } from '../../services/storageService';
import { TelegramService } from '../../services/telegramService';
import { parseGoogleDriveUrl } from '../../utils/googleDrive';
import { AudioTrack } from '../../types';

export const PdfReader: React.FC = () => {
  const { 
    activeReadingBook, 
    activeReadingPage, 
    closeReader, 
    updateReadingProgress,
    favorites,
    toggleFavorite,
    activeAudioTrack,
    isPlayingAudio,
    playAudio,
    togglePlayAudio,
    showToast,
    userId,
    isTelegramWebApp 
  } = useLibrary();

  if (!activeReadingBook) return null;

  const totalPages = Math.max(1, activeReadingBook.pages || 1);
  const isBookFavorite = favorites.includes(activeReadingBook.id);
  const driveInfo = parseGoogleDriveUrl(activeReadingBook.googleDriveUrl || activeReadingBook.pdfUrl);

  // Initialize page from storage if user has read this book before
  const initialSavedPage = useMemo(() => {
    const fromStorage = StorageService.getBookProgress(activeReadingBook.id, userId);
    if (fromStorage && fromStorage > 0) return fromStorage;
    return (activeReadingPage && activeReadingPage > 0) ? activeReadingPage : 1;
  }, [activeReadingBook.id, userId, activeReadingPage]);

  const [page, setPage] = useState<number>(initialSavedPage);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>(String(initialSavedPage));
  const [justBookmarked, setJustBookmarked] = useState<boolean>(false);
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);

  useEffect(() => {
    setLoadTimeout(false);
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeReadingBook.id, page]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Inform user on first load if reading was resumed from a saved page
  useEffect(() => {
    if (initialSavedPage > 1) {
      showToast(`Mutolaa saqlangan ${initialSavedPage}-sahifadan davom ettirilmoqda 📖`, 'info');
    }
  }, [activeReadingBook.id, initialSavedPage]);

  // Keep storage and context synchronized on unmount
  useEffect(() => {
    return () => {
      if (activeReadingBook && page > 0) {
        StorageService.saveBookProgress(activeReadingBook.id, page, userId);
        StorageService.updateReadingProgress(activeReadingBook, page);
      }
    };
  }, [activeReadingBook, page, userId]);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowRight') {
        changePage(page + 1);
      } else if (e.key === 'ArrowLeft') {
        changePage(page - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, page]);

  // Find associated audio track if available
  const hasAudioTrack = Boolean(activeReadingBook.hasAudio || activeReadingBook.audioUrl);
  const firstAudioTrack: AudioTrack | null = hasAudioTrack ? {
    id: `audio-${activeReadingBook.id}`,
    bookId: activeReadingBook.id,
    title: activeReadingBook.title,
    author: activeReadingBook.authorName,
    coverUrl: activeReadingBook.coverUrl,
    duration: 1800,
    narrator: 'Professional suxandon'
  } : null;
  const isCurrentBookAudioPlaying = isPlayingAudio && activeAudioTrack?.bookId === activeReadingBook.id;

  // Determine iframe source URL with page anchor
  let embedPdfUrl = '';
  let downloadPdfUrl = '';

  if (driveInfo.isDrive && driveInfo.fileId) {
    embedPdfUrl = `https://drive.google.com/file/d/${driveInfo.fileId}/preview#page=${page}`;
    downloadPdfUrl = driveInfo.downloadUrl;
  } else if (activeReadingBook.pdfUrl) {
    embedPdfUrl = `${activeReadingBook.pdfUrl}#page=${page}&view=FitH`;
    downloadPdfUrl = activeReadingBook.pdfUrl;
  }

  const externalUrl = driveInfo.viewUrl || driveInfo.previewUrl || (activeReadingBook.googleDriveUrl || (activeReadingBook.pdfUrl && activeReadingBook.pdfUrl !== '#' ? activeReadingBook.pdfUrl : ''));

  // Zoom handlers
  const zoomIn = () => {
    setZoomScale(prev => Math.min(250, prev + 25));
  };

  const zoomOut = () => {
    setZoomScale(prev => Math.max(75, prev - 25));
  };

  const resetZoom = () => {
    setZoomScale(100);
  };

  // Safe page change handler that persists immediately
  const changePage = (newPage: number) => {
    const valid = Math.max(1, Math.min(totalPages, newPage));
    setPage(valid);
    setPageInputValue(String(valid));
    StorageService.saveBookProgress(activeReadingBook.id, valid, userId);
    updateReadingProgress(activeReadingBook, valid);
    TelegramService.hapticImpact('light');
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInputValue.trim(), 10);
    if (!isNaN(num)) {
      changePage(num);
    } else {
      setPageInputValue(String(page));
    }
  };

  // Dedicated Bookmark Handler
  const handleBookmarkCurrentPage = () => {
    StorageService.saveBookProgress(activeReadingBook.id, page, userId);
    updateReadingProgress(activeReadingBook, page);
    TelegramService.hapticSuccess();
    setJustBookmarked(true);
    showToast(`Xatcho‘p qo‘yildi: ${page}-sahifa eslab qolindi ⭐`, 'success');
    setTimeout(() => setJustBookmarked(false), 2500);
  };

  // Safe Close Handler that guarantees last page is never lost
  const handleClose = () => {
    StorageService.saveBookProgress(activeReadingBook.id, page, userId);
    updateReadingProgress(activeReadingBook, page);
    closeReader(page);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Fullscreen error', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Exit fullscreen error', err);
      });
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Kitob havolasi nusxalandi!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAudioCompanionToggle = () => {
    if (!firstAudioTrack) return;
    if (isCurrentBookAudioPlaying) {
      togglePlayAudio();
    } else {
      playAudio(firstAudioTrack);
      showToast(`Audio kitob boshlandi: ${activeReadingBook.title}`, 'info');
    }
  };

  const handleDownload = () => {
    if (downloadPdfUrl) {
      const link = document.createElement('a');
      link.href = downloadPdfUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.download = `${activeReadingBook.slug || 'kitob'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`"${activeReadingBook.title}" yuklab olinmoqda...`, 'success');
    } else {
      showToast('PDF yuklab olish manzili topilmadi', 'error');
    }
  };

  const progressPercent = Math.round((page / totalPages) * 100);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#0B0806] text-stone-100 select-none overflow-hidden"
    >
      {/* Amber Navigation Toolbar */}
      <header className="h-16 px-3 sm:px-6 flex items-center justify-between border-b border-amber-950/80 bg-[#120D08]/95 backdrop-blur-xl z-20 shrink-0 gap-3 shadow-lg">
        {/* Left: Back button & Book Meta */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={handleClose}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-900/60 hover:border-amber-500/50 text-xs font-semibold transition-all shrink-0 hover:scale-[1.02] active:scale-95"
            title="Kutubxonaga qaytish (Sahifa avtomatik saqlanadi)"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Orqaga</span>
          </button>

          <div className="h-6 w-[1px] bg-amber-900/50 hidden sm:block shrink-0" />

          {/* Book Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={activeReadingBook.coverUrl} 
              alt={activeReadingBook.title}
              className="w-8 h-10 rounded-lg object-cover shadow-md border border-amber-500/30 shrink-0 hidden md:block"
            />
            <div className="min-w-0">
              <h1 className="font-serif-title text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {activeReadingBook.title}
              </h1>
              <p className="text-[11px] text-stone-400 truncate flex items-center gap-2">
                <span>{activeReadingBook.authorName}</span>
                <span className="hidden sm:inline text-amber-500/60">•</span>
                <span className="hidden sm:inline text-emerald-400 font-medium">
                  {page}-sahifa eslab qolingan
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Page Tracker & Jumper Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio companion pill (if book has audio tracks) */}
          {hasAudioTrack && (
            <button
              onClick={handleAudioCompanionToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
                isCurrentBookAudioPlaying
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-[0_0_18px_rgba(245,158,11,0.5)] animate-pulse'
                  : 'bg-amber-950/40 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
              title={isCurrentBookAudioPlaying ? "Audioni to‘xtatish" : "Mutolaa jarayonida audioni birga eshitish"}
            >
              {isCurrentBookAudioPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden md:inline">Audio ijroda</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ovozli kitob</span>
                </>
              )}
            </button>
          )}

          {/* Interactive Page Jumper */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#18110B] px-3 py-1.5 rounded-xl border border-amber-900/60 shadow-inner">
            <button
              type="button"
              onClick={() => changePage(page - 10)}
              disabled={page <= 1}
              className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-950/50 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 disabled:opacity-25 transition-colors"
              title="10 sahifa orqaga"
            >
              -10
            </button>

            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Oldingi sahifa"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
              <input 
                type="text"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageInputSubmit}
                className="w-10 text-center bg-black/40 text-amber-300 text-xs font-mono font-bold rounded-md py-0.5 border border-amber-900/60 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs text-stone-500 font-mono">/ {totalPages}</span>
            </form>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Keyingi sahifa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => changePage(page + 10)}
              disabled={page >= totalPages}
              className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-950/50 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 disabled:opacity-25 transition-colors"
              title="10 sahifa oldinga"
            >
              +10
            </button>

            <div className="ml-1 pl-2 border-l border-amber-950/90 text-[10px] font-mono text-amber-400/90 font-bold">
              {progressPercent}%
            </div>
          </div>

          {/* Bookmark Button to manually pin current page */}
          <button
            onClick={handleBookmarkCurrentPage}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              justBookmarked
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
            }`}
            title="Kelgan sahifangizni eslab qolish uchun bosing"
          >
            <Bookmark className={`w-3.5 h-3.5 ${justBookmarked ? 'fill-emerald-400 text-emerald-400' : 'fill-amber-400 text-amber-400'}`} />
            <span className="hidden xs:inline">{justBookmarked ? 'Eslab qolindi!' : `${page}-betni saqlash`}</span>
          </button>
        </div>

        {/* Right Tools: Zoom, Download, Favorite, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#18110B] px-1 py-1 rounded-xl border border-amber-900/60 shadow-inner">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 active:scale-90 transition-all"
              title="Kichiklashtirish (Zoom out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={resetZoom}
              className="text-[11px] font-mono text-amber-300 px-1.5 py-0.5 hover:bg-amber-500/10 rounded font-bold"
              title="Asl o‘lchamga qaytarish (100%)"
            >
              {zoomScale}%
            </button>
            <button 
              onClick={zoomIn}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 active:scale-90 transition-all"
              title="Kattalashtirish (Zoom in)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomScale !== 100 && (
              <button
                onClick={resetZoom}
                className="p-1 rounded-md text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/20 text-[10px]"
                title="100% ga qaytarish"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={() => toggleFavorite(activeReadingBook.id)}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all ${
              isBookFavorite 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                : 'bg-[#18110B] border-amber-900/60 text-stone-400 hover:text-amber-300 hover:bg-amber-500/15'
            }`}
            title={isBookFavorite ? "Sevimli kitoblardan chiqarish" : "Sevimli kitoblarga qo‘shish"}
          >
            <Bookmark className={`w-4 h-4 ${isBookFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18110B] hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-900/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="PDF formatida yuklab olish"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Yuklab olish</span>
          </button>

          {/* External Google Drive / Direct New Window Link */}
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Faylni yangi oynada yoki Google Drive'da ochish"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Yangi oynada ochish</span>
            </a>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#18110B] hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-amber-900/60 transition-colors hidden sm:flex"
            title="Kitob havolasini ulashish"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#18110B] hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-900/60 transition-colors hidden sm:flex"
            title={isFullscreen ? "To‘liq ekrandan chiqish" : "To‘liq ekran"}
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main PDF Canvas */}
      <main className="flex-1 w-full h-[calc(100vh-4rem)] relative bg-[#090705] flex flex-col overflow-hidden">
        {embedPdfUrl ? (
          <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Loading Indicator before iframe settles */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C0907] z-10 text-center p-6 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="absolute -inset-1 rounded-3xl border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100">
                    PDF hujjat yuklanmoqda...
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm">
                    {activeReadingBook.title} — {page}-sahifa ochilmoqda
                  </p>
                </div>

                {/* Fallback prompt if loading takes more than 4 seconds */}
                {loadTimeout && externalUrl && (
                  <div className="pt-3 flex flex-col items-center gap-2 max-w-md animate-fade-in bg-[#18110B] border border-amber-500/30 p-4 rounded-2xl">
                    <p className="text-xs text-amber-200/90 text-center">
                      Agar kitob ekranda yuklanmasa, Google Drive ruxsati tufayli uni to‘g‘ridan-to‘g‘ri yangi oynada ochishingiz mumkin:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Drive'da ochish</span>
                      </a>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-xl bg-[#251A12] hover:bg-[#322318] text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-amber-950"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Yuklab olish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Embedded Zoomable Container with scrollable pan support */}
            <div 
              ref={scrollAreaRef}
              className="w-full h-full overflow-auto flex items-start justify-center"
            >
              <div 
                className="transition-transform duration-200 ease-out origin-top-left flex items-center justify-center shrink-0"
                style={{ 
                  transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
                  transformOrigin: 'top center',
                  width: zoomScale > 100 ? `${zoomScale}%` : '100%',
                  height: zoomScale > 100 ? `${zoomScale}%` : '100%',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
              >
                <iframe
                  src={embedPdfUrl}
                  title={`${activeReadingBook.title} - To'liq PDF`}
                  className="w-full h-full border-0 bg-[#0E0B08]"
                  allow="autoplay; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
            </div>

            {/* Floating Mobile Controls overlay (at bottom for touch ease) */}
            <div className="sm:hidden absolute bottom-4 inset-x-3 z-20 flex flex-col gap-2">
              <div className="flex items-center justify-between bg-[#150F0A]/95 border border-amber-500/40 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-2xl">
                {/* Left: Page Nav with -10, <, >, +10 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changePage(page - 10)}
                    disabled={page <= 1}
                    className="px-1.5 py-1 text-[10px] font-mono rounded bg-amber-950/60 text-stone-400 disabled:opacity-30 active:scale-95"
                    title="10 sahifa orqaga"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-amber-950/60 text-amber-300 disabled:opacity-30 active:scale-95 transition-transform"
                    title="Oldingi bet"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-amber-300 px-1">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg bg-amber-950/60 text-amber-300 disabled:opacity-30 active:scale-95 transition-transform"
                    title="Keyingi bet"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => changePage(page + 10)}
                    disabled={page >= totalPages}
                    className="px-1.5 py-1 text-[10px] font-mono rounded bg-amber-950/60 text-stone-400 disabled:opacity-30 active:scale-95"
                    title="10 sahifa oldinga"
                  >
                    +10
                  </button>
                </div>

                {/* Right: Bookmark current page & Fullscreen */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleBookmarkCurrentPage}
                    className={`p-2 rounded-xl border transition-all active:scale-95 ${
                      justBookmarked
                        ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    }`}
                    title="Hozirgi sahifani eslab qolish"
                  >
                    <Bookmark className={`w-4 h-4 ${justBookmarked ? 'fill-emerald-400' : 'fill-amber-400'}`} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold active:scale-95"
                    title="To‘liq ekran"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback when no PDF link exists */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-300 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-stone-100">
              PDF fayl manzili biriktirilmagan
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ushbu kitob uchun Google Drive yoki to‘g‘ridan-to‘g‘ri PDF havolasi topilmadi. Admin paneli orqali kitob PDF havolasini yangilashingiz mumkin.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-[#1A130D] hover:bg-[#251B13] border border-amber-950 text-stone-200 text-xs font-semibold transition-all"
              >
                Orqaga qaytish
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
