// ================================================
// progress.js — Motor de progreso, niveles y logros
// InfoMática Platform
// ================================================

const Progress = (function() {
  // ---- CONFIGURACIÓN ----
  const LEVELS = [
    { level: 1, name: 'Principiante',  xpRequired: 0,    unlock: null, module: null },
    { level: 2, name: 'Explorador',    xpRequired: 100,  unlock: 'Internet Seguro', module: 'internet' },
    { level: 3, name: 'Aprendiz',       xpRequired: 250,  unlock: 'Microsoft Excel', module: 'excel' },
    { level: 4, name: 'Competente',    xpRequired: 500,  unlock: 'Correo Electrónico', module: 'email' },
    { level: 5, name: 'Hábil',          xpRequired: 800,  unlock: 'PowerPoint', module: 'powerpoint' },
    { level: 6, name: 'Avanzado',       xpRequired: 1200, unlock: 'Programación básica', module: 'programming' },
    { level: 7, name: 'Experto',        xpRequired: 1800, unlock: 'Redes y seguridad', module: 'security' },
    { level: 8, name: 'Maestro',        xpRequired: 2500, unlock: null, module: null },
    { level: 9, name: 'Gran Maestro',   xpRequired: 3500, unlock: null, module: null },
    { level: 10, name: '⚡ Leyenda',    xpRequired: 5000, unlock: null, module: null },
  ];

  const MODULE_UNLOCK_LEVELS = {
    word: 1,
    internet: 2,
    excel: 3,
    email: 4,
    powerpoint: 5,
    programming: 6,
    security: 7
  };

  const ACHIEVEMENTS = [
    { id: 'first_lesson',    icon: '🎯', name: 'Primer paso',       desc: 'Completa tu primera lección',        xp: 20,  condition: (s) => s.totalLessons >= 1 },
    { id: 'five_lessons',    icon: '📚', name: 'Estudioso',         desc: 'Completa 5 lecciones',               xp: 50,  condition: (s) => s.totalLessons >= 5 },
    { id: 'ten_lessons',     icon: '🎓', name: 'Dedicado',          desc: 'Completa 10 lecciones',              xp: 100, condition: (s) => s.totalLessons >= 10 },
    { id: 'first_sim',       icon: '🖥️', name: 'Simulador Pro',     desc: 'Completa una tarea en el simulador', xp: 30,  condition: (s) => s.simTasksDone >= 1 },
    { id: 'streak_3',        icon: '🔥', name: 'En racha',          desc: 'Estudia 3 días seguidos',            xp: 40,  condition: (s) => s.streakDays >= 3 },
    { id: 'streak_7',        icon: '⚡', name: 'Imparable',         desc: 'Estudia 7 días seguidos',            xp: 100, condition: (s) => s.streakDays >= 7 },
    { id: 'level_3',         icon: '🥉', name: 'Aprendiz oficial',  desc: 'Alcanza el nivel 3',                 xp: 75,  condition: (s) => s.level >= 3 },
    { id: 'level_5',         icon: '🥈', name: 'Hábil',             desc: 'Alcanza el nivel 5',                 xp: 150, condition: (s) => s.level >= 5 },
    { id: 'level_10',        icon: '🏆', name: 'Leyenda',           desc: 'Alcanza el nivel máximo',            xp: 500, condition: (s) => s.level >= 10 },
    { id: 'first_quiz',      icon: '❓', name: 'Quiz master',       desc: 'Completa tu primer quiz',            xp: 25,  condition: (s) => s.quizzesDone >= 1 },
    { id: 'perfect_quiz',    icon: '💯', name: 'Perfecto',          desc: 'Obtén 100% en un quiz',              xp: 60,  condition: (s) => s.perfectQuizzes >= 1 },
    { id: 'xp_500',          icon: '💎', name: 'Coleccionista',     desc: 'Acumula 500 XP',                     xp: 0,   condition: (s) => s.xp >= 500 },
  ];

  // ---- HELPERS ----
  function getLevelInfo(xp) {
    let currentLevel = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.xpRequired) currentLevel = lvl;
      else break;
    }
    
    // Calcular XP dentro del nivel actual
    const nextIdx = LEVELS.findIndex(l => l.level === currentLevel.level + 1);
    const nextLevelXp = nextIdx !== -1 ? LEVELS[nextIdx].xpRequired : currentLevel.xpRequired;
    const currentLevelXp = currentLevel.xpRequired;
    const xpInLevel = xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    
    return {
      ...currentLevel,
      currentLevelXp,
      nextLevelXp,
      xpInLevel,
      xpNeeded
    };
  }

  function getXpProgress(xp) {
    const info = getLevelInfo(xp);
    if (info.xpNeeded === 0) return 100;
    return Math.min(100, Math.round((info.xpInLevel / info.xpNeeded) * 100));
  }

  function isModuleUnlocked(moduleName) {
    const requiredLevel = MODULE_UNLOCK_LEVELS[moduleName] || 1;
    const currentLevel = Store.get('level') || 1;
    return currentLevel >= requiredLevel;
  }

  function getNextLevelXp() {
    const xp = Store.get('xp') || 0;
    const info = getLevelInfo(xp);
    return info.xpNeeded;
  }

  // ---- FUNCIÓN CENTRAL: updateUserProgress ----
  // Esta es la función principal que actualiza todo el progreso del usuario
  async function updateUserProgress(type, data = {}) {
    const state = Store.getState();
    if (!state.currentUser || !state.isAuthenticated) {
      console.warn('updateUserProgress: Usuario no autenticado');
      return null;
    }

    const userId = state.currentUser.id;
    let updates = {};
    let newAchievements = [];

    try {
      // Actualizar según el tipo de acción
      switch (type) {
        case 'xp':
          const newXp = (state.xp || 0) + data.amount;
          const oldLevel = getLevelInfo(state.xp || 0).level;
          const newLevelInfo = getLevelInfo(newXp);
          
          updates = { xp: newXp, level: newLevelInfo.level };
          
          // Guardar en historial
          await saveHistoryEntry(userId, data.amount, data.reason);
          
          // Actualizar store
          Store.setState({
            xp: newXp,
            level: newLevelInfo.level
          });

          // Verificar level up
          if (newLevelInfo.level > oldLevel) {
            showLevelUp(newLevelInfo.level, newLevelInfo.name, newLevelInfo.unlock);
            confettiBurst();
          }
          break;

        case 'lesson_complete':
          const lessonId = data.lessonId;
          const lessonXp = data.xp || 20;
          const isAlreadyCompleted = state.completedLessons.includes(lessonId);
          
          if (isAlreadyCompleted) {
            console.log('Lección ya completada:', lessonId);
            return null;
          }

          // Guardar en Supabase
          await supabase.from('lesson_progress').insert([{
            user_id: userId,
            lesson_id: lessonId,
            module: data.module || 'word',
            completed_at: new Date().toISOString(),
            xp_earned: lessonXp
          }]);

          // Actualizar contador
          const newTotalLessons = (state.totalLessons || 0) + 1;
          updates = { total_lessons_completed: newTotalLessons };
          
          // Actualizar store
          const newCompleted = [...state.completedLessons, lessonId];
          Store.setState({
            completedLessons: newCompleted,
            totalLessons: newTotalLessons
          });

          // Dar XP por lección
          await addXp(lessonXp, `Lección completada: ${data.lessonTitle}`);
          break;

        case 'quiz_complete':
          const quizXp = data.xp || 0;
          const isPerfect = data.isPerfect || false;
          const newQuizCount = (state.quizzesDone || 0) + 1;
          
          updates = { quizzes_done: newQuizCount };
          if (isPerfect) {
            updates.perfect_quizzes = (state.perfectQuizzes || 0) + 1;
            Store.setState({ perfectQuizzes: updates.perfect_quizzes });
          }

          // Actualizar store
          Store.setState({ quizzesDone: newQuizCount });

          // Dar XP
          if (quizXp > 0) {
            await addXp(quizXp, 'Quiz completado');
          }
          break;

        case 'sim_task_complete':
          const simXp = data.xp || 30;
          const newSimCount = (state.simTasksDone || 0) + 1;
          
          updates = { sim_tasks_done: newSimCount };
          
          // Actualizar store
          Store.setState({ simTasksDone: newSimCount });

          // Dar XP
          await addXp(simXp, 'Tarea del simulador completada');
          break;

        case 'streak':
          // Actualizar racha (se llama diariamente)
          await updateStreak(userId);
          break;
      }

      // Guardar actualizaciones en Supabase si hay algo pendiente
      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', userId);
      }

      // Verificar logros después de cualquier acción
      await checkAchievements();

      return true;
    } catch (err) {
      console.error('Error en updateUserProgress:', err);
      showToast('error', 'Error al guardar progreso');
      return false;
    }
  }

  // ---- AGREGAR XP ----
  async function addXp(amount, reason = '') {
    return updateUserProgress('xp', { amount, reason });
  }

  // ---- GUARDAR HISTORIAL ----
  async function saveHistoryEntry(userId, xp, reason) {
    await supabase.from('xp_history').insert([{
      user_id: userId,
      xp_gained: xp,
      reason: reason,
      created_at: new Date().toISOString()
    }]);
  }

  // ---- ACTUALIZAR RACHA ----
  async function updateStreak(userId) {
    const state = Store.getState();
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = state.lastActivityDate;

    let newStreak = state.streakDays || 0;

    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }

      Store.setState({ 
        streakDays: newStreak,
        lastActivityDate: today
      });

      await supabase.from('profiles').update({
        streak_days: newStreak,
        last_activity_date: today
      }).eq('id', userId);
    }
  }

  // ---- VERIFICAR Y OTORGAR LOGROS ----
  async function checkAchievements() {
    const state = Store.getState();
    const unlocked = state.unlockedAchievements || [];
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (!unlocked.includes(achievement.id) && achievement.condition(state)) {
        newlyUnlocked.push(achievement);
        unlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      // Actualizar store
      Store.setState({ unlockedAchievements: unlocked });

      // Guardar en Supabase
      const userId = state.currentUser?.id;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ unlocked_achievements: unlocked })
          .eq('id', userId);
      }

      // Notificar logros
      for (const ach of newlyUnlocked) {
        showToast('success', `🏆 Logro desbloqueado!`, ach.name);
        
        // Dar XP del logro si tiene
        if (ach.xp > 0) {
          setTimeout(() => addXp(ach.xp, `Logro: ${ach.name}`), 800);
        }
      }

      // Actualizar UI de logros
      renderAchievements();
    }
  }

  // ---- RENDERIZAR LOGROS ----
  function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    const state = Store.getState();
    const unlocked = state.unlockedAchievements || [];

    grid.innerHTML = '';

    ACHIEVEMENTS.forEach((ach, i) => {
      const isUnlocked = unlocked.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.style.animationDelay = `${i * 50}ms`;
      card.innerHTML = `
        <span class="achievement-icon">${ach.icon}</span>
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
        ${ach.xp > 0 ? `<div class="achievement-xp">+${ach.xp} XP</div>` : ''}
        ${isUnlocked ? '<div style="margin-top:8px;font-size:0.75rem;color:#10B981;">✅ Desbloqueado</div>' : ''}
      `;
      grid.appendChild(card);
    });

    staggerItems('.achievement-card', 40);
  }

  // ---- CARGAR HISTORIAL ----
  async function loadHistory() {
    const state = Store.getState();
    const userId = state.currentUser?.id;
    const list = document.getElementById('historyList');
    if (!list || !userId) return;

    const { data, error } = await supabase
      .from('xp_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      list.innerHTML = '<p class="empty-state">Aún no hay actividad registrada.</p>';
      return;
    }

    list.innerHTML = data.map(entry => `
      <div class="history-item">
        <span>${entry.reason || 'Actividad'}</span>
        <span class="history-xp">+${entry.xp_gained} XP</span>
      </div>
    `).join('');
  }

  // ---- EXPORTS ----
  return {
    LEVELS,
    ACHIEVEMENTS,
    MODULE_UNLOCK_LEVELS,
    getLevelInfo,
    getXpProgress,
    isModuleUnlocked,
    getNextLevelXp,
    updateUserProgress,
    addXp,
    checkAchievements,
    renderAchievements,
    loadHistory
  };
})();

// Exponer globalmente
window.Progress = Progress;