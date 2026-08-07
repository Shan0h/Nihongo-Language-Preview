'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';
import WelcomeModal from '@/app/components/WelcomeModal';

// Lazy load Sakura animation for better performance
const SakuraBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="sakura-container">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${8 + (i % 10) * 9}%`,
            animationDuration: `${11 + (i % 6)}s`,
            animationDelay: `-${i * 1.2}s`,
            width: `${9 + (i % 4) * 2.5}px`,
            height: `${9 + (i % 4) * 2.5}px`,
          }}
        />
      ))}
    </div>
  );
};

export default function NihongoTalkScreen() {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);

  const handleStart = () => {
    setIsWelcomeModalOpen(false);
  };

  const handleClose = () => {
    setIsWelcomeModalOpen(false);
  };

  return (
    <>
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleClose}
        onStart={handleStart}
      />
      <div className="relative h-screen min-h-screen max-h-screen overflow-hidden bg-[#fdfbf7] flex flex-col justify-between p-3 sm:p-5 lg:p-6 select-none">
        {/* Sakura Petals Background */}
        <SakuraBackground />

        <div className="relative z-10 max-w-7xl mx-auto w-full h-full flex flex-col justify-between">

          {/* TOP HEADER */}
          <header className="flex items-center justify-between border-b pb-2 border-[#f4c2c2]/60 dark:border-[#dc2626]/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Link href="/admin/login" className="cursor-pointer hover:scale-105 transition-transform">
                <span className="text-3xl lg:text-4xl">⛩️</span>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-none">
                  <span className="gradient-text-torii">NIHONGO TALK SCREEN</span>
                </h1>
                <p className="text-xs sm:text-sm text-day-muted font-extrabold mt-0.5">
                  Speak, Play & Learn Basic Japanese! 🌸 <span className="text-xs opacity-80 hidden sm:inline">• UHB10802 Exhibition</span>
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 bg-white dark:bg-[#1a1728] border-2 border-[#f4c2c2] dark:border-red-900/60 rounded-full text-xs lg:text-sm font-black text-[#d32f2f] dark:text-amber-400 shadow-xs">🎤 Voice Mic</span>
              <span className="px-3 py-1 bg-white dark:bg-[#1a1728] border-2 border-[#f4c2c2] dark:border-red-900/60 rounded-full text-xs lg:text-sm font-black text-[#d32f2f] dark:text-amber-400 shadow-xs">🔊 Audio TTS</span>
              <span className="px-3 py-1 bg-white dark:bg-[#1a1728] border-2 border-[#f4c2c2] dark:border-red-900/60 rounded-full text-xs lg:text-sm font-black text-[#d32f2f] dark:text-amber-400 shadow-xs">🎮 Live Game</span>
            </div>
          </header>

          {/* MAIN CONTENT SPLIT (Left: Modes | Right: Topics) */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 items-center my-auto py-2 overflow-hidden">

            {/* LEFT COLUMN: GAME MODES (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-evenly h-full max-h-[520px]">
              <div>
                <span className="px-3 py-1 bg-[#d32f2f]/10 dark:bg-[#d32f2f]/30 text-[#d32f2f] dark:text-red-400 text-xs font-black rounded-full uppercase tracking-wider inline-block mb-1">
                  🚀 CHOOSE GAME MODE
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2d2d2d] dark:text-white leading-tight">
                  Start Learning Japanese
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-[#5a5a5a] dark:text-slate-300 font-semibold mt-1">
                  Practice voice pronunciation solo or compete live with friends!
                </p>
              </div>

              {/* SOLO KIOSK BUTTON */}
              <Link
                href="/topics"
                className="group card-cultural p-4 sm:p-4.5 bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-white flex items-center gap-4 hover:scale-[1.02] active:scale-[0.99] transition-all shadow-xl border-2 border-red-400/40"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                  🎯
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg sm:text-xl font-black tracking-wide text-white">SOLO KIOSK</div>
                  <div className="text-xs font-bold text-white/90 mt-0.5">
                    🎤 Voice Speech + Topic Practice
                  </div>
                </div>
                <span className="text-xl text-white group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* MULTIPLAYER BUTTON */}
              <Link
                href="/play"
                className="group card-cultural p-4 sm:p-4.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white flex items-center gap-4 hover:scale-[1.02] active:scale-[0.99] transition-all shadow-xl border-2 border-amber-300/40"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                  📱
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg sm:text-xl font-black tracking-wide text-white">MULTIPLAYER</div>
                  <div className="text-xs font-bold text-white/90 mt-0.5">
                    🎮 Join Game Room with PIN
                  </div>
                </div>
                <span className="text-xl text-white group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* HALL OF FAME FLASHCARD SHOWCASE WIDGET */}
              <div
                className="card-cultural p-3.5 sm:p-4 lg:p-4 text-white relative overflow-hidden group border-2 border-[#dc2626] dark:border-amber-500/60 shadow-xl"
                style={{ backgroundColor: '#991b1b' }}
              >
                <div className="flex items-center justify-between border-b border-red-400/40 dark:border-amber-500/40 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl animate-bounce">🏆</span>
                    <span className="text-xs sm:text-sm lg:text-base font-black tracking-wider text-amber-200 dark:text-amber-400 uppercase">EXHIBITION HALL OF FAME</span>
                  </div>
                  <Link href="/scoreboard" className="text-xs font-black text-white hover:text-amber-200 transition-colors flex items-center gap-1 bg-black/30 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/30 shadow-2xs">
                    <span>Full Board</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                {/* Top 3 High Score Flashcard Items */}
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { rank: "🥇", name: "Tanaka-san 🌸", pts: "005000", topic: "Greetings" },
                    { rank: "🥈", name: "Kenji 🍣", pts: "004250", topic: "Food" },
                    { rank: "🥉", name: "Sakura 🎨", pts: "003750", topic: "Colors" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-xl border border-white/30 shadow-xs"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base sm:text-lg lg:text-xl">{item.rank}</span>
                        <span className="font-black text-white text-xs sm:text-sm lg:text-base truncate max-w-[120px] sm:max-w-[150px]">{item.name}</span>
                        <span className="text-[11px] sm:text-xs text-amber-200 font-extrabold hidden sm:inline">• {item.topic}</span>
                      </div>
                      <span className="font-black text-amber-300 font-mono text-xs sm:text-sm lg:text-base drop-shadow-xs">{item.pts} PTS</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AVAILABLE EXHIBITION TOPICS SHOWCASE (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full">
              {/* How to Play Steps Banner */}
              <div className="card-cultural p-2.5 sm:p-3 bg-white dark:bg-[#1a1728] border-2 border-[#f4c2c2] dark:border-red-900/60 flex items-center justify-between text-xs lg:text-sm text-day-dark font-black shadow-xs mb-3 flex-shrink-0">
                <span className="flex items-center gap-1 font-black text-[#d32f2f] dark:text-red-400"><span>⛩️</span> Steps:</span>
                <span>1. Pick Topic</span>
                <span>•</span>
                <span>2. Listen 🔊</span>
                <span>•</span>
                <span>3. Speak 🎤</span>
              </div>

              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#d32f2f] text-base">🌸</span>
                  <h3 className="text-xs sm:text-sm lg:text-base font-black text-[#2d2d2d] dark:text-white tracking-[3px] uppercase">
                    EXHIBITION TOPICS SHOWCASE
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#d32f2f] bg-[#f4c2c2]/30 px-3 py-1 rounded-full border border-[#f4c2c2]/60">
                  5 Interactive Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 flex-1 items-stretch">
                {[
                  { slug: "Greetings", name: "Greetings", japanese: "あいさつ", emoji: "🎌", count: 5, border: "border-red-300 dark:border-red-800/80", tag: "text-red-900 bg-red-100 dark:text-red-300 dark:bg-red-900/60 border border-red-300 dark:border-red-700 font-black", kanji: "挨拶" },
                  { slug: "Numbers", name: "Numbers", japanese: "すうじ", emoji: "🔢", count: 4, border: "border-amber-300 dark:border-amber-800/80", tag: "text-amber-900 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 font-black", kanji: "数字" },
                  { slug: "Food", name: "Food", japanese: "たべもの", emoji: "🍣", count: 4, border: "border-emerald-300 dark:border-emerald-800/80", tag: "text-emerald-900 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 font-black", kanji: "食物" },
                  { slug: "Colors", name: "Colors", japanese: "いろ", emoji: "🎨", count: 4, border: "border-pink-300 dark:border-pink-800/80", tag: "text-pink-900 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/60 border border-pink-300 dark:border-pink-700 font-black", kanji: "色彩" },
                  { slug: "Daily Phrases", name: "Daily Phrases", japanese: "フレーズ", emoji: "💬", count: 4, border: "border-indigo-300 dark:border-indigo-800/80", tag: "text-indigo-900 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-700 font-black", kanji: "日常", span: "sm:col-span-2" },
                ].map((item) => (
                  <div
                    key={item.slug}
                    className={`card-cultural p-2.5 sm:p-3 bg-white dark:bg-[#1a1728] border-2 ${item.border} flex items-center justify-between gap-3 shadow-md relative overflow-hidden cursor-default ${item.span || ''}`}
                  >
                    {/* Background Kanji Watermark */}
                    <span className="absolute -right-2 -bottom-3 text-4xl sm:text-5xl font-black text-slate-300/30 dark:text-white/10 pointer-events-none select-none">
                      {item.kanji}
                    </span>

                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 relative z-10">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-50 dark:bg-white/10 shadow-xs border border-slate-200 dark:border-white/20 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                        {item.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-base sm:text-lg lg:text-xl text-day-dark truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/80 text-[#b91c1c] dark:text-red-300 border border-red-300/80 dark:border-red-700 font-black text-xs sm:text-sm shadow-2xs">
                            🈁 {item.japanese}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">🎤 🔊 🖼️</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 relative z-10">
                      <span className={`inline-block px-3 py-1 font-black text-xs sm:text-sm rounded-full shadow-2xs ${item.tag}`}>
                        {item.count} Qs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>

          {/* FOOTER */}
          <footer className="text-center text-xs lg:text-sm text-[#8a8a8a] font-semibold pt-1 border-t border-[#f4c2c2]/40 flex-shrink-0">
            🌸 Nihongo Talk Screen — Japanese Communication 1 Exhibition 🌸
          </footer>
        </div>
      </div>
    </>
  );
}