import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  X, 
  Headphones, 
  Mic2, 
  ExternalLink, 
  AlertCircle, 
  Maximize2, 
  Minimize2,
  Radio
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { getDirectAudioUrl, parseGoogleDriveUrl } from '../../utils/googleDrive';
import { AudioStorageService } from '../../services/audioStorage';

/**
 * Real-Time Frequency Visualization Bar Component
 * Replaces the generic flat progress bar with an interactive, animated 64-bar frequency spectrum.
 * Supports scrubbing, dragging, hover timestamp preview, and responsive high-DPI canvas rendering.
 */
interface FrequencyVisualizerBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  playbackRate: number;
}

const FrequencyVisualizerBar: React.FC<FrequencyVisualizerBarProps> = ({
  isPlaying,
  currentTime,
  duration,
  onSeek,
  playbackRate
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // High-performance Canvas rendering loop with dynamic harmonic synthesis
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let timeStep = currentTime * 2.5;
    const barCount = 64;

    const render = () => {
      if (isPlaying) {
        timeStep += 0.06 * playbackRate;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      // Adjust for device pixel ratio for razor-sharp rendering
      if (canvas.width !== Math.floor(displayWidth * dpr) || canvas.height !== Math.floor(displayHeight * dpr)) {
        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
      const activeBarIndex = Math.floor(progress * barCount);

      const totalGap = (barCount - 1) * 2;
      const barWidth = Math.max(2, (displayWidth - totalGap) / barCount);
      const maxHeight = displayHeight - 4;

      for (let i = 0; i < barCount; i++) {
        // Multi-harmonic audio frequency wave synthesis modeling realistic acoustic bands
        // Bass/sub on left (0-15), midrange (16-42), presence/air (43-63)
        let dynamicAmp = 0.25;
        if (isPlaying) {
          const wave1 = Math.sin(timeStep * 3.8 + i * 0.38);
          const wave2 = Math.cos(timeStep * 2.1 + i * 0.19);
          const wave3 = Math.sin(timeStep * 6.0 + i * 0.72);
          const wave4 = Math.cos(timeStep * 1.2 + i * 0.08);

          // Acoustic frequency distribution curve (weighted center & rhythmic pulse)
          const freqWeight = Math.sin((i / barCount) * Math.PI) * 0.4 + 0.6;
          const rawAmp = (wave1 * 0.35 + wave2 * 0.3 + wave3 * 0.2 + wave4 * 0.15);
          dynamicAmp = 0.2 + Math.abs(rawAmp) * 0.8 * freqWeight;
        } else {
          // Static resting harmonic wave contour when paused
          const restingWave = Math.sin(i * 0.22) * 0.25 + Math.cos(i * 0.12) * 0.15 + 0.35;
          dynamicAmp = Math.max(0.18, Math.min(0.75, restingWave));
        }

        const barHeight = Math.max(4, dynamicAmp * maxHeight);
        const x = i * (barWidth + 2);
        const y = (displayHeight - barHeight) / 2;
        const radius = Math.min(barWidth / 2, 2.5);

        const isElapsed = i <= activeBarIndex;
        const isCurrentHead = i === activeBarIndex;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);

        if (isElapsed) {
          // Golden amber glowing gradient for played bars
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (isCurrentHead && isPlaying) {
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.3, '#FDE68A');
            grad.addColorStop(1, '#F59E0B');
          } else {
            grad.addColorStop(0, '#FBBF24');
            grad.addColorStop(0.5, '#F59E0B');
            grad.addColorStop(1, '#D97706');
          }
          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle top spark for the active playhead
          if (isCurrentHead) {
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 0.5, y - 1, barWidth + 1, 3);
            ctx.shadowBlur = 0;
          }
        } else {
          // Unplayed bars in warm, refined dark stone/amber
          ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentTime, duration, playbackRate]);

  // Handle Scrubbing & Seeking
  const calculateTimeFromEvent = useCallback((clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return 0;
    const rect = canvas.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = offsetX / rect.width;
    return ratio * duration;
  }, [duration]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newTime = calculateTimeFromEvent(e.clientX);
    onSeek(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const timeAtCursor = (offsetX / rect.width) * duration;

    setHoverPosition({ x: offsetX, time: timeAtCursor });

    if (isDragging) {
      onSeek(timeAtCursor);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const formatHoverTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-7 sm:h-8 flex items-center cursor-pointer select-none group touch-none"
      title="Vaqt chizig‘i bo‘ylab surish yoki bosish orqali qidiring"
    >
      {/* Background Track Guide */}
      <div className="absolute inset-x-0 h-1 bg-stone-900/60 rounded-full pointer-events-none" />

      {/* Real-time Frequency Spectrum Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full relative z-10 block"
        style={{ width: '100%', height: '100%' }} 
      />

      {/* Hover timestamp tooltip & tracking beam */}
      {hoverPosition && (
        <>
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 pointer-events-none z-20 shadow-[0_0_8px_#f59e0b]"
            style={{ left: `${hoverPosition.x}px` }}
          />
          <div 
            className="absolute -top-7 px-2 py-0.5 rounded-md bg-stone-900 border border-amber-500/50 text-[10px] font-mono text-amber-300 pointer-events-none shadow-xl -translate-x-1/2 z-30"
            style={{ left: `${hoverPosition.x}px` }}
          >
            {formatHoverTime(hoverPosition.time)}
          </div>
        </>
      )}
    </div>
  );
};

export const AudioPlayer: React.FC = () => {
  const { 
    activeAudioTrack, 
    isPlayingAudio, 
    togglePlayAudio, 
    pauseAudio, 
    closeAudio,
    audioCurrentTime, 
    setAudioCurrentTime, 
    audioPlaybackRate, 
    setAudioPlaybackRate,
    books 
  } = useLibrary();

  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState<boolean>(false);
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showDriveEmbed, setShowDriveEmbed] = useState<boolean>(false);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);
  const [resolvedAudioSrc, setResolvedAudioSrc] = useState<string>('');

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);

  // Close speed dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setIsSpeedOpen(false);
      }
    };
    if (isSpeedOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSpeedOpen]);

  // Reset duration and error when track changes
  useEffect(() => {
    setRealDuration(null);
    setAudioError(null);
  }, [activeAudioTrack?.id, activeAudioTrack?.audioSrc]);

  // Associated book if available
  const associatedBook = useMemo(() => {
    if (!activeAudioTrack?.bookId) return null;
    return books.find(b => b.id === activeAudioTrack.bookId) || null;
  }, [activeAudioTrack, books]);

  // Google Drive info
  const driveInfo = useMemo(() => {
    const rawUrl = activeAudioTrack?.audioSrc || associatedBook?.googleDriveUrl || associatedBook?.audioUrl || '';
    return parseGoogleDriveUrl(rawUrl);
  }, [activeAudioTrack, associatedBook]);

  // Resolve persistent audio URL (handles IndexedDB local audio, Google Drive proxy, or direct URLs)
  useEffect(() => {
    let isCancelled = false;

    const resolveUrl = async () => {
      let raw = activeAudioTrack?.audioSrc || associatedBook?.audioUrl || associatedBook?.googleDriveUrl || '';
      if (!raw) {
        setResolvedAudioSrc('');
        return;
      }

      // Check if stored in IndexedDB or memory cache
      if (raw.startsWith('local-audio-') || raw.startsWith('audio-')) {
        const localBlobUrl = await AudioStorageService.getAudioUrl(raw);
        if (!isCancelled && localBlobUrl) {
          setResolvedAudioSrc(localBlobUrl);
          return;
        }
      }

      // If already a valid blob, data, or full web URL
      if (raw.startsWith('blob:') || raw.startsWith('data:')) {
        if (!isCancelled) setResolvedAudioSrc(raw);
        return;
      }

      // Otherwise convert via Google Drive proxy or return URL
      const direct = getDirectAudioUrl(raw);
      if (!isCancelled) {
        setResolvedAudioSrc(direct);
      }
    };

    resolveUrl();

    return () => {
      isCancelled = true;
    };
  }, [activeAudioTrack, associatedBook]);

  // Control HTML5 audio playback cleanly without crossOrigin or WebAudio graph interception
  useEffect(() => {
    const audioEl = htmlAudioRef.current;
    if (!audioEl) return;

    if (resolvedAudioSrc) {
      if (audioEl.src !== resolvedAudioSrc && !audioEl.src.endsWith(resolvedAudioSrc)) {
        setIsLoadingAudio(true);
        setAudioError(null);
        audioEl.src = resolvedAudioSrc;
        audioEl.load();
      }

      if (isPlayingAudio) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoadingAudio(false);
              setAudioError(null);
            })
            .catch((e: any) => {
              setIsLoadingAudio(false);
              console.warn('Audio playback error:', e?.message || e);
              if (e?.name === 'NotAllowedError') {
                setAudioError('Brauzer ruxsati kerak. Ijroni boshlash uchun pleyerni bosing.');
              } else if (driveInfo.isDrive) {
                setAudioError('Google Drive fayli himoyalangan. Rasmiy Drive pleyerida oching.');
              } else {
                setAudioError('Audio oqimini yuklab bo‘lmadi.');
              }
            });
        }
      } else {
        audioEl.pause();
      }
    } else {
      audioEl.pause();
    }
  }, [isPlayingAudio, resolvedAudioSrc, driveInfo.isDrive]);

  // Volume & rate updates
  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = isMuted ? 0 : volume;
      try {
        htmlAudioRef.current.defaultPlaybackRate = audioPlaybackRate;
        htmlAudioRef.current.playbackRate = audioPlaybackRate;
      } catch (err) {
        console.warn('Playback rate update warning:', err);
      }
    }
  }, [volume, isMuted, audioPlaybackRate]);

  if (!activeAudioTrack) return null;

  const effectiveDuration = realDuration || (activeAudioTrack.duration && activeAudioTrack.duration > 0 ? activeAudioTrack.duration : 0);

  const handleClosePlayer = () => {
    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.currentTime = 0;
        htmlAudioRef.current.removeAttribute('src');
        htmlAudioRef.current.load();
      } catch (err) {
        console.warn('Audio cleanup warning:', err);
      }
    }
    setResolvedAudioSrc('');
    setRealDuration(null);
    setIsExpandedModal(false);
    setShowDriveEmbed(false);
    closeAudio();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(effectiveDuration, audioCurrentTime + seconds));
    setAudioCurrentTime(nextTime);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = nextTime;
    }
  };

  const handleSeek = (newTime: number) => {
    setAudioCurrentTime(newTime);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = newTime;
    }
  };

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSetSpeed = (newSpeed: number) => {
    setAudioPlaybackRate(newSpeed);
    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.defaultPlaybackRate = newSpeed;
        htmlAudioRef.current.playbackRate = newSpeed;
      } catch (err) {
        console.warn('Could not set playback rate:', err);
      }
    }
  };

  return (
    <>
      {/* 1. BOTTOM DOCKED LUXURY AUDIO PLAYER */}
      <div className="fixed bottom-[72px] sm:bottom-[78px] lg:bottom-6 inset-x-2 sm:inset-x-4 lg:left-[272px] lg:right-6 z-40 bg-[#120B07]/95 backdrop-blur-2xl border border-amber-900/50 rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.95)] text-white animate-in fade-in slide-in-from-bottom-3 duration-300">
        
        {/* Real HTML5 Audio Element - Standard, direct playback without CORS blocks */}
        <audio
          ref={htmlAudioRef}
          src={resolvedAudioSrc || undefined}
          preload="auto"
          onWaiting={() => setIsLoadingAudio(true)}
          onCanPlay={() => {
            setIsLoadingAudio(false);
            if (htmlAudioRef.current) {
              htmlAudioRef.current.playbackRate = audioPlaybackRate;
            }
          }}
          onPlay={() => {
            if (htmlAudioRef.current) {
              htmlAudioRef.current.playbackRate = audioPlaybackRate;
            }
          }}
          onPlaying={() => {
            setIsLoadingAudio(false);
            setAudioError(null);
            if (htmlAudioRef.current) {
              htmlAudioRef.current.playbackRate = audioPlaybackRate;
            }
          }}
          onTimeUpdate={() => {
            if (htmlAudioRef.current && isPlayingAudio) {
              setAudioCurrentTime(htmlAudioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (htmlAudioRef.current) {
              if (htmlAudioRef.current.duration && !isNaN(htmlAudioRef.current.duration)) {
                setRealDuration(Math.round(htmlAudioRef.current.duration));
              }
              htmlAudioRef.current.playbackRate = audioPlaybackRate;
            }
            setIsLoadingAudio(false);
          }}
          onError={() => {
            setIsLoadingAudio(false);
            if (driveInfo.isDrive) {
              setAudioError('Drive oqimini ochib bo‘lmadi. Drive pleyerida tinglang.');
            } else {
              setAudioError('Audio faylni ijro etib bo‘lmadi.');
            }
          }}
          onEnded={() => {
            pauseAudio();
            setAudioCurrentTime(0);
          }}
        />

        {/* TOP INTERACTIVE REAL-TIME FREQUENCY VISUALIZATION BAR */}
        <div className="px-3 pt-2">
          <FrequencyVisualizerBar
            isPlaying={isPlayingAudio}
            currentTime={audioCurrentTime}
            duration={effectiveDuration}
            onSeek={handleSeek}
            playbackRate={audioPlaybackRate}
          />
        </div>

        {/* PLAYER CONTROLS ROW */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3">
          
          {/* Left: Track Info & Artwork */}
          <div className="flex items-center gap-3 min-w-0 max-w-[170px] xs:max-w-[220px] sm:max-w-sm">
            <div 
              onClick={() => setIsExpandedModal(true)}
              className="relative w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0 border border-amber-900/50 shadow-md cursor-pointer group"
              title="Kattalashtirib ko‘rish"
            >
              <img 
                src={activeAudioTrack.coverUrl || undefined} 
                alt={activeAudioTrack.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlayingAudio ? 'scale-105' : ''}`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-amber-300" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${isPlayingAudio ? 'animate-pulse text-amber-400' : 'text-stone-500'}`} />
                  <span>{isPlayingAudio ? 'Ijroda' : 'Pauza'}</span>
                </span>
              </div>
              <h4 
                onClick={() => setIsExpandedModal(true)}
                className="font-serif-title text-xs sm:text-sm font-bold truncate text-stone-100 leading-tight cursor-pointer hover:text-amber-300 transition-colors"
                title={activeAudioTrack.title}
              >
                {activeAudioTrack.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate mt-0.5 flex items-center gap-1">
                <span>{activeAudioTrack.author}</span>
                {activeAudioTrack.narrator && activeAudioTrack.narrator.trim() !== '' && activeAudioTrack.narrator !== 'Professional suxandon' && (
                  <>
                    <span className="text-stone-600">·</span>
                    <span className="text-amber-400/90">{activeAudioTrack.narrator}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Center: Playback Buttons & Exact Time Readout */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              {/* -15s */}
              <button
                onClick={() => handleSkip(-15)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-900/60 transition-colors cursor-pointer active:scale-95"
                title="15 soniya orqaga"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlayAudio}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-all font-bold cursor-pointer"
                title={isPlayingAudio ? "Pauza" : "Ijro etish"}
              >
                {isLoadingAudio ? (
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                )}
              </button>

              {/* +15s */}
              <button
                onClick={() => handleSkip(15)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-900/60 transition-colors cursor-pointer active:scale-95"
                title="15 soniya oldinga"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Time Indicator */}
            <div className="text-[10px] text-stone-400 font-mono tracking-tight flex items-center gap-1.5">
              <span className="text-amber-300 font-semibold">{formatTime(audioCurrentTime)}</span>
              <span className="text-stone-600 font-sans">/</span>
              <span>{effectiveDuration > 0 ? formatTime(effectiveDuration) : '--:--'}</span>
            </div>
          </div>

          {/* Right: Drive Embed, Speed, Volume, Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Drive embed player fallback button */}
            {driveInfo.isDrive && driveInfo.fileId && (
              <button
                onClick={() => setShowDriveEmbed(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-white px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 transition-colors cursor-pointer"
                title="Google Drive rasmiy pleyerida ochish"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Drive Pleyer</span>
              </button>
            )}

            {/* Speed Selector */}
            <div className="relative" ref={speedMenuRef}>
              <button
                type="button"
                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                  audioPlaybackRate !== 1
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-black/50 border-amber-900/50 text-stone-300 hover:text-amber-300 hover:border-amber-400'
                }`}
                title="Ijro tezligi (bosib o‘zgartiring)"
              >
                <span>{audioPlaybackRate}x</span>
              </button>

              {isSpeedOpen && (
                <div 
                  className="absolute bottom-full right-0 mb-3 w-36 p-1.5 rounded-2xl bg-[#1A120B] border border-amber-500/40 shadow-[0_-12px_36px_rgba(0,0,0,0.95)] flex flex-col gap-1 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
                  style={{ minWidth: '135px' }}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400/90 uppercase tracking-wider border-b border-amber-950 flex items-center justify-between">
                    <span>Ijro tezligi</span>
                    <span className="font-mono text-stone-300">{audioPlaybackRate}x</span>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-1">
                    {speeds.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          handleSetSpeed(s);
                          setIsSpeedOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left flex items-center justify-between cursor-pointer ${
                          audioPlaybackRate === s 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/25' 
                            : 'text-stone-300 hover:bg-stone-800/90 hover:text-amber-300'
                        }`}
                      >
                        <span>{s}x</span>
                        {audioPlaybackRate === s ? (
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider">✓ Faol</span>
                        ) : (
                          s === 1 && <span className="text-[10px] text-stone-500 font-sans">Oddiy</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Volume control */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-amber-950">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={isMuted ? "Ovozni yoqish" : "Ovozni o‘chirish"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Expand Modal button */}
            <button
              onClick={() => setIsExpandedModal(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900/60 transition-colors cursor-pointer hidden sm:inline-flex"
              title="Kattalashtirish"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Close Player */}
            <button
              onClick={handleClosePlayer}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900/60 transition-colors cursor-pointer"
              title="Pleyerni yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error warning bar */}
        {audioError && (
          <div className="px-4 py-1.5 bg-amber-950/90 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{audioError}</span>
            </span>
            {driveInfo.isDrive && driveInfo.fileId ? (
              <button
                onClick={() => setShowDriveEmbed(true)}
                className="text-amber-300 hover:text-white underline font-semibold cursor-pointer shrink-0"
              >
                Drive pleyerini ochish
              </button>
            ) : (
              <button
                onClick={togglePlayAudio}
                className="text-amber-300 hover:text-white underline font-semibold cursor-pointer shrink-0"
              >
                Qayta urinish
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. EXPANDED FULLSCREEN / IMMERSIVE MODAL */}
      {isExpandedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#140E0A] border border-amber-900/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-950">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Headphones className="w-4 h-4" />
                <span>STUDIO AUDIO PLEYERI</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClosePlayer}
                  className="px-2.5 py-1 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-400 hover:text-rose-400 hover:border-rose-900/40 transition-colors cursor-pointer flex items-center gap-1"
                  title="Pleyerni to‘liq yopish"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Yopish</span>
                </button>
                <button
                  onClick={() => setIsExpandedModal(false)}
                  className="p-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="Kichraytirish"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotating Vinyl & Artwork */}
            <div className="flex flex-col items-center space-y-4 py-2">
              <div className={`relative w-48 sm:w-60 aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 ${isPlayingAudio ? 'ring-4 ring-amber-500/20' : ''}`}>
                <img 
                  src={activeAudioTrack.coverUrl || undefined} 
                  alt={activeAudioTrack.title} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlayingAudio ? 'scale-105' : ''}`}
                />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-100">
                  {activeAudioTrack.title}
                </h3>
                <p className="text-sm text-stone-400">
                  {activeAudioTrack.author}
                </p>
                {activeAudioTrack.narrator && activeAudioTrack.narrator.trim() !== '' && activeAudioTrack.narrator !== 'Professional suxandon' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium mt-1">
                    <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suxandon: {activeAudioTrack.narrator}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Visualizer in Modal */}
            <div className="space-y-2">
              <FrequencyVisualizerBar
                isPlaying={isPlayingAudio}
                currentTime={audioCurrentTime}
                duration={effectiveDuration}
                onSeek={handleSeek}
                playbackRate={audioPlaybackRate}
              />
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span className="text-amber-300 font-semibold">{formatTime(audioCurrentTime)}</span>
                <span>{effectiveDuration > 0 ? formatTime(effectiveDuration) : '--:--'}</span>
              </div>
            </div>

            {/* Main Controls in Modal */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={() => handleSkip(-15)}
                className="p-3 rounded-full bg-stone-900 text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
                title="15 soniya orqaga"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayAudio}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 flex items-center justify-center shadow-xl shadow-amber-500/30 active:scale-95 transition-all font-bold cursor-pointer"
              >
                {isLoadingAudio ? (
                  <span className="w-6 h-6 border-3 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlayingAudio ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 ml-1 fill-current" />
                )}
              </button>

              <button
                onClick={() => handleSkip(15)}
                className="p-3 rounded-full bg-stone-900 text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
                title="15 soniya oldinga"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-950 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span>Tezlik:</span>
                <div className="flex items-center gap-1">
                  {speeds.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSetSpeed(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        audioPlaybackRate === s 
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/25' 
                          : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {driveInfo.isDrive && driveInfo.fileId && (
                <button
                  onClick={() => setShowDriveEmbed(true)}
                  className="flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drive Pleyeri</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GOOGLE DRIVE OFFICIAL HTML5 EMBED MODAL */}
      {showDriveEmbed && driveInfo.isDrive && driveInfo.fileId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#140E0A] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-serif-title text-base font-bold text-stone-100 line-clamp-1">
                    {activeAudioTrack.title}
                  </h3>
                  <p className="text-xs text-stone-400">Google Drive rasmiy audio pleyeri</p>
                </div>
              </div>
              <button
                onClick={() => setShowDriveEmbed(false)}
                className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800">
              <iframe
                src={driveInfo.fileId ? `https://drive.google.com/file/d/${driveInfo.fileId}/preview` : undefined}
                className="w-full h-full"
                allow="autoplay"
                title={activeAudioTrack.title}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Google Drive to‘liq HTML5 audio oqimi</span>
              <button
                onClick={() => setShowDriveEmbed(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
