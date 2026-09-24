import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Upload, 
  HardDrive, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  User, 
  Mic2, 
  Music, 
  Volume2, 
  RefreshCw, 
  Layers, 
  Plus, 
  Trash2, 
  FileAudio, 
  Link as LinkIcon, 
  Check, 
  SlidersHorizontal,
  Info,
  ExternalLink
} from 'lucide-react';
import { Category, BookLanguage, Book, Chapter } from '../../types';
import { parseGoogleDriveUrl, generateAudioBookCover } from '../../utils/googleDrive';

interface AdminAudioBookUploadCardProps {
  categories: Category[];
  authors: { id: string; name: string }[];
  onAddAudioBook: (bookData: Partial<Book>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onCancel?: () => void;
}

export const AdminAudioBookUploadCard: React.FC<AdminAudioBookUploadCardProps> = ({
  categories,
  authors,
  onAddAudioBook,
  showToast,
  onCancel
}) => {
  // Audio Source type: 'drive' | 'file' | 'url'
  const [sourceType, setSourceType] = useState<'drive' | 'file' | 'url'>('drive');
  
  // Inputs
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [narrator, setNarrator] = useState('Afzal Rafiqov');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [language, setLanguage] = useState<BookLanguage>('O‘zbekcha');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [audioDuration, setAudioDuration] = useState('3 soat 15 daqiqa');
  
  // Audio Links & Files
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [directAudioUrl, setDirectAudioUrl] = useState('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [localAudioBlobUrl, setLocalAudioBlobUrl] = useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = useState('45 MB');

  // Cover image settings
  const [coverType, setCoverType] = useState<'auto' | 'custom'>('auto');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Audio chapters (parts)
  const [chapters, setChapters] = useState<{ id: string; title: string; pageNumber: number }[]>([
    { id: 'ch-1', title: '1-qism. Kirish so‘zi va boshlanishi', pageNumber: 1 }
  ]);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Live preview audio state
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Google Drive URL
  const driveInfo = useMemo(() => {
    return parseGoogleDriveUrl(googleDriveUrl);
  }, [googleDriveUrl]);

  // Determine effective audio stream URL
  const effectiveAudioUrl = useMemo(() => {
    if (sourceType === 'drive') {
      if (driveInfo.isDrive && driveInfo.fileId) {
        return `https://drive.google.com/uc?export=download&id=${driveInfo.fileId}`;
      }
      return googleDriveUrl.trim();
    } else if (sourceType === 'file') {
      return localAudioBlobUrl || '';
    } else {
      return directAudioUrl.trim();
    }
  }, [sourceType, driveInfo, googleDriveUrl, localAudioBlobUrl, directAudioUrl]);

  // Auto-generate luxury Audio Book Cover
  const autoAudioCover = useMemo(() => {
    const targetCat = categories.find(c => c.id === categoryId);
    return generateAudioBookCover(
      title || 'Yangi Audio Kitob',
      authorName || 'Muallif',
      narrator || 'Professional suxandon',
      targetCat?.name || 'Badiiy adabiyot',
      publicationYear
    );
  }, [title, authorName, narrator, categoryId, publicationYear, categories]);

  const effectiveCoverUrl = coverType === 'custom' && customCoverUrl.trim()
    ? customCoverUrl.trim()
    : autoAudioCover;

  // Cleanup object url on unmount
  useEffect(() => {
    return () => {
      if (localAudioBlobUrl && localAudioBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localAudioBlobUrl);
      }
    };
  }, [localAudioBlobUrl]);

  // Handle local audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|m4a|wav|aac|ogg|flac)$/i)) {
      showToast('Iltimos, faqat audio fayl (.mp3, .m4a, .wav) tanlang', 'error');
      return;
    }

    setSelectedAudioFile(file);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeText(`${sizeInMb} MB`);

    const blobUrl = URL.createObjectURL(file);
    setLocalAudioBlobUrl(blobUrl);

    // Auto-detect title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
    if (!title) {
      setTitle(cleanName);
    }

    // Auto calculate duration via Audio API
    const testAudio = new Audio(blobUrl);
    testAudio.onloadedmetadata = () => {
      const dur = testAudio.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        const hrs = Math.floor(dur / 3600);
        const mins = Math.floor((dur % 3600) / 60);
        if (hrs > 0) {
          setAudioDuration(`${hrs} soat ${mins} daqiqa`);
        } else {
          setAudioDuration(`${mins} daqiqa`);
        }
      }
    };

    showToast(`«${file.name}» audio fayli tanlandi (${sizeInMb} MB)`, 'success');
  };

  // Toggle preview player
  const togglePreviewPlay = () => {
    if (!effectiveAudioUrl) {
      showToast('Audio manbasi topilmadi', 'info');
      return;
    }

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(effectiveAudioUrl);
      audioPreviewRef.current.ontimeupdate = () => {
        if (audioPreviewRef.current && audioPreviewRef.current.duration) {
          setPreviewProgress((audioPreviewRef.current.currentTime / audioPreviewRef.current.duration) * 100);
        }
      };
      audioPreviewRef.current.onended = () => {
        setIsPreviewPlaying(false);
        setPreviewProgress(0);
      };
    }

    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreviewRef.current.src = effectiveAudioUrl;
      audioPreviewRef.current.play()
        .then(() => setIsPreviewPlaying(true))
        .catch((err) => {
          console.warn('Audio preview play error:', err);
          showToast('Audioni ijro etib bo‘lmadi (Brauzer cheklovi yoki to‘g‘ri format emas)', 'error');
        });
    }
  };

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // Add chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newCh = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      pageNumber: chapters.length + 1
    };
    setChapters([...chapters, newCh]);
    setNewChapterTitle('');
    showToast(`«${newCh.title}» qismi qo‘shildi`, 'success');
  };

  // Remove chapter
  const handleRemoveChapter = (id: string) => {
    setChapters(chapters.filter(c => c.id !== id));
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !authorName.trim()) {
      showToast('Kitob nomi va muallifini kiriting', 'error');
      return;
    }

    if (!effectiveAudioUrl) {
      showToast('Iltimos, audio fayl tanlang yoki Google Drive havolasini kiriting', 'error');
      return;
    }

    const targetCategory = categories.find(c => c.id === categoryId) || categories[0];
    const targetSubCategory = targetCategory?.subcategories?.find(s => s.id === subcategoryId);
    const matchedAuthor = authors.find(a => a.name.toLowerCase() === authorName.trim().toLowerCase());

    const audioBookData: Partial<Book> = {
      title: title.trim(),
      authorId: matchedAuthor ? matchedAuthor.id : 'auth-custom',
      authorName: authorName.trim(),
      narrator: narrator.trim() || 'Professional suxandon',
      categoryId: targetCategory ? targetCategory.id : 'cat-1',
      categoryName: targetCategory ? targetCategory.name : 'Badiiy adabiyot',
      subcategoryId: targetSubCategory?.id,
      subcategoryName: targetSubCategory?.name,
      description: description.trim() || `«${title}» — ${authorName} qalamiga mansub sara asarning to‘liq audio kitob varianti. Suxandon ${narrator || 'mutaxassis'} tomonidan maromiga yetkazib ijro etilgan.`,
      coverUrl: effectiveCoverUrl,
      audioUrl: effectiveAudioUrl,
      audioDuration: audioDuration.trim() || '3 soat 20 daqiqa',
      hasAudio: true,
      googleDriveUrl: sourceType === 'drive' ? googleDriveUrl.trim() : undefined,
      pdfUrl: '#',
      pages: 0,
      publicationYear: Number(publicationYear) || 2024,
      language: language,
      fileSize: fileSizeText,
      format: ['AUDIO'],
      rating: 5.0,
      ratingsCount: 1,
      views: 1,
      downloads: 0,
      chapters: chapters.length > 0 ? chapters : [
        { id: 'ch-1', title: '1-qism. To‘liq audio asar', pageNumber: 1 }
      ]
    };

    onAddAudioBook(audioBookData);
    showToast(`«${title}» audio kitobi muvaffaqiyatli saqlandi va ovozli kutubxonaga qo‘shildi! 🎧`, 'success');

    // Reset Form
    setTitle('');
    setAuthorName('');
    setGoogleDriveUrl('');
    setDirectAudioUrl('');
    setSelectedAudioFile(null);
    setLocalAudioBlobUrl(null);
    setDescription('');
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPreviewPlaying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/70 via-[#1C1209] to-amber-950/50 border border-orange-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-4 h-4 text-orange-400" />
              <span>Ovozli Kutubxona Studiyasi</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Alohida Audio Kitob Yuklash
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Foydalanuvchilar yo‘lda, dam olishda va sport vaqtida tinglashi uchun MP3, audio fayl yoki Google Drive audio havolasini kiriting. Tizim avtomatik audio muqova va pleyer sozlamalarini yaratadi.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: THE FORM (8 Cols on LG) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. AUDIO MANBASI TANLASH */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-orange-950/30 via-amber-950/20 to-[#120D08] border border-orange-500/40 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    <Music className="w-4 h-4" />
                  </div>
                  <label className="text-xs font-bold text-stone-100 uppercase tracking-wider">
                    Audio Manbasi (Fayl yoki Havola)
                  </label>
                </div>
                <span className="text-[11px] text-orange-400 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  Majburiy
                </span>
              </div>

              {/* Source Mode Selector Buttons */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-amber-950/80">
                <button
                  type="button"
                  onClick={() => setSourceType('drive')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sourceType === 'drive'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sourceType === 'file'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fayl yuklash (.mp3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('url')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sourceType === 'url'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>To‘g‘ridan-to‘g‘ri URL</span>
                </button>
              </div>

              {/* Mode A: Google Drive */}
              {sourceType === 'drive' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1X-audio-mp3-link/view?usp=sharing"
                    className="w-full bg-[#1C140E] border border-orange-500/40 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                  />
                  <p className="text-[11px] text-stone-400">
                    Google Drive dagi audio fayl (MP3/M4A) havolasini kiriting. Fayl sozlamasini <strong className="text-amber-300">«Anyone with the link»</strong> qilib qo‘ying.
                  </p>
                  {driveInfo.isDrive && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Google Drive Audio ID: <strong className="font-mono text-white">{driveInfo.fileId}</strong> (Avtomatik ulandi)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Local File Picker */}
              {sourceType === 'file' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAudioFileChange}
                    accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-orange-500/40 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/40 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-stone-200">
                      {selectedAudioFile ? selectedAudioFile.name : 'Audio faylni tanlash uchun bu yerni bosing'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      MP3, M4A, WAV formatlari qabul qilinadi
                    </p>
                  </div>
                  {selectedAudioFile && (
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                      <span>Fayl: <strong>{selectedAudioFile.name}</strong> ({fileSizeText})</span>
                      <button
                        type="button"
                        onClick={() => { setSelectedAudioFile(null); setLocalAudioBlobUrl(null); }}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode C: Direct Audio URL */}
              {sourceType === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={directAudioUrl}
                    onChange={(e) => setDirectAudioUrl(e.target.value)}
                    placeholder="https://example.com/audiobooks/sample-book.mp3"
                    className="w-full bg-[#1C140E] border border-orange-500/40 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                  />
                  <p className="text-[11px] text-stone-400">
                    To‘g‘ridan-to‘g‘ri internetdagi audio fayl havolasi (CDN, Cloud hosting yoki MP3 oqimi).
                  </p>
                </div>
              )}

              {/* LIVE AUDIO PREVIEW BAR */}
              {effectiveAudioUrl && (
                <div className="pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#1A120B] border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePreviewPlay}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer font-bold"
                        title={isPreviewPlaying ? "Pauza" : "Eshitib ko'rish"}
                      >
                        {isPreviewPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{isPreviewPlaying ? 'Audioni eshitib ko‘rmoqdasiz...' : 'Audioni sinab ko‘rish'}</span>
                          {isPreviewPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Davomiyligi: <span className="text-amber-300 font-mono">{audioDuration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-28 sm:w-40 h-2 bg-stone-900 rounded-full overflow-hidden border border-amber-950">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                        style={{ width: `${previewProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ASOSIY MA'LUMOTLAR */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio Kitob Maʼlumotlari</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Audio kitob nomi <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: O‘tkan kunlar (To‘liq audio asar)"
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Asar muallifi <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Masalan: Abdulla Qodiriy"
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Suxandon / Ovoz beruvchi (Narrator) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Mic2 className="w-3 h-3 text-amber-400" />
                      <span>Suxandon / Ovoz beruvchi</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Muhim</span>
                  </label>
                  <input
                    type="text"
                    value={narrator}
                    onChange={(e) => setNarrator(e.target.value)}
                    placeholder="Masalan: Afzal Rafiqov, Dilorom Karimova"
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Davomiyligi (Vaqt)</span>
                  </label>
                  <input
                    type="text"
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    placeholder="Masalan: 4 soat 20 daqiqa"
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Asosiy bo‘lim <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Ichki bo‘lim (Ixtiyoriy)
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Tanlanmagan</option>
                    {categories.find(c => c.id === categoryId)?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Asar tili
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as BookLanguage)}
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="O‘zbekcha">O‘zbekcha</option>
                    <option value="Ruscha">Ruscha</option>
                    <option value="Inglizcha">Inglizcha</option>
                  </select>
                </div>

                {/* Publication Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    Yozib olingan / Chiqarilgan yili
                  </label>
                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(Number(e.target.value))}
                    className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Audio kitob haqida qisqacha tavsif
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Audio kitob haqida maʼlumot, asar g‘oyasi va nima uchun uni tinglash tavsiya qilinishi..."
                  className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl p-3 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>
            </div>

            {/* 3. MUQOVA SOZLAMALARI */}
            <div className="p-4 rounded-2xl bg-black/20 border border-amber-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200">
                  Audio Kitob Muqovasi (Cover)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverType('auto')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      coverType === 'auto' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Avtomatik Audio Muqova (Tavsiya)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverType('custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      coverType === 'custom' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Rasm URL
                  </button>
                </div>
              </div>

              {coverType === 'auto' ? (
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  ✨ Kitob nomi, muallifi va suxandon maʼlumotlari asosida audio kitoblar uchun xos bo‘lgan hashamatli, naushniklar va tovush to‘lqinlari tasvirlangan professional muqova avtomatik tarzda yaratiladi.
                </p>
              ) : (
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full bg-[#1C140E] border border-amber-950/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            {/* 4. AUDIO BOBLAR / QISMLAR (OPTIONAL) */}
            <div className="p-4 rounded-2xl bg-black/20 border border-amber-950/80 space-y-3">
              <label className="text-xs font-bold text-stone-200 flex items-center justify-between">
                <span>Audio Qismlar / Boblar (Ixtiyoriy)</span>
                <span className="text-[11px] text-stone-400 font-mono">{chapters.length} ta qism</span>
              </label>

              <div className="space-y-2">
                {chapters.map((ch, idx) => (
                  <div key={ch.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1C140E] border border-amber-950/60 text-xs">
                    <span className="text-stone-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{ch.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(ch.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="Yangi qism nomi (masalan: 2-qism. Qahramonlar uchrashuvi)..."
                  className="flex-1 bg-[#1C140E] border border-amber-950/80 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChapter();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold cursor-pointer"
                >
                  Qo‘shish
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-stone-950 text-sm font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Headphones className="w-5 h-5 text-stone-950" />
                <span>Audio Kitobni Kutubxonaga Joylash</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE MOCKUP & PREVIEW (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Mockup in AudioBooksPage */}
          <div className="p-5 rounded-3xl bg-[#150F0A]/95 border border-amber-950/80 space-y-4 shadow-xl sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Jonli Ko‘rinish (Audio Card)</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                Preview
              </span>
            </div>

            {/* Audio Book Card Mockup */}
            <div className="rounded-2xl bg-[#1C140E] border border-amber-500/40 p-4 shadow-xl space-y-3">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black shadow-md group">
                <img 
                  src={effectiveCoverUrl} 
                  alt={title || 'Audio kitob'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                
                {/* Duration Badge */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-amber-300 text-[11px] font-mono backdrop-blur-md border border-amber-500/30 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{audioDuration || '3 soat'}</span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 ml-0.5 fill-current text-stone-950" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-semibold text-[11px]">
                    {categories.find(c => c.id === categoryId)?.name || 'Badiiy adabiyot'}
                  </span>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                    🎧 Audio
                  </span>
                </div>
                <h4 className="font-serif-title font-bold text-sm text-stone-100 line-clamp-1">
                  {title || 'Audio kitob nomi'}
                </h4>
                <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                  {authorName || 'Muallif ismi'}
                </p>
                <div className="text-[11px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
                  <Mic2 className="w-3 h-3 text-amber-400" />
                  <span>Suxandon: {narrator || 'Professional suxandon'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-300 space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Qayerlarda ko‘rinadi?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-400">
                <li><strong className="text-stone-200">🎧 Ovozli Kutubxona</strong> sahifasida</li>
                <li>Bosh sahifadagi Audio kitoblar bo‘limida</li>
                <li>Barcha kitoblar ro‘yxatida maxsus audio belgisi bilan</li>
                <li>Saytning pastki audio pleyerida to‘liq ijro etiladi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
