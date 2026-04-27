# ⚡ InfoMática — Plataforma Educativa

Plataforma gamificada para aprender informática y ofimática.
Tipo Duolingo, con XP, niveles, logros y simulaciones.

---

## 🗂️ Estructura de archivos

```
infomatica-app/
├── index.html              ← Login / Landing page
├── app.html                ← Dashboard principal
├── supabase-setup.sql      ← Script SQL para Supabase
│
├── css/
│   ├── main.css            ← Variables y reset
│   ├── components.css      ← Botones, cards, modales
│   └── layout.css          ← Sidebar, grid, secciones
│
└── js/
    ├── supabase-client.js  ← Inicialización Supabase
    ├── auth.js             ← Login / Register / Logout
    ├── user.js             ← XP, niveles, logros
    ├── lessons.js          ← Lecciones y progreso
    ├── exercises.js        ← Ejercicios interactivos
    └── ui.js               ← Toasts, animaciones
```

---

## 🚀 Configuración paso a paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Clic en **"New Project"**
3. Elige un nombre (ej: `infomatica`)
4. Elige una contraseña segura para la base de datos
5. Selecciona la región más cercana
6. Espera ~2 minutos mientras se crea el proyecto

### 2. Obtener las credenciales

1. En el panel de Supabase, ve a **Settings → API**
2. Copia:
   - **Project URL** (ej: `https://abcdef.supabase.co`)
   - **anon public key** (la llave larga)

### 3. Configurar el proyecto

Abre `js/supabase-client.js` y reemplaza:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';  // ← Tu URL
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';            // ← Tu llave
```

### 4. Crear las tablas en Supabase

1. En Supabase, ve a **SQL Editor**
2. Copia todo el contenido de `supabase-setup.sql`
3. Pégalo en el editor
4. Clic en **"Run"**

### 5. Activar Email Auth

1. En Supabase, ve a **Authentication → Providers**
2. Asegúrate que **Email** está habilitado
3. En **Authentication → Email Templates** puedes personalizar los correos

### 6. Abrir el proyecto

Simplemente abre `index.html` en tu navegador.
Para producción, sube los archivos a cualquier hosting estático:
- [Netlify](https://netlify.com) (drag & drop, gratis)
- [Vercel](https://vercel.com) (gratis)
- [GitHub Pages](https://pages.github.com) (gratis)

---

## ✨ Funcionalidades incluidas (FASE 1-6)

### ✅ Autenticación
- Registro con nombre, email, contraseña y grupo de edad
- Login con email/contraseña
- Logout
- Redirección automática según sesión

### ✅ Sistema de XP y Niveles
- 10 niveles (Principiante → Leyenda)
- Barra de progreso animada
- Modal de "¡Subiste de nivel!" con confetti
- Desbloqueo de módulos por nivel

### ✅ Lecciones (Word Básico)
- 5 lecciones con contenido rich HTML
- Camino visual de lecciones
- Bloqueo progresivo (necesitas completar la anterior)
- Quiz al finalizar cada lección
- Guardado de progreso en Supabase

### ✅ Ejercicios Interactivos
- **Quiz múltiple opción** (8 preguntas sobre Word)
- **Fill in the blank** (completar texto)
- **Matching** (unir atajos con funciones)
- Sistema de puntuación y resultados

### ✅ Simulador Word
- Editor de texto con contentEditable
- Negrita, cursiva, subrayado
- Tamaño de fuente
- Alineación de texto
- Color de texto
- Verificación de tarea con premio XP

### ✅ Sistema de Logros
- 12 logros desbloqueables
- Notificación al conseguir logro
- XP adicional por logros
- Vista de galería de logros

### ✅ Dashboard y Perfil
- XP total y nivel actual
- Racha de días consecutivos
- Historial de actividad (XP history)
- Stats del usuario

---

## 🔜 Próximas fases

- **Módulo Excel**: Lecciones y simulador de hojas de cálculo
- **Módulo Internet**: Seguridad, búsquedas, contraseñas
- **Sistema de rachas**: Notificaciones diarias
- **Ranking / Leaderboard**: Competencia entre usuarios
- **Admin panel**: Gestión de lecciones desde CMS

---

## 🛠️ Stack técnico

| Tecnología | Uso |
|-----------|-----|
| HTML5 | Estructura |
| CSS3 | Estilos (variables, grid, animaciones) |
| JavaScript Vanilla | Lógica |
| Supabase Auth | Autenticación |
| Supabase Database | PostgreSQL como servicio |
| Google Fonts | Tipografías (Syne + DM Sans) |

---

## 📝 Notas importantes

- **Sin frameworks**: Todo con JS vanilla, sin React/Vue/Angular
- **Sin build tools**: Abre directamente en el navegador
- **Responsive**: Funciona en móvil, tablet y escritorio
- **Dark theme**: Diseño oscuro gamificado
