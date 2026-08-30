'use client';

import React, { useState } from 'react';

// Icons components - simplified for better performance
const SakuraIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C12.5523 2 13 2.44772 13 3V5.06522C14.8966 5.35304 16.4628 6.62857 17.3696 8.34783C18.2764 10.0671 18.4615 12.0977 17.877 13.9217C17.2925 15.7458 15.9855 17.2168 14.2609 17.9609C12.5363 18.705 10.5573 18.6594 8.87702 17.8326C7.19672 17.0058 5.96648 15.4558 5.5303 13.6304C5.09412 11.805 5.48755 9.82026 6.62857 8.15217C7.76959 6.48408 9.54348 5.25652 11.6 4.69565V3H12ZM11.6 6.52174C9.88043 7.08261 8.43478 8.22609 7.52174 9.73913C6.6087 11.2522 6.26087 13.0217 6.53913 14.7391C6.81739 16.4565 7.69565 18.0109 9.04348 19.087C10.3913 20.163 12.1261 20.6522 13.8913 20.4783C15.6565 20.3043 17.3261 19.4826 18.5652 18.1304C19.8043 16.7783 20.5 15.0217 20.5 13.1304C20.5 11.2391 19.8043 9.48261 18.5652 8.13043C17.3261 6.77826 15.6565 5.95652 13.8913 5.78261C12.1261 5.6087 10.3913 6.09783 9.04348 7.17391C7.69565 8.25 6.81739 9.80435 6.53913 11.5217C6.26087 13.2391 6.6087 15.0087 7.52174 16.5217C8.43478 18.0348 9.88043 19.1783 11.6 19.7391V6.52174Z" />
  </svg>
);

const DarumaIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M30 25C30 18.3726 35.3726 13 42 13H58C64.6274 13 70 18.3726 70 25V55C70 61.6274 64.6274 67 58 67H42C35.3726 67 30 61.6274 30 55V25Z" fill="#DC2626" />
    <circle cx="45" cy="35" r="3" fill="white" />
    <circle cx="55" cy="35" r="3" fill="white" />
    <path d="M45 45H55" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M40 30L48 33" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 30L52 33" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M45 50H55" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="42" cy="42" r="2" fill="#FCA5A5" opacity="0.6" />
    <circle cx="58" cy="42" r="2" fill="#FCA5A5" opacity="0.6" />
  </svg>
);

const WavingHandIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M17 11l-4-4-4 4" />
    <path d="M13 7V3" />
    <path d="M21 13l-4 4-4-4" />
    <path d="M17 17v4" />
    <path d="M7 11l4 4 4-4" />
    <path d="M11 15v4" />
    <path d="M3 13l4 4 4-4" />
    <path d="M7 17v4" />
  </svg>
);

const HeadphonesIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MicrophoneIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const PencilIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrophyIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const CertificateIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CheckeredFlagIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

// Instruction Card Component
interface InstructionCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const InstructionCard = ({ step, icon, title, subtitle }: InstructionCardProps) => (
  <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-[0_8px_25px_rgba(220,38,38,0.25)] dark:hover:shadow-[0_8px_25px_rgba(220,38,38,0.4)] hover:-translate-y-1 hover:border-red-300 dark:hover:border-red-500/50 transition-all duration-300 group cursor-default">
    {/* Step Badge */}
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#d32f2f] text-white flex items-center justify-center font-black text-xs sm:text-sm mb-2 shadow-xs">
      {step}
    </div>

    {/* Icon */}
    <div className="text-[#d32f2f] dark:text-red-400 mb-2">
      {icon}
    </div>

    {/* Content */}
    <h3 className="text-xs sm:text-sm font-black text-[#0f172a] dark:text-white mb-0.5 text-center">
      {title}
    </h3>
    <p className="text-[11px] sm:text-xs text-[#334155] dark:text-slate-200 font-extrabold text-center leading-tight">
      {subtitle}
    </p>
  </div>
);

// Welcome Modal Component
interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onStart }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    if (dontShowAgain) {
      localStorage.setItem('nihongo-hide-welcome', 'true');
    }
    action();
  };

  const instructionCards: InstructionCardProps[] = [
    {
      step: 1,
      icon: <WavingHandIcon />,
      title: "Welcome",
      subtitle: "Tap a topic to begin"
    },
    {
      step: 2,
      icon: <HeadphonesIcon />,
      title: "Listen",
      subtitle: "Hear the Japanese word"
    },
    {
      step: 3,
      icon: <MicrophoneIcon />,
      title: "Practice",
      subtitle: "Repeat it out loud"
    },
    {
      step: 4,
      icon: <PencilIcon />,
      title: "Answer",
      subtitle: "Choose the correct option"
    },
    {
      step: 5,
      icon: <TrophyIcon />,
      title: "Score",
      subtitle: "See your final result"
    },
    {
      step: 6,
      icon: <CertificateIcon />,
      title: "Certificate",
      subtitle: "Save and share!"
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-[#12101f]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(220,38,38,0.15)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Close Button */}
        <button
          onClick={() => handleAction(onClose)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors backdrop-blur-md"
          aria-label="Close modal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-rose-400/90 to-pink-500/80 dark:from-rose-800/90 dark:to-pink-900/90 backdrop-blur-md relative px-6 py-6 text-center border-b border-white/30">
          {/* Decorative Sakura */}
          <div className="absolute top-4 left-4 text-white/40 animate-pulse">
            <SakuraIcon className="w-6 h-6" />
          </div>
          <div className="absolute bottom-4 right-4 text-white/40 animate-pulse" style={{ animationDelay: '1s' }}>
            <SakuraIcon className="w-5 h-5" />
          </div>

          {/* Friendly Mascot / Icon */}
          <div className="mb-5 relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-md p-3 shadow-lg flex items-center justify-center animate-bounce duration-[2000ms]">
              <span className="text-6xl" role="img" aria-label="waving hand">👋</span>
            </div>
            {/* Friendly Chat Bubble */}
            <div className="absolute -top-2 -right-6 bg-white text-rose-500 text-xs font-black px-3 py-1.5 rounded-2xl rounded-bl-none shadow-md transform rotate-12 animate-scale-in" style={{ animationDelay: '400ms' }}>
              Konnichiwa!
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight animate-fade-in-up animation-delay-100">
              Welcome to Nihongo!
            </h1>
            <p className="text-rose-50 text-base font-medium animate-fade-in-up animation-delay-200">
              The most fun way to speak, play, and learn basic Japanese. 🌸
            </p>
          </div>
        </div>

        {/* Body Section (Friendly 3-Step Guide) */}
        <div className="flex-1 overflow-hidden bg-white/40 dark:bg-black/20 p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200 dark:border-blue-800">
              <HeadphonesIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">1. Listen Carefully 🎧</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Hear the native pronunciation for everyday words.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-800">
              <MicrophoneIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">2. Speak Out Loud 🎤</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Use your microphone to practice your accent.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200 dark:border-amber-800">
              <TrophyIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">3. Climb the Ranks 🏆</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Earn points, unlock badges, and rule the leaderboard!</p>
            </div>
          </div>

        </div>

        {/* Footer Section */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md px-6 py-4 border-t border-white/40 dark:border-white/10">
          
          {/* CTA Button */}
          <button
            onClick={() => handleAction(onStart)}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.98] text-white font-black py-4 px-4 rounded-2xl shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden mb-4"
            aria-label="Start learning Japanese"
          >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
            
            <span className="text-xl group-hover:translate-x-1 transition-transform relative z-10">🚀</span>
            <span className="relative z-10 tracking-wider text-lg">Let's Go! はじめましょう</span>
          </button>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="peer appearance-none w-4 h-4 border-2 border-rose-300 dark:border-rose-900/60 rounded focus:ring-2 focus:ring-rose-500 checked:bg-rose-500 checked:border-rose-500 transition-all cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                Don't show this welcoming message again
              </span>
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}