import React from 'react';
import { BookMarked, Send, Instagram, Youtube, Heart, ExternalLink } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types';

export const Footer: React.FC = () => {
  const { setActivePage } = useLibrary();

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0D0906] border-t border-amber-950/80 mt-16 pt-12 pb-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 border border-amber-400/40 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20">
                <BookMarked className="w-4 h-4" />
              </div>
              <span className="font-serif-title text-lg font-extrabold tracking-tight text-stone-100">
                SIGNAL <span className="text-amber-400">BOOKS</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed italic">
              «Bilim sari ochilgan raqamli eshik.»
            </p>
            <p className="text-stone-400 text-xs max-w-md leading-relaxed">
              O‘zbekiston va jahon adabiyotining eng sara asarlarini istalgan qurilmada, sifatli va qulay formatda o‘qish hamda tinglash imkonini beruvchi zamonaviy raqamli platforma.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17100B] border border-amber-950/90 flex items-center justify-center text-stone-400 hover:text-amber-400 hover:border-amber-500/40 hover:scale-105 transition-all"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17100B] border border-amber-950/90 flex items-center justify-center text-stone-400 hover:text-orange-400 hover:border-orange-500/40 hover:scale-105 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#17100B] border border-amber-950/90 flex items-center justify-center text-stone-400 hover:text-rose-400 hover:border-rose-500/40 hover:scale-105 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif-title text-xs font-bold uppercase tracking-wider text-amber-400">
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
            <h4 className="font-serif-title text-xs font-bold uppercase tracking-wider text-amber-400">
              Ma’lumot
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
                <span className="text-stone-500">Maxfiylik siyosati</span>
              </li>
              <li>
                <span className="text-stone-500">Foydalanish shartlari</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-amber-950/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © 2026 Signal Books. Barcha huquqlar himoyalangan.
          </div>

          {/* Dasturchi Muxiddin (@signalbooks_admin) */}
          <a
            href="https://t.me/signalbooks_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#18110B] hover:bg-[#251A10] border border-amber-500/40 hover:border-amber-400 text-stone-200 hover:text-amber-300 transition-all group shadow-md shadow-black/40 hover:scale-105 active:scale-95"
            title="Dasturchi Muxiddin bilan bog‘lanish: @signalbooks_admin"
          >
            <span className="w-5 h-5 rounded-full bg-[#229ED9]/20 border border-[#229ED9]/50 flex items-center justify-center text-[#229ED9] group-hover:bg-[#229ED9]/30 transition-colors">
              <Send className="w-2.5 h-2.5 fill-current" />
            </span>
            <span className="text-xs font-medium text-stone-300">
              Dasturchi: <span className="font-bold text-amber-300 group-hover:underline">Muxiddin</span>
            </span>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60 shadow-inner">
              @signalbooks_admin
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
          </a>

          <div className="flex items-center gap-1 text-stone-400">
            <span>Kitobxonlar muhabbati bilan yaratilgan</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
