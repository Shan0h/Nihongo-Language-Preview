'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function JoinGamePage() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Joining game with PIN: ${pin} as ${name}\n\n(Note: Multiplayer requires Supabase setup. This is a placeholder.)`);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-4xl font-extrabold">Join Multiplayer Game</h1>
          <p className="text-[#5a5a5a] mt-2">Enter the PIN from the host screen</p>
        </div>

        <form onSubmit={handleJoin} className="card-cultural p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-[#f4c2c2] rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#d32f2f]"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Game PIN</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-[#f4c2c2] rounded-xl px-4 py-3 text-2xl tracking-[8px] text-center font-mono focus:outline-none focus:border-[#d32f2f]"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button 
            type="submit"
            className="btn-gold w-full py-4 text-xl font-bold"
          >
            Join Game
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#8a8a8a] hover:text-[#d32f2f]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
