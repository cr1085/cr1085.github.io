// ================================================
// achievements.js — Sistema de Logros Expandido
// InfoMática Platform
// ================================================

const Achievements = (function() {
  // ---- DEFINICIÓN COMPLETA DE LOGROS ----
  const ACHIEVEMENTS_DB = {
    // Lecciones
    first_lesson: {
      id: 'first_lesson',
      icon: '🎯',
      name: 'Primer paso',
      desc: 'Completa tu primera lección',
      xp: 20,
      category: 'lessons',
      condition: (state) => state.totalLessons >= 1
    },
    five_lessons: {
      id: 'five_lessons',
      icon: '📚',
      name: 'Estudioso',
      desc: 'Completa 5 lecciones',
      xp: 50,
      category: 'lessons',
      condition: (state) => state.totalLessons >= 5
    },
    ten_lessons: {
      id: 'ten_lessons',
      icon: '🎓',
      name: 'Dedicado',
      desc: 'Completa 10 lecciones',
      xp: 100,
      category: 'lessons',
      condition: (state) => state.totalLessons >= 10
    },
    all_pc_basico: {
      id: 'all_pc_basico',
      icon: '💻',
      name: 'Técnico PC',
      desc: 'Completa todo el módulo de PC Básico',
      xp: 150,
      category: 'modules',
      condition: (state) => (state.moduleProgress?.pc_basico || 0) >= 4
    },

    // Mecanografía
    typing_first: {
      id: 'typing_first',
      icon: '⌨️',
      name: 'Mecanógrafo Novato',
      desc: 'Completa tu primer ejercicio de mecanografía',
      xp: 25,
      category: 'typing',
      condition: (state) => state.typingSessions >= 1
    },
    typing_wpm_30: {
      id: 'typing_wpm_30',
      icon: '⚡',
      name: 'Velocista',
      desc: 'Alcanza 30 PPM en mecanografía',
      xp: 75,
      category: 'typing',
      condition: (state) => state.typingWpm >= 30
    },
    typing_wpm_50: {
      id: 'typing_wpm_50',
      icon: '🏎️',
      name: 'Piloto del Teclado',
      desc: 'Alcanza 50 PPM en mecanografía',
      xp: 150,
      category: 'typing',
      condition: (state) => state.typingWpm >= 50
    },
    typing_perfect: {
      id: 'typing_perfect',
      icon: '💯',
      name: 'Perfección',
      desc: '100% de precisión en un ejercicio',
      xp: 50,
      category: 'typing',
      condition: (state) => state.typingPerfectAccuracy >= 1
    },

    // Mouse
    mouse_hunter: {
      id: 'mouse_hunter',
      icon: '🎯',
      name: 'Cazador',
      desc: 'Completa el juego Hunter con puntuación perfecta',
      xp: 40,
      category: 'mouse',
      condition: (state) => state.hunterScore >= 100
    },
    mouse_drag_drop: {
      id: 'mouse_drag_drop',
      icon: '✋',
      name: 'Manos Firmes',
      desc: 'Completa el juego de Drag & Drop',
      xp: 35,
      category: 'mouse',
      condition: (state) => state.dragDropCompleted >= 1
    },
    mouse_double: {
      id: 'mouse_double',
      icon: '👆',
      name: 'Doble Click',
      desc: 'Completa el juego de doble clic',
      xp: 30,
      category: 'mouse',
      condition: (state) => state.doubleClickCompleted >= 1
    },

    // Simulador escritorio
    desktop_create: {
      id: 'desktop_create',
      icon: '📁',
      name: 'Creador',
      desc: 'Crea tu primera carpeta en el simulador',
      xp: 25,
      category: 'simulator',
      condition: (state) => state.desktopActions?.createFolder >= 1
    },
    desktop_rename: {
      id: 'desktop_rename',
      icon: '✏️',
      name: 'Organizador',
      desc: 'Renombra un archivo o carpeta',
      xp: 20,
      category: 'simulator',
      condition: (state) => state.desktopActions?.rename >= 1
    },
    desktop_delete: {
      id: 'desktop_delete',
      icon: '🗑️',
      name: 'Limpiador',
      desc: 'Envía un archivo a la papelera',
      xp: 20,
      category: 'simulator',
      condition: (state) => state.desktopActions?.delete >= 1
    },

    // Rachas
    streak_3: {
      id: 'streak_3',
      icon: '🔥',
      name: 'En racha',
      desc: 'Estudia 3 días seguidos',
      xp: 40,
      category: 'streak',
      condition: (state) => state.streakDays >= 3
    },
    streak_7: {
      id: 'streak_7',
      icon: '⚡',
      name: 'Imparable',
      desc: 'Estudia 7 días seguidos',
      xp: 100,
      category: 'streak',
      condition: (state) => state.streakDays >= 7
    },
    streak_30: {
      id: 'streak_30',
      icon: '💎',
      name: 'Compromiso',
      desc: 'Estudia 30 días seguidos',
      xp: 500,
      category: 'streak',
      condition: (state) => state.streakDays >= 30
    },

    // Niveles
    level_3: {
      id: 'level_3',
      icon: '🥉',
      name: 'Aprendiz oficial',
      desc: 'Alcanza el nivel 3',
      xp: 75,
      category: 'level',
      condition: (state) => state.level >= 3
    },
    level_5: {
      id: 'level_5',
      icon: '🥈',
      name: 'Hábil',
      desc: 'Alcanza el nivel 5',
      xp: 150,
      category: 'level',
      condition: (state) => state.level >= 5
    },
    level_10: {
      id: 'level_10',
      icon: '🏆',
      name: 'Leyenda',
      desc: 'Alcanza el nivel máximo',
      xp: 500,
      category: 'level',
      condition: (state) => state.level >= 10
    },

    // XP
    xp_100: {
      id: 'xp_100',
      icon: '⭐',
      name: 'Estrella emergente',
      desc: 'Acumula 100 XP',
      xp: 0,
      category: 'xp',
      condition: (state) => state.xp >= 100
    },
    xp_500: {
      id: 'xp_500',
      icon: '💎',
      name: 'Coleccionista',
      desc: 'Acumula 500 XP',
      xp: 0,
      category: 'xp',
      condition: (state) => state.xp >= 500
    },
    xp_1000: {
      id: 'xp_1000',
      icon: '👑',
      name: 'Maestro',
      desc: 'Acumula 1000 XP',
      xp: 0,
      category: 'xp',
      condition: (state) => state.xp >= 1000
    },
    xp_2500: {
      id: 'xp_2500',
      icon: '🌟',
      name: 'Leyenda viva',
      desc: 'Acumula 2500 XP',
      xp: 0,
      category: 'xp',
      condition: (state) => state.xp >= 2500
    },

    // Quizzes
    first_quiz: {
      id: 'first_quiz',
      icon: '❓',
      name: 'Quiz master',
      desc: 'Completa tu primer quiz',
      xp: 25,
      category: 'quiz',
      condition: (state) => state.quizzesDone >= 1
    },
    perfect_quiz: {
      id: 'perfect_quiz',
      icon: '💯',
      name: 'Perfecto',
      desc: 'Obtén 100% en un quiz',
      xp: 60,
      category: 'quiz',
      condition: (state) => state.perfectQuizzes >= 1
    },
    quiz_streak_5: {
      id: 'quiz_streak_5',
      icon: '🎯',
      name: 'Racha de precisión',
      desc: '5 quizzes consecutivos con 80%+',
      xp: 100,
      category: 'quiz',
      condition: (state) => state.quizStreak >= 5
    },

    // Módulos
    all_word: {
      id: 'all_word',
      icon: '📄',
      name: 'Word Master',
      desc: 'Completa todo el módulo de Word',
      xp: 200,
      category: 'modules',
      condition: (state) => (state.moduleProgress?.word || 0) >= 5
    },
    all_internet: {
      id: 'all_internet',
      icon: '🌐',
      name: 'Navegante seguro',
      desc: 'Completa todo el módulo de Internet',
      xp: 150,
      category: 'modules',
      condition: (state) => (state.moduleProgress?.internet || 0) >= 3
    },
    all_ia: {
      id: 'all_ia',
      icon: '🤖',
      name: 'Ciudadano IA',
      desc: 'Completa el módulo de Introducción a IA',
      xp: 100,
      category: 'modules',
      condition: (state) => (state.moduleProgress?.ia_basics || 0) >= 3
    }
  };

  // ---- RENDERIZAR GRILLA DE LOGROS ----
  function renderAchievements(containerId, unlockedIds = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Agrupar por categoría
    const categories = {
      lessons: { label: 'Lecciones', icon: '📚' },
      typing: { label: 'Mecanografía', icon: '⌨️' },
      mouse: { label: 'Mouse', icon: '🖱️' },
      simulator: { label: 'Simuladores', icon: '🖥️' },
      streak: { label: 'Rachas', icon: '🔥' },
      level: { label: 'Niveles', icon: '⬆️' },
      xp: { label: 'XP', icon: '⭐' },
      quiz: { label: 'Quizzes', icon: '❓' },
      modules: { label: 'Módulos', icon: '📋' }
    };

    let html = '<div class="achievements-categories">';
    
    Object.entries(categories).forEach(([cat, info]) => {
      const catAchievements = Object.values(ACHIEVEMENTS_DB).filter(a => a.category === cat);
      if (catAchievements.length === 0) return;

      const unlocked = catAchievements.filter(a => unlockedIds.includes(a.id)).length;
      
      html += `
        <div class="achievement-category">
          <div class="category-header">
            <span class="category-icon">${info.icon}</span>
            <span class="category-name">${info.label}</span>
            <span class="category-progress">${unlocked}/${catAchievements.length}</span>
          </div>
          <div class="category-items">
            ${catAchievements.map(ach => {
              const isUnlocked = unlockedIds.includes(ach.id);
              return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" 
                     data-id="${ach.id}"
                     title="${ach.desc}">
                  <div class="ach-icon">${ach.icon}</div>
                  <div class="ach-info">
                    <div class="ach-name">${ach.name}</div>
                    ${ach.xp > 0 ? `<div class="ach-xp">+${ach.xp} XP</div>` : ''}
                  </div>
                  ${isUnlocked ? '<div class="ach-check">✓</div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  // ---- VERIFICAR LOGROS ----
  function check(state) {
    const newlyUnlocked = [];
    const unlocked = state.unlockedAchievements || [];

    Object.values(ACHIEVEMENTS_DB).forEach(ach => {
      if (!unlocked.includes(ach.id) && ach.condition(state)) {
        newlyUnlocked.push(ach);
        unlocked.push(ach.id);
      }
    });

    return { newlyUnlocked, allUnlocked: unlocked };
  }

  // ---- OBTENER TODOS ----
  function getAll() {
    return Object.values(ACHIEVEMENTS_DB);
  }

  function getByCategory(category) {
    return Object.values(ACHIEVEMENTS_DB).filter(a => a.category === category);
  }

  // ---- EXPORTS ----
  return {
    ACHIEVEMENTS_DB,
    renderAchievements,
    check,
    getAll,
    getByCategory
  };
})();

window.Achievements = Achievements;