import React from 'react';
import { 
  Compass, 
  BookText, 
  LayoutGrid, 
  AudioLines, 
  BookmarkCheck 
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    favorites 
  } = useLibrary();

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navButtons: Array<{
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    action?: () => void;
  }> = [
    { id: 'home', label: 'Asosiy', icon: Compass },
    { id: 'books', label: 'Kitoblar', icon: BookText },
    { id: 'categories', label: 'Bo‘limlar', icon: LayoutGrid },
    { id: 'audio', label: 'Audio', icon: AudioLines },
    { 
      id: 'favorites', 
      label: 'Sevimlilar', 
      icon: BookmarkCheck, 
      badge: favorites.length > 0 ? favorites.length : undefined 
    }
  ];

  return (
    <nav 
      aria-label="Mobil navigatsiya"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-[#110D09]/95 backdrop-blur-2xl border-t border-amber-950/90 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] transition-all"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navButtons.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'categories' && activePage === 'category-details');

          return (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : handleNavClick(item.id)}
              className={`
                flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative
                ${isActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-stone-400 hover:text-stone-200'}
              `}
              title={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-[9px] font-extrabold flex items-center justify-center px-0.5 shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 line-clamp-1">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-[0_0_6px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
