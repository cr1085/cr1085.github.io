-- ════════════════════════════════════════════════════
-- schema.sql — Base de datos para SubGen
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════

-- ── Tabla principal de videos ────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  language        TEXT DEFAULT 'es',
  model           TEXT DEFAULT 'small',
  status          TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'done', 'error')),
  srt_content     TEXT,
  srt_path        TEXT,
  subtitle_count  INTEGER DEFAULT 0,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_videos_user_id    ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status     ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ── Row Level Security (RLS) ─────────────────────────
-- Solo el dueño puede ver y modificar sus videos

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: cada usuario solo ve sus propios videos
CREATE POLICY "Users can view own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: cada usuario solo puede insertar sus propios videos
CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: cada usuario solo puede actualizar sus propios videos
CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: cada usuario puede borrar sus propios videos
CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- ── Storage bucket y políticas ───────────────────────
-- Ejecutar solo si no existe el bucket

-- Crear bucket 'videos' (también puedes hacerlo desde el dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('videos', 'videos', false);

-- Policy: usuarios autenticados pueden subir a su carpeta
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: usuarios pueden leer sus propios archivos
CREATE POLICY "Users read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Edge Functions (service role) pueden leer todos los archivos
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'videos');

-- ── Función para actualizar updated_at ───────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Vista útil para estadísticas ─────────────────────
CREATE OR REPLACE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*)                                    AS total_videos,
  COUNT(*) FILTER (WHERE status = 'done')     AS completed_videos,
  COUNT(*) FILTER (WHERE status = 'error')    AS failed_videos,
  SUM(subtitle_count)                         AS total_subtitles,
  MAX(created_at)                             AS last_activity
FROM videos
GROUP BY user_id;
