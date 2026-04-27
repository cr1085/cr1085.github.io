-- ═══════════════════════════════════════════════════════════
-- ShortScript Studio — Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ═══════════════════════════════════════════════════════════

-- Community Prompts table
CREATE TABLE IF NOT EXISTS community_prompts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  niche       text,
  prompt      text NOT NULL,
  likes       integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Shared Scripts table
CREATE TABLE IF NOT EXISTS shared_scripts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic       text NOT NULL,
  title       text,
  narration   text,
  hashtags    text[],
  structure   text,
  duration    integer,
  language    text DEFAULT 'es',
  created_at  timestamptz DEFAULT now()
);

-- ── Row Level Security (public read) ──

ALTER TABLE community_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_scripts    ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public prompts)
CREATE POLICY "Public read community_prompts"
  ON community_prompts FOR SELECT USING (true);

CREATE POLICY "Public insert community_prompts"
  ON community_prompts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read shared_scripts"
  ON shared_scripts FOR SELECT USING (true);

CREATE POLICY "Public insert shared_scripts"
  ON shared_scripts FOR INSERT WITH CHECK (true);

-- ── Seed example prompts ──

INSERT INTO community_prompts (name, niche, prompt) VALUES
  ('Datos de One Piece que sorprenden',      'anime',      'Genera hooks sobre secretos de One Piece que los fans no conocen.'),
  ('Ahorro inteligente en 30 segundos',      'finanzas',   'Tips de ahorro para jóvenes. Hook con estadística + tip accionable + CTA.'),
  ('Mitos del gym que debes ignorar',        'fitness',    'Mitos populares del gym que la ciencia desmiente. Tono polémico educativo.'),
  ('Sesgos cognitivos que te controlan',     'psicología', 'Sesgos cognitivos cotidianos. Hook pregunta + explicación + reflexión.'),
  ('Historia que no te enseñaron',           'historia',   'Hechos históricos que los libros omiten. Hook dramático + dato impactante.'),
  ('La IA cambia esto para siempre',         'tecnología', 'Impacto de la IA. Tono curioso + dato reciente + pregunta al espectador.');
