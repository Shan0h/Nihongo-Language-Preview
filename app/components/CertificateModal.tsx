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
  initialPlayerName = 'Your Name',
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
      } else if (initialPlayerName && initialPlayerName !== 'Your Name') {
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
          dark: '#3b1414',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, []);

  if (!isOpen) return null;

  // Format date matching reference image (e.g. "18 May 2026")
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
  const displayScore = totalPoints !== undefined 
    ? totalPoints 
    : (score > 0 ? (score * 20 > 400 ? score * 20 : 470) : 470);

  // Download high-resolution PNG (3x pixel ratio for print clarity)
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      setIsExporting('png');
      setExportSuccess('');

      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 3,
        backgroundColor: '#fbf8f2',
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
        backgroundColor: '#fbf8f2',
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
                <span className="truncate">{playerName || 'Your Name'}</span>
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
        {/* CERTIFICATE CANVAS (Pixel-perfect matching reference image)  */}
        {/* ============================================================ */}
        <div
          ref={certificateRef}
          className="w-full bg-[#fbf8f2] text-[#2b1810] shadow-2xl relative select-none overflow-hidden rounded-xl border border-[#d6ba78]/60"
          style={{
            aspectRatio: '1 / 1.414', // Standard ISO 216 / A-Series ratio
            backgroundImage: `
              radial-gradient(ellipse at 50% 30%, #ffffff 0%, #fcfaf5 60%, #f6efe2 100%)
            `,
            fontFamily: `var(--font-cinzel), 'Times New Roman', Georgia, serif`
          }}
        >
          {/* ================= BACKGROUND ARTWORK LAYERS ================= */}

          {/* 1. Subtle Japanese Geometric Watermark Patterns (Asanoha / Shippo in corners) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.09]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cert-asanoha" width="48" height="83.14" patternUnits="userSpaceOnUse">
                <path d="M24 0 L48 41.57 L24 83.14 L0 41.57 Z" fill="none" stroke="#966a1a" strokeWidth="1" />
                <path d="M0 0 L48 83.14 M48 0 L0 83.14 M0 41.57 L48 41.57" stroke="#966a1a" strokeWidth="0.75" />
                <circle cx="24" cy="41.57" r="14" fill="none" stroke="#966a1a" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="cloud-gold-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e3c78d" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#d1a95e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e3c78d" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cert-asanoha)" />
          </svg>

          {/* 2. Floating Japanese Golden Clouds (Ebigasumi) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top-mid left cloud ribbon */}
            <div className="absolute top-[18%] -left-6 w-36 h-6 rounded-full bg-gradient-to-r from-amber-200/40 via-amber-300/30 to-transparent blur-[1px]" />
            <div className="absolute top-[20%] -left-3 w-28 h-5 rounded-full bg-gradient-to-r from-amber-200/50 via-amber-300/35 to-transparent blur-[1px]" />
            
            {/* Mid right cloud ribbon */}
            <div className="absolute top-[32%] -right-8 w-44 h-6 rounded-full bg-gradient-to-l from-amber-200/40 via-amber-300/30 to-transparent blur-[1px]" />
            <div className="absolute top-[34%] -right-4 w-32 h-5 rounded-full bg-gradient-to-l from-amber-200/50 via-amber-300/35 to-transparent blur-[1px]" />

            {/* Lower-mid right cloud ribbon (near Mt. Fuji) */}
            <div className="absolute bottom-[24%] right-4 w-36 h-6 rounded-full bg-gradient-to-l from-amber-200/45 via-amber-300/30 to-transparent blur-[1px]" />
            <div className="absolute bottom-[22%] right-10 w-24 h-4 rounded-full bg-gradient-to-l from-amber-200/40 via-amber-300/25 to-transparent blur-[1px]" />
          </div>

          {/* 3. Falling Sakura Petals drifting gently across canvas */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {/* Petal 1 */}
            <div className="absolute top-[17%] left-[10%] w-3 h-4 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-70 transform rotate-45" style={{ borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
            {/* Petal 2 */}
            <div className="absolute top-[23%] left-[18%] w-2.5 h-3.5 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-60 transform -rotate-12" style={{ borderRadius: '50% 50% 70% 30% / 60% 40% 60% 40%' }} />
            {/* Petal 3 */}
            <div className="absolute top-[18%] right-[16%] w-3.5 h-4.5 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-70 transform rotate-12" style={{ borderRadius: '70% 30% 60% 40% / 50% 60% 40% 50%' }} />
            {/* Petal 4 */}
            <div className="absolute top-[44%] right-[11%] w-2.5 h-3 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-65 transform -rotate-45" style={{ borderRadius: '60% 40% 70% 30% / 50% 50% 50% 50%' }} />
            {/* Petal 5 */}
            <div className="absolute bottom-[36%] left-[10%] w-3 h-4 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-70 transform rotate-30" style={{ borderRadius: '50% 50% 70% 30% / 60% 40% 60% 40%' }} />
            {/* Petal 6 */}
            <div className="absolute bottom-[20%] left-[16%] w-2.5 h-3.5 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-70 transform -rotate-25" style={{ borderRadius: '70% 30% 60% 40% / 50% 60% 40% 50%' }} />
            {/* Petal 7 */}
            <div className="absolute bottom-[24%] right-[22%] w-3 h-4 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full opacity-60 transform rotate-75" style={{ borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
          </div>

          {/* 4. Top-Left Realistic Sakura Branch SVG */}
          <div className="absolute -top-1 -left-1 w-44 sm:w-52 h-44 sm:h-52 pointer-events-none z-10">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main wooden branch */}
              <path d="M -10 20 C 30 15, 60 40, 95 35 C 120 32, 140 50, 165 42" stroke="#5c3826" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 60 40 C 75 55, 90 70, 115 80" stroke="#5c3826" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 95 35 C 105 18, 125 15, 140 10" stroke="#5c3826" strokeWidth="2" strokeLinecap="round" />
              <path d="M 30 18 C 35 30, 42 45, 48 58" stroke="#5c3826" strokeWidth="2" strokeLinecap="round" />

              {/* Little leaves / green buds */}
              <ellipse cx="142" cy="8" rx="4" ry="2" transform="rotate(-30 142 8)" fill="#849b5c" />
              <ellipse cx="118" cy="82" rx="4" ry="2" transform="rotate(40 118 82)" fill="#849b5c" />
              <ellipse cx="168" cy="41" rx="4" ry="2" transform="rotate(-15 168 41)" fill="#849b5c" />

              {/* Flower 1 (top mid) */}
              <g transform="translate(100, 32)">
                <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="9" cy="-3" rx="6" ry="9" transform="rotate(72 9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="6" cy="8" rx="6" ry="9" transform="rotate(144 6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-6" cy="8" rx="6" ry="9" transform="rotate(216 -6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-9" cy="-3" rx="6" ry="9" transform="rotate(288 -9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="3" fill="#ec4899" />
                <circle cx="0" cy="0" r="1.5" fill="#facc15" />
              </g>

              {/* Flower 2 (left large) */}
              <g transform="translate(48, 48) scale(1.15)">
                <ellipse cx="0" cy="-11" rx="7" ry="10" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="10" cy="-4" rx="7" ry="10" transform="rotate(72 10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="7" cy="9" rx="7" ry="10" transform="rotate(144 7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-7" cy="9" rx="7" ry="10" transform="rotate(216 -7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-10" cy="-4" rx="7" ry="10" transform="rotate(288 -10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <circle cx="0" cy="0" r="3.5" fill="#db2777" />
                <circle cx="0" cy="0" r="1.5" fill="#eab308" />
              </g>

              {/* Flower 3 (lower twig) */}
              <g transform="translate(112, 78) scale(0.9)">
                <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="9" cy="-3" rx="6" ry="9" transform="rotate(72 9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="6" cy="8" rx="6" ry="9" transform="rotate(144 6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-6" cy="8" rx="6" ry="9" transform="rotate(216 -6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-9" cy="-3" rx="6" ry="9" transform="rotate(288 -9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="2.8" fill="#ec4899" />
                <circle cx="0" cy="0" r="1.2" fill="#facc15" />
              </g>

              {/* Flower 4 (far tip) */}
              <g transform="translate(160, 42) scale(0.8)">
                <ellipse cx="0" cy="-9" rx="5" ry="8" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="8" cy="-3" rx="5" ry="8" transform="rotate(72 8 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="5" cy="7" rx="5" ry="8" transform="rotate(144 5 7)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-5" cy="7" rx="5" ry="8" transform="rotate(216 -5 7)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-8" cy="-3" rx="5" ry="8" transform="rotate(288 -8 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="2.5" fill="#ec4899" />
                <circle cx="0" cy="0" r="1" fill="#facc15" />
              </g>

              {/* Buds */}
              <ellipse cx="78" cy="22" rx="4" ry="6" transform="rotate(25 78 22)" fill="#f472b6" />
              <ellipse cx="128" cy="18" rx="3.5" ry="5.5" transform="rotate(-35 128 18)" fill="#f472b6" />
            </svg>
          </div>

          {/* 5. Top-Right Realistic Sakura Branch SVG */}
          <div className="absolute -top-1 -right-1 w-44 sm:w-52 h-44 sm:h-52 pointer-events-none z-10">
            <svg viewBox="0 0 200 200" className="w-full h-full transform scale-x-[-1]" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main wooden branch */}
              <path d="M -10 20 C 30 15, 60 40, 95 35 C 120 32, 140 50, 165 42" stroke="#5c3826" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 60 40 C 75 55, 90 70, 115 80" stroke="#5c3826" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 95 35 C 105 18, 125 15, 140 10" stroke="#5c3826" strokeWidth="2" strokeLinecap="round" />

              {/* Little leaves / green buds */}
              <ellipse cx="142" cy="8" rx="4" ry="2" transform="rotate(-30 142 8)" fill="#849b5c" />
              <ellipse cx="118" cy="82" rx="4" ry="2" transform="rotate(40 118 82)" fill="#849b5c" />

              {/* Flower 1 */}
              <g transform="translate(100, 32)">
                <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="9" cy="-3" rx="6" ry="9" transform="rotate(72 9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="6" cy="8" rx="6" ry="9" transform="rotate(144 6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-6" cy="8" rx="6" ry="9" transform="rotate(216 -6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-9" cy="-3" rx="6" ry="9" transform="rotate(288 -9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="3" fill="#ec4899" />
                <circle cx="0" cy="0" r="1.5" fill="#facc15" />
              </g>

              {/* Flower 2 */}
              <g transform="translate(50, 46) scale(1.1)">
                <ellipse cx="0" cy="-11" rx="7" ry="10" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="10" cy="-4" rx="7" ry="10" transform="rotate(72 10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="7" cy="9" rx="7" ry="10" transform="rotate(144 7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-7" cy="9" rx="7" ry="10" transform="rotate(216 -7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-10" cy="-4" rx="7" ry="10" transform="rotate(288 -10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <circle cx="0" cy="0" r="3.5" fill="#db2777" />
                <circle cx="0" cy="0" r="1.5" fill="#eab308" />
              </g>

              {/* Flower 3 */}
              <g transform="translate(145, 42) scale(0.85)">
                <ellipse cx="0" cy="-9" rx="5" ry="8" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="8" cy="-3" rx="5" ry="8" transform="rotate(72 8 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="5" cy="7" rx="5" ry="8" transform="rotate(144 5 7)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-5" cy="7" rx="5" ry="8" transform="rotate(216 -5 7)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-8" cy="-3" rx="5" ry="8" transform="rotate(288 -8 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="2.5" fill="#ec4899" />
                <circle cx="0" cy="0" r="1" fill="#facc15" />
              </g>
            </svg>
          </div>

          {/* 6. Mount Fuji Silhouette (Bottom Right) */}
          <div className="absolute bottom-0 right-0 w-44 sm:w-52 h-24 sm:h-30 pointer-events-none z-10 opacity-75">
            <svg viewBox="0 0 240 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Subtle gold fog at base */}
              <ellipse cx="140" cy="155" rx="90" ry="25" fill="#f2e2be" opacity="0.4" />
              
              {/* Mt. Fuji Mountain Body */}
              <polygon points="150,55 40,175 235,175" fill="#997b66" opacity="0.65" />
              
              {/* Mt. Fuji Snow Cap */}
              <path
                d="M 150 55 L 125 90 C 130 95, 135 90, 140 98 C 145 92, 150 96, 155 92 C 160 100, 165 92, 172 90 Z"
                fill="#ffffff"
                opacity="0.95"
              />
              {/* Snow flutes radiating down */}
              <path d="M 140 98 L 138 115" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M 152 94 L 152 120" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              <path d="M 162 96 L 165 114" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              
              {/* Floating stylized gold cloud over Fuji base */}
              <path
                d="M 60 148 C 75 142, 95 142, 110 148 C 120 144, 140 144, 150 148 C 165 142, 190 144, 205 148 L 205 156 L 60 156 Z"
                fill="#e4caa0"
                opacity="0.75"
              />
            </svg>
          </div>

          {/* 7. Bottom Imperial Lacquer Crimson Waves with Gold Trim (Tucked cleanly in corner, never covers text) */}
          <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-14 sm:h-18 pointer-events-none z-10">
            <svg viewBox="0 0 160 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Deep Crimson Outer Wave */}
              <path
                d="M -5 85 L -5 45 C 15 35, 45 42, 70 58 C 95 72, 120 78, 150 80 L 150 85 Z"
                fill="#781116"
              />
              {/* Middle Vermilion Wave */}
              <path
                d="M -5 85 L -5 55 C 12 47, 38 52, 60 65 C 80 75, 105 80, 130 85 Z"
                fill="#94191f"
              />
              {/* Golden Wave Trim Lines */}
              <path
                d="M -5 45 C 15 35, 45 42, 70 58 C 95 72, 120 78, 150 80"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M -5 55 C 12 47, 38 52, 60 65 C 80 75, 105 80, 130 85"
                stroke="#f3d078"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Cherry Blossom Cluster on bottom left wave */}
              <g transform="translate(22, 60) scale(0.75)">
                <ellipse cx="0" cy="-11" rx="7" ry="10" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="10" cy="-4" rx="7" ry="10" transform="rotate(72 10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="7" cy="9" rx="7" ry="10" transform="rotate(144 7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-7" cy="9" rx="7" ry="10" transform="rotate(216 -7 9)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <ellipse cx="-10" cy="-4" rx="7" ry="10" transform="rotate(288 -10 -4)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.6" />
                <circle cx="0" cy="0" r="3.5" fill="#db2777" />
                <circle cx="0" cy="0" r="1.5" fill="#facc15" />
              </g>

              <g transform="translate(50, 68) scale(0.6)">
                <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="9" cy="-3" rx="6" ry="9" transform="rotate(72 9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="6" cy="8" rx="6" ry="9" transform="rotate(144 6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-6" cy="8" rx="6" ry="9" transform="rotate(216 -6 8)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <ellipse cx="-9" cy="-3" rx="6" ry="9" transform="rotate(288 -9 -3)" fill="#fdf2f4" stroke="#f472b6" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="2.8" fill="#ec4899" />
                <circle cx="0" cy="0" r="1.2" fill="#facc15" />
              </g>

              {/* Floating bottom petal */}
              <ellipse cx="80" cy="72" rx="4" ry="6" transform="rotate(45 80 72)" fill="#fbcfe8" opacity="0.9" />
            </svg>
          </div>

          {/* Right Bottom Crimson Wave Flourish */}
          <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-14 sm:h-18 pointer-events-none z-10">
            <svg viewBox="0 0 160 80" className="w-full h-full transform scale-x-[-1]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M -5 85 L -5 45 C 15 35, 45 42, 70 58 C 95 72, 120 78, 150 80 L 150 85 Z"
                fill="#781116"
              />
              <path
                d="M -5 45 C 15 35, 45 42, 70 58 C 95 72, 120 78, 150 80"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          {/* 8. Dual Gold Borders with Sayagata / Greek-Key Geometric Corner Accents */}
          <div className="absolute inset-2 sm:inset-3 border border-[#b88c38]/70 pointer-events-none z-20">
            {/* Inner Gold Hairline Frame */}
            <div className="absolute inset-1 sm:inset-1.5 border border-[#dfc282]/80 pointer-events-none" />

            {/* Corner Sayagata / Key Fretwork Ornaments */}
            {/* Top-Left Corner Ornament */}
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#b88c38] pointer-events-none">
              <div className="w-2 h-2 border-t-2 border-l-2 border-[#b88c38] m-0.5" />
            </div>
            {/* Top-Right Corner Ornament */}
            <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-[#b88c38] pointer-events-none">
              <div className="w-2 h-2 border-t-2 border-r-2 border-[#b88c38] m-0.5 ml-auto" />
            </div>
            {/* Bottom-Left Corner Ornament */}
            <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-[#b88c38] pointer-events-none">
              <div className="w-2 h-2 border-b-2 border-l-2 border-[#b88c38] m-0.5 mt-auto" />
            </div>
            {/* Bottom-Right Corner Ornament */}
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#b88c38] pointer-events-none">
              <div className="w-2 h-2 border-b-2 border-r-2 border-[#b88c38] m-0.5 ml-auto mt-auto" />
            </div>
          </div>


          {/* ================= CERTIFICATE INNER CONTENT ================= */}
          <div className="relative z-20 h-full flex flex-col justify-between items-center text-center px-4 sm:px-8 py-5 sm:py-7">

            {/* SECTION 1: TORII EMBLEM & HEADER TITLE */}
            <div className="flex flex-col items-center w-full">
              
              {/* Torii Gate with Glowing Sun Emblem */}
              <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex items-center justify-center">
                {/* Glowing Golden Rising Sun Crest */}
                <div
                  className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full -top-1"
                  style={{
                    background: 'radial-gradient(circle, #fcebc7 20%, #edd39f 60%, rgba(237, 211, 159, 0) 100%)'
                  }}
                />
                
                {/* Traditional Japanese Cloud Band flanking the sun */}
                <div className="absolute w-20 h-2 bg-gradient-to-r from-transparent via-[#d6b77a]/50 to-transparent rounded-full top-3" />

                {/* Torii Shrine Gate SVG */}
                <svg viewBox="0 0 100 80" className="w-14 h-12 sm:w-16 sm:h-14 relative z-10" fill="none">
                  {/* Top curved Kasagi lintel beam (Vermilion with black roof cap) */}
                  <path d="M4 16 C 25 10, 75 10, 96 16 L 94 22 C 75 17, 25 17, 6 22 Z" fill="#b91c1c" />
                  <path d="M4 16 C 25 10, 75 10, 96 16 L 94 18 C 75 12, 25 12, 6 18 Z" fill="#1c1917" />
                  
                  {/* Lower straight Shimaki beam */}
                  <path d="M 12 25 L 88 25 L 86 30 L 14 30 Z" fill="#1c1917" />
                  
                  {/* Center Tablet (Gakuzuka) */}
                  <rect x="46" y="24" width="8" height="18" fill="#1c1917" rx="0.5" />
                  
                  {/* Secondary horizontal beam (Nuki) */}
                  <rect x="18" y="38" width="64" height="4.5" fill="#b91c1c" />
                  
                  {/* Left Pillar */}
                  <path d="M 28 17 L 24 74 L 32 74 L 34 17 Z" fill="#b91c1c" />
                  {/* Left Pillar Stone Base (Kamebara) */}
                  <rect x="22" y="73" width="12" height="4" fill="#1c1917" rx="1" />

                  {/* Right Pillar */}
                  <path d="M 72 17 L 76 74 L 68 74 L 66 17 Z" fill="#b91c1c" />
                  {/* Right Pillar Stone Base (Kamebara) */}
                  <rect x="66" y="73" width="12" height="4" fill="#1c1917" rx="1" />
                </svg>
              </div>

              {/* Main Certificate Title */}
              <h1 className="text-base sm:text-lg md:text-[21px] font-black tracking-[0.16em] sm:tracking-[0.18em] text-[#3e1010] uppercase mt-1 leading-tight font-serif">
                CERTIFICATE OF ACHIEVEMENT
              </h1>

              {/* Traditional Mizuhiki Knot Divider */}
              <div className="flex items-center justify-center gap-2 w-48 sm:w-60 my-1 opacity-85">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b58c3f] to-[#b58c3f]" />
                {/* Traditional Japanese Mizuhiki Knot Ornament */}
                <div className="w-3.5 h-3.5 rotate-45 border border-[#a87d2b] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#a87d2b]" />
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#b58c3f] to-[#b58c3f]" />
              </div>

              {/* Subtitle / Japanese Rank */}
              <p className="text-[11px] sm:text-xs font-bold text-[#741c1c] tracking-[0.14em] uppercase font-serif">
                {rankEnglish} — {rankJapanese}
              </p>
            </div>


            {/* SECTION 2: RECIPIENT NAME & ATTESTATION BODY */}
            <div className="flex flex-col items-center w-full max-w-md my-1">
              
              {/* Attestation Prefix */}
              <p className="font-serif italic text-xs sm:text-sm text-[#4b3c38] mb-1">
                This certifies that
              </p>

              {/* Grand Recipient Name */}
              <div className="font-serif font-black text-2xl sm:text-3xl md:text-[34px] text-[#711616] tracking-wide px-3 py-0.5 leading-tight break-words max-w-full drop-shadow-2xs">
                {playerName || 'Your Name'}
              </div>

              {/* Center Sakura Floral Crest Divider */}
              <div className="my-1.5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#ba8a38] fill-current" opacity="0.9">
                  <path d="M12 2 C13 5, 15 7, 18 7 C 18 10, 16 12, 18 15 C 15 15, 13 17, 12 20 C 11 17, 9 15, 6 15 C 8 12, 6 10, 6 7 C 9 7, 11 5, 12 2 Z" />
                  <circle cx="12" cy="11" r="2" fill="#711616" />
                </svg>
              </div>

              {/* Attestation Text specifically including NIHONGO EDUCATION */}
              <p className="text-[11px] sm:text-xs text-[#3a2c28] font-medium leading-relaxed max-w-xs sm:max-w-sm">
                has successfully completed the <span className="font-bold text-[#621616]">Nihongo Education</span> interactive Japanese learning quiz on
              </p>

              {/* Topic / Category Line */}
              <div className="inline-flex items-center gap-2 font-serif font-black text-sm sm:text-base text-[#381010] mt-1 mb-1">
                <span className="text-base sm:text-lg">📚</span>
                <span className="tracking-wide">{categoryName}</span>
              </div>
            </div>


            {/* SECTION 3: SIDE-BY-SIDE DUAL METRIC CARDS (FINAL SCORE & RANK) */}
            <div className="w-full max-w-[380px] grid grid-cols-2 gap-2.5 sm:gap-3.5 my-1.5">
              
              {/* CARD 1: FINAL SCORE (Soft Blush Rose Card) */}
              <div
                className="rounded-2xl p-2.5 sm:p-3 border border-[#f0c2c8] shadow-xs flex flex-col items-center text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #fff2f4 0%, #fee4e7 100%)'
                }}
              >
                {/* Header: Sakura Icon + FINAL SCORE */}
                <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black tracking-[0.14em] uppercase text-[#7c1d24]">
                  <span className="text-xs">🌸</span>
                  <span>FINAL SCORE</span>
                </div>

                {/* Subtle Divider Line with Diamond */}
                <div className="flex items-center justify-center gap-1 w-16 my-1 opacity-70">
                  <div className="h-[1px] flex-1 bg-[#d48b94]" />
                  <div className="w-1 h-1 rotate-45 bg-[#7c1d24]" />
                  <div className="h-[1px] flex-1 bg-[#d48b94]" />
                </div>

                {/* Score Number Display */}
                <div className="text-3xl sm:text-4xl font-serif font-black text-[#2e0e11] leading-tight my-0.5">
                  {displayScore}
                </div>
              </div>

              {/* CARD 2: RANK (Soft Warm Champagne Gold Card with Seigaiha wave pattern) */}
              <div
                className="rounded-2xl p-2.5 sm:p-3 border border-[#ebd29a] shadow-xs flex flex-col items-center text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #fffdf7 0%, #fcf3dd 100%)'
                }}
              >
                {/* Subtle Seigaiha Pattern overlay inside Rank Card */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="card-wave" width="20" height="10" patternUnits="userSpaceOnUse">
                      <path d="M0 10a10 10 0 0 1 10-10 10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8 8 8 0 0 0-8 8z" fill="#996515" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#card-wave)" />
                </svg>

                {/* Header: Crown Icon + RANK */}
                <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black tracking-[0.14em] uppercase text-[#735316] relative z-10">
                  <span className="text-xs">👑</span>
                  <span>RANK</span>
                </div>

                {/* Subtle Divider Line with Diamond */}
                <div className="flex items-center justify-center gap-1 w-16 my-1 opacity-70 relative z-10">
                  <div className="h-[1px] flex-1 bg-[#cb9e47]" />
                  <div className="w-1 h-1 rotate-45 bg-[#735316]" />
                  <div className="h-[1px] flex-1 bg-[#cb9e47]" />
                </div>

                {/* Rank Display (e.g. #1/1) */}
                <div className="text-3xl sm:text-4xl font-serif font-black text-[#2e0e11] leading-tight my-0.5 relative z-10">
                  {rank}
                </div>
              </div>

            </div>


            {/* SECTION 4: AWARD BADGES ROW */}
            <div className="flex items-center justify-center gap-2.5 my-1">
              {/* Badge 1: High Scorer */}
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-b from-[#fffaf0] to-[#fbf0d3] text-[#714002] border border-[#e5c685] shadow-2xs font-serif">
                <span className="text-amber-500">⭐</span>
                <span>{rankEnglish}</span>
              </div>

              {/* Badge 2: Nihongo Player */}
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-b from-[#fff5f5] to-[#fde7e7] text-[#7c1d1d] border border-[#f2bebe] shadow-2xs font-serif">
                <span>🎌</span>
                <span>Nihongo Player</span>
              </div>
            </div>


            {/* SECTION 5: VERIFICATION, HANKO SEAL & QR CODE */}
            <div className="w-full pt-1.5">
              
              {/* Thin Ornamental Separator with Knot */}
              <div className="flex items-center justify-center gap-2 w-44 mx-auto mb-2 opacity-75">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b58c3f] to-[#b58c3f]" />
                <div className="w-2.5 h-2.5 rotate-45 border border-[#a87d2b] flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#a87d2b]" />
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#b58c3f] to-[#b58c3f]" />
              </div>

              {/* 3-Column Info Row */}
              <div className="grid grid-cols-3 items-center px-1 sm:px-3">
                
                {/* Left Column: DATE & EVENT */}
                <div className="text-left space-y-0.5 relative z-30">
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#63534e] uppercase tracking-[0.16em] font-sans">
                    DATE
                  </div>
                  <div className="text-xs sm:text-[13px] font-black text-[#140b09] font-serif leading-snug tracking-wide">
                    {formattedDate}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#63534e] uppercase tracking-[0.16em] font-sans pt-1">
                    EVENT
                  </div>
                  <div className="text-xs sm:text-[13px] font-black text-[#140b09] font-serif tracking-widest leading-snug">
                    {eventCode}
                  </div>
                </div>

                {/* Center Column: Traditional Japanese Red Hanko / Inkan Seal (一期一会) */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white flex flex-col items-center justify-center shadow-xs border-[2.5px] border-[#9c1815] select-none transform -rotate-6 hover:rotate-0 transition-transform cursor-default"
                    style={{
                      backgroundColor: '#b82522',
                      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.25), 0 2px 6px rgba(184,37,34,0.3)'
                    }}
                    title="一期一会 (Ichigo Ichie: Once in a Lifetime Encounter)"
                  >
                    <div className="w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full border border-white/60 flex flex-col items-center justify-center">
                      <span className="font-serif font-black text-[10px] sm:text-[11px] tracking-widest leading-none">
                        一期
                      </span>
                      <span className="font-serif font-black text-[10px] sm:text-[11px] tracking-widest leading-none mt-0.5">
                        一会
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: High-DPI QR Code with SCAN TO PLAY */}
                <div className="flex flex-col items-end">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-[#d6ba78] rounded p-0.5 flex items-center justify-center shadow-2xs overflow-hidden">
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
                  <span className="text-[8px] sm:text-[9px] font-black text-[#58413b] tracking-[0.14em] uppercase mt-0.5 font-sans">
                    SCAN TO PLAY
                  </span>
                </div>

              </div>

              {/* Bottom Footer Fine Print */}
              <div className="text-[8px] sm:text-[9px] text-[#78645e] italic font-serif text-center mt-2 tracking-wide">
                Japanese Language Festival · Nihongo Education
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
