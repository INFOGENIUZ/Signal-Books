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
  Sliders,
  Sparkles
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

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

  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState<boolean>(false);

  // Web Audio ambient tone generator for genuine audible audio playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sound generator initialization
  useEffect(() => {
    if (isPlayingAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }

        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        // Clean up previous oscillator
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        }

        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        // Pleasant warm chord tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioContextRef.current.currentTime); // A3 calm note
        
        // Gentle soft volume
        const actualVol = isMuted ? 0 : volume * 0.05;
        gain.gain.setValueAtTime(actualVol, audioContextRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch (err) {
        console.warn('Web Audio synthesis unavailable:', err);
      }
    } else {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      }
    };
  }, [isPlayingAudio, volume, isMuted]);

  // Advance timer while playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioCurrentTime((prev) => {
          if (prev >= audioDuration) {
            pauseAudio();
            return 0;
          }
          return prev + 1 * audioPlaybackRate;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, audioPlaybackRate, audioDuration, pauseAudio, setAudioCurrentTime]);

  if (!activeAudioTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSkip = (seconds: number) => {
    setAudioCurrentTime(Math.max(0, Math.min(audioDuration, audioCurrentTime + seconds)));
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="fixed bottom-[48px] sm:bottom-[52px] lg:bottom-0 inset-x-0 lg:left-[260px] z-30 bg-[#130E0A]/95 backdrop-blur-2xl border-t border-amber-500/30 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] text-white audio-player-container">
      {/* Progress Bar Top Scrubber */}
      <div className="relative group w-full h-1.5 bg-stone-900 cursor-pointer">
        <input
          type="range"
          min={0}
          max={audioDuration}
          value={audioCurrentTime}
          onChange={(e) => setAudioCurrentTime(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all"
          style={{ width: `${(audioCurrentTime / audioDuration) * 100}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${(audioCurrentTime / audioDuration) * 100}% - 6px)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-sm">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-stone-950 shrink-0 border border-amber-500/30 shadow-md">
            <img 
              src={activeAudioTrack.coverUrl} 
              alt={activeAudioTrack.title} 
              className={`w-full h-full object-cover ${isPlayingAudio ? 'scale-105' : ''} transition-transform`}
            />
            {isPlayingAudio && (
              <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-amber-200 animate-pulse h-full" />
                  <span className="w-0.5 bg-amber-200 animate-pulse h-2/3 delay-75" />
                  <span className="w-0.5 bg-amber-200 animate-pulse h-4/5 delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="hidden xs:flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-amber-400">
                Tinglanmoqda
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
            </div>
            <h4 className="font-serif-title text-xs sm:text-sm font-bold truncate text-stone-100">
              {activeAudioTrack.title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
              {activeAudioTrack.author}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <div className="flex items-center gap-1.5 xs:gap-3 sm:gap-4">
            {/* -15s */}
            <button
              onClick={() => handleSkip(-15)}
              className="p-1 sm:p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#1E1610] transition-colors"
              title="15 soniya orqaga"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayAudio}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
              title={isPlayingAudio ? "Pauza" : "Ijro etish"}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 text-stone-950" />}
            </button>

            {/* +15s */}
            <button
              onClick={() => handleSkip(15)}
              className="p-1 sm:p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-[#1E1610] transition-colors"
              title="15 soniya oldinga"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Time display */}
          <div className="text-[9px] sm:text-[10px] text-stone-400 font-mono">
            <span>{formatTime(audioCurrentTime)}</span>
            <span className="mx-1 opacity-50">/</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>

        {/* Right: Speed, Volume, Close */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setIsSpeedOpen(!isSpeedOpen)}
              className="px-2 py-1 rounded-lg bg-[#1C140E] border border-amber-950/80 text-xs font-mono text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              title="Ijro tezligi"
            >
              {audioPlaybackRate}x
            </button>

            {isSpeedOpen && (
              <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-xl bg-[#1C140E] border border-amber-950/80 shadow-xl flex flex-col gap-1 z-50">
                {speeds.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setAudioPlaybackRate(s);
                      setIsSpeedOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors text-left ${
                      audioPlaybackRate === s 
                        ? 'bg-amber-500 text-stone-950 font-bold' 
                        : 'text-stone-300 hover:bg-[#251B13]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors"
              title={isMuted ? "Ovozni yoqish" : "Ovozni o‘chirish"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
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

          {/* Pause & Close audio */}
          <button
            onClick={pauseAudio}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1E1610] transition-colors"
            title="Pleyerni to‘xtatish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
