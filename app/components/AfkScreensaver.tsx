'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/app/utils/supabase';

interface AfkSlide {
  type: 'vocab' | 'scoreboard';
  japanese?: string;
  romaji?: string;
  meaning?: string;
  emoji?: string;
  image?: string;
}

interface LeaderboardRecord {
  id?: string;
  name: string;
  points: number;
  accuracy: number;
  badge?: string;
  category?: string;
}

const FALLBACK_CHAMPIONS: LeaderboardRecord[] = [
  { name: 'Takeshi', points: 15400, accuracy: 100, badge: 'Grandmaster 🏆' },
  { name: 'Sakura 🌸', points: 14200, accuracy: 95, badge: 'Master 🥇' },
  { name: 'Kenji', points: 12800, accuracy: 90, badge: 'Expert 🥈' },
  { name: 'Aoi', points: 11500, accuracy: 88, badge: 'Scholar 🥉' },
  { name: 'Yuto', points: 10200, accuracy: 85, badge: 'Apprentice ⭐' },
];

const VOCAB_DATA = [
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

// Construct alternating cycle: 2 vocab -> 1 scoreboard -> 2 vocab -> 1 scoreboard...
const AFK_SLIDES: AfkSlide[] = [
  { type: 'vocab', ...VOCAB_DATA[0] },
  { type: 'vocab', ...VOCAB_DATA[1] },
  { type: 'scoreboard' },
  { type: 'vocab', ...VOCAB_DATA[2] },
  { type: 'vocab', ...VOCAB_DATA[3] },
  { type: 'scoreboard' },
  { type: 'vocab', ...VOCAB_DATA[4] },
  { type: 'vocab', ...VOCAB_DATA[5] },
  { type: 'scoreboard' },
  { type: 'vocab', ...VOCAB_DATA[6] },
  { type: 'vocab', ...VOCAB_DATA[7] },
];

const IDLE_TIMEOUT_MS = 15000; // 15 seconds of inactivity triggers AFK

export default function AfkScreensaver() {
  const [isAfk, setIsAfk] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [topScores, setTopScores] = useState<LeaderboardRecord[]>(FALLBACK_CHAMPIONS);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live scores from Supabase
  useEffect(() => {
    async function fetchScores() {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('name, points, accuracy, badge, category')
          .order('points', { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          setTopScores(data);
        }
      } catch (err) {
        console.error('Failed to load AFK leaderboard:', err);
      }
    }

    fetchScores();

    // Subscribe to realtime additions
    const channel = supabase
      .channel('afk_leaderboard_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leaderboard' },
        () => {
          fetchScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reset idle timer whenever user interacts with the page
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

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
        dismissAfk();
      } else {
        resetIdleTimer();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start initial timer
    resetIdleTimer();

    return () => {
      events.forEach((event) => {
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

    // Leaderboard slides get slightly longer display (5.5s), vocab slides (4s)
    const currentSlide = AFK_SLIDES[currentSlideIndex];
    const delay = currentSlide.type === 'scoreboard' ? 5500 : 4000;

    const timeout = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % AFK_SLIDES.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isAfk, currentSlideIndex]);

  // Custom global event listener to allow manual triggering
  useEffect(() => {
    const handleManualTrigger = () => setIsAfk(true);
    window.addEventListener('nihongo-trigger-afk', handleManualTrigger);
    return () => window.removeEventListener('nihongo-trigger-afk', handleManualTrigger);
  }, []);

  if (!isAfk) return null;

  const currentSlide = AFK_SLIDES[currentSlideIndex];
  const isScoreboard = currentSlide.type === 'scoreboard';

  const champion1 = topScores[0] || FALLBACK_CHAMPIONS[0];
  const champion2 = topScores[1] || FALLBACK_CHAMPIONS[1];
  const champion3 = topScores[2] || FALLBACK_CHAMPIONS[2];
  const runnerUps = topScores.slice(3, 5);

  return (
    <div
      onClick={dismissAfk}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/40 dark:bg-black/60 backdrop-blur-xl cursor-pointer select-none transition-all duration-500 animate-fade-in p-5 sm:p-8 overflow-hidden"
    >
      {/* Top Header in clean frosted pill */}
      <div className="flex flex-col items-center pt-2 sm:pt-3 z-10 px-5 py-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-md">
        {isScoreboard ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🏆</span>
              <h1 className="text-xs sm:text-sm tracking-[0.35em] font-black text-amber-600 dark:text-amber-400 uppercase text-center">
                CHAMPIONS HALL OF FAME
              </h1>
              <span className="text-xl animate-bounce">👑</span>
            </div>
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-bold tracking-widest mt-0.5">
              トップ・スコアボード — TOP PLAYERS
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xs sm:text-sm tracking-[0.35em] font-extrabold text-[#e15b64] dark:text-[#f472b6] uppercase text-center">
              NIHONGO EDUCATION
            </h1>
            <p className="text-[10px] sm:text-xs text-rose-400 dark:text-rose-300 font-bold tracking-widest mt-0.5">
              にほんご・きょういく
            </p>
          </>
        )}

        {/* Carousel Progress Dots */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {AFK_SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlideIndex
                  ? slide.type === 'scoreboard'
                    ? 'w-6 bg-amber-500 shadow-xs'
                    : 'w-5 bg-[#e15b64] dark:bg-rose-500'
                  : slide.type === 'scoreboard'
                  ? 'w-2 bg-amber-300/60 dark:bg-amber-500/40'
                  : 'w-1.5 bg-gray-300 dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CENTER SHOWCASE: EITHER SCOREBOARD PODIUM OR VOCAB ILLUSTRATION */}
      {isScoreboard ? (
        /* ===== LEADERBOARD PODIUM SHOWCASE ===== */
        <div
          key="scoreboard"
          className="flex flex-col items-center justify-center my-auto z-10 max-w-lg w-full animate-scale-in bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/50 dark:border-white/10"
        >
          {/* Subtitle Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 text-amber-800 dark:text-amber-200 text-xs font-bold shadow-xs">
            <span>⚔️</span>
            <span>Live Exhibition Standings</span>
          </div>

          {/* 3-TIER GOLDEN PODIUM */}
          <div className="w-full flex items-end justify-center gap-2 sm:gap-4 px-2 mb-4">
            {/* 2nd Place (Silver - Left) */}
            <div className="flex-1 flex flex-col items-center max-w-[130px]">
              <div className="text-2xl mb-1">🥈</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-3 border-gray-300 dark:border-zinc-500 shadow-md flex items-center justify-center font-bold text-lg text-gray-700 dark:text-gray-200 relative mb-1.5">
                <span className="truncate px-1 text-xs font-extrabold max-w-full">
                  {champion2.name}
                </span>
                <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-zinc-700 text-[9px] font-bold text-gray-700 dark:text-gray-200 border border-gray-400">
                  #2
                </span>
              </div>
              <div className="text-xs font-black text-[#2d2d2d] dark:text-white truncate max-w-full text-center">
                {champion2.name}
              </div>
              <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                {champion2.points.toLocaleString()} pts
              </div>
              {/* Pedestal block */}
              <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-gray-300 to-gray-200 dark:from-zinc-800 dark:to-zinc-700 rounded-t-xl border-t-2 border-gray-400 flex items-center justify-center font-black text-gray-500 dark:text-zinc-400 text-sm shadow-inner mt-1">
                2nd
              </div>
            </div>

            {/* 1st Place (Gold Crown - Center Champion) */}
            <div className="flex-1 flex flex-col items-center max-w-[150px] -mt-4">
              <div className="text-3xl mb-1 animate-bounce">👑</div>
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-yellow-900 border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center font-black text-amber-800 dark:text-amber-200 relative mb-1.5 animate-pulse">
                <span className="truncate px-1 text-sm font-black max-w-full text-center">
                  {champion1.name}
                </span>
                <span className="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[10px] font-black text-white shadow-xs">
                  🥇 1ST
                </span>
              </div>
              <div className="text-sm font-black text-[#2d2d2d] dark:text-white truncate max-w-full text-center mt-1">
                {champion1.name}
              </div>
              <div className="text-xs font-extrabold text-[#d32f2f] dark:text-rose-400">
                {champion1.points.toLocaleString()} pts
              </div>
              <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full mt-0.5">
                {champion1.accuracy}% Acc
              </div>
              {/* Pedestal block */}
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-400 via-amber-300 to-yellow-200 dark:from-amber-900 dark:via-amber-800 dark:to-amber-700 rounded-t-xl border-t-3 border-amber-200 flex flex-col items-center justify-center font-black text-amber-900 dark:text-amber-200 shadow-md mt-1">
                <span className="text-lg">🏆</span>
                <span className="text-xs uppercase tracking-widest font-black">CHAMPION</span>
              </div>
            </div>

            {/* 3rd Place (Bronze - Right) */}
            <div className="flex-1 flex flex-col items-center max-w-[130px]">
              <div className="text-2xl mb-1">🥉</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-zinc-800 border-3 border-amber-700/60 dark:border-amber-700/50 shadow-md flex items-center justify-center font-bold text-lg text-amber-900 dark:text-amber-200 relative mb-1.5">
                <span className="truncate px-1 text-xs font-extrabold max-w-full">
                  {champion3.name}
                </span>
                <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-950 text-[9px] font-bold text-amber-900 dark:text-amber-200 border border-amber-500">
                  #3
                </span>
              </div>
              <div className="text-xs font-black text-[#2d2d2d] dark:text-white truncate max-w-full text-center">
                {champion3.name}
              </div>
              <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                {champion3.points.toLocaleString()} pts
              </div>
              {/* Pedestal block */}
              <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-amber-700 to-amber-600 dark:from-amber-950 dark:to-amber-900 rounded-t-xl border-t-2 border-amber-500 flex items-center justify-center font-black text-amber-100 text-xs shadow-inner mt-1">
                3rd
              </div>
            </div>
          </div>

          {/* 4th & 5th Place Runner-up Pills */}
          {runnerUps.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
              {runnerUps.map((runner, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white/80 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 text-xs flex items-center gap-2 shadow-xs"
                >
                  <span className="font-bold text-gray-500">#{idx + 4}</span>
                  <span className="font-bold text-[#2d2d2d] dark:text-white max-w-[90px] truncate">
                    {runner.name}
                  </span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400 text-[11px]">
                    {runner.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ===== VOCABULARY CARD SHOWCASE ===== */
        <div
          key={currentSlideIndex}
          className="flex flex-col items-center justify-center my-auto z-10 max-w-sm w-full animate-scale-in bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/50 dark:border-white/10"
        >
          {/* Character Illustration Card */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 bg-white dark:bg-[#18181b] rounded-2xl p-2.5 shadow-md border-2 border-rose-200/90 dark:border-rose-950/60 overflow-hidden flex items-center justify-center transition-transform duration-500 hover:scale-102">
            {currentSlide.image ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={currentSlide.image}
                  alt={currentSlide.japanese || 'Japanese Scenery'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 224px, 256px"
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
          <h2 className="text-3xl sm:text-4xl font-black text-[#4a1c1d] dark:text-white tracking-wide font-sans text-center mt-4 mb-0.5 transition-all duration-300">
            {currentSlide.japanese}
          </h2>

          {/* Romaji in Italic Red */}
          <p className="text-sm sm:text-base font-black italic text-[#dc2626] dark:text-rose-400 mt-0.5">
            {currentSlide.romaji}
          </p>

          {/* English Meaning */}
          <p className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
            {currentSlide.meaning}
          </p>
        </div>
      )}

      {/* Bottom Area: Tap to Play Challenge Button */}
      <div className="flex flex-col items-center pb-2 sm:pb-3 z-10 w-full max-w-sm">
        {/* Dynamic Tap Button */}
        <button
          onClick={dismissAfk}
          className={`w-full py-3.5 px-6 rounded-full font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 animate-bounce active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
            isScoreboard
              ? 'bg-gradient-to-r from-amber-500 to-[#d32f2f] hover:from-amber-600 hover:to-[#b71c1c] text-white shadow-amber-500/30'
              : 'bg-gradient-to-r from-[#e57373] to-[#ef5350] hover:from-[#ef5350] hover:to-[#e53935] text-white shadow-rose-500/30'
          }`}
        >
          {isScoreboard ? (
            <>
              <span>👑</span>
              <span>CAN YOU BEAT #1? TAP TO PLAY!</span>
              <span>🔥</span>
            </>
          ) : (
            <>
              <span>👆</span>
              <span>TAP ANYWHERE TO START</span>
              <span>🌸</span>
            </>
          )}
        </button>

        {/* Footer Text */}
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-white dark:text-rose-300 drop-shadow-md uppercase mt-3">
          {isScoreboard ? 'COMPETE • MASTER • CLIMB THE PODIUM' : 'SPEAK • PLAY • LEARN JAPANESE'}
        </p>
      </div>
    </div>
  );
}
