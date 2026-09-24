import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  Trash2, 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  BookMarked,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ChatMessage, Citation, RecommendedBookRef } from '../../types/ai';
import { sendAiChatMessage } from '../../services/aiKnowledgeService';
import { useLibrary } from '../../context/LibraryContext';
import { Icon3D } from '../common/Icon3D';

// Quick suggested prompt pills
const SUGGESTED_PROMPTS = [
  { icon: '📚', label: 'Kitob tavsiya qil', prompt: 'Menga o‘qish uchun qiziqarli kitoblar tavsiya et' },
  { icon: '🔎', label: 'Alpomish haqida', prompt: 'Alpomish dostoni haqida ma’lumot ber va uni qanday o‘qisa bo‘ladi?' },
  { icon: '📖', label: 'O‘tkan kunlar', prompt: 'Abdulla Qodiriyning O‘tkan kunlar romani mazmuni haqida ayt' },
  { icon: '🎧', label: 'Audio kitoblar', prompt: 'Kutubxonada qanday audio kitoblar mavjud?' },
  { icon: '❓', label: 'Signal Books nima?', prompt: 'Signal Books loyihasi nima va uning qanday qulayliklari bor?' },
];

export const AiChatDrawer: React.FC = () => {
  const { books, startReading, openBookDetails, setActivePage, activeAudioTrack } = useLibrary();

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAudioActive = Boolean(activeAudioTrack);

  // Initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      text: 'Salom! Men **Signal Books AI yordamchisiman**. Sizga kitoblar topish, asarlar mazmunini tushuntirish va kutubxona imkoniyatlari bo‘yicha yordam beraman. Nima haqida bilmoqchisiz?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (isOpen && hasUnread) {
      setHasUnread(false);
    }
  }, [isOpen, hasUnread]);

  // Auto-scroll to bottom on message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const res = await sendAiChatMessage(textToSend, messages, books);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.text,
        citations: res.citations,
        recommendedBooks: res.recommendedBooks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Kechirasiz, AI xizmatida vaqtinchalik uzilish yuz berdi. Iltimos, birozdan so‘ng qayta urinib ko‘ring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'ai',
        text: 'Suhbat tozalandi! Men **Signal Books AI Knowledge Assistant**man. Yordam berishga tayyorman.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to render simple Markdown (bold, lists, code)
  const renderMarkdownText = (text: string) => {
    let html = text;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Bullet points
    const lines = html.split('\n');
    const formattedLines = lines.map(line => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return `<li class="ml-4 list-disc text-amber-200/90 font-medium my-0.5">${line.trim().substring(2)}</li>`;
      }
      return line;
    });

    return <div dangerouslySetInnerHTML={{ __html: formattedLines.join('<br />') }} />;
  };

  return (
    <>
      {/* 1. FLOATING AI BUTTON (Bottom Right, shifts cleanly up when audio player is active) */}
      <div className={`fixed right-4 sm:right-6 z-[80] pointer-events-auto transition-all duration-300 ${
        isAudioActive 
          ? 'bottom-[156px] sm:bottom-[112px] lg:bottom-32' 
          : 'bottom-20 sm:bottom-6'
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative p-3 sm:p-3.5 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.45)] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2.5 border
            ${isOpen 
              ? 'bg-[#18110B] border-amber-500/60 text-amber-300' 
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold border-amber-300/80 hover:scale-105'}
          `}
          title="Signal Books AI yordamchisi"
          aria-label="AI Yordamchi Chat"
        >
          {/* 3D Robot icon */}
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 text-amber-400" />
            ) : (
              <div className="flex items-center gap-2">
                <Icon3D name="bot" size={28} className="shrink-0" />
                <span className="hidden sm:inline font-heading text-xs uppercase tracking-wider font-extrabold pr-1">
                  AI Yordamchi
                </span>
              </div>
            )}
          </div>

          {/* Unread indicator */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#0C0A08] shadow-[0_0_8px_#f43f5e]" />
          )}
        </button>
      </div>

      {/* 2. CHAT DRAWER PANEL */}
      {isOpen && (
        <div className={`fixed inset-0 sm:inset-auto sm:right-6 sm:w-[420px] sm:h-[620px] z-[90] flex flex-col bg-[#110D09]/98 sm:rounded-3xl border border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden animate-fade-in transition-all duration-300 ${
          isAudioActive ? 'sm:bottom-28' : 'sm:bottom-24'
        }`}>
          {/* Header */}
          <div className="p-4 sm:p-4 bg-gradient-to-r from-[#1E140C] via-[#160E09] to-[#120B06] border-b border-amber-500/30 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Icon3D name="bot" size={26} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-extrabold text-stone-100 text-sm sm:text-base tracking-tight">
                    Signal Books <span className="text-amber-400">AI</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    RAG Knowledge Engine
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Kutubxona, darsliklar va kitoblar bo‘yicha aqlli yordamchi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 transition-colors cursor-pointer"
                title="Suhbatni tozalash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-200 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1 font-mono">
                    <span>{isUser ? 'Siz' : 'Signal Books AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className={`p-3.5 sm:p-4 rounded-2xl max-w-[88%] leading-relaxed border shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-medium rounded-tr-none border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#18110B] text-stone-200 rounded-tl-none border-amber-950/80'
                  }`}>
                    {renderMarkdownText(msg.text)}

                    {/* Recommended Book Cards embedded directly in response */}
                    {msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-amber-900/40 space-y-2">
                        <span className="text-[11px] font-bold text-amber-300 block font-heading">
                          📚 Tavsiya etilgan kitoblar:
                        </span>
                        <div className="space-y-2">
                          {msg.recommendedBooks.map((rec) => {
                            const fullBook = books.find(b => b.id === rec.id);
                            return (
                              <div 
                                key={rec.id}
                                className="p-2.5 rounded-xl bg-[#221710] border border-amber-500/30 flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {rec.coverUrl ? (
                                    <img src={rec.coverUrl} alt={rec.title} className="w-9 h-12 rounded object-cover shrink-0 shadow" />
                                  ) : (
                                    <div className="w-9 h-12 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                                      <BookOpen className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-xs text-stone-100 truncate">{rec.title}</h5>
                                    <p className="text-[10px] text-amber-400/90 truncate">{rec.authorName}</p>
                                    <span className="text-[9px] text-stone-400 block font-mono">{rec.categoryName}</span>
                                  </div>
                                </div>

                                {fullBook && (
                                  <button
                                    onClick={() => {
                                      startReading(fullBook);
                                      setIsOpen(false);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] shrink-0 transition-all cursor-pointer font-heading flex items-center gap-1 shadow-sm"
                                  >
                                    <span>O‘qish</span>
                                    <ArrowRight className="w-3 h-3 text-stone-950" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Citations Expander */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-amber-950/80">
                        <button
                          onClick={() => setExpandedCitationId(expandedCitationId === msg.id ? null : msg.id)}
                          className="flex items-center justify-between w-full text-[10px] text-amber-400 font-bold font-mono hover:underline cursor-pointer"
                        >
                          <span>📌 Manbalar va asoslar ({msg.citations.length})</span>
                          {expandedCitationId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {expandedCitationId === msg.id && (
                          <div className="mt-2 space-y-1.5 text-[10px] text-stone-300 font-mono bg-[#110B07] p-2 rounded-xl border border-amber-950">
                            {msg.citations.map((c, i) => (
                              <div key={i} className="flex items-start gap-1.5 border-b border-amber-950/60 pb-1 last:border-0 last:pb-0">
                                <span className="text-amber-400 font-bold">[{i + 1}]</span>
                                <div>
                                  <span className="font-semibold text-stone-200">{c.title}</span>
                                  <span className="block text-[9px] text-stone-500">
                                    {c.sourceName} • {c.type === 'official' ? 'Rasmiy manba' : 'Ochiq ma’lumot'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] text-stone-400 font-mono px-1">Signal Books AI javob tayyorlamoqda...</span>
                <div className="p-3.5 rounded-2xl bg-[#18110B] border border-amber-950 rounded-tl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Carousel */}
          {messages.length < 5 && !isLoading && (
            <div className="p-2.5 px-3 bg-[#130E09] border-t border-amber-950/80 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
              {SUGGESTED_PROMPTS.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sp.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-[#1D140E] hover:bg-amber-500/20 border border-amber-950 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 text-[11px] font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{sp.icon}</span>
                  <span>{sp.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#130E09] border-t border-amber-500/30 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kitoblar, mualliflar yoki platforma bo‘yicha savol bering..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1B130D] border border-amber-950/80 focus:border-amber-500 text-xs text-stone-100 placeholder-stone-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-stone-950 font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              title="Yuborish"
            >
              <Send className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
