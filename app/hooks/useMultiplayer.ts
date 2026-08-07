import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
  lastAnswer: string | null;
  isCorrect: boolean | null;
}

export interface QuizQuestion {
  id: string;
  category: string;
  japanese_text: string;
  romaji: string;
  english_translation: string;
  options: string[];
  correct_answer: string;
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

export function useMultiplayer(role: 'host' | 'player') {
  const socketRef = useRef<Socket | null>(null);
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

  const connect = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.connected) return;
      socketRef.current.connect();
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = io(wsUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 5000,
    });

    socket.on('connect', () => {
      setConnected(true);
      setError('');
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setError('Game server is not running. Start it with: npm run dev:ws');
    });

    socket.on('reconnect_failed', () => {
      setConnected(false);
      setError('Could not connect to game server. Make sure it is running.');
    });

    // ===== ALL EVENT LISTENERS IN ONE PLACE =====

    // Room created (host)
    socket.on('room-created', (data: { pin: string; questionsCount: number }) => {
      setPin(data.pin);
      setGameStatus('waiting');
      setTotalQuestions(data.questionsCount);
      console.log('[Socket] Room created, PIN:', data.pin);
    });

    // Player joined (host + all)
    socket.on('player-joined', (data: { playerId: string; name: string; players: Record<string, Player> }) => {
      setPlayers(data.players);
      console.log('[Socket] Player joined:', data.name);
    });

    // Player left
    socket.on('player-left', (playerId: string) => {
      setPlayers((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      console.log('[Socket] Player left:', playerId);
    });

    // Join error (player)
    socket.on('join-error', (data: { message: string }) => {
      setError(data.message);
    });

    // Answer submitted (host)
    socket.on('answer-submitted', (data: { playerId: string; playerName: string; isCorrect: boolean; answer: string; correctAnswer: string }) => {
      setPlayers((prev) => {
        const updated = { ...prev };
        if (updated[data.playerId]) {
          updated[data.playerId] = {
            ...updated[data.playerId],
            answered: true,
            isCorrect: data.isCorrect,
            lastAnswer: data.answer,
          };
        }
        return updated;
      });
      console.log('[Socket] Answer from', data.playerName, ':', data.isCorrect ? '✓' : '✗');
    });

    // Game started (all)
    socket.on('game-started', (data: GameQuestion) => {
      setGameStatus('playing');
      setCurrentQuestion(data);
      setCountdown(data.countdown);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setAnswerRevealed(false);
      console.log('[Socket] Game started!');
    });

    // Next question (all)
    socket.on('next-question', (data: GameQuestion) => {
      setCurrentQuestion(data);
      setCountdown(data.countdown);
      setQuestionIndex(data.questionIndex);
      setAnswerRevealed(false);
      setMyAnswerCorrect(null);
      console.log('[Socket] Next question:', data.questionIndex + 1);
    });

    // Countdown update (players)
    socket.on('countdown-update', (count: number) => {
      setCountdown(count);
    });

    // Score update (player - live score during game)
    socket.on('score-update', (data: { score: number; isCorrect: boolean; revealed?: boolean }) => {
      setMyScore(data.score);
      // Only show correct/wrong when revealed=true (sent after time-up or all answered)
      if (data.revealed) {
        setMyAnswerCorrect(data.isCorrect);
        setAnswerRevealed(true);
      }
      console.log('[Socket] Score updated:', data.score, data.isCorrect ? '✓' : '✗', data.revealed ? '(revealed)' : '(hidden)');
    });

    // Time's up (all) - timer ran out but host hasn't revealed yet
    socket.on('time-up', () => {
      console.log('[Socket] Time is up!');
    });

    // Answers revealed by host (all)
    socket.on('answers-revealed', () => {
      setAnswerRevealed(true);
      console.log('[Socket] Answers revealed by host!');
    });

    // Game finished (all)
    socket.on('game-finished', (data: { leaderboard: LeaderboardEntry[]; playerScores: Record<string, { name: string; score: number }> }) => {
      setGameStatus('finished');
      setLeaderboard(data.leaderboard);
      const myScoreData = data.playerScores[socket.id];
      if (myScoreData) {
        setMyScore(myScoreData.score);
      }
      console.log('[Socket] Game finished!');
    });

    // Host disconnected
    socket.on('host-disconnected', () => {
      setError('Host has disconnected. Game cancelled.');
      setGameStatus(null);
    });

    socketRef.current = socket;
  }, []);

  // Host: Create a new room
  const createRoom = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('create-room');
  }, []);

  // Player: Join a room
  const joinRoom = useCallback((roomPin: string, playerName: string) => {
    if (!socketRef.current) return;
    setPin(roomPin);
    socketRef.current.emit('join-room', { pin: roomPin, name: playerName });
  }, []);

  // Host: Start the game
  const startGame = useCallback(() => {
    if (!socketRef.current || !pin) return;
    socketRef.current.emit('start-game', pin);
  }, [pin]);

  // Host: Reveal answers to all players
  const revealAnswers = useCallback(() => {
    if (!socketRef.current || !pin) return;
    socketRef.current.emit('reveal-answers', pin);
  }, [pin]);

  // Host: Manually advance to next question
  const advanceQuestion = useCallback(() => {
    if (!socketRef.current || !pin) return;
    socketRef.current.emit('next-question', pin);
  }, [pin]);

  // Player: Submit answer
  const submitAnswer = useCallback((answer: string) => {
    if (!socketRef.current || !pin) return;
    socketRef.current.emit('submit-answer', { pin, answer });
  }, [pin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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
  }, []);

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
    disconnect,
    setError: setError as (e: string) => void,
  };
}