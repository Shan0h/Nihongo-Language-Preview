'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';

export default function TopicsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Center the first topic (Greetings) on initial mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;

    const cards = Array.from(container.children).filter(c => c.id === 'topic-card');
    cards.forEach((child, index) => {
      const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (activeIndex !== closestIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current || index < 0 || index >= categories.length) return;
    const container = scrollRef.current;
    const cards = Array.from(container.children).filter(c => c.id === 'topic-card');
    const target = cards[index] as HTMLElement;
    if (target) {
      const scrollPosition = target.offsetLeft - (container.clientWidth / 2) + (target.clientWidth / 2);
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && Math.abs(e.deltaY) > 0) {
      scrollRef.current.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  };

  return (
    <div className="h-screen max-h-screen p-3 sm:p-4 select-none transition-colors duration-500 relative overflow-hidden flex flex-col bg-gradient-to-b from-[#fff6f7] via-[#fdf2f4] to-[#fff0f3] dark:from-[#140608] dark:to-[#1a080d]">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
        
        {/* Top Header Bar */}
        <div className="animate-fade-in-up flex items-center justify-between mb-2 pb-2 border-b border-rose-200/50 dark:border-rose-900/50 flex-shrink-0">
          <Link href="/" className="btn-torii px-4 py-1.5 text-xs sm:text-sm font-black flex items-center gap-1">
            ← Home
          </Link>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#4c0519] dark:text-white flex items-center justify-center gap-2">
              <span className="animate-bounce">🎌</span> SELECT A JAPANESE TOPIC
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] dark:text-slate-300 font-bold mt-0.5">
              Choose your practice topic for Solo Kiosk Mode 🌸
            </p>
          </div>
          <Link href="/scoreboard" className="btn-gold px-3.5 py-1.5 text-xs sm:text-sm font-black">
            🏆 Scoreboard
          </Link>
        </div>

        {/* Instruction Step Banner */}
        <div className="animate-fade-in-up card-cultural p-3 mb-2 bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-rose-50/80 dark:from-black/60 dark:via-[#111111]/80 dark:to-black/60 border border-white dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs flex-shrink-0" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-xs border border-rose-400">
              🎯
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#4c0519] dark:text-white tracking-wide">SOLO KIOSK PRACTICE INSTRUCTIONS</h3>
              <p className="text-[11px] sm:text-xs text-[#64748b] dark:text-slate-300 font-medium mt-0.5">
                Click any topic below to try Japanese pronunciation audio (🔊), microphone speech (🎤), and Kahoot quiz!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white/70 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white dark:border-white/10 flex-shrink-0 shadow-2xs">
            <span>1. Pick Topic</span>
            <span className="text-base">→</span>
            <span>2. Start Practice 🚀</span>
          </div>
        </div>

        {/* Cover Flow Topics Album */}
        <div className="relative w-full overflow-hidden flex-1 flex flex-col justify-center min-h-0 my-1 group">
          
          {/* Left Nav Button */}
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-xl transition-all duration-300 cursor-pointer ${activeIndex === 0 ? 'opacity-0 cursor-default scale-90 pointer-events-none' : 'opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 text-[#4c0519] dark:text-white'}`}
            aria-label="Previous Topic"
          >
            ←
          </button>

          {/* Right Nav Button */}
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === categories.length - 1}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-xl transition-all duration-300 cursor-pointer ${activeIndex === categories.length - 1 ? 'opacity-0 cursor-default scale-90 pointer-events-none' : 'opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 text-[#4c0519] dark:text-white'}`}
            aria-label="Next Topic"
          >
            →
          </button>

          {/* Carousel Track with Container Centering */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 py-4 flex-1 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ 
              paddingLeft: 'calc(50% - 150px)', 
              paddingRight: 'calc(50% - 150px)' 
            }}
          >
            {categories.map((category, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  id="topic-card"
                  key={category.slug}
                  className={`snap-center flex-shrink-0 w-[300px] transition-all duration-500 ease-out cursor-pointer
                    ${isActive 
                      ? 'scale-105 opacity-100 z-10' 
                      : 'scale-90 opacity-50 hover:opacity-80 z-0'}
                  `}
                  onClick={() => {
                    if (!isActive) {
                      scrollToIndex(idx);
                    }
                  }}
                >
                  <div className={`card-cultural p-5 flex flex-col justify-between h-[280px] border-2 transition-all duration-300 rounded-3xl ${isActive ? 'border-rose-400 dark:border-rose-500 shadow-[0_15px_35px_rgba(244,63,94,0.18)] bg-white/95 dark:bg-[#141414]' : 'border-white/80 dark:border-white/10 shadow-xs bg-white/60 dark:bg-black/40'} backdrop-blur-md group`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-white/90 dark:bg-white/10 border border-white dark:border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xs">
                          {category.emoji}
                        </div>
                        <span className="px-2.5 py-1 bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] rounded-full border border-rose-200 dark:border-rose-800/50">
                          {category.questionCount} Questions
                        </span>
                      </div>

                      <h2 className={`text-lg font-black mb-1 transition-colors ${isActive ? 'text-red-600 dark:text-rose-400' : 'text-[#4c0519] dark:text-white'}`}>
                        {category.name}
                      </h2>
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-black text-[11px] shadow-2xs">
                          🈁 {category.japanese}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] dark:text-slate-300 font-medium leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    <Link
                      href={`/quiz/${category.slug}`}
                      className={`btn-torii w-full py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all rounded-xl ${isActive ? 'opacity-100 translate-y-0 shadow-md hover:shadow-lg' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <span>Start Practice</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Dots Pagination Indicator */}
        <div className="flex items-center justify-center gap-1.5 my-1.5 flex-shrink-0">
          {categories.map((cat, i) => (
            <button
              key={cat.slug}
              onClick={() => scrollToIndex(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === activeIndex
                  ? 'w-6 h-2 bg-red-600 dark:bg-rose-400'
                  : 'w-2 h-2 bg-rose-200 dark:bg-stone-700 hover:bg-rose-300'
              }`}
              title={cat.name}
            />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="animate-fade-in-up card-cultural p-2 bg-gradient-to-r from-rose-50/80 to-amber-50/80 dark:from-black/60 dark:to-black/60 border border-white dark:border-white/10 text-center text-[11px] text-[#4c0519] dark:text-slate-300 font-bold shadow-2xs flex-shrink-0">
          💡 Tip: You can practice Japanese voice pronunciation using your microphone on every question!
        </div>

      </div>
    </div>
  );
}
