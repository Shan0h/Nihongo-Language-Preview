'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WelcomeModal from '@/app/components/WelcomeModal';
import { supabase } from '@/app/utils/supabase';
import Logo from '@/app/components/Logo';
import { bgm } from '@/app/utils/bgm';

// Gentle falling sakura petals with natural variance
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

// Subtle Mount Fuji & 5-Story Pagoda Watermark matching reference image
const FujiPagodaWatermark = () => (
  <svg
    viewBox="0 0 320 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute right-0 bottom-0 w-44 sm:w-56 h-auto pointer-events-none opacity-[0.24] dark:opacity-[0.16] select-none text-rose-900 dark:text-rose-200 transition-opacity duration-300"
  >
    {/* Distant Mount Fuji soft silhouette */}
    <path
      d="M30 180 L115 88 Q140 80 165 88 L250 180 Z"
      fill="currentColor"
      opacity="0.45"
    />
    {/* Snow cap */}
    <path
      d="M115 88 Q140 80 165 88 L158 106 L150 100 L140 108 L130 100 L122 106 Z"
      fill="#ffffff"
      opacity="0.85"
    />
    {/* Five-Story Pagoda (Chureito Pagoda style) */}
    <g fill="currentColor">
      {/* Spire / Sorin */}
      <line x1="250" y1="26" x2="250" y2="68" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="250" cy="30" r="2.5" />
      <circle cx="250" cy="37" r="2.5" />
      <circle cx="250" cy="44" r="2.5" />
      <circle cx="250" cy="51" r="2.5" />
      <circle cx="250" cy="58" r="2.5" />

      {/* Tier 5 (Top) */}
      <path d="M234 72 Q250 67 266 72 L262 76 L238 76 Z" />
      <rect x="244" y="76" width="12" height="7" />

      {/* Tier 4 */}
      <path d="M231 85 Q250 79 269 85 L265 90 L235 90 Z" />
      <rect x="243" y="90" width="14" height="7" />

      {/* Tier 3 */}
      <path d="M228 99 Q250 92 272 99 L267 105 L233 105 Z" />
      <rect x="242" y="105" width="16" height="8" />

      {/* Tier 2 */}
      <path d="M224 115 Q250 107 276 115 L271 122 L229 122 Z" />
      <rect x="240" y="122" width="20" height="9" />

      {/* Tier 1 (Base) */}
      <path d="M220 133 Q250 124 280 133 L274 141 L226 141 Z" />
      <rect x="238" y="141" width="24" height="13" />
      <rect x="234" y="154" width="32" height="26" rx="2" />
    </g>
    {/* Cherry Blossom Silhouette Branch */}
    <path
      d="M270 125 Q290 105 315 110 M285 110 Q300 95 315 98"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.65"
    />
    <circle cx="310" cy="108" r="3.5" fill="#f43f5e" opacity="0.6" />
    <circle cx="296" cy="102" r="2.5" fill="#f43f5e" opacity="0.6" />
    <circle cx="312" cy="96" r="2.5" fill="#f43f5e" opacity="0.6" />
  </svg>
);

export default function NihongoTalkScreen() {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);
  const [topPlayers, setTopPlayers] = useState<{ rank: string; name: string; pts: string }[]>([
    { rank: "1", name: "Guest", pts: "..." },
    { rank: "2", name: "-", pts: "-" },
    { rank: "3", name: "-", pts: "-" }
  ]);

  useEffect(() => {
    // Check dark mode state
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }

    // Check BGM preference
    const userBgm = localStorage.getItem('nihongo-bgm-enabled');
    if (userBgm !== null) {
      setIsBgmPlaying(userBgm !== 'false');
    }

    // Fetch top players from Supabase
    async function fetchTopPlayers() {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('name, points')
          .order('points', { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          const formatted = data.map((p, idx) => ({
            rank: (idx + 1).toString(),
            name: p.name.split(' ')[0] || 'Player',
            pts: p.points > 999 ? (p.points / 1000).toFixed(1) + 'k' : p.points.toString()
          }));
          
          while (formatted.length < 3) {
            formatted.push({ rank: (formatted.length + 1).toString(), name: "-", pts: "-" });
          }
          setTopPlayers(formatted);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    }

    // Check Welcome Modal Preference
    if (typeof window !== 'undefined') {
      const hideWelcome = localStorage.getItem('nihongo-hide-welcome');
      if (!hideWelcome) {
        setIsWelcomeModalOpen(true);
      }
    }

    fetchTopPlayers();
  }, []);

  const handleStart = () => setIsWelcomeModalOpen(false);
  const handleClose = () => setIsWelcomeModalOpen(false);

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

  // 10 Topic Modules matching the reference image layout and palette
  const topicModules = [
    { name: 'Greetings', slug: 'Greetings', emoji: '👋', bg: 'bg-amber-50/90 dark:bg-amber-950/40', isText: false },
    { name: 'Numbers', slug: 'Numbers', emoji: '123', bg: 'bg-blue-50/90 dark:bg-blue-950/40', isText: true },
    { name: 'Food', slug: 'Food', emoji: '🍣', bg: 'bg-rose-50/90 dark:bg-rose-950/40', isText: false },
    { name: 'Colors', slug: 'Colors', emoji: '🎨', bg: 'bg-amber-50/90 dark:bg-amber-950/40', isText: false },
    { name: 'Daily Phrases', slug: 'Daily Phrases', emoji: '💬', bg: 'bg-slate-50/90 dark:bg-slate-900/40', isText: false },
    { name: 'Verbs', slug: 'Verbs', emoji: '🏃', bg: 'bg-cyan-50/90 dark:bg-cyan-950/40', isText: false },
    { name: 'Adjectives', slug: 'Adjectives', emoji: '✨', bg: 'bg-yellow-50/90 dark:bg-yellow-950/40', isText: false },
    { name: 'Body Parts', slug: 'Body Parts', emoji: '👤', bg: 'bg-stone-100/90 dark:bg-stone-800/40', isText: false },
    { name: 'Animals', slug: 'Animals', emoji: '🐶', bg: 'bg-orange-50/90 dark:bg-orange-950/40', isText: false },
    { name: 'Family', slug: 'Family', emoji: '👨‍👩‍👧', bg: 'bg-rose-50/90 dark:bg-rose-950/40', isText: false },
  ];

  return (
    <>
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleClose}
        onStart={handleStart}
      />

      {/* "How to Play" Modal */}
      {showHowToPlay && (
        <div 
          onClick={() => setShowHowToPlay(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#18181b] border-2 border-rose-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-scale-in text-center relative"
          >
            <button 
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-rose-50 text-stone-500 hover:text-red-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg sm:text-xl font-black text-stone-800 dark:text-white flex items-center justify-center gap-2 mb-6">
              <span>🎯</span>
              <span>How to Play</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">1</div>
                <div className="text-3xl mb-1.5">📱</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">Scan QR or enter PIN</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#e11d48] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">2</div>
                <div className="text-3xl mb-1.5">✍️</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">Enter your name</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">3</div>
                <div className="text-3xl mb-1.5">⚡</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">Answer fast for bonus</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">4</div>
                <div className="text-3xl mb-1.5">🏆</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">Top the leaderboard!</p>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-black shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              Got it! Let&apos;s Play 🌸
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Container - Strictly single-viewport height on desktop */}
      <div className="relative min-h-screen lg:h-screen lg:max-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#fff0f3] dark:bg-[#0c080e] flex flex-col justify-between p-4 sm:p-5 lg:px-10 lg:py-4 select-none transition-colors duration-500">
        
        {/* Full-bleed Scenic Fuji Sakura Background with luminous glass scrim */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/images/fuji-sakura-bg.png"
            alt="Mount Fuji Sakura Background"
            fill
            priority
            className="object-cover object-center scale-100 dark:opacity-30 transition-all duration-700 select-none pointer-events-none"
          />
          {/* Subtle soft scrim to match reference brightness and contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-[#fff0f3]/25 to-[#ffe8ee]/45 dark:from-black/60 dark:via-black/70 dark:to-black/80 pointer-events-none" />
        </div>

        <SakuraBackground />

        {/* TOP HEADER NAVBAR */}
        <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between flex-shrink-0 animate-fade-in-up">
          <div className="flex items-center">
            <Logo variant="full" size="md" />
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* How to Play */}
            <button
              onClick={() => setShowHowToPlay(true)}
              className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎯</span>
              <span className="hidden sm:inline">How to Play</span>
            </button>

            {/* Quick Host */}
            <Link
              href="/host"
              title="Quick Casual Multiplayer"
              className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-[#e11d48] dark:text-rose-400 flex items-center gap-1.5"
            >
              <span>👑</span>
              <span>Quick Host</span>
            </Link>

            {/* Admin */}
            <Link
              href="/admin/login"
              title="Admin Studio"
              className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Day / Night Theme Selector matching reference */}
            <button
              onClick={toggleTheme}
              className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-rose-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer"
              title={isDarkMode ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
            >
              <span>{isDarkMode ? '⛩️' : '🌸'}</span>
              <span className="tracking-wider">{isDarkMode ? '夜 NIGHT' : '昼 DAY'}</span>
              <span className="text-amber-500 text-xs">{isDarkMode ? '🌙' : '☀️'}</span>
              <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN 2-COLUMN VIEWPORT */}
        <main className="relative z-10 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center flex-1 min-h-0 py-2 sm:py-3">
          
          {/* LEFT COLUMN: HERO, MODES, RIBBONS */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-3 sm:gap-3.5 w-full">
            
            {/* Small Eyebrow */}
            <div className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] text-[#e11d48] dark:text-rose-400 uppercase animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              SMALL STEPS. A BRIGHTER YOU.
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl font-black text-[#1e1b2e] dark:text-white leading-[1.08] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Learn Japanese <br />
              <span className="text-[#e11d48] dark:text-rose-400">Beautifully.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-500 dark:text-stone-300 text-xs sm:text-sm font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Practice pronunciation solo, or compete in real-time with friends.
            </p>

            {/* Japanese Cultural Divider & Tagline */}
            <div className="flex flex-col gap-0.5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-[2px] bg-[#e11d48]/70 dark:bg-rose-500 rounded-full inline-block" />
                <span className="text-xs font-medium text-rose-800/90 dark:text-rose-300 tracking-wider font-japanese">
                  ことばで、もっとつながる
                </span>
              </div>
              <div className="text-[9px] font-bold text-stone-400 dark:text-stone-500 tracking-[0.22em] uppercase pl-9">
                A BRIGHTER WORLD THROUGH LANGUAGE
              </div>
            </div>

            {/* Interactive Mode Cards with Glassmorphism */}
            <div className="flex flex-col gap-2.5 mt-1 sm:mt-1.5">
              {/* Solo Practice */}
              <Link
                href="/topics"
                className="glass-card-interactive rounded-[1.75rem] p-3.5 sm:p-4 flex items-center justify-between group cursor-pointer animate-scale-in"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-100/70 dark:border-rose-900/40 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    🎯
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-stone-800 dark:text-white group-hover:text-[#e11d48] transition-colors leading-tight">
                      Solo Practice
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                      Learn at your own pace
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-white/10 group-hover:bg-[#e11d48] text-[#e11d48] group-hover:text-white flex items-center justify-center transition-all duration-300 flex-shrink-0 font-bold text-sm shadow-2xs group-hover:translate-x-0.5">
                  →
                </div>
              </Link>

              {/* Multiplayer */}
              <Link
                href="/play"
                className="glass-card-interactive rounded-[1.75rem] p-3.5 sm:p-4 flex items-center justify-between group cursor-pointer animate-scale-in"
                style={{ animationDelay: '0.45s' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100/90 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/40 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    🎮
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-stone-800 dark:text-white group-hover:text-[#e11d48] transition-colors leading-tight">
                      Multiplayer
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                      Join a live game room
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-white/10 group-hover:bg-[#e11d48] text-[#e11d48] group-hover:text-white flex items-center justify-center transition-all duration-300 flex-shrink-0 font-bold text-sm shadow-2xs group-hover:translate-x-0.5">
                  →
                </div>
              </Link>
            </div>

            {/* How to Play Ribbon */}
            <button
              onClick={() => setShowHowToPlay(true)}
              className="glass-pill rounded-full py-2 px-3.5 sm:px-4 flex items-center justify-between cursor-pointer group text-left animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 dark:text-stone-200">
                <span>🎯</span>
                <span className="text-[11px]">How to Play:</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] font-bold text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8.5px] font-black shadow-2xs">1</span>
                  PIN
                </span>
                <span className="text-stone-300 dark:text-stone-600 font-bold">&gt;</span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white inline-flex items-center justify-center text-[8.5px] font-black shadow-2xs">2</span>
                  👤 Name
                </span>
                <span className="text-stone-300 dark:text-stone-600 font-bold">&gt;</span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white inline-flex items-center justify-center text-[8.5px] font-black shadow-2xs">3</span>
                  ⚡ Bonus
                </span>
                <span className="text-stone-300 dark:text-stone-600 font-bold">&gt;</span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8.5px] font-black shadow-2xs">4</span>
                  🏆 Win
                </span>
              </div>
            </button>

            {/* Top Players Ribbon */}
            <div className="animate-fade-in" style={{ animationDelay: '0.55s' }}>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-stone-400 dark:text-stone-400 uppercase flex items-center gap-1.5">
                  <span>👑</span>
                  <span>TOP PLAYERS</span>
                </span>
                <Link href="/scoreboard" className="text-[11px] font-bold text-[#e11d48] dark:text-rose-400 hover:underline flex items-center gap-0.5">
                  View All →
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {topPlayers.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-pill rounded-full px-3 py-1 flex items-center gap-1.5 text-xs"
                  >
                    <span className="text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className={`font-bold text-[11px] ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-stone-400' : 'text-orange-500'}`}>
                      #{item.rank}
                    </span>
                    <span className="font-bold text-stone-800 dark:text-white truncate max-w-[70px]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AVAILABLE TOPICS MASTER GLASS PANEL */}
          <div 
            className="lg:col-span-7 flex flex-col justify-between glass-panel-master rounded-[2.25rem] sm:rounded-[2.5rem] p-5 sm:p-6 h-full max-h-[535px] relative overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {/* Topics Panel Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900/40 dark:to-pink-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center text-lg shadow-2xs flex-shrink-0">
                  📕
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-stone-800 dark:text-white">
                    AVAILABLE TOPICS
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 dark:text-stone-400 mt-0.5 font-medium">
                    Select your topic in Solo Practice to play
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="glass-pill text-[11px] font-bold text-stone-700 dark:text-stone-200 px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                >
                  <span>🎯</span>
                  <span>How to Play</span>
                </button>
                <span className="text-[11px] font-bold text-[#e11d48] dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                  <span>⊞</span>
                  <span>10 Modules</span>
                </span>
              </div>
            </div>

            {/* 3-Column Topics Grid with 10 Modules + Mt. Fuji Watermark Poem Block */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 flex-1 items-stretch">
              {topicModules.map((item) => (
                <Link
                  key={item.slug}
                  href={`/topics?category=${encodeURIComponent(item.slug)}`}
                  className="topic-glass-card rounded-2xl p-2.5 sm:p-3 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.bg} flex items-center justify-center text-base sm:text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                      {item.isText ? (
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">123</span>
                      ) : (
                        item.emoji
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-800 dark:text-white truncate group-hover:text-[#e11d48] transition-colors leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-[#e11d48] dark:text-rose-400 truncate mt-0.5">
                        10 Questions
                      </div>
                    </div>
                  </div>
                  <span className="text-rose-300 dark:text-rose-500 group-hover:text-[#e11d48] group-hover:translate-x-0.5 transition-all text-xs font-bold ml-1">
                    &gt;
                  </span>
                </Link>
              ))}

              {/* Japanese Calligraphic Poem with Mount Fuji & Pagoda Artwork Watermark (spanning 2 columns) */}
              <div className="col-span-2 flex flex-col justify-center items-center text-center p-2.5 rounded-2xl select-none relative overflow-hidden">
                <FujiPagodaWatermark />
                <div 
                  className="relative z-10 text-rose-900/85 dark:text-rose-200 text-xs sm:text-[13px] font-medium leading-relaxed tracking-widest"
                  style={{ fontFamily: 'var(--font-noto-sans-jp), serif' }}
                >
                  学びは、<br />
                  きっとどこかで花ひらく。
                </div>
                <div className="relative z-10 text-[8.5px] sm:text-[9.5px] font-bold text-stone-400 dark:text-stone-500 tracking-[0.22em] uppercase mt-1">
                  EVERY WORD OPENS A BRIGHTER TOMORROW.
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-rose-100/70 dark:border-white/10 mt-2.5 text-xs flex-shrink-0">
              <div className="text-stone-400 dark:text-stone-400 font-medium flex items-center gap-1.5 text-xs">
                <span>💡</span>
                <span>Ready to learn?</span>
              </div>
              <Link
                href="/topics"
                className="font-bold text-xs text-[#e11d48] dark:text-rose-400 hover:text-red-700 flex items-center gap-1 hover:translate-x-0.5 transition-transform"
              >
                <span>Choose in Solo Practice</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </main>

        {/* BOTTOM FOOTER BAR */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pt-2 flex-shrink-0">
          {/* Left Tagline */}
          <div className="text-stone-400 dark:text-stone-500 text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-2">
            <span>日本語で、もっと素敵な毎日を</span>
            <span>｜</span>
            <span>NIHONGO EDUCATION 🌸</span>
          </div>

          {/* Right Floating Controls matching reference */}
          <div className="flex items-center gap-2.5">
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
              {/* Pill Switch */}
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
    </>
  );
}