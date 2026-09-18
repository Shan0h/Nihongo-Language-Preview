'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';

export default function TopicsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      container.scrollTo({
        left: target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && Math.abs(e.deltaY) > 0) {
      scrollRef.current.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  };
  return (
    <div className="h-screen max-h-screen p-3 sm:p-4 select-none transition-colors duration-500 relative overflow-hidden flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
        
        {/* Top Header Bar */}
        <div className="animate-fade-in-up flex items-center justify-between mb-3 pb-2 border-b border-rose-200/50 dark:border-rose-900/50 flex-shrink-0">
          <Link href="/" className="btn-torii px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1">
            ← Home
          </Link>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#4c0519] dark:text-white flex items-center justify-center gap-3">
              <span className="animate-bounce">🎌</span> SELECT A JAPANESE TOPIC
            </h1>
            <p className="text-sm text-[#64748b] dark:text-slate-300 font-bold mt-1.5">
              Choose your practice topic for Solo Kiosk Mode 🌸
            </p>
          </div>
          <Link href="/scoreboard" className="btn-gold px-3.5 py-2 text-xs sm:text-sm font-black">
            🏆 Scoreboard
          </Link>
        </div>

        {/* Instruction Step Banner */}
        <div className="animate-fade-in-up card-cultural p-4 mb-4 bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-rose-50/80 dark:from-black/60 dark:via-[#111111]/80 dark:to-black/60 border border-white dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-md flex-shrink-0" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm border border-rose-400">
              🎯
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#4c0519] dark:text-white tracking-wide">SOLO KIOSK PRACTICE INSTRUCTIONS</h3>
              <p className="text-xs text-[#64748b] dark:text-slate-300 font-medium mt-0.5">
                Click any topic below to try Japanese pronunciation audio (🔊), microphone speech (🎤), and Kahoot quiz!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-white/70 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white dark:border-white/10 flex-shrink-0 shadow-sm">
            <span>1. Pick Topic</span>
            <span className="text-lg">→</span>
            <span>2. Start Practice 🚀</span>
          </div>
        </div>

        {/* Cover Flow Topics Album */}
        <div className="relative w-full overflow-hidden -mx-4 sm:-mx-6 px-4 sm:px-6 flex-1 flex flex-col min-h-0 mb-4 group">
          
          {/* Left Nav Button */}
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 ${activeIndex === 0 ? 'opacity-0 cursor-default scale-90 pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 text-[#4c0519] dark:text-white hover:shadow-[0_8px_30px_rgb(244,63,94,0.3)]'}`}
            aria-label="Previous Topic"
          >
            ←
          </button>

          {/* Right Nav Button */}
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === categories.length - 1}
            className={`absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 ${activeIndex === categories.length - 1 ? 'opacity-0 cursor-default scale-90 pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 text-[#4c0519] dark:text-white hover:shadow-[0_8px_30px_rgb(244,63,94,0.3)]'}`}
            aria-label="Next Topic"
          >
            →
          </button>

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-4 flex-1 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ paddingLeft: 'calc(50vw - 160px)', paddingRight: 'calc(50vw - 160px)' }}
          >
            {categories.map((category, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  id="topic-card"
                  key={category.slug}
                  className={`snap-center flex-shrink-0 w-[320px] transition-all duration-500 ease-out cursor-pointer
                    ${isActive 
                      ? 'scale-110 opacity-100 z-10' 
                      : 'scale-90 opacity-50 hover:opacity-80 z-0'}
                  `}
                  onClick={() => {
                    // Smooth scroll to this card if clicked and not active
                    if (!isActive) {
                      scrollToIndex(idx);
                    }
                  }}
                >
                  <div className={`card-cultural p-4 sm:p-5 flex flex-col justify-between h-[300px] border transition-colors duration-300 ${isActive ? 'border-rose-400 dark:border-rose-500 shadow-[0_20px_40px_rgb(244,63,94,0.2)] bg-white/70 dark:bg-black/60' : 'border-white dark:border-white/10 shadow-sm bg-white/40 dark:bg-transparent'} backdrop-blur-md group`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/10 border border-white dark:border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                          {category.emoji}
                        </div>
                        <span className="px-3 py-1.5 bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-full border border-rose-200 dark:border-rose-800/50">
                          {category.questionCount} Questions
                        </span>
                      </div>

                      <h2 className={`text-xl font-black mb-1.5 transition-colors ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-[#4c0519] dark:text-white'}`}>
                        {category.name}
                      </h2>
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-black text-xs shadow-sm">
                          🈁 {category.japanese}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] dark:text-slate-300 font-medium leading-relaxed mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    <Link
                      href={`/quiz/${category.slug}`}
                      className={`btn-torii w-full py-3 text-sm font-black flex items-center justify-center gap-2 transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
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

        {/* Bottom Banner */}
        <div className="animate-fade-in-up card-cultural p-3 bg-gradient-to-r from-rose-50/80 to-amber-50/80 dark:from-black/60 dark:to-black/60 border border-white dark:border-white/10 text-center text-xs text-[#4c0519] dark:text-slate-300 font-bold shadow-sm flex-shrink-0" style={{ animationDelay: '0.8s' }}>
          💡 Tip: You can practice Japanese voice pronunciation using your microphone on every question!
        </div>

      </div>
    </div>
  );
}
