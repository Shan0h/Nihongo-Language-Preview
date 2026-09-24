'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMultiplayer } from '@/app/hooks/useMultiplayer';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer, matchOptionFromSpeech, COLOR_SPEECH_ALIASES, NUMBER_SPEECH_ALIASES, VERB_SPEECH_ALIASES, SpeechEnginePreference } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';
import AudioWave from '@/app/components/AudioWave';

export default function PlayPage() {
  const {
    connected,
    pin,
    gameStatus,
    currentQuestion,
    leaderboard,
    myScore,
    myAnswerCorrect,
    countdown,
    answerRevealed,
    totalQuestions,
    questionIndex,
    error,
    connect,
    joinRoom,
    submitAnswer,
    disconnect,
    setError,
  } = useMultiplayer('player');

  const [phase, setPhase] = useState<'join' | 'lobby' | 'playing' | 'finished' | 'host-left'>('join');
  const [name, setName] = useState('');
  const [roomPin, setRoomPin] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Microphone Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [isConnectingMic, setIsConnectingMic] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const [speechEngine, setSpeechEngine] = useState<SpeechEnginePreference>('google');
  const speechRecognizerRef = useRef<JapaneseSpeechRecognizer | null>(null);

  useEffect(() => {
    const recognizer = new JapaneseSpeechRecognizer();
    speechRecognizerRef.current = recognizer;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_speech_engine') as SpeechEnginePreference | null;
      if (saved === 'google' || saved === 'auto' || saved === 'whisper') {
        setSpeechEngine(saved);
        recognizer.setEngine(saved);
      } else {
        setSpeechEngine('google');
        recognizer.setEngine('google');
      }
    }
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.cancel();
      }
    };
  }, []);

  const handleEngineChange = (engine: SpeechEnginePreference) => {
    setSpeechEngine(engine);
    speechRecognizerRef.current?.setEngine(engine);
  };

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Update phase based on game status and error
  useEffect(() => {
    if (error && error.includes('Host has disconnected')) {
      setPhase('host-left');
    } else if (gameStatus === 'waiting') {
      setPhase('lobby');
    } else if (gameStatus === 'playing') {
      setPhase('playing');
    } else if (gameStatus === 'finished') {
      setPhase('finished');
    }
  }, [gameStatus, error]);

  // Reset answer state when new question index arrives
  const questionIdx = currentQuestion?.questionIndex;
  const playedRevealSoundRef = useRef<number | null>(null);
  useEffect(() => {
    if (questionIdx !== undefined) {
      setSelectedAnswer(null);
      setHasAnswered(false);
      setSpokenTranscript('');
      setSpeechError('');
    }
  }, [questionIdx]);

  // Play sound effect when answer is revealed for player
  useEffect(() => {
    if (answerRevealed && currentQuestion) {
      if (playedRevealSoundRef.current === currentQuestion.questionIndex) return;
      playedRevealSoundRef.current = currentQuestion.questionIndex;
      const isCorrect = myAnswerCorrect !== null
        ? myAnswerCorrect
        : (selectedAnswer ? selectedAnswer === currentQuestion.question.correct_answer : false);
      if (isCorrect) {
        sfx.playCorrect();
      } else {
        sfx.playWrong();
      }
    }
  }, [answerRevealed, myAnswerCorrect, selectedAnswer, currentQuestion]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomPin.trim()) return;
    joinRoom(roomPin, name);
    setPhase('lobby');
  };

  const handleAnswer = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
    setHasAnswered(true);
    sfx.playTap();
    submitAnswer(answer);
  };

  const handleMicListen = () => {
    if (hasAnswered || !currentQuestion) return;

    if (isListening || isConnectingMic) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
      setIsConnectingMic(false);
      return;
    }

    setSpeechError('');
    setSpokenTranscript('');
    setIsConnectingMic(true);
    setIsListening(false);

    if (speechRecognizerRef.current) {
      const q = currentQuestion.question;
      const vocabList = [
        q.correct_answer,
        ...q.options,
        q.japanese_text,
      ];
      if (q.romaji) {
        vocabList.push(q.romaji.toLowerCase());
      }
      if (q.option_hiragana) {
        Object.values(q.option_hiragana).forEach((h) => {
          const clean = h.replace(/\s*\([^)]*\)/, '');
          vocabList.push(clean);
        });
      }
      // Also add known speech aliases (Kanji/variants/Romaji) for options to anchor context
      [q.correct_answer, ...q.options].forEach((opt) => {
        const aliases = [
          ...(COLOR_SPEECH_ALIASES[opt] || []),
          ...(NUMBER_SPEECH_ALIASES[opt] || []),
          ...(VERB_SPEECH_ALIASES[opt] || []),
        ];
        aliases.forEach((a) => {
          vocabList.push(a);
        });
      });
      const vocabPrompt = Array.from(new Set(vocabList.filter(Boolean))).join('、');

      speechRecognizerRef.current.start(
        (result) => {
          setIsConnectingMic(false);
          setIsListening(false);
          const spoken = result.transcript;
          setSpokenTranscript(spoken);

          const matchedOption = matchOptionFromSpeech(
            spoken,
            q.options,
            q.correct_answer,
            q.option_hiragana,
            result.alternatives,
            q.romaji
          );

          if (matchedOption) {
            handleAnswer(matchedOption);
          } else {
            sfx.playWrong();
            setSpeechError(`❌ Unrecognized pronunciation: "${spoken}". Please try again or tap an option below.`);
          }
        },
        (err) => {
          sfx.playWrong();
          setSpeechError(err);
          setIsListening(false);
          setIsConnectingMic(false);
        },
        () => {
          setIsListening(false);
          setIsConnectingMic(false);
        },
        () => {
          setIsConnectingMic(false);
          setIsListening(true);
          try {
            sfx.playTap();
          } catch {}
        },
        vocabPrompt,
        (newEngine) => {
          setSpeechEngine(newEngine);
        },
        speechEngine,
        q.category
      );
    }
  };

  const handlePlayAgain = () => {
    disconnect();
    setPhase('join');
    setName('');
    setRoomPin('');
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeout(() => {
      connect();
    }, 500);
  };

  // Join form
  if (phase === 'join') {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📱</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Join Multiplayer</h1>
            <p className="text-xs sm:text-sm text-[#5a5a5a] mt-1 sm:mt-2">Enter the PIN from host screen</p>
          </div>

          {/* Connection Status */}
          <div className="mb-4">
            {!connected ? (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-500">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Connecting to server...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected to game server
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
              <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
            </div>
          )}

          <form onSubmit={handleJoin} className="card-zen p-6 sm:p-8 space-y-4 sm:space-y-6 mb-8">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 zen-text-secondary">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white/50 backdrop-blur-sm transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 zen-text-secondary">Game PIN</label>
              <input
                type="text"
                value={roomPin}
                onChange={(e) => setRoomPin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xl sm:text-2xl tracking-[6px] sm:tracking-[8px] text-center font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 bg-white/50 backdrop-blur-sm transition-all uppercase"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!connected}
              className={`w-full py-3 sm:py-4 text-lg sm:text-xl font-medium rounded-full transition-all shadow-md hover:-translate-y-0.5 ${connected
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {connected ? 'Join Game' : 'Connecting...'}
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-6">
            <Link href="/" className="text-xs sm:text-sm text-[#8a8a8a] hover:text-[#d32f2f]">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Waiting lobby
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Waiting for Host...</h1>
          <p className="text-[#5a5a5a] mb-1">Joined with PIN: <span className="font-mono font-bold">{pin}</span></p>
          <p className="text-sm text-[#8a8a8a]">The host will start the game soon</p>
          <div className="mt-6">
            <div className="w-8 h-8 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  if (phase === 'playing' && currentQuestion) {
    const question = currentQuestion.question;

    return (
      <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Arcade Gaming Header */}
          <div className="flex items-center justify-between mb-3 bg-[#12101f] p-3 rounded-2xl border border-amber-500/40 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8a8a8a] font-black tracking-wider uppercase">SCORE</span>
              <span className="text-base sm:text-lg font-black glow-score-gold font-mono tracking-widest">
                {String(myScore || 0).padStart(6, '0')}
              </span>
            </div>

            <span className="text-xs font-bold text-slate-300">
              Q{questionIndex + 1}/{totalQuestions}
            </span>

            <span className={`text-base font-black flex items-center gap-1 ${countdown <= 5 ? 'text-red-400 animate-bounce' : 'glow-score-gold'}`}>
              ⏱ {countdown}s
            </span>
          </div>

          {/* Countdown Progress Bar */}
          <div className="h-2 bg-[#f4c2c2] rounded-full mb-4 overflow-hidden shadow-xs">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${countdown <= 5 ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-[#d32f2f] to-[#f59e0b]'
                }`}
              style={{ width: `${(countdown / 15) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="card-zen p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-4 text-center sm:text-left">
              {/* Question Image Illustration Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl shadow-sm flex-shrink-0 overflow-hidden zen-focus-ring mx-auto sm:mx-0 relative">
                {question.imageUrl ? (
                  <Image
                    src={question.imageUrl}
                    alt={question.japanese_text}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{question.image || '🇯🇵'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-between gap-3">
                  <h2 className="text-3xl sm:text-4xl font-light zen-text-primary">
                    {question.japanese_text}
                  </h2>
                  <button
                    onClick={() => speakJapanese(question.japanese_text)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-red-600 rounded-full transition-all shadow-xs active:scale-95 text-xs font-bold border border-rose-200"
                  >
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs shadow-xs">🔊</span> Tap to listen
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="px-3 py-1 bg-white/60 backdrop-blur-sm zen-text-secondary rounded-full text-[11px] font-medium border border-gray-200/50 shadow-sm">
                    {question.english_translation}
                  </span>
                  {question.romaji && (
                    <span className="px-3 py-1 bg-rose-50/90 text-rose-600 rounded-full text-[11px] font-bold border border-rose-200 shadow-xs font-mono">
                      ROMAJI: {question.romaji}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Microphone Voice Answer Button */}
            <div className="mt-6 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-gray-100 text-center">
              <button
                onClick={handleMicListen}
                disabled={hasAnswered}
                className={`w-full py-3 px-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-xs border cursor-pointer ${
                  isConnectingMic
                    ? 'bg-amber-100 text-amber-700 border-amber-300 ring-4 ring-amber-200 animate-pulse'
                    : isListening
                    ? 'bg-rose-100 text-rose-600 border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.25)] ring-4 ring-rose-200'
                    : hasAnswered
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-stone-800 hover:bg-rose-50/50 hover:text-red-600 active:scale-95 border-rose-200'
                }`}
              >
                {isConnectingMic ? (
                  <svg className="w-5 h-5 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : isListening ? (
                  <AudioWave />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-sm shadow-xs">🎤</span>
                )}
                <span>
                  {isConnectingMic
                    ? 'Starting mic... speak right after tap tone'
                    : isListening
                    ? 'Listening... (Tap to finish)'
                    : 'Tap to Speak'}
                </span>
              </button>

              {spokenTranscript && (
                <div className="mt-2 text-xs font-semibold text-green-700">
                  🎙️ Spoken: &quot;{spokenTranscript}&quot;
                </div>
              )}

              {speechError && (
                <div className="mt-2 text-xs font-medium text-red-600">
                  ⚠️ {speechError}
                </div>
              )}

              {/* Speech Engine Selector */}
              <div className="mt-3 flex flex-col items-center">
                <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm p-0.5 rounded-full text-[10px] font-bold border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleEngineChange('auto')}
                    className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                      speechEngine === 'auto'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    ⚡ Auto (Hybrid)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEngineChange('google')}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      speechEngine === 'google'
                        ? 'bg-white text-stone-800 shadow-xs'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEngineChange('whisper')}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      speechEngine === 'whisper'
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    Whisper
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  {speechEngine === 'auto'
                    ? '⚡ Auto: Uses Whisper for short words (Colors/Numbers) & Google for longer phrases'
                    : speechEngine === 'google'
                    ? 'Native Google recognition (Fast & accurate for Samsung, PC)'
                    : 'Cloud Whisper AI (Context-primed for 100% accuracy)'}
                </p>
              </div>
            </div>
          </div>

          {/* Zen Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {question.options.map((option, index) => {
              const isSelected = option === selectedAnswer;
              const isCorrectOption = option === question.correct_answer;

              let className = `w-full text-left p-4 sm:p-5 btn-zen-option `;

              if (answerRevealed) {
                if (isCorrectOption) {
                  className += '!bg-emerald-50/80 !border-emerald-300 !shadow-[0_0_20px_rgba(52,211,153,0.15)] scale-[1.02]';
                } else if (isSelected) {
                  className += '!bg-rose-50/80 !border-rose-200 opacity-90';
                } else {
                  className += 'opacity-40 grayscale-[0.5]';
                }
              } else if (hasAnswered) {
                if (isSelected) {
                  className += '!border-gray-400 !bg-white/90 scale-[1.02]';
                } else {
                  className += 'opacity-40';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                  className={className}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg sm:text-xl font-medium ${answerRevealed && isCorrectOption ? 'text-emerald-700' : answerRevealed && isSelected ? 'text-rose-700' : 'zen-text-primary'}`}>{option}</div>
                      {question.option_hiragana?.[option] && (
                        <div className={`text-xs mt-1 ${answerRevealed && isCorrectOption ? 'text-emerald-600' : answerRevealed && isSelected ? 'text-rose-600' : 'zen-text-secondary'}`}>
                          {question.option_hiragana[option]}
                        </div>
                      )}
                    </div>
                    {answerRevealed && isCorrectOption && <span className="text-2xl drop-shadow-sm">✨</span>}
                    {answerRevealed && isSelected && !isCorrectOption && <span className="text-xl opacity-60">✕</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Message */}
          {(hasAnswered || answerRevealed) && (
            <div className="text-center">
              {answerRevealed ? (
                (() => {
                  const isCorrect = myAnswerCorrect !== null
                    ? myAnswerCorrect
                    : (selectedAnswer ? selectedAnswer === question.correct_answer : false);
                  return (
                    <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <div className="text-2xl mb-1">{isCorrect ? '🎉' : '😅'}</div>
                      <div className="font-bold">{isCorrect ? 'Correct!' : 'Wrong!'}</div>
                      {!isCorrect && (
                        <div className="text-sm mt-1">Answer: {question.correct_answer}</div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-bold">Answer Submitted!</div>
                  <div className="text-sm mt-1">Waiting for results...</div>
                </div>
              )}
            </div>
          )}

          {/* Score */}
          {myScore !== null && (
            <div className="text-center mt-4">
              <span className="text-sm text-[#8a8a8a]">Your Score: </span>
              <span className="text-lg font-black text-[#d32f2f]">{myScore} pts</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game finished
  if (phase === 'finished') {
    const finalLeaderboard = leaderboard.length > 0
      ? leaderboard
      : (myScore !== null ? [{ name: name || 'You', score: myScore }] : []);
    const myRank = finalLeaderboard.findIndex((e) => e.name === name || e.score === myScore) + 1;

    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-extrabold mb-2">Game Complete!</h1>

          {myScore !== null && (
            <div className="card-zen p-8 mb-8 text-center border border-gray-100 shadow-sm">
              <div className="text-sm zen-text-secondary uppercase tracking-widest font-medium mb-2">Final Score</div>
              <div className="text-6xl font-light text-gray-900 mb-4">{myScore}</div>
              {myRank > 0 && (
                <div className="text-sm font-medium bg-gray-50 inline-block px-4 py-1.5 rounded-full border border-gray-200 text-gray-600">
                  Rank: {myRank === 1 ? '🥇 1st Place' : myRank === 2 ? '🥈 2nd Place' : myRank === 3 ? '🥉 3rd Place' : `#${myRank}`}
                </div>
              )}
            </div>
          )}

          {/* Leaderboard */}
          {finalLeaderboard.length > 0 && (
            <div className="card-zen p-6 mb-8 text-left">
              <h3 className="font-medium mb-4 zen-text-primary px-2">Final Rankings</h3>
              <div className="space-y-2">
                {finalLeaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-2xl ${entry.name === name || (entry.score === myScore && entry.name === 'You')
                        ? 'bg-gray-100 border-none'
                        : 'bg-white border-none'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-400 text-sm font-medium">#{i + 1}</span>}
                      </span>
                      <span className={`font-medium ${entry.name === name || (entry.score === myScore && entry.name === 'You') ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                        {entry.name}
                        {entry.name === name || (entry.score === myScore && entry.name === 'You') ? ' (You)' : ''}
                      </span>
                    </div>
                    <span className="font-medium text-gray-500">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-medium text-lg hover:-translate-y-0.5 transition-all shadow-md"
            >
              Play Again
            </button>
            <Link
              href="/"
              className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-full font-medium text-lg text-center inline-block hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Host left / disconnected
  if (phase === 'host-left') {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚪</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Host Left the Game</h1>
          <p className="text-[#5a5a5a] mb-6">
            The game has been ended because the host disconnected.
          </p>

          {myScore !== null && (
            <div className="card-zen p-6 mb-8 text-center border border-gray-100 shadow-sm">
              <div className="text-sm zen-text-secondary uppercase tracking-widest font-medium mb-2">Your Final Score</div>
              <div className="text-5xl font-light text-gray-900">{myScore} pts</div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-medium text-lg hover:-translate-y-0.5 transition-all shadow-md"
            >
              Join New Game
            </button>
            <Link
              href="/"
              className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-full font-medium text-lg text-center inline-block hover:bg-gray-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}