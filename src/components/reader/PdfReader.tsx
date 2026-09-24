import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Bookmark, 
  Download, 
  Headphones, 
  Pause, 
  Play,
  Share2, 
  Check, 
  RotateCcw,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Compass,
  Clock,
  Keyboard,
  X,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { StorageService } from '../../services/storageService';
import { TelegramService } from '../../services/telegramService';
import { parseGoogleDriveUrl } from '../../utils/googleDrive';
import { AudioTrack } from '../../types';

type ReaderAmbianceTheme = 'obsidian' | 'sepia' | 'oled';

export const PdfReader: React.FC = () => {
  const { 
    activeReadingBook, 
    activeReadingPage, 
    closeReader, 
    setActivePage,
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

  // Core State - always starts from page 1
  const [page, setPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  const [justBookmarked, setJustBookmarked] = useState<boolean>(false);
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);

  // Creative Modern Features:
  // 1. Reading Ambiance Theme
  const [ambianceTheme, setAmbianceTheme] = useState<ReaderAmbianceTheme>('obsidian');
  // 2. Eye Comfort Filter (Night blue light relief)
  const [isEyeComfort, setIsEyeComfort] = useState<boolean>(false);
  // 3. Focus Mode (Distraction-Free Immersion)
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  // 4. Live Reading Session Timer (minutes)
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  // 5. Quick Page Scrubber Slider Popover
  const [showScrubber, setShowScrubber] = useState<boolean>(false);
  // 6. Keyboard Shortcuts Help Modal
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Synchronize state when book changes (always page 1)
  useEffect(() => {
    setPage(1);
    setPageInputValue('1');
  }, [activeReadingBook.id]);

  // Loading timeout tracker: only triggered once per book, NOT on every page turn!
  useEffect(() => {
    setLoadTimeout(false);
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeReadingBook.id]);

  // Session Minutes Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if an input is active
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else if (isFocusMode) {
          setIsFocusMode(false);
        } else if (isFullscreen) {
          exitFullscreen();
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'PageDown') {
        changePage(page + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'PageUp') {
        changePage(page - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsFocusMode(prev => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        handleBookmarkCurrentPage();
      } else if (e.key === '?') {
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, page, isFocusMode, showShortcuts]);

  // Find associated audio track if available
  const hasAudioTrack = Boolean(activeReadingBook.hasAudio || activeReadingBook.audioUrl);
  const firstAudioTrack: AudioTrack | null = hasAudioTrack ? {
    id: `audio-${activeReadingBook.id}`,
    bookId: activeReadingBook.id,
    title: activeReadingBook.title,
    author: activeReadingBook.authorName,
    coverUrl: activeReadingBook.coverUrl,
    duration: 0,
    audioSrc: activeReadingBook.audioUrl || activeReadingBook.googleDriveUrl,
    narrator: activeReadingBook.narrator?.trim() && activeReadingBook.narrator !== 'Professional suxandon' ? activeReadingBook.narrator : undefined
  } : null;
  const isCurrentBookAudioPlaying = isPlayingAudio && activeAudioTrack?.bookId === activeReadingBook.id;

  // Determine iframe source URL
  let embedPdfUrl = '';
  let downloadPdfUrl = '';

  if (driveInfo.isDrive && driveInfo.fileId) {
    embedPdfUrl = `https://drive.google.com/file/d/${driveInfo.fileId}/preview`;
    downloadPdfUrl = `/api/drive-pdf?id=${driveInfo.fileId}&download=true&filename=${encodeURIComponent(activeReadingBook.title + '.pdf')}`;
  } else if (activeReadingBook.pdfUrl) {
    const checkDrive = parseGoogleDriveUrl(activeReadingBook.pdfUrl);
    if (checkDrive.isDrive && checkDrive.fileId) {
      embedPdfUrl = `https://drive.google.com/file/d/${checkDrive.fileId}/preview`;
      downloadPdfUrl = `/api/drive-pdf?id=${checkDrive.fileId}&download=true&filename=${encodeURIComponent(activeReadingBook.title + '.pdf')}`;
    } else {
      embedPdfUrl = `${activeReadingBook.pdfUrl}#page=${page}&view=FitH`;
      downloadPdfUrl = activeReadingBook.pdfUrl;
    }
  }

  // Visual ambiance & Eye comfort filter
  const ambianceFilter = useMemo(() => {
    let filter = '';
    if (ambianceTheme === 'sepia') {
      filter += 'sepia(0.35) contrast(0.96) brightness(0.95) ';
    } else if (ambianceTheme === 'oled') {
      filter += 'contrast(1.06) brightness(0.92) ';
    }
    if (isEyeComfort) {
      filter += 'sepia(0.28) hue-rotate(-10deg) brightness(0.92) ';
    }
    return filter.trim() || undefined;
  }, [ambianceTheme, isEyeComfort]);

  // Zoom handlers - exactly 1% per click as requested: "har bosilganda 1%dan yaqinlashtirsin pdfni"
  const zoomIn = useCallback((delta = 1) => {
    setZoomScale(prev => Math.min(300, prev + delta));
    TelegramService.hapticImpact('light');
  }, []);

  const zoomOut = useCallback((delta = 1) => {
    setZoomScale(prev => Math.max(50, prev - delta));
    TelegramService.hapticImpact('light');
  }, []);

  const resetZoom = useCallback(() => {
    setZoomScale(100);
    TelegramService.hapticImpact('medium');
    showToast('Masshtab 100% ga qaytarildi', 'info');
  }, [showToast]);

  // Hold-to-zoom interval timer for smooth continuous 1% zooming when button is held
  const zoomHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const zoomHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopZoomHold = useCallback(() => {
    if (zoomHoldTimeoutRef.current) {
      clearTimeout(zoomHoldTimeoutRef.current);
      zoomHoldTimeoutRef.current = null;
    }
    if (zoomHoldIntervalRef.current) {
      clearInterval(zoomHoldIntervalRef.current);
      zoomHoldIntervalRef.current = null;
    }
  }, []);

  const startZoomHold = useCallback((direction: 'in' | 'out') => {
    stopZoomHold();
    zoomHoldTimeoutRef.current = setTimeout(() => {
      zoomHoldIntervalRef.current = setInterval(() => {
        if (direction === 'in') {
          setZoomScale(prev => Math.min(300, prev + 1));
        } else {
          setZoomScale(prev => Math.max(50, prev - 1));
        }
      }, 40);
    }, 220);
  }, [stopZoomHold]);

  useEffect(() => {
    return () => stopZoomHold();
  }, [stopZoomHold]);

  // Safe page change handler
  const changePage = (newPage: number) => {
    const valid = Math.max(1, Math.min(totalPages, newPage));
    setPage(valid);
    setPageInputValue(String(valid));
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
    TelegramService.hapticSuccess();
    setJustBookmarked(true);
    showToast(`${page}-sahifa belgilandi 🔖`, 'success');
    setTimeout(() => setJustBookmarked(false), 2500);
  };

  // Safe Close Handler - guarantees complete exit back to main library
  const handleClose = () => {
    TelegramService.hapticSelection();
    closeReader();
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Background Ambiance Themes mapping
  const themeBgClasses: Record<ReaderAmbianceTheme, { container: string; canvas: string; header: string; iframeBg: string }> = {
    obsidian: {
      container: 'bg-[#0B0806]',
      canvas: 'bg-[#090705]',
      header: 'bg-[#140E0A]/95 border-amber-950/80',
      iframeBg: '#0E0B08'
    },
    sepia: {
      container: 'bg-[#1C1611]',
      canvas: 'bg-[#18120D]',
      header: 'bg-[#221A13]/95 border-amber-900/60',
      iframeBg: '#1A140F'
    },
    oled: {
      container: 'bg-black',
      canvas: 'bg-black',
      header: 'bg-[#0A0A0A]/95 border-stone-800/80',
      iframeBg: '#000000'
    }
  };

  const currentThemeStyles = themeBgClasses[ambianceTheme];

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${currentThemeStyles.container} text-stone-100 select-none overflow-hidden transition-colors duration-500`}
    >
      {/* 1. TOP CREATIVE HUD TOOLBAR (Collapsible in Focus Mode) */}
      {!isFocusMode && (
        <header className={`h-16 px-3 sm:px-6 flex items-center justify-between border-b ${currentThemeStyles.header} backdrop-blur-2xl z-30 shrink-0 gap-2 sm:gap-3 shadow-xl transition-all duration-300 relative`}>
          {/* Left: Back button & Book Metadata */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={handleClose}
              className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all shrink-0 hover:scale-[1.03] active:scale-95 cursor-pointer font-heading"
              title="Asosiy menyuga qaytish"
            >
              <ArrowLeft className="w-4 h-4 text-stone-950 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
              <span className="inline font-bold">Chiqish</span>
            </button>

            <div className="h-6 w-[1px] bg-amber-900/40 hidden sm:block shrink-0" />

            {/* Book Info Pill */}
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={activeReadingBook.coverUrl || undefined} 
                alt={activeReadingBook.title}
                className="w-8 h-10 rounded-lg object-cover shadow-md border border-amber-500/30 shrink-0 hidden md:block"
              />
              <div className="min-w-0">
                <h1 className="font-serif-title text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                  {activeReadingBook.title}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-stone-400 truncate">
                  <span className="truncate">{activeReadingBook.authorName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Audio Companion (if available) */}
          {hasAudioTrack && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAudioCompanionToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
                  isCurrentBookAudioPlaying
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-[0_0_18px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50'
                    : 'bg-amber-950/40 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
                title={isCurrentBookAudioPlaying ? "Ovozli mutolaani to‘xtatish" : "Mutolaa jarayonida audioni birga tinglash"}
              >
                {isCurrentBookAudioPlaying ? (
                  <>
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 bg-stone-950 rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
                      <span className="w-0.5 bg-stone-950 rounded-full animate-[bounce_1s_infinite_300ms] h-2/3" />
                      <span className="w-0.5 bg-stone-950 rounded-full animate-[bounce_1s_infinite_200ms] h-4/5" />
                    </div>
                    <span className="hidden md:inline">Audio ijroda</span>
                  </>
                ) : (
                  <>
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">Ovozli kitob</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Right Tools: Focus Mode, Zoom, Download, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Focus Mode (Distraction-free toggle) */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-[#18110B]/90 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-amber-900/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Sokin / Fokus rejimi (Barcha tugmalarni yashirish)"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Fokus</span>
            </button>

            {/* Desktop Zoom controls (1% precision) */}
            <div className="hidden md:flex items-center gap-1 bg-[#18110B]/90 px-1 py-1 rounded-xl border border-amber-900/60 shadow-inner">
              <button
                type="button"
                onClick={() => zoomOut(1)}
                onMouseDown={() => startZoomHold('out')}
                onMouseUp={stopZoomHold}
                onMouseLeave={stopZoomHold}
                className="p-1.5 rounded-lg hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 active:scale-90 transition-all select-none"
                title="Kichiklashtirish (-1%)"
                aria-label="Kichiklashtirish (-1%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={resetZoom}
                className="text-[11px] font-mono text-amber-300 px-1.5 py-0.5 hover:bg-amber-500/10 rounded font-bold min-w-[46px] text-center transition-colors"
                title="Asl o‘lchamga qaytarish (100%)"
              >
                {zoomScale}%
              </button>
              <button 
                type="button"
                onClick={() => zoomIn(1)}
                onMouseDown={() => startZoomHold('in')}
                onMouseUp={stopZoomHold}
                onMouseLeave={stopZoomHold}
                className="p-1.5 rounded-lg hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 active:scale-90 transition-all select-none"
                title="Kattalashtirish (+1%)"
                aria-label="Kattalashtirish (+1%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Favorite Toggle */}
            <button
              onClick={() => toggleFavorite(activeReadingBook.id)}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all ${
                isBookFavorite 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                  : 'bg-[#18110B]/90 border-amber-900/60 text-stone-400 hover:text-amber-300 hover:bg-amber-500/15'
              }`}
              title={isBookFavorite ? "Sevimli kitoblardan chiqarish" : "Sevimli kitoblarga qo‘shish"}
            >
              <Bookmark className={`w-4 h-4 ${isBookFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Download PDF button */}
            <button
              onClick={handleDownload}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#18110B]/90 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-900/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="PDF faylni qurilmaga yuklab olish"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Yuklab olish</span>
            </button>

            {/* Keyboard Shortcuts Sheet */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-xl bg-[#18110B]/90 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-amber-900/60 transition-colors hidden sm:flex"
              title="Klaviatura tugmalari (Hotkeys)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#18110B]/90 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-amber-900/60 transition-colors hidden sm:flex"
              title={isFullscreen ? "To‘liq ekrandan chiqish" : "To‘liq ekran rejimi"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </header>
      )}

      {/* 3. MAIN PDF VIEWER CANVAS */}
      <main className={`flex-1 w-full relative ${currentThemeStyles.canvas} flex flex-col overflow-hidden transition-colors duration-500`}>
        {embedPdfUrl ? (
          <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Elegant Modern Book Loading Indicator */}
            {!iframeLoaded && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${currentThemeStyles.canvas} z-10 text-center p-6 space-y-5 select-none`}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
                    <FileText className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="absolute -inset-1.5 rounded-3xl border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif-title text-lg sm:text-xl font-bold text-stone-100 tracking-tight">
                    {activeReadingBook.title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-mono">
                    <span>{page}-sahifa ochilmoqda</span>
                    <span>•</span>
                    <span>{progressPercent}%</span>
                  </div>
                </div>

                {/* Helpful fallback if network or embedding takes longer than 4.5 seconds */}
                {loadTimeout && (
                  <div className="pt-2 flex flex-col items-center gap-2.5 max-w-md animate-fade-in bg-[#18110B]/90 border border-amber-500/30 p-4 rounded-2xl shadow-xl">
                    <p className="text-xs text-amber-200/90 text-center leading-relaxed">
                      Agar sahifa yuklanishi odatdagidan sekin kechayotgan bo‘lsa, qayta yuklashingiz yoki to‘g‘ridan-to‘g‘ri yuklab olishingiz mumkin:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIframeLoaded(false);
                          setLoadTimeout(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Qayta yuklash</span>
                      </button>
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

            {/* Embedded Zoomable Iframe Container */}
            <div 
              ref={scrollAreaRef}
              className="w-full h-full overflow-auto flex items-start justify-center select-none"
            >
              <div 
                className="transition-transform duration-100 ease-out origin-top flex items-center justify-center shrink-0 w-full h-full"
                style={{ 
                  transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
                  transformOrigin: 'top center',
                  width: '100%',
                  height: '100%',
                  minWidth: zoomScale > 100 ? `${zoomScale}%` : '100%',
                  minHeight: zoomScale > 100 ? `${zoomScale}%` : '100%'
                }}
              >
                <div 
                  className="w-full h-full relative"
                  style={{ 
                    backgroundColor: currentThemeStyles.iframeBg,
                    filter: ambianceFilter 
                  }}
                >
                  <iframe
                    key={activeReadingBook.id}
                    src={embedPdfUrl || undefined}
                    title={`${activeReadingBook.title} - To'liq PDF`}
                    className="w-full h-full border-0"
                    style={{
                      backgroundColor: currentThemeStyles.iframeBg,
                    }}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    allow="autoplay; fullscreen"
                    referrerPolicy="no-referrer"
                    onLoad={() => setIframeLoaded(true)}
                  />

                  {/* Shield over Google Drive's top-right pop-out button to block accidental external redirects */}
                  {driveInfo.isDrive && (
                    <div 
                      className="absolute top-0 right-0 w-28 h-16 z-20 pointer-events-auto cursor-default" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      title="Kitob mutolaa maydoni"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 4. FOCUS MODE RESTORE CAPSULE (When user is in distraction-free mode) */}
            {isFocusMode && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
                <div className="flex items-center gap-2 bg-[#120D08]/90 border border-amber-500/40 px-4 py-2 rounded-full backdrop-blur-2xl shadow-2xl">
                  <button
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-full hover:bg-amber-500/20 text-stone-300 disabled:opacity-30 active:scale-95"
                    title="Oldingi sahifa"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono font-bold text-amber-300 px-2">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-full hover:bg-amber-500/20 text-stone-300 disabled:opacity-30 active:scale-95"
                    title="Keyingi sahifa"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-[1px] bg-amber-900/60 mx-1" />

                  <button
                    onClick={() => setIsFocusMode(false)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded-full hover:bg-amber-500/20 font-medium transition-colors"
                    title="Barcha asboblarni qaytarish"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. FLOATING MOBILE TOUCH HUD (Always accessible on phone viewports) */}
            {!isFocusMode && (
              <div className="sm:hidden absolute bottom-4 inset-x-2 z-30 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1.5 bg-[#150F0A]/95 border border-amber-500/40 px-2 py-1.5 rounded-2xl backdrop-blur-2xl shadow-2xl">
                  {/* Left: Back/Exit to Home Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-[11px] shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-all active:scale-95 cursor-pointer font-heading shrink-0"
                    title="Bosh sahifaga qaytish"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                    <span>Orqaga</span>
                  </button>

                  {/* Center: Mobile Zoom Control Unit (Centered) */}
                  <div className="flex items-center gap-1 bg-[#1C140E]/90 p-1 rounded-xl border border-amber-500/30 shadow-inner">
                    {/* Zoom Out (-1%) */}
                    <button
                      type="button"
                      onClick={() => zoomOut(1)}
                      onMouseDown={() => startZoomHold('out')}
                      onMouseUp={stopZoomHold}
                      onMouseLeave={stopZoomHold}
                      onTouchStart={() => startZoomHold('out')}
                      onTouchEnd={stopZoomHold}
                      disabled={zoomScale <= 50}
                      className="w-7 h-7 rounded-lg bg-amber-950/70 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-300 flex items-center justify-center disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90 border border-amber-900/50"
                      title="Uzoqlashtirish (-1%)"
                      aria-label="Uzoqlashtirish (-1%)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    {/* Zoom Percentage Badge (Click to reset to 100%) */}
                    <button
                      type="button"
                      onClick={resetZoom}
                      className="px-2 py-1 rounded-lg bg-black/60 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px] min-w-[46px] text-center transition-all active:scale-95 shadow-sm"
                      title="100% asliga qaytarish"
                    >
                      {zoomScale}%
                    </button>

                    {/* Zoom In (+1%) */}
                    <button
                      type="button"
                      onClick={() => zoomIn(1)}
                      onMouseDown={() => startZoomHold('in')}
                      onMouseUp={stopZoomHold}
                      onMouseLeave={stopZoomHold}
                      onTouchStart={() => startZoomHold('in')}
                      onTouchEnd={stopZoomHold}
                      disabled={zoomScale >= 300}
                      className="w-7 h-7 rounded-lg bg-amber-950/70 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-300 flex items-center justify-center disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-90 border border-amber-900/50"
                      title="Yaqinlashtirish (+1%)"
                      aria-label="Yaqinlashtirish (+1%)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Quick Bookmark & Fullscreen */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleBookmarkCurrentPage}
                      className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                        justBookmarked
                          ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      }`}
                      title="Kelgan sahifangizni saqlash"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${justBookmarked ? 'fill-emerald-400' : 'fill-amber-400'}`} />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold active:scale-95 shadow-md"
                      title="To‘liq ekran"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              Ushbu kitob uchun Google Drive yoki to‘g‘ridan-to‘g‘ri PDF havolasi topilmadi.
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

      {/* 6. KEYBOARD SHORTCUTS MODAL */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#160F0A] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-title text-base font-bold text-stone-100">
                  Tezkor tugmalar (Hotkeys)
                </h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Keyingi sahifa</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">→</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Oldingi sahifa</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">←</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Fokus / Sokin rejim</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">Z</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">To‘liq ekran</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">F</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Xatcho‘p qo‘yish</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">B</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Chiqish / Yopish</span>
                <kbd className="px-2 py-1 rounded bg-stone-800 border border-stone-700 font-mono text-amber-300 font-bold">Esc</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
