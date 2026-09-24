import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Upload, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  FileCheck,
  Tag,
  Clock,
  Wand2,
  Key
} from 'lucide-react';
import { Category } from '../../types';
import { AiBookAnalysisResult, analyzeBookWithAI } from '../../services/aiBookAnalysisService';

interface AiBookAnalysisCardProps {
  googleDriveUrl: string;
  categories: Category[];
  onApplyAnalysis: (analysis: AiBookAnalysisResult) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentTitle?: string;
}

export const AiBookAnalysisCard: React.FC<AiBookAnalysisCardProps> = ({
  googleDriveUrl,
  categories,
  onApplyAnalysis,
  showToast,
  currentTitle
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiBookAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [customHint, setCustomHint] = useState('');
  const [showHintInput, setShowHintInput] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveGroqKey = (val: string) => {
    const trimmed = val.trim();
    setGroqApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('groq_api_key', trimmed);
      showToast('Groq API kaliti saqlandi', 'success');
    } else {
      localStorage.removeItem('groq_api_key');
      showToast('Groq API kaliti olib tashlandi', 'info');
    }
  };

  // Trigger AI Analysis
  const handleStartAnalysis = async (overrideBase64?: string, overrideHint?: string) => {
    if (!googleDriveUrl.trim() && !overrideBase64 && !uploadedBase64) {
      showToast('Iltimos, avval Google Drive havolasini kiriting yoki PDF fayl tanlang', 'info');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const hintToUse = overrideHint !== undefined ? overrideHint : (customHint.trim() || currentTitle || '');
    let base64ToUse = overrideBase64 || uploadedBase64 || undefined;
    if (base64ToUse && base64ToUse.length > 2.5 * 1024 * 1024) {
      base64ToUse = base64ToUse.slice(0, 2.5 * 1024 * 1024);
    }

    try {
      const res = await analyzeBookWithAI({
        googleDriveUrl: googleDriveUrl.trim() || undefined,
        pdfBase64: base64ToUse,
        titleHint: hintToUse || undefined,
        categories
      });

      if (res.success && res.analysis) {
        setAnalysisResult(res.analysis);
        onApplyAnalysis(res.analysis);
        showToast(`«${res.analysis.title}» kitobi AI tomonidan tahlil qilindi va maydonlar to‘ldirildi!`, 'success');
      } else {
        setAnalysisError(res.error || 'Kitobni to‘liq tahlil qilib bo‘lmadi.');
        if (res.analysis) {
          // Partial/fallback analysis available
          setAnalysisResult(res.analysis);
          onApplyAnalysis(res.analysis);
        }
        showToast(res.error || 'Tahlil jarayonida ogohlantirish yuz berdi', 'error');
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Kutilmagan xatolik yuz berdi');
      showToast('AI tahlilida xatolik yuz berdi', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle local PDF upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Faqat PDF formatdagi fayl qabul qilinadi', 'error');
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result as string;
      // Vercel serverless request body has 4.5MB limit. Slice base64 if oversized
      if (base64.length > 2.5 * 1024 * 1024) {
        base64 = base64.slice(0, 2.5 * 1024 * 1024);
      }
      setUploadedBase64(base64);
      showToast(`«${file.name}» tanlandi. AI tahlili boshlanmoqda...`, 'info');
      // Auto-trigger analysis for uploaded PDF
      handleStartAnalysis(base64, file.name.replace(/\.pdf$/i, ''));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#1E140C] via-[#160E08] to-[#110A05] p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4">
      
      {/* Decorative ambient background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-100 flex items-center gap-1.5">
                <span>AI Kitob Tahlilchisi</span>
                <span className="text-orange-400 font-sans text-xs sm:text-sm font-semibold">(Groq LPU / Llama 3.3)</span>
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Groq API
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2-3 Sahifa Tahlili
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Groq LPU texnologiyasi orqali kitobning 1–3-sahifalarini (titul, annotatsiya va mundarija) chaqmoq tezligida tahlil qiladi.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleStartAnalysis()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Kitob tahlil qilinmoqda...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>AI orqali tahlil qilish</span>
              </>
            )}
          </button>

          {/* Local PDF upload shortcut */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Kompyuterdan PDF tanlab tahlil qilish"
            className="p-2.5 rounded-2xl bg-[#281B12] hover:bg-[#342318] text-amber-300 hover:text-white border border-amber-500/30 transition-colors active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Vercel / Groq API key configuration toggle */}
          <button
            type="button"
            onClick={() => setShowApiKeySetting(prev => !prev)}
            title="Groq API / Vercel sozlamalari"
            className={`p-2.5 rounded-2xl border transition-colors active:scale-95 cursor-pointer ${
              groqApiKey 
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40' 
                : 'bg-[#281B12] hover:bg-[#342318] text-amber-300 hover:text-white border-amber-500/30'
            }`}
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Groq API Key / Vercel Settings Panel */}
      {showApiKeySetting && (
        <div className="p-3.5 rounded-2xl bg-[#23170e] border border-amber-500/30 space-y-2.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Groq API Kaliti (Vercel & Bulut uchun)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {groqApiKey ? 'Faol' : 'Avtomatik Smart Classifier'}
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Vercel deploy qilganda AI to‘liq ishlashi uchun Groq API kalitini shu yerga kiritishingiz mumkin (yoki Vercel Project Settings da <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> qo‘shishingiz mumkin). Agar kalit bo‘lmasa ham, o‘rnatilgan aqlli tahlil mexanizmi (smart classifier) uzluksiz ishlaydi.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="gsk_..."
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleSaveGroqKey(groqApiKey)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Saqlash
            </button>
            {groqApiKey && (
              <button
                type="button"
                onClick={() => handleSaveGroqKey('')}
                className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-300 text-xs transition-colors cursor-pointer"
              >
                O‘chirish
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected file indicator if local PDF chosen */}
      {selectedFileName && (
        <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Fayl tanlandi: <strong>{selectedFileName}</strong></span>
          </div>
          <button 
            type="button" 
            onClick={() => { setSelectedFileName(null); setUploadedBase64(null); }}
            className="text-[11px] text-amber-400 hover:underline"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* Advanced Hint Input Toggle */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={() => setShowHintInput(prev => !prev)}
          className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="w-3 h-3 text-amber-400" />
          <span>{showHintInput ? 'Qo‘shimcha ko‘rsatmani yashirish' : 'Qo‘shimcha kitob nomi / muallif ko‘rsatmasi (ixtiyoriy)'}</span>
        </button>

        {analysisResult && (
          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>{showDetails ? 'Tahlil hisobotini yig‘ish' : 'Tahlil hisobotini ko‘rish'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {showHintInput && (
        <div className="p-3 rounded-2xl bg-[#140D08] border border-amber-900/60 flex gap-2">
          <input
            type="text"
            value={customHint}
            onChange={(e) => setCustomHint(e.target.value)}
            placeholder="Masalan: Abdulla Qodiriy O‘tkan kunlar (yoki fayl nomi)"
            className="flex-1 bg-[#1F150E] border border-amber-950/90 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={() => handleStartAnalysis(undefined, customHint)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/40"
          >
            Qayta
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <div className="text-xs text-amber-200 font-medium">
              Google Drive PDF hujjati yuklanmoqda va 1–3-sahifalari tahlil qilinmoqda...
            </div>
          </div>
          <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 h-full w-2/3 animate-[pulse_1.5s_infinite]" />
          </div>
          <p className="text-[11px] text-stone-400">
            Muallif, asar nomi, janr, o‘quv sinfi va annotatsiya Groq LPU (Llama 3.3 70B) orqali chaqmoq tezligida aniqlanmoqda.
          </p>
        </div>
      )}

      {/* Error state */}
      {analysisError && !isAnalyzing && (
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Tahlil jarayonida eslatma:</div>
            <div className="text-[11px] text-rose-200/90 leading-relaxed">{analysisError}</div>
            <div className="text-[10px] text-stone-400 pt-0.5">
              Havolaning ochiqligini (Anyone with the link) tekshiring, kompyuterdan PDF yuklang yoki AI Studio Secrets bo‘limida GROQ_API_KEY mavjudligini tasdiqlang.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RESULT AUDIT & INSPECTOR PANEL (User Requirement)             */}
      {/* ============================================================== */}
      {analysisResult && !isAnalyzing && (
        <div className="rounded-2xl border border-emerald-500/40 bg-[#120E0A] p-4 sm:p-5 space-y-4 shadow-inner">
          {/* Header of Inspector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-950/80">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                AI Tahlil Natijalari (Avtomatik to‘ldirildi)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {analysisResult.provider === 'gemini' ? 'Gemini 3.8 Flash' : 'Groq LPU (Llama 3.3)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                {analysisResult.confidence}% ishonchlilik
              </span>

              <button
                type="button"
                onClick={() => handleStartAnalysis()}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                title="Qayta tahlil qilish"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Qayta tahlil</span>
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="space-y-3.5 text-xs">
              {/* Grid of detected metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>Kitob nomi</span>
                  </div>
                  <div className="font-bold text-stone-100 text-sm line-clamp-1">
                    {analysisResult.title}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                    <FileCheck className="w-3 h-3 text-amber-400" />
                    <span>Muallif</span>
                  </div>
                  <div className="font-bold text-stone-100 text-sm line-clamp-1">
                    {analysisResult.authorName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>Bo‘lim & Sinf</span>
                  </div>
                  <div className="font-bold text-amber-300 text-xs">
                    {analysisResult.categoryName}
                    {analysisResult.subcategoryName && (
                      <span className="text-stone-300 font-normal ml-1">
                        • {analysisResult.subcategoryName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Nashr yili & Til</span>
                  </div>
                  <div className="text-stone-200 font-medium">
                    {analysisResult.publicationYear}-yil • {analysisResult.language}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-amber-400" />
                    <span>Sahifalar soni</span>
                  </div>
                  <div className="text-stone-200 font-bold font-mono">
                    ~{analysisResult.pages} sahifa
                  </div>
                </div>

                {analysisResult.keyTopics && analysisResult.keyTopics.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#1A120B] border border-amber-950/80 space-y-1">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>Kalit mavzular</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.keyTopics.map((topic, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Explanation Box */}
              {analysisResult.summaryOfAnalysis && (
                <div className="p-3 rounded-xl bg-[#17100B] border border-amber-950/90 text-stone-300 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    <span>AI qanday xulosaga keldi (1–3-sahifalar tahlili):</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed italic">
                    «{analysisResult.summaryOfAnalysis}»
                  </p>
                </div>
              )}

              {/* Description preview */}
              <div className="p-3 rounded-xl bg-[#17100B] border border-amber-950/90 text-stone-300 space-y-1">
                <div className="text-[11px] font-semibold text-stone-400">
                  Kitob annotatsiyasi (Formadagi tavsif maydoniga joylandi):
                </div>
                <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                  {analysisResult.description}
                </p>
              </div>

              {/* Notice for admin */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Maʼlumotlar quyidagi formaga avtomatik joylashtirildi. Xohlagan maydonni qo‘lda o‘zgartirishingiz mumkin.</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => onApplyAnalysis(analysisResult)}
                  className="text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  Maydonlarni qayta to‘ldirish
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
