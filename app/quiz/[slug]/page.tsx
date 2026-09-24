'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getQuestionsByCategory, categories, findCategoryBySlug } from '@/data/questions';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer, matchOptionFromSpeech, normalizeJapaneseSpeech, COLOR_SPEECH_ALIASES, NUMBER_SPEECH_ALIASES } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';
import { getSRSData, updateSRSData, calculateWeight } from '@/app/utils/srs';
import { Question } from '@/data/questions';
import AudioWave from '@/app/components/AudioWave';
import { supabase } from '@/app/utils/supabase';
import CertificateModal from '@/app/components/CertificateModal';
import Image from 'next/image';
import { bgm } from '@/app/utils/bgm';

// Gentle falling sakura petals
const SakuraBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="sakura-container pointer-events-none z-0">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${4 + (i % 10) * 9.8}%`,
            animationDuration: `${11 + (i % 5) * 1.5}s`,
            animationDelay: `-${i * 1.2}s`,
            width: `${8 + (i % 3) * 3}px`,
            height: `${8 + (i % 3) * 3}px`,
            opacity: 0.65 + (i % 4) * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Bowing Japanese Character Avatar matching reference screenshot
const BowingAvatar = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left and right bowing motion accent dashes */}
    <path d="M 26 50 L 20 52 M 28 58 L 22 61" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
    <path d="M 94 50 L 100 52 M 92 58 L 98 61" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
    
    {/* Hair bun and cyan ribbon tie */}
    <path d="M 46 25 C 46 16 74 16 74 25 Z" fill="#0284c7" />
    <ellipse cx="60" cy="23" rx="14" ry="7" fill="#38bdf8" />
    <circle cx="60" cy="23" r="3" fill="#ffffff" />
    
    {/* Hair silhouette */}
    <path d="M 40 32 C 40 20 80 20 80 32 C 80 44 40 44 40 32 Z" fill="#1e293b" />
    
    {/* Head tilted down bowing */}
    <ellipse cx="60" cy="48" rx="22" ry="19" fill="#fde68a" stroke="#1e293b" strokeWidth="3.5" />
    
    {/* Hair bangs */}
    <path d="M 40 43 C 48 35 72 35 80 43 C 71 39 49 39 40 43 Z" fill="#1e293b" />
    
    {/* Closed happy bowing eyes */}
    <path d="M 48 48 Q 53 51 58 48" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 62 48 Q 67 51 72 48" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    
    {/* Blush cheeks */}
    <circle cx="47" cy="54" r="3.5" fill="#f43f5e" opacity="0.6" />
    <circle cx="73" cy="54" r="3.5" fill="#f43f5e" opacity="0.6" />
    
    {/* Kimono Robe (Royal Navy Blue) */}
    <path d="M 30 96 L 46 64 L 74 64 L 90 96 Z" fill="#0369a1" stroke="#1e293b" strokeWidth="3.5" strokeLinejoin="round" />
    
    {/* Kimono Collar V-neck */}
    <path d="M 48 64 L 60 78 L 72 64" fill="#fbbf24" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
    <path d="M 52 64 L 60 74 L 68 64" fill="#ffffff" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
    
    {/* Folded hands in front bowing */}
    <ellipse cx="60" cy="82" rx="11" ry="8" fill="#fde68a" stroke="#1e293b" strokeWidth="3" />
    
    {/* Obi belt */}
    <path d="M 38 90 Q 60 94 82 90" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// Flanking sound wave bars matching reference screenshot
const SoundWaveBars = ({ isListening }: { isListening: boolean }) => (
  <div className="flex items-center gap-1.5 px-2 sm:px-3">
    {[12, 22, 34, 18, 28, 14].map((h, i) => (
      <span
        key={i}
        className={`w-1 rounded-full bg-rose-200 dark:bg-rose-900/60 transition-all ${
          isListening ? 'animate-pulse' : ''
        }`}
        style={{
          height: isListening ? `${Math.max(12, (h * 1.5) % 38)}px` : `${h}px`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

export default function QuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = findCategoryBySlug(slug);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Feedback Modal: 'correct' | 'wrong' | null
  const [feedbackModal, setFeedbackModal] = useState<'correct' | 'wrong' | null>(null);

  // 3-Step Guided Learning Stage: 'listen' | 'practice' | 'answer'
  const [currentStep, setCurrentStep] = useState<'listen' | 'practice' | 'answer'>('practice');
  const [speechSuccess, setSpeechSuccess] = useState<string>('');

  // Countdown before quiz starts: '3' | '2' | '1' | 'GO' | 'finished'
  const [countdown, setCountdown] = useState<'3' | '2' | '1' | 'GO' | 'finished'>('3');

  // Microphone Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const [speechEngine, setSpeechEngine] = useState<'google' | 'whisper'>('google');
  const [showOnePlusHelp, setShowOnePlusHelp] = useState(false);
  const speechRecognizerRef = useRef<JapaneseSpeechRecognizer | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);

  // Sync theme & BGM state
  useEffect(() => {
    const savedTheme = localStorage.getItem('nihongo-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const userBgm = localStorage.getItem('nihongo-bgm-enabled');
    if (userBgm !== null) {
      setIsBgmPlaying(userBgm !== 'false');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nihongo-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nihongo-theme', 'light');
    }
  };

  const handleToggleBgm = () => {
    const newState = bgm.toggle();
    setIsBgmPlaying(newState);
  };

  const handleTriggerAfk = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nihongo-trigger-afk'));
    }
  };

  useEffect(() => {
    const recognizer = new JapaneseSpeechRecognizer();
    speechRecognizerRef.current = recognizer;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_speech_engine') as 'google' | 'whisper' | null;
      if (saved) {
        setSpeechEngine(saved);
        recognizer.setEngine(saved);
      }
    }
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.cancel();
      }
    };
  }, []);

  const handleEngineChange = (engine: 'google' | 'whisper') => {
    setSpeechEngine(engine);
    speechRecognizerRef.current?.setEngine(engine);
  };

  useEffect(() => {
    const srsData = getSRSData();
    const sorted = [...getQuestionsByCategory(category?.name || slug)].sort((a, b) => {
      const weightA = calculateWeight(srsData[a.id]);
      const weightB = calculateWeight(srsData[b.id]);
      const randomJitter = Math.random() * 0.1 - 0.05;
      return (weightB - weightA) + randomJitter;
    });
    setQuizQuestions(sorted);
    setIsReady(true);
  }, [slug]);

  // Countdown timer sequence (3 -> 2 -> 1 -> GO! -> Start Quiz)
  useEffect(() => {
    if (!isReady || quizQuestions.length === 0) return;

    const t1 = setTimeout(() => {
      sfx.playTap();
      setCountdown('2');
    }, 650);

    const t2 = setTimeout(() => {
      sfx.playTap();
      setCountdown('1');
    }, 1300);

    const t3 = setTimeout(() => {
      sfx.playTap();
      setCountdown('GO');
    }, 1950);

    const t4 = setTimeout(() => {
      setCountdown('finished');
    }, 2750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isReady, quizQuestions]);

  // Auto-play TTS when question loads
  useEffect(() => {
    if (isReady && countdown === 'finished' && quizQuestions[currentIndex] && !showResult) {
      speakJapanese(quizQuestions[currentIndex].japanese_text);
      setSpokenTranscript('');
      setSpeechError('');
      setSpeechSuccess('');
      setCurrentStep('practice');
    }
  }, [currentIndex, showResult, isReady, countdown, quizQuestions]);

  // Trigger Confetti when Stage Clear is reached
  useEffect(() => {
    if (showResult) {
      const end = Date.now() + 3 * 1000;
      const colors = ['#f43f5e', '#fbbf24', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [showResult]);

  const currentQuestion = quizQuestions[currentIndex];

  const nextQuestion = async () => {
    setFeedbackModal(null);
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCurrentStep('practice');
      setSpokenTranscript('');
      setSpeechError('');
      setSpeechSuccess('');
    } else {
      setShowResult(true);

      // Save score to leaderboard
      const percentage = Math.round((score / (quizQuestions.length || 1)) * 100);
      const totalPoints = score * 1000 + streak * 250;

      let rankTitle = "🌸 SAMURAI LEARNER";
      if (percentage === 100) rankTitle = "👑 SAMURAI MASTER";
      else if (percentage >= 80) rankTitle = "🌟 GOLD SHOGUN";
      else if (percentage >= 60) rankTitle = "⭐ NINJA WARRIOR";

      const playerName = localStorage.getItem('nihongo-player-name') || 'Guest Samurai';

      await supabase.from('leaderboard').insert({
        name: playerName,
        category: category?.name || 'Solo Practice',
        points: totalPoints,
        accuracy: percentage,
        badge: rankTitle
      });
    }
  };

  const handleDismissCorrect = () => {
    setFeedbackModal(null);
    nextQuestion();
  };

  const handleRetry = () => {
    setFeedbackModal(null);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setSpokenTranscript('');
    setSpeechError('');
    setSpeechSuccess('');
  };

  const handleShowAnswer = () => {
    setFeedbackModal(null);
    setCurrentStep('answer');
    if (currentQuestion) {
      setSelectedAnswer(currentQuestion.correct_answer);
    }
    setIsAnswered(true);
  };

  const getHintText = (q: typeof quizQuestions[0]) => {
    if (!q) return '';
    const prefix = q.romaji
      ? (q.romaji.length > 3 ? q.romaji.slice(0, 3) : q.romaji)
      : (q.correct_answer ? q.correct_answer.slice(0, 2) : '');
    return `It means "${q.english_translation}" and starts with "${prefix}...".`;
  };

  // Auto-advance when answer is correct (1.8s) - strictly top-level hook
  useEffect(() => {
    if (feedbackModal === 'correct') {
      const timer = setTimeout(() => {
        handleDismissCorrect();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [feedbackModal, currentIndex]);

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setShowCertificate(false);
    setFeedbackModal(null);
    setCurrentStep('practice');
    setSpokenTranscript('');
    setSpeechError('');
    setSpeechSuccess('');
    setCountdown('3');
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="text-2xl animate-bounce">⛩️</div>
      </div>
    );
  }

  if (!category || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff0f3] via-[#ffe4e6] to-[#fff0f3] dark:from-rose-950 dark:via-red-950 dark:to-pink-950 flex items-center justify-center p-4">
        <div className="card-cultural text-center max-w-sm w-full p-8 border border-white dark:border-white/10 shadow-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
          <div className="text-4xl mb-3">🌸</div>
          <p className="text-base sm:text-lg mb-2 font-bold text-[#4c0519] dark:text-white">Topic not found</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">The topic &quot;{slug}&quot; could not be located. Choose from our available topics below.</p>
          <div className="flex flex-col gap-2.5">
            <Link href="/topics" className="btn-torii px-4 sm:px-6 py-3 text-sm sm:text-base font-black w-full inline-block">Explore All Topics</Link>
            <Link href="/" className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#e11d48] transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-Quiz Countdown Screen matching user's exact reference image
  if (countdown !== 'finished') {
    return (
      <div className="relative min-h-screen lg:h-screen lg:max-h-screen overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none transition-colors duration-300 bg-[#fff0f3] dark:bg-[#0c080e] cursor-default">
        {/* Full-bleed Scenic Sakura Background matching first user-provided picture */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          {/* Day Mode: User-provided clean Fuji Sakura background */}
          <Image
            src="/images/fuji-sakura-clean-bg.png"
            alt="Sakura Fuji Background"
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
          />
          {/* Night Mode: Scenic Mount Fuji Night background */}
          <Image
            src="/images/fuji-night-bg.jpg"
            alt="Mount Fuji Night Background"
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
          />
          {/* Day Soft Vignette */}
          <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-pink-100/25 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
          {/* Night Soft Scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
        </div>

        <SakuraBackground />

        {/* TOP HEADER: Day / Night Theme Pill Switcher */}
        <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-end flex-shrink-0 animate-fade-in-up">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-white/90 dark:border-white/10 flex items-center gap-2 cursor-pointer shadow-xs hover:shadow transition-all"
            title={isDarkMode ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
          >
            <span>{isDarkMode ? '⛩️' : '🌸'}</span>
            <span className="tracking-wider">{isDarkMode ? 'NIGHT' : 'DAY'}</span>
            <span className="text-amber-500 text-xs">{isDarkMode ? '🌙' : '☀️'}</span>
          </button>
        </header>

        {/* CENTER HERO: Minimalist Circular Glassmorphic Disc */}
        <main className="relative z-10 my-auto flex flex-col items-center justify-center animate-fade-in-up">
          {/* The Circular Glass Disc */}
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-84 md:h-84 lg:w-92 lg:h-92 rounded-full bg-white/55 dark:bg-[#181424]/70 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-[0_20px_50px_rgba(244,114,182,0.18),inset_0_2px_4px_rgba(255,255,255,0.85)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center p-6 text-center select-none cursor-default">
            {/* Top Cherry Blossom Icon */}
            <span className="text-xl sm:text-2xl text-rose-400 dark:text-rose-300 animate-pulse">
              🌸
            </span>

            {/* GET READY! Subtitle */}
            <h2 className="text-xs sm:text-sm font-black tracking-[0.25em] text-stone-600 dark:text-stone-300 uppercase mt-1.5 mb-0.5">
              GET READY!
            </h2>

            {/* Bold Japanese Crimson Countdown Number */}
            <div 
              key={countdown}
              className="text-7xl sm:text-8xl md:text-9xl font-black text-[#dc2626] dark:text-rose-500 font-sans tracking-tight leading-none my-1 drop-shadow-sm animate-scale-in"
            >
              {countdown}
            </div>

            {/* Progress Bar Track */}
            <div className="w-24 sm:w-32 h-1.5 rounded-full bg-rose-200/60 dark:bg-white/15 overflow-hidden my-2">
              <div 
                className={`h-full bg-[#dc2626] dark:bg-rose-500 rounded-full transition-all duration-500 ease-out ${
                  countdown === '3' ? 'w-1/3' : countdown === '2' ? 'w-2/3' : 'w-full'
                }`} 
              />
            </div>

            {/* 3 Progress Dots Indicator */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${countdown === '3' || countdown === '2' || countdown === '1' || countdown === 'GO' ? 'bg-[#dc2626] dark:bg-rose-500' : 'bg-rose-200 dark:bg-white/20'}`} />
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${countdown === '2' || countdown === '1' || countdown === 'GO' ? 'bg-[#dc2626] dark:bg-rose-500' : 'bg-rose-200 dark:bg-white/20'}`} />
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${countdown === '1' || countdown === 'GO' ? 'bg-[#dc2626] dark:bg-rose-500' : 'bg-rose-200 dark:bg-white/20'}`} />
            </div>
          </div>

          {/* Category Label Pill with Winged Dividers below disc */}
          <div className="flex items-center gap-3 mt-6 sm:mt-8">
            <span className="w-8 sm:w-12 h-[1px] bg-rose-300/70 dark:bg-rose-700/60" />
            <div className="glass-pill rounded-full px-5 py-1 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-200 border-white/90 dark:border-white/10 shadow-xs tracking-wide">
              {category?.name || slug}
            </div>
            <span className="w-8 sm:w-12 h-[1px] bg-rose-300/70 dark:bg-rose-700/60" />
          </div>
        </main>

        {/* BOTTOM FOOTER CONTROLS: Zen BGM & AFK */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-end flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Zen BGM Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleBgm();
              }}
              className="glass-pill rounded-full px-3 py-1.5 flex items-center gap-2 text-xs cursor-pointer transition-all"
              title={isBgmPlaying ? "Pause Ambient BGM" : "Play Ambient BGM"}
            >
              <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-[9px]">
                🎵
              </span>
              <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
                Zen BGM
              </span>
              <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isBgmPlaying ? 'bg-[#e11d48]' : 'bg-stone-300 dark:bg-stone-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${isBgmPlaying ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* AFK Screensaver Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerAfk();
              }}
              className="glass-pill rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer"
              title="Launch AFK Japanese Screensaver"
            >
              <span>🌸</span>
              <span>AFK</span>
            </button>
          </div>
        </footer>

      </div>
    );
  }

  const progress = ((currentIndex + 1) / (quizQuestions.length || 1)) * 100;
  const accuracyPercentage = (currentIndex > 0 || isAnswered)
    ? Math.round((score / (currentIndex + (isAnswered ? 1 : 0))) * 100)
    : 100;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
    }

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correct_answer;
    updateSRSData(currentQuestion.id, isCorrect);

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      sfx.playCorrect();
      setFeedbackModal('correct');
    } else {
      setStreak(0);
      sfx.playWrong();
      setFeedbackModal('wrong');
    }
  };

  const handleListen = () => {
    if (currentQuestion) {
      speakJapanese(currentQuestion.japanese_text);
    }
  };

  const handleMicListen = () => {
    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    setSpeechError('');
    setSpeechSuccess('');
    setSpokenTranscript('');
    setIsListening(true);

    if (speechRecognizerRef.current && currentQuestion) {
      // Build vocabulary prompt for Whisper context
      const vocabList = [
        currentQuestion.correct_answer,
        ...currentQuestion.options,
        currentQuestion.japanese_text,
      ];
      if (currentQuestion.option_hiragana) {
        Object.values(currentQuestion.option_hiragana).forEach((h) => {
          const clean = h.replace(/\s*\([^)]*\)/, '');
          vocabList.push(clean);
        });
      }
      // Also add known speech aliases (Kanji/variants) for options to anchor Whisper context
      [currentQuestion.correct_answer, ...currentQuestion.options].forEach((opt) => {
        const aliases = [...(COLOR_SPEECH_ALIASES[opt] || []), ...(NUMBER_SPEECH_ALIASES[opt] || [])];
        aliases.forEach((a) => {
          if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(a)) {
            vocabList.push(a);
          }
        });
      });
      const vocabPrompt = Array.from(new Set(vocabList.filter(Boolean))).join('、');

      speechRecognizerRef.current.start(
        (result) => {
          const spoken = result.transcript;
          setSpokenTranscript(spoken);

          // Find if spoken text matches any option or correct answer
          const matchedOption = matchOptionFromSpeech(
            spoken,
            currentQuestion.options,
            currentQuestion.correct_answer,
            currentQuestion.option_hiragana,
            result.alternatives,
            currentQuestion.romaji
          );

          const normSpoken = normalizeJapaneseSpeech(spoken);
          const normCorrect = normalizeJapaneseSpeech(currentQuestion.correct_answer);
          const normTarget = normalizeJapaneseSpeech(currentQuestion.japanese_text);

          const isCorrect =
            matchedOption === currentQuestion.correct_answer ||
            (normSpoken && (normSpoken === normCorrect || normSpoken === normTarget));

          if (isCorrect) {
            sfx.playCorrect();
            setSpeechSuccess(`Great pronunciation! You said "${spoken}"`);
            setSpeechError('');
            handleAnswer(currentQuestion.correct_answer);
          } else if (matchedOption) {
            sfx.playWrong();
            setSpeechSuccess('');
            setSpeechError(
              `You said "${spoken}" (${matchedOption}), which is incorrect. The target word is "${currentQuestion.japanese_text}" (${currentQuestion.correct_answer}). Tap mic to try again!`
            );
          } else {
            sfx.playWrong();
            setSpeechSuccess('');
            setSpeechError(
              `Pronunciation not recognized: "${spoken}". Target word is "${currentQuestion.japanese_text}" (${currentQuestion.correct_answer}). Speak clearly and try again!`
            );
          }
        },
        (err) => {
          sfx.playWrong();
          setSpeechError(err);
          setSpeechSuccess('');
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        },
        () => {
          setIsListening(true);
        },
        vocabPrompt,
        (newEngine) => {
          setSpeechEngine(newEngine);
        },
        speechEngine
      );
    }
  };

  if (showResult) {
    const percentage = Math.round((score / (quizQuestions.length || 1)) * 100);
    const pointsEarned = score * 20;

    return (
      <div className="min-h-screen bg-seigaiha transition-colors duration-500 flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
        
        {/* Stylized Mt. Fuji Silhouette rising from bottom */}
        <div className="w-full max-w-xl h-52 sm:h-64 absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-85 z-0 flex items-end justify-center">
          <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
            {/* Mt. Fuji conical slope */}
            <polygon points="200,15 50,160 350,160" fill="#f7ebeb" className="dark:fill-[#1e1316]" />
            {/* Mt. Fuji white snow cap */}
            <polygon points="200,15 165,65 180,58 195,66 205,58 220,66 235,65" fill="#ffffff" className="dark:fill-[#ffffff]/90" />
          </svg>
        </div>

        {/* Ambient floating Sakura petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-12 left-[12%] text-2xl opacity-40 animate-pulse">🌸</div>
          <div className="absolute top-28 right-[14%] text-xl opacity-35 animate-bounce" style={{ animationDuration: '4.5s' }}>🌸</div>
          <div className="absolute bottom-20 left-[18%] text-lg opacity-30 animate-pulse" style={{ animationDuration: '3.2s' }}>🌸</div>
          <div className="absolute bottom-32 right-[16%] text-2xl opacity-40 animate-bounce" style={{ animationDuration: '5s' }}>🌸</div>
        </div>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          categoryName={category?.name || slug}
          categoryEmoji={category?.emoji || '🌸'}
          score={score}
          totalPoints={pointsEarned > 0 ? pointsEarned : 470}
          totalQuestions={quizQuestions.length}
          accuracyPercentage={percentage}
          rank="#1/1"
          eventCode="UHB10802"
        />

        {/* Completion Card matching user reference design */}
        <div className="max-w-md w-full p-6 sm:p-8 text-center bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-rose-200/90 dark:border-white/10 shadow-[0_20px_50px_rgba(244,63,94,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.75)] rounded-3xl animate-scale-in z-10 relative">
          
          {/* Top Party Popper Emoji */}
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce select-none">
            🎉
          </div>

          {/* Heading in soft rose Japanese */}
          <h2 className="text-3xl sm:text-4xl font-black text-rose-500 dark:text-rose-400 tracking-wide mb-1 font-sans">
            おめでとう！
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-bold text-stone-700 dark:text-stone-200 mb-1">
            Omedetou! — Congratulations!
          </p>

          {/* Quiz Completion Description */}
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium mb-6">
            You completed the {category?.name || 'Japanese'} quiz!
          </p>

          {/* 3-Metrics Grid: Points Earned, Questions, Accuracy */}
          <div className="grid grid-cols-3 gap-2 py-4 px-2 bg-stone-50/80 dark:bg-black/40 rounded-2xl border border-stone-200/60 dark:border-white/10 mb-6">
            {/* Points Earned */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono leading-none">
                {pointsEarned}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 mt-1.5">
                Points Earned
              </div>
            </div>

            {/* Questions */}
            <div className="text-center border-x border-stone-200 dark:border-stone-800">
              <div className="text-2xl sm:text-3xl font-black text-[#c5221f] dark:text-rose-400 font-mono leading-none">
                {quizQuestions.length}/{quizQuestions.length}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 mt-1.5">
                Questions
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                {percentage}%
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 mt-1.5">
                Accuracy
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* 1. Get my certificate Button */}
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-amber-50/80 dark:bg-stone-900 dark:hover:bg-stone-800 text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-600 font-black text-sm sm:text-base shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📜</span>
              <span>Get my certificate</span>
            </button>

            {/* 2. Play Again Button */}
            <button
              onClick={resetQuiz}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#c5221f] hover:bg-[#a51d1a] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔄</span>
              <span>Play Again</span>
            </button>

            {/* 3. Back to Categories Button */}
            <Link
              href="/topics"
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-rose-50/80 dark:bg-stone-900 dark:hover:bg-stone-800 text-rose-700 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-900/60 font-black text-sm sm:text-base shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏠</span>
              <span>Back to Categories</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-y-auto bg-[#fff5f6] dark:bg-[#0c080e] text-stone-900 dark:text-white flex flex-col justify-between p-2.5 sm:p-4 lg:py-2.5 lg:px-6 select-none transition-colors duration-300">

      {/* Full-bleed Scenic Background (clean Fuji Sakura in Day mode, Fuji Night in Night mode) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Day Mode: First Picture (clean Fuji Sakura background) */}
        <Image
          src="/images/fuji-sakura-clean-bg.png"
          alt="Sakura Fuji Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Night Mode: Mount Fuji Night background */}
        <Image
          src="/images/fuji-night-bg.jpg"
          alt="Mount Fuji Night Background"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-center scale-100 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out [transform:translateZ(0)] [will-change:opacity] select-none pointer-events-none"
        />
        {/* Day Soft Pink Vignette */}
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-pink-100/20 opacity-100 dark:opacity-0 transition-opacity duration-300 ease-out pointer-events-none" />
        {/* Night Soft Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
      </div>

      <SakuraBackground />

      {/* Flanking Typography Accents (matching user reference mockup) */}
      <div className="hidden xl:flex fixed left-6 2xl:left-12 top-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none select-none z-10 opacity-70">
        <div className="flex flex-col text-[10px] font-extrabold tracking-[0.25em] text-stone-400 dark:text-stone-500 uppercase leading-loose text-left">
          <span>SMALL</span>
          <span>WORDS</span>
          <span>BIGGER</span>
          <span>WORLDS</span>
        </div>
        <div className="w-6 h-[1.5px] bg-rose-200 dark:bg-stone-700" />
      </div>

      <div className="hidden xl:flex fixed right-6 2xl:right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none select-none z-10 opacity-70 text-right">
        <div className="text-xs font-serif tracking-[0.35em] text-stone-400 dark:text-stone-500 [writing-mode:vertical-rl] leading-loose">
          ことばで、つながる。
        </div>
        <div className="w-4 h-[1.5px] bg-rose-200 dark:bg-stone-700 my-1" />
        <div className="flex flex-col text-[10px] font-medium text-stone-400 dark:text-stone-500 tracking-wider text-right leading-tight">
          <span>A</span>
          <span>brighter</span>
          <span>you</span>
          <span>with</span>
          <span>Japanese.</span>
        </div>
      </div>

      {/* Correct Answer Feedback Modal Overlay */}
      {feedbackModal === 'correct' && (
        <div 
          onClick={handleDismissCorrect}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/25 dark:bg-black/70 backdrop-blur-sm animate-modal-backdrop cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-emerald-100 dark:border-emerald-900/40 relative animate-modal-card"
          >
            {/* Crossed Japanese Flags Emoji Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-200 dark:border-emerald-800 shadow-md flex items-center justify-center text-3xl mx-auto -mt-12 sm:-mt-14 mb-3 animate-bounce">
              🎌
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Correct!
            </h3>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              よくできました！
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 mt-0.5">
              Yoku dekimashita! — Well done!
            </p>

            {/* Score Reward Pill */}
            <div className="mt-5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 font-black text-sm shadow-xs">
              <span>⭐</span>
              <span>+20 pt</span>
            </div>

            <button
              onClick={handleDismissCorrect}
              className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Oops! Wrong Answer Feedback Modal Overlay */}
      {feedbackModal === 'wrong' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/25 dark:bg-black/70 backdrop-blur-sm animate-modal-backdrop">
          <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-rose-100 dark:border-rose-900/40 relative animate-modal-card">
            {/* Sweating Grin Emoji Badge */}
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-200 dark:border-rose-800 shadow-md flex items-center justify-center text-3xl mx-auto -mt-12 sm:-mt-14 mb-3">
              😅
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Oops!
            </h3>
            <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              もう一度！
            </p>
            <p className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400 mt-0.5">
              Mou ichido! — Try again!
            </p>

            {/* Yellow Hint Box */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-4 mt-4 text-left shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                <span>💡</span>
                <span>HINT</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                {getHintText(currentQuestion)}
              </p>
            </div>

            {/* Solid Red Try Again Button */}
            <button
              onClick={handleRetry}
              className="w-full py-3.5 rounded-2xl bg-[#c5221f] hover:bg-[#a51d1a] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer mt-5 flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Try Again</span>
            </button>

            {/* Show me the answer Link */}
            <button
              onClick={handleShowAnswer}
              className="mt-3 text-xs sm:text-sm font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline underline-offset-4 cursor-pointer transition-colors block mx-auto"
            >
              Show me the answer →
            </button>
          </div>
        </div>
      )}

      {/* Top Header: Back Button, Category & Subtitle, Day/Night Toggle */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between flex-shrink-0 pt-0.5 pb-1 px-1">
        <Link
          href="/topics"
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-white/10 text-xs font-bold text-stone-700 dark:text-stone-200 shadow-sm hover:bg-white dark:hover:bg-stone-800 hover:scale-102 transition-all cursor-pointer group"
        >
          <span className="text-stone-400 group-hover:-translate-x-0.5 transition-transform">‹</span>
          <span>Back</span>
        </Link>

        {/* Centered Title with Japanese Subtitle & Question Counter */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">
            {category?.name || slug}
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-[1.5px] bg-rose-400/60" />
            <span className="text-[11px] sm:text-xs font-bold text-rose-500 dark:text-rose-400 tracking-widest font-sans">
              {category?.japanese || 'あいさつ'}
            </span>
            <span className="w-2.5 h-[1.5px] bg-rose-400/60" />
          </div>
          <div className="mt-0.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest inline-block mr-1">
              QUESTION
            </span>
            <span className="text-xs sm:text-sm font-black text-stone-800 dark:text-stone-200 font-mono">
              {currentIndex + 1} <span className="text-stone-400 font-normal">/ {quizQuestions.length}</span>
            </span>
          </div>
        </div>

        {/* Day / Night Theme Pill Switcher */}
        <button
          onClick={toggleTheme}
          className="glass-pill px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200 border-white/90 dark:border-white/10 flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow transition-all"
          title={isDarkMode ? "Switch to Day Mode (昼)" : "Switch to Night Mode (夜)"}
        >
          <span>{isDarkMode ? '⛩️' : '🌸'}</span>
          <span className="tracking-wider hidden sm:inline">{isDarkMode ? 'NIGHT' : 'DAY'}</span>
          <span className="text-amber-500 text-xs">{isDarkMode ? '🌙' : '☀️'}</span>
        </button>
      </header>

      {/* HUD Stats & Stepper Row */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-2 flex-shrink-0">
        {/* Flanking Badges Row */}
        <div className="flex items-center justify-between mb-1">
          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/80 dark:border-white/10 shadow-xs">
            <span className="text-base">⭐</span>
            <div className="text-left">
              <div className="text-[8px] sm:text-[9px] font-extrabold text-stone-400 uppercase tracking-wider leading-none">SCORE</div>
              <div className="text-xs sm:text-sm font-black text-stone-800 dark:text-stone-100 font-mono leading-tight">
                {score * 20} <span className="text-[9px] font-bold text-stone-400 font-sans">pt</span>
              </div>
            </div>
          </div>

          {/* Accuracy Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/80 dark:border-white/10 shadow-xs">
            <span className="text-sm text-rose-500">📶</span>
            <div className="text-right sm:text-left">
              <div className="text-[8px] sm:text-[9px] font-extrabold text-stone-400 uppercase tracking-wider leading-none">ACCURACY</div>
              <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-mono leading-tight">
                {accuracyPercentage}%
              </div>
            </div>
            <span className="text-sm ml-0.5">🏯</span>
          </div>
        </div>

        {/* Primary Progress Bar */}
        <div className="h-1.5 w-full bg-rose-100/90 dark:bg-stone-800/80 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Master Level Indicator */}
        <div className="flex items-center justify-between mt-0.5 px-1 text-[11px] font-bold">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <span>🏯</span>
            <span>Master</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500 font-mono text-[10px]">
            {Math.min(streak, 1)}/1
          </div>
        </div>

        {/* 3-Stage Stepper: LISTEN -> PRACTICE -> ANSWER */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 my-1 sm:my-1.5">
          {/* Step 1: LISTEN */}
          <button
            onClick={() => { handleListen(); setCurrentStep('listen'); }}
            className="flex flex-col items-center gap-0.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs">
              ✓
            </div>
            <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
              LISTEN
            </span>
          </button>

          {/* Connector 1 */}
          <div className="h-[1.5px] w-8 sm:w-14 md:w-20 bg-rose-200 dark:bg-stone-700 -mt-3" />

          {/* Step 2: PRACTICE */}
          <button
            onClick={() => setCurrentStep('practice')}
            className="flex flex-col items-center gap-0.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs transition-all ${
              currentStep === 'practice'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-3 ring-rose-100 dark:ring-rose-950/60 scale-105'
                : 'bg-rose-100 dark:bg-stone-800 text-rose-500 dark:text-rose-400'
            }`}>
              ✏️
            </div>
            <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase ${
              currentStep === 'practice' ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-stone-400 dark:text-stone-500'
            }`}>
              PRACTICE
            </span>
          </button>

          {/* Connector 2 */}
          <div className="h-[1.5px] w-8 sm:w-14 md:w-20 bg-rose-200 dark:bg-stone-700 -mt-3" />

          {/* Step 3: ANSWER */}
          <button
            onClick={() => setCurrentStep('answer')}
            className="flex flex-col items-center gap-0.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs transition-all ${
              currentStep === 'answer' || isAnswered
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-3 ring-rose-100 dark:ring-rose-950/60 scale-105'
                : 'bg-white dark:bg-stone-800 text-stone-400 border border-stone-300 dark:border-stone-700'
            }`}>
              ✏️
            </div>
            <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase ${
              currentStep === 'answer' || isAnswered ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-stone-400 dark:text-stone-500'
            }`}>
              ANSWER
            </span>
          </button>
        </div>
      </div>

      {/* Main Interactive Area: 2-Column Side-by-Side Glass Cards matching reference mockup */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-auto py-1 flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-5 items-stretch w-full">
          
          {/* LEFT CARD: Meaning & Audio */}
          <div
            className="w-full bg-white/85 dark:bg-[#141416]/85 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-[28px] p-4 sm:p-5 lg:p-5 shadow-[0_12px_40px_rgba(244,114,182,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center text-center relative overflow-hidden transition-all min-h-[300px] sm:min-h-[340px]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Cpath d='M0 30 A30 30 0 0 1 60 30 M10 30 A20 20 0 0 1 50 30 M20 30 A10 10 0 0 1 40 30' fill='none' stroke='%23fecdd3' stroke-width='1.2' stroke-opacity='0.45'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "60px 30px"
            }}
          >
            {/* Corner Sakura Petals */}
            <div className="absolute top-3 right-3 text-lg opacity-30 pointer-events-none select-none">🌸</div>
            <div className="absolute bottom-3 left-3 text-lg opacity-30 pointer-events-none select-none">🌸</div>

            <div className="flex flex-col items-center w-full my-auto">
              {/* Question Illustration / Bowing Avatar - Clickable to listen to audio */}
              <button
                type="button"
                onClick={handleListen}
                title="Tap picture to listen to Japanese pronunciation"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-800/90 shadow-md border border-rose-100 dark:border-white/10 flex items-center justify-center mx-auto mb-2 overflow-hidden relative group cursor-pointer active:scale-95 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-lg transition-all"
              >
                {currentQuestion.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentQuestion.imageUrl}
                    alt={currentQuestion.japanese_text}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : currentQuestion.image === "🙇" || currentQuestion.japanese_text.includes("よろしく") ? (
                  <BowingAvatar className="w-18 h-18 sm:w-20 sm:h-20 transition-transform group-hover:scale-105" />
                ) : (
                  <span className="text-4xl sm:text-5xl animate-bounce">
                    {currentQuestion.image || "🌸"}
                  </span>
                )}

                {/* Floating Speaker Badge right on the picture */}
                <div className="absolute bottom-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs text-xs group-hover:scale-110 transition-transform">
                  🔊
                </div>
              </button>

              {/* Meaning Label */}
              <div className="text-[10px] sm:text-xs font-extrabold tracking-[0.2em] text-stone-400 uppercase mb-0.5">
                MEANING
              </div>

              {/* English Translation */}
              <h2 className="text-base sm:text-lg md:text-xl font-black text-stone-800 dark:text-white leading-snug px-2 max-w-sm">
                {currentQuestion.english_translation}
              </h2>

              {/* Romaji & Listening Audio Button Row - Placed directly near the picture */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {currentQuestion.romaji && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50/90 dark:bg-stone-800/80 border border-rose-100 dark:border-white/10 rounded-full shadow-xs">
                    <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-rose-600 dark:text-rose-400 bg-white dark:bg-stone-700 px-1.5 py-0.5 rounded-full shadow-xs">
                      ROMAJI
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-200">
                      {currentQuestion.romaji}
                    </span>
                  </div>
                )}

                {/* Prominent Listening Button right next to Romaji and near the picture */}
                <button
                  type="button"
                  onClick={handleListen}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 dark:bg-stone-800/90 backdrop-blur-md border border-rose-200 dark:border-white/10 shadow-xs hover:shadow hover:bg-rose-50 dark:hover:bg-stone-700 hover:scale-102 active:scale-95 transition-all text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer group"
                >
                  <span className="text-rose-500 group-hover:scale-110 transition-transform text-sm">🔊</span>
                  <span>Tap to listen</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: PRACTICE vs ANSWER vs LISTEN */}
          <div className="w-full bg-white/85 dark:bg-[#141416]/85 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-[28px] p-4 sm:p-5 lg:p-5 shadow-[0_12px_40px_rgba(244,114,182,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center text-center relative overflow-hidden transition-all min-h-[300px] sm:min-h-[340px]">
            {currentStep === 'answer' ? (
              /* STEP 3: ANSWER - Tactile Option Cards Grid */
              <div className="space-y-2.5 w-full my-auto">
                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Choose the correct Japanese phrase:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correct_answer;
                    const isSelected = option === selectedAnswer;

                    let optionClasses = "w-full text-left p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 font-bold shadow-xs cursor-pointer active:scale-95 flex flex-col justify-between ";

                    if (isAnswered) {
                      if (isCorrect) {
                        optionClasses += "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-[1.01]";
                      } else if (isSelected) {
                        optionClasses += "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 opacity-90";
                      } else {
                        optionClasses += "bg-white/40 dark:bg-stone-900/40 border-stone-200/50 dark:border-white/5 opacity-40 text-stone-400";
                      }
                    } else {
                      optionClasses += "bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-700 border-stone-200/80 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-700 text-stone-800 dark:text-white hover:scale-[1.01]";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={isAnswered}
                        className={optionClasses}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="text-sm sm:text-base font-bold">{option}</div>
                            {currentQuestion.option_hiragana?.[option] && (
                              <div className="text-[10px] text-stone-400 dark:text-stone-400 font-normal mt-0.5">
                                {currentQuestion.option_hiragana[option]}
                              </div>
                            )}
                          </div>
                          {isAnswered && isCorrect && <span className="text-base">✨</span>}
                          {isAnswered && isSelected && !isCorrect && <span className="text-sm opacity-60">✕</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Actions in Answer Step */}
                <div className="flex items-center justify-between pt-1.5">
                  <button
                    onClick={() => setCurrentStep('practice')}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-stone-100/90 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    ← Back to practice
                  </button>
                  {isAnswered && (
                    <button
                      onClick={nextQuestion}
                      className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {currentIndex === quizQuestions.length - 1 ? 'Complete Quiz 🏆' : 'Continue →'}
                    </button>
                  )}
                </div>
              </div>
            ) : currentStep === 'listen' ? (
              /* STEP 1: LISTEN MODE */
              <div className="flex flex-col items-center justify-center w-full my-auto text-center p-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-stone-800 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shadow-sm mb-2 animate-pulse">
                  🔊
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-800 dark:text-white mb-0.5">
                  Listen to Native Pronunciation
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-3">
                  Tap the speaker to hear authentic pitch and rhythm, then speak along.
                </p>
                <button
                  onClick={handleListen}
                  className="px-4 py-2 rounded-full bg-white dark:bg-stone-800 border border-rose-200 dark:border-white/10 text-rose-600 dark:text-rose-400 font-bold text-xs shadow-xs hover:bg-rose-50 transition-all cursor-pointer mb-3"
                >
                  🔊 Replay Audio
                </button>
                <button
                  onClick={() => setCurrentStep('practice')}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-500/30 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  Ready to Practice →
                </button>
              </div>
            ) : (
              /* STEP 2: PRACTICE MODE matching reference image */
              <div className="flex flex-col items-center justify-between w-full h-full">
                {/* Guidance Header / Error / Success Message */}
                <div className="w-full text-center mb-1.5">
                  {speechSuccess ? (
                    <div className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 animate-scale-in">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                        <span>🎉</span>
                        <span>{speechSuccess}</span>
                      </div>
                      {spokenTranscript && (
                        <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          🎙️ Spoken: &quot;{spokenTranscript}&quot;
                        </div>
                      )}
                    </div>
                  ) : speechError ? (
                    <div className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 ring-2 ring-rose-200 dark:ring-rose-900/50 animate-shake">
                      <div className="flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-300 font-black text-xs">
                        <span>❌</span>
                        <span>Pronunciation Not Accepted</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-700 dark:text-stone-200 font-medium leading-normal max-w-md">
                        {speechError}
                      </p>
                      {spokenTranscript && (
                        <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                          🎙️ What we heard: &quot;{spokenTranscript}&quot;
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={handleMicListen}
                          className="px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <span>🔄</span>
                          <span>Try Speaking Again</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('answer')}
                          className="px-2.5 py-0.5 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 font-bold text-[10px] hover:bg-stone-50 transition-all cursor-pointer"
                        >
                          Choose answer directly →
                        </button>
                      </div>
                    </div>
                  ) : isListening ? (
                    <div className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                      <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-xs">
                        <AudioWave />
                        <span>Listening... Speak Japanese now!</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                        Say: <span className="font-bold text-stone-800 dark:text-white">{currentQuestion.japanese_text}</span>
                        {currentQuestion.romaji && (
                          <span className="font-mono text-rose-600 dark:text-rose-400 font-bold ml-1">
                            ({currentQuestion.romaji})
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-800 dark:text-white tracking-tight">
                        Now your turn ― say it out loud.
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 max-w-sm mx-auto">
                        Say <span className="font-bold text-rose-600 dark:text-rose-400">{currentQuestion.japanese_text}</span>
                        {currentQuestion.romaji && (
                          <span className="text-stone-500 dark:text-stone-300 font-medium ml-1">
                            ({currentQuestion.romaji})
                          </span>
                        )}
                        {' '}into your mic, or tap Continue below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Center Mic Button Flanked by Waveforms */}
                <div className="flex flex-col items-center justify-center my-auto py-1">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <SoundWaveBars isListening={isListening} />
                    
                    {/* Glowing Red Microphone Button */}
                    <button
                      onClick={handleMicListen}
                      className={`w-15 h-15 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-10 ${
                        isListening ? 'ring-4 sm:ring-5 ring-red-200 dark:ring-red-900 animate-pulse' : ''
                      }`}
                      aria-label="Tap to speak"
                    >
                      {isListening ? (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-1.5 h-7 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      ) : (
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                      )}
                    </button>

                    <SoundWaveBars isListening={isListening} />
                  </div>

                  <span className="text-[11px] sm:text-xs font-bold text-stone-600 dark:text-stone-300 mt-1">
                    {isListening ? 'Listening...' : 'Tap to Speak'}
                  </span>

                  {/* Engine Switcher Pill */}
                  <div className="flex flex-col items-center mt-2">
                    <div className="flex items-center gap-1 bg-stone-100/90 dark:bg-stone-800/90 p-0.5 sm:p-1 rounded-full border border-stone-200/60 dark:border-white/10 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleEngineChange('google')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                          speechEngine === 'google'
                            ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-white shadow-xs'
                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                        }`}
                      >
                        <span className="text-[#4285F4] font-black">G</span>
                        <span>Google Speech</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEngineChange('whisper')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                          speechEngine === 'whisper'
                            ? 'bg-white dark:bg-stone-700 text-rose-600 dark:text-rose-400 shadow-xs'
                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                        }`}
                      >
                        <span className="text-amber-500">⚡</span>
                        <span>Cloud Whisper</span>
                      </button>
                    </div>

                    {/* OnePlus 12 / ColorOS Settings Guide Link */}
                    <button
                      type="button"
                      onClick={() => setShowOnePlusHelp(true)}
                      className="mt-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>💡</span>
                      <span>Enable Google Speech on OnePlus / ColorOS →</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Actions: Skip practice & Continue */}
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-2 w-full">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('answer')}
                    className="flex-1 max-w-[150px] py-2 sm:py-2.5 px-3.5 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-stone-50 dark:bg-stone-800/80 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs border border-stone-200/80 dark:border-white/10 shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                  >
                    Skip practice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAnswered) {
                        nextQuestion();
                      } else {
                        setCurrentStep('answer');
                      }
                    }}
                    className="flex-1 max-w-[170px] py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{isAnswered ? 'Next Question →' : 'Continue →'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* BOTTOM FOOTER CONTROLS: Zen BGM & AFK (Zero duplicates!) */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between flex-shrink-0 pt-1 pb-0.5 px-1">
        <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
          ことばで、つながる。
        </div>
        <div className="flex items-center gap-2.5">
          {/* Zen BGM Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBgm();
            }}
            className="glass-pill rounded-full px-3 py-1.5 flex items-center gap-2 text-xs cursor-pointer transition-all"
            title={isBgmPlaying ? "Pause Ambient BGM" : "Play Ambient BGM"}
          >
            <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-[9px]">
              🎵
            </span>
            <span className="font-bold text-stone-700 dark:text-stone-200 text-xs">
              Zen BGM
            </span>
            <div className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isBgmPlaying ? 'bg-[#e11d48]' : 'bg-stone-300 dark:bg-stone-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${isBgmPlaying ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* AFK Screensaver Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerAfk();
            }}
            className="glass-pill rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer"
            title="Launch AFK Japanese Screensaver"
          >
            <span>🌸</span>
            <span>AFK</span>
          </button>
        </div>
      </footer>

      {/* OnePlus 12 & ColorOS Google Speech Setup Guide Modal */}
      {showOnePlusHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/30 dark:bg-black/80 backdrop-blur-sm animate-modal-backdrop">
          <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-100 dark:border-rose-900/40 relative animate-modal-card">
            {/* Header Badge */}
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-rose-950/80 border-2 border-red-200 dark:border-rose-800 shadow-md flex items-center justify-center text-2xl mx-auto -mt-11 sm:-mt-12 mb-3">
              📱
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight text-center">
              OnePlus 12 / ColorOS Guide
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 text-center mt-1">
              Enable native Google Speech just like Samsung Galaxy Tab!
            </p>

            {/* Explanatory banner */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 my-3.5 text-left text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-black">Why does Samsung work but OnePlus aborts?</span> ColorOS sets OPPO HeyTap Voice as default assistant instead of Google. Switching it enables real-time Japanese speech recognition in Chrome.
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2.5 text-left text-xs sm:text-sm">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-100">Open Settings</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">Go to phone <b>Settings → Apps</b>.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-100">Select Default Apps</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">Tap <b>Default Apps → Digital Assistant App</b>.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-100">Set Default to Google</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px]">Select <b>Google</b> (or <i>Speech Services by Google</i>).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Done! Return to Nihongo</span>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">Select <b>🎙️ Google Speech</b> mode and tap the mic.</p>
                </div>
              </div>
            </div>

            {/* Note about Cloud Whisper */}
            <div className="mt-3.5 text-[11px] text-stone-500 dark:text-stone-400 text-center leading-normal">
              💡 Or continue with <b>⚡ Cloud Whisper</b> — updated with smart voice detection & vowel flexibility!
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOnePlusHelp(false)}
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-900 font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer mt-4"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
