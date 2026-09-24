import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types';
import { Icon3D } from './Icon3D';

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
    iconName: string;
    badge?: number;
    action?: () => void;
  }> = [
    { id: 'home', label: 'Asosiy', iconName: 'home' },
    { id: 'books', label: 'Kitoblar', iconName: 'books' },
    { id: 'categories', label: 'Bo‘limlar', iconName: 'categories' },
    { id: 'audio', label: 'Audio', iconName: 'audio' },
    { 
      id: 'favorites', 
      label: 'Sevimlilar', 
      iconName: 'favorites', 
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
                <Icon3D name={item.iconName} size={28} className={`transition-all ${isActive ? 'scale-110 filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]' : 'opacity-85 hover:opacity-100'}`} />
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
