'use client';

import React, { useState } from 'react';
import CertificateModal from '@/app/components/CertificateModal';

export default function CertificatePreviewPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [playerName, setPlayerName] = useState('Your Name');
  const [categoryName, setCategoryName] = useState('Numbers');
  const [score, setScore] = useState(470);
  const [rank, setRank] = useState('#1/1');
  const [eventCode, setEventCode] = useState('UHB10802');

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black mb-2">🌸 Japanese Certificate Preview</h1>
        <p className="text-stone-400 text-sm">Testing Certificate matching reference image</p>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
        >
          Open Certificate
        </button>
      </div>

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
