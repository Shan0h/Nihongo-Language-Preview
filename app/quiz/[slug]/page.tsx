'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getQuestionsByCategory, categories } from '@/data/questions';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';
import { getSRSData, updateSRSData, calculateWeight } from '@/app/utils/srs';
import { Question } from '@/data/questions';
import AudioWave from '@/app/components/AudioWave';
import { supabase } from '@/app/utils/supabase';

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

  // Auto-play TTS when question loads
  useEffect(() => {
    if (isReady && quizQuestions[currentIndex] && !showResult) {
      speakJapanese(quizQuestions[currentIndex].japanese_text);
      setSpokenTranscript('');
      setSpeechError('');
    }
  }, [currentIndex, showResult, isReady, quizQuestions]);

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

  const currentQuestion = quizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correct_answer;
    updateSRSData(currentQuestion.id, isCorrect);

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      sfx.playCorrect();
    } else {
      setStreak(0);
      sfx.playWrong();
    }
  };

  const handleMicListen = () => {
    if (isAnswered || isListening) return;

    setSpeechError('');
    setSpokenTranscript('');
    setIsListening(true);

    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.start(
        (result) => {
          const spoken = result.transcript;
          setSpokenTranscript(spoken);

          // Find if spoken text matches any option or correct answer
          const matchedOption = currentQuestion.options.find(
            (opt) => spoken.includes(opt) || opt.includes(spoken)
          );

          if (matchedOption) {
            handleAnswer(matchedOption);
          } else if (spoken.includes(currentQuestion.correct_answer)) {
            handleAnswer(currentQuestion.correct_answer);
          } else {
            setSpeechError(`You said "${spoken}". Say one of the options or tap below.`);
          }
        },
        (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      
      // Save score to leaderboard
      const percentage = Math.round((score / quizQuestions.length) * 100);
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

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
  };

  if (showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const totalPoints = score * 1000 + streak * 250;
    
    let rankTitle = "🌸 SAMURAI LEARNER";
    let rankColor = "text-blue-600 dark:text-blue-400";
    if (percentage === 100) {
      rankTitle = "👑 SAMURAI MASTER";
      rankColor = "text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    } else if (percentage >= 80) {
      rankTitle = "🌟 GOLD SHOGUN";
      rankColor = "text-amber-500";
    } else if (percentage >= 60) {
      rankTitle = "⭐ NINJA WARRIOR";
      rankColor = "text-rose-600 dark:text-rose-400";
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff0f3] via-[#ffe4e6] to-[#fff0f3] dark:from-rose-950 dark:via-red-950 dark:to-pink-950 transition-colors duration-500 flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/sakura-pattern.png')] opacity-10 dark:opacity-5 pointer-events-none mix-blend-overlay"></div>
        <div className="max-w-md w-full card-cultural p-6 sm:p-8 text-center text-[#4c0519] dark:text-white bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white dark:border-white/10 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(244,63,94,0.1)] rounded-3xl animate-scale-in z-10 relative">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🏆</div>
          <span className={`inline-block px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 border border-white dark:border-white/10 shadow-sm font-black text-xs sm:text-sm tracking-widest uppercase mb-3 ${rankColor}`}>
            {rankTitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mb-1">STAGE CLEAR!</h2>
          <p className="text-sm text-[#64748b] dark:text-slate-300 font-bold mb-6">Topic: {category.name}</p>

          {/* Premium Score Board */}
          <div className="bg-white/50 dark:bg-black/40 backdrop-blur-sm p-5 rounded-2xl border border-white/50 dark:border-white/10 mb-6 shadow-inner">
            <div className="text-xs font-black text-[#64748b] dark:text-slate-400 tracking-widest uppercase mb-1">TOTAL POINTS</div>
            <div className="text-5xl sm:text-6xl font-black text-amber-500 font-mono tracking-widest drop-shadow-sm mb-2">
              {String(totalPoints).padStart(6, '0')}
            </div>
            <div className="text-xs font-bold text-[#64748b] dark:text-slate-300 bg-white/60 dark:bg-white/10 py-1.5 px-3 rounded-xl inline-block shadow-sm">
              ACCURACY: {score} / {quizQuestions.length} ({percentage}%)
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={resetQuiz}
              className="btn-torii w-full py-3.5 text-sm sm:text-base font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              🔄 Play Again
            </button>
            <Link 
              href="/"
              className="w-full py-3.5 text-sm sm:text-base font-black inline-block text-center rounded-xl bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 text-[#4c0519] dark:text-white border border-rose-100 dark:border-white/10 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              ⛩️ Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPoints = score * 1000;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#fff0f3] via-[#ffe4e6] to-[#fff0f3] dark:from-rose-950 dark:via-red-950 dark:to-pink-950 transition-colors duration-500 flex flex-col relative">
      <div className="absolute inset-0 bg-[url('/sakura-pattern.png')] opacity-10 dark:opacity-5 pointer-events-none mix-blend-overlay"></div>
      
      {/* Glassmorphic Header */}
      <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border-b border-white/50 dark:border-white/10 flex-shrink-0 shadow-sm z-10 relative">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/topics" className="text-xs sm:text-sm font-bold text-[#64748b] dark:text-slate-300 hover:text-rose-500 transition-colors">
            ← Topics
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Category */}
            <div className="text-xs sm:text-sm font-bold text-[#4c0519] dark:text-white hidden sm:block bg-white/50 dark:bg-white/10 px-3 py-1 rounded-full shadow-sm border border-white/50 dark:border-white/5">
              {category.emoji} {category.name}
            </div>

            {/* Premium Score HUD Badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-black/50 border border-amber-200 dark:border-amber-900/50 text-[#4c0519] dark:text-white flex items-center gap-2 shadow-sm">
              <span className="text-[10px] text-amber-600 dark:text-amber-500 font-black uppercase tracking-wider">SCORE</span>
              <span className="text-xs sm:text-sm font-black text-amber-500 font-mono tracking-widest drop-shadow-sm">
                {String(totalPoints).padStart(6, '0')}
              </span>
            </div>

            {/* Streak Badge */}
            {streak > 1 && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black shadow-md animate-pulse">
                🔥 {streak}x
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-rose-100/50 dark:bg-rose-950/50">
          <div 
            className="h-1.5 bg-gradient-to-r from-rose-400 to-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-3 sm:px-5 py-2 sm:py-3 flex-1 flex flex-col justify-between z-10 relative min-h-0">
        {/* Question Card - Glassmorphic */}
        <div className="card-cultural bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-4 sm:p-5 lg:p-6 mb-2 flex-1 flex flex-col justify-start gap-2 sm:gap-4 rounded-2xl min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div>
            <div className="text-[10px] sm:text-xs font-black text-rose-500 dark:text-rose-400 tracking-wider uppercase mb-3 bg-rose-50 dark:bg-rose-950/50 inline-block px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900/30 shadow-sm">
              QUESTION {currentIndex + 1} OF {quizQuestions.length}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-3 text-center sm:text-left">
              {/* Prominent Question Image Illustration Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-md border-2 border-white dark:border-white/20 flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
                {currentQuestion.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={currentQuestion.imageUrl} alt={currentQuestion.japanese_text} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentQuestion.image || "🇯🇵"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#4c0519] dark:text-white tracking-wide">
                    {currentQuestion.japanese_text}
                  </h2>
                  <button
                    onClick={() => speakJapanese(currentQuestion.japanese_text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 text-[#4c0519] dark:text-white rounded-full transition-all shadow-sm active:scale-95 text-[10px] sm:text-xs font-bold border border-white dark:border-white/20"
                    title="Listen to Japanese Pronunciation"
                    aria-label="Listen"
                  >
                    <span className="text-sm">🔊</span> Listen
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="px-4 py-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-sm text-[#64748b] dark:text-slate-300 rounded-full text-xs sm:text-sm font-bold border border-white dark:border-white/10 shadow-sm">
                    {currentQuestion.english_translation}
                  </span>
                </div>
              </div>
            </div>

            {/* Microphone Voice Answer Section */}
            <div className="p-3 sm:p-4 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white dark:border-white/5 text-center my-3 shadow-inner">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleMicListen}
                  disabled={isAnswered || isListening}
                  className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all overflow-hidden ${
                    isListening
                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-[0_0_20px_rgba(225,29,72,0.3)] ring-4 ring-rose-200/50 dark:ring-rose-900/50 scale-105'
                      : isAnswered
                      ? 'bg-gray-100/50 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/5'
                      : 'bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[#4c0519] dark:text-white active:scale-95 border border-white dark:border-white/20 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isListening && (
                    <span className="absolute inset-0 w-full h-full bg-rose-400/20 animate-pulse"></span>
                  )}
                  {isListening ? (
                    <AudioWave />
                  ) : (
                    <span className="text-lg">🎤</span>
                  )}
                  <span className="relative z-10">{isListening ? 'Listening...' : 'Speak Answer'}</span>
                </button>
              </div>

              {spokenTranscript && (
                <div className="mt-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 inline-block shadow-sm">
                  🎙️ &quot;{spokenTranscript}&quot;
                </div>
              )}

              {speechError && (
                <div className="mt-2 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-900/30 px-4 py-1.5 rounded-full border border-rose-200 dark:border-rose-800/50 inline-block shadow-sm">
                  {speechError}
                </div>
              )}
            </div>
          </div>

          {/* Tactile Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selectedAnswer;

              let className = `w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-300 font-bold shadow-sm hover:shadow-md active:scale-95 `;

              if (isAnswered) {
                if (isCorrect) {
                  className += 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-[1.02] z-10 text-emerald-800 dark:text-emerald-300';
                } else if (isSelected) {
                  className += 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 opacity-90 text-rose-800 dark:text-rose-300';
                } else {
                  className += 'bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/5 opacity-50 grayscale-[0.5] text-[#64748b] dark:text-slate-500';
                }
              } else {
                className += 'bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border-white dark:border-white/20 hover:scale-[1.02] text-[#4c0519] dark:text-white';
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
                      <div className="text-lg sm:text-xl mb-0.5">{option}</div>
                      {currentQuestion.option_hiragana?.[option] && (
                        <div className={`text-[10px] sm:text-xs opacity-80`}>
                          {currentQuestion.option_hiragana[option]}
                        </div>
                      )}
                    </div>
                    {isAnswered && isCorrect && <span className="text-2xl drop-shadow-sm animate-bounce">✨</span>}
                    {isAnswered && isSelected && !isCorrect && <span className="text-xl opacity-60">✕</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button Footer Bar */}
        {isAnswered && (
          <div className="flex justify-end pb-2 pt-1 flex-shrink-0">
            <button 
              onClick={nextQuestion}
              className="px-6 sm:px-8 py-2.5 bg-[#4c0519] dark:bg-white text-white dark:text-[#4c0519] rounded-full text-xs sm:text-sm font-black flex items-center gap-2 shadow-[0_10px_20px_rgba(76,5,25,0.2)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all animate-fade-in-up"
            >
              {currentIndex === quizQuestions.length - 1 ? "Complete Quiz" : "Continue"} <span className="text-lg">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
