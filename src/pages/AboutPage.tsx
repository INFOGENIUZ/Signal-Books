import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Icon3D } from '../components/common/Icon3D';

export const AboutPage: React.FC = () => {
  const { showToast, setActivePage } = useLibrary();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectType, setSubjectType] = useState('Kitob so‘rovi');
  const [message, setMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Murojaatingiz qabul qilindi. E’tiboringiz uchun rahmat!', 'success');
    setName('');
    setEmail('');
    setSubjectType('Kitob so‘rovi');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12 animate-fade-in">
      {/* Hero Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex p-2.5 rounded-3xl bg-[#0C0906] border border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.3)] mb-2">
          <img src="/signal-books-icon.svg" alt="Signal Books Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-stone-100 tracking-tight">
          SIGNAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">BOOKS</span>
        </h1>

        <p className="text-sm sm:text-base text-amber-300/90 font-medium italic max-w-xl mx-auto">
          «Kitob va texnologiyani birlashtirib, bilim olishni yanada qulay qilish.»
        </p>

        <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Signal Books — kitobsevarlar uchun yaratilgan zamonaviy raqamli loyiha. Loyihaning asosiy maqsadi — elektron kitoblarni topish, ulardan foydalanish va kerakli adabiyotlarga murojaat qilish jarayonini foydalanuvchilar uchun yanada qulay qilish.
        </p>
      </div>

      {/* Capabilities List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#140E0A] border border-amber-950/80 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-amber-950/70">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icon3D name="compass" size={26} />
          </div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-stone-100">
            Signal Books orqali foydalanuvchilar:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-200">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1C140E] border border-stone-800/80">
            <Icon3D name="check-mark" size={20} className="shrink-0 mt-0.5" />
            <span>Elektron kitoblarni oson izlash</span>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1C140E] border border-stone-800/80">
            <Icon3D name="check-mark" size={20} className="shrink-0 mt-0.5" />
            <span>Mavjud sara kitoblardan bepul foydalanish</span>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1C140E] border border-stone-800/80">
            <Icon3D name="check-mark" size={20} className="shrink-0 mt-0.5" />
            <span>Kerakli kitoblar bo‘yicha so‘rov yuborish</span>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1C140E] border border-stone-800/80">
            <Icon3D name="check-mark" size={20} className="shrink-0 mt-0.5" />
            <span>Yangi adabiyotlar va nashrlardan xabardor bo‘lish</span>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1C140E] border border-stone-800/80 sm:col-span-2">
            <Icon3D name="check-mark" size={20} className="shrink-0 mt-0.5" />
            <span>Telegram bot orqali barcha xizmatlardan tezkor foydalanish</span>
          </div>
        </div>
      </div>

      {/* Goal Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1C130B] via-[#24170E] to-[#160E08] border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Icon3D name="sparkles" size={18} />
            <span>BIZNING MAQSADIMIZ</span>
          </div>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans font-medium">
            «Bizning maqsadimiz — kitobxonlar uchun sodda, qulay va zamonaviy raqamli muhit yaratish. Texnologiyalar rivojlanayotgan bir davrda kitobga yetib borish ham imkon qadar oson bo‘lishi kerak. Signal Books kitoblarni izlash va ulardan foydalanish jarayonini soddalashtirish, mutolaa madaniyatini rivojlantirish va ko‘proq insonlarni kitob o‘qishga jalb qilish g‘oyasi asosida rivojlanmoqda.»
          </p>
        </div>
      </div>

      {/* 4 Pillars Cards Section: Nega Signal Books? */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100">
            Nega Signal Books?
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Kitobxonlikni rivojlantirishga qaratilgan zamonaviy afzalliklarimiz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#140E0A] border border-amber-950/80 hover:border-amber-500/50 transition-all space-y-2.5 shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon3D name="books" size={32} />
            </div>
            <h3 className="font-heading font-bold text-stone-100 text-base group-hover:text-amber-300 transition-colors">
              1. Kitobga qulay kirish
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              «Kerakli kitoblarni izlash va ulardan foydalanish jarayonini soddalashtiramiz.»
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#140E0A] border border-amber-950/80 hover:border-amber-500/50 transition-all space-y-2.5 shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon3D name="sparkles" size={32} />
            </div>
            <h3 className="font-heading font-bold text-stone-100 text-base group-hover:text-amber-300 transition-colors">
              2. Zamonaviy yondashuv
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              «Kitobxonlikni zamonaviy raqamli imkoniyatlar bilan birlashtiramiz.»
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#140E0A] border border-amber-950/80 hover:border-amber-500/50 transition-all space-y-2.5 shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon3D name="telegram" size={32} />
            </div>
            <h3 className="font-heading font-bold text-stone-100 text-base group-hover:text-amber-300 transition-colors">
              3. Telegram orqali qulaylik
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              «Signal Books xizmatlaridan Telegram orqali tez va sodda foydalanish mumkin.»
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#140E0A] border border-amber-950/80 hover:border-amber-500/50 transition-all space-y-2.5 shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon3D name="rocket" size={32} />
            </div>
            <h3 className="font-heading font-bold text-stone-100 text-base group-hover:text-amber-300 transition-colors">
              4. Doimiy rivojlanish
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              «Loyiha yangi kitoblar va yangi imkoniyatlar bilan muntazam rivojlantirib boriladi.»
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section & Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 rounded-3xl bg-[#140E0A] border border-amber-950/80 shadow-2xl">
        <div className="space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Icon3D name="chat" size={18} />
              <span>BOG‘LANISH</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100">
              Biz bilan bog‘laning
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              Savollaringiz, kitob bo‘yicha so‘rovlaringiz, takliflaringiz yoki hamkorlik bo‘yicha murojaatlaringiz bo‘lsa, biz bilan bog‘laning.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C140E] border border-stone-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Icon3D name="telegram" size={26} />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block font-mono">Rasmiy Telegram Bot</span>
                <a 
                  href="https://t.me/signal_books_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-300 hover:underline font-mono"
                >
                  @signal_books_bot
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-200 block font-heading">
              Murojaat yo‘nalishlari:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Kitob so‘rovlari', 'Takliflar', 'Hamkorlik', 'Texnik yordam', 'Umumiy savollar'].map((item, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-[#1C140E] border border-stone-800 text-stone-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Ismingiz</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingizni kiriting"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Email manzilingiz</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email manzilingizni kiriting"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Murojaat turi</label>
            <select
              value={subjectType}
              onChange={(e) => setSubjectType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-xs text-stone-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="Kitob so‘rovi">Kitob so‘rovi</option>
              <option value="Taklif">Taklif</option>
              <option value="Hamkorlik">Hamkorlik</option>
              <option value="Texnik yordam">Texnik yordam</option>
              <option value="Boshqa">Boshqa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Xabaringiz</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Xabaringizni yozing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C140E] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            <Icon3D name="sent" size={20} />
            <span>Yuborish</span>
          </button>
        </form>
      </div>

      {/* CTA Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1C140D] via-[#140E0A] to-[#0E0A07] border border-amber-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-100">
            Kitob izlashni boshlang
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Signal Books bilan yangi bilimlar sari qadam tashlang.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://t.me/signal_books_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer font-heading"
            >
              <Icon3D name="telegram" size={22} />
              <span>Telegram botga o‘tish (@signal_books_bot)</span>
            </a>

            <button
              onClick={() => {
                setActivePage('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1C140E] hover:bg-[#251A12] border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold transition-all cursor-pointer font-heading"
            >
              <span>Katalogdagi kitoblar</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
