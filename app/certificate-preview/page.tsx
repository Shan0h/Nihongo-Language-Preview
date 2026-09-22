'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/app/components/CertificateModal';

export default function CertificatePreviewPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [playerName, setPlayerName] = useState('Your Name');
  const [categoryName, setCategoryName] = useState('Numbers');
  const [score, setScore] = useState(470);
  const [rank, setRank] = useState('#1/1');
  const [eventCode, setEventCode] = useState('UHB10802');

  return (
    <div className="min-h-screen bg-[#fff0f3] dark:bg-[#0c080e] text-stone-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="glass-pill px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 hover:scale-105 transition-all shadow-xs border border-rose-200/80 dark:border-white/10"
        >
          <span>←</span>
          <span>Back to Homepage</span>
        </Link>

        <div className="text-xs font-bold text-stone-500 dark:text-stone-400">
          UHB10802 Japanese Communication 1
        </div>
      </header>

      {/* Center Card */}
      <main className="max-w-md w-full mx-auto my-auto text-center p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-rose-200 dark:border-white/10 shadow-2xl animate-scale-in">
        <div className="text-4xl sm:text-5xl mb-3 animate-bounce select-none">
          📜
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white mb-1 font-serif">
          Certificate of Achievement
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6 font-medium">
          Preview, customize, and export your official Japanese certificate
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Open Certificate Modal */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3.5 px-6 bg-[#c5221f] hover:bg-[#a51d1a] text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🌸</span>
            <span>Open Certificate</span>
          </button>

          {/* Back to Homepage Button */}
          <Link
            href="/"
            className="w-full py-3 px-6 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-white font-bold text-sm rounded-2xl border border-stone-200 dark:border-white/10 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>Back to Homepage</span>
          </Link>

          {/* Explore Topics */}
          <Link
            href="/topics"
            className="w-full py-2.5 px-4 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center gap-1 transition-colors"
          >
            <span>Explore All Quiz Topics</span>
            <span>→</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-stone-400 py-2 font-medium">
        Japanese Language Festival · Nihongo Education
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categoryName={categoryName}
        categoryEmoji="📚"
        score={score}
        totalPoints={score}
        totalQuestions={5}
        accuracyPercentage={100}
        initialPlayerName={playerName}
        rank={rank}
        eventCode={eventCode}
      />
    </div>
  );
}
