'use client';

import React from 'react';
import Link from 'next/link';

export default function TeamPage() {
  // Placeholder team members ready for user's upcoming design
  const placeholderMembers = [
    {
      role: 'Project Lead / Developer',
      name: 'Team Member 1',
      japaneseRole: 'プロジェクトリーダー',
      emoji: '👨‍💻',
      desc: 'System architecture, interactive quiz logic & live multiplayer',
      tag: 'Core Dev'
    },
    {
      role: 'UI/UX & Cultural Design',
      name: 'Team Member 2',
      japaneseRole: 'デザイン担当',
      emoji: '🎨',
      desc: 'Japanese aesthetics, certificate layout & visual styling',
      tag: 'Design'
    },
    {
      role: 'Curriculum & Content',
      name: 'Team Member 3',
      japaneseRole: '教材・教育担当',
      emoji: '📚',
      desc: 'Vocabulary decks, grammar romaji & audio speech validation',
      tag: 'Curriculum'
    },
    {
      role: 'Quality & Media Assets',
      name: 'Team Member 4',
      japaneseRole: 'リサーチ・検証担当',
      emoji: '🌸',
      desc: 'Japanese cultural assets, audio synthesis & user testing',
      tag: 'Research'
    },
  ];

  return (
    <div className="min-h-screen bg-[#fff0f3] dark:bg-[#0c080e] text-stone-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 lg:px-12 transition-colors duration-300 select-none">
      
      {/* Top Header Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 sm:py-3">
        <Link
          href="/"
          className="glass-pill px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 hover:scale-105 transition-all shadow-xs border border-rose-200/80 dark:border-white/10"
        >
          <span>←</span>
          <span>Back to Homepage</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>UHB10802 Japanese Communication 1 · UTHM</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 sm:py-12 animate-fade-in-up">
        
        {/* Hero Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 text-[#e11d48] dark:text-rose-300 text-xs font-black tracking-widest uppercase mb-3 shadow-2xs">
            <span>🌸</span>
            <span>私たちのチーム · OUR TEAM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight font-serif leading-tight">
            Meet Our Creative Team
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium">
            The passionate minds behind <span className="font-bold text-[#e11d48] dark:text-rose-400">Nihongo Education</span>.
            Dedicated to making Japanese learning beautiful, engaging, and accessible.
          </p>

          {/* Underline Divider */}
          <div className="flex items-center justify-center gap-2 w-32 mx-auto mt-4">
            <span className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-rose-400" />
            <span className="text-rose-500 text-xs">⛩️</span>
            <span className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-rose-400" />
          </div>
        </div>

        {/* Team Members Grid (Placeholder ready for upcoming design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {placeholderMembers.map((member, idx) => (
            <div
              key={idx}
              className="card-cultural p-6 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-rose-200/90 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all text-center flex flex-col justify-between relative group overflow-hidden"
            >
              {/* Corner Tag */}
              <div className="absolute top-3 right-3">
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                  {member.tag}
                </span>
              </div>

              <div>
                {/* Avatar Icon */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 dark:from-stone-800 dark:to-stone-700 border-2 border-rose-200 dark:border-white/15 flex items-center justify-center text-4xl shadow-sm group-hover:scale-105 transition-transform mb-4">
                  {member.emoji}
                </div>

                {/* Member Name */}
                <h3 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-[#e11d48] transition-colors leading-tight">
                  {member.name}
                </h3>

                {/* Japanese Role Subtitle */}
                <div className="text-[11px] font-bold text-[#e11d48] dark:text-rose-400 tracking-wider mt-0.5 font-japanese">
                  {member.japaneseRole}
                </div>

                {/* Primary Role */}
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                  {member.role}
                </div>

                {/* Description */}
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2.5 font-medium leading-relaxed">
                  {member.desc}
                </p>
              </div>

              {/* Bottom Decorative Divider */}
              <div className="pt-4 mt-4 border-t border-rose-100 dark:border-white/10 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                UTHM · UHB10802
              </div>
            </div>
          ))}
        </div>

        {/* Notice Card for Upcoming Custom Design */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-amber-200 dark:border-amber-900/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🎨</span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                Custom Team Design Space Ready
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Share your names, photos, matric numbers, or layout preferences whenever you&apos;re ready!
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-[#c5221f] hover:bg-[#a51d1a] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
          >
            ← Return Home
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between py-3 border-t border-rose-200/60 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400 font-medium">
        <div>
          日本語で、もっと素敵な毎日を ｜ NIHONGO EDUCATION 🌸
        </div>
        <div>
          Universiti Tun Hussein Onn Malaysia
        </div>
      </footer>

    </div>
  );
}
