'use client';

import React from 'react';

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
  <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-white dark:bg-[#1a1728] rounded-2xl border-2 border-red-200 dark:border-red-900/60 shadow-md hover:shadow-lg transition-all">
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
  if (!isOpen) return null;

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
      <div className="relative w-full max-w-md bg-white dark:bg-[#12101f] dark:border-2 dark:border-[#dc2626]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
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
        <div className="bg-[#8B0000] relative px-6 py-8 text-center">
          {/* Sakura Icons in Header */}
          <div className="absolute top-3 left-3 text-[#f4c2c2] opacity-80">
            <SakuraIcon className="w-5 h-5" />
          </div>
          <div className="absolute top-3 right-3 text-[#f4c2c2] opacity-80">
            <SakuraIcon className="w-5 h-5" />
          </div>

          {/* Daruma Icon */}
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm p-2">
              <DarumaIcon className="w-full h-full" />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <p className="text-[#f4c2c2] text-xs tracking-[0.15em] uppercase font-medium">
              ようこそ・WELCOME
            </p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Nihongo Education
            </h1>
            <p className="text-[#f4c2c2] text-sm font-medium">
              Speak, Play & Learn Basic Japanese!
            </p>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#12101f] p-6">
          <h2 className="text-center text-[11px] font-black text-[#0f172a] dark:text-slate-200 tracking-[0.2em] uppercase mb-5">
            HOW IT WORKS
          </h2>

          {/* 2x3 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {instructionCards.map((card, index) => (
              <InstructionCard
                key={index}
                step={card.step}
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
              />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white dark:bg-[#12101f] px-6 py-5 border-t border-gray-100 dark:border-red-900/40">
          {/* CTA Button */}
          <button
            onClick={onStart}
            className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] active:bg-[#a31717] text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            aria-label="Start learning Japanese"
          >
            <span className="text-lg group-hover:translate-x-0.5 transition-transform">🏁</span>
            <span>Let's Start!</span>
          </button>

          {/* Footer Text */}
          <div className="mt-3.5 py-2.5 px-3 bg-[#d32f2f] rounded-xl text-center shadow-sm border border-red-400">
            <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              University Tun Hussein Onn Malaysia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}