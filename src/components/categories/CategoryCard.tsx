import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Laptop, 
  Divide, 
  Globe, 
  Microscope, 
  Smile, 
  Languages, 
  Brain, 
  Briefcase, 
  Scale, 
  Palette,
  ArrowUpRight,
  HeartPulse,
  History,
  Sparkles,
  Music,
  Folder
} from 'lucide-react';
import { Category } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface CategoryCardProps {
  category: Category;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  GraduationCap,
  Laptop,
  Divide,
  Globe,
  Microscope,
  Smile,
  Languages,
  Brain,
  Briefcase,
  Scale,
  Palette,
  HeartPulse,
  History,
  Sparkles,
  Music,
  Folder,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { openCategoryPage, books } = useLibrary();

  const IconComponent = ICON_MAP[category.iconName] || BookOpen;
  const realBooksCount = books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length;

  const handleClick = () => {
    openCategoryPage(category);
  };

  return (
    <button
      onClick={handleClick}
      className="group text-left relative flex flex-col justify-between p-4 rounded-2xl bg-[#15100B]/90 border border-amber-950/70 hover:border-amber-500/40 hover:bg-[#1E1610] hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)] transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between w-full mb-4">
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ 
            backgroundColor: `${category.color || '#F59E0B'}18`, 
            color: category.color || '#F59E0B',
            border: `1px solid ${category.color || '#F59E0B'}35` 
          }}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="w-7 h-7 rounded-lg bg-stone-900/60 flex items-center justify-center text-stone-500 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      <div className="w-full space-y-2">
        <div>
          <h4 className="font-serif-title font-semibold text-sm text-stone-200 group-hover:text-amber-300 transition-colors">
            {category.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
            <span>{realBooksCount} ta kitob</span>
            {category.subcategories && category.subcategories.length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  {category.subcategories.length} {category.id === 'cat-2' ? 'ta sinf' : 'ta ichki bo‘lim'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Subcategory mini chips preview */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-amber-950/40">
            {category.subcategories.slice(0, 3).map(sub => (
              <span
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation();
                  openCategoryPage(category, sub.id);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#1F1710] text-stone-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-950/60 transition-colors"
              >
                {sub.name}
              </span>
            ))}
            {category.subcategories.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-stone-500 font-mono">
                +{category.subcategories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtle bottom warm golden line on hover */}
      <div className="absolute bottom-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
