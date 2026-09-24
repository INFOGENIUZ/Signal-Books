import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { 
  BookOpenText, 
  Languages, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  AudioLines,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { shuffleArray } from '../../utils/bookUtils';
import { Icon3D } from '../common/Icon3D';

interface BookShowcaseSliderProps {
  books: Book[];
}

export const BookShowcaseSlider: React.FC<BookShowcaseSliderProps> = ({ books }) => {
  const { startReading, openBookDetails, openCategoryPage, playAudio } = useLibrary();

  // Shuffle books on mount
  const displayBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    return shuffleArray(books).slice(0, 8);
  }, [books]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // GSAP animation refs
  const sliderCardRef = useRef<HTMLDivElement>(null);
  const coverWrapperRef = useRef<HTMLDivElement>(null);
  const coverImageRef = useRef<HTMLImageElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const authorRef = useRef<HTMLParagraphElement>(null);
  const categoryPillRef = useRef<HTMLDivElement>(null);
  const metaBadgesRef = useRef<HTMLDivElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLImageElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const totalBooks = displayBooks.length;
  const AUTOPLAY_TIME = 4500; // ms

  const currentBook = displayBooks[currentIndex] || displayBooks[0];

  // High-performance GSAP Spring & Stagger Slide Transition (Zero blur filters, 100% GPU accelerated)
  const animateSlideChange = useCallback((dir: number = 1) => {
    if (!contentWrapperRef.current) return;

    const tl = gsap.timeline();

    // 1. Fast Exit (Cover & Details)
    if (coverWrapperRef.current) {
      tl.to(coverWrapperRef.current, {
        x: dir * -25,
        opacity: 0,
        scale: 0.92,
        duration: 0.18,
        ease: 'power2.in',
      });
    }

    tl.to(
      [categoryPillRef.current, titleRef.current, authorRef.current, metaBadgesRef.current, actionButtonsRef.current],
      {
        y: dir * -10,
        opacity: 0,
        stagger: 0.02,
        duration: 0.16,
        ease: 'power2.in',
      },
      '<'
    );

    // 2. Dynamic Entrance with Spring Elasticity
    if (coverWrapperRef.current) {
      tl.fromTo(
        coverWrapperRef.current,
        {
          x: dir * 35,
          opacity: 0,
          scale: 0.88,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.4)',
        }
      );
    }

    // 3. Staggered Text & Button Rise
    tl.fromTo(
      [categoryPillRef.current, titleRef.current, authorRef.current, metaBadgesRef.current, actionButtonsRef.current],
      {
        y: dir * 14,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        stagger: 0.04,
        duration: 0.38,
        ease: 'power3.out',
      },
      '-=0.3'
    );
  }, []);

  const goToNext = useCallback(() => {
    if (totalBooks <= 1) return;
    animateSlideChange(1);
    setCurrentIndex((prev) => (prev + 1) % totalBooks);
  }, [totalBooks, animateSlideChange]);

  const goToPrev = useCallback(() => {
    if (totalBooks <= 1) return;
    animateSlideChange(-1);
    setCurrentIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  }, [totalBooks, animateSlideChange]);

  // Auto-play timeline timer
  useEffect(() => {
    if (totalBooks <= 1 || isPaused) return;

    if (progressBarRef.current) {
      gsap.fromTo(
        progressBarRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: AUTOPLAY_TIME / 1000, ease: 'none' }
      );
    }

    const timer = setInterval(() => {
      goToNext();
    }, AUTOPLAY_TIME);

    return () => {
      clearInterval(timer);
      if (progressBarRef.current) {
        gsap.killTweensOf(progressBarRef.current);
      }
    };
  }, [totalBooks, isPaused, goToNext, currentIndex]);

  // Mouse hover lightweight subtle scale
  const handleMouseMove = () => {
    // Keep lightweight for performance on low end devices
  };

  const handleMouseLeaveCover = () => {
    // Keep lightweight
  };

  if (totalBooks === 0) return null;

  return (
    <section 
      className="relative px-3 sm:px-4 max-w-4xl mx-auto my-2 sm:my-3 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2500)}
    >
      {/* Ambient Warm Glow (Lightweight CSS radial gradient) */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 opacity-60 pointer-events-none -z-10 blur-md transition-opacity duration-500" />

      {/* Compact Main Container */}
      <div 
        ref={sliderCardRef}
        className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1C140D] via-[#130E09] to-[#0E0A07] border border-amber-500/40 p-3.5 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Top Progress Line */}
        <div className="w-full h-1 bg-stone-800/80 rounded-full overflow-hidden mb-3 sm:mb-4">
          <div 
            ref={progressBarRef} 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-full shadow-[0_0_10px_#f59e0b]"
          />
        </div>

        {/* Navigation Arrows */}
        {totalBooks > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-xl bg-black/60 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md backdrop-blur-md cursor-pointer group"
              title="Oldingi kitob"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-xl bg-black/60 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md backdrop-blur-md cursor-pointer group"
              title="Keyingi kitob"
            >
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}

        {/* Compact Content Area */}
        <div 
          ref={contentWrapperRef}
          className="relative min-h-[160px] sm:min-h-[180px] flex items-center justify-center overflow-hidden py-1"
        >
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 z-20 px-1 sm:px-4">
            
            {/* Left: Compact 3D Book Cover */}
            <div className="relative shrink-0 flex flex-col items-center group">
              <div
                ref={coverWrapperRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeaveCover}
                onClick={() => openBookDetails(currentBook)}
                className="relative w-28 sm:w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.25)] bg-[#120B07] cursor-pointer border border-amber-500/35 transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  ref={coverImageRef}
                  src={currentBook.coverUrl || undefined}
                  alt={currentBook.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                />
                
                {/* Book Spine */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/85 via-black/35 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-80 pointer-events-none" />

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 font-extrabold text-[10px] font-mono flex items-center gap-1 shadow-md">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{currentBook.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Ground Shadow */}
              <div className="w-24 sm:w-28 h-2.5 bg-gradient-to-r from-amber-500/35 via-orange-500/45 to-amber-500/35 rounded-full blur-sm pointer-events-none mt-1" />
            </div>

            {/* Right: Compact Details */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left min-w-0 max-w-lg space-y-1.5">
              
              {/* Category Pill */}
              <div ref={categoryPillRef} className="flex items-center justify-center md:justify-start gap-1.5">
                <button
                  onClick={() => openCategoryPage(currentBook.categoryId)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wide uppercase transition-all"
                >
                  <Icon3D name="badiiy" size={15} />
                  <span>{currentBook.categoryName}</span>
                </button>

                {currentBook.hasAudio && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/35 text-amber-300 text-[10px] font-semibold">
                    <AudioLines className="w-2.5 h-2.5 text-amber-400" />
                    <span>Audio</span>
                  </span>
                )}
              </div>

              {/* Compact Title */}
              <h3 
                ref={titleRef}
                onClick={() => openBookDetails(currentBook)}
                className="font-heading text-lg sm:text-xl md:text-2xl font-extrabold text-stone-100 hover:text-amber-300 transition-colors cursor-pointer leading-snug tracking-tight line-clamp-1"
              >
                {currentBook.title}
              </h3>

              {/* Author */}
              <p ref={authorRef} className="text-xs font-semibold text-amber-400/90">
                <span className="text-stone-400 font-normal">Muallif: </span>
                <span className="text-amber-300 hover:underline cursor-pointer" onClick={() => openBookDetails(currentBook)}>
                  {currentBook.authorName}
                </span>
              </p>

              {/* Compact Meta Stats */}
              <div ref={metaBadgesRef} className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-0.5 text-[11px] text-stone-300 font-mono">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#22160E] border border-amber-950/80 font-medium text-[11px]">
                  <BookOpenText className="w-3 h-3 text-amber-400" />
                  <span>{currentBook.pages} bet</span>
                </span>
                
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#22160E] border border-amber-950/80 font-medium text-[11px]">
                  <Languages className="w-3 h-3 text-amber-400" />
                  <span>{currentBook.language}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#22160E] border border-amber-950/80 font-medium text-[11px] text-stone-400">
                  <Eye className="w-3 h-3 text-amber-400/80" />
                  <span>{currentBook.views || 1} mutolaa</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div ref={actionButtonsRef} className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => startReading(currentBook)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all duration-200 cursor-pointer font-heading"
                >
                  <BookOpenText className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                  <span>Mutolaa qilish (PDF)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
                </button>

                {currentBook.hasAudio && (
                  <button
                    type="button"
                    onClick={() => {
                      playAudio({
                        id: `track-${currentBook.id}`,
                        bookId: currentBook.id,
                        title: currentBook.title,
                        author: currentBook.authorName,
                        coverUrl: currentBook.coverUrl,
                        duration: 3600,
                        audioSrc: currentBook.audioUrl || currentBook.googleDriveUrl
                      });
                    }}
                    className="px-3 py-2 rounded-lg bg-[#22160E] hover:bg-[#2A1B12] border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AudioLines className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audio</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
