import React, { useState, useMemo } from 'react';
import { LayoutGrid, Search, BookText, X, GraduationCap, Compass, Binary, Briefcase, Sparkles, FolderTree } from 'lucide-react';
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
      {/* Top Banner Header */}
      <div className="relative p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1A120B] via-[#140E0A] to-[#0E0A07] border border-amber-950/80 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Title & Micro Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>Kutubxona Katalogi</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                Kutubxona Bo‘limlari
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Maktab darsliklari, badiiy va ilmiy adabiyotlar, dasturlash hamda biznes yo‘nalishidagi elektron va audio manbalar.
              </p>
            </div>

            {/* Quick Overview Stats */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-stone-800/80 backdrop-blur-md flex flex-col items-center min-w-[100px]">
                <span className="text-xs text-stone-400 font-medium">Yo‘nalishlar</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-300 mt-0.5">
                  {categories.length}
                </span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-stone-800/80 backdrop-blur-md flex flex-col items-center min-w-[100px]">
                <span className="text-xs text-stone-400 font-medium">Ichki bo‘limlar</span>
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  {totalSubcategories}+
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Control Deck: Search Bar & Segmented Group Tabs */}
          <div className="pt-6 border-t border-amber-950/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bo‘lim yoki darslikni qidiring (masalan: 5-sinf, fizika)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#0E0A07]/90 border border-stone-800 hover:border-amber-500/40 focus:border-amber-500 text-xs sm:text-sm text-stone-100 placeholder-stone-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clean Segmented Category Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0A0705]/90 border border-stone-800 rounded-2xl overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Barchasi', icon: LayoutGrid },
                { id: 'school', label: 'Maktab Darsliklari', icon: GraduationCap },
                { id: 'literature', label: 'Badiiy Adabiyot', icon: BookText },
                { id: 'stem', label: 'Fan & Dasturlash', icon: Binary },
                { id: 'business', label: 'Biznes & Moliya', icon: Briefcase },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = selectedGroup === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGroup(tab.id as CategoryGroupFilter)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-stone-300 hover:text-amber-200 hover:bg-[#1A120B]'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid Section */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#140E0A] border border-amber-950/80 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-lg font-bold text-stone-100">
            Bo‘lim topilmadi
          </h3>
          <p className="text-xs text-stone-400">
            "{searchQuery}" so‘rovi bo‘yicha mos keluvchi kategoriya topilmadi. Qidiruv so‘zini o‘zgartirib ko‘ring.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-bold transition-all shadow-md"
          >
            Barcha kategoriyalarni ko‘rsatish
          </button>
        </div>
      )}
    </div>
  );
};
