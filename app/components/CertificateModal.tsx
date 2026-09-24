'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import Link from 'next/link';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryEmoji?: string;
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  initialPlayerName?: string;
  rank?: string;
  totalPoints?: number;
  eventCode?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  categoryName,
  categoryEmoji = '🌸',
  score,
  totalQuestions,
  accuracyPercentage,
  initialPlayerName = 'Sample Student',
  rank = '#1/1',
  totalPoints,
  eventCode = 'UHB10802'
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string>('');

  // Synchronize player name from local storage or props
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nihongo-player-name');
      if (stored && stored.trim() && stored !== 'Guest Samurai') {
        setPlayerName(stored.trim());
      } else if (initialPlayerName) {
        setPlayerName(initialPlayerName);
      }
    }
  }, [initialPlayerName]);

  // Generate QR Code for "SCAN TO PLAY"
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const playUrl = 'https://nihongo.shan0h.my.id';
      QRCode.toDataURL(playUrl, {
        margin: 1,
        width: 140,
        color: {
          dark: '#22080a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, []);

  if (!isOpen) return null;

  // Format date matching reference image (e.g. "24 September 2026")
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Dynamic Japanese Rank based on accuracy
  let rankEnglish = 'High Scorer';
  let rankJapanese = '高得点';
  if (accuracyPercentage === 100) {
    rankEnglish = 'High Scorer';
    rankJapanese = '高得点';
  } else if (accuracyPercentage >= 80) {
    rankEnglish = 'Gold Shogun';
    rankJapanese = '将軍';
  } else if (accuracyPercentage >= 60) {
    rankEnglish = 'Ninja Warrior';
    rankJapanese = '忍び';
  }

  // Points calculation matching reference image defaults (e.g. 470)
  const displayScore =
    totalPoints !== undefined
      ? totalPoints
      : score > 0
      ? score * 20 > 400
        ? score * 20
        : 470
      : 470;

  // Download high-resolution PNG (3x pixel ratio for print clarity)
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      setIsExporting('png');
      setExportSuccess('');

      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 3,
        backgroundColor: '#fff4f6',
        cacheBust: true
      });

      const link = document.createElement('a');
      link.download = `Nihongo_Education_Certificate_${playerName.replace(/\s+/g, '_')}_${categoryName}.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccess('PNG downloaded in ultra-high resolution! 🌸');
      setTimeout(() => setExportSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Could not export PNG. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  // Download print-ready A4 PDF document
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setIsExporting('pdf');
      setExportSuccess('');

      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 3,
        backgroundColor: '#fff4f6',
        cacheBust: true
      });

      const certWidth = certificateRef.current.offsetWidth;
      const certHeight = certificateRef.current.offsetHeight;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [certWidth * 1.5, certHeight * 1.5]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, certWidth * 1.5, certHeight * 1.5);
      pdf.save(`Nihongo_Education_Certificate_${playerName.replace(/\s+/g, '_')}_${categoryName}.pdf`);

      setExportSuccess('Print-ready PDF downloaded successfully! ⛩️');
      setTimeout(() => setExportSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="max-w-[560px] w-full my-auto flex flex-col items-center">
        {/* Name Customization Top Bar */}
        <div className="w-full bg-white dark:bg-stone-900 border border-amber-300 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 mb-2.5 shadow-lg flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-base shrink-0">✍️</span>
            <span className="font-bold text-stone-500 dark:text-stone-300 text-xs sm:text-sm shrink-0">
              Name on Certificate:
            </span>
            {isEditingName ? (
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                maxLength={30}
                className="px-2.5 py-1 rounded-lg border border-red-400 bg-rose-50/50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-red-400 flex-1 min-w-[120px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-black text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer text-left truncate"
                title="Click to edit name"
              >
                <span className="truncate">{playerName || 'Sample Student'}</span>
                <span className="text-xs text-stone-400 font-normal shrink-0">✎</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0 transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ============================================================ */}
        {/* CERTIFICATE CANVAS (Pixel-perfect matching Photo 2 reference) */}
        {/* ============================================================ */}
        <div
          ref={certificateRef}
          className="w-full relative select-none overflow-hidden rounded-xl shadow-2xl bg-[#fff2f4] text-[#2b1810]"
          style={{
            aspectRatio: '724 / 1024',
            fontFamily: `var(--font-cinzel), 'Times New Roman', Georgia, serif`
          }}
        >
          {/* Authentic High-Resolution Japanese Background Art from Photo 1 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/certificate-bg.jpg"
            alt="Certificate Background"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
          />

          {/* Certificate Content Overlay (Comfortably padded inside the gold decorative border) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center pt-8 sm:pt-10 pb-5 sm:pb-6 px-6 sm:px-10">
            {/* 1. TOP HEADER: Logo, Japanese Text, Event Badge, Subtitle & Tagline */}
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Circular Torii Logo Badge */}
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden border border-[#d4af37]"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #ef4444 0%, #b91c1c 65%, #7f1d1d 100%)'
                  }}
                >
                  {/* Subtle inner golden glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-amber-200/30 pointer-events-none" />
                  {/* Torii Gate with Golden Rising Sun Silhouette */}
                  <svg viewBox="0 0 100 80" className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" fill="none">
                    {/* Golden Sun Arc */}
                    <circle cx="50" cy="46" r="24" fill="#fef08a" opacity="0.85" />
                    {/* Torii Roof (Black/White) */}
                    <path d="M6 18 C 28 12, 72 12, 94 18 L 92 23 C 72 18, 28 18, 8 23 Z" fill="#ffffff" />
                    {/* Lower beam */}
                    <path d="M 14 27 L 86 27 L 84 31 L 16 31 Z" fill="#ffffff" />
                    {/* Center tablet */}
                    <rect x="46" y="26" width="8" height="15" fill="#ffffff" rx="0.5" />
                    {/* Secondary beam */}
                    <rect x="20" y="38" width="60" height="3.5" fill="#ffffff" />
                    {/* Pillars */}
                    <path d="M 30 18 L 26 72 L 33 72 L 35 18 Z" fill="#ffffff" />
                    <path d="M 70 18 L 74 72 L 67 72 L 65 18 Z" fill="#ffffff" />
                  </svg>
                </div>

                {/* Header Title & Badge */}
                <div className="text-left flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-base sm:text-xl text-[#2b1810] tracking-wider leading-none">
                      日本語教育
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffe4e6] border border-[#fbcfe8] text-[#e11d48] font-bold text-[9px] sm:text-[10px] leading-none">
                      {eventCode}
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#e11d48] tracking-[0.14em] leading-none mt-1 flex items-center gap-1 font-sans">
                    <span>NIHONGO EDUCATION</span>
                    <span className="text-[10px] sm:text-xs">🌸</span>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-[8px] sm:text-[10px] font-bold text-[#be185d] tracking-[0.22em] uppercase mt-1.5 font-sans">
                SMALL STEPS. A BRIGHTER YOU.
              </p>
            </div>

            {/* 2. TITLE: CERTIFICATE OF ACHIEVEMENT & SUBTITLE */}
            <div className="flex flex-col items-center w-full my-0.5">
              <h1 className="text-lg sm:text-2xl md:text-[27px] font-black tracking-[0.14em] text-[#5c1118] uppercase leading-tight font-serif drop-shadow-2xs">
                CERTIFICATE OF ACHIEVEMENT
              </h1>
              <div className="flex items-center justify-center gap-2 text-[#7a1b24] tracking-[0.16em] text-[10px] sm:text-xs font-bold font-serif mt-1">
                <span className="text-[8px] text-[#c29b38]">◇</span>
                <span>
                  {rankEnglish.toUpperCase()} — {rankJapanese}
                </span>
                <span className="text-[8px] text-[#c29b38]">◇</span>
              </div>
            </div>

            {/* 3. ATTESTATION & RECIPIENT NAME */}
            <div className="flex flex-col items-center w-full max-w-md my-0.5">
              <p className="font-serif italic text-xs sm:text-sm text-[#54433d] mb-0.5">
                This certifies that
              </p>

              {/* Student Name */}
              <div className="font-serif font-black text-2xl sm:text-3xl md:text-[38px] text-[#6b131d] tracking-wide px-3 leading-tight break-words max-w-full drop-shadow-2xs my-0.5">
                {playerName || 'Sample Student'}
              </div>

              {/* Completion Statement */}
              <p className="text-[10px] sm:text-[11.5px] text-[#4a3a34] font-medium leading-relaxed max-w-xs sm:max-w-sm mt-0.5">
                has successfully completed the{' '}
                <span className="font-bold text-[#be185d]">Nihongo Education</span> Solo
                Practice game and achieved a high score on
              </p>

              {/* Category Pill */}
              <div className="mt-1.5 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#ffe4e6]/95 via-[#fce7f3]/95 to-[#ffe4e6]/95 border border-[#fbcfe8] shadow-2xs">
                <span className="text-sm sm:text-base">{categoryEmoji || '📚'}</span>
                <span className="font-serif font-black text-xs sm:text-sm text-[#4a1217] tracking-wide">
                  {categoryName}
                </span>
              </div>
            </div>

            {/* 4. DUAL KPI SCORE & RANK CARDS */}
            <div className="w-full max-w-[380px] grid grid-cols-2 gap-2.5 sm:gap-3.5 my-1">
              {/* CARD 1: FINAL SCORE */}
              <div className="flex flex-col items-center">
                <div
                  className="w-full rounded-2xl p-2 sm:p-2.5 border border-[#fbcfe8] shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,245,246,0.9) 0%, rgba(254,235,238,0.85) 100%)'
                  }}
                >
                  <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black tracking-[0.14em] uppercase text-[#e11d48]">
                    <span className="text-[10px] sm:text-xs">🌸</span>
                    <span>FINAL SCORE</span>
                  </div>

                  <div className="flex items-center justify-center gap-1 w-14 my-0.5 opacity-70">
                    <div className="h-[1px] flex-1 bg-[#f472b6]" />
                    <div className="w-1 h-1 rotate-45 bg-[#e11d48]" />
                    <div className="h-[1px] flex-1 bg-[#f472b6]" />
                  </div>

                  <div className="text-2xl sm:text-3xl font-serif font-black text-[#2e0e11] leading-tight my-0.5">
                    {displayScore}
                  </div>
                </div>

                {/* Sub-Pill below score */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-bold text-[9px] sm:text-[10px] shadow-2xs font-serif">
                  <span className="text-amber-500 text-[10px]">⭐</span>
                  <span>{rankEnglish}</span>
                </div>
              </div>

              {/* CARD 2: RANK */}
              <div className="flex flex-col items-center">
                <div
                  className="w-full rounded-2xl p-2 sm:p-2.5 border border-[#fef08a] shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,253,245,0.9) 0%, rgba(254,249,231,0.85) 100%)'
                  }}
                >
                  <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black tracking-[0.14em] uppercase text-[#b45309]">
                    <span className="text-[10px] sm:text-xs">👑</span>
                    <span>RANK</span>
                  </div>

                  <div className="flex items-center justify-center gap-1 w-14 my-0.5 opacity-70">
                    <div className="h-[1px] flex-1 bg-[#f59e0b]" />
                    <div className="w-1 h-1 rotate-45 bg-[#b45309]" />
                    <div className="h-[1px] flex-1 bg-[#f59e0b]" />
                  </div>

                  <div className="text-2xl sm:text-3xl font-serif font-black text-[#2e0e11] leading-tight my-0.5">
                    {rank}
                  </div>
                </div>

                {/* Sub-Pill below rank */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ffe4e6] border border-[#fecdd3] text-[#9f1239] font-bold text-[9px] sm:text-[10px] shadow-2xs font-serif">
                  <span className="text-[10px]">🎮</span>
                  <span>Nihongo Player</span>
                </div>
              </div>
            </div>

            {/* 5. BOTTOM SECTION: DATE/EVENT, RED RIBBON SEAL, QR CODE */}
            <div className="w-full pt-1">
              <div className="grid grid-cols-3 items-end px-1 sm:px-3">
                {/* Left: Date & Event */}
                <div className="text-left space-y-0.5">
                  <div className="text-[8px] sm:text-[9px] font-bold text-[#68554f] uppercase tracking-[0.16em] font-sans">
                    DATE
                  </div>
                  <div className="text-[11px] sm:text-[12.5px] font-black text-[#1c0c08] font-serif leading-snug">
                    {formattedDate}
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-bold text-[#68554f] uppercase tracking-[0.16em] font-sans pt-1">
                    EVENT
                  </div>
                  <div className="text-[11px] sm:text-[12.5px] font-black text-[#1c0c08] font-serif tracking-wider leading-snug">
                    {eventCode}
                  </div>
                </div>

                {/* Center: Red Ribbon Seal (一期一会) */}
                <div className="flex flex-col items-center justify-center relative">
                  {/* Decorative golden cloud lines flanking seal */}
                  <svg viewBox="0 0 160 50" className="w-28 sm:w-32 absolute -top-1 pointer-events-none z-0" fill="none">
                    <path d="M 8 25 C 20 18, 35 32, 48 25" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M 112 25 C 125 18, 140 32, 152 25" stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>

                  {/* Ribbon tails hanging below */}
                  <div className="absolute -bottom-2.5 flex justify-center gap-1.5 z-0">
                    <div
                      className="w-3.5 h-5 bg-[#881316]"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                        transform: 'rotate(-12deg)'
                      }}
                    />
                    <div
                      className="w-3.5 h-5 bg-[#881316]"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                        transform: 'rotate(12deg)'
                      }}
                    />
                  </div>

                  {/* Circular Medallion */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative z-10 select-none shadow-md"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)',
                      boxShadow: '0 0 0 2px #d4af37, 0 3px 6px rgba(0,0,0,0.25)'
                    }}
                    title="一期一会 (Ichigo Ichie: Treasure Every Meeting)"
                  >
                    <div className="w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full border border-dashed border-[#fef08a] flex flex-col items-center justify-center">
                      <span className="text-[6px] sm:text-[7px] leading-none mb-0.5">🌸</span>
                      <span className="font-serif font-black text-[9px] sm:text-[10px] text-white tracking-widest leading-none">
                        一期
                      </span>
                      <span className="font-serif font-black text-[9px] sm:text-[10px] text-white tracking-widest leading-none mt-0.5">
                        一会
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: QR Code & SCAN TO PLAY */}
                <div className="flex flex-col items-end">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white border border-[#d6ba78] rounded p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
                    {qrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={qrDataUrl}
                        alt="Scan to Play"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs">📱</span>
                    )}
                  </div>
                  <span className="text-[7.5px] sm:text-[8.5px] font-black text-[#523f3a] tracking-[0.14em] uppercase mt-0.5 font-sans">
                    SCAN TO PLAY
                  </span>
                </div>
              </div>

              {/* 6. BOTTOM FOOTER TEXT */}
              <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[9.5px] text-[#6b5852] font-serif italic text-center mt-2 tracking-wide">
                <span className="text-[9px]">🌸</span>
                <span>Japanese Language Festival · Nihongo Education</span>
                <span className="text-[9px]">🌸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportSuccess && (
          <div className="mt-2.5 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce">
            {exportSuccess}
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNLOAD ACTION BUTTONS (PNG & PDF)                          */}
        {/* ============================================================ */}
        <div className="w-full mt-3 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting !== null}
            className="w-full flex-1 py-3 px-4 rounded-xl bg-[#c5221f] hover:bg-[#a51d1a] disabled:opacity-50 text-white font-black text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🖼️</span>
            <span>{isExporting === 'png' ? 'Generating PNG...' : 'Download PNG'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting !== null}
            className="w-full flex-1 py-3 px-4 rounded-xl bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50 text-stone-800 dark:text-white font-black text-sm border-2 border-amber-300 dark:border-amber-600 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📄</span>
            <span>{isExporting === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold text-stone-300">
          <button
            onClick={onClose}
            className="hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
          >
            ‹ Close Certificate
          </button>
          <span className="opacity-40">•</span>
          <Link
            href="/"
            onClick={onClose}
            className="hover:text-white underline underline-offset-4 cursor-pointer transition-colors flex items-center gap-1.5 text-rose-300 hover:text-rose-200"
          >
            <span>🏠</span>
            <span>Back to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
