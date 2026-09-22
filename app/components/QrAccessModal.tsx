'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
}

export default function QrAccessModal({
  isOpen,
  onClose,
  url = 'https://nihongo.shan0h.my.id'
}: QrAccessModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 2,
      width: 320,
      color: {
        dark: '#1e1412',
        light: '#ffffff'
      }
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, [url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'Nihongo_Access_QR_nihongo.shan0h.my.id.png';
    a.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#18151a] border-2 border-rose-200 dark:border-white/10 rounded-[2.25rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-scale-in text-center relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-rose-500/15 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-rose-100 text-stone-500 hover:text-red-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          title="Close"
        >
          ✕
        </button>

        {/* Header Emblem */}
        <div className="text-4xl mb-2 select-none animate-bounce">📱</div>

        <h3 className="text-xl font-black text-stone-900 dark:text-white leading-tight">
          Scan to Play on Mobile
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-5">
          Open your phone camera to access Nihongo Education instantly
        </p>

        {/* Center QR Code Container */}
        <div className="mx-auto w-56 h-56 bg-white p-3 rounded-2xl border-2 border-amber-300 dark:border-amber-500/60 shadow-lg flex items-center justify-center relative overflow-hidden group">
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Scan QR to access nihongo.shan0h.my.id"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="animate-pulse text-sm text-stone-400 font-bold">
              Generating QR...
            </div>
          )}
        </div>

        {/* Target URL Pill with Copy */}
        <div className="mt-4 flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-rose-50/80 dark:bg-stone-800/80 border border-rose-200/80 dark:border-white/10 text-xs font-mono">
          <span className="font-bold text-[#c5221f] dark:text-rose-400 truncate">
            {url.replace(/^https?:\/\//, '')}
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-white font-sans font-bold text-[11px] shadow-2xs hover:bg-rose-100 dark:hover:bg-stone-600 transition-colors cursor-pointer shrink-0"
          >
            {copied ? 'Copied! ✓' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📥</span>
            <span>Save QR Image</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#c5221f] hover:bg-[#a51d1a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Done</span>
          </button>
        </div>

        {/* Footer Tagline */}
        <div className="mt-4 text-[10px] text-stone-400 dark:text-stone-500 font-medium tracking-wide">
          Japanese Communication · UHB10802
        </div>
      </div>
    </div>
  );
}
