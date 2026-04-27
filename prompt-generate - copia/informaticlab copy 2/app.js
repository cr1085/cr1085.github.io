// ================================================
// app.js — Inicialización y renderApp reactivo
// InfoMática Platform
// =============================================

// Definir startExercise INMEDIATAMENTE (antes de todo)
window.startExercise = function(type) {
  if (typeof Exercises !== 'undefined' && Exercises.start) {
    Exercises.start(type);
  }
};

const App = (function() {
  // ---- RENDERAPP: Función central de UI reactiva ----
  function renderApp(state) {
    if (!state.isAuthenticated || !state.currentUser) {
      console.warn('renderApp: Usuario no autenticado');
      return;
    }

    const levelInfo = Progress.getLevelInfo(state.xp || 0);
    const xpProgress = Progress.getXpProgress(state.xp || 0);
    const nextXp = Progress.getNextLevelXp();
    const name = state.currentUser.full_name?.split(' ')[0] || 'Estudiante';

    // Actualizar nombre
    setEl('userName', name);
    setEl('sidebarName', state.currentUser.full_name || 'Estudiante');
    setEl('profileName', state.currentUser.full_name || '—');
    setEl('profileEmail', state.currentUser.email || '—');

    // Actualizar XP y nivel
    setEl('levelBadge', `Nv. ${levelInfo.level}`);
    setEl('levelName', levelInfo.name);
    setEl('currentXp', state.xp || 0);
    setEl('nextXp', nextXp);
    setEl('sidebarXp', `${state.xp || 0} XP`);
    setEl('mobileXp', `${state.xp || 0} XP`);

    // Actualizar estadísticas
    setEl('streakCount', state.streakDays || 0);
    setEl('totalLessons', state.totalLessons || 0);
    setEl('totalAchievements', (state.unlockedAchievements || []).length);

    // Perfil
    setEl('profileLevelTag', levelInfo.name);
    setEl('pXp', state.xp || 0);
    setEl('pLevel', levelInfo.level);
    setEl('pLessons', state.totalLessons || 0);
    setEl('pStreak', state.streakDays || 0);

    // Avatar según nivel
    const avatarEmojis = ['🧑', '😊', '🤓', '😎', '🦸', '⚡', '🌟', '🏆', '👑', '🧙'];
    const avatarEmoji = avatarEmojis[Math.min(levelInfo.level - 1, avatarEmojis.length - 1)];
    setEl('sidebarAvatar', avatarEmoji);
    setEl('profileAvatar', avatarEmoji);

    // Barras de progreso
    animateBar(document.getElementById('xpFill'), xpProgress);
    animateBar(document.getElementById('sidebarXpBar'), xpProgress);

    // Actualizar grid de módulos (bloqueo/desbloqueo)
    updateModulesGrid(state.level);
    
    // Renderizar roadmap
    renderRoadmap();
  }

  // ---- ACTUALIZAR GRID DE MÓDULOS ----
  function updateModulesGrid(level) {
    const grid = document.getElementById('modulesGrid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.mod-card');
    const allModules = Modules.getAllModules();

    cards.forEach(card => {
      const moduleId = card.dataset.module;
      
      // Buscar módulo en Modules.js
      const moduleData = allModules.find(m => {
        const idMap = {
          'pc': 'pc_basico',
          'typing': 'mecanografia',
          'mouse': 'mouse',
          'internet': 'internet',
          'google': 'herramientas',
          'ai': 'ia_basics',
          'word': 'pc_basico'
        };
        return m.id === (idMap[moduleId] || moduleId);
      });

      if (!moduleData) return;

      const requiredLevel = moduleData.levelRequired || 1;
      const isUnlocked = level >= requiredLevel;

      // Actualizar clase locked
      if (isUnlocked) {
        card.classList.remove('locked');
      } else {
        card.classList.add('locked');
      }

      // Actualizar badge
      const badge = card.querySelector('.mod-badge');
      if (badge) {
        if (isUnlocked) {
          badge.textContent = moduleData.external ? '🔗 Externo' : '✅ Disponible';
          badge.classList.remove('new');
        } else {
          badge.textContent = `🔒 Nivel ${requiredLevel}`;
        }
      }

      // Actualizar botón
      const btn = card.querySelector('.btn-mod');
      if (btn) {
        if (isUnlocked) {
          btn.disabled = false;
          btn.textContent = moduleData.external ? 'Abrir App IA' : 'Empezar';
          btn.onclick = () => openModule(moduleData.id);
        } else {
          btn.disabled = true;
          btn.textContent = `Desbloquear en Nv. ${requiredLevel}`;
        }
      }

      // Actualizar progreso del módulo
      const state = Store.getState();
      const moduleProgress = state.moduleProgress || {};
      const progress = moduleProgress[moduleData.id] || 0;
      const progressFill = card.querySelector('.mod-progress-fill');
      const progressText = card.querySelector('.mod-progress span');
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      if (progressText) {
        progressText.textContent = progress > 0 ? `${progress}% completado` : (isUnlocked ? '0% completado' : 'Bloqueado');
      }
    });
  }

  // ---- ORDEN OFICIAL DEL ROADMAP ----
  // NOTA: 'word' usa pc_basico, 'excel' y 'pc_basico' son el mismo contenido
  const ROADMAP_ORDER = [
    'pc_basico',
    'mouse',
    'mecanografia',
    'internet',
    'pc_basico', // word es lo mismo que pc_basico por ahora
    'excel',     // excel no existe aún, usar como placeholder
    'herramientas',
    'ia_basics'
  ];

  // ---- RENDERIZAR ROADMAP ----
  function renderRoadmap() {
    const container = document.getElementById('roadmapContainer');
    if (!container) return;

    const state = Store.getState();
    const moduleProgress = state.moduleProgress || {};
    const completedLessons = state.completedLessons || [];
    const allModules = Modules.getAllModules();

    // Obtener el primer módulo no completado como activo
    let currentModuleIndex = ROADMAP_ORDER.findIndex(modId => {
      const progress = moduleProgress[modId] || 0;
      return progress < 100;
    });
    if (currentModuleIndex === -1) currentModuleIndex = ROADMAP_ORDER.length - 1;

    let html = '';
    let unlockedSoFar = true;
    let completedIndex = -1;

    ROADMAP_ORDER.forEach((modId, index) => {
      const moduleData = allModules.find(m => m.id === modId);
      if (!moduleData) return;

      const progress = moduleProgress[modId] || 0;
      const isLocked = !unlockedSoFar;
      const isActive = !isLocked && progress < 100;
      const isCompleted = progress >= 100;

      if (isCompleted) {
        completedIndex = index;
      }

      // El siguiente módulo se desbloquea solo si el anterior está 100%
      if (progress >= 100 || index === 0) {
        unlockedSoFar = true;
      } else {
        unlockedSoFar = false;
      }

      let nodeClass = 'roadmap-node';
      if (isLocked) nodeClass += ' node-locked';
      else if (isCompleted) nodeClass += ' node-completed';
      else if (isActive) nodeClass += ' node-active';

      const statusIcon = isCompleted ? '✓' : (isLocked ? '🔒' : '▶');
      const clickHandler = isLocked ? '' : `onclick="openModule('${modId}')"`;
      const externalBadge = moduleData.external ? '<span class="external-badge">🔗 AI</span>' : '';

      html += `
        <div class="${nodeClass}" ${clickHandler} data-module="${modId}">
          <div class="node-icon">${moduleData.icon}</div>
          <div class="node-content">
            <div class="node-title">
              ${moduleData.name}
              ${externalBadge}
            </div>
            <div class="node-description">${moduleData.description}</div>
            <div class="node-progress">
              <div class="node-progress-bar">
                <div class="node-progress-fill" style="width: ${progress}%"></div>
              </div>
              <span class="node-progress-text">${progress}%</span>
            </div>
          </div>
          <div class="node-status">${statusIcon}</div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Animación de confetti si hay nuevo desbloqueo
    const wasLocked = container.dataset.lastCompletedIndex !== undefined;
    const lastCompleted = parseInt(container.dataset.lastCompletedIndex || '-1');
    if (completedIndex > lastCompleted && completedIndex > -1) {
      showConfetti();
    }
    container.dataset.lastCompletedIndex = completedIndex;
  }

  // ---- CONFETTI ----
  function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
  }

  // ---- SUSCRIBIR A CAMBIOS DEL STORE ----
  function initSubscriptions() {
    // Suscribir a cambios de estado relevantes
    Store.subscribe('xp', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        const state = Store.getState();
        renderApp(state);
      }
    });

    Store.subscribe('level', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        const state = Store.getState();
        renderApp(state);
      }
    });

    Store.subscribe('totalLessons', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        const state = Store.getState();
        renderApp(state);
        // Recargar camino de lecciones
        Lessons.loadLessonsPath();
      }
    });

    Store.subscribe('unlockedAchievements', (newVal, oldVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        Progress.renderAchievements();
      }
    });

    Store.subscribe('completedLessons', (newVal, oldVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        Lessons.loadLessonsPath();
      }
    });
  }

  // ---- INICIALIZAR APP ----
  async function init() {
    console.log('🚀 Inicializando InfoMática Platform...');

    // Inicializar store (carga sesión)
    Store.init();

    // Esperar a que el store tenga datos
    await waitForAuth();

    // Configurar suscripciones reactivas
    initSubscriptions();

    // Cargar datos iniciales
    const state = Store.getState();
    renderApp(state);
    Lessons.loadLessonsPath();
    Exercises.renderWelcome();
    Progress.renderAchievements();
    Progress.loadHistory();
    Simulator.init();

    console.log('✅ App inicializada correctamente');
  }

  // ---- ESPERAR AUTENTICACIÓN ----
  function waitForAuth() {
    return new Promise((resolve) => {
      const check = () => {
        const state = Store.getState();
        if (!state.isLoading) {
          if (!state.isAuthenticated) {
            window.location.href = 'index.html';
            return;
          }
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // ---- NAVEGACIÓN ----
  function openSection(name) {
    document.querySelectorAll('.app-section').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const sec = document.getElementById(`section-${name}`);
    if (sec) {
      sec.classList.remove('hidden');
      sec.classList.add('active');
    }
    
    const nav = document.querySelector(`.nav-item[data-section="${name}"]`);
    if (nav) nav.classList.add('active');

    document.getElementById('sidebar').classList.remove('open');

    // Actualizar estado de sección
    Store.setState({ currentSection: name });

    // Cargar datos según sección
    if (name === 'exercises') {
      Exercises.renderWelcome();
    }
  }

  // ---- CERRAR SESIÓN ----
  async function logout() {
    await Store.logout();
    window.location.href = 'index.html';
  }

  // ---- LEVEL UP MODAL ----
  function showLevelUp(level, levelName, unlockText = '') {
    const modal = document.getElementById('levelUpModal');
    if (!modal) return;

    const badge = document.getElementById('levelUpBadge');
    const name = document.getElementById('levelUpName');
    const unlock = document.getElementById('levelUpUnlock');

    if (badge) badge.textContent = `Nv. ${level}`;
    if (name) name.innerHTML = `¡Ahora eres <strong>${levelName}</strong>!`;
    if (unlock) unlock.textContent = unlockText;

    modal.classList.remove('hidden');

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }

  function closeLevelUp() {
    const modal = document.getElementById('levelUpModal');
    if (modal) modal.classList.add('hidden');
  }

  // ---- HELPERS ----
  function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function animateBar(element, targetPercent) {
    if (element) element.style.width = `${Math.min(100, targetPercent)}%`;
  }

//   function openAIPlatform() {
//   window.location.href = '../prompt-generate/index.html';
// }


function openModule(moduleId) {
  const module = Modules.getModule(moduleId);
  if (!module) {
    console.error('Módulo no encontrado:', moduleId);
    return;
  }

  // Si es un módulo externo (como IA), redirigir a PromptLab
  if (module.external) {
    const externalUrl = 'https://cr1085.github.io/prompt-generate/';
    window.location.href = externalUrl;
    return;
  }

  // Guardar módulo actual
  Store.setState({ currentModule: moduleId });

  // Cambiar título dinámico
  const titleEl = document.querySelector('#section-modules .section-title');
  const subEl = document.querySelector('#section-modules .section-sub');
  if (titleEl) titleEl.textContent = `${module.icon} ${module.name}`;
  if (subEl) subEl.textContent = `${module.description}`;

  // Cargar lecciones del módulo
  Lessons.loadLessonsPath(moduleId);

  // Ir a la sección de módulos
  App.openSection('modules');
}



  return {
    init,
    renderApp,
    openSection,
    logout,
    showLevelUp,
    closeLevelUp,
    openModule,
    renderRoadmap
    // openAIPlatform
  };




  
})();

// Exponer globalmente INMEDIATAMENTE
window.App = App;
window.openSection = App.openSection;
window.closeLevelUp = App.closeLevelUp;
window.openModule = App.openModule;
window.renderRoadmap = App.renderRoadmap;
window.startExercise = function(type) {
  if (typeof Exercises !== 'undefined') Exercises.start(type);
};
window.openAIPlatform = function() {
  window.location.href = '../prompt-generate/index.html';
};