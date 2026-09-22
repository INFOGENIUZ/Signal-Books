import React from 'react';
import { 
  Compass, 
  BookText, 
  LayoutGrid, 
  AudioLines, 
  BookmarkCheck, 
  History, 
  Info, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  LogOut,
  BookMarked,
  Lock,
  X
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { 
    activePage, 
    setActivePage, 
    favorites, 
    readingHistory, 
    user, 
    setUser, 
    isAdmin,
    openAuthModal, 
    showToast 
  } = useLibrary();

  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }> = [
    { id: 'home', label: 'Bosh sahifa', icon: Compass },
    { id: 'books', label: 'Barcha kitoblar', icon: BookText },
    { id: 'categories', label: 'Kategoriyalar', icon: LayoutGrid },
    { id: 'audio', label: 'Audio kitoblar', icon: AudioLines },
    { id: 'favorites', label: 'Sevimlilar', icon: BookmarkCheck, badge: favorites.length > 0 ? favorites.length : undefined },
    { id: 'history', label: 'O‘qish tarixi', icon: History, badge: readingHistory.length > 0 ? readingHistory.length : undefined },
    { id: 'about', label: 'Biz haqimizda', icon: Info },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Tizimdan muvaffaqiyatli chiqdingiz', 'info');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-[260px] bg-[#110D0A]/95 backdrop-blur-xl border-r border-amber-950/60 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header & Logo */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group"
            >
              {/* Official Glowing Gold Signal Books Emblem */}
              <div className="relative w-11 h-11 rounded-xl bg-[#090705] p-1 shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center border border-amber-500/50">
                <img 
                  src="/signal-books-icon.svg" 
                  alt="Signal Books Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold tracking-tight text-amber-200 text-lg">
                    Signal
                  </span>
                  <span className="font-serif font-bold tracking-tight text-amber-400 text-lg">
                    Books
                  </span>
                </div>
                <p className="text-[9px] text-amber-400/80 tracking-[0.2em] font-semibold uppercase">
                  Online Library
                </p>
              </div>
            </button>

            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60"
                aria-label="Menyuni yopish"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-500/70">
            Asosiy bo‘limlar
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'categories' && activePage === 'category-details');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                    : 'text-stone-300 hover:text-amber-200 hover:bg-[#1E1711] border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-[#1C150F] text-amber-300/80 group-hover:bg-[#251D14] border border-amber-900/40'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>
            );
          })}

          {/* Only show Admin Panel button in navigation if the user is already authenticated as Admin */}
          {isAdmin && (
            <>
              <div className="pt-4 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500/70">
                Boshqaruv
              </div>
              <button
                onClick={() => handleNavClick('admin')}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                  ${activePage === 'admin' 
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/15 text-amber-200 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                    : 'text-stone-300 hover:text-amber-200 hover:bg-[#1E1711] border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-500/20 text-amber-300 border-amber-500/30">
                  Admin
                </span>
                {activePage === 'admin' && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Pro Banner / Reading Motivation */}
        <div className="px-4 py-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#18120C] border border-amber-500/25 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
            <div className="flex items-center gap-2 mb-1.5">
              <BookMarked className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-200">Kutubxona hikmati</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed italic line-clamp-2">
              «Kitobsiz xonadon — jonsiz tanaga o‘xshaydi.»
            </p>
            <p className="text-[10px] text-amber-400 mt-1 font-medium">— Alisher Navoiy</p>
          </div>
        </div>

        {/* Bottom Section: Admin session status (if admin is logged in) */}
        {isAdmin && user && (
          <div className="p-3 border-t border-amber-950/60 bg-[#0C0907]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#17110C] border border-amber-500/30">
              <button 
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-2.5 text-left group flex-1 min-w-0 pr-2"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-amber-300 truncate">
                    Bosh Administrator
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {user.email}
                  </div>
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Admin sessiyasini yopish"
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 transition-colors"
                aria-label="Admin sessiyasidan chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
