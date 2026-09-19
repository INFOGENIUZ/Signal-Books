import React, { useState } from 'react';
import { 
  BookMarked, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Heart,
  Shield, 
  Zap, 
  Globe,
  Headphones,
  FileText
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const AboutPage: React.FC = () => {
  const { showToast } = useLibrary();
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    showToast('Xabaringiz qabul qilindi! Tez orada aloqaga chiqamiz.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex p-2 rounded-3xl bg-[#0A0805] border border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.35)] mb-3">
          <img src="/signal-books-icon.svg" alt="Signal Books Logo" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
          SIGNAL <span className="text-amber-400">BOOKS</span>
        </h1>
        <p className="text-base sm:text-lg text-amber-200/90 font-serif italic max-w-xl mx-auto">
          «Bilim sari ochilgan raqamli eshik — Knowledge has no limits.»
        </p>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed">
          «Signal Books» — O‘zbekistondagi barcha kitobxonlar, talabalar va ilm ixlosmandlari uchun maxsus yaratilgan 21-asr milliy raqamli kutubxona platformasi. Platforma to‘liq asl PDF mutolaasi va yuqori sifatli audio kitoblar tinglashga moslashtirilgan.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 hover:border-amber-500/40 transition-all space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/25">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title font-bold text-stone-100 text-base">Asl PDF & Tezkor Mutolaa</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Istalgan kompyuter, planshet va smartfon ekraniga moslashuvchi, to‘liq va tiniq sifatdagi zamonaviy PDF o‘quvchi tizimi.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 hover:border-amber-500/40 transition-all space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/25">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title font-bold text-stone-100 text-base">Ovozli Kitoblar Olami</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Yo‘lda, mashg‘ulotda yoki dam olayotganda sevimli asarlaringizni professional suxandonlar ijrosida bemalol tinglang.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#16100B]/90 border border-amber-950/80 hover:border-amber-500/40 transition-all space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-serif-title font-bold text-stone-100 text-base">Mualliflik Madaniyati</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Mualliflar huquqlarini himoya qilish, kitob fondini boyitish va jamiyatda kitobxonlik madaniyatini yuksaltirish asosiy maqsadimizdir.
          </p>
        </div>
      </div>

      {/* Signal Books Official Brand & Logo Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#120D08]/95 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Logo Visual Presentation */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center">
            <div className="w-full max-w-sm p-4 rounded-3xl bg-[#070605] shadow-2xl border border-amber-500/40 group hover:border-amber-400 transition-all">
              <img 
                src="/signal-books-logo.svg" 
                alt="Signal Books Rasmiy Logotipi" 
                className="w-full h-auto object-contain rounded-2xl transition-transform group-hover:scale-[1.02] duration-300"
              />
            </div>
            <p className="text-[11px] text-amber-400/80 mt-3 font-mono">
              Signal Books — Online Library (Knowledge has no limits)
            </p>
          </div>

          {/* Description */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rasmiy Brend Identiteti</span>
            </div>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-amber-200">
              Signal Books
            </h3>
            <p className="text-xs tracking-[0.2em] text-amber-400 font-semibold uppercase">
              Online Library • Knowledge has no limits
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Logotip ochiq kitob tubidan yuqoriga parvoz qilayotgan jozibador oltin rang 3D «S» harfi va tepasidagi nur taratayotgan yulduzni o‘zida mujassam etadi. Bu nurli bilim, mutolaa ruhiyati va 21-asr raqamli innovatsiyasining oliy ramzidir.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 rounded-3xl bg-[#16100B]/90 border border-amber-500/25 shadow-xl">
        <div className="space-y-6">
          <div>
            <h3 className="font-serif-title text-xl font-bold text-stone-100">Bog‘lanish</h3>
            <p className="text-xs text-stone-400 mt-1">
              Savollaringiz yoki takliflaringiz bo‘lsa, bizga xabar qoldiring.
            </p>
          </div>

          <div className="space-y-3 text-xs text-stone-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#201610] flex items-center justify-center text-amber-400 border border-amber-900/60">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-mono">info@signalbooks.uz</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#201610] flex items-center justify-center text-amber-400 border border-amber-900/60">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-mono">+998 (71) 200-00-26</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#201610] flex items-center justify-center text-amber-400 border border-amber-900/60">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Toshkent shahri, Amir Temur shoh ko‘chasi, 107-B</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#201610] flex items-center justify-center text-amber-400 border border-amber-900/60">
                <Send className="w-4 h-4" />
              </div>
              <span className="font-mono">Telegram: @signalbooks_bot</span>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Ismingiz</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingizni kiriting"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Email manzilingiz</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.uz"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Xabaringiz</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fikr va takliflaringizni yozing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0A07] border border-amber-900/70 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Yuborish</span>
          </button>
        </form>
      </div>
    </div>
  );
};
