// ================================================
// user.js — Perfil, XP, Niveles, Logros
// ================================================

// ---- SISTEMA DE NIVELES ----
const LEVELS = [
  { level: 1, name: 'Principiante',  xpRequired: 0,    unlock: null },
  { level: 2, name: 'Explorador',    xpRequired: 100,  unlock: 'Internet Seguro' },
  { level: 3, name: 'Aprendiz',      xpRequired: 250,  unlock: 'Microsoft Excel' },
  { level: 4, name: 'Competente',    xpRequired: 500,  unlock: 'Correo Electrónico' },
  { level: 5, name: 'Hábil',         xpRequired: 800,  unlock: 'PowerPoint' },
  { level: 6, name: 'Avanzado',      xpRequired: 1200, unlock: 'Programación básica' },
  { level: 7, name: 'Experto',       xpRequired: 1800, unlock: 'Redes y seguridad' },
  { level: 8, name: 'Maestro',       xpRequired: 2500, unlock: null },
  { level: 9, name: 'Gran Maestro',  xpRequired: 3500, unlock: null },
  { level: 10, name: '⚡ Leyenda',   xpRequired: 5000, unlock: null },
];

// ---- LOGROS ----
const ACHIEVEMENTS = [
  { id: 'first_lesson',    icon: '🎯', name: 'Primer paso',      desc: 'Completa tu primera lección',        xp: 20,  condition: u => u.total_lessons_completed >= 1 },
  { id: 'five_lessons',    icon: '📚', name: 'Estudioso',        desc: 'Completa 5 lecciones',               xp: 50,  condition: u => u.total_lessons_completed >= 5 },
  { id: 'ten_lessons',     icon: '🎓', name: 'Dedicado',         desc: 'Completa 10 lecciones',              xp: 100, condition: u => u.total_lessons_completed >= 10 },
  { id: 'first_sim',       icon: '🖥️', name: 'Simulador Pro',    desc: 'Completa una tarea en el simulador', xp: 30,  condition: u => (u.sim_tasks_done || 0) >= 1 },
  { id: 'streak_3',        icon: '🔥', name: 'En racha',         desc: 'Estudia 3 días seguidos',            xp: 40,  condition: u => u.streak_days >= 3 },
  { id: 'streak_7',        icon: '⚡', name: 'Imparable',        desc: 'Estudia 7 días seguidos',            xp: 100, condition: u => u.streak_days >= 7 },
  { id: 'level_3',         icon: '🥉', name: 'Aprendiz oficial', desc: 'Alcanza el nivel 3',                 xp: 75,  condition: u => u.level >= 3 },
  { id: 'level_5',         icon: '🥈', name: 'Hábil',            desc: 'Alcanza el nivel 5',                 xp: 150, condition: u => u.level >= 5 },
  { id: 'level_10',        icon: '🏆', name: 'Leyenda',          desc: 'Alcanza el nivel máximo',            xp: 500, condition: u => u.level >= 10 },
  { id: 'first_quiz',      icon: '❓', name: 'Quiz master',      desc: 'Completa tu primer quiz',            xp: 25,  condition: u => (u.quizzes_done || 0) >= 1 },
  { id: 'perfect_quiz',    icon: '💯', name: 'Perfecto',         desc: 'Obtén 100% en un quiz',              xp: 60,  condition: u => (u.perfect_quizzes || 0) >= 1 },
  { id: 'xp_500',          icon: '💎', name: 'Coleccionista',    desc: 'Acumula 500 XP',                     xp: 0,   condition: u => u.xp >= 500 },
];

// Estado del usuario actual
let currentUser = null;

// ---- CARGAR DATOS DEL USUARIO ----
async function loadUserData(authUser) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      // Si no existe el perfil, crearlo
      if (error.code === 'PGRST116') {
        await createDefaultProfile(authUser);
        return loadUserData(authUser);
      }
      throw error;
    }

    currentUser = profile;
    renderUserUI(profile);
    return profile;

  } catch (err) {
    console.error('Error cargando usuario:', err);
    showToast('error', 'Error al cargar tu perfil');
  }
}

// ---- CREAR PERFIL POR DEFECTO ----
async function createDefaultProfile(authUser) {
  const name = authUser.user_metadata?.full_name || 'Estudiante';
  const { error } = await supabase.from('profiles').insert([{
    id: authUser.id,
    full_name: name,
    email: authUser.email,
    age_group: authUser.user_metadata?.age_group || 'adult',
    xp: 0,
    level: 1,
    streak_days: 0,
    total_lessons_completed: 0,
    sim_tasks_done: 0,
    quizzes_done: 0,
    perfect_quizzes: 0,
    unlocked_achievements: []
  }]);

  if (error) console.error('Error creando perfil:', error);
}

// ---- RENDERIZAR UI CON DATOS DEL USUARIO ----
function renderUserUI(profile) {
  if (!profile) return;

  const levelInfo = getLevelInfo(profile.xp);
  const nextLevelInfo = LEVELS[levelInfo.level] || LEVELS[LEVELS.length - 1];
  const xpProgress = getXpProgress(profile.xp);

  // Nombre
  const name = profile.full_name?.split(' ')[0] || 'Estudiante';
  setEl('userName', name);
  setEl('sidebarName', profile.full_name || 'Estudiante');

  // XP y nivel
  setEl('levelBadge', `Nv. ${levelInfo.level}`);
  setEl('levelName', levelInfo.name);
  setEl('currentXp', profile.xp);
  setEl('nextXp', nextLevelInfo.xpRequired);
  setEl('sidebarXp', `${profile.xp} XP`);
  setEl('mobileXp', `${profile.xp} XP`);

  // Racha
  setEl('streakCount', profile.streak_days || 0);

  // Stats
  setEl('totalLessons', profile.total_lessons_completed || 0);
  const achievementsUnlocked = (profile.unlocked_achievements || []).length;
  setEl('totalAchievements', achievementsUnlocked);

  // Barras de XP
  animateBar(document.getElementById('xpFill'), xpProgress);
  animateBar(document.getElementById('sidebarXpBar'), xpProgress);

  // Perfil
  setEl('profileName', profile.full_name || '—');
  setEl('profileEmail', profile.email || '—');
  setEl('profileLevelTag', levelInfo.name);
  setEl('pXp', profile.xp);
  setEl('pLevel', levelInfo.level);
  setEl('pLessons', profile.total_lessons_completed || 0);
  setEl('pStreak', profile.streak_days || 0);

  // Avatar (emoji según nivel)
  const avatarEmojis = ['🧑', '😊', '🤓', '😎', '🦸', '⚡', '🌟', '🏆', '👑', '🧙'];
  const avatarEmoji = avatarEmojis[Math.min(levelInfo.level - 1, avatarEmojis.length - 1)];
  setEl('sidebarAvatar', avatarEmoji);
  setEl('profileAvatar', avatarEmoji);
}

// ---- AGREGAR XP ----
async function addXp(amount, reason = '') {
  if (!currentUser) return;

  const newXp = currentUser.xp + amount;
  const oldLevel = getLevelInfo(currentUser.xp).level;
  const newLevel = getLevelInfo(newXp).level;

  // Actualizar en Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('id', currentUser.id);

  if (error) { console.error('Error actualizando XP:', error); return; }

  currentUser.xp = newXp;
  currentUser.level = newLevel;

  // Animación XP
  showXpGain(amount);
  showToast('xp', `+${amount} XP`, reason || 'XP ganado');

  // Actualizar UI
  renderUserUI(currentUser);

  // ¿Subió de nivel?
  if (newLevel > oldLevel) {
    const levelInfo = getLevelInfo(newXp);
    const unlockText = levelInfo.unlock ? `🔓 Desbloqueado: ${levelInfo.unlock}` : '';
    showLevelUp(newLevel, levelInfo.name, unlockText);
    confettiBurst();
    await checkAchievements();
  }

  // Guardar en historial
  await saveHistoryEntry(amount, reason);

  return newXp;
}

// ---- GUARDAR HISTORIAL ----
async function saveHistoryEntry(xp, reason) {
  if (!currentUser) return;
  await supabase.from('xp_history').insert([{
    user_id: currentUser.id,
    xp_gained: xp,
    reason: reason,
    created_at: new Date().toISOString()
  }]);
}

// ---- VERIFICAR Y OTORGAR LOGROS ----
async function checkAchievements() {
  if (!currentUser) return;

  const unlocked = currentUser.unlocked_achievements || [];
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.includes(achievement.id) && achievement.condition(currentUser)) {
      newlyUnlocked.push(achievement.id);
      unlocked.push(achievement.id);

      // Notificar
      showToast('success', `🏆 ¡Logro desbloqueado!`, achievement.name);

      // Dar XP del logro
      if (achievement.xp > 0) {
        setTimeout(() => addXp(achievement.xp, `Logro: ${achievement.name}`), 800);
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    currentUser.unlocked_achievements = unlocked;
    await supabase
      .from('profiles')
      .update({ unlocked_achievements: unlocked })
      .eq('id', currentUser.id);
  }
}

// ---- CARGAR LOGROS EN UI ----
function loadAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;

  const unlocked = currentUser?.unlocked_achievements || [];
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

// ---- CARGAR HISTORIAL EN PERFIL ----
async function loadHistory() {
  if (!currentUser) return;
  const list = document.getElementById('historyList');
  if (!list) return;

  const { data, error } = await supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', currentUser.id)
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

// ---- HELPERS ----
function getLevelInfo(xp) {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) currentLevel = lvl;
    else break;
  }
  return currentLevel;
}

function getXpProgress(xp) {
  const current = getLevelInfo(xp);
  const nextIdx = LEVELS.findIndex(l => l.level === current.level + 1);
  if (nextIdx === -1) return 100;
  const next = LEVELS[nextIdx];
  const range = next.xpRequired - current.xpRequired;
  const earned = xp - current.xpRequired;
  return Math.min(100, Math.round((earned / range) * 100));
}

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
