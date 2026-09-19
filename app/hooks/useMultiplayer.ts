import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/app/utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { questions, Question as QuizQuestion, getQuestionsByCategory } from '@/data/questions';

export interface Player {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
  lastAnswer: string | null;
  isCorrect: boolean | null;
}

export interface GameQuestion {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  countdown: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished' | null;

export interface RoomConfig {
  category?: string;
  questionCount?: number;
  timerSeconds?: number;
}

interface PresencePayload {
  role?: 'host' | 'player';
  name?: string;
  [key: string]: unknown;
}

export function useMultiplayer(role: 'host' | 'player', initialConfig?: RoomConfig) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string>('');
  const playerNameRef = useRef<string>('');
  const [connected, setConnected] = useState(false);
  const [pin, setPin] = useState<string>('');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [gameStatus, setGameStatus] = useState<GameStatus>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(15);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [myAnswerCorrect, setMyAnswerCorrect] = useState<boolean | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hostQuestions, setHostQuestions] = useState<QuizQuestion[]>([]);

  // Timers
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Host keeps track of the correct answer internally to score players
  const hostCurrentCorrectAnswer = useRef<string | null>(null);

  // Custom Room Configuration
  const roomConfigRef = useRef<RoomConfig>(initialConfig || {});
  const activeTimerRef = useRef<number>(initialConfig?.timerSeconds || 15);

  if (initialConfig) {
    roomConfigRef.current = { ...roomConfigRef.current, ...initialConfig };
    if (initialConfig.timerSeconds) {
      activeTimerRef.current = initialConfig.timerSeconds;
    }
  }

  const connect = useCallback(() => {
    setConnected(true);
    setError('');
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    playerIdRef.current = '';
    playerNameRef.current = '';
    setConnected(false);
    setPin('');
    setPlayers({});
    setGameStatus(null);
    setCurrentQuestion(null);
    setLeaderboard([]);
    setMyScore(null);
    setError('');
    setCountdown(15);
    setAnswerRevealed(false);
    setMyAnswerCorrect(null);
    setTotalQuestions(0);
    setQuestionIndex(0);
    setHostQuestions([]);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  // ===== HOST LOGIC =====

  // 1. Finish Game (declared early so advanceQuestion can reference it)
  const finishGame = useCallback(() => {
    if (!channelRef.current || !pin) return;
    setGameStatus('finished');

    // Generate leaderboard
    setPlayers(prev => {
      const sorted = Object.values(prev)
        .sort((a, b) => b.score - a.score)
        .map(p => ({ name: p.name, score: p.score }));

      // Set leaderboard on host so Game Champions view displays all rankings
      setLeaderboard(sorted);

      channelRef.current?.send({
        type: 'broadcast',
        event: 'game-finished',
        payload: { leaderboard: sorted }
      });

      // Save the winner to the global persistent leaderboard
      if (sorted.length > 0) {
        const winner = sorted[0];
        const maxScore = hostQuestions.length * 1000;
        const accuracy = maxScore > 0 ? Math.round((winner.score / maxScore) * 100) : 0;

        let rankTitle = '🏆 MULTIPLAYER CHAMPION';
        if (accuracy === 100) rankTitle = '👑 KAMI (GOD) TIER';

        supabase.from('leaderboard').insert({
          name: winner.name,
          category: 'Multiplayer Arena',
          points: winner.score,
          accuracy: accuracy,
          badge: rankTitle
        }).then(({ error: insertError }) => {
          if (insertError) console.error('Failed to save winner to leaderboard:', insertError);
        });
      }

      return prev;
    });
  }, [pin, hostQuestions]);

  // 2. Countdown Controller (declared early so advanceQuestion/startGame can reference it)
  const startCountdown = useCallback((durationSec?: number) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const initialTime = durationSec ?? activeTimerRef.current ?? 15;
    setCountdown(initialTime);
    let timeLeft = initialTime;

    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'countdown-update',
          payload: timeLeft
        });
      }

      if (timeLeft <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Auto mark unanswered players as wrong
        setPlayers(prev => {
          const updated = { ...prev };
          for (const id in updated) {
            if (!updated[id].answered) {
              updated[id].answered = true;
              updated[id].isCorrect = false;
            }
          }
          return updated;
        });

        channelRef.current?.send({
          type: 'broadcast',
          event: 'time-up',
          payload: {}
        });
      }
    }, 1000);
  }, []);

  // 3. Advance Question Broadcast
  const advanceQuestion = useCallback(() => {
    if (!channelRef.current || !pin) return;

    const nextIdx = questionIndex + 1;
    if (nextIdx >= hostQuestions.length) {
      finishGame();
      return;
    }

    setQuestionIndex(nextIdx);

    const timerSec = activeTimerRef.current || 15;
    const qData: GameQuestion = {
      question: hostQuestions[nextIdx],
      questionIndex: nextIdx,
      totalQuestions: hostQuestions.length,
      countdown: timerSec
    };

    hostCurrentCorrectAnswer.current = qData.question.correct_answer;
    setCurrentQuestion(qData);
    setCountdown(timerSec);
    setAnswerRevealed(false);

    // Reset players' answered status
    setPlayers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        updated[id].answered = false;
        updated[id].lastAnswer = null;
        updated[id].isCorrect = null;
      }
      return updated;
    });

    channelRef.current.send({
      type: 'broadcast',
      event: 'next-question',
      payload: qData
    });

    startCountdown(timerSec);
  }, [pin, questionIndex, hostQuestions, finishGame, startCountdown]);

  // 4. Create Room
  const createRoom = useCallback(() => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
    setGameStatus('waiting');

    const channel = supabase.channel(`room:${newPin}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const updatedPlayers: Record<string, Player> = {};
        for (const presenceKey in state) {
          const presenceList = state[presenceKey] as unknown as PresencePayload[];
          const presenceData = presenceList?.[0];
          if (presenceData && presenceData.role === 'player') {
            const pId = (presenceData.playerId as string) || presenceKey;
            updatedPlayers[pId] = {
              id: pId,
              name: (presenceData.name as string) || 'Anonymous',
              score: 0,
              ready: true,
              answered: false,
              lastAnswer: null,
              isCorrect: null,
            };
          }
        }

        setPlayers(prev => {
          const merged: Record<string, Player> = {};
          for (const id in updatedPlayers) {
            merged[id] = {
              ...updatedPlayers[id],
              score: prev[id]?.score || 0,
              answered: prev[id]?.answered || false,
              lastAnswer: prev[id]?.lastAnswer || null,
              isCorrect: prev[id]?.isCorrect || null,
            };
          }
          return merged;
        });
      })
      .on('broadcast', { event: 'submit-answer' }, ({ payload }) => {
        if (role !== 'host') return;
        const { playerId, answer, playerName } = payload as {
          playerId: string;
          answer: string;
          playerName: string;
        };
        const isCorrect = answer === hostCurrentCorrectAnswer.current;

        setPlayers(prev => {
          const updated = { ...prev };
          if (updated[playerId]) {
            updated[playerId] = {
              ...updated[playerId],
              answered: true,
              isCorrect,
              lastAnswer: answer,
            };
          } else {
            updated[playerId] = {
              id: playerId,
              name: playerName || 'Player',
              score: 0,
              ready: true,
              answered: true,
              isCorrect,
              lastAnswer: answer,
            };
          }
          return updated;
        });

        console.log(`[Host] Answer from ${playerName}: ${isCorrect ? '✓' : '✗'}`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role: 'host' });
          console.log('[Host] Room created:', newPin);
        }
      });
  }, [role]);

  // 5. Start Game
  const startGame = useCallback((customConfig?: RoomConfig) => {
    if (!channelRef.current || !pin) return;
    setGameStatus('playing');

    const config = { ...roomConfigRef.current, ...(customConfig || {}) };
    const timerSec = config.timerSeconds && config.timerSeconds > 0 ? config.timerSeconds : 15;
    activeTimerRef.current = timerSec;

    // Filter by category if specified and not 'All'
    let questionPool = [...questions];
    if (config.category && config.category.toLowerCase() !== 'all') {
      const filtered = getQuestionsByCategory(config.category);
      if (filtered.length > 0) {
        questionPool = filtered;
      }
    }

    // Shuffle pool
    for (let i = questionPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionPool[i], questionPool[j]] = [questionPool[j], questionPool[i]];
    }

    const count = Math.min(config.questionCount || 10, questionPool.length);
    const selectedQuestions = questionPool.slice(0, count);

    setHostQuestions(selectedQuestions);
    setTotalQuestions(selectedQuestions.length);
    setQuestionIndex(0);

    const qData: GameQuestion = {
      question: selectedQuestions[0],
      questionIndex: 0,
      totalQuestions: selectedQuestions.length,
      countdown: timerSec
    };

    hostCurrentCorrectAnswer.current = qData.question.correct_answer;
    setCurrentQuestion(qData);
    setCountdown(timerSec);
    setAnswerRevealed(false);

    channelRef.current.send({
      type: 'broadcast',
      event: 'next-question',
      payload: qData
    });

    startCountdown(timerSec);
  }, [pin, startCountdown]);

  // 6. Reveal Answers & Update Scores
  const revealAnswers = useCallback(() => {
    if (!channelRef.current || !pin) return;

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(0);
    setAnswerRevealed(true);

    setPlayers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
        if (!updated[id].answered) {
          updated[id].answered = true;
          updated[id].isCorrect = false;
        }
        if (updated[id].isCorrect) {
          updated[id].score += 1000;
        }
      }

      for (const id in updated) {
        channelRef.current?.send({
          type: 'broadcast',
          event: `score-update-${id}`,
          payload: {
            score: updated[id].score,
            isCorrect: updated[id].isCorrect,
            revealed: true
          }
        });
      }
      return updated;
    });

    channelRef.current.send({
      type: 'broadcast',
      event: 'answers-revealed',
      payload: {
        correctAnswer: hostCurrentCorrectAnswer.current
      }
    });
  }, [pin]);

  // 7. Kick Player (Host moderation)
  const kickPlayer = useCallback((playerId: string) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'player-kicked',
      payload: { playerId }
    });
    setPlayers(prev => {
      const updated = { ...prev };
      delete updated[playerId];
      return updated;
    });
  }, []);

  // ===== PLAYER LOGIC =====
  const joinRoom = useCallback((roomPin: string, playerName: string) => {
    setPin(roomPin);
    setGameStatus('waiting');

    playerNameRef.current = playerName;
    if (!playerIdRef.current) {
      playerIdRef.current = 'player_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    }
    const myId = playerIdRef.current;

    const channel = supabase.channel(`room:${roomPin}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let hostFound = false;
        for (const key in state) {
          const presenceList = state[key] as unknown as PresencePayload[];
          const data = presenceList?.[0];
          if (data && data.role === 'host') {
            hostFound = true;
          }
        }
        if (!hostFound && gameStatus !== null) {
          setError('Host has disconnected. Game cancelled.');
          setGameStatus(null);
        }
      })
      .on('broadcast', { event: 'next-question' }, ({ payload }) => {
        setCurrentQuestion(payload);
        setCountdown(payload.countdown);
        setQuestionIndex(payload.questionIndex);
        setTotalQuestions(payload.totalQuestions);
        setGameStatus('playing');
        setAnswerRevealed(false);
        setMyAnswerCorrect(null);
      })
      .on('broadcast', { event: 'countdown-update' }, ({ payload }) => {
        setCountdown(payload);
      })
      .on('broadcast', { event: 'time-up' }, () => {
        setCountdown(0);
      })
      .on('broadcast', { event: `score-update-${myId}` }, ({ payload }) => {
        setMyScore(payload.score);
        if (payload.revealed) {
          setMyAnswerCorrect(payload.isCorrect);
          setAnswerRevealed(true);
        }
      })
      .on('broadcast', { event: 'answers-revealed' }, () => {
        setAnswerRevealed(true);
        setCountdown(0);
      })
      .on('broadcast', { event: 'game-finished' }, ({ payload }) => {
        if (payload && payload.leaderboard) {
          setLeaderboard(payload.leaderboard);
        }
      })
      .on('broadcast', { event: 'player-kicked' }, ({ payload }) => {
        if (payload?.playerId === myId) {
          disconnect();
          setError('You were removed from the game room by the host.');
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role: 'player', name: playerName, playerId: myId });
          console.log('[Player] Joined room:', roomPin, 'with ID:', myId);
          setMyScore(0);
        }
      });
  }, [gameStatus]);

  const submitAnswer = useCallback((answer: string) => {
    if (!channelRef.current || !pin) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'submit-answer',
      payload: {
        answer,
        playerId: playerIdRef.current,
        playerName: playerNameRef.current || 'Player'
      }
    });
  }, [pin]);

  return {
    connected,
    pin,
    players,
    gameStatus,
    currentQuestion,
    leaderboard,
    myScore,
    myAnswerCorrect,
    error,
    countdown,
    answerRevealed,
    totalQuestions,
    questionIndex,
    connect,
    createRoom,
    joinRoom,
    startGame,
    revealAnswers,
    advanceQuestion,
    submitAnswer,
    finishGame,
    kickPlayer,
    disconnect,
    setError: setError as (e: string) => void,
  };
}