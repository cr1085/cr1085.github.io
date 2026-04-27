# 🎹 TypeTrail — Guía de configuración

## ¿Qué incluye este proyecto?

```
typetrail/
├── index.html          ← App completa (HTML + CSS + JS todo en uno)
├── supabase_schema.sql ← Schema de base de datos para Supabase
└── README.md           ← Esta guía
```

---

## 🚀 Inicio rápido (sin Supabase)

Abre `index.html` directamente en tu navegador.
**Funciona sin configuración.** El progreso se guarda en `localStorage`.

---

## ☁️ Configurar Supabase (nube)

### Paso 1: Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) → "New project"
2. Elige un nombre y región (ej: South America)
3. Guarda tu contraseña de base de datos

### Paso 2: Ejecutar el schema
1. En tu proyecto Supabase → **SQL Editor**
2. Pega el contenido de `supabase_schema.sql`
3. Clic en **Run**

### Paso 3: Obtener credenciales
1. Ve a **Project Settings → API**
2. Copia:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public key**: `eyJ...`

### Paso 4: Configurar index.html
Busca estas líneas en `index.html` y reemplaza:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
```

Por tus valores reales:
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Paso 5: Habilitar autenticación
En Supabase → **Authentication → Providers**:
- Habilita **Email** ✅
- (Opcional) Deshabilita "Confirm email" para desarrollo

---

## 🌐 Deploy (publicar online)

### Opción A: Netlify Drop (más fácil)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `typetrail/`
3. ¡Listo! Obtienes una URL pública en segundos.

### Opción B: GitHub Pages
1. Sube los archivos a un repo de GitHub
2. Settings → Pages → Source: `main` branch
3. Tu app estará en `https://tuuser.github.io/typetrail`

### Opción C: Vercel
```bash
npm i -g vercel
cd typetrail
vercel
```

---

## 🎮 Funcionalidades incluidas

| Funcionalidad | Estado |
|---|---|
| Práctica libre con palabras aleatorias | ✅ |
| WPM, precisión y tiempo en tiempo real | ✅ |
| Teclado virtual con posición de dedos | ✅ |
| Sistema de niveles y XP | ✅ |
| Logros desbloqueables (14 logros) | ✅ |
| Reto diario | ✅ |
| Historial de sesiones | ✅ |
| Racha diaria (streak) | ✅ |
| Juego: Palabras cayendo | ✅ |
| Sonidos interactivos | ✅ |
| Confetti al completar | ✅ |
| Dificultad: Fácil / Medio / Difícil | ✅ |
| Lecciones progresivas | ✅ |
| Dashboard con estadísticas | ✅ |
| Autenticación con Supabase | ✅ |
| Fallback a localStorage | ✅ |
| Modo invitado (sin cuenta) | ✅ |
| Diseño responsive | ✅ |
| Animaciones y efectos | ✅ |

---

## 📈 Roadmap — Próximas mejoras sugeridas

### Corto plazo
- [ ] Modo "Contrarreloj" (60 segundos, máx palabras)
- [ ] Modo "Precisión extrema" (un error = game over)
- [ ] Gráfico de evolución de WPM en el tiempo (Chart.js)
- [ ] Sonido de tecleo personalizable
- [ ] Tema claro / oscuro (toggle)

### Mediano plazo
- [ ] Login con Google (OAuth via Supabase)
- [ ] Leaderboard global (tabla de líderes)
- [ ] Modo multijugador en tiempo real (Supabase Realtime)
- [ ] Textos temáticos (código, frases famosas, idiomas)
- [ ] App móvil con Capacitor o React Native

### Largo plazo
- [ ] IA para detectar teclas problemáticas y generar ejercicios
- [ ] Estadísticas por dedo (análisis de errores por tecla)
- [ ] Sistema de clases/grupos (para colegios)
- [ ] API pública para integración con otras apps

---

## 🛠️ Stack técnico

- **Frontend**: HTML5, CSS3 (custom design system), JavaScript vanilla
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Fuentes**: Syne (display) + DM Mono (código) + DM Sans (cuerpo)
- **Audio**: Web Audio API (nativo, sin librerías)
- **Animaciones**: CSS animations + requestAnimationFrame

---

## 💡 Mejores prácticas UX implementadas

1. **Progressive disclosure**: la app no abruma al usuario desde el inicio
2. **Feedback inmediato**: cada tecla correcta/incorrecta da respuesta visual y sonora
3. **Gamification loops**: XP → nivel → logros → desafíos → repetición
4. **Streak mechanics**: motivación para volver cada día (como Duolingo)
5. **Graceful degradation**: funciona sin cuenta, sin Supabase, incluso offline

---

## 📞 Soporte

¿Preguntas o bugs? Revisa primero la consola del navegador (F12 → Console).
Si el error es "Failed to fetch" → Supabase no está configurado (usa modo local).
