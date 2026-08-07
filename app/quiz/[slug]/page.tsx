'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getQuestionsByCategory, categories } from '@/data/questions';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer, isSpeechRecognitionSupported } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';

export default function QuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = categories.find(c => c.slug === slug);
  const quizQuestions = getQuestionsByCategory(slug);

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

  // Auto-play TTS when question loads
  useEffect(() => {
    if (quizQuestions[currentIndex] && !showResult) {
      speakJapanese(quizQuestions[currentIndex].japanese_text);
      setSpokenTranscript('');
      setSpeechError('');
    }
  }, [currentIndex, showResult]);

  if (!category || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <p className="text-base sm:text-lg mb-4">Category not found</p>
          <Link href="/" className="btn-torii px-4 sm:px-6 py-2 text-sm sm:text-base">Back to Home</Link>
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

    if (answer === currentQuestion.correct_answer) {
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

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
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
    let rankColor = "text-blue-600";
    if (percentage === 100) {
      rankTitle = "👑 SAMURAI MASTER";
      rankColor = "glow-score-gold";
    } else if (percentage >= 80) {
      rankTitle = "🌟 GOLD SHOGUN";
      rankColor = "text-amber-500";
    } else if (percentage >= 60) {
      rankTitle = "⭐ NINJA WARRIOR";
      rankColor = "text-[#d32f2f]";
    }
    
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="max-w-md w-full arcade-score-card p-6 sm:p-8 text-center text-white border-4 border-[#f59e0b] shadow-2xl">
          <div className="text-5xl sm:text-6xl mb-2 animate-bounce">🏆</div>
          <span className={`inline-block px-4 py-1 rounded-full bg-white/10 font-black text-xs sm:text-sm tracking-widest uppercase mb-2 ${rankColor}`}>
            {rankTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-1">STAGE CLEAR!</h2>
          <p className="text-xs text-[#a0a0a0] mb-4">Topic: {category.name}</p>

          {/* Gaming Score Board */}
          <div className="bg-[#0b0a12] p-4 rounded-2xl border border-amber-500/40 mb-5">
            <div className="text-xs font-bold text-[#8a8a8a] tracking-widest uppercase mb-1">TOTAL POINTS</div>
            <div className="text-4xl sm:text-5xl font-black glow-score-gold font-mono tracking-widest">
              {String(totalPoints).padStart(6, '0')}
            </div>
            <div className="mt-2 text-xs font-bold text-slate-300">
              ACCURACY: {score} / {quizQuestions.length} ({percentage}%)
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button 
              onClick={resetQuiz}
              className="btn-torii w-full py-3 text-base sm:text-lg font-black shadow-lg"
            >
              🔄 Play Again
            </button>
            <Link 
              href="/"
              className="btn-gold w-full py-3 text-base sm:text-lg font-black inline-block text-center shadow-lg"
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
    <div className="min-h-screen lg:h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#fdfbf7] flex flex-col justify-between">
      {/* Arcade Header */}
      <div className="border-b bg-white flex-shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-xs sm:text-sm font-bold text-[#8a8a8a] hover:text-[#d32f2f]">
            ← Home
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Category */}
            <div className="text-xs sm:text-sm font-bold text-[#2d2d2d] hidden sm:block">
              {category.emoji} {category.name}
            </div>

            {/* Arcade Score HUD Badge */}
            <div className="px-3 py-1 rounded-xl bg-[#12101f] border border-[#f59e0b] text-white flex items-center gap-2 shadow-xs">
              <span className="text-[10px] text-[#8a8a8a] font-black uppercase tracking-wider">SCORE</span>
              <span className="text-xs sm:text-sm font-black glow-score-gold font-mono tracking-widest">
                {String(totalPoints).padStart(6, '0')}
              </span>
            </div>

            {/* Streak Badge */}
            {streak > 1 && (
              <div className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 text-white text-[11px] font-black streak-badge shadow-xs">
                🔥 {streak}x STREAK
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-[#f4c2c2]">
          <div 
            className="h-1.5 bg-gradient-to-r from-[#d32f2f] to-[#f59e0b] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-3 sm:px-5 py-3 sm:py-4 flex-1 flex flex-col justify-between">
        {/* Question Card */}
        <div className="card-cultural p-4 sm:p-6 lg:p-6 mb-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs font-black text-[#d32f2f] tracking-wider uppercase mb-2">
              QUESTION {currentIndex + 1} OF {quizQuestions.length}
            </div>

            <div className="flex items-center gap-4 sm:gap-5 mb-3">
              {/* Prominent Question Image Illustration Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#fce4ec] via-white to-[#f4c2c2]/40 border-2 border-[#f4c2c2] flex items-center justify-center text-4xl sm:text-5xl shadow-md flex-shrink-0 overflow-hidden ring-4 ring-[#f4c2c2]/20">
                {currentQuestion.imageUrl ? (
                  <img src={currentQuestion.imageUrl} alt={currentQuestion.japanese_text} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentQuestion.image || "🇯🇵"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                    {currentQuestion.japanese_text}
                  </h2>
                  <button
                    onClick={() => speakJapanese(currentQuestion.japanese_text)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#fce4ec] text-[#d32f2f] rounded-full hover:bg-[#d32f2f] hover:text-white transition-all shadow-xs active:scale-95 text-xs font-bold"
                    title="Listen to Japanese Pronunciation"
                    aria-label="Listen"
                  >
                    <span>🔊</span> Listen Audio
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-950/80 text-[#b91c1c] dark:text-red-300 rounded-lg text-xs sm:text-sm font-black border-2 border-red-300 dark:border-red-700 shadow-2xs">
                    🈁 Hiragana: {currentQuestion.hiragana}
                  </span>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 rounded-lg text-xs sm:text-sm font-black border-2 border-amber-300 dark:border-amber-700">
                    🔤 Romaji: {currentQuestion.romaji}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg text-xs sm:text-sm font-extrabold border border-slate-300 dark:border-slate-700">
                    💬 Meaning: {currentQuestion.english_translation}
                  </span>
                </div>
              </div>
            </div>

            {/* Microphone Voice Answer Section */}
            <div className="p-3 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 rounded-xl border border-[#f4c2c2]/60 text-center my-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-[#5a5a5a] font-bold">
                  🎤 Speak to Answer or Practice Pronunciation:
                </p>
                <button
                  onClick={handleMicListen}
                  disabled={isAnswered || isListening}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : isAnswered
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#d32f2f] text-white hover:bg-[#b71c1c] active:scale-95'
                  }`}
                >
                  <span className="text-base">{isListening ? '🎙️' : '🎤'}</span>
                  <span>{isListening ? 'Listening... Speak Now!' : 'Speak Answer (Mic)'}</span>
                </button>
              </div>

              {spokenTranscript && (
                <div className="mt-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200 inline-block">
                  🎙️ Spoken: "{spokenTranscript}"
                </div>
              )}

              {speechError && (
                <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200 inline-block">
                  ⚠️ {speechError}
                </div>
              )}
            </div>
          </div>

          {/* Kahoot 4-Color Shape Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selectedAnswer;

              const kahootStyles = [
                { bg: 'btn-kahoot-red', shape: '🔺' },
                { bg: 'btn-kahoot-blue', shape: '🔷' },
                { bg: 'btn-kahoot-yellow', shape: '🟡' },
                { bg: 'btn-kahoot-green', shape: '🟩' },
              ];
              const kStyle = kahootStyles[index % 4];

              let className = `w-full text-left p-3.5 sm:p-4 rounded-xl text-sm sm:text-base font-black transition-all shadow-md active:scale-95 ${kStyle.bg} `;

              if (isAnswered) {
                if (isCorrect) {
                  className += 'ring-4 ring-green-400 brightness-110 scale-[1.01]';
                } else if (isSelected) {
                  className += 'ring-4 ring-red-400 opacity-90';
                } else {
                  className += 'opacity-40 grayscale-[0.3]';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={className}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl drop-shadow-sm">{kStyle.shape}</span>
                      <div>
                        <div className="text-base sm:text-lg font-black text-white">{option}</div>
                        {currentQuestion.option_hiragana?.[option] && (
                          <div className="text-xs text-white/90 font-semibold mt-0.5">
                            🈁 {currentQuestion.option_hiragana[option]}
                          </div>
                        )}
                      </div>
                    </div>
                    {isAnswered && isCorrect && <span className="text-2xl drop-shadow-md">✅</span>}
                    {isAnswered && isSelected && !isCorrect && <span className="text-2xl drop-shadow-md">❌</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button Footer Bar */}
        {isAnswered && (
          <div className="flex justify-end pb-2">
            <button 
              onClick={nextQuestion}
              className="btn-torii px-6 py-2.5 text-base flex items-center gap-2 shadow-lg"
            >
              {currentIndex === quizQuestions.length - 1 ? "See Results 🎉" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
