import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/app/utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { questions, Question as QuizQuestion } from '@/data/questions';

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

interface PresencePayload {
  role?: 'host' | 'player';
  name?: string;
  [key: string]: unknown;
}

export function useMultiplayer(role: 'host' | 'player') {
  const channelRef = useRef<RealtimeChannel | null>(null);
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

  const connect = useCallback(() => {
    setConnected(true);
    setError('');
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
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
  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setCountdown(15);
    let timeLeft = 15;

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

    const qData: GameQuestion = {
      question: hostQuestions[nextIdx],
      questionIndex: nextIdx,
      totalQuestions: hostQuestions.length,
      countdown: 15
    };

    hostCurrentCorrectAnswer.current = qData.question.correct_answer;
    setCurrentQuestion(qData);
    setCountdown(15);
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

    startCountdown();
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
        for (const id in state) {
          const presenceList = state[id] as unknown as PresencePayload[];
          const presenceData = presenceList?.[0];
          if (presenceData && presenceData.role === 'player') {
            updatedPlayers[id] = {
              id,
              name: presenceData.name || 'Anonymous',
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
  const startGame = useCallback(() => {
    if (!channelRef.current || !pin) return;
    setGameStatus('playing');

    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length));
    setHostQuestions(selectedQuestions);
    setTotalQuestions(selectedQuestions.length);
    setQuestionIndex(0);

    const qData: GameQuestion = {
      question: selectedQuestions[0],
      questionIndex: 0,
      totalQuestions: selectedQuestions.length,
      countdown: 15
    };

    hostCurrentCorrectAnswer.current = qData.question.correct_answer;
    setCurrentQuestion(qData);
    setCountdown(15);
    setAnswerRevealed(false);

    channelRef.current.send({
      type: 'broadcast',
      event: 'next-question',
      payload: qData
    });

    startCountdown();
  }, [pin, startCountdown]);

  // 6. Reveal Answers & Update Scores
  const revealAnswers = useCallback(() => {
    if (!channelRef.current || !pin) return;

    setPlayers(prev => {
      const updated = { ...prev };
      for (const id in updated) {
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

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    channelRef.current.send({
      type: 'broadcast',
      event: 'answers-revealed',
      payload: {}
    });
  }, [pin]);

  // ===== PLAYER LOGIC =====
  const joinRoom = useCallback((roomPin: string, playerName: string) => {
    setPin(roomPin);
    setGameStatus('waiting');

    const channel = supabase.channel(`room:${roomPin}`);
    channelRef.current = channel;

    const myPlayerId = supabase.auth.getSession().then(() => 'player-' + Math.random().toString(36).substring(2, 11));

    myPlayerId.then(id => {
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
        .on('broadcast', { event: `score-update-${id}` }, ({ payload }) => {
          setMyScore(payload.score);
          if (payload.revealed) {
            setMyAnswerCorrect(payload.isCorrect);
            setAnswerRevealed(true);
          }
        })
        .on('broadcast', { event: 'answers-revealed' }, () => {
          setAnswerRevealed(true);
        })
        .on('broadcast', { event: 'game-finished' }, ({ payload }) => {
          setGameStatus('finished');
          setLeaderboard(payload.leaderboard);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ role: 'player', name: playerName });
            console.log('[Player] Joined room:', roomPin);
            setMyScore(0);
          }
        });
    });
  }, [gameStatus]);

  const submitAnswer = useCallback((answer: string) => {
    if (!channelRef.current || !pin) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'submit-answer',
      payload: {
        answer,
        // @ts-expect-error Supabase channel internal config is not fully typed on RealtimeChannel
        playerId: channelRef.current.params?.config?.broadcast?.self?.sessionId || 'unknown',
        playerName: 'Me'
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
    disconnect,
    setError: setError as (e: string) => void,
  };
}