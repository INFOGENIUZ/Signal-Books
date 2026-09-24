import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types';
import { Icon3D } from './Icon3D';

export const Footer: React.FC = () => {
  const { setActivePage } = useLibrary();

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#0F0C09] via-[#0B0805] to-[#060403] border-t border-amber-950/80 mt-16 pt-12 pb-8 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#090705] border border-amber-500/50 p-1 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center shrink-0">
                <img src="/signal-books-icon.svg" alt="Signal Books Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-heading text-lg font-extrabold tracking-tight text-stone-100 block leading-tight">
                  SIGNAL <span className="text-amber-400">BOOKS</span>
                </span>
                <span className="text-[9px] text-amber-400/80 tracking-[0.2em] font-semibold uppercase block">
                  Online Library
                </span>
              </div>
            </div>

            <p className="text-stone-300 text-sm max-w-md leading-relaxed font-heading font-bold italic">
              «Kitob, bilim va texnologiya bir joyda.»
            </p>

            <p className="text-stone-400 text-xs max-w-md leading-relaxed">
              Kitobsevarlar uchun yaratilgan zamonaviy raqamli platforma. Elektron kitoblarni topish, mutolaa qilish va kerakli adabiyotlarga qulay murojaat qilish loyihasi.
            </p>

            {/* Social Link - Official Telegram Bot */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://t.me/signal_books_bot" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#18110B] border border-amber-500/30 hover:border-amber-400/70 text-amber-300 hover:text-amber-200 text-xs font-mono transition-all shadow-lg hover:scale-105"
                title="Rasmiy Telegram Bot"
              >
                <Icon3D name="telegram" size={22} />
                <span className="font-bold">@signal_books_bot</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-400">
              Bo‘limlar
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-amber-400 transition-colors">
                  Bosh sahifa
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-amber-400 transition-colors">
                  Kitoblar
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('categories')} className="hover:text-amber-400 transition-colors">
                  Kategoriyalar
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('audio')} className="hover:text-amber-400 transition-colors">
                  Audio kitoblar
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Information & Contact */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-400">
              Ma’lumot & Aloqa
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-amber-400 transition-colors">
                  Biz haqimizda
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-amber-400 transition-colors">
                  Bog‘lanish
                </button>
              </li>
              <li>
                <a 
                  href="https://t.me/signal_books_bot" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-amber-400 transition-colors font-mono text-xs flex items-center gap-1.5"
                >
                  <Icon3D name="telegram" size={16} />
                  <span>Telegram: @signal_books_bot</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Creative & Modern Footer Bottom Bar */}
        <div className="pt-6 border-t border-amber-950/70 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2 text-stone-400 font-medium">
            <Icon3D name="books" size={18} />
            <span>© 2026 Signal Books. Barcha huquqlar himoyalangan.</span>
          </div>

          {/* Dasturchi Muxiddin (@signalbooks_admin) - High end 3D Pill Badge */}
          <a
            href="https://t.me/signalbooks_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#1E140C] via-[#2A1B10] to-[#1C130B] hover:from-[#291A0F] hover:to-[#22160C] border border-amber-500/40 hover:border-amber-400 text-stone-100 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.03] active:scale-95"
            title="Dasturchi Muxiddin bilan bog‘lanish: @signalbooks_admin"
          >
            <Icon3D name="telegram" size={22} className="shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-stone-300">
              Dasturchi: <span className="font-extrabold text-amber-300 group-hover:underline">Muxiddin</span>
            </span>
            <span className="text-[11px] font-mono text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-inner">
              @signalbooks_admin
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-400 transition-colors" />
          </a>

          {/* Love Note */}
          <div className="flex items-center gap-2 text-stone-300 font-medium">
            <span>Kitobxonlar muhabbati bilan yaratilgan</span>
            <Icon3D name="heart" size={20} className="animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
};
