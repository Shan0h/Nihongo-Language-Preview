'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface AfkSlide {
  japanese: string;
  romaji: string;
  meaning: string;
  emoji: string;
  image?: string;
}

const AFK_SLIDES: AfkSlide[] = [
  {
    japanese: 'こんにちは',
    romaji: 'konnichiwa',
    meaning: 'Hello',
    emoji: '👋',
    image: '/images/afk/afk-1.jpg',
  },
  {
    japanese: 'ありがとう',
    romaji: 'arigatou',
    meaning: 'Thank you',
    emoji: '🙏',
    image: '/images/afk/afk-2.jpg',
  },
  {
    japanese: 'すみません',
    romaji: 'sumimasen',
    meaning: 'Excuse me / Sorry',
    emoji: '🙇',
    image: '/images/afk/afk-3.jpg',
  },
  {
    japanese: 'おはよう',
    romaji: 'ohayou',
    meaning: 'Good morning',
    emoji: '☀️',
    image: '/images/afk/afk-4.jpg',
  },
  {
    japanese: 'いただきます',
    romaji: 'itadakimasu',
    meaning: 'Bon appétit / Thank you for the food',
    emoji: '🍱',
    image: '/images/afk/afk-5.jpg',
  },
  {
    japanese: 'おいしい',
    romaji: 'oishii',
    meaning: 'Delicious',
    emoji: '😋',
    image: '/images/afk/afk-6.jpg',
  },
  {
    japanese: 'さようなら',
    romaji: 'sayounara',
    meaning: 'Goodbye',
    emoji: '🌸',
    image: '/images/afk/afk-7.jpg',
  },
  {
    japanese: 'がんばって',
    romaji: 'ganbatte',
    meaning: 'Do your best! / Good luck!',
    emoji: '✊',
    image: '/images/afk/afk-8.jpg',
  },
];

const IDLE_TIMEOUT_MS = 15000; // 15 seconds of inactivity triggers AFK

export default function AfkScreensaver() {
  const [isAfk, setIsAfk] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset idle timer whenever user interacts with the page
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Only set new timer if not already in AFK mode
    idleTimerRef.current = setTimeout(() => {
      setIsAfk(true);
    }, IDLE_TIMEOUT_MS);
  }, []);

  // Dismiss AFK mode on click or interaction
  const dismissAfk = () => {
    setIsAfk(false);
    resetIdleTimer();
  };

  useEffect(() => {
    const handleUserActivity = () => {
      if (isAfk) {
        // Any activity while AFK dismisses it
        dismissAfk();
      } else {
        resetIdleTimer();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start initial timer
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isAfk, resetIdleTimer]);

  // Cycle slides automatically when AFK is active
  useEffect(() => {
    if (!isAfk) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % AFK_SLIDES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAfk]);

  // Custom global event listener to allow manual triggering
  useEffect(() => {
    const handleManualTrigger = () => setIsAfk(true);
    window.addEventListener('nihongo-trigger-afk', handleManualTrigger);
    return () => window.removeEventListener('nihongo-trigger-afk', handleManualTrigger);
  }, []);

  if (!isAfk) return null;

  const currentSlide = AFK_SLIDES[currentSlideIndex];

  return (
    <div
      onClick={dismissAfk}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-seigaiha-blur backdrop-blur-2xl cursor-pointer select-none transition-all duration-700 animate-fade-in p-6 sm:p-10 overflow-hidden"
    >
      {/* Top Left Watermark Sakura Blossom */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 opacity-20 pointer-events-none text-rose-300 dark:text-rose-700">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 35 C42 15, 25 15, 30 35 C20 28, 5 40, 25 50 C5 60, 20 72, 30 65 C25 85, 42 85, 50 65 C58 85, 75 85, 70 65 C80 72, 95 60, 75 50 C95 40, 80 28, 70 35 C75 15, 58 15, 50 35 Z" />
          <circle cx="50" cy="50" r="8" fill="#fda4af" opacity="0.6" />
        </svg>
      </div>

      {/* Bottom Right Watermark Sakura Blossom */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 opacity-20 pointer-events-none text-rose-300 dark:text-rose-700 rotate-45">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 35 C42 15, 25 15, 30 35 C20 28, 5 40, 25 50 C5 60, 20 72, 30 65 C25 85, 42 85, 50 65 C58 85, 75 85, 70 65 C80 72, 95 60, 75 50 C95 40, 80 28, 70 35 C75 15, 58 15, 50 35 Z" />
          <circle cx="50" cy="50" r="8" fill="#fda4af" opacity="0.6" />
        </svg>
      </div>

      {/* Top Header: NIHONGO EDUCATION & Dots */}
      <div className="flex flex-col items-center pt-2 sm:pt-4 z-10">
        <h1 className="text-xs sm:text-sm tracking-[0.35em] font-extrabold text-[#e15b64] dark:text-[#f472b6] uppercase text-center">
          NIHONGO EDUCATION
        </h1>
        <p className="text-[10px] sm:text-xs text-[#f4a0a9] dark:text-rose-400 font-bold tracking-widest mt-0.5">
          にほんご・きょういく
        </p>

        {/* Carousel Progress Dots */}
        <div className="flex items-center gap-1.5 mt-3">
          {AFK_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlideIndex
                  ? 'w-5 bg-[#e15b64] dark:bg-rose-500'
                  : 'w-1.5 bg-[#fbcfe8] dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center Showcase Card */}
      <div 
        key={currentSlideIndex}
        className="flex flex-col items-center justify-center my-auto z-10 max-w-sm w-full animate-scale-in"
      >
        {/* Character Illustration Card */}
        <div className="w-60 h-60 sm:w-68 sm:h-68 bg-white/95 dark:bg-[#18181b] rounded-3xl p-3 shadow-[0_20px_45px_rgba(225,91,100,0.2)] border-4 border-rose-200/90 dark:border-rose-950/60 overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-102">
          {currentSlide.image ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={currentSlide.image}
                alt={currentSlide.japanese}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 240px, 272px"
                priority
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-6xl sm:text-7xl animate-bounce">
              <span>{currentSlide.emoji}</span>
            </div>
          )}
        </div>

        {/* Big Japanese Typography */}
        <h2 className="text-4xl sm:text-5xl font-black text-[#4a1c1d] dark:text-white tracking-wide font-sans text-center mt-5 mb-0.5 transition-all duration-300 drop-shadow-2xs">
          {currentSlide.japanese}
        </h2>

        {/* Romaji in Italic Red */}
        <p className="text-base sm:text-lg font-black italic text-[#dc2626] dark:text-rose-400 mt-0.5">
          {currentSlide.romaji}
        </p>

        {/* English Meaning */}
        <p className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
          {currentSlide.meaning}
        </p>
      </div>

      {/* Bottom Area: Avatar + Start Button + Subtitle */}
      <div className="flex flex-col items-center pb-2 sm:pb-4 z-10 w-full max-w-xs">
        {/* Small Avatar Indicator */}
        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-700 flex items-center justify-center text-xs mb-3 shadow-xs">
          👧
        </div>

        {/* Tap Anywhere to Start Button */}
        <button
          onClick={dismissAfk}
          className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-gradient-to-r from-[#e57373] to-[#ef5350] hover:from-[#ef5350] hover:to-[#e53935] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-[0_8px_20px_rgba(239,83,80,0.35)] hover:shadow-lg transition-all duration-300 animate-bounce active:scale-95 flex items-center justify-center gap-2"
        >
          <span>👆</span>
          <span>TAP ANYWHERE TO START</span>
          <span>🌸</span>
        </button>

        {/* Footer Text */}
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#e57373] dark:text-rose-400 uppercase mt-3">
          SPEAK • PLAY • LEARN JAPANESE
        </p>
      </div>
    </div>
  );
}
