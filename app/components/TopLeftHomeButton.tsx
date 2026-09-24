'use client';

import React from 'react';
import Link from 'next/link';

interface TopLeftHomeButtonProps {
  onDisconnect?: () => void;
  className?: string;
}

export default function TopLeftHomeButton({ onDisconnect, className = '' }: TopLeftHomeButtonProps) {
  return (
    <Link
      href="/"
      onClick={() => {
        if (onDisconnect) {
          try {
            onDisconnect();
          } catch {}
        }
      }}
      className={`fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 shadow-md backdrop-blur-md active:scale-95 group bg-white/90 hover:bg-white text-stone-800 border-stone-200/80 hover:border-rose-400 dark:bg-[#161523]/90 dark:hover:bg-[#1e1c30] dark:text-white dark:border-white/15 dark:hover:border-rose-500/60 shadow-stone-900/5 dark:shadow-black/60 cursor-pointer select-none ${className}`}
      aria-label="Back to Home"
      title="Back to Home"
    >
      <span className="text-sm font-bold transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
      <span className="text-xs sm:text-sm font-bold tracking-tight">Home</span>
    </Link>
  );
}
