import React from 'react';
import { 
  BookText, 
  GraduationCap, 
  Code2, 
  Binary, 
  Compass, 
  Atom, 
  Sparkles, 
  Languages, 
  BrainCircuit, 
  Briefcase, 
  Scale, 
  Palette,
  ArrowUpRight,
  Activity,
  History,
  Music2,
  FolderGit2
} from 'lucide-react';
import { Category } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface CategoryCardProps {
  category: Category;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  BookOpen: BookText,
  BookText,
  GraduationCap,
  Laptop: Code2,
  Code2,
  Divide: Binary,
  Binary,
  Globe: Compass,
  Compass,
  Microscope: Atom,
  Atom,
  Smile: Sparkles,
  Sparkles,
  Languages,
  Brain: BrainCircuit,
  BrainCircuit,
  Briefcase,
  Scale,
  Palette,
  HeartPulse: Activity,
  Activity,
  History,
  Music: Music2,
  Music2,
  Folder: FolderGit2,
  FolderGit2,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { openCategoryPage, books } = useLibrary();

  const IconComponent = ICON_MAP[category.iconName] || BookText;
  const realBooksCount = books.filter(b => b.categoryId === category.id || b.categoryName === category.name).length;
  const categoryColor = category.color || '#F59E0B';

  const handleClick = () => {
    openCategoryPage(category);
  };

  const isSchoolTextbooks = category.id === 'cat-2' || category.slug === 'maktab-darsliklari';
  const subcategories = category.subcategories || [];

  return (
    <button
      onClick={handleClick}
      className="group text-left relative flex flex-col justify-between p-5 rounded-3xl bg-[#120D08]/90 border border-stone-800/80 hover:border-amber-500/50 hover:bg-[#1A130C] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[0_16px_36px_-10px_rgba(245,158,11,0.22)] overflow-hidden min-h-[220px]"
      style={{
        background: `radial-gradient(circle at 90% 10%, ${categoryColor}14 0%, transparent 65%), #120D08`
      }}
    >
      {/* Subtle background ambient icon watermark */}
      <div 
        className="absolute -right-3 -bottom-3 pointer-events-none opacity-[0.035] group-hover:opacity-[0.08] transition-opacity duration-300 transform group-hover:scale-110"
        style={{ color: categoryColor }}
      >
        <IconComponent className="w-28 h-28" />
      </div>

      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full relative z-10">
        {/* Glow Icon Badge */}
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}0A)`, 
            color: categoryColor,
            border: `1px solid ${categoryColor}40`,
            boxShadow: `0 4px 16px -4px ${categoryColor}28`
          }}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Book count & explore button */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-stone-950/70 border border-stone-800/80 text-stone-300 group-hover:border-amber-500/40 group-hover:text-amber-200 transition-colors whitespace-nowrap">
            {realBooksCount > 0 ? `${realBooksCount} ta kitob` : '0 ta kitob'}
          </span>

          <div 
            className="w-8 h-8 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-center text-stone-400 group-hover:text-amber-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-all shrink-0"
            title="Bo‘limni ochish"
          >
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Title & Description Body */}
      <div className="w-full my-3 space-y-1.5 relative z-10">
        <h3 className="font-serif-title font-bold text-base sm:text-lg text-stone-100 group-hover:text-amber-200 transition-colors tracking-tight line-clamp-1">
          {category.name}
        </h3>
        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed min-h-[34px]">
          {category.description || 'Ushbu bo‘limdagi sara asarlar, o‘quv qo‘llanmalar va nodir manbalar.'}
        </p>
      </div>

      {/* Bottom Subcategories / Action Bar */}
      <div className="w-full pt-3 border-t border-amber-950/40 relative z-10">
        {isSchoolTextbooks ? (
          /* Special stylish view for School Textbooks */
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium truncate">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>11 ta umumta’lim sinflari</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                1-11 sinf
              </span>
            </div>
          </div>
        ) : subcategories.length > 0 ? (
          /* Subcategory pills */
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
              {subcategories.slice(0, 2).map(sub => (
                <span
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openCategoryPage(category, sub.id);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-[#19120B] text-stone-300 hover:text-amber-200 hover:bg-amber-500/15 border border-stone-800/90 hover:border-amber-500/40 transition-all truncate max-w-[115px]"
                  title={sub.name}
                >
                  {sub.name}
                </span>
              ))}
            </div>

            {subcategories.length > 2 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-stone-900/90 border border-stone-800 text-amber-400/90 font-mono font-medium shrink-0">
                +{subcategories.length - 2}
              </span>
            )}
          </div>
        ) : (
          /* Single category without subcategories: clean explore prompt */
          <div className="flex items-center justify-between text-xs text-stone-400 group-hover:text-amber-300 transition-colors">
            <span className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <BookText className="w-3.5 h-3.5 text-amber-400/70" />
              <span>Katalogdagi adabiyotlar</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-0.5">
              Ko‘rish <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>

      {/* Subtle ambient bottom golden line */}
      <div 
        className="absolute bottom-0 inset-x-6 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${categoryColor}, transparent)`
        }}
      />
    </button>
  );
};
