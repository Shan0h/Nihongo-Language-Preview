'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { bgm } from '@/app/utils/bgm';

export default function BgmPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.35);
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);

  useEffect(() => {
    setVolume(bgm.getVolume());

    const userPref = typeof window !== 'undefined' ? localStorage.getItem('nihongo-bgm-enabled') : null;
    const shouldPlay = userPref !== 'false'; // Default to enabled!

    if (shouldPlay) {
      bgm.start();
      setIsPlaying(true);

      // Browser autoplay policy: if audio context was suspended due to no user gesture yet,
      // seamlessly resume/start on the user's very first touch, click, or keypress anywhere.
      const handleUserGesture = () => {
        if (localStorage.getItem('nihongo-bgm-enabled') !== 'false') {
          if (bgm.getIsPlaying()) {
            bgm.resumeIfSuspended();
          } else {
            bgm.start();
            setIsPlaying(true);
          }
        }
      };

      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });
      window.addEventListener('keydown', handleUserGesture, { once: true });

      return () => {
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture);
      };
    } else {
      setIsPlaying(false);
    }
  }, []);

  const toggleBgm = () => {
    const newState = bgm.toggle();
    setIsPlaying(newState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    bgm.setVolume(val);
  };

  if (pathname === '/' || pathname === '/topics' || pathname?.startsWith('/quiz')) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group select-none">
      {/* Volume Slider Popover */}
      {showVolumeMenu && (
        <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-rose-100 dark:border-white/10 flex items-center gap-2.5 animate-scale-in">
          <span className="text-xs font-bold text-stone-500">🔈</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-24 accent-red-600 h-1.5 rounded-lg cursor-pointer bg-stone-200 dark:bg-stone-700"
          />
          <span className="text-xs font-bold text-stone-500">🔊</span>
        </div>
      )}

      {/* Main Music Toggle Button */}
      <div className="flex items-center gap-1.5 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md p-1.5 pl-3 rounded-full border border-rose-100 dark:border-white/10 shadow-lg hover:shadow-xl transition-all">
        <button
          onClick={toggleBgm}
          className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-rose-400 transition-colors"
          title={isPlaying ? "Pause Japanese Ambient BGM" : "Play Japanese Ambient BGM"}
        >
          <span className={`text-base ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            {isPlaying ? '🎵' : '🔇'}
          </span>
          <span className="hidden sm:inline">
            {isPlaying ? 'Zen BGM: ON' : 'Zen BGM'}
          </span>
        </button>

        {/* Volume popover toggle button */}
        <button
          onClick={() => setShowVolumeMenu(!showVolumeMenu)}
          className="w-7 h-7 rounded-full hover:bg-rose-50 dark:hover:bg-white/10 flex items-center justify-center text-xs text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
          title="Adjust Volume"
        >
          ⚙️
        </button>

        {/* Manual AFK Screensaver Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nihongo-trigger-afk'))}
          className="px-2 py-1 rounded-full text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/10 transition-colors flex items-center gap-1 border-l border-stone-200 dark:border-stone-700 ml-0.5"
          title="Start AFK Screensaver"
        >
          <span>🌸</span>
          <span className="hidden sm:inline">AFK</span>
        </button>
      </div>
    </div>
  );
}
