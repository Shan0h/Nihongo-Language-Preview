'use client';

import React from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f4c2c2]/60">
          <Link href="/" className="btn-torii px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1">
            ← Home
          </Link>
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-black gradient-text-torii flex items-center justify-center gap-2">
              <span>🎌</span> SELECT A JAPANESE TOPIC
            </h1>
            <p className="text-xs sm:text-sm text-[#5a5a5a] font-bold mt-0.5">
              Choose your practice topic for Solo Kiosk Mode 🌸
            </p>
          </div>
          <Link href="/scoreboard" className="btn-gold px-3.5 py-2 text-xs sm:text-sm font-black">
            🏆 Scoreboard
          </Link>
        </div>

        {/* Instruction Step Banner */}
        <div className="card-cultural p-4 mb-6 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 border-2 border-[#f4c2c2] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d32f2f] text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm">
              🎯
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#2d2d2d]">SOLO KIOSK PRACTICE INSTRUCTIONS</h3>
              <p className="text-xs text-[#5a5a5a] font-medium mt-0.5">
                Click any topic below to try Japanese pronunciation audio (🔊), microphone speech (🎤), and Kahoot quiz!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#d32f2f] bg-white px-3 py-1.5 rounded-lg border border-[#f4c2c2] flex-shrink-0">
            <span>1. Pick Topic</span>
            <span>→</span>
            <span>2. Start Practice 🚀</span>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="card-cultural p-5 flex flex-col justify-between hover:border-[#d32f2f] transition-all bg-white shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#fce4ec] border border-[#f4c2c2] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xs">
                    {category.emoji}
                  </div>
                  <span className="px-3 py-1 bg-[#f4c2c2]/40 text-[#d32f2f] font-black text-xs rounded-full">
                    {category.questionCount} Questions
                  </span>
                </div>

                <h2 className="text-xl font-black text-day-dark group-hover:text-[#d32f2f] mb-1">
                  {category.name}
                </h2>
                <div className="mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/80 text-[#b91c1c] dark:text-red-300 border border-red-300/80 dark:border-red-700 font-black text-xs shadow-2xs">
                    🈁 {category.japanese}
                  </span>
                </div>
                <p className="text-xs text-[#5a5a5a] font-medium leading-relaxed mb-4">
                  {category.description}
                </p>
              </div>

              <Link
                href={`/quiz/${category.slug}`}
                className="btn-torii w-full py-3 text-sm font-black flex items-center justify-center gap-2 group-hover:brightness-110 shadow-md"
              >
                <span>Start Practice</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="card-cultural p-4 bg-gradient-to-r from-red-50 to-amber-50 text-center text-xs text-[#5a5a5a] font-semibold">
          💡 Tip: You can practice Japanese voice pronunciation using your microphone on every question!
        </div>

      </div>
    </div>
  );
}
