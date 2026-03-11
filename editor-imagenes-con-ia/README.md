<div align="center">

# PixelMind AI
### Open Source AI Image Editor SaaS

**No paid APIs · No vendor lock-in · Self-hostable · Free forever**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Deploy on Railway](https://img.shields.io/badge/Backend-Railway-purple)](https://railway.app)

</div>

---

## ✦ What is PixelMind AI?

A **full-featured AI image editor** that runs in the browser, uses only open source AI models, and can be deployed for **$0/month**. Think Canva + Photoshop + Stable Diffusion — fully open source.

### AI Features
| Feature | Model | Status |
|---------|-------|--------|
| Text → Image | Stable Diffusion 1.5 / SDXL | ✅ |
| Image → Image (restyle) | SD img2img | ✅ |
| Inpainting (remove objects) | SD inpaint | ✅ |
| AI Upscale 2x / 4x | RealESRGAN / ESRGAN | ✅ |
| Style Transfer | SD img2img | ✅ |
| ControlNet (poses/edges) | ControlNet | 🔜 |
| Background Removal | RMBG-1.4 | 🔜 |

### Editor Features
- 🖼 **Canvas Editor** — Fabric.js powered, Photoshop-like
- ✏️ **Drawing tools** — Brush, eraser, shapes, text
- 📚 **Layers system** — Full layer management
- 🎨 **Filters** — 9 one-click presets (B&W, Sepia, Neon...)
- 🔧 **Adjustments** — Brightness, contrast, saturation, blur, vignette
- ↩ **Undo/Redo** — Full history (50 states)
- 📤 **Export** — PNG, JPG at full quality

### SaaS Features
- 👥 **Multi-user** — Auth system with registration/login
- 📁 **Projects** — Save and organize work
- 🖼 **Gallery** — History of all AI generations
- ⚡ **Credits** — Usage tracking system
- 🔒 **JWT Auth** — Secure token-based auth

---

## 🚀 Quick Start (Frontend Only — No Server Required)

```bash
# Option 1: Just open in browser
open frontend/index.html   # macOS
xdg-open frontend/index.html   # Linux

# Option 2: Local dev server
npx serve frontend -p 8080
# Open: http://localhost:8080

# Option 3: Python
cd frontend && python3 -m http.server 8080
```

**Demo credentials:** `demo@pixelmind.ai` / `demo1234`

---

## 🤖 Setting Up AI (Stable Diffusion)

### Option A: Stable Diffusion WebUI (Recommended)

```bash
# 1. Install and start SD WebUI with API
bash scripts/install-sd.sh

# Or manually if you have it installed:
cd stable-diffusion-webui
./webui.sh --api --cors-allow-origins="*"

# 2. In PixelMind AI, select "Stable Diffusion (Local)"
#    and click "Test Connection" — should show ● Connected
```

### Option B: ComfyUI

```bash
bash scripts/start-comfyui.sh
# Then select "ComfyUI" in the backend selector
```

### Option C: HuggingFace Spaces (Zero local setup)

1. Fork any public SD space on HuggingFace
2. Enable the API via the space settings
3. Enter the space URL in the backend config field

### Demo Mode
Works without any AI backend — shows placeholder gradient images so you can explore the UI.

---

## 🖥️ Full Backend Setup (Node.js + SQLite)

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env and set JWT_SECRET

# Start backend
npm start
# Backend runs on http://localhost:3001
# Frontend served automatically
```

---

## ☁️ Free Deployment

### Frontend Only (Static) — Deploy in 60 seconds

**GitHub Pages:**
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOU/pixelmind-ai
git push -u origin main
# Enable GitHub Pages → Settings → Pages → main branch → /frontend folder
```

**Vercel (one command):**
```bash
npx vercel --yes
# Vercel auto-detects static site, deploys /frontend
```

**Netlify:**
```bash
npx netlify-cli deploy --dir=frontend --prod
```

### Full Stack (Frontend + Backend) — Free Tiers

| Service | What it hosts | Free tier |
|---------|--------------|-----------|
| **Vercel** | Frontend | Unlimited static |
| **Railway** | Node.js backend | $5 free credit/mo |
| **Render** | Node.js backend | 750 hrs/mo |
| **Supabase** | PostgreSQL DB | 500MB free |
| **Cloudflare R2** | Image storage | 10GB free |
| **GitHub LFS** | Large files | 1GB free |

**Deploy backend to Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Add environment variables in Railway dashboard
```

**Deploy backend to Render:**
```bash
# 1. Push to GitHub
# 2. Connect repo at render.com
# 3. Set Start Command: node backend/server.js
# 4. Add environment variables
```

---

## 📁 Project Structure

```
pixelmind-ai/
├── frontend/                 # Static frontend (deployable anywhere)
│   ├── index.html            # Main app shell
│   ├── css/
│   │   └── main.css          # Complete stylesheet
│   └── js/
│       ├── app.js            # App controller & routing
│       ├── auth.js           # Auth system (localStorage)
│       ├── canvas.js         # Fabric.js canvas manager
│       ├── ai-bridge.js      # AI backend bridge (SD/ComfyUI/HF)
│       ├── filters.js        # Image filters & adjustments
│       ├── projects.js       # Project & gallery management
│       └── storage.js        # LocalStorage persistence layer
│
├── backend/                  # Optional Node.js backend
│   └── server.js             # Express API (auth, projects, proxy)
│
├── scripts/
│   ├── install-sd.sh         # Auto-install Stable Diffusion
│   └── start-comfyui.sh      # Auto-install ComfyUI
│
├── docs/
│   └── architecture.md       # System design docs
│
├── package.json
├── .env.example
└── README.md
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│  │ Fabric.js│  │   Auth   │  │    AI Bridge         │   │
│  │ Canvas   │  │ (JWT/LS) │  │ ┌────────────────┐   │   │
│  └──────────┘  └──────────┘  │ │ Stable Diffusion│  │   │
│  ┌──────────┐  ┌──────────┐  │ │ ComfyUI        │  │   │
│  │ Filters  │  │ Projects │  │ │ HuggingFace    │  │   │
│  │ Adjust   │  │ Gallery  │  │ │ Demo Mode      │  │   │
│  └──────────┘  └──────────┘  │ └────────────────┘   │   │
└─────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────────┐
│  Node.js Backend │          │   AI Backend (Local) │
│  (Optional)      │          │                      │
│  Express + SQLite│          │  SD WebUI :7860      │
│  JWT Auth        │          │  ComfyUI  :8188      │
│  Projects API    │          │  (GPU recommended)   │
└──────────────────┘          └──────────────────────┘
         │
         ▼
┌──────────────────┐
│  Storage Options │
│  ─ SQLite (dev)  │
│  ─ Supabase      │
│  ─ Cloudflare R2 │
└──────────────────┘
```

---

## 💰 Monetization (Future / Optional)

The credit system is already built in. To monetize:

```javascript
// Plans (implement with Stripe / LemonSqueezy)
const PLANS = {
  free:    { credits: 50,   price: 0,   features: ['Basic tools', '512px max'] },
  pro:     { credits: 500,  price: 9,   features: ['All tools', '2048px', 'Priority'] },
  studio:  { credits: 2000, price: 29,  features: ['Unlimited*', 'API access', 'Teams'] },
};
```

**Free integrations:**
- **Stripe** — Payment processing (2.9% + 30¢ per transaction)
- **LemonSqueezy** — Simpler alternative to Stripe
- **Paddle** — International-friendly

---

## 🔧 Recommended Open Source Models

### Image Generation
| Model | Size | Best for |
|-------|------|---------|
| SD 1.5 | 4GB | Fast, compatible with most LoRAs |
| SDXL Base 1.0 | 7GB | High quality 1024px |
| Realistic Vision | 4GB | Photorealistic images |
| DreamShaper | 4GB | Artistic/fantasy |

### Upscaling
| Model | Scale | Notes |
|-------|-------|-------|
| RealESRGAN x4 | 4x | Best general upscaler |
| ESRGAN | 4x | Sharpness-focused |
| LDSR | 4x | Diffusion-based (slower) |

### ControlNet (Advanced)
| Type | Use case |
|------|---------|
| Canny | Edge-guided generation |
| OpenPose | Human pose control |
| Depth | 3D-aware generation |
| Inpaint | Advanced object removal |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML5 + CSS3 + Vanilla JS | Zero build step, GitHub Pages compatible |
| Canvas | Fabric.js 5.x | Best open source canvas library |
| AI | Stable Diffusion / ComfyUI | Open weights, self-hostable |
| Backend | Node.js + Express | Simple, fast, free hosting |
| Database | SQLite → Supabase | Zero cost, scale as needed |
| Auth | JWT (client) / bcrypt (server) | Standard, secure |
| Storage | LocalStorage → Cloudflare R2 | Free tiers available |
| Deploy | GitHub Pages / Vercel / Railway | $0/month |

---

## 🤝 Contributing

```bash
git fork https://github.com/YOUR_USERNAME/pixelmind-ai
git checkout -b feature/your-feature
git commit -m "feat: add amazing feature"
git push && open pull request
```

**Roadmap:**
- [ ] ControlNet integration
- [ ] Background removal (RMBG-1.4)
- [ ] Face restoration (GFPGAN)
- [ ] Batch processing
- [ ] Team workspaces
- [ ] Plugin system
- [ ] Mobile app (Capacitor)

---

## 📄 License

MIT License — Free for personal and commercial use.

---

<div align="center">
Made with ✦ · Open source forever · No paid APIs ever
</div>
