import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  CheckCheck
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

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
    <header className="sticky top-0 z-30 w-full bg-[#0F0C09]/90 backdrop-blur-xl border-b border-amber-950/60 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#1C150F] border border-amber-950/80 transition-colors"
            aria-label="Menyu"
          >
            <Menu className="w-5 h-5" />
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
            <span className="font-serif font-bold text-amber-300 text-sm tracking-tight hidden xs:inline">
              Signal Books
            </span>
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-amber-500/60 pointer-events-none" />
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

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#1C150F] border border-amber-950/80 transition-colors"
              aria-label="Bildirishnomalar"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-[#16110D] border border-amber-500/25 shadow-2xl backdrop-blur-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-100">Bildirishnomalar</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {unreadCount} ta yangi
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
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

          {/* If admin is logged in, show discreet Admin indicator with direct panel shortcut and logout */}
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
