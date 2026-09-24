import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronUp, 
  ChevronDown,
  Headphones,
  Mic2,
  ExternalLink,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { getDirectAudioUrl, parseGoogleDriveUrl } from '../../utils/googleDrive';

export const AudioPlayer: React.FC = () => {
  const { 
    activeAudioTrack, 
    isPlayingAudio, 
    togglePlayAudio, 
    pauseAudio, 
    audioCurrentTime, 
    setAudioCurrentTime, 
    audioDuration, 
    audioPlaybackRate, 
    setAudioPlaybackRate 
  } = useLibrary();

  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState<boolean>(false);
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showDriveEmbed, setShowDriveEmbed] = useState<boolean>(false);

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const directAudioSrc = activeAudioTrack?.audioSrc ? getDirectAudioUrl(activeAudioTrack.audioSrc) : '';
  const driveInfo = activeAudioTrack?.audioSrc ? parseGoogleDriveUrl(activeAudioTrack.audioSrc) : { isDrive: false, fileId: null };

  // Control HTML5 audio
  useEffect(() => {
    const audioEl = htmlAudioRef.current;
    if (!audioEl) return;

    if (directAudioSrc) {
      if (audioEl.src !== directAudioSrc && !audioEl.src.endsWith(directAudioSrc)) {
        setIsLoadingAudio(true);
        setAudioError(null);
        audioEl.src = directAudioSrc;
        audioEl.load();
      }

      if (isPlayingAudio) {
        audioEl.play()
          .then(() => {
            setIsLoadingAudio(false);
            setAudioError(null);
          })
          .catch(e => {
            setIsLoadingAudio(false);
            console.warn('Real audio play error:', e);
            if (driveInfo.isDrive) {
              setAudioError('Drive fayli cheklovi. Google Drive pleyerida oching.');
            } else {
              setAudioError('Audioni ijro etib bo‘lmadi.');
            }
          });
      } else {
        audioEl.pause();
      }
    } else {
      audioEl.pause();
    }
  }, [isPlayingAudio, directAudioSrc, driveInfo.isDrive]);

  // Volume & rate updates
  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = isMuted ? 0 : volume;
      htmlAudioRef.current.playbackRate = audioPlaybackRate;
    }
  }, [volume, isMuted, audioPlaybackRate]);

  if (!activeAudioTrack) return null;

  const effectiveDuration = realDuration || audioDuration || 3600;

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

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <>
      <div className="fixed bottom-[50px] sm:bottom-[54px] lg:bottom-2 inset-x-2 sm:inset-x-4 lg:left-[272px] lg:right-4 z-40 bg-[#120B06]/95 backdrop-blur-2xl border border-amber-900/40 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] text-white overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
        
        {/* Real audio element */}
        <audio
          ref={htmlAudioRef}
          src={directAudioSrc || undefined}
          preload="auto"
          onWaiting={() => setIsLoadingAudio(true)}
          onPlaying={() => {
            setIsLoadingAudio(false);
            setAudioError(null);
          }}
          onTimeUpdate={() => {
            if (htmlAudioRef.current && isPlayingAudio) {
              setAudioCurrentTime(htmlAudioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (htmlAudioRef.current && htmlAudioRef.current.duration && !isNaN(htmlAudioRef.current.duration)) {
              setRealDuration(Math.round(htmlAudioRef.current.duration));
            }
            setIsLoadingAudio(false);
          }}
          onError={() => {
            setIsLoadingAudio(false);
            if (driveInfo.isDrive) {
              setAudioError('Drive audiosi to‘g‘ridan-to‘g‘ri ochilmadi');
            } else {
              setAudioError('Audio yuklashda xatolik');
            }
          }}
          onEnded={() => {
            pauseAudio();
            setAudioCurrentTime(0);
          }}
        />

        {/* Progress Bar Top Scrubber */}
        <div className="relative group w-full h-1.5 bg-black/60 cursor-pointer">
          <input
            type="range"
            min={0}
            max={effectiveDuration || 100}
            value={audioCurrentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${Math.min(100, (audioCurrentTime / (effectiveDuration || 1)) * 100)}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${Math.min(100, (audioCurrentTime / (effectiveDuration || 1)) * 100)}% - 6px)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3">
          
          {/* Left: Track Info & Artwork */}
          <div className="flex items-center gap-3 min-w-0 max-w-[150px] xs:max-w-[200px] sm:max-w-sm">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0 border border-amber-900/40 shadow-md">
              <img 
                src={activeAudioTrack.coverUrl || undefined} 
                alt={activeAudioTrack.title} 
                className={`w-full h-full object-cover transition-transform ${isPlayingAudio ? 'scale-105' : ''}`}
              />
            </div>

            <div className="min-w-0">
              <h4 className="font-serif-title text-xs sm:text-sm font-bold truncate text-stone-100 leading-tight">
                {activeAudioTrack.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate mt-0.5 flex items-center gap-1">
                <span>{activeAudioTrack.author}</span>
                {activeAudioTrack.narrator && (
                  <>
                    <span className="text-stone-600">·</span>
                    <span className="text-amber-400/90">{activeAudioTrack.narrator}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              {/* -15s */}
              <button
                onClick={() => handleSkip(-15)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-900/60 transition-colors cursor-pointer"
                title="15 soniya orqaga"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/25 active:scale-95 transition-all font-bold cursor-pointer"
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
                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-900/60 transition-colors cursor-pointer"
                title="15 soniya oldinga"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber time readout */}
            <div className="text-[10px] text-stone-400 font-mono tracking-tight flex items-center gap-1">
              <span className="text-amber-300 font-semibold">{formatTime(audioCurrentTime)}</span>
              <span className="opacity-40">/</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          {/* Right: Drive Fallback, Speed, Volume, Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Drive embed player fallback button */}
            {driveInfo.isDrive && driveInfo.fileId && (
              <button
                onClick={() => setShowDriveEmbed(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors cursor-pointer"
                title="Google Drive rasmiy pleyerida ochish"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Drive Pleyer</span>
              </button>
            )}

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                className="px-2 py-1 rounded-lg bg-black/40 border border-amber-900/40 text-xs font-mono text-stone-300 hover:text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
                title="Ijro tezligi"
              >
                {audioPlaybackRate}x
              </button>

              {isSpeedOpen && (
                <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-xl bg-[#1A120B] border border-amber-900/40 shadow-xl flex flex-col gap-0.5 z-50">
                  {speeds.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setAudioPlaybackRate(s);
                        setIsSpeedOpen(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                        audioPlaybackRate === s 
                          ? 'bg-amber-500 text-stone-950 font-bold' 
                          : 'text-stone-300 hover:bg-stone-800 hover:text-amber-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
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

            {/* Close */}
            <button
              onClick={pauseAudio}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900/60 transition-colors cursor-pointer"
              title="Pleyerni to‘xtatish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error warning bar if stream fails */}
        {audioError && driveInfo.isDrive && (
          <div className="px-4 py-1.5 bg-amber-950/90 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{audioError}</span>
            </span>
            <button
              onClick={() => setShowDriveEmbed(true)}
              className="text-amber-300 hover:text-white underline font-semibold cursor-pointer"
            >
              Drive orqali tinglash
            </button>
          </div>
        )}
      </div>

      {/* Google Drive Embedded Audio Player Modal */}
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
                className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white"
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
