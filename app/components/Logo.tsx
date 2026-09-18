'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
}

export default function Logo({
  variant = 'full',
  size = 'lg',
  href = '/',
  className = '',
}: LogoProps) {
  // Generous, readable dimensions
  const emblemSize =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'md'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : size === 'xl'
      ? 'w-18 h-18 sm:w-22 sm:h-22'
      : 'w-14 h-14 sm:w-16 sm:h-16'; // default 'lg'

  const titleSize =
    size === 'sm'
      ? 'text-lg'
      : size === 'md'
      ? 'text-xl sm:text-2xl'
      : size === 'xl'
      ? 'text-3xl sm:text-4xl'
      : 'text-2xl sm:text-3xl font-black'; // default 'lg'

  const subSize =
    size === 'sm'
      ? 'text-[10px]'
      : size === 'md'
      ? 'text-xs'
      : size === 'xl'
      ? 'text-sm'
      : 'text-xs sm:text-[13px] tracking-[0.18em] font-extrabold'; // default 'lg'

  const content = (
    <div className={`inline-flex items-center gap-3 sm:gap-3.5 group select-none ${className}`}>
      {/* Emblem Icon */}
      <div
        className={`${emblemSize} relative rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 flex-shrink-0 border-2 border-rose-200/90 dark:border-rose-800/80 bg-white dark:bg-rose-950/60 p-0.5`}
      >
        <img
          src="/images/logo.svg"
          alt="Nihongo Education Crest"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          {/* Main Title Row */}
          <div className="flex items-center gap-2 flex-wrap leading-tight">
            <span
              className={`${titleSize} font-black tracking-tight text-[#4c0519] dark:text-rose-100 font-japanese transition-colors group-hover:text-red-600 dark:group-hover:text-rose-400`}
            >
              日本語教育
            </span>
            {variant === 'full' && (
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100/90 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300/80 dark:border-rose-700 shadow-2xs">
                UHB10802
              </span>
            )}
          </div>

          {/* Subtitle Row */}
          <div
            className={`${subSize} uppercase text-[#9f1239] dark:text-rose-300 font-bold mt-1 flex items-center gap-1.5`}
          >
            <span>NIHONGO EDUCATION</span>
            <span className="text-red-500 dark:text-rose-400 text-sm inline-block animate-pulse">
              🌸
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
