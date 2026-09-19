'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getQuestionsByCategory, categories } from '@/data/questions';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer, matchOptionFromSpeech } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';
import { getSRSData, updateSRSData, calculateWeight } from '@/app/utils/srs';
import { Question } from '@/data/questions';
import AudioWave from '@/app/components/AudioWave';
import { supabase } from '@/app/utils/supabase';
import CertificateModal from '@/app/components/CertificateModal';

export default function QuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = categories.find(c => c.slug === slug);
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
  const speechRecognizerRef = useRef<JapaneseSpeechRecognizer | null>(null);

  useEffect(() => {
    speechRecognizerRef.current = new JapaneseSpeechRecognizer();
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const srsData = getSRSData();
    const sorted = [...getQuestionsByCategory(slug)].sort((a, b) => {
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
          <p className="text-base sm:text-lg mb-6 font-bold text-[#4c0519] dark:text-white">Topic not found 🌸</p>
          <Link href="/" className="btn-torii px-4 sm:px-6 py-3 text-sm sm:text-base font-black w-full inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Pre-Quiz Countdown Screen matching user's exact reference image
  if (countdown !== 'finished') {
    return (
      <div 
        onClick={() => setCountdown('finished')}
        className="min-h-screen bg-seigaiha flex flex-col justify-between items-center py-16 sm:py-24 px-4 select-none cursor-pointer transition-colors duration-300 relative overflow-hidden"
      >
        <div />

        {/* Center Hero: GET READY! + Large Bold Red GO/Count */}
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-600 dark:text-stone-300 tracking-[0.25em] uppercase mb-4 animate-pulse">
            GET READY!
          </h2>

          <div 
            key={countdown} 
            className="text-8xl sm:text-9xl font-black text-[#c5221f] dark:text-rose-500 font-sans tracking-tight animate-scale-in my-2 drop-shadow-xs"
          >
            {countdown}
          </div>
        </div>

        {/* Category Label at bottom */}
        <div className="text-sm sm:text-base font-semibold text-stone-500 dark:text-stone-400">
          {category?.name || slug}
        </div>
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

    if (speechRecognizerRef.current) {
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
            result.alternatives
          );

          if (matchedOption) {
            setSpeechSuccess(`Great pronunciation! You said "${spoken}"`);
            handleAnswer(matchedOption);
          } else {
            setSpeechError(`You said "${spoken}". Tap an option or try speaking again.`);
          }
        },
        (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        },
        () => {
          setIsListening(true);
        }
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
          totalQuestions={quizQuestions.length}
          accuracyPercentage={percentage}
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
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#0a0a0a] text-stone-900 dark:text-white flex flex-col justify-between p-3 sm:p-5 select-none relative overflow-x-hidden">

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

      {/* Top Bar: Back & Category Title */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pt-1 pb-2 px-1">
        <Link
          href="/topics"
          className="inline-flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-red-600 transition-colors"
        >
          ‹ Back
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-500 tracking-tight text-center">
          {category.name}
        </h1>
        <div className="w-12"></div>
      </div>

      {/* HUD Stats Row */}
      <div className="max-w-xl mx-auto w-full px-2">
        <div className="flex items-center justify-between text-center mb-1">
          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div className="text-left">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Score</div>
              <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono leading-none">
                {score * 20} <span className="text-xs text-stone-400 font-sans">pt</span>
              </div>
            </div>
          </div>

          {/* Question Counter */}
          <div>
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Question</div>
            <div className="text-base sm:text-lg font-black text-stone-800 dark:text-white font-mono leading-none">
              {currentIndex + 1} <span className="text-xs text-stone-400 font-sans">/ {quizQuestions.length}</span>
            </div>
          </div>

          {/* Accuracy with Castle Badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Accuracy</div>
              <div className="text-base sm:text-lg font-black text-red-600 dark:text-red-400 font-mono leading-none">
                {accuracyPercentage}%
              </div>
            </div>
            <span className="text-2xl">🏯</span>
          </div>
        </div>

        {/* Primary Progress Bar (Pink Gradient) */}
        <div className="h-2 w-full bg-rose-100 dark:bg-rose-950/40 rounded-full overflow-hidden mt-3 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-rose-300 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Master Level Indicator */}
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="flex items-center gap-1 text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
            <span>🏯</span>
            <span className="text-red-600">Master</span>
          </div>
          <div className="h-1.5 flex-1 bg-rose-100 dark:bg-rose-950/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(20, (streak + 1) * 20))}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-stone-400 shrink-0">
            {Math.min(streak, 1)}/1
          </span>
        </div>

        {/* 3-Stage Learning Stepper: LISTEN -> PRACTICE -> ANSWER */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 pt-1">
          {/* Back Step */}
          <button
            onClick={() => setCurrentStep(currentStep === 'answer' ? 'practice' : 'listen')}
            className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-red-600 flex items-center justify-center text-xs font-black transition-colors"
            title="Previous step"
          >
            ◀
          </button>

          {/* Step 1: LISTEN */}
          <button
            onClick={() => { handleListen(); setCurrentStep('listen'); }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✓
            </div>
            <span className="text-[10px] font-extrabold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
              LISTEN
            </span>
          </button>

          {/* Connector Line 1 */}
          <div className="h-0.5 w-8 sm:w-12 bg-rose-200 dark:bg-rose-900/50 mb-3" />

          {/* Step 2: PRACTICE */}
          <button
            onClick={() => setCurrentStep('practice')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${currentStep === 'practice'
                ? 'bg-red-600 text-white ring-4 ring-red-100 scale-105'
                : 'bg-red-100 text-red-600'
              }`}>
              🎤
            </div>
            <span className={`text-[10px] font-extrabold tracking-wider uppercase ${currentStep === 'practice' ? 'text-red-600 dark:text-red-400' : 'text-stone-400'
              }`}>
              PRACTICE
            </span>
          </button>

          {/* Connector Line 2 */}
          <div className="h-0.5 w-8 sm:w-12 bg-rose-200 dark:bg-rose-900/50 mb-3" />

          {/* Step 3: ANSWER */}
          <button
            onClick={() => setCurrentStep('answer')}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${currentStep === 'answer' || isAnswered
                ? 'bg-red-600 text-white ring-4 ring-red-100 scale-105'
                : 'bg-rose-100 text-rose-500'
              }`}>
              ✏️
            </div>
            <span className={`text-[10px] font-extrabold tracking-wider uppercase ${currentStep === 'answer' || isAnswered ? 'text-red-600 dark:text-red-400' : 'text-stone-400'
              }`}>
              ANSWER
            </span>
          </button>
        </div>
      </div>

      {/* Main Learning Card with Seigaiha Waves */}
      <div className="max-w-xl mx-auto w-full my-2 px-2 flex-1 flex flex-col justify-center">
        <div
          className="bg-white/95 dark:bg-[#141414] border border-rose-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden text-center"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Cpath d='M0 30 A30 30 0 0 1 60 30 M10 30 A20 20 0 0 1 50 30 M20 30 A10 10 0 0 1 40 30' fill='none' stroke='%23fecdd3' stroke-width='1.2' stroke-opacity='0.45'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "60px 30px"
          }}
        >
          {/* Question Illustration Frame */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white dark:bg-black/40 rounded-3xl border border-rose-100 dark:border-white/10 shadow-xs flex items-center justify-center mx-auto overflow-hidden relative mb-4">
            {currentQuestion.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentQuestion.imageUrl}
                alt={currentQuestion.japanese_text}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl sm:text-7xl animate-bounce">
                {currentQuestion.image || "🌸"}
              </span>
            )}
          </div>

          {/* Meaning Label */}
          <div className="text-xs sm:text-sm text-stone-500 uppercase font-semibold tracking-wider my-2">
            MEANING: <span className="text-base sm:text-lg text-stone-900 dark:text-white font-extrabold normal-case">{currentQuestion.english_translation}</span>
          </div>

          {/* Tap to listen Button */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleListen}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full hover:bg-rose-50 dark:hover:bg-white/10 transition-all group active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-200 dark:border-rose-800 text-red-600 dark:text-rose-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
                🔊
              </div>
              <span className="text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 group-hover:text-red-600 transition-colors">
                Tap to listen
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Guided Section: PRACTICE vs ANSWER */}
      <div className="max-w-xl mx-auto w-full px-2 pb-2">
        {currentStep === 'answer' ? (
          /* STEP 3: ANSWER - Interactive Tactile Options Grid */
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Choose the correct Japanese phrase:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.correct_answer;
                const isSelected = option === selectedAnswer;

                let className = `w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all font-bold shadow-xs cursor-pointer active:scale-95 `;

                if (isAnswered) {
                  if (isCorrect) {
                    className += 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-[1.01]';
                  } else if (isSelected) {
                    className += 'bg-rose-50 border-rose-300 text-rose-700 opacity-90';
                  } else {
                    className += 'bg-white/60 border-stone-200 opacity-40 text-stone-400';
                  }
                } else {
                  className += 'bg-white hover:bg-rose-50/50 border-stone-200 hover:border-red-300 text-stone-800 hover:scale-[1.01]';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={className}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base sm:text-lg">{option}</div>
                        {currentQuestion.option_hiragana?.[option] && (
                          <div className="text-[11px] text-stone-400 font-normal mt-0.5">
                            {currentQuestion.option_hiragana[option]}
                          </div>
                        )}
                      </div>
                      {isAnswered && isCorrect && <span className="text-xl">✨</span>}
                      {isAnswered && isSelected && !isCorrect && <span className="text-lg opacity-60">✕</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions in Answer Step */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep('practice')}
                className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-all"
              >
                ← Back to practice
              </button>
              {isAnswered && (
                <button
                  onClick={nextQuestion}
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {currentIndex === quizQuestions.length - 1 ? 'Complete Quiz 🏆' : 'Continue →'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: PRACTICE - Mt. Fuji Mic & Friendly Speech Flow */
          <div className="flex flex-col items-center">
            {/* Guidance Banner */}
            <div className="bg-white dark:bg-[#141414] border border-rose-100 dark:border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xs text-center w-full mb-3">
              {speechSuccess ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
                  <span>🎉</span>
                  <span>{speechSuccess}</span>
                </div>
              ) : speechError ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div className="text-red-600 font-bold text-xs sm:text-sm">
                    ⚠️ {speechError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('answer')}
                    className="px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-rose-300 border border-red-200 dark:border-red-800/60 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer"
                  >
                    Choose answer directly →
                  </button>
                </div>
              ) : isListening ? (
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs sm:text-sm">
                  <AudioWave />
                  <span>Listening... Speak Japanese now!</span>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100">
                    Now your turn — say it out loud.
                  </p>
                  <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
                    Tap the mic to speak, or tap Continue below.
                  </p>
                </div>
              )}

              {spokenTranscript && (
                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
                  🎙️ Spoken: &quot;{spokenTranscript}&quot;
                </div>
              )}
            </div>

            {/* Mt. Fuji Stylized Peak Backdrop & Floating Mic Button */}
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              {/* Conical Mt. Fuji silhouette */}
              <div className="w-56 h-28 absolute bottom-0 pointer-events-none opacity-40">
                <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                  <polygon points="100,0 25,100 175,100" fill="#fecdd3" />
                  <polygon points="100,0 72,38 128,38" fill="#ffffff" />
                </svg>
              </div>

              {/* Big Floating Microphone Button */}
              <button
                onClick={handleMicListen}
                className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white dark:bg-stone-900 border-2 border-red-500 shadow-md flex items-center justify-center text-red-600 text-3xl hover:scale-105 active:scale-95 transition-all relative z-10 cursor-pointer ${isListening ? 'ring-8 ring-red-100 animate-pulse' : ''
                  }`}
                aria-label="Tap to speak"
              >
                {isListening ? <AudioWave /> : <span className="text-3xl">🎤</span>}
              </button>

              <span className="text-xs font-bold text-stone-600 dark:text-stone-300 mt-2 z-10">
                {isListening ? 'Listening...' : 'Tap to Speak'}
              </span>
            </div>

            {/* Bottom Actions: Skip Practice & Continue */}
            <div className="flex items-center justify-center gap-3 mt-4 w-full">
              <button
                onClick={() => setCurrentStep('answer')}
                className="px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 font-bold text-xs sm:text-sm border border-stone-200/80 dark:border-white/10 transition-all cursor-pointer active:scale-95"
              >
                Skip practice
              </button>

              <button
                onClick={() => {
                  if (isAnswered) {
                    nextQuestion();
                  } else {
                    setCurrentStep('answer');
                  }
                }}
                className="px-8 py-3.5 rounded-2xl bg-[#c5221f] hover:bg-[#a51d1a] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isAnswered ? 'Next Question →' : 'Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
