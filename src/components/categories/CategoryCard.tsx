import React from 'react';
import { 
  ArrowUpRight,
  GraduationCap,
  BookText,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Category } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { Icon3D } from '../common/Icon3D';

interface CategoryCardProps {
  category: Category;
}

const get3DIconName = (cat: Category): string => {
  const slug = cat.slug?.toLowerCase() || '';
  const name = cat.name?.toLowerCase() || '';
  if (slug.includes('badiiy') || name.includes('badiiy')) return 'badiiy';
  if (slug.includes('maktab') || name.includes('maktab') || name.includes('darslik')) return 'maktab';
  if (slug.includes('informatika') || slug.includes('it') || name.includes('dasturlash') || name.includes('it')) return 'it';
  if (slug.includes('matematika') || name.includes('matematika') || name.includes('algebra')) return 'matematika';
  if (slug.includes('tarix') || name.includes('tarix')) return 'tarix';
  if (slug.includes('ilm') || slug.includes('fan') || name.includes('ilm') || name.includes('fizika')) return 'ilmiy';
  if (slug.includes('bolalar') || name.includes('bolalar') || name.includes('ertak')) return 'bolalar';
  if (slug.includes('til') || slug.includes('lang') || name.includes('til') || name.includes('ingliz')) return 'tillari';
  if (slug.includes('psixologiya') || name.includes('psixologiya') || name.includes('motivatsiya')) return 'psixologiya';
  if (slug.includes('biznes') || name.includes('biznes') || name.includes('moliya')) return 'biznes';
  if (slug.includes('huquq') || name.includes('huquq') || name.includes('qonun')) return 'huquq';
  if (slug.includes('diniy') || name.includes('diniy') || name.includes('islom')) return 'diniy';
  return 'categories';
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { openCategoryPage, books } = useLibrary();

  const realBooksCount = books.filter(b => b.categoryId === category.id || b.categoryName?.toLowerCase() === category.name?.toLowerCase()).length;
  const categoryColor = category.color || '#F59E0B';

  const handleClick = () => {
    openCategoryPage(category);
  };

  const isSchoolTextbooks = category.id === 'cat-2' || category.slug === 'maktab-darsliklari';
  const subcategories = category.subcategories || [];

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer text-left relative flex flex-col justify-between p-5 rounded-3xl bg-[#140E0A]/95 border border-stone-800/80 hover:border-amber-500/60 hover:bg-[#1C140E] transition-all duration-300 transform hover:-translate-y-1.5 shadow-xl hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.25)] overflow-hidden min-h-[220px]"
      style={{
        background: `radial-gradient(circle at 85% 15%, ${categoryColor}16 0%, transparent 70%), #140E0A`
      }}
    >
      {/* Top Section: Icon + Book Count Badge + Action Arrow */}
      <div className="flex items-start justify-between w-full relative z-10 gap-3">
        {/* Glowing 3D Icon Badge */}
        <div 
          className="w-14 h-14 p-2.5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0d)`, 
            border: `1px solid ${categoryColor}45`,
            boxShadow: `0 8px 24px -6px ${categoryColor}35`
          }}
        >
          <Icon3D name={get3DIconName(category)} size={36} />
        </div>

        {/* Right side stats & enter icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0705]/80 border border-stone-800 text-xs font-mono font-medium text-stone-300 group-hover:border-amber-500/40 group-hover:text-amber-300 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{realBooksCount} ta kitob</span>
          </div>

          <div 
            className="w-9 h-9 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-center text-stone-400 group-hover:text-amber-300 group-hover:border-amber-500/50 group-hover:bg-amber-500/15 transition-all shadow-sm"
            title="Bo‘limga kirish"
          >
            <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Title & Description Body */}
      <div className="w-full my-3 space-y-1.5 relative z-10">
        <h3 className="font-heading font-extrabold text-lg text-stone-100 group-hover:text-amber-300 transition-colors tracking-tight line-clamp-1">
          {category.name}
        </h3>
        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed min-h-[36px]">
          {category.description || 'Ushbu bo‘limdagi sara asarlar, o‘quv qo‘llanmalar va nodir manbalar.'}
        </p>
      </div>

      {/* Bottom Subcategories / Action Bar */}
      <div className="w-full pt-3 border-t border-amber-950/50 relative z-10">
        {isSchoolTextbooks ? (
          /* Special stylish view for School Textbooks */
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold truncate">
              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>1-11 sinf darsliklari</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                11 ta sinf
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
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#18110B] text-stone-300 hover:text-amber-200 hover:bg-amber-500/20 border border-stone-800/90 hover:border-amber-500/40 transition-all truncate max-w-[120px]"
                  title={sub.name}
                >
                  {sub.name}
                </span>
              ))}
            </div>

            {subcategories.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 font-mono font-bold shrink-0">
                +{subcategories.length - 2}
              </span>
            )}
          </div>
        ) : (
          /* Single category without subcategories */
          <div className="flex items-center justify-between text-xs text-stone-400 group-hover:text-amber-300 transition-colors">
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              <BookText className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Katalogdagi adabiyotlar</span>
            </span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
              Kirish <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* Bottom glowing accent line on hover */}
      <div 
        className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${categoryColor}, transparent)`
        }}
      />
    </div>
  );
};
