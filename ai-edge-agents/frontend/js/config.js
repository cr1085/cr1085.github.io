// ============================================================
// config.js — Autonomous Task Agent
// Copy this file and fill in your own Supabase credentials.
// NEVER commit real credentials to GitHub.
// ============================================================

const ATA_CONFIG = {
  // ── Supabase ───────────────────────────────────────────────
  supabase: {
    url:    "YOUR_SUPABASE_URL",          // https://xxxx.supabase.co
    anonKey: "YOUR_SUPABASE_ANON_KEY",   // public anon key (safe for frontend)
  },

  // ── LLM Provider (optional — plug any OpenAI-compatible API)
  llm: {
    provider:  "openai",                  // "openai" | "together" | "groq" | "ollama"
    baseUrl:   "https://api.openai.com/v1",
    apiKey:    "YOUR_LLM_API_KEY",        // store in env var, never commit
    model:     "gpt-3.5-turbo",           // or any open model on Together/Groq
    maxTokens: 1024,
    temperature: 0.7,
  },

  // ── Agent behaviour ────────────────────────────────────────
  agent: {
    pollIntervalMs:  5000,    // how often the worker polls for pending tasks
    maxIterations:   5,       // default safety limit per task
    memoryLimit:     20,      // max memory entries retrieved per context build
    logLevel:        "info",  // "debug" | "info" | "warn" | "error"
  },

  // ── App ────────────────────────────────────────────────────
  app: {
    name:    "Autonomous Task Agent",
    version: "0.1.0",
    baseUrl: "https://YOUR-ORG.github.io/autonomous-task-agent",
  },
};

// For Node.js environments, override with env vars
if (typeof process !== "undefined" && process.env) {
  ATA_CONFIG.supabase.url      = process.env.SUPABASE_URL      || ATA_CONFIG.supabase.url;
  ATA_CONFIG.supabase.anonKey  = process.env.SUPABASE_ANON_KEY || ATA_CONFIG.supabase.anonKey;
  ATA_CONFIG.llm.apiKey        = process.env.LLM_API_KEY        || ATA_CONFIG.llm.apiKey;
}

// Export for both browser (global) and Node (module)
if (typeof module !== "undefined") module.exports = ATA_CONFIG;
