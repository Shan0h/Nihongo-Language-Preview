'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/data/questions';
import { bgm } from '@/app/utils/bgm';

// Gentle falling sakura petals
const SakuraBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="sakura-container pointer-events-none z-0">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${4 + (i % 10) * 9.8}%`,
            animationDuration: `${11 + (i % 5) * 1.5}s`,
            animationDelay: `-${i * 1.2}s`,
            width: `${8 + (i % 3) * 3}px`,
            height: `${8 + (i % 3) * 3}px`,
            opacity: 0.65 + (i % 4) * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export default function TopicsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync theme & BGM state
  useEffect(() => {
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const userBgm = localStorage.getItem('nihongo-bgm-enabled');
    if (userBgm !== null) {
      setIsBgmPlaying(userBgm !== 'false');
    }

    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nihongo-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nihongo-theme', 'light');
    }
  };

  const handleToggleBgm = () => {
    const newState = bgm.toggle();
    setIsBgmPlaying(newState);
  };

  const handleTriggerAfk = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nihongo-trigger-afk'));
    }
  };

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
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#fff0f3] dark:bg-[#0c080e] flex flex-col justify-between p-4 sm:p-5 lg:px-10 lg:py-4 select-none transition-colors duration-500">
      
      {/* Full-bleed Scenic Fuji Sakura Background (Day & Night) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Day Mode Scenic Background */}
        <Image
          src="/images/fuji-sakura-bg.png"
          alt="Mount Fuji Sakura Day Background"
          fill
          priority
          className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-700 select-none pointer-events-none"
        />
        {/* Night Mode Scenic Background */}
        <Image
          src="/images/fuji-night-bg.jpg"
          alt="Mount Fuji Sakura Night Background"
          fill
          priority
          className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-700 select-none pointer-events-none"
        />
        {/* Day Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-[#fff0f3]/25 to-[#ffe8ee]/45 opacity-100 dark:opacity-0 transition-opacity duration-700 pointer-events-none" />
        {/* Night Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70 opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>

      <SakuraBackground />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between min-h-0">
        
        {/* TOP HEADER NAVBAR */}
        <header className="animate-fade-in-up flex items-center justify-between flex-shrink-0 mb-1">
          {/* Home Button */}
          <Link
            href="/"
            className="glass-pill px-4 sm:px-5 py-2 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 border-rose-300/80 dark:border-rose-500/50 hover:border-rose-500 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>←</span>
            <span>Home</span>
          </Link>

          {/* Central Title */}
          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1e1b2e] dark:text-white flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl">🎌</span>
              <span>SELECT A </span>
              <span className="text-[#e11d48] dark:text-rose-400">JAPANESE TOPIC</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-300 font-medium tracking-wide mt-0.5">
              Choose your practice topic for Solo Kiosk Mode 🌸
            </p>
          </div>

          {/* Right Controls: Scoreboard + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/scoreboard"
              className="glass-pill px-4 py-2 rounded-full text-xs font-bold text-amber-600 dark:text-amber-300 border-amber-300/80 dark:border-amber-500/50 hover:border-amber-400 flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>🏆</span>
              <span>Scoreboard</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-rose-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              title={isDarkMode ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
            >
              <span>{isDarkMode ? '🌙' : '☀️'}</span>
              <span className="tracking-wider">{isDarkMode ? '夜 NIGHT' : '昼 DAY'}</span>
              <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isDarkMode ? 'bg-[#e11d48]' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${isDarkMode ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </header>

        {/* SOLO KIOSK PRACTICE INSTRUCTIONS BANNER */}
        <div 
          className="animate-fade-in-up glass-panel-master rounded-[1.75rem] p-3 sm:p-3.5 my-1.5 sm:my-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs flex-shrink-0"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
              🎯
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wider uppercase text-stone-800 dark:text-white">
                SOLO KIOSK PRACTICE INSTRUCTIONS
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-300 font-medium mt-0.5">
                Click any topic below to try Japanese pronunciation audio (🔊), microphone speech (🎤), and Kahoot quiz!
              </p>
            </div>
          </div>

          <div className="glass-pill px-3.5 py-1.5 rounded-full border-rose-200/80 dark:border-rose-500/40 text-xs font-bold text-[#e11d48] dark:text-rose-400 flex items-center gap-2 shadow-2xs flex-shrink-0">
            <span>1. Pick Topic</span>
            <span className="text-stone-400">→</span>
            <span>2. Start Practice 🚀</span>
          </div>
        </div>

        {/* COVER FLOW / HORIZONTAL CAROUSEL TRACK */}
        <div className="relative w-full overflow-hidden flex-1 flex flex-col justify-center min-h-0 my-1 group">
          
          {/* Left Arrow Nav Button */}
          {activeIndex > 0 && (
            <button
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-rose-400/70 dark:border-rose-500/70 bg-white/80 dark:bg-black/60 backdrop-blur-xl text-stone-800 dark:text-white flex items-center justify-center text-lg hover:scale-110 active:scale-95 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all cursor-pointer"
              aria-label="Previous Topic"
            >
              ←
            </button>
          )}

          {/* Right Arrow Nav Button */}
          {activeIndex < categories.length - 1 && (
            <button
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-rose-400/70 dark:border-rose-500/70 bg-white/80 dark:bg-black/60 backdrop-blur-xl text-stone-800 dark:text-white flex items-center justify-center text-lg hover:scale-110 active:scale-95 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all cursor-pointer"
              aria-label="Next Topic"
            >
              →
            </button>
          )}

          {/* Carousel Track with Centering */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 py-4 flex-1 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ 
              paddingLeft: 'calc(50% - 160px)', 
              paddingRight: 'calc(50% - 160px)' 
            }}
          >
            {categories.map((category, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  id="topic-card"
                  key={category.slug}
                  className={`snap-center flex-shrink-0 w-[300px] sm:w-[330px] transition-all duration-500 ease-out cursor-pointer
                    ${isActive 
                      ? 'scale-100 opacity-100 z-10' 
                      : 'scale-90 opacity-45 hover:opacity-75 z-0'}
                  `}
                  onClick={() => {
                    if (!isActive) {
                      scrollToIndex(idx);
                    }
                  }}
                >
                  <div 
                    className={`rounded-[2.25rem] p-5 sm:p-6 flex flex-col justify-between h-[320px] sm:h-[340px] transition-all duration-500 backdrop-blur-2xl relative overflow-hidden group ${
                      isActive 
                        ? 'bg-white/90 dark:bg-[#161224]/85 border-2 border-rose-400 dark:border-rose-500/90 shadow-[0_0_35px_rgba(244,63,94,0.38),inset_0_1px_2px_rgba(255,255,255,0.4)]' 
                        : 'glass-card-interactive border border-white/80 dark:border-white/10 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Card Top: Icon & 10 Questions Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/95 dark:bg-white/10 border border-rose-100/80 dark:border-white/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-2xs">
                          {category.emoji}
                        </div>
                        <span className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-[#e11d48] dark:text-rose-300 border-rose-200/80 dark:border-rose-500/40">
                          {category.questionCount} Questions
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h2 className={`text-2xl sm:text-3xl font-black mb-1 tracking-tight transition-colors ${isActive ? 'text-[#1e1b2e] dark:text-white' : 'text-stone-700 dark:text-stone-200'}`}>
                        {category.name}
                      </h2>

                      {/* Japanese Pronunciation Pill */}
                      <div className="mt-1.5 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 text-[#e11d48] dark:text-rose-300 font-extrabold text-xs shadow-2xs">
                          🈁 {category.japanese}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] text-stone-500 dark:text-stone-300 font-medium leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Start Practice Action Button */}
                    <div className="pt-2">
                      <Link
                        href={`/quiz/${category.slug}`}
                        className={`w-full py-3 px-6 rounded-full font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-r from-red-500 via-rose-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-rose-900/30 hover:shadow-xl active:scale-95 opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                        tabIndex={isActive ? 0 : -1}
                      >
                        <span>Start Practice</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PAGINATION DOTS INDICATOR */}
        <div className="flex items-center justify-center gap-1.5 my-1.5 flex-shrink-0">
          {categories.map((cat, i) => (
            <button
              key={cat.slug}
              onClick={() => scrollToIndex(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === activeIndex
                  ? 'w-6 h-2 bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                  : 'w-2 h-2 bg-stone-300 dark:bg-white/20 hover:bg-stone-400 dark:hover:bg-white/40'
              }`}
              title={cat.name}
            />
          ))}
        </div>

        {/* BOTTOM FOOTER BAR */}
        <footer className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-rose-100/60 dark:border-white/10 flex-shrink-0">
          {/* Tip Capsule */}
          <div className="glass-pill rounded-full py-2 px-5 flex-1 max-w-3xl text-center text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs flex items-center justify-center gap-2">
            <span>💡</span>
            <span>Tip: You can practice Japanese voice pronunciation using your microphone on every question!</span>
          </div>

          {/* Right Floating Controls: Zen BGM & AFK */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Zen BGM Toggle */}
            <button
              onClick={handleToggleBgm}
              className="glass-pill rounded-full px-3 py-1.5 flex items-center gap-2 text-xs cursor-pointer transition-all"
              title={isBgmPlaying ? "Pause Ambient BGM" : "Play Ambient BGM"}
            >
              <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-[9px]">
                🎵
              </span>
              <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                Zen BGM
              </span>
              <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isBgmPlaying ? 'bg-[#e11d48]' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${isBgmPlaying ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* AFK Screensaver Button */}
            <button
              onClick={handleTriggerAfk}
              className="glass-pill rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer"
              title="Launch AFK Japanese Screensaver"
            >
              <span>🌸</span>
              <span>AFK</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
