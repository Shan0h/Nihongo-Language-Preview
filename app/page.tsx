'use client';

import React from 'react';
import Link from 'next/link';
import { categories } from '@/data/questions';

export default function NihongoTalkScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdfbf7]">
      {/* Sakura Petals Background */}
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

      <div className="relative z-10 max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <Link href="/admin/login" className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">⛩️</div>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter mb-1">
            <span className="gradient-text-torii">NIHONGO</span>
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter mb-2">
            <span className="gradient-text-torii">TALK SCREEN</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-md mx-auto px-2">
            Speak, Play & Learn Basic Japanese! 🌸
          </p>
          <p className="text-[10px] sm:text-xs text-[#8a8a8a] mt-0.5">
            UHB10802 — Japanese Communication 1 Exhibition
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-1 mb-3 sm:mb-4">
          {[
            { icon: "🎤", label: "Voice" },
            { icon: "🔊", label: "Pronunciation" },
            { icon: "🎮", label: "Multiplayer" },
            { icon: "🔥", label: "Streaks" },
            { icon: "🏆", label: "Leaderboard" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#f4c2c2] text-[10px] sm:text-xs text-[#5a5a5a]"
            >
              <span>{feature.icon}</span>
              <span className="font-medium truncate max-w-[60px] sm:max-w-none">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-6 max-w-2xl mx-auto">
          <Link
            href="/quiz/Greetings"
            className="flex-1 group flex flex-col items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-[#d32f2f] text-white rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.985] transition-all shadow-lg sm:shadow-xl"
          >
            <span className="text-2xl sm:text-3xl mb-1">🎯</span>
            <span className="text-base sm:text-lg font-black tracking-wide">SOLO KIOSK</span>
            <span className="text-[9px] sm:text-[10px] font-bold opacity-80 mt-0.5">VOICE + QUIZ</span>
          </Link>

          <Link
            href="/play"
            className="flex-1 group flex flex-col items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-[#f59e0b] text-white rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.985] transition-all shadow-lg sm:shadow-xl"
          >
            <span className="text-2xl sm:text-3xl mb-1">📱</span>
            <span className="text-base sm:text-lg font-black tracking-wide">MULTIPLAYER</span>
            <span className="text-[9px] sm:text-[10px] font-bold opacity-80 mt-0.5">ENTER PIN</span>
          </Link>
        </div>

        {/* Topics Section */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-center text-[10px] sm:text-xs font-semibold text-[#8a8a8a] tracking-[2px] mb-2">
            PICK A TOPIC
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/quiz/${category.slug}`}
                className="group card-cultural p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 hover:border-[#d32f2f]/50"
              >
                <div className="text-2xl sm:text-3xl flex-shrink-0">{category.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base text-[#2d2d2d] group-hover:text-[#d32f2f]">
                    {category.name}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#8a8a8a]">
                    {category.japanese}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#d32f2f] mt-0.5">
                    {category.questionCount} Q
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-2xl mx-auto mb-3 sm:mb-4">
          <div className="card-cultural p-3 sm:p-4">
            <h3 className="text-center text-xs font-bold mb-2">How to Play</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {[
                { step: "1", icon: "📱", label: "Choose" },
                { step: "2", icon: "✍️", label: "Answer" },
                { step: "3", icon: "⚡", label: "Fast" },
                { step: "4", icon: "🏆", label: "Leaderboard" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d32f2f] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs mb-1.5">
                    {item.step}
                  </div>
                  <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
                  <p className="text-[9px] sm:text-[10px] text-[#5a5a5a]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[9px] sm:text-[10px] text-[#8a8a8a] py-1">
          🌸 Nihongo Talk Screen UHB10802 🌸
        </div>
      </div>
    </div>
  );
}