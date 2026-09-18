'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryEmoji?: string;
  score: number;
  totalQuestions: number;
  accuracyPercentage: number;
  initialPlayerName?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  categoryName,
  categoryEmoji = '🌸',
  score,
  totalQuestions,
  accuracyPercentage,
  initialPlayerName = 'TWTS'
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
      if (stored && stored.trim()) {
        setPlayerName(stored.trim());
      }
    }
  }, []);

  // Generate QR Code for "SCAN TO PLAY"
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const playUrl = window.location.origin;
      QRCode.toDataURL(playUrl, {
        margin: 1,
        width: 120,
        color: {
          dark: '#3b1812',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, []);

  if (!isOpen) return null;

  // Format today's date, e.g. "19 September 2026"
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Dynamic Japanese Rank based on accuracy
  let rankEnglish = 'High Scorer';
  let rankJapanese = '高得点';
  if (accuracyPercentage === 100) {
    rankEnglish = 'Samurai Master';
    rankJapanese = '免許皆伝';
  } else if (accuracyPercentage >= 80) {
    rankEnglish = 'Gold Shogun';
    rankJapanese = '将軍';
  } else if (accuracyPercentage >= 60) {
    rankEnglish = 'Ninja Warrior';
    rankJapanese = '忍び';
  }

  // Points earned (score * 20)
  const pointsEarned = score * 20;

  // Download high-resolution PNG
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      setIsExporting('png');
      setExportSuccess('');

      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#fefdfb',
        cacheBust: true
      });

      const link = document.createElement('a');
      link.download = `Nihongo_Certificate_${playerName.replace(/\s+/g, '_')}_${categoryName}.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccess('PNG downloaded successfully! 🌸');
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
        pixelRatio: 2.5,
        backgroundColor: '#fefdfb',
        cacheBust: true
      });

      const certWidth = certificateRef.current.offsetWidth;
      const certHeight = certificateRef.current.offsetHeight;

      // Create PDF in portrait matching certificate aspect ratio
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [certWidth * 1.5, certHeight * 1.5]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, certWidth * 1.5, certHeight * 1.5);
      pdf.save(`Nihongo_Certificate_${playerName.replace(/\s+/g, '_')}_${categoryName}.pdf`);

      setExportSuccess('PDF downloaded successfully! ⛩️');
      setTimeout(() => setExportSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="max-w-xl w-full my-auto flex flex-col items-center">
        
        {/* Name Customization Strip */}
        <div className="w-full bg-white dark:bg-stone-900 border border-amber-200 dark:border-white/10 rounded-2xl p-3 mb-3 shadow-md flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-base">✍️</span>
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
                className="px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-600 bg-rose-50/40 dark:bg-stone-800 text-stone-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-red-400 flex-1 min-w-[120px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-black text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer text-left truncate"
                title="Click to edit name"
              >
                <span>{playerName || 'Click to enter name'}</span>
                <span className="text-xs text-stone-400 font-normal">✎</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ============================================================ */}
        {/* CERTIFICATE CANVAS CONTAINER (Captured for PNG/PDF Export)   */}
        {/* ============================================================ */}
        <div
          ref={certificateRef}
          className="w-full bg-[#fefdfb] text-stone-900 rounded-2xl border-[3px] border-[#c59b27] p-3 sm:p-4 shadow-2xl relative select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 250, 240, 0.95), #fefdfb)`
          }}
        >
          {/* Inner Golden Margin Frame */}
          <div className="border border-[#d4af37]/70 rounded-xl p-4 sm:p-6 relative flex flex-col items-center text-center">
            
            {/* Corner Sakura Blossoms (🌸) */}
            <div className="absolute top-2 left-2 text-xl sm:text-2xl select-none leading-none opacity-90">🌸</div>
            <div className="absolute top-2 right-2 text-xl sm:text-2xl select-none leading-none opacity-90">🌸</div>
            <div className="absolute bottom-2 left-2 text-xl sm:text-2xl select-none leading-none opacity-90">🌸</div>
            <div className="absolute bottom-2 right-2 text-xl sm:text-2xl select-none leading-none opacity-90">🌸</div>

            {/* Traditional Torii Gate Emblem */}
            <div className="mt-1 mb-2">
              <svg viewBox="0 0 100 75" className="w-12 h-9 sm:w-14 sm:h-10 mx-auto" fill="none">
                {/* Upper curved torii beam */}
                <path d="M5 14 C25 8, 75 8, 95 14 L93 21 C75 16, 25 16, 7 21 Z" fill="#b91c1c" />
                {/* Lower straight beam */}
                <path d="M12 25 L88 25 L86 30 L14 30 Z" fill="#1c1917" />
                {/* Left Pillar */}
                <path d="M28 14 L24 74 L32 74 L35 14 Z" fill="#b91c1c" />
                {/* Right Pillar */}
                <path d="M72 14 L76 74 L68 74 L65 14 Z" fill="#b91c1c" />
                {/* Center Tablet (Gakuzuka) */}
                <path d="M45 25 L55 25 L55 42 L45 42 Z" fill="#1c1917" />
              </svg>
            </div>

            {/* Certificate Header Title */}
            <h2 className="text-xs sm:text-sm font-serif font-black tracking-[0.25em] text-[#7a1818] uppercase">
              CERTIFICATE OF ACHIEVEMENT
            </h2>

            {/* Red Ornamental Tapered Divider with Diamond */}
            <div className="flex items-center justify-center gap-1.5 w-44 mx-auto my-1.5 opacity-80">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#8b1d1d]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#8b1d1d]" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#8b1d1d]" />
            </div>

            {/* Subtitle / Rank */}
            <p className="text-xs font-bold text-[#8b1d1d] tracking-wider mb-2">
              {rankEnglish} — {rankJapanese}
            </p>

            {/* Attestation Prefix */}
            <p className="font-serif italic text-xs text-stone-500 mb-0.5">
              This certifies that
            </p>

            {/* Recipient Name in Traditional Serif */}
            <div className="my-1 w-full max-w-sm">
              <div className="font-serif font-black text-2xl sm:text-3xl text-[#2b1810] tracking-wide uppercase px-2 py-0.5 break-words">
                {playerName || 'Samurai Learner'}
              </div>
              <div className="border-b-2 border-dotted border-[#3b1812]/50 w-3/4 mx-auto mt-1" />
            </div>

            {/* Attestation Body */}
            <p className="text-[11px] sm:text-xs text-stone-600 font-medium leading-relaxed max-w-sm mt-1 mb-1">
              has successfully completed the Nihongo Education interactive Japanese learning quiz on
            </p>

            {/* Category Pill / Badge */}
            <div className="inline-flex items-center gap-1.5 font-black text-sm sm:text-base text-[#8b1d1d] mb-3">
              <span>{categoryEmoji}</span>
              <span>{categoryName}</span>
            </div>

            {/* Final Score Box */}
            <div className="w-full max-w-[240px] bg-[#fff1f2] border border-[#fecdd3] rounded-2xl py-2 px-4 shadow-2xs mb-2">
              <div className="text-[9px] font-black tracking-widest uppercase text-stone-500">
                FINAL SCORE
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#8b1d1d] leading-tight">
                {pointsEarned}
              </div>
            </div>

            {/* Award Badges Row */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] shadow-2xs">
                <span>⭐</span> {rankEnglish}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] shadow-2xs">
                <span>🎌</span> Nihongo Player
              </span>
            </div>

            {/* Bottom Row: Date / Event, Japanese Hanko Seal, QR Code */}
            <div className="w-full grid grid-cols-3 items-center pt-2 border-t border-stone-200/80">
              {/* Left Column: Date & Event */}
              <div className="text-left space-y-0.5">
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                  DATE
                </div>
                <div className="text-[10px] sm:text-[11px] font-extrabold text-stone-700 leading-tight">
                  {formattedDate}
                </div>
                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider pt-0.5">
                  EVENT
                </div>
                <div className="text-[10px] sm:text-[11px] font-extrabold text-stone-700 leading-tight">
                  UHB10802
                </div>
              </div>

              {/* Center Column: Traditional Japanese Hanko Inkan Seal (一期一会) */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#c5221f] text-white flex flex-col items-center justify-center shadow-xs border-2 border-[#a51d1a] select-none transform -rotate-3 hover:rotate-0 transition-transform">
                  <span className="font-serif font-black text-[11px] sm:text-xs tracking-widest leading-none">
                    一期
                  </span>
                  <span className="font-serif font-black text-[11px] sm:text-xs tracking-widest leading-none mt-0.5">
                    一会
                  </span>
                </div>
              </div>

              {/* Right Column: QR Code */}
              <div className="flex flex-col items-end">
                <div className="w-13 h-13 sm:w-15 sm:h-15 bg-white border border-stone-300 rounded p-0.5 flex items-center justify-center shadow-2xs overflow-hidden">
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
                <span className="text-[8px] sm:text-[9px] font-black text-stone-500 tracking-wider mt-0.5">
                  SCAN TO PLAY
                </span>
              </div>
            </div>

            {/* Bottom Fine Print */}
            <div className="text-[8px] sm:text-[9px] text-stone-400 italic mt-3 font-serif">
              Japanese Language Festival · Nihongo Education
            </div>

          </div>
        </div>

        {/* Notification Toast */}
        {exportSuccess && (
          <div className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce">
            {exportSuccess}
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNLOAD ACTION BUTTONS (Choice of PNG or PDF)              */}
        {/* ============================================================ */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting !== null}
            className="w-full flex-1 py-3.5 px-4 rounded-2xl bg-[#c5221f] hover:bg-[#a51d1a] disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🖼️</span>
            <span>{isExporting === 'png' ? 'Generating PNG...' : 'Download PNG'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting !== null}
            className="w-full flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50 text-stone-800 dark:text-white font-black text-sm sm:text-base border-2 border-amber-300 dark:border-amber-600 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📄</span>
            <span>{isExporting === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="mt-3 text-xs sm:text-sm font-bold text-stone-300 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
        >
          ‹ Back to Results
        </button>

      </div>
    </div>
  );
}
