'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/app/components/Logo';
import QrAccessModal from '@/app/components/QrAccessModal';

// Gentle falling sakura petals with natural variance matching the homepage
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

interface TeamMember {
  name: string;
  badge: string;
  badgeType: 'leader' | 'developer' | 'model' | 'helper';
  badgeIcon: string;
  description: string;
  quote?: string;
  photo: string;
}

export default function TeamPage() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
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

  const teamMembers: TeamMember[] = [
    {
      name: 'MUHAMMAD FIKRI AKMAL BIN MOHD FAUZI',
      badge: 'Leader / Developer',
      badgeType: 'leader',
      badgeIcon: '👑',
      description: 'Project coordination, design direction, and system development.',
      quote: '"Small steps. A brighter you."',
      photo: '/images/team/FIKRI.jpg',
    },
    {
      name: 'MUHAMMAD DANISH BIN MOHD ARIS',
      badge: 'Developer',
      badgeType: 'developer',
      badgeIcon: '</>',
      description: 'Frontend support, technical development, and digital experience.',
      quote: '"Turning ideas into real experiences."',
      photo: '/images/team/DANISH.png',
    },
    {
      name: 'AYDIN NAUFAL BIN MD FAISHALIM',
      badge: 'Miniature Japanese House Model',
      badgeType: 'model',
      badgeIcon: '📦',
      description: 'Model preparation, physical activity design, and vocabulary interaction.',
      quote: '"Culture in miniature, connections in real life."',
      photo: '/images/team/AYDIN.jpg',
    },
    {
      name: 'AHMAD FADHIL BIN ROSLI',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/FADHIL.jpg',
    },
    {
      name: 'MUHAMMAD SAIFUL SYAHMI BIN ISHAK',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/SAIFUL.jpg',
    },
    {
      name: 'MUHAMMAD IKHWAN BIN MOHAMMAD UZAINI',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/IKHWAN.png',
    },
  ];

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#fff0f3] dark:bg-[#0c080e] flex flex-col justify-between p-3 sm:p-4 lg:px-8 lg:py-3.5 select-none transition-colors duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          SEAMLESS BACKGROUND STACK (Identical to Homepage)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Day Mode Scenic Background */}
        <Image
          src="/images/fuji-sakura-bg.png"
          alt="Mount Fuji Sakura Day Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Night Mode Scenic Background */}
        <Image
          src="/images/fuji-night-bg.jpg"
          alt="Mount Fuji Sakura Night Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Day Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-[#fff0f3]/25 to-[#ffe8ee]/45 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
        {/* Night Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
      </div>

      {/* Gentle Falling Sakura Petals */}
      <SakuraBackground />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION NAVBAR (Seamless Header)
      ───────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION NAVBAR (Exact match to Front Page)
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between shrink-0 py-1 sm:py-1.5 animate-fade-in-up">
        
        {/* Left: Brand Crest Logo */}
        <div className="flex items-center">
          <Logo variant="full" size="md" />
        </div>

        {/* Right: Navbar Buttons exactly matching front page */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile QR Code Scanner */}
          <button
            onClick={() => setShowQrModal(true)}
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-[#e11d48] dark:text-rose-400 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
            title="Scan QR to play on mobile (nihongo.shan0h.my.id)"
          >
            <span>📱</span>
            <span>Scan QR</span>
          </button>

          {/* How to Play */}
          <button
            onClick={() => setShowHowToPlay(true)}
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">How to Play</span>
          </button>

          {/* Our Team (Active on this page) */}
          <div
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-[#e11d48] dark:text-rose-400 bg-rose-100/90 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900/60 flex items-center gap-1.5 shadow-2xs"
          >
            <span>👥</span>
            <span>Our Team</span>
          </div>

          {/* Quick Host */}
          <Link
            href="/host"
            title="Quick Casual Multiplayer"
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-[#e11d48] dark:text-rose-400 flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <span>👑</span>
            <span className="hidden sm:inline">Quick Host</span>
          </Link>

          {/* Admin */}
          <Link
            href="/admin/login"
            title="Admin Studio"
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Day / Night Theme Selector */}
          <button
            onClick={toggleTheme}
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-rose-200/80 dark:border-white/10 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
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

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT (Single-Viewport Compact Layout on Desktop)
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col justify-between my-auto py-1 sm:py-2">
        
        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 shrink-0 mb-2">
          
          <div className="max-w-2xl">
            <div className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-[#e11d48] dark:text-rose-400 mb-1">
              PEOPLE CREATE BRIGHTER TOMORROWS.
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              The People Behind{' '}
              <span className="text-[#e11d48] dark:text-rose-400">Nihongo Education</span>
            </h1>

            <div className="flex items-center gap-2.5 mt-1 sm:mt-1.5">
              <span className="text-base sm:text-lg font-black text-[#e11d48] dark:text-rose-400 font-serif tracking-wide">
                チーム紹介
              </span>
              <span className="w-10 h-0.5 bg-rose-400 dark:bg-rose-500 rounded-full" />
              <span className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-normal truncate">
                Six members, one shared goal: making Japanese learning interactive, welcoming and memorable.
              </span>
            </div>
          </div>

          {/* Poetic Verse (Top Right) */}
          <div className="hidden lg:flex flex-col items-end text-right select-none opacity-85 shrink-0">
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300 tracking-widest font-serif leading-tight">
              ことばで、もっとつながる
            </div>
            <div className="text-[8px] uppercase tracking-[0.16em] font-extrabold text-stone-500 dark:text-stone-400 mt-0.5">
              A BRIGHTER WORLD THROUGH LANGUAGE
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. TEAM MEMBER CARDS (2 ROWS × 3 COLUMNS)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 my-auto">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="group relative bg-white/92 dark:bg-stone-900/90 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 border border-white/90 dark:border-white/10 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex flex-col justify-between overflow-hidden"
            >
              
              {/* Subtle Sakura Watermark on card */}
              <div className="pointer-events-none absolute -right-4 -bottom-4 w-16 h-16 text-rose-100/60 dark:text-rose-950/40 text-5xl select-none group-hover:scale-110 transition-transform duration-300">
                🌸
              </div>

              <div className="flex gap-3 items-center relative z-10">
                
                {/* Member Portrait Box */}
                <div className="relative shrink-0 w-20 sm:w-22 lg:w-24 h-24 sm:h-26 lg:h-28 rounded-xl overflow-hidden bg-rose-50/80 dark:bg-stone-800 border border-rose-200/70 dark:border-white/10 shadow-2xs">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                  
                  <div>
                    {/* Role Badge */}
                    <div className="flex items-center justify-start">
                      {member.badgeType === 'leader' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#be123c] text-white shadow-2xs">
                          <span>{member.badgeIcon}</span>
                          <span className="truncate">{member.badge}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#ffe4e6] dark:bg-rose-950/80 text-[#be123c] dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs">
                          <span className="font-mono text-[10px]">{member.badgeIcon}</span>
                          <span className="truncate">{member.badge}</span>
                        </span>
                      )}
                    </div>

                    {/* Member Full Name */}
                    <h3 className="text-xs sm:text-[13px] font-black uppercase text-slate-900 dark:text-white tracking-tight mt-1 leading-snug line-clamp-2">
                      {member.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug mt-1 font-normal line-clamp-2">
                      {member.description}
                    </p>
                  </div>

                  {/* Quote / Blossom Icon */}
                  <div className="mt-1 pt-1 border-t border-rose-100/70 dark:border-white/5 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 italic">
                    {member.quote ? (
                      <>
                        <span className="truncate pr-1">{member.quote}</span>
                        <span className="text-xs text-rose-500 shrink-0">🌸</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] uppercase tracking-wider text-rose-600/80 dark:text-rose-400 font-semibold">Helper</span>
                        <span className="text-xs text-rose-500 shrink-0">🌸</span>
                      </>
                    )}
                  </div>

                </div>

              </div>

            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. CORE VALUES BAR (3 Pillars)
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-2 sm:mt-2.5 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-rose-200/70 dark:border-white/10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 shrink-0">
          
          {/* Pillar 1: Collaboration */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-sm text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              👥
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                Collaboration
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight truncate">
                Stronger together, creating greater impact.
              </div>
            </div>
          </div>

          {/* Pillar 2: Creativity */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-sm text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              💡
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                Creativity
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight truncate">
                Turning ideas into meaningful experiences.
              </div>
            </div>
          </div>

          {/* Pillar 3: Interactive Learning */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-sm text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              🎯
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                Interactive Learning
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight truncate">
                Making Japanese fun, engaging, and real.
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER SECTION
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-2 pb-1 border-t border-rose-200/70 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400 shrink-0">
        
        {/* Brand & Motto */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
            ⛩️
          </div>
          <div>
            <div className="font-extrabold text-stone-900 dark:text-white text-[11px]">
              日本語教育 <span className="text-[9px] text-[#e11d48] font-bold tracking-wider ml-1">NIHONGO EDUCATION 🌸</span>
            </div>
            <div className="text-[9px] text-stone-500 dark:text-stone-400 font-medium">
              日本語で、もっと素敵な毎日を · A BRIGHTER WORLD THROUGH LANGUAGE
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 sm:gap-4 font-medium text-[11px]">
          <Link href="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            How to Play
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Scan QR
          </button>
          <Link href="/host" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            Quick Host
          </Link>
          <Link href="/admin/login" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            Admin
          </Link>
          <span className="font-bold text-[#be123c] dark:text-rose-400">
            Our Team
          </span>
        </div>

        {/* Right Tagline */}
        <div className="flex items-center gap-1.5 text-right">
          <span className="text-xs">🌸</span>
          <div className="text-[10px] leading-tight">
            <span className="font-serif font-bold text-stone-700 dark:text-stone-300">小さな一歩、もっとつながる</span>
            <div className="text-[8px] uppercase tracking-wider text-stone-400 font-semibold">
              SMALL STEPS. A BRIGHTER YOU.
            </div>
          </div>
          <span className="text-xs opacity-60 ml-1">⛩️</span>
        </div>

      </footer>

      {/* ─────────────────────────────────────────────────────────────
          CONTACT MODAL (Interactive)
      ───────────────────────────────────────────────────────────── */}
      {contactOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Contact Nihongo Education Team"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 dark:border-white/10 shadow-2xl relative text-center">
            
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white text-lg p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#be123c] text-xl flex items-center justify-center mx-auto mb-3 border border-rose-200">
              ✉️
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Get in Touch with Our Team
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
              We welcome collaboration, event invites, and feedback on the Nihongo Language platform for UTHM UHB10802 Japanese Communication 1.
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-rose-50/80 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-200 space-y-1.5 text-left border border-rose-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold">🏫 Course:</span>
                <span>UHB10802 Japanese Communication 1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold">🎓 Institution:</span>
                <span>Universiti Tun Hussein Onn Malaysia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold">🌐 Website:</span>
                <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400">nihongo.shan0h.my.id</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href="/"
                className="flex-1 py-2 rounded-xl border border-rose-200 dark:border-white/20 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-rose-50 dark:hover:bg-white/5 transition-all text-center"
              >
                Return Home
              </Link>
              <button
                onClick={() => setContactOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#be123c] hover:bg-[#9f1239] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Quick Access Modal */}
      <QrAccessModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url="https://nihongo.shan0h.my.id"
      />

      {/* How to Play Modal */}
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
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl mb-2">
                  1️⃣
                </div>
                <div className="text-xs font-bold text-stone-800 dark:text-white">Choose Topic</div>
                <div className="text-[11px] text-stone-500">Pick any of 10 modules</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl mb-2">
                  2️⃣
                </div>
                <div className="text-xs font-bold text-stone-800 dark:text-white">Answer Quiz</div>
                <div className="text-[11px] text-stone-500">Listen, speak, or select</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl mb-2">
                  3️⃣
                </div>
                <div className="text-xs font-bold text-stone-800 dark:text-white">Score Points</div>
                <div className="text-[11px] text-stone-500">Speed and accuracy matter</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl mb-2">
                  4️⃣
                </div>
                <div className="text-xs font-bold text-stone-800 dark:text-white">Get Certificate</div>
                <div className="text-[11px] text-stone-500">Download official PDF</div>
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

    </div>
  );
}
