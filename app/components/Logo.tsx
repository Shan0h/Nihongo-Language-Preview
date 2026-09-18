'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export default function Logo({
  variant = 'full',
  size = 'md',
  href = '/',
  className = '',
}: LogoProps) {
  // Dimensions
  const emblemSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-11 sm:h-11';

  const titleSize =
    size === 'sm'
      ? 'text-base sm:text-lg'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : 'text-lg sm:text-xl font-bold';

  const subSize =
    size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px] sm:text-[11px]';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Emblem Icon */}
      <div
        className={`${emblemSize} relative rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 flex-shrink-0 border border-rose-200/80 dark:border-rose-900/60 bg-white dark:bg-rose-950/40 p-0.5`}
      >
        <img
          src="/images/logo.svg"
          alt="Nihongo Education Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center leading-none">
          {/* Main Title */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`${titleSize} font-bold tracking-tight text-[#4c0519] dark:text-rose-100 font-japanese transition-colors group-hover:text-red-600 dark:group-hover:text-rose-400`}
            >
              日本語教育
            </span>
            {variant === 'full' && (
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-rose-900/50 text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-800">
                UHB10802
              </span>
            )}
          </div>

          {/* Subtitle */}
          <div
            className={`${subSize} tracking-[0.16em] uppercase font-bold text-gray-500 dark:text-rose-300/80 mt-0.5 flex items-center gap-1`}
          >
            <span>NIHONGO EDUCATION</span>
            <span className="text-red-500 dark:text-rose-400">🌸</span>
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
