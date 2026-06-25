'use client';

import React from 'react';
import Link from 'next/link';

export default function HostPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="text-7xl mb-6">⛩️</div>
        <h1 className="text-5xl font-extrabold mb-4">Host Kiosk Mode</h1>
        <p className="text-xl text-[#5a5a5a] mb-8">
          This is the exhibition kiosk mode for UHB10802.
        </p>

        <div className="card-cultural p-8 mb-8">
          <p className="text-[#5a5a5a]">
            In a full implementation, this page would show a QR code for students to join 
            the multiplayer game and display the current leaderboard in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-torii px-8 py-3 text-lg">
            Back to Home
          </Link>
          <Link href="/quiz/Greetings" className="btn-gold px-8 py-3 text-lg">
            Start Solo Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}
