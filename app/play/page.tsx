'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMultiplayer } from '@/app/hooks/useMultiplayer';
import { speakJapanese } from '@/app/utils/tts';
import { JapaneseSpeechRecognizer } from '@/app/utils/speech';
import { sfx } from '@/app/utils/sfx';

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

  // Connect on mount
  useEffect(() => {
    connect();
  }, []);

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

  // Reset answer state when new question arrives
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setHasAnswered(false);
      setSpokenTranscript('');
      setSpeechError('');
    }
  }, [currentQuestion?.questionIndex]);

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
    if (hasAnswered || isListening || !currentQuestion) return;

    setSpeechError('');
    setSpokenTranscript('');
    setIsListening(true);

    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.start(
        (result) => {
          const spoken = result.transcript;
          setSpokenTranscript(spoken);

          const qOptions = currentQuestion.question.options;
          const matchedOption = qOptions.find(
            (opt) => spoken.includes(opt) || opt.includes(spoken)
          );

          if (matchedOption) {
            handleAnswer(matchedOption);
          } else if (spoken.includes(currentQuestion.question.correct_answer)) {
            handleAnswer(currentQuestion.question.correct_answer);
          } else {
            setSpeechError(`You said "${spoken}". Tap one of the options or try speaking again.`);
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

          <form onSubmit={handleJoin} className="card-cultural p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-lg focus:outline-none focus:border-[#d32f2f]"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2">Game PIN</label>
              <input
                type="text"
                value={roomPin}
                onChange={(e) => setRoomPin(e.target.value)}
                className="w-full border-2 border-[#f4c2c2] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xl sm:text-2xl tracking-[6px] sm:tracking-[8px] text-center font-mono focus:outline-none focus:border-[#d32f2f]"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!connected}
              className={`w-full py-3 sm:py-4 text-lg sm:text-xl font-bold rounded-xl transition-all ${
                connected
                  ? 'btn-gold'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                countdown <= 5 ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-[#d32f2f] to-[#f59e0b]'
              }`}
              style={{ width: `${(countdown / 15) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="card-cultural p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3.5 mb-2">
              {/* Question Image Illustration Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#fce4ec] via-white to-[#f4c2c2]/40 border-2 border-[#f4c2c2] flex items-center justify-center text-3xl sm:text-4xl shadow-sm flex-shrink-0 overflow-hidden ring-2 ring-[#f4c2c2]/30">
                {question.imageUrl ? (
                  <img src={question.imageUrl} alt={question.japanese_text} className="w-full h-full object-cover" />
                ) : (
                  <span>{question.image || "🇯🇵"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black">
                    {question.japanese_text}
                  </h2>
                  <button
                    onClick={() => speakJapanese(question.japanese_text)}
                    className="p-1.5 sm:p-2 bg-[#fce4ec] text-[#d32f2f] rounded-full hover:bg-[#d32f2f] hover:text-white transition-all shadow-xs active:scale-95 text-xs font-bold"
                    title="Listen to Japanese Pronunciation"
                    aria-label="Listen"
                  >
                    🔊 Listen
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-[#d32f2f]/10 text-[#d32f2f] rounded-md text-[11px] font-bold border border-[#d32f2f]/20">
                    🈁 {question.hiragana}
                  </span>
                  <span className="px-2 py-0.5 bg-[#f4c2c2]/40 text-[#d32f2f] rounded-md text-[11px] font-bold">
                    🔤 {question.romaji}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-[#5a5a5a] rounded-md text-[11px] font-semibold">
                    💬 {question.english_translation}
                  </span>
                </div>
              </div>
            </div>

            {/* Microphone Voice Answer Button */}
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-[#f4c2c2]/60 text-center">
              <button
                onClick={handleMicListen}
                disabled={hasAnswered || isListening}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : hasAnswered
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#d32f2f] text-white hover:bg-[#b71c1c] active:scale-95'
                }`}
              >
                <span className="text-lg">{isListening ? '🎙️' : '🎤'}</span>
                <span>{isListening ? 'Listening... Speak Japanese Answer!' : 'Speak Answer with Mic'}</span>
              </button>

              {spokenTranscript && (
                <div className="mt-2 text-xs font-semibold text-green-700">
                  🎙️ Spoken: "{spokenTranscript}"
                </div>
              )}

              {speechError && (
                <div className="mt-2 text-xs font-medium text-red-600">
                  ⚠️ {speechError}
                </div>
              )}
            </div>
          </div>

          {/* Kahoot 4-Color Shape Pads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = option === selectedAnswer;
              const isCorrectOption = option === question.correct_answer;

              const kahootStyles = [
                { bg: 'btn-kahoot-red', shape: '🔺' },
                { bg: 'btn-kahoot-blue', shape: '🔷' },
                { bg: 'btn-kahoot-yellow', shape: '🟡' },
                { bg: 'btn-kahoot-green', shape: '🟩' },
              ];
              const kStyle = kahootStyles[index % 4];

              let className = `w-full text-left p-4 rounded-2xl text-base font-black transition-all shadow-md active:scale-95 ${kStyle.bg} `;

              if (answerRevealed) {
                if (isCorrectOption) {
                  className += 'ring-4 ring-green-400 brightness-110 scale-[1.01]';
                } else if (isSelected) {
                  className += 'ring-4 ring-red-400 opacity-90';
                } else {
                  className += 'opacity-40 grayscale-[0.3]';
                }
              } else if (hasAnswered) {
                if (isSelected) {
                  className += 'ring-4 ring-white brightness-125';
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
                    <div className="flex items-center gap-3">
                      <span className="text-2xl drop-shadow-sm">{kStyle.shape}</span>
                      <div>
                        <div className="text-base sm:text-lg font-black text-white">{option}</div>
                        {question.option_hiragana?.[option] && (
                          <div className="text-xs text-white/90 font-semibold mt-0.5">
                            🈁 {question.option_hiragana[option]}
                          </div>
                        )}
                      </div>
                    </div>
                    {answerRevealed && isCorrectOption && <span className="text-2xl drop-shadow-md">✅</span>}
                    {answerRevealed && isSelected && !isCorrectOption && <span className="text-2xl drop-shadow-md">❌</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Message */}
          {hasAnswered && (
            <div className="text-center">
              {answerRevealed && myAnswerCorrect !== null ? (
                <div className={`p-4 rounded-xl ${myAnswerCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="text-2xl mb-1">{myAnswerCorrect ? '🎉' : '😅'}</div>
                  <div className="font-bold">{myAnswerCorrect ? 'Correct!' : 'Wrong!'}</div>
                  {!myAnswerCorrect && (
                    <div className="text-sm mt-1">Answer: {question.correct_answer}</div>
                  )}
                </div>
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
    const myRank = leaderboard.findIndex((e) => e.score === myScore) + 1;

    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-extrabold mb-2">Game Complete!</h1>

          {myScore !== null && (
            <div className="card-cultural p-6 mb-6">
              <div className="text-sm text-[#8a8a8a] mb-1">Your Score</div>
              <div className="text-5xl font-black text-[#d32f2f] mb-2">{myScore}</div>
              {myRank > 0 && (
                <div className="text-sm text-[#5a5a5a]">
                  Rank: {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}
                </div>
              )}
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="card-cultural p-6 mb-6">
              <h3 className="font-bold mb-4">Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      entry.score === myScore
                        ? 'bg-[#fce4ec] border-2 border-[#d32f2f]'
                        : 'bg-[#fdfbf7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <span className={`font-semibold ${entry.score === myScore ? 'text-[#d32f2f]' : 'text-[#2d2d2d]'}`}>
                        {entry.name}
                        {entry.score === myScore ? ' (You)' : ''}
                      </span>
                    </div>
                    <span className="font-bold text-[#d32f2f]">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="btn-torii w-full py-3 text-lg font-bold"
            >
              🔄 Play Again
            </button>
            <Link
              href="/"
              className="btn-gold w-full py-3 text-lg font-bold text-center inline-block"
            >
              ← Back to Home
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
            <div className="card-cultural p-4 mb-6">
              <div className="text-sm text-[#8a8a8a] mb-1">Your Final Score</div>
              <div className="text-4xl font-black text-[#d32f2f]">{myScore} pts</div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="btn-torii w-full py-3 text-lg font-bold"
            >
              🔄 Join New Game
            </button>
            <Link
              href="/"
              className="btn-gold w-full py-3 text-lg font-bold text-center inline-block"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
