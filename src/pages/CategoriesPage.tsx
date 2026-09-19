import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { CategoryCard } from '../components/categories/CategoryCard';

export const CategoriesPage: React.FC = () => {
  const { categories, books } = useLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Kutubxona bo‘limlari</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          🏷️ Barcha kategoriyalar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          O‘zingiz qiziqqan sohaga oid eng sara kitoblar va adabiyotlar katalogi
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};
