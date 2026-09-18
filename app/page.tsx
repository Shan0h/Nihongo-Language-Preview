'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';
import WelcomeModal from '@/app/components/WelcomeModal';
import { supabase } from '@/app/utils/supabase';
import Logo from '@/app/components/Logo';

// Lazy load Sakura animation for better performance
const SakuraBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="sakura-container pointer-events-none">
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
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [topPlayers, setTopPlayers] = useState<{ rank: string; name: string; pts: string }[]>([
    { rank: "1", name: "...", pts: "..." },
    { rank: "2", name: "...", pts: "..." },
    { rank: "3", name: "...", pts: "..." }
  ]);

  useEffect(() => {
    async function fetchTopPlayers() {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('name, points')
        .order('points', { ascending: false })
        .limit(3);

      if (!error && data && data.length > 0) {
        const formatted = data.map((p, idx) => ({
          rank: (idx + 1).toString(),
          name: p.name.split(' ')[0], // Keep it short for the compact widget
          pts: p.points > 999 ? (p.points / 1000).toFixed(1) + 'k' : p.points.toString()
        }));
        
        // Pad with empty spots if less than 3 players
        while (formatted.length < 3) {
          formatted.push({ rank: (formatted.length + 1).toString(), name: "-", pts: "-" });
        }
        
        setTopPlayers(formatted);
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

  return (
    <>
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleClose}
        onStart={handleStart}
      />

      {/* "How to Play" Modal - matching reference styling */}
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
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">
                  1
                </div>
                <div className="text-3xl mb-1.5">📱</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                  Scan QR or enter PIN
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">
                  2
                </div>
                <div className="text-3xl mb-1.5">✍️</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                  Enter your name
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">
                  3
                </div>
                <div className="text-3xl mb-1.5">⚡</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                  Answer fast to earn bonus
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#c5221f] text-white flex items-center justify-center font-black text-sm mb-2.5 shadow-xs">
                  4
                </div>
                <div className="text-3xl mb-1.5">🏆</div>
                <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                  Top the leaderboard!
                </p>
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

      {/* Main Screen Container - Strictly Non-Scrollable */}
      <div className="relative h-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#fff0f3] via-[#ffe4e6] to-[#fff0f3] dark:from-rose-950 dark:via-red-950 dark:to-pink-950 flex flex-col p-4 sm:p-6 lg:p-8 select-none transition-colors duration-500">
        <SakuraBackground />

        <div className="relative z-10 max-w-7xl mx-auto w-full h-full flex flex-col min-h-0">
          {/* HEADER */}
          <header className="animate-fade-in-up flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <Logo variant="full" size="lg" />
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setShowHowToPlay(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#4c0519] dark:text-stone-200 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white dark:border-white/10 shadow-xs hover:border-rose-400 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎯</span>
                <span className="hidden sm:inline">How to Play</span>
              </button>

              <Link
                href="/host"
                title="Quick Casual Multiplayer (Random Topics)"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-red-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-red-600 hover:text-white border border-rose-200 dark:border-rose-800 transition-all shadow-xs"
              >
                👑 Quick Host
              </Link>

              <Link
                href="/admin/login"
                title="Admin Studio"
                className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white dark:border-white/10 shadow-xs hover:text-red-600 transition-all flex items-center gap-1"
              >
                <span>⛩️</span>
                <span className="hidden md:inline">Admin</span>
              </Link>
            </div>
          </header>

          {/* MAIN CONTENT - 2-COLUMN VIEWPORT */}
          <main className="flex flex-col lg:flex-row gap-6 lg:gap-12 flex-1 min-h-0 items-center">
            
            {/* LEFT COLUMN: MODES & QUICK HOW TO PLAY */}
            <div className="flex flex-col justify-center flex-1 lg:max-w-md w-full">
              <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-bold text-[#4c0519] dark:text-white mb-3 leading-tight" style={{ animationDelay: '0.2s' }}>
                Learn Japanese <br />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400 dark:from-rose-400 dark:to-pink-300 drop-shadow-sm">Beautifully.</span>
              </h2>
              <p className="animate-fade-in-up text-[#64748b] dark:text-gray-300 text-sm mb-5 font-medium" style={{ animationDelay: '0.3s' }}>
                Practice pronunciation solo, or compete in real-time with friends.
              </p>

              <div className="flex flex-col gap-2.5 sm:gap-3">
                {/* Solo Practice */}
                <Link
                  href="/topics"
                  className="animate-scale-in bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white dark:border-white/10 rounded-[2rem] p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-black/60 hover:border-rose-500 dark:hover:border-rose-500 transition-all group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm border border-rose-200/50 dark:border-rose-800/50 flex-shrink-0">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-[#4c0519] dark:text-white truncate">Solo Practice</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">Learn at your own pace</div>
                  </div>
                  <span className="text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform text-lg">→</span>
                </Link>

                {/* Multiplayer */}
                <Link
                  href="/play"
                  className="animate-scale-in bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white dark:border-white/10 rounded-[2rem] p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-black/60 hover:border-rose-500 dark:hover:border-rose-500 transition-all group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100/50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm border border-pink-200/50 dark:border-pink-800/50 flex-shrink-0">
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-[#4c0519] dark:text-white truncate">Multiplayer</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">Join a live game room</div>
                  </div>
                  <span className="text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform text-lg">→</span>
                </Link>

                {/* Little How to Play Ribbon (Clean & Uncrowded) */}
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="animate-fade-in bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 backdrop-blur-md border border-white dark:border-white/10 rounded-2xl py-2 px-3 flex items-center justify-between shadow-2xs hover:border-rose-300 transition-all cursor-pointer group text-left"
                  style={{ animationDelay: '0.55s' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#4c0519] dark:text-rose-300">
                    <span>🎯</span>
                    <span className="text-[11px]">How to Play:</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-0.5"><span className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8px] font-black">1</span> 📱 PIN</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="flex items-center gap-0.5"><span className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8px] font-black">2</span> ✍️ Name</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="flex items-center gap-0.5"><span className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8px] font-black">3</span> ⚡ Bonus</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="flex items-center gap-0.5"><span className="w-3.5 h-3.5 rounded-full bg-[#c5221f] text-white inline-flex items-center justify-center text-[8px] font-black">4</span> 🏆 Win</span>
                  </div>
                  <span className="text-[10px] text-rose-500 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
                
                {/* Minimalist Top Players - Compact & Clean */}
                <div className="animate-fade-in mt-2" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">TOP PLAYERS</span>
                    <Link href="/scoreboard" className="text-[10px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium">View All →</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topPlayers.map((item, idx) => (
                      <div key={idx} className="bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white dark:border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:border-rose-300 transition-colors">
                        <span className={`font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : 'text-orange-400'}`}>#{item.rank}</span>
                        <span className="font-semibold text-[#4c0519] dark:text-white max-w-[80px] truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AVAILABLE TOPICS GRID (Spacious & Clean Overview) */}
            <div className="animate-fade-in-up flex-1 w-full h-full max-h-[500px] flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-4 sm:p-5 border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-[#334155] dark:text-gray-300">
                    AVAILABLE TOPICS
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Select your topic in Solo Practice to play
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="text-[10px] font-bold text-rose-700 dark:text-rose-300 hover:text-red-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/40 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🎯</span>
                    <span>How to Play</span>
                  </button>
                  <span className="text-[10px] font-medium text-rose-700 bg-rose-100 dark:text-rose-200 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full shadow-sm">
                    {categories.length} Modules
                  </span>
                </div>
              </div>

              {/* Non-clickable Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 overflow-hidden flex-1 items-start content-start">
                {categories.map((item, idx) => (
                  <div
                    key={item.slug}
                    className="animate-scale-in bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-2xl p-2.5 flex items-center gap-3 shadow-[0_4px_15px_rgb(0,0,0,0.02)] select-none"
                    style={{ animationDelay: `${0.5 + idx * 0.05}s` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-white/10 flex items-center justify-center text-lg shadow-sm border border-white dark:border-white/5 flex-shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0 pl-1">
                      <div className="text-base font-semibold text-[#4c0519] dark:text-white truncate leading-tight">{item.name}</div>
                      <div className="text-xs text-rose-700 dark:text-rose-200 mt-1 truncate">{item.questionCount} Questions</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guide to Solo Practice */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs flex-shrink-0">
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">Ready to learn?</span>
                <Link
                  href="/topics"
                  className="font-bold text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 hover:translate-x-0.5 transition-transform"
                >
                  <span>Choose in Solo Practice</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}