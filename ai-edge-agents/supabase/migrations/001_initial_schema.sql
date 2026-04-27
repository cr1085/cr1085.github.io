-- ============================================================
-- AUTONOMOUS TASK AGENT — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extended profile, Supabase Auth handles auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  goal          TEXT,                          -- What the agent must achieve
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','running','completed','failed','cancelled')),
  priority      INTEGER DEFAULT 5             -- 1 (highest) to 10 (lowest)
                  CHECK (priority BETWEEN 1 AND 10),
  max_iterations INTEGER DEFAULT 5,           -- Safety limit
  context       JSONB DEFAULT '{}',           -- Seed context for the agent
  result        JSONB,                        -- Final result payload
  error_message TEXT,
  scheduled_at  TIMESTAMPTZ,                  -- NULL = run ASAP
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status   ON public.tasks(status);
CREATE INDEX idx_tasks_user_id  ON public.tasks(user_id);
CREATE INDEX idx_tasks_priority ON public.tasks(priority, created_at);

-- ============================================================
-- TASK RUNS  (one row per agent iteration / attempt)
-- ============================================================
CREATE TABLE public.task_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id       UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  iteration     INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running','completed','failed')),
  input         JSONB,   -- Context fed into this iteration
  output        JSONB,   -- Raw agent output
  tool_calls    JSONB,   -- Tools invoked during this run
  tokens_used   INTEGER,
  duration_ms   INTEGER,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  ended_at      TIMESTAMPTZ
);

CREATE INDEX idx_task_runs_task_id ON public.task_runs(task_id);

-- ============================================================
-- TASK LOGS  (structured log lines per task)
-- ============================================================
CREATE TABLE public.task_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  run_id     UUID REFERENCES public.task_runs(id) ON DELETE SET NULL,
  level      TEXT NOT NULL DEFAULT 'info'
               CHECK (level IN ('debug','info','warn','error','success')),
  message    TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX idx_task_logs_level   ON public.task_logs(level);

-- ============================================================
-- AGENT MEMORY  (persistent context / knowledge store)
-- ============================================================
CREATE TABLE public.agent_memory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id     UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL DEFAULT 'fact'
                CHECK (memory_type IN ('fact','plan','result','preference','tool_output')),
  key         TEXT NOT NULL,
  value       JSONB NOT NULL,
  relevance   FLOAT DEFAULT 1.0,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX idx_memory_task_id ON public.agent_memory(task_id);
CREATE INDEX idx_memory_key     ON public.agent_memory(key);

-- ============================================================
-- AGENT TOOLS REGISTRY  (available tools the agent can use)
-- ============================================================
CREATE TABLE public.agent_tools (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled     BOOLEAN DEFAULT TRUE,
  config      JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_runs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tools  ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Tasks: own tasks only
CREATE POLICY "tasks_own" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Task runs: via task ownership
CREATE POLICY "task_runs_own" ON public.task_runs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  );

-- Task logs: via task ownership
CREATE POLICY "task_logs_own" ON public.task_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
  );

-- Agent memory: own memories only
CREATE POLICY "memory_own" ON public.agent_memory
  FOR ALL USING (auth.uid() = user_id);

-- Tools: everyone can read, only service_role can write
CREATE POLICY "tools_read" ON public.agent_tools
  FOR SELECT USING (TRUE);

-- ============================================================
-- SEED: default tools
-- ============================================================
INSERT INTO public.agent_tools (name, description, config) VALUES
  ('web_search',    'Search the web for information',           '{"provider":"duckduckgo"}'),
  ('text_summary',  'Summarize long text content',              '{"max_tokens":500}'),
  ('task_splitter', 'Break a complex task into subtasks',       '{}'),
  ('memory_store',  'Save important facts to agent memory',     '{}'),
  ('memory_recall', 'Retrieve relevant memories by keyword',    '{}'),
  ('code_runner',   'Execute sandboxed JavaScript snippets',    '{"sandbox":true}'),
  ('http_request',  'Make HTTP GET/POST to external endpoints', '{"timeout_ms":5000}');

-- ============================================================
-- VIEW: task dashboard summary
-- ============================================================
CREATE VIEW public.v_task_summary AS
SELECT
  t.id,
  t.title,
  t.status,
  t.priority,
  t.created_at,
  t.completed_at,
  COUNT(tr.id)  AS total_runs,
  COUNT(tl.id)  AS total_logs
FROM public.tasks t
LEFT JOIN public.task_runs tr ON tr.task_id = t.id
LEFT JOIN public.task_logs tl ON tl.task_id = t.id
GROUP BY t.id;
