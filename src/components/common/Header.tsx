import React, { useState } from 'react';
import { 
  CheckCheck
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { WeatherClockWidget } from './WeatherClockWidget';
import { Icon3D } from './Icon3D';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    setActivePage, 
    notifications, 
    markNotificationsAsRead,
    user, 
    isAdmin,
    activePage
  } = useLibrary();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePage !== 'books') {
      setActivePage('books');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F0C09]/95 backdrop-blur-xl border-b border-amber-950/60 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-2xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#1C150F] border border-amber-950/80 transition-colors shrink-0 flex items-center justify-center"
            aria-label="Menyu"
          >
            <Icon3D name="menu" size={22} />
          </button>

          {/* Mobile Brand Logo */}
          <button 
            onClick={() => setActivePage('home')}
            className="lg:hidden flex items-center gap-2 shrink-0 text-left"
            aria-label="Bosh sahifa"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0E0A07] border border-amber-500/50 p-0.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center justify-center">
              <img src="/signal-books-icon.svg" alt="Signal Books" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-amber-300 text-sm tracking-tight hidden md:inline">
              Signal Books
            </span>
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="header-search-form relative w-full min-w-0 max-w-lg hidden sm:block">
            <div className="relative flex items-center">
              <Icon3D name="search" size={18} className="absolute left-3.5 pointer-events-none opacity-80" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== 'books' && e.target.value.trim().length > 1) {
                    setActivePage('books');
                  }
                }}
                placeholder="Kitob, muallif yoki janrni qidiring..."
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#18130E] border border-amber-950/80 focus:border-amber-500/60 focus:bg-[#201913] text-sm text-stone-200 placeholder-stone-500 outline-none transition-all focus:ring-2 focus:ring-amber-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-stone-400 hover:text-amber-300"
                >
                  Tozalash
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Action Icons & Weather/Clock Widget */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Real-time Weather, Clock & Date Widget with 3D Fluency Icons */}
          <WeatherClockWidget />

          {/* Notifications Dropdown with 3D Bell Icon */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-[#1C150F] border border-amber-950/80 transition-colors flex items-center justify-center"
              aria-label="Bildirishnomalar"
            >
              <Icon3D name="bell" size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_8px_#f59e0b] border border-[#0F0C09]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-[#16110D] border border-amber-500/25 shadow-2xl backdrop-blur-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
                  <div className="flex items-center gap-2">
                    <Icon3D name="bell" size={20} />
                    <span className="text-sm font-bold text-stone-100 font-heading">Bildirishnomalar</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {unreadCount} ta yangi
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Barchasini o‘qish</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-2.5 rounded-xl transition-colors border ${
                        notif.read 
                          ? 'bg-[#1C150F]/40 border-amber-950/50 opacity-75' 
                          : 'bg-amber-950/20 border-amber-500/25'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-stone-200">{notif.title}</span>
                        <span className="text-[10px] text-stone-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin shortcut */}
          {isAdmin && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('admin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-colors"
                title="Admin Boshqaruv Paneli"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300">
                  Admin
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
