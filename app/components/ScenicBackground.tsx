'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const SakuraPetals = () => {
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

export default function ScenicBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Day Mode Scenic Background */}
        <Image
          src="/images/fuji-sakura-bg.png"
          alt="Mount Fuji Sakura Day Background"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Night Mode Scenic Background */}
        <Image
          src="/images/fuji-night-bg.jpg"
          alt="Mount Fuji Sakura Night Background"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Day Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-[#fff0f3]/30 to-[#ffe8ee]/50 opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out pointer-events-none" />
        {/* Night Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75 opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
      </div>
      <SakuraPetals />
    </>
  );
}
