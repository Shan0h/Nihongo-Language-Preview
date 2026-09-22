'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TeamMember {
  name: string;
  badge: string;
  badgeType: 'leader' | 'developer' | 'model' | 'helper';
  badgeIcon: string;
  description: string;
  quote?: string;
  photo: string;
  hasBlossomAccent?: boolean;
}

export default function TeamPage() {
  const [contactOpen, setContactOpen] = useState(false);

  const teamMembers: TeamMember[] = [
    {
      name: 'Hana Tanaka',
      badge: 'Leader / Developer',
      badgeType: 'leader',
      badgeIcon: '👑',
      description: 'Project coordination, design direction, and system development.',
      quote: '"Small steps. A brighter you."',
      photo: '/images/team/hana.png',
      hasBlossomAccent: true,
    },
    {
      name: 'Ren Saito',
      badge: 'Developer',
      badgeType: 'developer',
      badgeIcon: '</>',
      description: 'Frontend support, technical development, and digital experience.',
      quote: '"Turning ideas into real experiences."',
      photo: '/images/team/ren.png',
      hasBlossomAccent: true,
    },
    {
      name: 'Yui Nakamura',
      badge: 'Miniature Japanese House Model',
      badgeType: 'model',
      badgeIcon: '📦',
      description: 'Model preparation, physical activity design, and vocabulary interaction.',
      quote: '"Culture in miniature, connections in real life."',
      photo: '/images/team/yui.png',
      hasBlossomAccent: true,
    },
    {
      name: 'Kaito Yamamoto',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/kaito.png',
      hasBlossomAccent: true,
    },
    {
      name: 'Mei Suzuki',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/mei.png',
      hasBlossomAccent: true,
    },
    {
      name: 'Sora Fujimoto',
      badge: 'Helper',
      badgeType: 'helper',
      badgeIcon: '👥',
      description: 'Promote to people, invite visitors to the booth, and assist participants.',
      photo: '/images/team/sora.png',
      hasBlossomAccent: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#fff1f4] dark:bg-[#0d090d] text-slate-800 dark:text-stone-100 flex flex-col justify-between overflow-x-hidden selection:bg-rose-200 selection:text-rose-900 transition-colors duration-300">
      
      {/* Background Graphic: Mount Fuji, Pagoda & Sakura Atmosphere */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-top opacity-70 dark:opacity-20 mix-blend-multiply dark:mix-blend-luminosity"
        style={{ backgroundImage: "url('/images/fuji-sakura-clean-bg.png')" }}
      />

      {/* Subtle Seigaiha wave pattern overlay at bottom-left */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 w-96 h-80 opacity-25 dark:opacity-5 bg-contain bg-no-repeat bg-bottom z-0"
        style={{ backgroundImage: "url('/seigaiha-pink.svg')" }}
      />

      {/* Floating Cherry Blossom Petals (Pure CSS Ambience) */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <span className="petal petal-1">🌸</span>
        <span className="petal petal-2">🌸</span>
        <span className="petal petal-3">🌸</span>
        <span className="petal petal-4">🌸</span>
        <span className="petal petal-5">🌸</span>
        <span className="petal petal-6">🌸</span>
        <span className="petal petal-7">🌸</span>
        <span className="petal petal-8">🌸</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-2 flex items-center justify-between">
        
        {/* Brand Crest */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#d32f2f] to-[#b71c1c] text-white flex items-center justify-center text-xl shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform shrink-0 border border-white/40">
            ⛩️
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 dark:text-white text-base sm:text-lg tracking-tight font-serif">
                日本語教育
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#be123c] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                UHB10802
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#e11d48] dark:text-rose-400 tracking-[0.16em] uppercase flex items-center gap-1">
              NIHONGO EDUCATION <span className="text-xs">🌸</span>
            </span>
          </div>
        </Link>

        {/* Navigation Pills Bar */}
        <nav className="flex items-center bg-white/85 dark:bg-stone-900/85 backdrop-blur-md rounded-full p-1 sm:p-1.5 border border-rose-200/70 dark:border-white/10 shadow-xs">
          
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-white/5 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            href="/#topics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-white/5 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">About</span>
          </Link>

          <Link
            href="/#topics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-white/5 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="hidden sm:inline">Activities</span>
          </Link>

          {/* Active Team Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#ffe4e6] dark:bg-rose-950/80 text-[#be123c] dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#be123c] dark:text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Team</span>
          </div>

          <button
            onClick={() => setContactOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-rose-50/80 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Contact</span>
          </button>

        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO TITLE SECTION & FLOATING CALLIGRAPHY
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
          
          {/* Main Title Group */}
          <div className="max-w-2xl">
            <div className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#e11d48] dark:text-rose-400 mb-2">
              PEOPLE CREATE BRIGHTER TOMORROWS.
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              The People Behind{' '}
              <span className="text-[#e11d48] dark:text-rose-400">Nihongo Education</span>
            </h1>

            {/* Japanese Kicker Subtitle */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-lg sm:text-xl font-black text-[#e11d48] dark:text-rose-400 font-serif tracking-wide">
                チーム紹介
              </span>
              <span className="w-12 h-0.5 bg-rose-400 dark:bg-rose-500 rounded-full" />
            </div>

            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-2.5 font-normal leading-relaxed max-w-xl">
              Six members, one shared goal: making Japanese learning interactive, welcoming and memorable.
            </p>
          </div>

          {/* Floating Japanese Calligraphy Verse (Top Right) */}
          <div className="hidden lg:flex flex-col items-end text-right select-none opacity-85">
            <div className="text-sm font-bold text-rose-800 dark:text-rose-300 tracking-widest font-serif leading-relaxed">
              ことばで、
            </div>
            <div className="text-sm font-bold text-rose-800 dark:text-rose-300 tracking-widest font-serif leading-relaxed">
              もっとつながる
            </div>
            <div className="text-[9px] uppercase tracking-[0.18em] font-extrabold text-stone-500 dark:text-stone-400 mt-1">
              A BRIGHTER WORLD THROUGH LANGUAGE
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. TEAM MEMBER CARDS (2 ROWS × 3 COLUMNS)
        ───────────────────────────────────────────────────────────── */}
        <div className="relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group relative bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-[26px] p-4 sm:p-5 border border-white/90 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                
                {/* Background Sakura Watermark on hover */}
                <div className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 text-rose-100/60 dark:text-rose-950/40 text-7xl select-none group-hover:scale-125 transition-transform duration-500">
                  🌸
                </div>

                <div className="flex gap-4 items-start relative z-10">
                  
                  {/* Portrait Box */}
                  <div className="relative shrink-0 w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden bg-rose-50/80 dark:bg-stone-800 border border-rose-200/60 dark:border-white/10 shadow-xs">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="flex-1 flex flex-col justify-between min-h-[128px]">
                    
                    <div>
                      {/* Role Badge */}
                      <div className="flex items-center justify-start">
                        {member.badgeType === 'leader' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#be123c] text-white shadow-xs">
                            <span>{member.badgeIcon}</span>
                            <span>{member.badge}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#ffe4e6] dark:bg-rose-950/80 text-[#be123c] dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs">
                            <span className="font-mono text-xs">{member.badgeIcon}</span>
                            <span>{member.badge}</span>
                          </span>
                        )}
                      </div>

                      {/* Member Name */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 leading-tight">
                        {member.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5 font-normal">
                        {member.description}
                      </p>
                    </div>

                    {/* Quote or Bottom Accent */}
                    <div className="mt-3 pt-2">
                      {member.quote ? (
                        <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300 italic font-medium">
                          <span>{member.quote}</span>
                          <span className="text-xs text-rose-500 ml-1 shrink-0">🌸</span>
                        </div>
                      ) : (
                        <div className="flex justify-end text-xs text-rose-500">
                          🌸
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Poetic Floating Calligraphy (Far Right Side column on very large screens) */}
          <div className="hidden 2xl:flex absolute -right-24 top-1/2 -translate-y-1/2 flex-col items-center justify-center text-center select-none py-6 opacity-80 pointer-events-none">
            <div className="font-serif text-rose-800 dark:text-rose-300 text-xs tracking-widest font-bold [writing-mode:vertical-rl] leading-loose">
              学びは、きっとどこかで花ひらく。
            </div>
            <div className="text-[8px] uppercase tracking-widest text-stone-400 font-bold mt-4 [writing-mode:vertical-rl]">
              EVERY WORD OPENS A BRIGHTER TOMORROW.
            </div>
            <div className="mt-3 text-rose-400 text-sm">⛩️</div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. CORE VALUES BAR (3 PILLARS)
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-6 sm:mt-8 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-rose-200/70 dark:border-white/10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Pillar 1: Collaboration */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-lg text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              👥
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Collaboration
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
                Stronger together, creating greater impact.
              </div>
            </div>
          </div>

          {/* Pillar 2: Creativity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-lg text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              💡
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Creativity
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
                Turning ideas into meaningful experiences.
              </div>
            </div>
          </div>

          {/* Pillar 3: Interactive Learning */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#ffe4e6] dark:bg-rose-950 flex items-center justify-center text-lg text-[#be123c] dark:text-rose-300 shrink-0 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              🎯
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Interactive Learning
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
                Making Japanese fun, engaging, and real.
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER SECTION
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 border-t border-rose-200/70 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-400">
        
        {/* Brand & Motto */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
            ⛩️
          </div>
          <div>
            <div className="font-extrabold text-stone-900 dark:text-white text-xs">
              日本語教育 <span className="text-[10px] text-[#e11d48] font-bold tracking-wider ml-1">NIHONGO EDUCATION 🌸</span>
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
              日本語で、もっと素敵な毎日を · A BRIGHTER WORLD THROUGH LANGUAGE
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 font-medium">
          <Link href="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/#topics" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            About
          </Link>
          <Link href="/#topics" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            Activities
          </Link>
          <span className="font-bold text-[#be123c] dark:text-rose-400">
            Team
          </span>
          <button
            onClick={() => setContactOpen(true)}
            className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>

        {/* Right Tagline */}
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs">🌸</span>
          <div className="text-[11px] leading-tight">
            <span className="font-serif font-bold text-stone-700 dark:text-stone-300">小さな一歩、もっとつながる</span>
            <div className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold">
              SMALL STEPS. A BRIGHTER YOU.
            </div>
          </div>
          <span className="text-sm opacity-60 ml-1">⛩️</span>
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

            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#be123c] text-2xl flex items-center justify-center mx-auto mb-3 border border-rose-200">
              ✉️
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Get in Touch with Our Team
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
              We welcome collaboration, event invites, and feedback on the Nihongo Language platform for UTHM UHB10802 Japanese Communication 1.
            </p>

            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-200 space-y-2 text-left border border-rose-100 dark:border-white/10">
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

            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-white/20 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-rose-50 dark:hover:bg-white/5 transition-all text-center"
              >
                Return Home
              </Link>
              <button
                onClick={() => setContactOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#be123c] hover:bg-[#9f1239] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Sakura Petal Animations */}
      <style jsx>{`
        .petal {
          position: absolute;
          user-select: none;
          pointer-events: none;
          opacity: 0.7;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .petal-1 { top: -20px; left: 10%; font-size: 14px; animation-duration: 12s; animation-delay: 0s; }
        .petal-2 { top: -20px; left: 25%; font-size: 18px; animation-duration: 15s; animation-delay: 2s; }
        .petal-3 { top: -20px; left: 45%; font-size: 12px; animation-duration: 10s; animation-delay: 4s; }
        .petal-4 { top: -20px; left: 60%; font-size: 16px; animation-duration: 14s; animation-delay: 1s; }
        .petal-5 { top: -20px; left: 75%; font-size: 20px; animation-duration: 16s; animation-delay: 3s; }
        .petal-6 { top: -20px; left: 88%; font-size: 13px; animation-duration: 11s; animation-delay: 5s; }
        .petal-7 { top: -20px; left: 35%; font-size: 15px; animation-duration: 13s; animation-delay: 6s; }
        .petal-8 { top: -20px; left: 95%; font-size: 17px; animation-duration: 17s; animation-delay: 2.5s; }

        @keyframes fall {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translate(60px, 50vh) rotate(180deg);
            opacity: 0.6;
          }
          100% {
            transform: translate(120px, 105vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}
