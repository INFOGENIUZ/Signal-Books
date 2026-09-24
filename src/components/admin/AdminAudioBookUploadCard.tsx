import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Upload, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  Mic2, 
  Music, 
  Plus, 
  Trash2, 
  FileAudio, 
  Link as LinkIcon, 
  ExternalLink,
  Sparkles,
  Palette,
  Volume2,
  AlertCircle,
  X
} from 'lucide-react';
import { Category, BookLanguage, Book } from '../../types';
import { 
  parseGoogleDriveUrl, 
  generateAudioBookCover, 
  getDirectAudioUrl,
  getGoogleDrivePreviewUrl 
} from '../../utils/googleDrive';

interface AdminAudioBookUploadCardProps {
  categories: Category[];
  authors: { id: string; name: string }[];
  onAddAudioBook: (bookData: Partial<Book>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onCancel?: () => void;
}

type CoverStyle = 'gold' | 'emerald' | 'sapphire' | 'violet';

export const AdminAudioBookUploadCard: React.FC<AdminAudioBookUploadCardProps> = ({
  categories,
  authors,
  onAddAudioBook,
  showToast,
  onCancel
}) => {
  // Source selector: 'drive' | 'file' | 'url'
  const [sourceType, setSourceType] = useState<'drive' | 'file' | 'url'>('drive');
  
  // Book Metadata
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [narrator, setNarrator] = useState('Afzal Rafiqov');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [language, setLanguage] = useState<BookLanguage>('O‘zbekcha');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [audioDuration, setAudioDuration] = useState('3 soat 15 daqiqa');
  
  // Audio sources
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [directAudioUrl, setDirectAudioUrl] = useState('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [localAudioBlobUrl, setLocalAudioBlobUrl] = useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = useState('35 MB');

  // Cover image settings
  const [coverType, setCoverType] = useState<'auto' | 'custom'>('auto');
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('gold');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Chapters list
  const [chapters, setChapters] = useState<{ id: string; title: string; pageNumber: number }[]>([
    { id: 'ch-1', title: '1-qism. Kirish va boshlanishi', pageNumber: 1 }
  ]);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Audio test playback state
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testError, setTestError] = useState<string | null>(null);
  const [showDriveEmbedModal, setShowDriveEmbedModal] = useState(false);
  
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Google Drive
  const driveInfo = useMemo(() => {
    return parseGoogleDriveUrl(googleDriveUrl);
  }, [googleDriveUrl]);

  // Determine working direct stream URL
  const effectiveAudioUrl = useMemo(() => {
    if (sourceType === 'drive') {
      if (driveInfo.isDrive && driveInfo.fileId) {
        return `/api/drive-audio?id=${driveInfo.fileId}`;
      }
      return googleDriveUrl.trim();
    } else if (sourceType === 'file') {
      return localAudioBlobUrl || '';
    } else {
      return directAudioUrl.trim();
    }
  }, [sourceType, driveInfo, googleDriveUrl, localAudioBlobUrl, directAudioUrl]);

  // Clean, high-fidelity SVG cover
  const autoCoverUrl = useMemo(() => {
    const targetCat = categories.find(c => c.id === categoryId);
    return generateAudioBookCover(
      title || 'Audio Kitob Nomi',
      authorName || 'Asar Muallifi',
      narrator || 'Professional suxandon',
      targetCat?.name || 'Badiiy adabiyot',
      publicationYear,
      coverStyle
    );
  }, [title, authorName, narrator, categoryId, publicationYear, coverStyle, categories]);

  const effectiveCoverUrl = coverType === 'custom' && customCoverUrl.trim()
    ? customCoverUrl.trim()
    : autoCoverUrl;

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (localAudioBlobUrl && localAudioBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localAudioBlobUrl);
      }
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current = null;
      }
    };
  }, [localAudioBlobUrl]);

  // Handle local file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|m4a|wav|aac|ogg|flac)$/i)) {
      showToast('Iltimos, haqiqiy audio fayl (.mp3, .m4a, .wav) tanlang', 'error');
      return;
    }

    setSelectedAudioFile(file);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeText(`${sizeInMb} MB`);

    const blobUrl = URL.createObjectURL(file);
    setLocalAudioBlobUrl(blobUrl);

    // Auto title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
    if (!title) {
      setTitle(cleanName);
    }

    // Auto calculate duration
    const tempAudio = new Audio(blobUrl);
    tempAudio.onloadedmetadata = () => {
      const dur = tempAudio.duration;
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

    setTestError(null);
    showToast(`«${file.name}» audio fayli tanlandi (${sizeInMb} MB)`, 'success');
  };

  // Toggle Test Playback
  const toggleTestPlay = () => {
    if (!effectiveAudioUrl) {
      showToast('Audio manbasi topilmadi', 'error');
      return;
    }

    setTestError(null);

    if (!testAudioRef.current) {
      testAudioRef.current = new Audio();
      
      testAudioRef.current.ontimeupdate = () => {
        if (testAudioRef.current && testAudioRef.current.duration) {
          setTestProgress((testAudioRef.current.currentTime / testAudioRef.current.duration) * 100);
        }
      };
      testAudioRef.current.onended = () => {
        setIsPlayingTest(false);
        setTestProgress(0);
      };
      testAudioRef.current.onerror = () => {
        setIsPlayingTest(false);
        setTestError('Audio oqimini to‘g‘ridan-to‘g‘ri ochib bo‘lmadi. Google Drive pleyerida sinab ko‘ring.');
      };
    }

    const audio = testAudioRef.current;

    if (isPlayingTest) {
      audio.pause();
      setIsPlayingTest(false);
    } else {
      if (audio.src !== effectiveAudioUrl && !audio.src.endsWith(effectiveAudioUrl)) {
        audio.src = effectiveAudioUrl;
        audio.load();
      }
      audio.play()
        .then(() => {
          setIsPlayingTest(true);
          setTestError(null);
        })
        .catch((err) => {
          console.warn('Audio test play error:', err);
          setIsPlayingTest(false);
          setTestError('Brauzerda to‘g‘ridan-to‘g‘ri eshitib bo‘lmadi. Google Drive pleyerini oching.');
        });
    }
  };

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

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !authorName.trim()) {
      showToast('Kitob nomi va muallifini kiriting', 'error');
      return;
    }

    if (!effectiveAudioUrl && !googleDriveUrl.trim()) {
      showToast('Iltimos, audio fayl tanlang yoki Google Drive havolasini kiriting', 'error');
      return;
    }

    const targetCategory = categories.find(c => c.id === categoryId) || categories[0];
    const targetSubCategory = targetCategory?.subcategories?.find(s => s.id === subcategoryId);
    const matchedAuthor = authors.find(a => a.name.toLowerCase() === authorName.trim().toLowerCase());

    // Resolve final persistent audio URL
    let finalAudioUrl = effectiveAudioUrl;
    if (sourceType === 'drive' && driveInfo.isDrive && driveInfo.fileId) {
      finalAudioUrl = `/api/drive-audio?id=${driveInfo.fileId}`;
    }

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
      audioUrl: finalAudioUrl,
      audioDuration: audioDuration.trim() || '3 soat 20 daqiqa',
      hasAudio: true,
      googleDriveUrl: sourceType === 'drive' ? googleDriveUrl.trim() : undefined,
      pdfUrl: '#',
      pages: 0,
      publicationYear: Number(publicationYear) || new Date().getFullYear(),
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
    showToast(`«${title}» audio kitobi muvaffaqiyatli saqlandi! 🎧`, 'success');

    // Reset Form
    setTitle('');
    setAuthorName('');
    setGoogleDriveUrl('');
    setDirectAudioUrl('');
    setSelectedAudioFile(null);
    setLocalAudioBlobUrl(null);
    setDescription('');
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      setIsPlayingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#140F0B] border border-amber-900/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Headphones className="w-4 h-4" />
              <span>OVOZLI KUTUBXONA STUDIYASI</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
              Yangi Audio Kitob Joylash
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Google Drive MP3 havolasi yoki to‘g‘ridan-to‘g‘ri audio fayl orqali sifatli ovozli asar qo‘shing. Tizim avtomatik pleyer va audio muqova sozlamalarini yaratadi.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 transition-colors"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: UPLOAD CONTROLS (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-[#120E0A] border border-amber-900/30 space-y-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. AUDIO SOURCE SECTION */}
            <div className="p-5 rounded-2xl bg-[#18120C] border border-amber-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Audio Manbasini Tanlang</span>
                </div>
                <span className="text-[11px] text-amber-400 font-medium">
                  Majburiy
                </span>
              </div>

              {/* Source Switcher Buttons */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#0D0A08] border border-amber-950">
                <button
                  type="button"
                  onClick={() => { setSourceType('drive'); setTestError(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'drive'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceType('file'); setTestError(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'file'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fayl (.mp3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceType('url'); setTestError(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'url'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Audio URL</span>
                </button>
              </div>

              {/* A: Google Drive Mode */}
              {sourceType === 'drive' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="url"
                    value={googleDriveUrl}
                    onChange={(e) => {
                      setGoogleDriveUrl(e.target.value);
                      setTestError(null);
                    }}
                    placeholder="https://drive.google.com/file/d/1AbcXYZ.../view?usp=sharing"
                    className="w-full bg-[#110D09] border border-amber-900/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[11px] text-stone-400">
                    Google Drive audio fayl havolasi. Fayl huquqini <strong className="text-amber-300">«Anyone with the link can view»</strong> qilib qo‘yish lozim.
                  </p>
                  
                  {driveInfo.isDrive && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Google Drive Fayl ID: <code className="text-white font-mono bg-emerald-900/50 px-1.5 py-0.5 rounded">{driveInfo.fileId}</code></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDriveEmbedModal(true)}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Drive pleyerini ko‘rish</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* B: Local File Picker */}
              {sourceType === 'file' && (
                <div className="space-y-3 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAudioFileChange}
                    accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-amber-900/60 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-stone-200">
                      {selectedAudioFile ? selectedAudioFile.name : 'Audio faylni tanlash uchun bosing'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      MP3, M4A, WAV formatlari qabul qilinadi
                    </p>
                  </div>
                  {selectedAudioFile && (
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                      <span>Fayl: <strong>{selectedAudioFile.name}</strong> ({fileSizeText})</span>
                      <button
                        type="button"
                        onClick={() => { setSelectedAudioFile(null); setLocalAudioBlobUrl(null); }}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* C: Direct Audio URL */}
              {sourceType === 'url' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="url"
                    value={directAudioUrl}
                    onChange={(e) => {
                      setDirectAudioUrl(e.target.value);
                      setTestError(null);
                    }}
                    placeholder="https://cdn.example.com/audio/asar.mp3"
                    className="w-full bg-[#110D09] border border-amber-900/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[11px] text-stone-400">
                    To‘g‘ridan-to‘g‘ri internetdagi MP3/M4A oqimi havolasi.
                  </p>
                </div>
              )}

              {/* LIVE AUDIO TEST BAR */}
              {effectiveAudioUrl && (
                <div className="pt-2 border-t border-amber-950/80">
                  <div className="p-3 rounded-xl bg-[#100C08] border border-amber-900/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleTestPlay}
                        className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer font-bold shrink-0"
                        title={isPlayingTest ? "Pauza" : "Eshitib ko'rish"}
                      >
                        {isPlayingTest ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-semibold text-stone-100 flex items-center gap-1.5">
                          <span>{isPlayingTest ? 'Ijro etilmoqda...' : 'Audioni sinab ko‘rish'}</span>
                          {isPlayingTest && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Kutilgan davomiylik: <span className="text-amber-300 font-mono">{audioDuration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 sm:w-36 h-1.5 bg-stone-900 rounded-full overflow-hidden border border-amber-950">
                        <div 
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${testProgress}%` }}
                        />
                      </div>

                      {driveInfo.isDrive && (
                        <button
                          type="button"
                          onClick={() => setShowDriveEmbedModal(true)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 whitespace-nowrap"
                          title="Google Drive rasmiy pleyerida ochish"
                        >
                          Drive Pleyer
                        </button>
                      )}
                    </div>
                  </div>

                  {testError && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{testError}</span>
                      </div>
                      {driveInfo.isDrive && (
                        <button
                          type="button"
                          onClick={() => setShowDriveEmbedModal(true)}
                          className="text-amber-300 underline font-semibold cursor-pointer shrink-0"
                        >
                          Drive orqali eshitish
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. AUDIO METADATA */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Asosiy Maʼlumotlar
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Audio kitob nomi <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: O‘tkan kunlar (Audio asar)"
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Asar muallifi <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Masalan: Abdulla Qodiriy"
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Narrator */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Mic2 className="w-3 h-3 text-amber-400" />
                      <span>Suxandon / Ovoz beruvchi</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={narrator}
                    onChange={(e) => setNarrator(e.target.value)}
                    placeholder="Masalan: Afzal Rafiqov, Dilorom Karimova"
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Davomiyligi</span>
                  </label>
                  <input
                    type="text"
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    placeholder="Masalan: 4 soat 20 daqiqa"
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Bo‘lim <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Ichki bo‘lim (Ixtiyoriy)
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Tanlanmagan</option>
                    {categories.find(c => c.id === categoryId)?.subcategories?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Asar tili
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as BookLanguage)}
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="O‘zbekcha">O‘zbekcha</option>
                    <option value="Ruscha">Ruscha</option>
                    <option value="Inglizcha">Inglizcha</option>
                  </select>
                </div>

                {/* Publication Year */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-300">
                    Yozib olingan / Chiqarilgan yili
                  </label>
                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(Number(e.target.value))}
                    className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-medium text-stone-300">
                  Audio kitob tavsifi
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Asar mazmuni, nima uchun uni tinglash tavsiya qilinishi va suxandon haqida maʼlumot..."
                  className="w-full bg-[#16100C] border border-amber-900/40 rounded-xl p-3 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>
            </div>

            {/* 3. COVER STYLE PICKER */}
            <div className="p-4 rounded-xl bg-[#18120C] border border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Audio Muqova Uslubi</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCoverType('auto')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      coverType === 'auto' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Avtomatik Dizayn
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverType('custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      coverType === 'custom' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Rasm URL
                  </button>
                </div>
              </div>

              {coverType === 'auto' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gold', name: 'Oltin Studio', color: 'from-amber-500 to-yellow-600' },
                      { id: 'emerald', name: 'Zumrad', color: 'from-emerald-500 to-teal-700' },
                      { id: 'sapphire', name: 'Sapfir', color: 'from-sky-500 to-blue-700' },
                      { id: 'violet', name: 'Nilufar', color: 'from-purple-500 to-fuchsia-700' }
                    ].map(styleOpt => (
                      <button
                        key={styleOpt.id}
                        type="button"
                        onClick={() => setCoverStyle(styleOpt.id as CoverStyle)}
                        className={`p-2 rounded-xl text-center border transition-all text-xs flex flex-col items-center gap-1.5 ${
                          coverStyle === styleOpt.id
                            ? 'border-amber-400 bg-amber-500/10 text-white font-bold shadow-sm'
                            : 'border-stone-800 bg-[#110D09] text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${styleOpt.color}`} />
                        <span className="text-[11px]">{styleOpt.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Kitob nomi, muallifi va suxandon maʼlumotlari asosida audio kitoblar uchun xos bo‘lgan hashamatli SVG muqova yaratiladi.
                  </p>
                </div>
              ) : (
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full bg-[#110D09] border border-amber-900/50 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            {/* 4. CHAPTERS BUILDER */}
            <div className="p-4 rounded-xl bg-[#18120C] border border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-200">
                <span>Audio Boblar va Qismlar</span>
                <span className="text-[11px] text-stone-400 font-mono">{chapters.length} ta bob</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {chapters.map((ch, idx) => (
                  <div key={ch.id} className="flex items-center justify-between p-2 rounded-lg bg-[#110D09] border border-amber-950 text-xs">
                    <span className="text-stone-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{ch.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(ch.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
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
                  className="flex-1 bg-[#110D09] border border-amber-900/50 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
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
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold shrink-0"
                >
                  Qo‘shish
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Headphones className="w-4 h-4 text-stone-950" />
                <span>Audio Kitobni Saqlash va Kutubxonaga Joylash</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SQUARE AUDIOBOOK CARD MOCKUP (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          <div className="p-5 rounded-2xl bg-[#120E0A] border border-amber-900/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Jonli Ko‘rinish
              </span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                1:1 Standart Format
              </span>
            </div>

            {/* Square 1:1 Audiobook Card */}
            <div className="rounded-2xl bg-[#17110C] border border-amber-900/40 p-4 shadow-xl space-y-3 relative group">
              {/* Vinyl record disc peeking out */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black shadow-lg">
                <img 
                  src={effectiveCoverUrl} 
                  alt={title || 'Audio kitob'} 
                  className="w-full h-full object-cover"
                />
                
                {/* Play button overlay */}
                <button
                  type="button"
                  onClick={toggleTestPlay}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isPlayingTest
                      ? 'bg-amber-400 text-stone-950 scale-110 shadow-[0_0_20px_#f59e0b]'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950 group-hover:scale-105'
                  }`}
                  title={isPlayingTest ? "Pauza" : "Tinglab ko'rish"}
                >
                  {isPlayingTest ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Duration Tag */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/80 text-amber-300 text-[11px] font-mono backdrop-blur-sm border border-amber-500/30 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{audioDuration || 'Davomiylik'}</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="text-[11px] text-amber-400 font-medium">
                  {categories.find(c => c.id === categoryId)?.name || 'Kategoriya'}
                </div>
                <h4 className="font-serif-title font-bold text-sm text-stone-100 line-clamp-1">
                  {title || 'Kitob nomi kiritiladi...'}
                </h4>
                <div className="text-xs text-stone-400">
                  {authorName || 'Muallif nomi'}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center gap-1 pt-0.5">
                  <Mic2 className="w-3 h-3 text-amber-400/80" />
                  <span>Ovoz beruvchi: <strong className="text-stone-300">{narrator || 'Suxandon'}</strong></span>
                </div>
              </div>
            </div>

            {/* Drive info card */}
            {driveInfo.isDrive && (
              <div className="p-3 rounded-xl bg-[#17110C] border border-amber-900/30 text-xs text-stone-400 space-y-1">
                <div className="text-stone-300 font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Drive Integratsiyasi</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Fayl server orqali to‘g‘ridan-to‘g‘ri brauzerda oqimlanadi. Agar tarmoq yoki Google cheklovi bo‘lsa, foydalanuvchilar o‘rnatilgan Drive pleyeri orqali tinglashlari mumkin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Built-in Preview Modal */}
      {showDriveEmbedModal && driveInfo.isDrive && driveInfo.fileId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#140E0A] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif-title text-base font-bold text-stone-100">
                  Google Drive Audio Pleyeri
                </h3>
              </div>
              <button
                onClick={() => setShowDriveEmbedModal(false)}
                className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-stone-800">
              <iframe
                src={`https://drive.google.com/file/d/${driveInfo.fileId}/preview`}
                className="w-full h-full"
                allow="autoplay"
                title="Google Drive Audio Preview"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
              <span>Google Drive rasmiy HTML5 pleyeri</span>
              <button
                onClick={() => setShowDriveEmbedModal(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold"
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
