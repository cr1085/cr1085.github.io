# LogiTrack — MVP Logístico
> Demo comercial listo para vender. Cubicaje · Enturnamiento · Enrutamiento

## 🚀 Despliegue en 5 minutos (Netlify — GRATIS)

### Opción A: Netlify Drop (más rápido)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `/logitrack`
3. ¡Listo! URL pública en segundos

### Opción B: Vercel CLI
```bash
npm i -g vercel
cd logitrack
vercel --prod
```

### Opción C: GitHub Pages
```bash
git init && git add . && git commit -m "LogiTrack MVP"
gh repo create logitrack --public --push
# Activar Pages en Settings > Pages > branch: main
```

---

## 🗄️ Configurar Supabase (opcional — demo funciona sin esto)

### 1. Crear proyecto
1. [supabase.com](https://supabase.com) → New Project → gratis
2. Copia la **Project URL** y **anon public key** (Settings > API)

### 2. Crear tablas
Abre el **SQL Editor** en Supabase y ejecuta `supabase-schema.sql`

### 3. Conectar
Al abrir LogiTrack, aparece el modal de configuración.
Pega la URL y la key → "Conectar Supabase"

---

## 📁 Estructura del Proyecto

```
logitrack/
├── index.html          # App completa (single page)
├── css/
│   └── style.css       # Design system
├── js/
│   └── app.js          # Lógica de los 3 módulos
├── supabase-schema.sql # SQL para crear tablas
└── README.md
```

---

## 🔑 Configurar Mapbox (opcional — hay fallback SVG)

1. Crea cuenta gratis en [mapbox.com](https://mapbox.com)
2. Copia tu **Public Access Token**
3. En `js/app.js`, línea ~140, reemplaza:
   ```js
   mapboxgl.accessToken = 'TU_TOKEN_AQUÍ';
   ```

**Tier gratuito:** 50,000 cargas de mapa/mes — más que suficiente para demo.

---

## 💡 Flujo de Demo para Cliente

### Paso 1 — Dashboard (30 seg)
"Aquí ven el resumen operativo en tiempo real: citas del día, capacidad usada por contenedor, actividad semanal."

### Paso 2 — Cubicaje (2 min)
1. Click en **Cubicaje** en sidebar
2. Cargar ejemplo: **"Cajas mixtas"**
3. Cambiar contenedor a **"Camión / Mula"**
4. Mostrar la barra de llenado animada
5. "El sistema calcula automáticamente cuánto espacio usan sus productos y cuánto queda disponible."

### Paso 3 — Enturnamiento (2 min)
1. Click en **Enturnamiento**
2. Mostrar la agenda con citas del día
3. Crear una cita nueva en vivo (30 segundos)
4. Cambiar estado de pendiente → confirmado
5. "Cada muelle tiene su agenda. Los conductores reciben confirmación instantánea."

### Paso 4 — Rutas (1 min)
1. Click en **Enrutamiento**
2. Las paradas de ejemplo ya están cargadas
3. Click **"Calcular Ruta Óptima"**
4. Mostrar el resumen: km, tiempo, combustible
5. "En producción esto se conecta con Google Maps o HERE para rutas en tiempo real con tráfico."

---

## 🔮 Mejoras Futuras (para vender el roadmap)

### Fase 2 — Inteligencia (2-3 meses)
- [ ] IA para sugerir orden óptimo de empaque (bin packing 3D)
- [ ] Predicción de demanda de muelles con ML
- [ ] Optimización VRP (Vehicle Routing Problem) real con OR-Tools

### Fase 3 — Integración (3-6 meses)
- [ ] API REST pública para conectar ERP/WMS del cliente
- [ ] App móvil para conductores (React Native / Expo)
- [ ] Notificaciones push / WhatsApp Business API
- [ ] Firma digital de actas de entrega
- [ ] Tracking GPS en tiempo real

### Fase 4 — Analítica (6+ meses)
- [ ] Dashboard analítico con KPIs avanzados
- [ ] Reportes automáticos PDF
- [ ] Comparativa de rendimiento entre conductores/rutas
- [ ] Módulo de facturación logística

---

## 💰 Modelo de Precios Sugerido (SaaS)

| Plan      | Precio/mes | Usuarios | Citas/mes | Rutas/mes |
|-----------|-----------|----------|-----------|-----------|
| Starter   | $150 USD  | 3        | 200       | 50        |
| Business  | $350 USD  | 10       | 1,000     | 200       |
| Enterprise| $900 USD  | ilimitado| ilimitado | ilimitado |

---

## 🛠️ Stack Técnico

| Componente   | Tecnología         | Costo     |
|--------------|--------------------|-----------|
| Frontend     | HTML + JS vanilla  | $0        |
| Base de datos| Supabase           | $0 → $25/mes |
| Mapas        | Mapbox             | $0 (50k req) |
| Hosting      | Netlify/Vercel     | $0        |
| Dominio      | Namecheap/Porkbun  | ~$10/año  |

**Costo total para MVP: $0 — $10/año**
