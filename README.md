# 🌸 Nihongo Talk Screen

A beautiful Japanese language learning quiz application built for **UHB10802 — Japanese Communication 1** at Universiti Tun Hussein Onn Malaysia (UTHM).

This is a recreation of the original project (the GitHub version was deleted).

## ✨ Features

- **Solo Kiosk Mode** — Practice with beautiful quiz interface
- **5 Learning Categories**:
  - Greetings (あいさつ)
  - Numbers (すうじ)
  - Food (たべもの)
  - Colors (いろ)
  - Daily Phrases (にちじょうのフレーズ)
- **Stunning Japanese Cultural Design** (Torii red + Sakura pink theme)
- **Falling Sakura Petals Animation**
- **Multiplayer Mode** ready (placeholder pages included)
- Fully responsive

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                 # Beautiful landing page
├── layout.tsx
├── globals.css              # Cultural theme + animations
├── quiz/[slug]/page.tsx     # Quiz experience
├── play/page.tsx            # Join multiplayer
└── host/page.tsx            # Kiosk host mode

data/questions.ts            # All questions & categories
```

## 📝 To Add Real Multiplayer (Optional)

1. Create a free Supabase project
2. Create table:
   ```sql
   CREATE TABLE room_players (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text,
     score integer,
     room_id text,
     created_at timestamp
   );
   ```
3. Install Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Create `lib/supabase.ts`

## Original Project Info

- Course: UHB10802 Japanese Communication 1
- Exhibition project with voice input + multiplayer capabilities
- Beautiful cultural Japanese design language

---

Made with ❤️ for Japanese language learning
