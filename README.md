# 🌸 日本語教育 — Nihongo Education

<p align="center">
  <img src="public/images/logo.svg" alt="Nihongo Education Logo" width="140" height="140" />
</p>

<p align="center">
  <strong>Learn Japanese Beautifully. Interactive Quizzes, 100 Curated Vocabulary Cards & Live Classroom Multiplayer Arena.</strong><br>
  Built for <strong>UHB10802 — Japanese Communication 1</strong> at Universiti Tun Hussein Onn Malaysia (UTHM).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Questions-100%20(10%20per%20Topic)-e11d48?style=flat-square" alt="Questions" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3ecf8e?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Course-UHB10802-c5221f?style=flat-square" alt="UHB10802" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## ✨ What's New & Core Features

### 1. 🏆 Live Arcade-Style AFK Screensaver with Hall of Fame
- **Intelligent Idle Detection**: Activates smoothly after 15 seconds of inactivity.
- **Alternating Slide Rhythm**: Rotates between 2 Japanese vocabulary cards (with high-res photos and phonetic pronunciations) and an arcade-style **Champions Hall of Fame Scoreboard**.
- **3-Tier Golden Championship Podium**:
  - 🥇 **1st Place**: Center elevated pedestal with radiant glow, golden crown `👑`, and gold champion block.
  - 🥈 **2nd Place**: Left silver podium with medal `🥈` and rank badge.
  - 🥉 **3rd Place**: Right bronze podium with medal `🥉` and rank badge.
  - 🎖️ **#4 & #5 Runner-Ups**: Pill tags with scores and player names.
- **Real-Time Supabase Sync**: Subscribed to live database inserts; new high scores from multiplayer or quiz completions immediately update the podium!
- **Pure Frosted Backdrop Blur**: Uses clean `backdrop-blur-xl` translucent glass overlay, ensuring the underlying website remains softly visible while floating glassmorphic cards display with 100% crystal clarity.
- **Arcade CTA Challenge**: Dynamic button prompting idle spectators: `👑 CAN YOU BEAT #1? TAP TO PLAY! 🔥`.

### 2. 📚 Complete 100-Question Curriculum (10 per Category)
- **10 Core Modules**: Expanded to exactly **10 questions each** (100 questions total).
- **Numbers up to 100**: The Numbers module teaches single digits (1–5), compound tens (10, 20, 50, 70), all the way to **100 (`ひゃく - Hyaku`)**!
- **Full Phonetic Support**: Every question provides authentic Kanji/Kana, pure Hiragana readings, Hepburn Romaji, English definitions, 4 options, and an `option_hiragana` dictionary for native Text-to-Speech audio.

### 3. 🎯 Streamlined Solo Practice & Topics Overview
- **Overview Grid**: Homepage features a clean, non-clickable curriculum overview showing all 10 modules and question counts.
- **Dedicated Topic Album**: Clicking **Solo Practice** takes learners to the interactive **Cover Flow Topic Album** (`/topics`) where they can swipe through modules, read descriptions, and start their practice.

### 4. 🎓 Classroom Game Studio (`/admin/multiplayer`)
- **Teacher Command Center**: Launch tailored multiplayer sessions for your classroom.
- **1-Click Lesson Presets**:
  - `🎌 Morning Greetings Warmup` (Greetings, 5 Qs, 15s)
  - `🍣 Food & Dining Challenge` (Food, 5 Qs, 20s)
  - `🏃 Action Verbs Speed Drill` (Verbs, 5 Qs, 10s Speedrun)
  - `🐻 Animals & Pets Sprint` (Animals, 5 Qs, 15s)
  - `🏆 Comprehensive JLPT N5 Exam` (All Topics, 20 Qs, 15s)
- **Interactive Rules Customizer**: Select specific categories, deck sizes (5–20 questions), and timers (10s, 15s, 20s, 30s).
- **Live Match Analytics**: Real-time Supabase leaderboard tracking student scores and accuracy.

### 5. 📝 Question Studio with Picture Upload (`/admin/questions`)
- **Direct Image Upload**: Select and upload JPG, PNG, WebP, SVG, and GIF illustrations directly into the app.
- **Live Thumbnail Preview**: Real-time image preview with instant replace/remove options.
- **One-Click & Auto GitHub Sync**: Commit and push newly uploaded images and question changes straight to GitHub (`origin/main` & `preview/main`) from the admin interface.
- **Filter by Media**: Easily filter questions by *Pictures Uploaded* vs *Emoji Fallback*.

### 6. 👑 Real-Time Multiplayer Arena (`/host` & `/play`)
- **Kahoot-Style Gameplay**: Host creates a game room with a 6-digit PIN; students join from smartphones or laptops.
- **Synchronized Countdown**: Real-time synchronized timer (10s–30s) across all student devices.
- **Native Japanese TTS Pronunciation**: Auto-pronounces vocabulary questions for listening practice.
- **Player Moderation**: Host can kick/remove disruptive or test names from the lobby before game start.
- **Podium Fanfare & Leaderboard**: Animated award podium for 1st, 2nd, and 3rd place with custom celebratory sound effects.

### 7. 📜 Authentic Japanese Certificate Generator
- **Completion Diploma**: Awarded upon completing quiz modules.
- **Traditional Cultural Details**:
  - Ornate Japanese Gold Border with cherry blossom sakura corners.
  - Mount Fuji silhouette & Vermilion Torii Gate.
  - Traditional Red Hanko Seal (判子) stamped with *一期一会* (Treasure every meeting).
  - Dynamic QR Code linking back to the exhibition (`SCAN TO PLAY`).
  - Editable Student Recipient Name.
- **Export Formats**: High-DPI PNG download or print-ready PDF certificate.

### 8. 🎋 Zen Atmosphere & Cultural UI
- **Zen Background Music (BGM)**: Traditional Shakuhachi & Koto ambient soundtrack with volume slider and persistent playback.
- **Interactive Japanese Feedback Modals**:
  - Correct answer: `🎌 よくできました！` (Well done!) with celebratory point confetti.
  - Incorrect answer: `😅 もう一度！` (Try again!) with pronunciation tips, hints, and answer reveals.
- **Seigaiha Wave Scenery & Dark Mode**: Traditional wave patterns, floating sakura petals, and seamless light/dark theme toggle.

---

## 📚 Vocabulary Curriculum (10 Modules • 100 Questions)

| # | Category | Japanese | Kanji / Kana | Qs | Sample Vocabulary |
|---|---|---|---|:---:|---|
| 1 | **Greetings** | あいさつ | こんにちは, おはよう | **10** | *Konnichiwa*, *Ohayou*, *Hajimemashite*, *Yoroshiku*, *Mata ashita* |
| 2 | **Numbers** | すうじ | 一, 二, 三, 百 | **10** | *Ichi* (1), *Ni* (2), *San* (3), *Yon* (4), *Go* (5), *Juu* (10), *Ni-juu* (20), *Go-juu* (50), *Nana-juu* (70), **Hyaku (100)** 💯 |
| 3 | **Food** | たべもの | 寿司, ラーメン, ご飯 | **10** | *Gohan*, *Sushi*, *Ringo*, *Ramen*, *Mizu*, *Ocha*, *Pan*, *Niku*, *Tamago*, *Sakana* |
| 4 | **Colors** | いろ | 赤, 青, 白, 黒 | **10** | *Aka*, *Ao*, *Kiiro*, *Midori*, *Shiro*, *Kuro*, *Pinku*, *Orenji*, *Murasaki*, *Chairo* |
| 5 | **Daily Phrases** | にちじょうのフレーズ | いただきます, すみません | **10** | *Arigatou*, *Sumimasen*, *Onegaishimasu*, *Itadakimasu*, *Gochisousama*, *Douitashimashite*, *Gomennasai*, *Hai*, *Iie*, *Daijoubu* |
| 6 | **Verbs** | どうし | たべる, のむ, いく | **10** | *Taberu*, *Nomu*, *Miru*, *Iku*, *Kuru*, *Hanasu*, *Kiku*, *Yomu*, *Kaku*, *Neru* |
| 7 | **Adjectives** | けいようし | おおきい, ちいさい | **10** | *Ookii*, *Chiisai*, *Oishii*, *Kawaii*, *Tanoshii*, *Atsui*, *Samui*, *Takai*, *Yasui*, *Muzukashii* |
| 8 | **Body Parts** | からだ | め, て, あたま | **10** | *Atama*, *Me*, *Mimi*, *Te*, *Hana*, *Kuchi*, *Ashi*, *Kata*, *Yubi*, *Kao* |
| 9 | **Animals** | どうぶつ | いぬ, ねこ, くま | **10** | *Inu*, *Neko*, *Tori*, *Sakana*, *Usagi*, *Uma*, *Kuma*, *Saru*, *Buta*, *Zou* |
| 10 | **Family** | かぞく | かぞく, ともだち | **10** | *Kazoku*, *Haha*, *Chichi*, *Tomodachi*, *Ani*, *Ane*, *Otouto*, *Imouto*, *Sobo*, *Sofu* |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router & Turbopack)](https://nextjs.org/)
- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom Japanese Seigaiha & Torii design tokens
- **Real-Time Multiplayer**: [Supabase Realtime (Presence & Broadcast Channels)](https://supabase.com/)
- **Certificate Export**: [`html-to-image`](https://www.npmjs.com/package/html-to-image) & [`jspdf`](https://www.npmjs.com/package/jspdf)
- **Speech Synthesis**: Web Speech API (`SpeechSynthesisUtterance` for native Japanese voice)
- **Audio / SFX**: HTML5 Audio API for Zen Shakuhachi BGM & celebratory fanfares

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Shan0h/Nihongo-Language.git
cd Nihongo-Language
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cdnbxbdgdidsoeipnigh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
Nihongo-Language/
├── app/
│   ├── page.tsx                  # Homepage with Quick Host, Solo Practice & Available Topics
│   ├── layout.tsx                # Root layout (BGM player, Dark mode, Favicon, AFK)
│   ├── topics/page.tsx           # Cover Flow Topic Album for Solo Practice
│   ├── admin/
│   │   ├── page.tsx              # Admin studio dashboard
│   │   ├── login/page.tsx        # Secure admin login (password: admin123)
│   │   ├── multiplayer/page.tsx  # Classroom Game Studio (Presets, Timers, Analytics)
│   │   ├── questions/page.tsx    # Question manager with image upload & GitHub sync
│   │   └── categories/page.tsx   # Category overview
│   ├── api/admin/
│   │   ├── upload/route.ts       # Image upload endpoint (saves to public/images/questions/)
│   │   ├── questions/route.ts    # Question CRUD endpoint (persists to data/questions.json)
│   │   └── git-sync/route.ts     # One-click commit & push to GitHub
│   ├── components/
│   │   ├── Logo.tsx              # Reusable bilingual Nihongo Education vector logo
│   │   ├── CertificateModal.tsx  # Gold diploma generator (PNG & PDF export)
│   │   ├── BgmPlayer.tsx         # Traditional Shakuhachi Zen BGM player
│   │   ├── AfkScreensaver.tsx    # Pure frosted blur screensaver with live Hall of Fame podium
│   │   └── DarkModeToggle.tsx    # Light/Dark mode switcher
│   ├── host/page.tsx             # Real-time multiplayer host screen (lobby & question view)
│   ├── play/page.tsx             # Mobile student player interface (PIN join & answer buttons)
│   ├── quiz/[slug]/page.tsx      # Solo quiz screen with Japanese feedback modals
│   ├── scoreboard/page.tsx       # Live leaderboard
│   └── hooks/
│       └── useMultiplayer.ts     # Supabase Realtime multiplayer engine
├── data/
│   ├── questions.json            # 100 questions (10 per category)
│   └── questions.ts              # TypeScript interface & categories definition
└── public/
    ├── images/
    │   ├── logo.svg              # Official vector crest logo
    │   ├── questions/            # Category-sorted question pictures
    │   ├── afk/                  # Illustrated scenery slides
    │   └── audio/                # Zen Shakuhachi BGM & fanfare SFX
    ├── icon.svg                  # Browser tab favicon vector
    └── favicon.ico               # High-res favicon
```

---

## 🔐 Admin Studio Credentials

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Password**: `admin123`
- **Capabilities**:
  - Launch tailored classroom multiplayer rooms with custom categories and timers.
  - Upload question pictures directly and edit vocabulary definitions.
  - One-click push changes and new images to GitHub.

---

## 👥 Course & Attribution

- **Course**: UHB10802 — Japanese Communication 1
- **Institution**: Universiti Tun Hussein Onn Malaysia (UTHM)
- **Developer**: Shan0h ([github.com/Shan0h](https://github.com/Shan0h))
- **Live Deployment**: Vercel Cloud Platform

---

<p align="center">
  Made with ❤️ & 🌸 for Japanese Language Education<br>
  <em>一期一会 — Treasure every encounter</em>
</p>
