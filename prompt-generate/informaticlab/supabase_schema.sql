-- ═══════════════════════════════════════════════════
-- TypeTrail — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────
-- PROFILES TABLE
-- Extended user data beyond Supabase auth.users
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name            TEXT NOT NULL DEFAULT 'Usuario',
  xp              INTEGER NOT NULL DEFAULT 0,
  streak          INTEGER NOT NULL DEFAULT 0,
  best_wpm        INTEGER NOT NULL DEFAULT 0,
  avg_wpm         INTEGER NOT NULL DEFAULT 0,
  avg_accuracy    INTEGER NOT NULL DEFAULT 100,
  total_words     INTEGER NOT NULL DEFAULT 0,
  total_sessions  INTEGER NOT NULL DEFAULT 0,
  achievements    TEXT[] NOT NULL DEFAULT '{}',
  last_active     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────
-- SESSIONS TABLE
-- Individual practice session records
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wpm         INTEGER NOT NULL DEFAULT 0,
  accuracy    INTEGER NOT NULL DEFAULT 0,
  words       INTEGER NOT NULL DEFAULT 0,
  duration    INTEGER NOT NULL DEFAULT 0, -- seconds
  mode        TEXT DEFAULT 'practice',    -- 'practice' | 'lesson' | 'game'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON public.sessions(created_at DESC);

-- RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────
-- LEADERBOARD VIEW (optional — shows top players)
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    p.name,
    p.best_wpm,
    p.avg_wpm,
    p.xp,
    p.total_sessions,
    p.streak
  FROM public.profiles p
  ORDER BY p.best_wpm DESC
  LIMIT 100;

-- ─────────────────────────────────────────────────────
-- FUNCTION: Auto-create profile on signup
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuario')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────
-- SAMPLE DATA (optional — for testing)
-- ─────────────────────────────────────────────────────
-- (No sample data needed — profiles are created via auth)

-- ─────────────────────────────────────────────────────
-- NOTES FOR SETUP
-- ─────────────────────────────────────────────────────
-- 1. In Supabase Dashboard → Authentication → Settings:
--    - Enable Email/Password sign-in
--    - (Optional) Disable email confirmation for dev
--
-- 2. In index.html, replace:
--    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
--    const SUPABASE_KEY = 'YOUR_ANON_KEY';
--    With your real project URL and anon key from:
--    Project Settings → API → Project URL & anon key
--
-- 3. The app works WITHOUT Supabase too — it falls back
--    to localStorage automatically (great for local dev)
