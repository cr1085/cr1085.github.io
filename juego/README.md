# 🎲 Chaos Tiles — The Unhinged Board Game

A chaotic Snakes & Ladders–inspired browser game built with **Phaser 3** and **Supabase**.

---

## 🗂️ Folder Structure

```
chaos-board-game/
├── index.html                  ← Main HTML entry point
├── supabase-setup.sql          ← Database schema + seed data
├── README.md
└── src/
    ├── game.js                 ← Phaser config & bootstrap
    ├── data/
    │   └── questions.js        ← Riddles, prefer-questions, powers, traps
    ├── services/
    │   └── supabase.js         ← Supabase client + all API calls
    ├── utils/
    │   ├── audio.js            ← Web Audio API sound effects
    │   └── board-config.js     ← Board layout & tile definitions
    └── scenes/
        ├── BootScene.js        ← Splash screen & initialization
        ├── MenuScene.js        ← Main menu, player name, XP display
        ├── GameScene.js        ← Core gameplay (board, dice, events, AI)
        ├── UIScene.js          ← Modals: riddle, prefer, powers panel
        └── GameOverScene.js    ← Win/lose screen with fireworks
```

---

## 🚀 Running Locally

### Option A — Simple (no server needed)

Just open `index.html` directly in your browser:
```
open index.html
# or double-click it in your file explorer
```

> The game runs fully offline. Supabase features (XP persistence, leaderboard) are skipped gracefully.

### Option B — Local dev server (recommended)

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then visit: `http://localhost:8080`

---

## 🛢️ Supabase Setup (Optional — for persistence)

### 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Click **New project**, choose a name and region
3. Wait for the project to initialize (~1 min)

### 2. Run the SQL schema

1. In your project dashboard, go to **SQL Editor**
2. Open `supabase-setup.sql` from this repo
3. Paste the entire contents and click **Run**

This creates:
- `users` table — username, XP, wins
- `matches` table — game state persistence
- `questions` table — riddles & prefer-questions (pre-seeded)

### 3. Configure your credentials

1. In Supabase dashboard → **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Open `src/services/supabase.js` and replace:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';     // ← paste here
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // ← paste here
```

### 4. Enable Supabase SDK

In `index.html`, uncomment this line:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 5. Enable Anonymous Auth

In Supabase dashboard → **Authentication** → **Providers** → **Anonymous** → Enable

---

## 🎮 Gameplay

| Tile | Event |
|------|-------|
| ❓ Riddle | Answer correctly → advance; wrong → go back |
| ⚖️ Prefer | Choose between two fate options |
| ⚡ Power | Receive a random power-up |
| 💀 Trap | Suffer a random punishment |
| 🪜 Ladder | Jump ahead automatically |
| 🐍 Snake | Fall back automatically |
| 🏆 Tile 30 | WIN! |

### Powers (clickable in bottom-left panel)
| Power | Effect |
|-------|--------|
| ⚡ Double Roll | Next dice roll counts twice |
| 💨 Chaos Push | Push AI back 4 tiles |
| 🔄 Position Swap | Swap positions with AI |
| 🛡️ Shield | Block the next trap |
| 😴 AI Freeze | Skip AI's next turn |
| 🌀 Warp Forward | Teleport 8 tiles ahead |

---

## 🔧 Configuration

Edit `src/utils/board-config.js` to change:
- `TOTAL_TILES` — board length (default: 30)
- `TILE_EVENTS` — which tiles trigger which events
- `LADDERS` / `SNAKES` — jump destinations

Edit `src/data/questions.js` to add more riddles or prefer-questions.

---

## 🧩 Tech Stack

- **Phaser 3.60** — game engine (scenes, tweens, input)
- **Supabase** — auth + Postgres database
- **Web Audio API** — procedural sound effects (no audio files needed)
- **Google Fonts** — Fredoka One + Nunito
- Pure vanilla JS, no build step required

---

## ⭐ XP System

| Event | XP |
|-------|----|
| Win the game | +200 |
| Correct riddle | +50 |
| Land on power tile | +30 |
| Survive a trap | +10 |

XP is saved to Supabase and displayed in the main menu when logged in.

---

## 📦 No Build Required

Everything runs from a single `index.html`. CDN scripts load Phaser. No webpack, no bundler, no npm install needed.
