# ⬡ Autonomous Task Agent (ATA)

> A lightweight, open-source autonomous agent framework built on Supabase, vanilla JavaScript, and any OpenAI-compatible LLM. Deploy to GitHub Pages in minutes.

![Status](https://img.shields.io/badge/status-alpha-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-Supabase%20%7C%20Vanilla%20JS%20%7C%20GitHub%20Pages-blue)

---

## 🧠 What is ATA?

ATA is a **simplified AutoGPT-style agent** you can run entirely in your browser and deploy for free. It allows you to:

- Create tasks with natural language goals
- Have an AI agent plan and execute those tasks autonomously
- Track every step via structured logs
- Persist context with an agent memory system
- Observe everything from a real-time web dashboard

**No paid infra required.** Supabase free tier + GitHub Pages + any free LLM API (Groq, Together.ai, or Ollama locally) is all you need.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER / CLIENT                       │
│                                                         │
│   ┌──────────────┐    ┌───────────────┐                 │
│   │  Dashboard   │    │ Agent Worker  │                 │
│   │  (index.html)│    │  (worker.js)  │                 │
│   └──────┬───────┘    └──────┬────────┘                 │
│          │                  │                           │
│          └──────────┬────────┘                          │
│                     │ Supabase JS SDK                   │
└─────────────────────┼───────────────────────────────────┘
                      │
          ┌───────────▼──────────────┐
          │        SUPABASE          │
          │                          │
          │  ┌──────────────────┐    │
          │  │  PostgreSQL DB   │    │
          │  │  • tasks         │    │
          │  │  • task_runs     │    │
          │  │  • task_logs     │    │
          │  │  • agent_memory  │    │
          │  └──────────────────┘    │
          │                          │
          │  ┌──────────────────┐    │
          │  │  Realtime WS     │    │  ← live updates to UI
          │  └──────────────────┘    │
          │                          │
          │  ┌──────────────────┐    │
          │  │  Row Level       │    │  ← per-user isolation
          │  │  Security (RLS)  │    │
          │  └──────────────────┘    │
          └──────────────────────────┘
                      │
          ┌───────────▼──────────────┐
          │   LLM API (optional)     │
          │   OpenAI / Groq / Ollama │
          └──────────────────────────┘
```

### Data Flow

```
User creates task → Supabase (status: pending)
        ↓
Worker polls DB every 5s → claims task (status: running)
        ↓
Agent Core:
  1. Recall memories from agent_memory
  2. Call LLM with goal + context + memories
  3. LLM returns { action, args, done }
  4. Execute tool (web_search, http_request, code_runner…)
  5. Store result in agent_memory
  6. Log step to task_logs
  7. Repeat until done=true or max_iterations reached
        ↓
Update task status → completed / failed
        ↓
Dashboard updates in real-time via Supabase Realtime
```

---

## 📁 Repository Structure

```
/autonomous-task-agent
├── frontend/
│   ├── index.html          # Main dashboard SPA
│   ├── css/
│   │   └── dashboard.css   # All styles
│   └── js/
│       ├── config.js        # Configuration (copy & fill)
│       └── supabase-client.js  # DB helpers
│
├── agent/
│   ├── core/
│   │   └── agent-core.js   # Main agent loop + LLM caller
│   ├── tools/
│   │   └── example-tasks.js # Plugin system + sample tasks
│   └── prompts/
│       └── prompts.js       # LLM system prompts
│
├── workers/
│   └── worker.js            # Task queue poller
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema
│
├── docs/
│   ├── ARCHITECTURE.md      # Deep-dive architecture
│   ├── CONTRIBUTING.md      # Contributor guide
│   └── INTERN_GUIDE.md      # Onboarding for interns
│
├── scripts/
│   └── seed.js              # Seed example tasks
│
├── .env.example             # Environment variables template
├── .gitignore
└── README.md                # This file
```

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/autonomous-task-agent.git
cd autonomous-task-agent
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → Create free project
2. Open **SQL Editor** → paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Settings → API** → copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_ANON_KEY`

### 3. Configure

```bash
# Copy the config template
cp frontend/js/config.js frontend/js/config.local.js
```

Edit `config.local.js`:
```javascript
supabase: {
  url:     "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-KEY",
},
llm: {
  baseUrl: "https://api.groq.com/openai/v1",  // free tier available
  apiKey:  "YOUR-GROQ-KEY",
  model:   "llama3-8b-8192",
},
```

> ⚠️ **Never commit real keys.** `config.local.js` is in `.gitignore`.

### 4. Run locally

```bash
# Any static file server works
npx serve frontend/
# or
python3 -m http.server 8080 --directory frontend/
```

Open `http://localhost:8080`

### 5. Deploy to GitHub Pages

```bash
# Enable GitHub Pages in your repo settings → Source: main branch → /frontend folder
# Or use the Actions workflow (see docs/CONTRIBUTING.md)
```

---

## 🤖 Running the Agent

1. Sign in to the dashboard
2. Click **+ New Task** → fill in goal and settings
3. Go to **Worker** tab → press **▶ Start Worker**
4. Watch the agent execute in real-time in the Logs panel

---

## 🔌 Adding New Tools (Plugin System)

```javascript
import { AgentPlugin } from './agent/tools/example-tasks.js';

AgentPlugin.register({
  name: "send_email",
  description: "Send an email via a configured API.",
  schema: { to: "string", subject: "string", body: "string" },
  async run({ to, subject, body }) {
    // implement with any email API
    const res = await fetch("https://api.resend.com/emails", { ... });
    return { sent: true, id: res.id };
  },
});
```

Then reference the tool by name in the LLM prompt config.

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user profiles |
| `tasks` | Task definitions + lifecycle state |
| `task_runs` | One row per agent iteration |
| `task_logs` | Structured log lines |
| `agent_memory` | Persistent key-value context store |
| `agent_tools` | Tool registry |

---

## 🆓 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Supabase | 500MB DB, 2GB transfer, 50K MAU |
| GitHub Pages | Unlimited static hosting |
| Groq | 14,400 req/day on Llama 3 |
| Together.ai | $25 free credits |
| Ollama | Fully local, unlimited |

---

## 🗺️ Roadmap

- [ ] Multi-user collaboration
- [ ] Scheduled / recurring tasks  
- [ ] File upload support (Supabase Storage)
- [ ] Email / webhook notifications
- [ ] Task templates marketplace
- [ ] Node.js worker for background processing
- [ ] Mobile-responsive UI

---

## 🤝 Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## 📄 License

MIT — do whatever you want, just keep the attribution.
