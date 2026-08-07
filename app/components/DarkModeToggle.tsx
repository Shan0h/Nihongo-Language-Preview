'use client';

import React, { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nihongo-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nihongo-theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleDarkMode}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 transition-all duration-300 shadow-xl backdrop-blur-md active:scale-95 group ${
        isDark
          ? 'bg-[#161523]/95 border-[#dc2626] text-white shadow-red-900/40 hover:border-[#f59e0b]'
          : 'bg-white/95 border-[#f4c2c2] text-[#2d2d2d] shadow-pink-200/50 hover:border-[#d32f2f]'
      }`}
      aria-label="Toggle Dark Mode"
      title={isDark ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
    >
      {/* Torii / Sakura Icon */}
      <span className="text-base transition-transform duration-500 group-hover:scale-110">
        {isDark ? '⛩️' : '🌸'}
      </span>

      {/* Japanese Kanji Label */}
      <span className="text-xs font-black tracking-wider">
        {isDark ? '夜 NIGHT' : '昼 DAY'}
      </span>

      {/* Switch Track */}
      <div
        className={`w-9 h-5 rounded-full relative transition-colors duration-300 flex items-center p-0.5 ${
          isDark ? 'bg-gradient-to-r from-[#dc2626] to-[#b91c1c]' : 'bg-[#f4c2c2]'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center text-[9px] font-bold ${
            isDark ? 'translate-x-4 text-[#dc2626]' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}
