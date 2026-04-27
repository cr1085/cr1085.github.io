# SubGen — Generador Automático de Subtítulos

> Aplicación web MVP para generar subtítulos automáticamente con IA usando Supabase + Whisper.

---

## Estructura del proyecto

```
subtitler/
├── index.html                         ← Interfaz principal
├── css/
│   └── styles.css                     ← Estilos (dark mode, industrial)
├── js/
│   ├── config.js                      ← 🔑 Tu config de Supabase
│   ├── supabase.js                    ← Auth, Storage y DB
│   ├── srt.js                         ← Generación y parsing de SRT
│   ├── ui.js                          ← Utilidades de interfaz
│   └── app.js                         ← Lógica principal
└── supabase/
    ├── schema.sql                     ← Schema de la base de datos
    └── functions/
        └── process-video/
            └── index.ts               ← Edge Function con Whisper
```

---

## Pasos para ejecutarlo

### PASO 1 — Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Clic en **"New Project"**, elige nombre y región.
3. Espera que termine de crear (aprox. 2 minutos).

---

### PASO 2 — Obtener credenciales

En el dashboard de Supabase:
- Ve a **Settings → API**
- Copia:
  - `Project URL` → pégalo en `js/config.js` como `url`
  - `anon/public key` → pégalo en `js/config.js` como `anonKey`

```js
// js/config.js
const SUPABASE_CONFIG = {
  url:    'https://TU_PROJECT_ID.supabase.co',  // ← aquí
  anonKey: 'eyJhbGciOiJIUzI1...',               // ← aquí
  ...
};
```

---

### PASO 3 — Crear la base de datos

1. En Supabase, ve a **SQL Editor**
2. Pega todo el contenido de `supabase/schema.sql`
3. Clic en **Run**

Esto crea:
- Tabla `videos` con Row Level Security
- Índices y triggers
- Políticas de seguridad

---

### PASO 4 — Crear bucket de Storage

1. En Supabase, ve a **Storage**
2. Clic en **"New Bucket"**
3. Nombre: `videos`
4. Desactiva "Public bucket" (privado es más seguro)
5. Clic en **Save**

> Las políticas RLS del schema.sql ya están listas para este bucket.

---

### PASO 5 — Configurar la Edge Function

#### 5a. Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/scripts/install.sh | sh
```

#### 5b. Login y link con tu proyecto

```bash
supabase login
supabase link --project-ref TU_PROJECT_ID
```

> Encuentra `TU_PROJECT_ID` en la URL de tu proyecto: `https://supabase.com/dashboard/project/TU_PROJECT_ID`

#### 5c. Configurar API Key de OpenAI (para Whisper)

```bash
supabase secrets set OPENAI_API_KEY=sk-TU_KEY_DE_OPENAI
```

> Obtén tu API key en [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Alternativa gratuita — Hugging Face:**
```bash
supabase secrets set HF_API_TOKEN=hf_TU_TOKEN
```
> Y cambia `transcribeWithWhisper()` por `transcribeWithHuggingFace()` en el Edge Function.

#### 5d. Desplegar la Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy process-video
```

Después del deploy, actualiza `config.js` con la URL de la función:

```js
edgeFunctionUrl: 'https://TU_PROJECT_ID.supabase.co/functions/v1/process-video',
```

---

### PASO 6 — Ejecutar la aplicación

#### Opción A — Con servidor local (recomendado)

```bash
# Con Python (ya instalado en macOS/Linux)
python3 -m http.server 3000

# Con Node.js
npx serve .

# Con VS Code → extensión "Live Server"
```

Abre [http://localhost:3000](http://localhost:3000)

#### Opción B — Sin servidor (limitado)

Simplemente abre `index.html` en tu navegador.
> ⚠️ Algunas funciones como fetch() requieren servidor HTTP.

---

### PASO 7 — Probar el flujo completo

1. **Registrarte** con email y contraseña
2. **Confirmar email** (revisa tu bandeja)
3. **Iniciar sesión**
4. **Subir un video** arrastrando o con el explorador
5. Seleccionar **idioma y modelo**
6. Clic en **"Generar Subtítulos"**
7. Esperar el proceso (upload → transcripción → SRT)
8. **Ver subtítulos** en el player integrado
9. **Descargar el .srt**

---

## Modo Demo (sin Edge Function)

Si no configuras la Edge Function, la app funciona en **modo demo**:
- Sube el video normalmente
- Se genera un SRT de ejemplo con el mismo número de segundos que el video
- Puedes probar toda la interfaz sin costo

Verás el aviso: _"Edge Function no configurada. Mostrando demo."_

---

## Variables de entorno en producción

Si despliegas en un servidor, usa un `.env`:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

---

## Configuración de Auth (opcional)

En Supabase → **Authentication → Providers**:
- Email/Password: ya habilitado por defecto
- Google/GitHub: puedes activarlos fácilmente

Para deshabilitar confirmación de email (más fácil para testing):
- **Authentication → Email → Confirm email**: desactivar

---

## Costos aproximados

| Servicio | Costo |
|----------|-------|
| Supabase (Free tier) | Gratis hasta 500MB storage, 50k usuarios |
| OpenAI Whisper API | ~$0.006 / minuto de audio |
| Hugging Face Inference | Gratis con límites |

---

## Errores comunes

**"No autorizado" al subir video**
→ Verifica que el bucket `videos` exista y las políticas RLS estén aplicadas.

**"Edge Function error 404"**
→ Verifica que deployaste la función: `supabase functions deploy process-video`

**"User already registered"**
→ El email ya tiene cuenta. Usa "Iniciar Sesión" en vez de "Registrarse".

**Video no carga en el player**
→ Verifica que el formato sea MP4, MOV, WebM o AVI.

---

## Tecnologías usadas

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Database**: PostgreSQL (Supabase) con RLS
- **Backend**: Supabase Edge Functions (Deno)
- **IA**: OpenAI Whisper API (o Hugging Face)
- **Subtítulos**: Formato SRT estándar

---

## Próximas mejoras posibles

- [ ] Traducción automática de subtítulos (otro idioma)
- [ ] Export a VTT y ASS además de SRT
- [ ] Editor de subtítulos inline
- [ ] Soporte YouTube URL
- [ ] Procesamiento de audio en tiempo real
- [ ] Webhooks para notificar cuando termine el proceso
