-- ================================================
-- supabase-assistant-schema.sql
-- Schema para el Asistente Inteligente InfoMática
-- ================================================

-- 1. TABLA DE CONOCIMIENTO (Base de conocimiento escalable)
-- Cada fila es un "fragmento" de conocimiento que el asistente puede usar
CREATE TABLE IF NOT EXISTS assistant_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Categorización
  category TEXT NOT NULL,           -- 'module', 'faq', 'tip', 'greeting', 'motivation', 'navigation', 'concept'
  subcategory TEXT,                 -- 'pc_basico', 'mecanografia', 'mouse', etc. (module id)
  tags TEXT[] DEFAULT '{}',         -- ['principiante', 'teclado', 'mouse'] para búsqueda
  
  -- Contenido
  title TEXT NOT NULL,              -- Título corto del conocimiento
  content TEXT NOT NULL,            -- El texto/respuesta completa
  triggers TEXT[] DEFAULT '{}',     -- Palabras/frases que activan este conocimiento
  
  -- Metadatos
  priority INTEGER DEFAULT 0,      -- Mayor = más importante al buscar
  min_level INTEGER DEFAULT 1,     -- Nivel mínimo del usuario para mostrar esto
  max_level INTEGER DEFAULT 10,    -- Nivel máximo (null = todos)
  is_active BOOLEAN DEFAULT true,  -- Se puede desactivar sin borrar
  
  -- Contexto (cuándo mostrar automáticamente)
  auto_show_section TEXT,          -- Sección donde mostrar automáticamente: 'dashboard', 'modules', etc.
  auto_show_condition TEXT,        -- Condición JS evaluable: 'state.level === 1'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_knowledge_category ON assistant_knowledge(category);
CREATE INDEX idx_knowledge_subcategory ON assistant_knowledge(subcategory);
CREATE INDEX idx_knowledge_tags ON assistant_knowledge USING GIN(tags);
CREATE INDEX idx_knowledge_triggers ON assistant_knowledge USING GIN(triggers);
CREATE INDEX idx_knowledge_active ON assistant_knowledge(is_active) WHERE is_active = true;

-- 2. TABLA DE CONVERSACIONES
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT DEFAULT 'Nueva conversación',
  context_section TEXT,            -- Sección donde inició la conversación
  context_module TEXT,             -- Módulo activo al momento de la conversación
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON assistant_conversations(user_id);

-- 3. TABLA DE MENSAJES
CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Metadata del contexto cuando se envió
  context JSONB DEFAULT '{}',      -- { section, module, level, xp, ... }
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON assistant_messages(conversation_id);
CREATE INDEX idx_messages_user ON assistant_messages(user_id);

-- 4. TABLA DE FEEDBACK (para mejorar el asistente)
CREATE TABLE IF NOT EXISTS assistant_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES assistant_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating IN (-1, 0, 1)),  -- -1 = malo, 0 = ok, 1 = útil
  comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Knowledge: lectura pública, escritura solo admin
ALTER TABLE assistant_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_select" ON assistant_knowledge FOR SELECT USING (true);
CREATE POLICY "knowledge_insert" ON assistant_knowledge FOR INSERT WITH CHECK (false);
CREATE POLICY "knowledge_update" ON assistant_knowledge FOR UPDATE USING (false);

-- Conversations: solo el usuario dueño
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select" ON assistant_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conv_insert" ON assistant_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conv_update" ON assistant_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conv_delete" ON assistant_conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages: solo el usuario dueño
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON assistant_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "msg_insert" ON assistant_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback: solo el usuario dueño
ALTER TABLE assistant_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fb_select" ON assistant_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fb_insert" ON assistant_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_updated
  BEFORE UPDATE ON assistant_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversations_updated
  BEFORE UPDATE ON assistant_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- FUNCIÓN RPC: Búsqueda de conocimiento por similitud de texto
-- (Sin pgvector - usa ILIKE para coincidencias)
-- ================================================
CREATE OR REPLACE FUNCTION search_knowledge(
  search_query TEXT,
  search_category TEXT DEFAULT NULL,
  search_min_level INTEGER DEFAULT 1,
  search_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  subcategory TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  priority INTEGER,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.category,
    k.subcategory,
    k.title,
    k.content,
    k.tags,
    k.priority,
    -- Puntuación de relevancia simple
    (
      CASE WHEN k.title ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
      CASE WHEN k.content ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
      CASE WHEN search_query = ANY(k.triggers) THEN 15 ELSE 0 END +
      COALESCE(
        (SELECT COUNT(*) FROM unnest(k.tags) AS t 
         WHERE t ILIKE '%' || search_query || '%') * 3,
        0
      ) +
      k.priority
    ) AS relevance_score
  FROM assistant_knowledge k
  WHERE 
    k.is_active = true
    AND k.min_level <= search_min_level
    AND (k.max_level IS NULL OR k.max_level >= search_min_level)
    AND (search_category IS NULL OR k.category = search_category)
    AND (
      k.title ILIKE '%' || search_query || '%'
      OR k.content ILIKE '%' || search_query || '%'
      OR search_query = ANY(k.triggers)
      OR search_query = ANY(k.tags)
      OR EXISTS (
        SELECT 1 FROM unnest(k.tags) AS t 
        WHERE t ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY relevance_score DESC
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;
