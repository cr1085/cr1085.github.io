# Architecture Deep-Dive — Autonomous Task Agent

## System Overview

ATA is a **client-side autonomous agent** that uses Supabase as its persistence layer and any OpenAI-compatible LLM as its reasoning engine.

## Key Design Decisions

### 1. No backend server
Everything runs in the browser. The Supabase JS SDK communicates directly with Supabase over HTTPS. This means:
- Zero server costs
- Deployable to GitHub Pages
- Easy onboarding (just open the HTML)

**Tradeoff**: API keys for LLMs must be stored client-side (acceptable for internal tools; use environment-specific config files that are gitignored for production).

### 2. Task lifecycle state machine

```
PENDING → RUNNING → COMPLETED
                 ↘ FAILED
         ↓
      CANCELLED
```

State transitions are protected by Supabase RLS — each user can only modify their own tasks.

### 3. Agent loop design

```
while (iteration < maxIterations && !done) {
  memories = recallMemory(taskTitle)
  plan = LLM(systemPrompt + goal + memories)
  result = executeTool(plan.action, plan.args)
  saveMemory(result)
  logStep(result)
  iteration++
}
```

The loop is **synchronous within an iteration** but **asynchronous across iterations**. This makes it easy to interrupt, inspect, and extend.

### 4. Memory system

The `agent_memory` table functions as a simple vector-free knowledge store. For this MVP, recall is keyword-based (SQL ILIKE). Future enhancement: add pgvector for semantic search.

### 5. Plugin architecture

Tools are registered in a plain JS object (TOOLS in agent-core.js). Plugins extend this by providing a registration API. The LLM sees available tool names in its system prompt and returns the tool to invoke as structured JSON.

## Scaling Paths

| Concern | Current | Scale-up |
|---------|---------|----------|
| Worker | Browser tab | Node.js cron / Supabase Edge Function |
| Memory | Keyword search | pgvector semantic search |
| LLM | Single call | Parallel sub-agents |
| Storage | Supabase DB | Supabase Storage for files |
| Auth | Email/password | OAuth, SSO |
| Multi-tenant | Single user | Organization-level RLS |

## Adding Supabase Edge Functions

For background processing without a browser window:

```typescript
// supabase/functions/task-worker/index.ts
import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

serve(async () => {
  const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"))
  // ... same worker logic
})
```

Deploy with: `supabase functions deploy task-worker`
Schedule with: Supabase Cron (pg_cron).
