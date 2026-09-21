'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/app/utils/supabase';
import { bgm } from '@/app/utils/bgm';

export interface ScoreEntry {
  id: string;
  name: string;
  category: string;
  points: number;
  accuracy: number;
  created_at: string;
  badge: string;
}

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

// Golden Laurel Wreath Branches matching reference mockup
const LaurelWreathLeft = ({ className = "w-10 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 40 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 32 85 C 10 70 8 30 25 10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    <ellipse cx="28" cy="80" rx="4" ry="2" transform="rotate(-30 28 80)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="18" cy="70" rx="5" ry="2.5" transform="rotate(-40 18 70)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="12" cy="56" rx="5.5" ry="2.5" transform="rotate(-55 12 56)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="11" cy="42" rx="5.5" ry="2.5" transform="rotate(-70 11 42)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="14" cy="28" rx="5" ry="2.5" transform="rotate(-85 14 28)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="22" cy="16" rx="4.5" ry="2" transform="rotate(-105 22 16)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="27" cy="8" rx="3.5" ry="1.5" transform="rotate(-120 27 8)" fill="#fbbf24" opacity="0.9" />
  </svg>
);

const LaurelWreathRight = ({ className = "w-10 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 40 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 8 85 C 30 70 32 30 15 10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    <ellipse cx="12" cy="80" rx="4" ry="2" transform="rotate(30 12 80)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="22" cy="70" rx="5" ry="2.5" transform="rotate(40 22 70)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="28" cy="56" rx="5.5" ry="2.5" transform="rotate(55 28 56)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="29" cy="42" rx="5.5" ry="2.5" transform="rotate(70 29 42)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="26" cy="28" rx="5" ry="2.5" transform="rotate(85 26 28)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="18" cy="16" rx="4.5" ry="2" transform="rotate(105 18 16)" fill="#fbbf24" opacity="0.9" />
    <ellipse cx="13" cy="8" rx="3.5" ry="1.5" transform="rotate(120 13 8)" fill="#fbbf24" opacity="0.9" />
  </svg>
);

// Striped Ribbon Medal matching reference mockup
const RibbonMedal = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,8 32,32 16,32 10,8" fill="#ef4444" />
    <polygon points="15,8 24,32 20,32 12,8" fill="#18181b" />
    <polygon points="44,8 32,32 48,32 54,8" fill="#ef4444" />
    <polygon points="49,8 40,32 44,32 52,8" fill="#18181b" />
    <circle cx="32" cy="42" r="16" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
    <circle cx="32" cy="42" r="12" fill="#fbbf24" />
    <text x="32" y="47" textAnchor="middle" fontSize="14" fontWeight="900" fill="#78350f" fontFamily="sans-serif">1</text>
  </svg>
);

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);
  const [volume, setVolume] = useState(0.35);

  useEffect(() => {
    // Sync theme
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Sync BGM
    setVolume(bgm.getVolume());
    const userBgm = localStorage.getItem('nihongo-bgm-enabled');
    if (userBgm !== null) {
      setIsBgmPlaying(userBgm !== 'false');
    }

    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setScores(data);
      }
      setLoading(false);
    }
    
    fetchLeaderboard();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaderboard' }, payload => {
        setScores(current => {
          const newScores = [...current, payload.new as ScoreEntry];
          return newScores.sort((a, b) => b.points - a.points).slice(0, 50);
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    bgm.setVolume(val);
  };

  const handleTriggerAfk = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nihongo-trigger-afk'));
    }
  };

  // Fallback demo score matching reference image if Supabase has no scores yet
  const displayScores: ScoreEntry[] = scores.length > 0 ? scores : [
    {
      id: 'demo-1',
      name: 'Guest Samurai',
      category: 'Food',
      points: 12500,
      accuracy: 100,
      created_at: '2026-09-19T00:00:00.000Z',
      badge: 'SAMURAI MASTER',
    }
  ];

  const champion = displayScores[0];

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden bg-[#fff5f6] dark:bg-[#0c080e] text-stone-900 dark:text-white flex flex-col justify-between p-3 sm:p-5 md:p-6 lg:p-7 select-none transition-colors duration-300">

      {/* Full-bleed Scenic Background (clean Fuji Sakura in Day mode, Fuji Night in Night mode) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Day Mode: First Picture (clean Fuji Sakura background) */}
        <Image
          src="/images/fuji-sakura-clean-bg.png"
          alt="Sakura Fuji Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Night Mode: Mount Fuji Night background */}
        <Image
          src="/images/fuji-night-bg.jpg"
          alt="Mount Fuji Night Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Day Soft Pink Vignette */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-pink-100/20 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
        {/* Night Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
      </div>

      <SakuraBackground />

      {/* Flanking Cultural Calligraphy & Micro-Typography (matching reference mockup) */}
      <div className="hidden xl:flex fixed left-6 2xl:left-12 top-1/2 -translate-y-1/2 flex-col items-start gap-2 pointer-events-none select-none z-10 opacity-70">
        <div className="font-serif text-3xl sm:text-4xl text-stone-400 dark:text-stone-500 tracking-wider">
          学 ぶ
        </div>
        <div className="flex flex-col text-[9px] font-extrabold tracking-[0.25em] text-stone-400 dark:text-stone-500 uppercase leading-relaxed text-left mt-1">
          <span>A BRIGHTER</span>
          <span>TOMORROW</span>
          <span>TOGETHER</span>
        </div>
        <div className="w-6 h-[1.5px] bg-rose-200 dark:bg-stone-700 mt-1" />
      </div>

      <div className="hidden xl:flex fixed right-6 2xl:right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-2 pointer-events-none select-none z-10 opacity-70 text-right">
        <div className="flex flex-col text-[9px] font-extrabold tracking-[0.25em] text-stone-400 dark:text-stone-500 uppercase leading-loose text-right">
          <span>JAPANESE</span>
          <span>CONNECTS</span>
          <span>PEOPLE</span>
        </div>
        <div className="w-5 h-[1.5px] bg-rose-200 dark:bg-stone-700 my-1" />
      </div>

      {/* TOP HEADER: Home Button, Exhibition Scoreboard Title, Day/Night Toggle */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between flex-shrink-0 pt-1 pb-1 px-1">
        {/* Left: Home Button in rich red pill */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-[#c5221f] hover:bg-[#a51d1a] text-white text-xs sm:text-sm font-black shadow-md shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>←</span>
          <span>Home</span>
        </Link>

        {/* Center: Title & Subtitle */}
        <div className="text-center flex-1 px-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl animate-bounce">🏆</span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 dark:from-rose-400 dark:to-pink-400 tracking-tight leading-none">
              EXHIBITION SCOREBOARD
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-stone-600 dark:text-stone-300 mt-1">
            UHB10802 Japanese Communication 1 ― Hall of Fame
          </p>
          <div className="flex flex-col items-center mt-1 text-[9px] sm:text-[10px] text-stone-400 dark:text-stone-400 font-bold tracking-wider uppercase">
            <span className="text-xs text-rose-400 mb-0.5">🌸</span>
            <span className="font-serif normal-case tracking-widest text-stone-500 dark:text-stone-400">学び続け、もっと遠くへ</span>
            <span className="tracking-[0.2em] text-[8px] sm:text-[9px] mt-0.5">LEARN • GROW • BELONG</span>
          </div>
        </div>

        {/* Right: Day / Night Theme Pill Switcher */}
        <button
          onClick={toggleTheme}
          className="glass-pill px-4 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-white/90 dark:border-white/10 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow transition-all"
          title={isDarkMode ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
        >
          <span>{isDarkMode ? '⛩️' : '🌸'}</span>
          <span className="tracking-wider">{isDarkMode ? 'NIGHT' : 'DAY'}</span>
          <span className="text-amber-500 text-xs">{isDarkMode ? '🌙' : '☀️'}</span>
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 w-full max-w-4xl mx-auto my-auto flex-1 flex flex-col justify-center py-1">
        
        {/* TOP CHAMPION SHOWCASE CARD (#1 Podium) matching reference mockup */}
        <div className="w-full max-w-md mx-auto bg-white/85 dark:bg-[#141416]/85 backdrop-blur-xl rounded-[28px] border-2 border-rose-200/90 dark:border-white/10 shadow-[0_12px_40px_rgba(244,114,182,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 sm:p-5 text-center relative overflow-hidden transition-all my-1.5 sm:my-2.5">
          {/* Medal with ribbon */}
          <div className="flex justify-center mb-1">
            <RibbonMedal className="w-11 h-11" />
          </div>

          {/* Rank Badge */}
          <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-red-600 dark:text-rose-400 uppercase mb-0.5 flex items-center justify-center gap-1">
            <span>👑</span>
            <span>{champion.badge || 'SAMURAI MASTER'}</span>
          </div>

          {/* Flanked Winner Section with Laurel Wreaths */}
          <div className="relative flex items-center justify-center px-4">
            <LaurelWreathLeft className="w-8 sm:w-10 h-16 sm:h-20 absolute left-2 sm:left-4 -top-1 pointer-events-none" />

            <div className="text-center z-10 px-6">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight truncate max-w-[240px]">
                {champion.name}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
                {champion.category}
              </p>

              {/* Glowing Golden Score Digits */}
              <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono tracking-wider my-1 drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]">
                {String(champion.points).padStart(6, '0')}
              </div>

              {/* Accuracy */}
              <div className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {champion.accuracy}% Accuracy
              </div>
            </div>

            <LaurelWreathRight className="w-8 sm:w-10 h-16 sm:h-20 absolute right-2 sm:right-4 -top-1 pointer-events-none" />
          </div>
        </div>

        {/* ALL TIME LEADERBOARD PANEL */}
        <div className="w-full bg-white/85 dark:bg-[#141416]/85 backdrop-blur-xl rounded-[28px] border border-white/90 dark:border-white/10 shadow-[0_12px_40px_rgba(244,114,182,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 sm:p-5 mb-2 sm:mb-3 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm sm:text-base font-black text-stone-800 dark:text-white">
              <span>📊</span>
              <span>ALL TIME LEADERBOARD</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
              {displayScores.length} Players
            </span>
          </div>

          {/* List of Scores */}
          <div className="mt-3 space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
            {displayScores.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-stone-200/60 dark:border-white/5 bg-white/75 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800/80 hover:border-rose-300 dark:hover:border-rose-700 transition-all shadow-2xs"
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                    index === 0
                      ? 'bg-amber-400 text-stone-900'
                      : index === 1
                      ? 'bg-slate-300 text-slate-900'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="font-black text-sm sm:text-base text-stone-900 dark:text-white truncate">
                      {entry.name}
                    </div>
                    <div className="text-[11px] sm:text-xs text-stone-400 dark:text-stone-400 font-medium">
                      Topic: <span className="font-bold text-stone-600 dark:text-stone-300">{entry.category}</span> • {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Right: Score & Correct % */}
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                    {String(entry.points).padStart(6, '0')} PTS
                  </div>
                  <div className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {entry.accuracy}% Correct
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS: Choose Solo Topic & Join Multiplayer matching reference image */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-1">
          {/* Choose Solo Topic */}
          <Link
            href="/topics"
            className="flex-1 max-w-[220px] py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🎯</span>
            <span>Choose Solo Topic</span>
            <span className="text-xs">›</span>
          </Link>

          {/* Join Multiplayer */}
          <Link
            href="/play"
            className="flex-1 max-w-[220px] py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>👥</span>
            <span>Join Multiplayer</span>
            <span className="text-xs">›</span>
          </Link>
        </div>

      </main>

      {/* BOTTOM FOOTER CONTROLS: Zen BGM, Volume Settings & AFK (matching reference mockup) */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-end flex-shrink-0 pt-1 pb-1 px-1">
        <div className="flex items-center gap-2 group relative">
          {/* Volume Slider Popover */}
          {showVolumeMenu && (
            <div className="absolute right-0 bottom-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-rose-100 dark:border-white/10 flex items-center gap-2.5 animate-scale-in z-50">
              <span className="text-xs font-bold text-stone-500">🔈</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-24 accent-red-600 h-1.5 rounded-lg cursor-pointer bg-stone-200 dark:bg-stone-700"
              />
              <span className="text-xs font-bold text-stone-500">🔊</span>
            </div>
          )}

          {/* Integrated Capsule Widget */}
          <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-full px-4 py-1.5 border border-rose-100 dark:border-white/10 shadow-sm flex items-center gap-3 text-xs font-bold text-stone-700 dark:text-stone-200">
            {/* Zen BGM Toggle */}
            <button
              onClick={handleToggleBgm}
              className="flex items-center gap-1.5 hover:text-red-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title={isBgmPlaying ? "Pause Ambient BGM" : "Play Ambient BGM"}
            >
              <span className={isBgmPlaying ? 'animate-spin' : ''} style={{ animationDuration: '6s' }}>
                🎵
              </span>
              <span>Zen BGM</span>
            </button>

            {/* Volume Popover Trigger */}
            <button
              onClick={() => setShowVolumeMenu(!showVolumeMenu)}
              className="hover:text-red-600 dark:hover:text-rose-400 transition-colors cursor-pointer text-xs"
              title="Adjust Volume"
            >
              ⚙️
            </button>

            <span className="w-[1px] h-3 bg-stone-300 dark:bg-stone-700" />

            {/* AFK Screensaver Button */}
            <button
              onClick={handleTriggerAfk}
              className="flex items-center gap-1 hover:text-red-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Launch AFK Japanese Screensaver"
            >
              <span>🌸</span>
              <span>AFK</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
