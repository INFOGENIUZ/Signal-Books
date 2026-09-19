import React, { useState, useEffect } from 'react';
import { 
  Quote, 
  BookOpen, 
  Headphones, 
  GraduationCap, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Share2,
  Clock,
  Bookmark,
  Compass
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

interface DailyQuote {
  text: string;
  author: string;
  work?: string;
  era: string;
}

const DAILY_QUOTES: DailyQuote[] = [
  {
    text: "Kitob — aqlning chirog‘i, inson ma’naviyatining ko‘zgusidir. Mutolaa qalbni yoritadi va fikrni charxlaydi.",
    author: "Alisher Navoiy",
    work: "Mahbub ul-qulub",
    era: "Mumtoz adabiyot"
  },
  {
    text: "Modomiki, biz yangi davrga oyoq qo‘ydik, har bir qadamimizni bilim va kitob nuri bilan yoritishimiz lozim.",
    author: "Abdulla Qodiriy",
    work: "O‘tkan kunlar muqaddimasi",
    era: "Jadid adabiyoti"
  },
  {
    text: "Tiriklikning ma’nosi ilmda, ilmning manbai esa yaxshi kitobdadir. Mutolaadan to‘xtagan kun — taraqqiyotdan to‘xtagan kundir.",
    author: "Cho‘lpon",
    work: "Adabiyot nadir",
    era: "Ma’rifatparvarlik"
  },
  {
    text: "Kitob o‘qish faqat bilim olish emas, balki buyuk insonlar bilan suhbatlashishning eng oliy yo‘lidir.",
    author: "O‘tkir Hoshimov",
    work: "Daftar hoshiyasidagi bitiklar",
    era: "O‘zbek nasri"
  },
  {
    text: "Bir yaxshi kitob inson hayotini butunlay o‘zgartirib yuborishga qodir mo‘jizadir.",
    author: "Lev Tolstoy",
    work: "Hayot yo‘li",
    era: "Jahon adabiyoti"
  }
];

export const DailyQuoteAndReadingTracker: React.FC = () => {
  const { setActivePage, setSelectedCategoryFilter, books, readingHistory } = useLibrary();

  // Pick a quote based on current date
  const todayDate = new Date();
  const dayOfYear = Math.floor((todayDate.getTime() - new Date(todayDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const currentQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const [copied, setCopied] = useState(false);
  const [dailyMinutesGoal, setDailyMinutesGoal] = useState(() => {
    try {
      const saved = localStorage.getItem('daily_reading_goal_min');
      return saved ? parseInt(saved, 10) : 25;
    } catch {
      return 25;
    }
  });

  const [completedMinutes, setCompletedMinutes] = useState(() => {
    try {
      const savedDate = localStorage.getItem('daily_reading_date');
      const todayStr = new Date().toDateString();
      if (savedDate === todayStr) {
        return parseInt(localStorage.getItem('daily_reading_done') || '15', 10);
      }
      return 15;
    } catch {
      return 15;
    }
  });

  const handleAddTenMinutes = () => {
    const nextVal = Math.min(dailyMinutesGoal, completedMinutes + 5);
    setCompletedMinutes(nextVal);
    try {
      localStorage.setItem('daily_reading_done', nextVal.toString());
      localStorage.setItem('daily_reading_date', new Date().toDateString());
    } catch {}
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}${currentQuote.work ? ` (${currentQuote.work})` : ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = Math.min(100, Math.round((completedMinutes / dailyMinutesGoal) * 100));

  return (
    <section className="px-4 max-w-7xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Kutubxona Maydoni & Tafakkur</span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            Kunlik Mutolaa & Fikrlar Olami
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Har kungi ma’naviy ilhom, kitobxonlik odati va tezkor qulayliklar markazi
          </p>
        </div>

        <button
          onClick={() => setActivePage('books')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18120B] hover:bg-[#221910] border border-amber-950/90 text-amber-300 text-xs font-semibold transition-colors"
        >
          <span>Barcha kitoblarni kashf eting</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Grid: Left = Daily Literary Quote, Right = Reading Streak & Habit Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Literary Quote (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#1C130B] via-[#150E09] to-[#0F0B08] border border-amber-950/80 p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/30 transition-all">
          {/* Subtle warm glow and watermark */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
          <Quote className="absolute -right-4 -bottom-6 w-36 h-36 text-amber-500/[0.04] pointer-events-none transform -rotate-12" />

          <div>
            {/* Top pill bar */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-amber-950/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                  Kun Iqtibosi
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-stone-400 border border-amber-500/20">
                  {currentQuote.era}
                </span>
              </div>

              <button
                onClick={handleCopyQuote}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/80 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-stone-800 text-[11px] transition-all"
                title="Iqtibosdan nusxa olish"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxa olish</span>
                  </>
                )}
              </button>
            </div>

            {/* Quote Body */}
            <blockquote className="font-serif-title text-base sm:text-lg md:text-xl text-stone-100 font-medium leading-relaxed italic pr-4">
              "{currentQuote.text}"
            </blockquote>
          </div>

          {/* Quote Author & Source */}
          <div className="pt-6 mt-6 border-t border-amber-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-serif font-bold text-sm shadow-inner">
                {currentQuote.author.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-200">
                  {currentQuote.author}
                </h4>
                {currentQuote.work && (
                  <p className="text-[11px] text-stone-400">
                    «{currentQuote.work}» asaridan
                  </p>
                )}
              </div>
            </div>

            <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
              Har kuni yangilanadi
            </span>
          </div>
        </div>

        {/* Daily Reading Habit Tracker (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#140E0A]/90 border border-amber-950/80 p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-950/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-stone-100 font-serif-title">
                  Kunlik Mutolaa Maqsadi
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300">
                {completedMinutes} / {dailyMinutesGoal} daqiqa
              </span>
            </div>

            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              Olimlarning ta’kidlashicha, har kuni muntazam 20-30 daqiqa mutolaa qilish xotirani 40% ga yaxshilaydi.
            </p>

            {/* Progress bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span>Kunlik maqsad</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#1F1610] overflow-hidden border border-amber-950/80">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-950/60 flex items-center gap-3">
            <button
              onClick={handleAddTenMinutes}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>+5 daqiqa o‘qidim</span>
            </button>

            <button
              onClick={() => setActivePage('books')}
              className="px-4 py-2.5 rounded-xl bg-[#1C140E] hover:bg-[#261B13] border border-amber-950/80 text-stone-300 text-xs font-medium transition-colors"
            >
              Kitob ochish
            </button>
          </div>
        </div>
      </div>

      {/* 4 Creative Fast-Access Hub Cards (Replacing static category cards with active portals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* 1. School Textbooks Portal */}
        <div 
          onClick={() => {
            setSelectedCategoryFilter('cat-2');
            setActivePage('category-details');
          }}
          className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-amber-950/80 hover:border-emerald-500/40 hover:bg-[#1E1712] transition-all duration-300 shadow-md relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 block mb-0.5">
            Maktab dasturi
          </span>
          <h4 className="text-sm font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
            1-11 Sinf Darsliklari
          </h4>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
            O‘zbekiston umumta’lim maktablari uchun tasdiqlangan elektron darsliklar to‘plami
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Sinflarni ko‘rish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 2. Audio Library Portal */}
        <div 
          onClick={() => setActivePage('audio')}
          className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-amber-950/80 hover:border-amber-500/40 hover:bg-[#1E1712] transition-all duration-300 shadow-md relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block mb-0.5">
            Ovozli format
          </span>
          <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
            Audio Kitoblar Zali
          </h4>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
            Mashhur suxandonlar va mualliflar ovozida ijro etilgan durdona asarlar
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-amber-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Tinglashga o‘tish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 3. Belles-lettres / Badiiy adabiyot */}
        <div 
          onClick={() => {
            setSelectedCategoryFilter('cat-1');
            setActivePage('category-details');
          }}
          className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-amber-950/80 hover:border-orange-500/40 hover:bg-[#1E1712] transition-all duration-300 shadow-md relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400 block mb-0.5">
            Mumtoz & Zamonaviy
          </span>
          <h4 className="text-sm font-bold text-stone-100 group-hover:text-orange-300 transition-colors">
            Badiiy Durdonalar
          </h4>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
            O‘zbek mumtoz nasri, she’riyati va jahon adabiyotining eng sara asarlari
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-orange-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Katalogga kirish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 4. Full Catalog Navigator */}
        <div 
          onClick={() => setActivePage('categories')}
          className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-b from-[#18130E] to-[#120E0A] border border-amber-950/80 hover:border-amber-400/40 hover:bg-[#1E1712] transition-all duration-300 shadow-md relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 block mb-0.5">
            Mavzular xaritasi
          </span>
          <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
            Barcha Kategoriyalar
          </h4>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
            IT, Fan, Psixologiya, Huquq, Tibbiyot va barcha sohalar katalogi
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-amber-300 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Bo‘limlar xaritasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </section>
  );
};
