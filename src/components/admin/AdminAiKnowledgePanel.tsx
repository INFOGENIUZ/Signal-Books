import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Database, 
  FileText, 
  Link as LinkIcon, 
  ShieldCheck, 
  BarChart3, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  BookOpen,
  Send,
  HelpCircle,
  Brain
} from 'lucide-react';
import { KnowledgeSource, AiChatStats, KnowledgeSourceType, KnowledgeChunk } from '../../types/ai';
import { 
  fetchAdminKnowledgeSources, 
  addAdminKnowledgeSource, 
  fetchAiStats, 
  searchKnowledgeBaseLocally 
} from '../../services/aiKnowledgeService';
import { useLibrary } from '../../context/LibraryContext';
import { Icon3D } from '../common/Icon3D';

export const AdminAiKnowledgePanel: React.FC = () => {
  const { books, showToast } = useLibrary();

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [stats, setStats] = useState<AiChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for adding new source
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<KnowledgeSourceType>('official');
  const [newContent, setNewContent] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newLicense, setNewLicense] = useState('Public Domain / Official');

  // Search Tester state
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<KnowledgeChunk[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [srcs, st] = await Promise.all([
        fetchAdminKnowledgeSources(),
        fetchAiStats()
      ]);
      setSources(srcs);
      setStats(st);
    } catch {
      showToast('AI ma’lumotlarini yuklashda xatolik', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('Iltimos, sarlavha va kontentni kiriting', 'error');
      return;
    }

    const res = await addAdminKnowledgeSource({
      title: newTitle.trim(),
      type: newType,
      content: newContent.trim(),
      url: newUrl.trim() || undefined,
      author: newAuthor.trim() || undefined,
      license: newLicense.trim() || undefined,
    });

    if (res.success) {
      showToast('Yangi bilim manbai qo‘shildi va indekslandi!', 'success');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewUrl('');
      setNewAuthor('');
      loadData();
    } else {
      showToast(res.error || 'Qo‘shishda xatolik yuz berdi', 'error');
    }
  };

  const handleRunSearchTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    const res = searchKnowledgeBaseLocally(testQuery, books);
    setTestResults(res);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E140C] via-[#170E09] to-[#110B07] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Icon3D name="sparkles" size={18} />
            <span>AI RAG KNOWLEDGE BASE & SEARCH ENGINE</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            Signal Books AI Bilim Bazasi va Analytics
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            AI yordamchisi foydalanuvchilar savollariga aniq va ishonchli javob berishi uchun rasmiy ma’lumotlar, kitoblar, mualliflar va ochiq manbalarni boshqarish markazi.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
            <span>Yangi Bilim Manbai Qo‘shish</span>
          </button>
          <button
            onClick={loadData}
            className="p-3 rounded-2xl bg-[#1C140E] hover:bg-[#251B13] border border-amber-950 text-amber-300 transition-all cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Stats Overview Bento Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#150F0A] border border-amber-950/80 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-heading">Bugungi Savollar</span>
            <div className="text-3xl font-extrabold text-amber-300 font-serif-title">{stats.totalQuestionsToday}</div>
            <span className="text-[10px] text-stone-500 block">Foydalanuvchilar tomonidan berilgan</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#150F0A] border border-amber-950/80 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-heading">Jami Savollar</span>
            <div className="text-3xl font-extrabold text-stone-100 font-serif-title">{stats.totalQuestionsAllTime}</div>
            <span className="text-[10px] text-emerald-400 block">AI RAG tizimi orqali ishlangan</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#150F0A] border border-amber-950/80 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-heading">O‘rtacha Tezlik</span>
            <div className="text-3xl font-extrabold text-amber-400 font-serif-title">{stats.avgResponseTimeMs} ms</div>
            <span className="text-[10px] text-stone-500 block">Inference va semantic qidiruv vaqti</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#150F0A] border border-amber-950/80 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-heading">Manbalar Soni</span>
            <div className="text-3xl font-extrabold text-stone-100 font-serif-title">{sources.length} ta</div>
            <span className="text-[10px] text-amber-300 block">Aktiv indekslangan manba</span>
          </div>
        </div>
      )}

      {/* Grid: Sources Table & Live Search Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sources Table */}
        <div className="lg:col-span-2 space-y-4 p-6 rounded-3xl bg-[#140E0A] border border-amber-950/80 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading text-lg font-bold text-stone-100">
                Aktiv Bilim Manbalari (Knowledge Sources)
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-mono">{sources.length} ta manba</span>
          </div>

          <div className="space-y-3">
            {sources.map(src => (
              <div 
                key={src.id}
                className="p-4 rounded-2xl bg-[#1C140E] border border-stone-800/80 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      src.type === 'official' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : src.type === 'curated'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {src.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-stone-400 border border-stone-800">
                      {src.chunkCount} chunks
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-100 truncate">{src.title}</h4>
                  {src.description && (
                    <p className="text-xs text-stone-400 line-clamp-1">{src.description}</p>
                  )}
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-mono">
                      <span>{src.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{src.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Live RAG Search Tester */}
        <div className="p-6 rounded-3xl bg-[#140E0A] border border-amber-950/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-950/80">
            <Brain className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-base font-bold text-stone-100">
              RAG Qidiruv Testi (Live Search Tester)
            </h3>
          </div>

          <form onSubmit={handleRunSearchTest} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-stone-300 mb-1 block">Test savolini kiriting:</label>
              <div className="relative">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Masalan: Alpomish, Telegram bot, Badiiy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all cursor-pointer font-heading flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4 text-stone-950 stroke-[2.5]" />
              <span>Semantik Qidirish</span>
            </button>
          </form>

          {/* Test Results */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-300 block font-heading">
              Topilgan Segmentlar ({testResults.length}):
            </span>
            {testResults.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                {testResults.map((chunk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1C140E] border border-amber-950 text-xs text-stone-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                      <span>{chunk.metadata.title}</span>
                      <span>Score: {chunk.score}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-3">{chunk.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">Test uchun savol yozing va qidirib ko‘ring.</p>
            )}
          </div>
        </div>
      </div>

      {/* ADD KNOWLEDGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#140E0A] border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-950">
              <h3 className="font-heading text-lg font-bold text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Yangi AI Bilim Manbai Qo‘shish</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSourceSubmit} className="space-y-3.5 text-xs text-stone-300">
              <div>
                <label className="block font-bold mb-1">Manba Sarlavhasi / Hujjat Nomi *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Signal Books FAQ va Foydalanish Qoidalari"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Manba Turi</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as KnowledgeSourceType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-200 outline-none focus:border-amber-500"
                  >
                    <option value="official">Official (Rasmiy Signal Books)</option>
                    <option value="curated">Curated / Generated</option>
                    <option value="external">External (Ochiq internet manbasi)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Litsenziya / Manba Ma’lumoti</label>
                  <input
                    type="text"
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value)}
                    placeholder="Public Domain / CC-BY / Official"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Manba URL (agar mavjud bo‘lsa)</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://t.me/signal_books_bot"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-100 outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Muallif / Nashriyot</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Signal Books Content Team"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Matn va Bilim Kontenti *</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="AI yordamchisi foydalanishi uchun batafsil bilim matnini yoki hujjat qismlarini kiriting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-100 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer font-heading"
              >
                Manbani Indekslash va Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
