-- ================================================
-- SUPABASE — Script de configuración de tablas
-- InfoMática Platform
-- Ejecuta esto en: Supabase Dashboard → SQL Editor
-- ================================================

-- ============================================
-- 1. TABLA: profiles (datos del usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  age_group TEXT CHECK (age_group IN ('kids', 'teen', 'adult', 'senior')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_lessons_completed INTEGER DEFAULT 0,
  sim_tasks_done INTEGER DEFAULT 0,
  quizzes_done INTEGER DEFAULT 0,
  perfect_quizzes INTEGER DEFAULT 0,
  unlocked_achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLA: lesson_progress (lecciones completadas)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  module TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)  -- No puede completar la misma lección dos veces
);

-- ============================================
-- 3. TABLA: xp_history (historial de XP ganado)
-- ============================================
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  xp_gained INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABLA: lessons (contenido de lecciones)
-- Nota: En el MVP, esto está en el frontend.
-- Para escalar, migra aquí el contenido.
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  order_num INTEGER,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,  -- HTML content
  quiz_json JSONB,  -- { question, options[], explanation }
  duration_minutes INTEGER,
  xp_reward INTEGER DEFAULT 20,
  required_level INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- IMPORTANTE: Activa RLS en Supabase
-- ============================================

-- Activar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política: usuarios solo ven su propio progreso
CREATE POLICY "Users can manage own progress" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo ven su propio historial XP
CREATE POLICY "Users can manage own xp history" ON xp_history
  FOR ALL USING (auth.uid() = user_id);

-- Lessons son públicas (lectura)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are publicly readable" ON lessons
  FOR SELECT USING (true);

-- ============================================
-- 6. FUNCIÓN: Actualizar fecha de modificación
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. FUNCIÓN: Auto-crear perfil al registrarse
-- (Trigger en auth.users)
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, age_group)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Estudiante'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'age_group', 'adult')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ✅ VERIFICACIÓN: Revisa que todo se creó bien
-- ============================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
