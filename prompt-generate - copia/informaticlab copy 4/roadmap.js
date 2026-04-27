/* ================================================
   roadmap.js — Roadmap de Aprendizaje Interactivo
   InfoMática Platform
   ================================================ */

const Roadmap = {
  currentWeek: 0,
  progress: {},

  data: [
    {
      week: 0,
      title: "Fundamentos",
      subtitle: "Introducción a la computación",
      icon: "💻",
      color: "#06B6D4",
      xp: 100,
      duration: "1 semana",
      description: "Aprende los conceptos básicos de las computadoras",
      items: [
        { title: "¿Qué es una computadora?", desc: "Historia y evolución", module: "intro_pc" },
        { title: "Partes del computador", desc: "Hardware y periféricos", module: "parts_pc" },
        { title: "Encendido y apagado", desc: "Procedimientos seguros", module: "boot_pc" }
      ]
    },
    {
      week: 1,
      title: "Windows Esencial",
      subtitle: "Domina el sistema operativo",
      icon: "🪟",
      color: "#4F8EF7",
      xp: 150,
      duration: "2 semanas",
      description: "Navega y administra archivos en Windows",
      items: [
        { title: "El escritorio", desc: "Elementos y personalización", module: "desktop" },
        { title: "Ventanas y menús", desc: "Navegación básica", module: "windows" },
        { title: "Explorador de archivos", desc: "Gestionar archivos y carpetas", module: "files" },
        { title: "Configuración básica", desc: "Ajustes del sistema", module: "settings" }
      ]
    },
    {
      week: 2,
      title: "Microsoft Word",
      subtitle: "Procesamiento de texto",
      icon: "📄",
      color: "#22C55E",
      xp: 200,
      duration: "2 semanas",
      description: "Crea documentos profesionales",
      items: [
        { title: "Interfaz de Word", desc: "Conociendo el programa", module: "word_interface" },
        { title: "Formato de texto", desc: "Fuentes, colores y estilos", module: "word_format" },
        { title: "Párrafos y espaciado", desc: "Alineación y saltos", module: "word_paragraph" },
        { title: "Imágenes y tablas", desc: "Insertar elementos", module: "word_media" },
        { title: "Impresión", desc: "Vista e impresión", module: "word_print" }
      ]
    },
    {
      week: 3,
      title: "Microsoft Excel",
      subtitle: "Hojas de cálculo",
      icon: "📊",
      color: "#F59E0B",
      xp: 250,
      duration: "2 semanas",
      description: "Análisis de datos y fórmulas",
      items: [
        { title: "Interfaz de Excel", desc: "Celdas y hojas", module: "excel_interface" },
        { title: "Datos y formatos", desc: "Números y texto", module: "excel_data" },
        { title: "Fórmulas básicas", desc: "Operaciones matemáticas", module: "excel_formulas" },
        { title: "Gráficos", desc: "Visualización de datos", module: "excel_charts" }
      ]
    },
    {
      week: 4,
      title: "Internet y Correo",
      subtitle: "Comunicación digital",
      icon: "🌐",
      color: "#EC4899",
      xp: 200,
      duration: "1 semana",
      description: "Navegación y correo electrónico",
      items: [
        { title: "Navegadores web", desc: "Chrome, Edge y más", module: "browsers" },
        { title: "Búsqueda efectiva", desc: "Encontrar información", module: "search" },
        { title: "Correo electrónico", desc: "Enviar y recibir", module: "email" },
        { title: "Seguridad online", desc: "Protege tus datos", module: "security" }
      ]
    },
    {
      week: 5,
      title: "Proyecto Final",
      subtitle: "¡Certifícate!",
      icon: "🏆",
      color: "#8B5CF6",
      xp: 500,
      duration: "1 semana",
      description: "Aplica todo lo aprendido",
      items: [
        { title: "Documento Word", desc: "Carta o informe", module: "project_word" },
        { title: "Hoja de cálculo Excel", desc: "Presupuesto o datos", module: "project_excel" },
        { title: "Presentación", desc: "PowerPoint o similar", module: "project_final" }
      ]
    }
  ],

  init() {
    this.loadProgress();
    this.renderWeekSelector();
    this.renderTimeline();
    this.updateProgress();
  },

  loadProgress() {
    const saved = localStorage.getItem('roadmap_progress');
    if (saved) {
      this.progress = JSON.parse(saved);
    }
  },

  saveProgress() {
    localStorage.setItem('roadmap_progress', JSON.stringify(this.progress));
  },

  getWeekStatus(weekIndex) {
    if (this.progress[weekIndex]?.completed) return 'completed';
    if (weekIndex === this.currentWeek) return 'current';
    if (weekIndex < this.currentWeek) return 'completed';
    return 'locked';
  },

  renderWeekSelector() {
    const container = document.getElementById('weekSelector');
    if (!container) return;

    container.innerHTML = this.data.map((week, idx) => `
      <button class="week-btn ${idx === this.currentWeek ? 'active' : ''}" 
              onclick="Roadmap.selectWeek(${idx})">
        ${week.icon} ${week.title}
      </button>
    `).join('');
  },

  selectWeek(index) {
    this.currentWeek = index;
    this.renderWeekSelector();
    this.renderTimeline();
  },

  renderTimeline() {
    const container = document.getElementById('roadmapContainer');
    if (!container) return;

    const weeks = [this.data[this.currentWeek]];
    
    container.innerHTML = weeks.map((week, idx) => {
      const status = this.getWeekStatus(this.currentWeek);
      const isCompleted = status === 'completed';
      const isCurrent = status === 'current';
      
      return `
        <div class="roadmap-item ${status}">
          <div class="roadmap-item-icon">${week.icon}</div>
          <div class="roadmap-item-content">
            <div class="roadmap-item-header">
              <span class="roadmap-item-title">
                ${week.title}
                ${isCompleted ? '✅' : ''}
              </span>
              <span class="roadmap-item-badge ${status}">
                ${isCompleted ? 'Completado' : isCurrent ? 'En Progreso' : 'Bloqueado'}
              </span>
            </div>
            <p class="roadmap-item-desc">${week.description}</p>
            <div class="roadmap-item-meta">
              <span>⏱️ ${week.duration}</span>
              <span class="roadmap-item-xp">⭐ +${week.xp} XP</span>
              <span>📚 ${week.items.length} lecciones</span>
            </div>
            ${week.items.map((item, i) => `
              <button class="roadmap-item-btn ${isCompleted ? 'completed-btn' : 'primary'}" 
                      onclick="Roadmap.startModule('${item.module}')"
                      ${isCompleted ? '' : ''}>
                ${isCompleted ? 'Repasar' : 'Comenzar'} → ${item.title}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  updateProgress() {
    const totalWeeks = this.data.length;
    let completed = 0;
    
    this.data.forEach((week, idx) => {
      if (this.progress[idx]?.completed) completed++;
    });

    const percent = Math.round((completed / totalWeeks) * 100);
    
    const ring = document.getElementById('roadmapProgressRing');
    const text = document.getElementById('roadmapProgressText');
    
    if (ring) {
      const circumference = 2 * Math.PI * 26;
      const offset = circumference - (percent / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }
    
    if (text) {
      text.textContent = `${percent}%`;
    }
  },

  startModule(moduleId) {
    if (window.App) {
      App.openSection('modules');
      if (window.Modules) {
        Modules.loadModule(moduleId);
      }
    }
  },

  completeWeek(weekIndex) {
    if (!this.progress[weekIndex]) {
      this.progress[weekIndex] = {};
    }
    this.progress[weekIndex].completed = true;
    this.progress[weekIndex].completedAt = new Date().toISOString();
    this.saveProgress();
    
    if (weekIndex < this.data.length - 1) {
      this.currentWeek = weekIndex + 1;
    }
    
    this.updateProgress();
    this.renderTimeline();
    this.renderWeekSelector();
  }
};

window.Roadmap = Roadmap;
