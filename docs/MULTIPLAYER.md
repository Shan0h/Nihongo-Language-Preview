# 🎮 Multiplayer Mode - Setup & Usage

## Overview

The multiplayer mode allows a **Host** (kiosk/exhibition screen) to create a quiz game room, and **Players** (students with phones) to join and compete in real-time.

## Architecture

- **WebSocket Server** (`server.ts`) - Runs on port `3001`, handles real-time communication
- **Next.js App** - Runs on port `3000`, serves the web UI
- **Socket.io** - Library used for WebSocket communication

## How to Run

### Option 1: Run Both Servers at Once (Recommended)

```bash
npm run dev:all
```

This starts:
- Next.js dev server on `http://localhost:3000`
- WebSocket server on `port 3001`

### Option 2: Run Separately

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - WebSocket Server:**
```bash
npm run dev:ws
```

## How to Play

### As Host (Kiosk/Exhibition Screen)

1. Open `http://localhost:3000` and click **MULTIPLAYER** button
2. This opens `/host` - the Host Lobby
3. A 6-digit PIN is generated and displayed
4. Wait for players to join (they enter the PIN)
5. Click **Start Game** when ready
6. Watch real-time answers and scores
7. After all questions, view the **Leaderboard**

### As Player (Student Phone)

1. Open `http://localhost:3000/play` on your phone
   - **Note:** For real exhibition, replace `localhost` with the host computer's IP address
2. Enter your **Name** and the **6-digit PIN** from the host screen
3. Click **Join Game**
4. Wait for the host to start
5. Answer questions by tapping the correct option
6. 15 seconds per question - be fast!
7. View your score and rank at the end

## Game Flow

```
HOST                          PLAYER
 │                              │
 ├──[Create Room]───────────────┼──
 │   PIN: 123456                │
 │                              │──[Join with PIN]──►
 │◄──── Player "Alice" joined ──┤
 │                              │
 │──[Start Game]────────────────┼──
 │                              │
 │──[Question 1]────────────────┼──
 │                              │──[Submit Answer]──►
 │◄──── Answer: Correct! ───────┤
 │                              │
 │──[Question 2]────────────────┼──
 │   ...                        │
 │                              │
 │──[Leaderboard]───────────────┼──
 │  🥇 Alice: 50pts             │
 │  🥈 Bob: 40pts               │
```

## Network Setup (For Exhibition)

For a real exhibition where students connect from their phones:

1. **Find the host computer's IP address:**
   - Windows: `ipconfig` → Look for "IPv4 Address" (e.g., `192.168.1.100`)
   - Mac/Linux: `ifconfig` → Look for `inet` under your network interface

2. **Update the WebSocket URL** in `app/hooks/useMultiplayer.ts`:
   ```typescript
   const wsUrl = `http://${YOUR_IP}:3001`;
   ```
   Or set the environment variable:
   ```bash
   export NEXT_PUBLIC_WS_URL=http://192.168.1.100:3001
   ```

3. **Students join at:** `http://192.168.1.100:3000/play`

4. **Make sure firewall allows** incoming connections on ports `3000` and `3001`

## Features

- ✅ Real-time player join/leave
- ✅ 15-second countdown timer per question
- ✅ Live score tracking
- ✅ Answer reveal after all players answer
- ✅ Final leaderboard with medals
- ✅ Auto-advance to next question
- ✅ Host can skip questions
- ✅ Connection status indicators
- ✅ Responsive design (works on phones and desktops)

## Files Created/Modified

| File | Description |
|------|-------------|
| `server.ts` | WebSocket server with Socket.io |
| `app/hooks/useMultiplayer.ts` | React hook for multiplayer logic |
| `app/host/page.tsx` | Host lobby, game control, leaderboard |
| `app/play/page.tsx` | Player join form, quiz gameplay |
| `app/page.tsx` | Updated Multiplayer button → /host |
| `package.json` | Added socket.io, concurrently, tsx |