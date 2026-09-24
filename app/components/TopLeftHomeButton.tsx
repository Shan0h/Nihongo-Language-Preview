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
      className={`fixed top-4 left-4 z-50 glass-pill px-4 sm:px-5 py-2 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 border-rose-300/80 dark:border-rose-500/50 hover:border-rose-500 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none active:scale-95 group ${className}`}
      aria-label="Back to Home"
      title="Back to Home"
    >
      <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
      <span>Home</span>
    </Link>
  );
}
