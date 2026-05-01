-- ═══════════════════════════════════════════════
-- LOGITRACK — Supabase Schema
-- Ejecuta este SQL en el Editor de Supabase
-- ═══════════════════════════════════════════════

-- 1. Tabla de Citas (Enturnamiento)
CREATE TABLE IF NOT EXISTS citas (
  id          BIGSERIAL PRIMARY KEY,
  empresa     TEXT NOT NULL,
  tipo        TEXT CHECK (tipo IN ('carga','descarga','mixto')) DEFAULT 'carga',
  fecha       DATE NOT NULL,
  hora        TIME NOT NULL,
  muelle      TEXT DEFAULT 'Muelle 1',
  duracion    INTEGER DEFAULT 60,   -- minutos
  estado      TEXT CHECK (estado IN ('pendiente','confirmado','completado')) DEFAULT 'pendiente',
  notas       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Cubicaje
CREATE TABLE IF NOT EXISTS cubicaje (
  id              BIGSERIAL PRIMARY KEY,
  container_type  TEXT NOT NULL,
  total_volume_m3 DECIMAL(10,4),
  total_weight_kg DECIMAL(10,2),
  products_json   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Rutas
CREATE TABLE IF NOT EXISTS rutas (
  id              BIGSERIAL PRIMARY KEY,
  origin          TEXT NOT NULL,
  stops_json      JSONB,
  vehicle_type    TEXT DEFAULT 'camion',
  total_km        DECIMAL(10,2),
  total_time_min  INTEGER,
  fuel_liters     DECIMAL(8,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Row Level Security (RLS) - básico para demo
-- ─────────────────────────────────────────────
ALTER TABLE citas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cubicaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas    ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo (ajustar según autenticación en producción)
CREATE POLICY "allow_all_citas"    ON citas    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cubicaje" ON cubicaje FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_rutas"    ON rutas    FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- Datos de ejemplo para demo
-- ─────────────────────────────────────────────
INSERT INTO citas (empresa, tipo, fecha, hora, muelle, duracion, estado, notas) VALUES
  ('Almacenes Éxito S.A.',   'carga',    CURRENT_DATE,       '08:00', 'Muelle 1', 60,  'confirmado', 'Traer orden de compra #4821'),
  ('Supermercados Olímpica', 'descarga', CURRENT_DATE,       '10:30', 'Muelle 2', 90,  'pendiente',  ''),
  ('Jumbo Colombia',         'mixto',    CURRENT_DATE,       '14:00', 'Muelle 1', 120, 'pendiente',  'Coordinar con jefe de patio'),
  ('D1 Logística',           'carga',    CURRENT_DATE,       '16:30', 'Muelle 3', 60,  'completado', ''),
  ('Carulla S.A.',           'descarga', CURRENT_DATE + 1,   '07:00', 'Muelle 2', 90,  'confirmado', ''),
  ('Makro Colombia',         'carga',    CURRENT_DATE + 1,   '11:00', 'Muelle 4', 60,  'pendiente',  'Productos refrigerados');
