'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMultiplayer } from '@/app/hooks/useMultiplayer';
import { speakJapanese } from '@/app/utils/tts';
import { sfx } from '@/app/utils/sfx';

export default function HostPage() {
  const {
    connected,
    pin,
    players,
    gameStatus,
    currentQuestion,
    leaderboard,
    countdown,
    answerRevealed,
    totalQuestions,
    questionIndex,
    connect,
    createRoom,
    startGame,
    revealAnswers,
    advanceQuestion,
    disconnect,
    error,
    setError,
  } = useMultiplayer('host');

  const [roomCreated, setRoomCreated] = useState(false);
  const [joinUrl, setJoinUrl] = useState('/play');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.host}/play`);
    }
  }, []);

  // Play Podium Fanfare sound on Game Finish
  useEffect(() => {
    if (gameStatus === 'finished') {
      sfx.playPodium();
    }
  }, [gameStatus]);

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Create room once connection is confirmed active
  useEffect(() => {
    if (connected && !pin && !roomCreated) {
      createRoom();
      setRoomCreated(true);
    }
  }, [connected, pin, roomCreated, createRoom]);

  // Auto-play Japanese pronunciation when a question loads for host
  const japaneseText = currentQuestion?.question?.japanese_text;
  useEffect(() => {
    if (gameStatus === 'playing' && japaneseText) {
      speakJapanese(japaneseText);
    }
  }, [gameStatus, japaneseText]);

  const handleStart = () => {
    if (Object.keys(players).length === 0) {
      setError('Need at least 1 player to start!');
      return;
    }
    startGame();
  };

  const handleRestart = () => {
    setRoomCreated(false);
    disconnect();
    setTimeout(() => {
      connect();
    }, 300);
  };

  const playerList = Object.values(players);
  const answeredCount = playerList.filter((p) => p.answered).length;

  // Waiting lobby
  if (gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1">
                ← Back to Home
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">🎮 Host Lobby</h1>
            </div>
            <div className="flex gap-2">
              {!connected && (
                <span className="text-sm text-orange-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Connecting...
                </span>
              )}
              {connected && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
              <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* PIN Display */}
          {pin && (
            <div className="card-zen p-10 mb-8 text-center">
              <p className="text-sm zen-text-secondary mb-3 tracking-[0.2em] uppercase font-medium">Join Code</p>
              <div className="text-6xl sm:text-8xl font-light text-gray-900 tracking-[0.1em] font-mono mb-6 zen-text-primary">
                {pin}
              </div>
              <p className="text-sm zen-text-secondary">
                Students enter this code on their phones to join
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50/80 rounded-full border border-gray-200">
                <span className="text-xl">📱</span>
                <span className="text-sm font-medium zen-text-primary">
                  {joinUrl}
                </span>
              </div>
            </div>
          )}

          {/* Player List */}
          <div className="card-zen p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2d2d2d]">
                Players ({playerList.length})
              </h2>
              {playerList.length > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Ready to start
                </span>
              )}
            </div>

            {playerList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-[#8a8a8a]">Waiting for players to join...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playerList.map((player, i) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-medium text-lg border border-gray-200">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[#2d2d2d]">{player.name}</div>
                      <div className="text-xs text-[#8a8a8a]">Ready</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={playerList.length === 0 || !connected}
            className={`w-full py-4 rounded-full font-medium text-lg transition-all ${
              playerList.length > 0 && connected
                ? 'bg-gray-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {playerList.length === 0 ? 'Waiting for Players...' : 'Start Game'}
          </button>
        </div>
      </div>
    );
  }

  // Playing - Host view
  if (gameStatus === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">🎮 Host Control</h1>
              <p className="text-sm text-[#8a8a8a]">
                PIN: <span className="font-mono font-bold text-[#d32f2f]">{pin}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#5a5a5a]">
                Q{questionIndex + 1}/{totalQuestions}
              </span>
              <span className={`text-2xl font-black ${countdown <= 5 ? 'text-red-500 animate-pulse' : 'text-[#d32f2f]'}`}>
                ⏱ {countdown}s
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
              <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Current Question */}
          <div className="card-zen p-6 sm:p-8 mb-6">
            <div className="text-xs zen-text-secondary font-medium tracking-widest uppercase mb-4 text-center sm:text-left">
              QUESTION {questionIndex + 1} OF {totalQuestions}
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-5xl sm:text-6xl shadow-sm flex-shrink-0 overflow-hidden zen-focus-ring mx-auto sm:mx-0 relative">
                {currentQuestion.question.imageUrl ? (
                  <Image 
                    src={currentQuestion.question.imageUrl} 
                    alt={currentQuestion.question.japanese_text} 
                    fill 
                    sizes="112px" 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <span>{currentQuestion.question.image || "🇯🇵"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-between gap-3">
                  <h2 className="text-4xl sm:text-5xl font-light zen-text-primary">
                    {currentQuestion.question.japanese_text}
                  </h2>
                  <button
                    onClick={() => speakJapanese(currentQuestion.question.japanese_text)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full transition-all shadow-sm active:scale-95 text-xs font-medium border border-gray-200/50"
                  >
                    <span className="text-base">🔊</span> Listen
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-3">
                  <span className="px-4 py-1.5 bg-white/60 backdrop-blur-sm zen-text-secondary rounded-full text-xs sm:text-sm font-medium border border-gray-200/50 shadow-sm">
                    {currentQuestion.question.english_translation}
                  </span>
                </div>
              </div>
            </div>

            {/* Correct Answer */}
            {(answerRevealed || answeredCount === playerList.length) && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-sm font-semibold text-green-700">
                  ✓ Correct: {currentQuestion.question.correct_answer}
                </span>
              </div>
            )}
          </div>

          {/* Player Answers */}
          <div className="card-zen p-6 mb-8">
            <h3 className="text-lg font-medium mb-4 zen-text-primary">
              Player Answers ({answeredCount}/{playerList.length})
            </h3>

            {playerList.length === 0 ? (
              <p className="text-center text-[#8a8a8a] py-4">No players</p>
            ) : (
              <div className="space-y-3">
                {playerList.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${
                      player.answered
                        ? player.isCorrect
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-medium text-sm border border-gray-200">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium zen-text-primary">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.answered ? (
                        <>
                          <span className="text-sm text-[#5a5a5a]">{player.lastAnswer}</span>
                          <span className="text-lg">
                            {player.isCorrect ? '✅' : '❌'}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-[#8a8a8a] animate-pulse">Answering...</span>
                      )}
                      <span className="text-sm font-bold text-[#d32f2f] ml-2">
                        {player.score}pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Host Controls */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {!answerRevealed && countdown === 0 && (
              <button
                onClick={revealAnswers}
                className="w-full py-3.5 bg-gray-800 text-white rounded-full font-medium text-lg hover:bg-gray-900 transition-all shadow-md"
              >
                Reveal Answers
              </button>
            )}
            {!answerRevealed && countdown > 0 && (
              <div className="text-center text-sm zen-text-secondary">
                Waiting for timer... ({answeredCount}/{playerList.length} answered)
              </div>
            )}
            {answerRevealed && (
              <button
                onClick={advanceQuestion}
                className="w-full py-3.5 bg-gray-900 text-white rounded-full font-medium text-lg hover:-translate-y-0.5 transition-all shadow-lg"
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game finished - Kahoot Podium Leaderboard
  if (gameStatus === 'finished') {
    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2 animate-bounce">🏆</div>
            <h1 className="text-3xl sm:text-5xl font-black gradient-text-torii mb-2">GAME CHAMPIONS!</h1>
            <p className="text-sm sm:text-base text-[#5a5a5a] font-bold">Nihongo Communication 1 Exhibition Victory 🌸</p>
          </div>

          {/* Animated 3D Kahoot Winner Podium */}
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-8 h-64 sm:h-72 px-2">
            {top2 ? (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl sm:text-3xl mb-1">🥈</div>
                <div className="font-black text-sm sm:text-base text-[#2d2d2d] truncate max-w-[100px]">{top2.name}</div>
                <div className="text-xs font-bold text-[#d32f2f] mb-2">{top2.score} pts</div>
                <div className="w-full bg-gradient-to-t from-slate-400 to-slate-200 h-32 sm:h-40 rounded-t-2xl shadow-lg border-2 border-slate-300 flex items-center justify-center text-2xl font-black text-slate-700">
                  2
                </div>
              </div>
            ) : null}

            {top1 ? (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-1 animate-bounce">🥇</div>
                <div className="font-black text-base sm:text-xl text-[#2d2d2d] truncate max-w-[120px]">{top1.name}</div>
                <div className="text-xs sm:text-sm font-black text-[#d32f2f] mb-2">{top1.score} pts</div>
                <div className="w-full bg-gradient-to-t from-amber-500 to-yellow-300 h-44 sm:h-52 rounded-t-2xl shadow-2xl border-4 border-amber-300 flex items-center justify-center text-4xl font-black text-amber-900 ring-4 ring-yellow-300/50">
                  1
                </div>
              </div>
            ) : null}

            {top3 ? (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl sm:text-3xl mb-1">🥉</div>
                <div className="font-black text-sm sm:text-base text-[#2d2d2d] truncate max-w-[100px]">{top3.name}</div>
                <div className="text-xs font-bold text-[#d32f2f] mb-2">{top3.score} pts</div>
                <div className="w-full bg-gradient-to-t from-amber-700 to-amber-500 h-24 sm:h-32 rounded-t-2xl shadow-lg border-2 border-amber-600 flex items-center justify-center text-2xl font-black text-amber-100">
                  3
                </div>
              </div>
            ) : null}
          </div>

          <div className="card-cultural p-5 mb-6">
            <h3 className="text-sm font-bold text-[#8a8a8a] uppercase tracking-wider mb-3 text-center">Full Rankings</h3>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <span className="font-bold text-[#2d2d2d]">#{i + 1} {entry.name}</span>
                  <span className="font-black text-[#d32f2f]">{entry.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 btn-torii py-3 text-lg font-bold"
            >
              🔄 Play Again
            </button>
            <Link
              href="/"
              className="btn-gold py-3 text-lg font-bold text-center inline-block"
            >
              ⛩️ Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default / connecting state or server not running
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">
          {error ? '⚠️' : '⛩️'}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {error ? 'Game Server Not Running' : 'Connecting to Game Server...'}
        </h1>

        {error ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
            <div className="card-cultural p-6 text-left">
              <h3 className="font-bold mb-3 text-center">How to Start the Game Server</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">Option 1: Run both servers together</p>
                  <div className="bg-gray-900 text-green-400 px-3 py-2 rounded-lg font-mono text-sm">
                    npm run dev:all
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Option 2: Run WebSocket server only</p>
                  <div className="bg-gray-900 text-green-400 px-3 py-2 rounded-lg font-mono text-sm">
                    npm run dev:ws
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setRoomCreated(false);
                disconnect();
                setTimeout(() => {
                  connect();
                }, 500);
              }}
              className="btn-torii w-full py-3 font-bold"
            >
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[#8a8a8a]">Please wait</p>
            <div className="w-8 h-8 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        <div className="mt-6">
          <Link href="/" className="text-sm text-[#8a8a8a] hover:text-[#d32f2f]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}