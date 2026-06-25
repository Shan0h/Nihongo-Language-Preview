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

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">⛩️</div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-2">
            <span className="gradient-text-torii">NIHONGO</span>
          </h1>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            <span className="gradient-text-torii">TALK SCREEN</span>
          </h2>
          <p className="text-xl text-[#5a5a5a] max-w-md mx-auto">
            Speak, Play &amp; Learn Basic Japanese! 🌸
          </p>
          <p className="text-sm text-[#8a8a8a] mt-2">
            UHB10802 — Japanese Communication 1 Exhibition
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: "🎤", label: "Voice Input" },
            { icon: "🔊", label: "Pronunciation" },
            { icon: "🎮", label: "Multiplayer" },
            { icon: "🔥", label: "Streaks" },
            { icon: "🏆", label: "Leaderboard" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#f4c2c2] text-sm text-[#5a5a5a]"
            >
              <span>{feature.icon}</span>
              <span className="font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-2xl mx-auto">
          <Link
            href="/quiz/Greetings"
            className="flex-1 group flex flex-col items-center justify-center px-8 py-8 bg-[#d32f2f] text-white rounded-3xl hover:brightness-110 active:scale-[0.985] transition-all shadow-xl"
          >
            <span className="text-5xl mb-3">🎯</span>
            <span className="text-2xl font-black tracking-wide">SOLO KIOSK</span>
            <span className="text-xs font-bold opacity-80 mt-1 tracking-[2px]">VOICE + QUIZ MODE</span>
          </Link>

          <Link
            href="/play"
            className="flex-1 group flex flex-col items-center justify-center px-8 py-8 bg-[#f59e0b] text-white rounded-3xl hover:brightness-110 active:scale-[0.985] transition-all shadow-xl"
          >
            <span className="text-5xl mb-3">📱</span>
            <span className="text-2xl font-black tracking-wide">JOIN MULTIPLAYER</span>
            <span className="text-xs font-bold opacity-80 mt-1 tracking-[2px]">ENTER PIN TO PLAY</span>
          </Link>
        </div>

        {/* Topics Section */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-[#8a8a8a] tracking-[3px] mb-6">
            PICK A TOPIC TO PRACTICE
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/quiz/${category.slug}`}
                className="group card-cultural p-6 flex items-center gap-4 hover:border-[#d32f2f]/50"
              >
                <div className="text-5xl flex-shrink-0">{category.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl text-[#2d2d2d] group-hover:text-[#d32f2f] transition-colors">
                    {category.name}
                  </div>
                  <div className="text-sm text-[#8a8a8a] font-medium">
                    {category.japanese}
                  </div>
                  <div className="text-xs text-[#d32f2f] mt-1 font-semibold">
                    {category.questionCount} Questions • {category.difficulty}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-cultural p-8">
            <h3 className="text-center text-xl font-bold mb-6">How to Play</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { step: "1", icon: "📱", label: "Choose a topic or join a game" },
                { step: "2", icon: "✍️", label: "Answer the questions" },
                { step: "3", icon: "⚡", label: "Answer fast for bonus points" },
                { step: "4", icon: "🏆", label: "Climb the leaderboard!" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#d32f2f] text-white flex items-center justify-center font-bold mb-3">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm text-[#5a5a5a] font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#8a8a8a]">
          🌸 Nihongo Talk Screen — UHB10802 Japanese Communication 1 Exhibition 🌸
        </div>
      </div>
    </div>
  );
}
