'use client';

import React from 'react';
import Link from 'next/link';

export default function HostPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full text-center px-4">
        <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6">⛩️</div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">Host Kiosk Mode</h1>
        <p className="text-sm sm:text-base md:text-lg text-[#5a5a5a] mb-6 sm:mb-8">
          Exhibition kiosk mode for UHB10802.
        </p>

        <div className="card-cultural p-6 sm:p-8 mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-[#5a5a5a]">
            QR code for students to join multiplayer game and display leaderboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/" className="btn-torii px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg">
            Back to Home
          </Link>
          <Link href="/quiz/Greetings" className="btn-gold px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg">
            Start Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
