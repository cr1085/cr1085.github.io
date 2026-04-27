# 🎬 ShortScript Studio

> Generador de contenido viral para TikTok, Reels y YouTube Shorts.
> Open source · 100% frontend · Deployable en GitHub Pages

![ShortScript Studio](https://img.shields.io/badge/version-1.0.0-neon?style=flat-square&color=00FF94)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-black?style=flat-square)

---

## ✨ ¿Qué hace?

ShortScript Studio es una herramienta web que permite generar en segundos:

- 📝 **Guiones optimizados** para videos cortos (estructura Hook → Contenido → CTA)
- 💬 **Subtítulos automáticos** en formato SRT y VTT listos para editores de video
- 🔊 **Audios TTS** usando Web Speech API (gratis) o ElevenLabs (alta calidad)
- 📦 **ZIP descargable** con guiones, subtítulos, audios, títulos y hashtags
- 🤝 **Comunidad de prompts** compartidos via Supabase

Funciona completamente desde el navegador. Sin backend propio. Sin cuenta requerida.

---

## 🚀 Demo rápida

```
1. Escribe "One Piece" en el campo de tema
2. Selecciona "Hook → Dato → CTA" como estructura
3. Elige 5 guiones de 30 segundos
4. Haz clic en GENERAR GUIONES
5. Descarga el ZIP con todo listo para producir
```

---

## 🏗️ Estructura del proyecto

```
shortscript-studio/
│
├── index.html                  # App principal
├── css/
│   └── style.css               # Estilos globales
│
├── js/
│   ├── app.js                  # Bootstrap y orquestación principal
│   │
│   ├── config/
│   │   └── config.js           # Constantes globales, tonos, nichos, estructuras
│   │
│   ├── modules/
│   │   ├── script-generator.js # Generación con OpenAI o modo local
│   │   ├── subtitle-gen.js     # Conversión de texto a SRT/VTT
│   │   ├── audio-gen.js        # TTS con ElevenLabs o Web Speech API
│   │   ├── zip-exporter.js     # Empaquetado ZIP con JSZip
│   │   ├── ui-controller.js    # Render de cards, chips, estados
│   │   ├── prompt-builder.js   # Constructor dinámico de prompts LLM
│   │   ├── hook-library.js     # Biblioteca de hooks virales
│   │   ├── template-manager.js # Plantillas por nicho
│   │   ├── community-hub.js    # Prompts compartidos (Supabase)
│   │   └── supabase-client.js  # Wrapper Supabase JS
│   │
│   └── utils/
│       ├── storage.js          # localStorage wrapper para API keys
│       ├── toast.js            # Notificaciones toast
│       └── modal.js            # Gestión de modales
│
├── supabase-schema.sql         # Schema SQL para configurar Supabase
└── README.md
```

---

## ⚙️ Configuración

### Sin API Keys (modo local)

La herramienta funciona sin ninguna configuración. Los guiones se generan con plantillas locales optimizadas.

### Con OpenAI (guiones con IA real)

1. Obtén tu API key en [platform.openai.com](https://platform.openai.com)
2. Abre la herramienta → haz clic en **API Keys** (esquina superior derecha)
3. Pega tu `sk-...` key en el campo OpenAI
4. Guarda → el modo cambiará a **🤖 GPT-4o-mini**

Modelo usado: `gpt-4o-mini` (económico y rápido para este caso de uso).

### Con ElevenLabs (voces de alta calidad)

1. Obtén tu API key en [elevenlabs.io](https://elevenlabs.io)
2. Pégala en el campo ElevenLabs en el modal de API Keys
3. Los audios generados usarán voces multilingual de alta calidad

Sin ElevenLabs, se usa Web Speech API (incorporada en el navegador, gratis).

---

## 🗄️ Configuración de Supabase (opcional)

Supabase habilita la funcionalidad de **comunidad de prompts compartidos**.

### Pasos

1. Crea un proyecto gratis en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Copia tu **Project URL** y **anon public key** desde Settings → API
4. Pégalos en el modal de API Keys de la herramienta

### Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `community_prompts` | Prompts públicos compartidos por usuarios |
| `shared_scripts` | Guiones opcionales compartidos |

Las políticas RLS permiten lectura e inserción públicas (sin autenticación).

---

## 🌐 Deploy en GitHub Pages

### Opción A — GitHub Pages automático

```bash
# 1. Fork o clona este repositorio
git clone https://github.com/tu-usuario/shortscript-studio.git
cd shortscript-studio

# 2. Push a tu repositorio
git remote set-url origin https://github.com/TU_USUARIO/shortscript-studio.git
git push -u origin main

# 3. Activa GitHub Pages
# GitHub repo → Settings → Pages → Source: main branch / root
# Tu URL será: https://TU_USUARIO.github.io/shortscript-studio/
```

### Opción B — Deploy manual

Sube los archivos directamente a cualquier hosting estático:
- [Netlify Drop](https://app.netlify.com/drop) — arrastra la carpeta
- [Vercel](https://vercel.com) — import desde GitHub
- [Cloudflare Pages](https://pages.cloudflare.com)

### ⚠️ Nota sobre módulos ES6

La app usa `type="module"` en los scripts. GitHub Pages sirve correctamente módulos ES6. Si usas otro hosting, asegúrate de que el servidor sirva `.js` con `Content-Type: application/javascript`.

Para desarrollo local recomendamos:
```bash
# Opción 1: Live Server en VS Code
# Opción 2: Python
python3 -m http.server 8080

# Opción 3: Node.js
npx serve .
```

**No abras `index.html` directamente** (protocolo `file://`) ya que los módulos ES6 requieren HTTP.

---

## 🔧 Personalización

### Agregar nuevos nichos rápidos

En `js/config/config.js`:
```js
static QUICK_NICHES = [
  'Anime', 'Finanzas', 'Fitness', 'TuNicho', // ← agrega aquí
];
```

### Agregar nuevas estructuras de guion

```js
static STRUCTURES = {
  'mi-estructura': {
    label: 'Mi Estructura Custom',
    parts: ['INTRO', 'DESARROLLO', 'TWIST', 'CTA'],
  },
  // ...
};
```

Y agrega la opción en el `<select id="input-structure">` del HTML.

### Cambiar el modelo de OpenAI

En `js/modules/script-generator.js`, línea:
```js
model: 'gpt-4o-mini',  // Cambia a 'gpt-4o' para mayor calidad
```

### Cambiar la voz de ElevenLabs

En `js/modules/audio-gen.js`:
```js
const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Rachel (EN)
// Otras voces populares:
// 'pNInz6obpgDQGcFmaJgB' → Adam (EN)
// 'VR6AewLTigWG4xSOukaG' → Arnold (EN)
// Busca más en: https://elevenlabs.io/voice-library
```

---

## 📈 Roadmap y escalabilidad

### Funcionalidades planeadas

- [ ] **Biblioteca de hooks virales avanzada** — búsqueda por nicho y engagement histórico
- [ ] **Editor de guiones inline** — editar texto directamente en la card generada
- [ ] **Preview de subtítulos** — visualización estilo TikTok con karaoke
- [ ] **Sistema de calificación de prompts** — votar prompts de la comunidad
- [ ] **Exportar a CapCut / DaVinci** — formatos nativos de editores populares
- [ ] **Modo batch** — generar 50+ guiones con un solo clic
- [ ] **Multiidioma en la UI** — internacionalización completa
- [ ] **Analytics de hooks** — qué hooks generan más engagement
- [ ] **Plantillas de video** — guiones adaptados para trends específicos
- [ ] **Integración con Pexels/Unsplash** — sugerir imágenes/videos para cada guion
- [ ] **Modo offline** — PWA con Service Workers

### Cómo escalar con comunidad

1. **Supabase** ya está integrado para prompts compartidos
2. Agrega autenticación con `supabase.auth` para perfiles de creadores
3. Sistema de likes/favoritos en `community_prompts`
4. Añade campo `author` para dar crédito a los creadores
5. Crea una tabla `viral_hooks` con hooks curados por la comunidad

### Para nichos específicos

Crea archivos en `js/prompts/` con prompts especializados:
```
js/prompts/
  anime.js
  finance.js
  fitness.js
  cooking.js
```

Cada archivo exporta arrays de hooks, facts y CTAs específicos para ese nicho.

---

## 🛡️ Privacidad y seguridad

- Las API keys se guardan **únicamente en tu navegador** (`localStorage`)
- Nunca se envían a servidores de ShortScript Studio
- El código es completamente auditable (open source)
- No hay tracking, cookies ni analytics por defecto

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: agrega nueva funcionalidad'`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

### Ideas para contribuir

- 🌍 Traducir la UI a más idiomas
- 🎯 Agregar plantillas para nuevos nichos
- 🔥 Curar biblioteca de hooks virales
- 🐛 Reportar bugs en Issues
- 📖 Mejorar documentación

---

## 📄 Licencia

MIT — úsalo, modifícalo, distribúyelo libremente.

---

Hecho con ☕ para creadores de contenido que quieren producir más en menos tiempo.
