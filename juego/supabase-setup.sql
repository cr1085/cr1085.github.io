-- ============================================================
-- SUPABASE DATABASE SETUP
-- Run these SQL commands in your Supabase SQL editor
-- Project: https://supabase.com/dashboard
-- ============================================================

-- 1. USERS TABLE
-- ──────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null default 'Player',
  xp          integer not null default 0,
  wins        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policies: users can read all, but only update their own
create policy "Users are viewable by everyone"
  on public.users for select using (true);

create policy "Users can insert their own profile"
  on public.users for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);


-- 2. MATCHES TABLE
-- ──────────────────────────────────────────────────────────
create table if not exists public.matches (
  id            uuid primary key default gen_random_uuid(),
  players       jsonb not null default '[]',
  current_turn  integer not null default 0,
  state         jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Matches are viewable by everyone"
  on public.matches for select using (true);

create policy "Anyone can create a match"
  on public.matches for insert with check (true);

create policy "Anyone can update a match"
  on public.matches for update using (true);


-- 3. QUESTIONS TABLE
-- ──────────────────────────────────────────────────────────
create table if not exists public.questions (
  id        uuid primary key default gen_random_uuid(),
  type      text not null check (type in ('riddle', 'prefer')),
  question  text not null,
  options   jsonb not null default '[]',
  answer    text,           -- for riddles
  reward    integer,        -- tiles to advance on correct
  penalty   integer,        -- tiles to go back on wrong (negative)
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Questions are viewable by everyone"
  on public.questions for select using (true);

create policy "Service role can manage questions"
  on public.questions for all using (true);


-- 4. SEED QUESTIONS
-- ──────────────────────────────────────────────────────────
insert into public.questions (type, question, options, answer, reward, penalty) values
  ('riddle', 'I have cities, but no houses live there. Mountains, but no trees. Water, but no fish. What am I?',
   '["A dream","A map","A painting","A mirror"]', 'A map', 3, -2),

  ('riddle', 'The more you take, the more you leave behind. What am I?',
   '["Memories","Footsteps","Time","Money"]', 'Footsteps', 4, -2),

  ('riddle', 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
   '["A ghost","An echo","A shadow","A cloud"]', 'An echo', 3, -3),

  ('riddle', 'What has hands but cannot clap?',
   '["A statue","A clock","A glove","A puppet"]', 'A clock', 2, -1),

  ('riddle', 'What gets wetter the more it dries?',
   '["Rain","A towel","A sponge","Ice"]', 'A towel', 2, -2),

  ('riddle', 'I have keys but no locks. I have space but no room. You can enter, but cannot go inside. What am I?',
   '["A keyboard","A map","A dictionary","A piano"]', 'A keyboard', 3, -2),

  ('riddle', 'What has a head and a tail but no body?',
   '["A snake","A coin","A comet","A rope"]', 'A coin', 2, -1),

  ('prefer', 'A risky gamble — choose your fate!',
   '[{"text":"✅ Safe: Advance 4 tiles","effect":{"type":"advance","amount":4}},{"text":"🎰 Risky: 50/50 — advance 10 or go back 3","effect":{"type":"gamble","win":10,"lose":-3}}]',
   null, null, null),

  ('prefer', 'Time for a deal with the chaos gods!',
   '[{"text":"🛡️ Skip next turn but gain a Shield","effect":{"type":"power_skip","power":"shield"}},{"text":"⚡ Roll again right now!","effect":{"type":"extra_roll"}}]',
   null, null, null),

  ('prefer', 'The board has spoken — make your choice!',
   '[{"text":"📍 Teleport to tile 15 (guaranteed)","effect":{"type":"teleport","tile":15}},{"text":"🎲 Roll two dice and take the higher","effect":{"type":"double_roll"}}]',
   null, null, null),

  ('prefer', 'Chaos demands a sacrifice or a reward!',
   '[{"text":"💀 Swap positions with AI","effect":{"type":"swap"}},{"text":"🏃 Advance 6 tiles safely","effect":{"type":"advance","amount":6}}]',
   null, null, null),

  ('prefer', 'The Chaos Merchant appears before you!',
   '[{"text":"🎁 Get a random power-up","effect":{"type":"random_power"}},{"text":"⏩ Advance 5 tiles immediately","effect":{"type":"advance","amount":5}}]',
   null, null, null);


-- 5. UPDATED_AT TRIGGER (optional quality-of-life)
-- ──────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger on_matches_updated
  before update on public.matches
  for each row execute procedure public.handle_updated_at();
