import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  BookOpenText, 
  Languages, 
  ArrowLeft, 
  ArrowRight, 
  Flame, 
  ArrowUpRight 
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';

interface BookShowcaseSliderProps {
  books: Book[];
}

export const BookShowcaseSlider: React.FC<BookShowcaseSliderProps> = ({ books }) => {
  const { startReading, openBookDetails } = useLibrary();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalBooks = books.length;
  const AUTOPLAY_TIME = 3800;

  // Next / Previous slide handler
  const paginate = useCallback((newDirection: number) => {
    if (totalBooks <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + totalBooks) % totalBooks);
  }, [totalBooks]);

  // Auto-play interval
  useEffect(() => {
    if (totalBooks <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      paginate(1);
    }, AUTOPLAY_TIME);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [totalBooks, isPaused, paginate]);

  if (totalBooks === 0) {
    return null;
  }

  const currentBook = books[currentIndex] || books[0];

  // 3D Perspective Slide Animation Variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.94,
      rotateY: dir > 0 ? 8 : -8,
      filter: 'blur(5px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 26 },
        opacity: { duration: 0.35, ease: 'easeOut' },
        scale: { duration: 0.35, ease: 'easeOut' },
        rotateY: { duration: 0.4, ease: 'easeOut' },
        filter: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.94,
      rotateY: dir > 0 ? -8 : 8,
      filter: 'blur(5px)',
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 26 },
        opacity: { duration: 0.25, ease: 'easeIn' },
        scale: { duration: 0.25, ease: 'easeIn' },
        rotateY: { duration: 0.25, ease: 'easeIn' },
        filter: { duration: 0.2 },
      },
    }),
  };

  return (
    <section 
      className="relative px-3 sm:px-4 max-w-5xl mx-auto my-3 sm:my-4 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 2500);
      }}
    >
      {/* 1. Dynamic Reactive Ambient Color Aura */}
      <div className="absolute -inset-2 rounded-2xl overflow-hidden pointer-events-none -z-10 transition-all duration-700">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBook.id + '-ambient'}
            src={currentBook.coverUrl}
            alt=""
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.3, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover blur-[60px] brightness-110 saturate-150 transform-gpu"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
      </div>

      {/* 2. Main Showcase Glass Card - Borderless & Smooth */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C130D]/95 via-[#130D08]/98 to-[#090604]/98 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
        
        {/* Subtle Decorative Golden Radial Auroras */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Side Arrow Controls (Desktop) */}
        {totalBooks > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-xl bg-black/60 hover:bg-amber-500/25 text-stone-300 hover:text-amber-300 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer group"
              title="Oldingi kitob"
              aria-label="Oldingi kitob"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => paginate(1)}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-xl bg-black/60 hover:bg-amber-500/25 text-stone-300 hover:text-amber-300 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer group"
              title="Keyingi kitob"
              aria-label="Keyingi kitob"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-amber-400" />
            </button>
          </>
        )}

        {/* 3. Slider Content Area - Compact height */}
        <div className="relative min-h-[220px] sm:min-h-[250px] flex items-center overflow-hidden py-1 md:px-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentBook.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                const swipeThreshold = 45;
                if (info.offset.x > swipeThreshold || info.velocity.x > 250) {
                  paginate(-1);
                } else if (info.offset.x < -swipeThreshold || info.velocity.x < -250) {
                  paginate(1);
                }
              }}
              className="w-full cursor-grab active:cursor-grabbing flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-8"
            >
              {/* Left Side: 3D Floating Book Display - Compact & Refined */}
              <div className="relative shrink-0 flex flex-col items-center group">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.04, rotateY: -5 }}
                  onClick={() => openBookDetails(currentBook)}
                  className="relative w-32 sm:w-40 md:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(245,158,11,0.25)] bg-[#120B07] cursor-pointer transform-gpu"
                >
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  
                  {/* Realistic 3D Spine Depth Shadow */}
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
                  
                  {/* Subtle 3D Right Book Pages Thickness Rim */}
                  <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-white/30 via-white/10 to-transparent pointer-events-none" />
                  
                  {/* Glossy Diagonal Reflection Light Beam */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-85 pointer-events-none" />

                  {/* Top Subtle Luxury Indicator Badge */}
                  {currentBook.isFeatured && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-[9px] tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      Top
                    </div>
                  )}
                </motion.div>

                {/* 3D Ground Glow underneath */}
                <div className="w-28 sm:w-36 h-3 bg-gradient-to-r from-amber-500/35 via-orange-500/40 to-amber-500/35 rounded-full blur-md pointer-events-none mt-1" />
              </div>

              {/* Right Side: Kreativ & Elegant Typographic Content */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left min-w-0 max-w-xl">
                
                {/* Subtle Luxury Category Pill without AI icon or border */}
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold tracking-wide uppercase">
                    <span>{currentBook.categoryName}</span>
                  </span>
                </div>

                {/* Kitob Nomi - High Contrast Editorial Title */}
                <h3 
                  onClick={() => openBookDetails(currentBook)}
                  className="font-serif-title text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 bg-clip-text text-transparent hover:from-amber-200 hover:to-orange-400 transition-all cursor-pointer leading-tight mb-1"
                >
                  {currentBook.title}
                </h3>

                {/* Muallifi */}
                <p className="text-xs sm:text-sm font-semibold text-amber-400/90 mb-3">
                  <span className="text-stone-400 font-normal">Muallif: </span>
                  <span className="text-amber-300 hover:underline cursor-pointer" onClick={() => openBookDetails(currentBook)}>
                    {currentBook.authorName}
                  </span>
                </p>

                {/* Necha bet va Qaysi tilda - Modern Frosted Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-stone-200 mb-4 font-mono">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#22160E]/90 shadow-sm backdrop-blur-md font-medium text-[11px] sm:text-xs">
                    <BookOpenText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentBook.pages} bet</span>
                  </span>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#22160E]/90 shadow-sm backdrop-blur-md font-medium text-[11px] sm:text-xs">
                    <Languages className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentBook.language}</span>
                  </span>
                </div>

                {/* Mutolaa qilish tugmasi - Compact & Refined Button */}
                <div className="flex items-center justify-center md:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => startReading(currentBook)}
                    className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.45)] transition-all duration-200 cursor-pointer"
                  >
                    {/* Sliding Shimmer Light Glare */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                    
                    <BookOpenText className="w-4 h-4 text-stone-950" />
                    <span className="tracking-wide">Mutolaa qilish (PDF)</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-950 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
