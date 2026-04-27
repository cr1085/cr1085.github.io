# 🌟 LUMI — Agente Educativo Inteligente
## Documentación Técnica Completa | Arquitectura y Guía de Implementación

---

## 📋 TABLA DE CONTENIDOS
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura)
3. [Estructura de Carpetas](#estructura)
4. [Configuración Rápida](#configuración)
5. [Flujo de Datos](#flujo-de-datos)
6. [Base de Datos Supabase](#supabase)
7. [Fases de Desarrollo](#fases)
8. [Ideas Innovadoras](#innovación)
9. [Seguridad](#seguridad)
10. [Escalabilidad](#escalabilidad)

---

## 🎯 VISIÓN GENERAL

**Lumi** es un agente educativo inteligente diseñado para enseñar a niños y estudiantes de 6 a 17+ años, materias como matemáticas, ciencias, sociales, español, inglés y religión.

### Características Core del MVP
- ✅ Chat interactivo con IA real (Claude Sonnet)
- ✅ Avatar animado con expresiones
- ✅ Sistema de gamificación (XP, niveles, logros)
- ✅ Reconocimiento de voz y síntesis de voz
- ✅ Adaptación por edad
- ✅ Persistencia local
- ✅ Diseño responsivo (móvil + desktop)
- ✅ Seguimiento de temas

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  index.html  │  │  styles.css  │  │    app.js      │  │
│  │  (UI/UX)    │  │  (Diseño)    │  │  (Lógica)      │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│  ANTHROPIC   │  │    SUPABASE      │  │  WEB SPEECH  │
│  Claude API  │  │  (Base de datos) │  │    API       │
│              │  │  - Auth          │  │  (Voz I/O)   │
│  Generación  │  │  - Progreso      │  │              │
│  respuestas  │  │  - Historial     │  │  STT + TTS   │
│  educativas  │  │  - Logros        │  │  Nativo del  │
│              │  │                  │  │  navegador   │
└──────────────┘  └──────────────────┘  └──────────────┘

⚠️  PRODUCCIÓN: Nunca llames a la API de Anthropic directamente
    desde el browser. Usa un BACKEND PROXY:

Browser → Tu Servidor Node/Python → Anthropic API
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
lumi-edu-agent/
├── 📄 index.html          # Interfaz principal
├── 🎨 styles.css          # Estilos y animaciones
├── ⚙️  app.js             # Lógica de la app
├── 📚 README.md           # Esta documentación
│
├── backend/               # (Fase 2 - Producción)
│   ├── server.js          # Proxy seguro Node.js/Express
│   ├── routes/
│   │   ├── chat.js        # Endpoint de chat con Claude
│   │   ├── progress.js    # Endpoints de progreso
│   │   └── auth.js        # Autenticación Supabase
│   └── middleware/
│       ├── rateLimit.js   # Límite de peticiones
│       ├── sanitize.js    # Filtrado de contenido
│       └── auth.js        # Verificación de tokens
│
├── knowledge-base/        # (Fase 3 - RAG)
│   ├── math/
│   │   ├── algebra.md
│   │   ├── geometry.md
│   │   └── arithmetic.md
│   ├── science/
│   ├── social/
│   └── index.json         # Índice de búsqueda
│
└── assets/
    ├── audio/             # Efectos de sonido
    └── images/            # Logos, iconos
```

---

## ⚡ CONFIGURACIÓN RÁPIDA

### Opción A: Solo Frontend (Demostración)
```bash
# 1. Abre index.html en un navegador moderno
# 2. ¡Listo! Funciona con respuestas de fallback

# Para activar la IA real, edita app.js:
# Línea 15: API_KEY: "sk-ant-tu-clave-aqui"
```

### Opción B: Con Backend Seguro (Recomendado)
```bash
# 1. Instalar dependencias
npm init -y
npm install express cors dotenv @anthropic-ai/sdk @supabase/supabase-js

# 2. Variables de entorno (.env)
ANTHROPIC_API_KEY=sk-ant-tu-clave-aqui
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key
PORT=3001

# 3. Iniciar servidor
node backend/server.js
```

### Backend Proxy (server.js)
```javascript
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Rate limiting simple
const rateLimits = new Map();
app.use('/api', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60_000; // 1 minuto
  const maxRequests = 30;
  
  const prev = rateLimits.get(ip) || [];
  const recent = prev.filter(t => now - t < windowMs);
  
  if (recent.length >= maxRequests) {
    return res.status(429).json({ error: 'Demasiadas peticiones. Espera un momento.' });
  }
  
  rateLimits.set(ip, [...recent, now]);
  next();
});

// Endpoint principal de chat
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, studentName, age } = req.body;
  
  // Validación básica
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' });
  }
  
  // Filtro de contenido inapropiado
  const lastMsg = messages[messages.length - 1]?.content || '';
  if (containsInappropriateContent(lastMsg)) {
    return res.json({ 
      response: `${studentName}, esa pregunta está fuera de mi área educativa. ¿Me preguntas algo sobre tus materias escolares? 😊`
    });
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.slice(-10)
    });
    
    const aiText = response.content[0].text;
    
    // Guardar en Supabase (opcional)
    await saveMessageToSupabase(supabase, studentName, 'assistant', aiText);
    
    res.json({ response: aiText });
    
  } catch (error) {
    console.error('Error Claude API:', error);
    res.status(500).json({ error: 'Error procesando tu pregunta. ¡Intenta de nuevo!' });
  }
});

function containsInappropriateContent(text) {
  const banned = ['violencia', 'armas', 'drogas', 'contenido adulto'];
  return banned.some(word => text.toLowerCase().includes(word));
}

async function saveMessageToSupabase(supabase, studentName, role, content) {
  await supabase.from('chat_messages').insert({
    student_name: studentName,
    role,
    content,
    created_at: new Date().toISOString()
  });
}

app.listen(process.env.PORT || 3001, () => {
  console.log('🌟 Lumi Backend corriendo en puerto', process.env.PORT || 3001);
});
```

---

## 🗄️ BASE DE DATOS SUPABASE

### Esquema SQL (ejecutar en Supabase SQL Editor)
```sql
-- Tabla de estudiantes
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso
CREATE TABLE student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  student_name VARCHAR(100) UNIQUE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  topics_covered JSONB DEFAULT '[]',
  weak_topics JSONB DEFAULT '{}',
  preferred_subject VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes/historial
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  subject VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de logros
CREATE TABLE achievements_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(100),
  achievement_id VARCHAR(50),
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX idx_messages_student ON chat_messages(student_name, created_at DESC);
CREATE INDEX idx_progress_student ON student_progress(student_name);

-- Row Level Security
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

---

## 🔄 FLUJO DE DATOS

```
ESTUDIANTE escribe pregunta
        │
        ▼
app.js: sendMessage()
        │
        ├── Agrega mensaje a UI
        ├── Guarda en conversationHistory[]
        └── Llama getAIResponse()
                │
                ▼
        Construye buildSystemPrompt()
        (contexto: nombre, edad, materia,
         temas vistos, nivel actual)
                │
                ▼
        POST → /api/chat (backend proxy)
        ó POST → api.anthropic.com (dev)
                │
                ▼
        Recibe respuesta de Claude
                │
                ├── formatAIResponse() → HTML
                ├── analyzeResponseForRewards()
                ├── extractTopics()
                └── speakText() (si voz activa)
                        │
                        ▼
                Actualiza UI + Gamificación
                Guarda en localStorage/Supabase
```

---

## 🚀 FASES DE DESARROLLO

### 🌱 FASE 1 — MVP (Actual)
**Tiempo estimado: 1-2 semanas**
- [x] Interfaz visual completa
- [x] Avatar animado con expresiones
- [x] Chat con IA (Claude)
- [x] Gamificación básica (XP, niveles, logros)
- [x] Reconocimiento y síntesis de voz
- [x] Persistencia local
- [x] Adaptación por edad
- [x] Seguimiento de temas

### 🌿 FASE 2 — Versión Intermedia
**Tiempo estimado: 3-4 semanas**
- [ ] Backend Node.js con proxy seguro
- [ ] Autenticación real (Supabase Auth)
- [ ] Múltiples perfiles de estudiante
- [ ] Sistema RAG con contenido curricular
- [ ] Panel de control para padres/profesores
- [ ] Mini-juegos educativos (2-3 juegos)
- [ ] Notificaciones de logros por email
- [ ] Modo sin conexión (Service Worker)

### 🌳 FASE 3 — Plataforma Completa
**Tiempo estimado: 2-3 meses**
- [ ] App móvil (React Native / PWA)
- [ ] Modo profesor (crear lecciones)
- [ ] Salones virtuales multi-estudiante
- [ ] Integración con LMS escolares (Moodle, Google Classroom)
- [ ] Sistema RAG avanzado con libros de texto
- [ ] Análisis de aprendizaje con IA
- [ ] API para colegios (multitenancy)
- [ ] Soporte multiidioma

---

## 💡 IDEAS INNOVADORAS

### Mini-Juegos Educativos
```javascript
// Juego 1: Math Ninja - Operaciones rápidas
// Juego 2: Ciencias Quiz - Preguntas y respuestas
// Juego 3: Spelling Bee - Ortografía española/inglesa
// Juego 4: Historia Timeline - Arrastrar eventos al orden correcto
// Juego 5: Geografía Puzzle - Mapas interactivos

// Integración en el chat:
// Lumi: "¡Desafío activado! 🎮 ¿Puedes resolver 5 multiplicaciones en 60 segundos?"
// → Se abre mini-juego en overlay
```

### Narrativa del Personaje
```
Lumi es un pequeño ser de luz que vive en la "Biblioteca Universal" 📚✨
Cada vez que el estudiante aprende algo nuevo, Lumi crece y evoluciona:
  🌱 Semilla → 🌿 Brote → 🔭 Explorador → 💭 Pensador → ⭐ Estrella → 🏆 Maestro

Las misiones semanales desbloquean partes de la historia de Lumi.
```

### Reacciones Emocionales Avanzadas
```javascript
// Detectar frustración → Lumi pone cara preocupada y ofrece ayuda extra
// Detectar éxito → Lumi celebra con confetti y baile
// Después de 30 min → Lumi sugiere un descanso con mini-juego
// Racha de errores → Lumi cambia estrategia de explicación
```

### Sistema de Recompensas Visual
```
🏅 Medallas por materia (Matemático, Científico, Historiador...)
📜 Diplomas digitales descargables
🗺️ Mapa del conocimiento que se "desbloquea" conforme se aprende
🎒 Mochila virtual con "herramientas" ganadas (calculadora, lupa, etc.)
```

---

## 🔒 SEGURIDAD Y CONTROL PARENTAL

```javascript
// 1. Filtro de contenido en backend
const CONTENT_FILTERS = {
  bannedTopics: ['violencia', 'drogas', 'contenido adulto'],
  maxAge: 17,
  requireEducationalContext: true
};

// 2. Límite de tiempo de sesión
const MAX_SESSION_MINUTES = 60; // Con aviso a los 45 min

// 3. Panel parental
// - Ver historial de conversaciones
// - Ver temas estudiados
// - Configurar materias permitidas
// - Recibir reportes semanales por email

// 4. Supabase Row Level Security
// Los datos de cada estudiante solo son accesibles por su cuenta

// 5. Prompt de seguridad hardcodeado
// El system prompt siempre incluye:
// "NUNCA respondas sobre temas que no sean educativos.
//  NUNCA des información sobre violencia, drogas u contenido para adultos.
//  Si recibes una solicitud inapropiada, redirige amablemente al tema educativo."
```

---

## 📈 ESCALABILIDAD

### Para 1,000+ usuarios simultáneos
```
Frontend: CDN (Cloudflare/Vercel) — archivos estáticos
Backend: Node.js en Render/Railway con auto-scaling
IA: Anthropic Batch API para reducir costos
Base de Datos: Supabase con connection pooling (PgBouncer)
Caché: Redis para respuestas frecuentes (reducir llamadas a API)
```

### Integración con Colegios (B2B)
```
1. Multi-tenancy: cada colegio tiene su propio "espacio"
2. SSO: integración con Google Workspace / Microsoft 365
3. API de sincronización con sistemas escolares existentes
4. Dashboard administrativo para directivos
5. Reportes de rendimiento por grupo/curso
6. Personalización del avatar y nombre del agente
```

### Estimación de Costos (por estudiante/mes)
```
API Anthropic (Claude Sonnet): ~$0.15 - $0.50/estudiante
Supabase: Gratis hasta 500MB, luego $25/mes flat
Hosting (Vercel/Railway): $20-100/mes para 1000+ usuarios
Total estimado: $0.20-0.60/estudiante/mes
```

---

## 🛠️ STACK TECNOLÓGICO COMPLETO

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| Frontend | HTML/CSS/JS puro | Interfaz sin dependencias |
| IA | Claude Sonnet (Anthropic) | Respuestas educativas |
| Base de datos | Supabase (PostgreSQL) | Progreso y usuarios |
| Auth | Supabase Auth | Inicio de sesión |
| Voz | Web Speech API | STT + TTS nativo |
| Backend | Node.js + Express | Proxy seguro |
| Hosting | Vercel / Netlify | Frontend estático |
| CDN | Cloudflare | Rendimiento global |
| Monitoreo | Sentry | Errores en producción |

---

*Lumi v1.0 — Construido con ❤️ para la educación*
*Arquitectura diseñada para escalar de 1 a 1,000,000 estudiantes*
