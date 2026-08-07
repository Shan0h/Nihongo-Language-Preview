import { createServer } from 'http';
import { Server } from 'socket.io';
import { questions } from './data/questions';

// Game state interface
interface Player {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
  lastAnswer: string | null;
  isCorrect: boolean | null;
}

interface GameRoom {
  pin: string;
  hostId: string;
  players: Record<string, Player>;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
  questions: typeof questions;
  countdown: number;
  leaderboard: { name: string; score: number }[];
  countdownInterval?: ReturnType<typeof setInterval>;
  timeUpTimeout?: ReturnType<typeof setTimeout>;
  nextQuestionTimeout?: ReturnType<typeof setTimeout>;
}

const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end('Nihongo Talk Screen - WebSocket Server');
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store game rooms in memory
const rooms: Record<string, GameRoom> = {};

// Generate a random 6-digit PIN
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get random questions for the game (Fisher-Yates shuffle)
function getGameQuestions(): typeof questions {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(10, shuffled.length));
}

/** Start server-side countdown for a room - broadcasts to EVERYONE (host + players) */
function startCountdown(pin: string) {
  const room = rooms[pin];
  if (!room || room.status !== 'playing') return;

  room.countdown = 15;

  // Broadcast initial countdown
  io.to(pin).emit('countdown-update', 15);

  // Clear any existing interval
  if (room.countdownInterval) clearInterval(room.countdownInterval);

  room.countdownInterval = setInterval(() => {
    room.countdown--;

    // Broadcast to everyone in the room (host + players)
    io.to(pin).emit('countdown-update', room.countdown);

    if (room.countdown <= 0) {
      // Time's up - just stop the timer, don't auto-advance
      if (room.countdownInterval) clearInterval(room.countdownInterval);

      // Mark unanswered players as wrong
      for (const playerId of Object.keys(room.players)) {
        if (!room.players[playerId].answered) {
          room.players[playerId].answered = true;
          room.players[playerId].isCorrect = false;
          room.players[playerId].lastAnswer = null;
        }
      }

      // Tell everyone time is up (but don't reveal yet - host controls that)
      io.to(pin).emit('time-up');
    }
  }, 1000);
}

/** Move to next question */
function nextQuestion(pin: string) {
  const room = rooms[pin];
  if (!room) return;

  // Clear any existing timers
  if (room.countdownInterval) clearInterval(room.countdownInterval);
  if (room.timeUpTimeout) clearTimeout(room.timeUpTimeout);
  if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);

  room.currentQuestionIndex++;

  // Reset player answer states
  for (const playerId of Object.keys(room.players)) {
    room.players[playerId].answered = false;
    room.players[playerId].lastAnswer = null;
    room.players[playerId].isCorrect = null;
  }

  // Check if game is over
  if (room.currentQuestionIndex >= room.questions.length) {
    // Generate leaderboard
    room.leaderboard = Object.values(room.players)
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ name: p.name, score: p.score }));

    room.status = 'finished';
    io.to(pin).emit('game-finished', {
      leaderboard: room.leaderboard,
      playerScores: Object.fromEntries(
        Object.values(room.players).map((p) => [p.id, { name: p.name, score: p.score }])
      ),
    });

    console.log(`Game finished in room ${pin}. Leaderboard:`, room.leaderboard);

    // Schedule cleanup of finished room after 30 minutes to free memory
    setTimeout(() => {
      if (rooms[pin] && rooms[pin].status === 'finished') {
        delete rooms[pin];
        console.log(`Finished room ${pin} auto-cleaned up from memory.`);
      }
    }, 30 * 60 * 1000);
    return;
  }

  // Send next question to everyone
  const question = room.questions[room.currentQuestionIndex];
  io.to(pin).emit('next-question', {
    question,
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    countdown: 15,
  });

  // Start countdown for this question
  startCountdown(pin);

  console.log(`Question ${room.currentQuestionIndex + 1}/${room.questions.length} in room ${pin}`);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Host creates a new game room
  socket.on('create-room', () => {
    const pin = generatePin();
    rooms[pin] = {
      pin,
      hostId: socket.id,
      players: {},
      status: 'waiting',
      currentQuestionIndex: 0,
      questions: getGameQuestions(),
      countdown: 0,
      leaderboard: [],
    };

    socket.join(pin);
    socket.data.roomPin = pin;

    socket.emit('room-created', {
      pin,
      questionsCount: rooms[pin].questions.length,
    });

    console.log(`Room created with PIN: ${pin} by host ${socket.id}`);
  });

  // Disconnect cleanup
  socket.on('disconnect', () => {
    const roomPin = socket.data.roomPin;
    if (roomPin && rooms[roomPin]) {
      const room = rooms[roomPin];

      if (room.hostId === socket.id) {
        // Host left - clear timers and destroy room
        if (room.countdownInterval) clearInterval(room.countdownInterval);
        if (room.timeUpTimeout) clearTimeout(room.timeUpTimeout);
        if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);

        io.to(roomPin).emit('host-disconnected');
        delete rooms[roomPin];
        console.log(`Room ${roomPin} deleted (host disconnected)`);
      } else {
        // Player left - remove player without stopping game timers
        delete room.players[socket.id];
        io.to(roomPin).emit('player-left', socket.id);
        console.log(`Player ${socket.id} left room ${roomPin}`);
      }
    }
    console.log(`Player disconnected: ${socket.id}`);
  });

  // Player joins a room
  socket.on('join-room', (data: { pin: string; name: string }) => {
    const { pin, name } = data;
    const room = rooms[pin];

    if (!room) {
      socket.emit('join-error', { message: 'Room not found. Check the PIN.' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('join-error', { message: 'Game has already started!' });
      return;
    }

    room.players[socket.id] = {
      id: socket.id,
      name,
      score: 0,
      ready: false,
      answered: false,
      lastAnswer: null,
      isCorrect: null,
    };

    socket.join(pin);
    socket.data.roomPin = pin;

    io.to(pin).emit('player-joined', {
      playerId: socket.id,
      name,
      players: room.players,
    });

    console.log(`Player "${name}" joined room ${pin}`);
  });

  // Host starts the game
  socket.on('start-game', (pin: string) => {
    const room = rooms[pin];
    if (!room || room.hostId !== socket.id) return;

    room.status = 'playing';
    room.currentQuestionIndex = 0;

    // Send first question to everyone
    const question = room.questions[0];
    io.to(pin).emit('game-started', {
      question,
      questionIndex: 0,
      totalQuestions: room.questions.length,
      countdown: 15,
    });

    // Start server-side countdown
    startCountdown(pin);

    console.log(`Game started in room ${pin}`);
  });

  // Player submits answer
  socket.on('submit-answer', (data: { pin: string; answer: string }) => {
    const { pin, answer } = data;
    const room = rooms[pin];
    if (!room || room.status !== 'playing') return;

    const player = room.players[socket.id];
    if (!player || player.answered) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    player.answered = true;
    player.lastAnswer = answer;
    player.isCorrect = isCorrect;

    if (isCorrect) {
      player.score += 10;
    }

    // Notify everyone (for host view) - include if correct for host only
    io.to(pin).emit('answer-submitted', {
      playerId: socket.id,
      playerName: player.name,
      isCorrect,
      answer,
      correctAnswer: currentQuestion.correct_answer,
      score: player.score,
    });

    console.log(`Player ${player.name} answered ${isCorrect ? 'correctly' : 'incorrectly'} in room ${pin}`);
  });

  // Host reveals answers to everyone
  socket.on('reveal-answers', (pin: string) => {
    const room = rooms[pin];
    if (!room || room.hostId !== socket.id) return;

    // Tell each player if they got it right
    for (const playerId of Object.keys(room.players)) {
      const p = room.players[playerId];
      io.to(playerId).emit('score-update', { score: p.score, isCorrect: p.isCorrect, revealed: true });
    }

    // Tell everyone answers are revealed
    io.to(pin).emit('answers-revealed');
    console.log(`Answers revealed in room ${pin}`);
  });

  // Host manually advances to next question
  socket.on('next-question', (pin: string) => {
    const room = rooms[pin];
    if (!room || room.hostId !== socket.id) return;
    nextQuestion(pin);
  });
});

// Start the server
const PORT = process.env.WS_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🎮 Nihongo Multiplayer Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections\n`);
});

export { httpServer, io };