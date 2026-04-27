// ================================================
// app.js — Inicialización y renderApp reactivo
// InfoMática Platform
// =============================================

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

  // Si es un módulo externo (como IA), redirigir
  if (module.external && module.url) {
    window.location.href = module.url;
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
    openModule
    // openAIPlatform
  };




  
})();

// Exponer globalmente
window.App = App;
window.openSection = App.openSection;
window.closeLevelUp = App.closeLevelUp;
window.loadLessonsPath = Lessons.loadLessonsPath;
window.openModule = App.openModule;
// window.openAIPlatform = openAIPlatform;

window.openAIPlatform = function() {
  window.location.href = '../prompt-generate/index.html';
};