// ================================================
// roadmap.js — Ruta de aprendizaje interactiva
// Plan 4 semanas dentro del dashboard
// ================================================

const ROADMAP_DATA = [
  {
    week: 1,
    color: '#06B6D4',
    icon: '🖥️',
    title: 'Fundamentos + Internet + Organización',
    meta: 'Seguridad total usando la computadora',
    totalDays: 5,
    totalHours: 10,
    moduleIds: ['pc', 'internet'],
    days: [
      { num: '1-2', topic: 'Manejo de PC', detail: 'Archivos, carpetas, atajos de teclado y organización digital', module: 'pc', xp: 40 },
      { num: '3',   topic: 'Internet productivo', detail: 'Búsquedas eficientes, descargas seguras, navegadores', module: 'internet', xp: 20 },
      { num: '4',   topic: 'Correo electrónico', detail: 'Gmail / Outlook, adjuntar archivos, redacción formal', module: 'internet', xp: 25 },
      { num: '5',   topic: 'Seguridad básica', detail: 'Contraseñas seguras, phishing y fraudes online', module: 'internet', xp: 30 }
    ],
    project: 'Crear estructura de carpetas organizada + enviar correos formales con archivos adjuntos',
    projectXp: 80,
    evaluacion: 'Prácticas diarias: 30% · Proyecto de semana: 30% · Quiz final: 40%'
  },
  {
    week: 2,
    color: '#4F8EF7',
    icon: '📄',
    title: 'Documentos Profesionales con Word',
    meta: 'Nivel laboral en Microsoft Word',
    totalDays: 5,
    totalHours: 10,
    moduleIds: ['word'],
    days: [
      { num: '6-7', topic: 'Formato profesional', detail: 'Tipografías, márgenes, estilos, negrita, cursiva, alineación', module: 'word', xp: 50 },
      { num: '8',   topic: 'Tablas e imágenes', detail: 'Insertar y formatear tablas, imágenes y objetos', module: 'word', xp: 30 },
      { num: '9',   topic: 'Diseño de documentos', detail: 'Encabezados, pie de página, numeración y secciones', module: 'word', xp: 30 },
      { num: '10',  topic: 'Documento completo', detail: 'Integración de todos los elementos: proyecto integrador', module: 'word', xp: 35 }
    ],
    project: 'Hoja de vida profesional + carta de presentación + informe formal completo',
    projectXp: 100,
    evaluacion: 'Prácticas diarias: 30% · Proyecto de semana: 30% · Quiz final: 40%'
  },
  {
    week: 3,
    color: '#22C55E',
    icon: '📊',
    title: 'Excel — De cero a intermedio',
    meta: 'Habilidad laboral real en Microsoft Excel',
    totalDays: 5,
    totalHours: 10,
    moduleIds: [],
    days: [
      { num: '11', topic: 'Interfaz y celdas', detail: 'Navegar, seleccionar, escribir y formatear celdas', module: null, xp: 20 },
      { num: '12', topic: 'Fórmulas básicas', detail: 'SUMA, PROMEDIO, MIN, MAX — las más usadas en el trabajo', module: null, xp: 30 },
      { num: '13', topic: 'Funciones útiles', detail: 'SI, CONTAR.SI, BUSCARV — nivel intermedio', module: null, xp: 35 },
      { num: '14', topic: 'Tablas y filtros', detail: 'Ordenar, filtrar y gestionar datos profesionalmente', module: null, xp: 25 },
      { num: '15', topic: 'Gráficos', detail: 'Crear gráficos de barras, líneas y sectores para reportes', module: null, xp: 30 }
    ],
    project: 'Control de gastos personal + inventario simple de negocio con gráficos incluidos',
    projectXp: 120,
    evaluacion: 'Prácticas diarias: 30% · Proyecto de semana: 30% · Quiz final: 40%'
  },
  {
    week: 4,
    color: '#F59E0B',
    icon: '🚀',
    title: 'Excel Avanzado + PowerPoint + Proyecto Final',
    meta: 'Nivel experto funcional — Certificación',
    totalDays: 5,
    totalHours: 10,
    moduleIds: [],
    days: [
      { num: '16-17', topic: 'Excel avanzado', detail: 'Funciones combinadas, formato condicional, validación de datos', module: null, xp: 50 },
      { num: '18',    topic: 'Tablas dinámicas', detail: 'Análisis profesional de datos — herramienta clave en oficina', module: null, xp: 40 },
      { num: '19',    topic: 'PowerPoint profesional', detail: 'Diseño de diapositivas, transiciones y técnicas de exposición', module: null, xp: 35 },
      { num: '20',    topic: '🏆 Proyecto Final', detail: 'Entrega completa — Word + Excel + PowerPoint integrados', module: null, xp: 150, isFinal: true }
    ],
    project: 'Sistema de control de negocio + presentación profesional + certificación 40 horas',
    projectXp: 200,
    evaluacion: 'Prácticas diarias: 30% · Proyecto de semana: 30% · Proyecto Final: 40%'
  }
];

let currentRoadmapWeek = 1;

// ---- INICIAR ROADMAP ----
function initRoadmap() {
  updateRoadmapProgress();
  showRoadmapWeek(1);
}

// ---- ACTUALIZAR PROGRESO VISUAL ----
function updateRoadmapProgress() {
  ROADMAP_DATA.forEach(week => {
    const fill = document.getElementById(`rapProg${week.week}`)?.querySelector('.rap-week-fill');
    if (!fill) return;

    // Calcular progreso de los módulos de esta semana
    let pct = 0;
    if (week.moduleIds.length > 0 && typeof MODULES !== 'undefined') {
      let totalLessons = 0;
      let doneLessons  = 0;
      week.moduleIds.forEach(mid => {
        const mod = MODULES[mid];
        if (mod) {
          totalLessons += mod.lessons.length;
          doneLessons  += mod.lessons.filter(l => completedLessons?.includes(l.id)).length;
        }
      });
      pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
    }

    fill.style.width = pct + '%';

    // Marcar semana como activa si tiene progreso
    const weekEl = document.querySelector(`.rap-week[data-week="${week.week}"]`);
    if (weekEl) {
      weekEl.classList.toggle('completed', pct === 100);
    }
  });

  // Semana actual
  const badge = document.getElementById('roadmapProgress');
  if (badge) badge.textContent = `📅 Semana ${currentRoadmapWeek} de 4`;
}

// ---- MOSTRAR DETALLE DE SEMANA ----
function showRoadmapWeek(weekNum) {
  currentRoadmapWeek = weekNum;
  const week = ROADMAP_DATA.find(w => w.week === weekNum);
  if (!week) return;

  // Activar tab
  document.querySelectorAll('.rap-week').forEach(el => el.classList.remove('active'));
  document.querySelector(`.rap-week[data-week="${weekNum}"]`)?.classList.add('active');

  const detail = document.getElementById('roadmapWeekDetail');
  if (!detail) return;

  const totalXp = week.days.reduce((s, d) => s + d.xp, 0) + week.projectXp;

  detail.innerHTML = `
    <div class="rwd-card" style="--wc:${week.color}">
      <!-- Header -->
      <div class="rwd-header">
        <div class="rwd-icon">${week.icon}</div>
        <div class="rwd-header-text">
          <div class="rwd-tag">Semana ${week.week} de 4 · ${week.totalDays} días · ${week.totalHours} horas</div>
          <h2 class="rwd-title">${week.title}</h2>
          <p class="rwd-meta">🎯 Meta: ${week.meta}</p>
        </div>
        <div class="rwd-xp-total">
          <span class="rwd-xp-num">+${totalXp}</span>
          <span class="rwd-xp-label">XP disponibles</span>
        </div>
      </div>

      <!-- Días -->
      <div class="rwd-days">
        <h3 class="rwd-section-title">📋 Contenido día a día</h3>
        <div class="rwd-days-list">
          ${week.days.map(day => `
            <div class="rwd-day ${day.isFinal ? 'rwd-day-final' : ''}" ${day.module ? `onclick="openSection('modules');loadLessonsPath('${day.module}')"` : ''} style="${day.module ? 'cursor:pointer' : ''}">
              <div class="rwd-day-num" style="background:${week.color}22;color:${week.color}">Día ${day.num}</div>
              <div class="rwd-day-body">
                <div class="rwd-day-topic" style="${day.isFinal ? `color:${week.color}` : ''}">${day.topic}</div>
                <div class="rwd-day-detail">${day.detail}</div>
              </div>
              <div class="rwd-day-right">
                <span class="rwd-day-xp" style="color:${week.color}">+${day.xp} XP</span>
                ${day.module ? `<span class="rwd-day-link">Ir a lección →</span>` : `<span class="rwd-day-soon">Próximamente</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Proyecto de semana -->
      <div class="rwd-project" style="border-color:${week.color}44;background:${week.color}0d">
        <div class="rwd-project-header">
          <span class="rwd-project-label" style="color:${week.color}">🎯 Proyecto de semana · +${week.projectXp} XP</span>
          ${week.week === 4 ? '<span class="cert-mini-badge">🏆 Certificación</span>' : ''}
        </div>
        <p class="rwd-project-text">${week.project}</p>
      </div>

      <!-- Evaluación -->
      <div class="rwd-eval">
        <span class="rwd-eval-label">📊 Evaluación:</span>
        <span class="rwd-eval-text">${week.evaluacion}</span>
      </div>

      <!-- CTA -->
      <div class="rwd-cta">
        ${week.moduleIds.length > 0
          ? `<button class="btn btn-primary" onclick="openSection('modules');loadLessonsPath('${week.moduleIds[0]}')">
               Ir a las lecciones de la Semana ${week.week} →
             </button>`
          : `<div class="rwd-coming-soon">
               <span>🔒 Las lecciones de esta semana se desbloquean con el progreso de las semanas anteriores</span>
             </div>`
        }
        ${weekNum < 4
          ? `<button class="btn btn-ghost" onclick="showRoadmapWeek(${weekNum + 1})">Ver Semana ${weekNum + 1} →</button>`
          : ''
        }
      </div>
    </div>

    <!-- Mini roadmap completo abajo -->
    ${week.week === 1 ? `
    <div class="rwd-overview">
      <h3 style="font-size:1rem;margin-bottom:16px;color:var(--text-2)">Vista general del plan</h3>
      <div class="rwd-overview-list">
        ${ROADMAP_DATA.map(w => `
          <div class="rwd-ov-item ${w.week === weekNum ? 'active' : ''}" onclick="showRoadmapWeek(${w.week})">
            <span class="rwd-ov-icon" style="background:${w.color}22">${w.icon}</span>
            <div>
              <div style="font-size:.82rem;font-weight:700">Semana ${w.week}</div>
              <div style="font-size:.72rem;color:var(--text-2)">${w.totalDays} días · ${w.totalHours}h</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
  `;
}
