import React, { useState, useMemo } from 'react';
import { LayoutGrid, Search, BookText, X, GraduationCap, Compass, Binary, Briefcase } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { CategoryCard } from '../components/categories/CategoryCard';

type CategoryGroupFilter = 'all' | 'school' | 'literature' | 'stem' | 'business';

export const CategoriesPage: React.FC = () => {
  const { categories } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroupFilter>('all');

  const totalSubcategories = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    let list = categories;

    // Filter by group tabs
    if (selectedGroup === 'school') {
      list = list.filter(c => c.id === 'cat-2' || c.slug.includes('maktab'));
    } else if (selectedGroup === 'literature') {
      list = list.filter(c => ['cat-1', 'cat-7', 'cat-12'].includes(c.id) || c.slug.includes('adabiyot') || c.slug.includes('sanat'));
    } else if (selectedGroup === 'stem') {
      list = list.filter(c => ['cat-3', 'cat-4', 'cat-6'].includes(c.id) || c.slug.includes('informatika') || c.slug.includes('matematika') || c.slug.includes('ilm'));
    } else if (selectedGroup === 'business') {
      list = list.filter(c => ['cat-5', 'cat-8', 'cat-9', 'cat-10', 'cat-11'].includes(c.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => {
        const matchName = c.name.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchSub = c.subcategories?.some(s => s.name.toLowerCase().includes(q));
        return matchName || matchDesc || matchSub;
      });
    }

    return list;
  }, [categories, selectedGroup, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17100B] via-[#1C140E] to-[#120D08] border border-amber-950/80 shadow-2xl overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Elektron Kutubxona Katalogi</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
              Barcha yo‘nalishlar va fanlar
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Maktab darsliklari, jahon va o‘zbek badiiy adabiyoti, dasturlash, biznes hamda aniq fanlarga oid boy fond.
            </p>
          </div>

          {/* Micro Stats Pills */}
          <div className="flex sm:flex-col gap-2.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-amber-950 text-xs text-stone-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-400 font-mono">{categories.length}</span>
              <span>asosiy yo‘nalish</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-amber-950 text-xs text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-emerald-400 font-mono">{totalSubcategories}+</span>
              <span>ichki bo‘lim va sinflar</span>
            </div>
          </div>
        </div>

        {/* Search & Tabs Controls inside header */}
        <div className="mt-6 pt-6 border-t border-amber-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kategoriya yoki mavzuni qidirish (masalan: 5-sinf, fizika)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#0E0A07]/90 border border-stone-800/90 hover:border-amber-500/40 focus:border-amber-500/70 text-xs sm:text-sm text-stone-100 placeholder-stone-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs with Modern Icons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Barchasi', icon: LayoutGrid },
              { id: 'school', label: 'Maktab', icon: GraduationCap },
              { id: 'literature', label: 'Adabiyot', icon: BookText },
              { id: 'stem', label: 'Fan & IT', icon: Binary },
              { id: 'business', label: 'Biznes', icon: Briefcase },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = selectedGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGroup(tab.id as CategoryGroupFilter)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'bg-[#0E0A07]/80 text-stone-400 hover:text-amber-300 hover:bg-[#1A120B] border border-stone-800/80'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="p-12 text-center rounded-3xl bg-[#140E0A] border border-amber-950/80 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-stone-100">
            Kategoriya topilmadi
          </h3>
          <p className="text-xs text-stone-400">
            "{searchQuery}" so‘rovi bo‘yicha mos keluvchi bo‘lim topilmadi. Qidiruv so‘zini o‘zgartirib ko‘ring.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md"
          >
            Barcha kategoriyalarni ko‘rsatish
          </button>
        </div>
      )}
    </div>
  );
};
