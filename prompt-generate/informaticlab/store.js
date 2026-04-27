// ================================================
// store.js — Estado global reactivo (Store pattern)
// InfoMática Platform
// ================================================

const Store = (function() {
  // Estado privado
  let _state = {
    // Autenticación
    currentUser: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    // Progreso del usuario
    xp: 0,
    level: 1,
    streakDays: 0,
    totalLessons: 0,
    simTasksDone: 0,
    quizzesDone: 0,
    perfectQuizzes: 0,
    unlockedAchievements: [],

    // Lecciones
    completedLessons: [],
    currentLesson: null,
    lessonProgress: {},

    // Ejercicios
    exerciseState: {
      type: null,
      questionIndex: 0,
      score: 0,
      answers: []
    },

    // Simulador
    simulatorTask: null,
    simulatorHistory: [],

    // UI
    currentSection: 'dashboard',
    isSidebarOpen: false,
    toasts: [],

    // Módulos
    currentModule: null,
    moduleProgress: {}
  };

  // Suscriptores para render reactivo
  const _listeners = new Map();

  // ---- Getters ----
  function getState() {
    return { ..._state };
  }

  function get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], _state);
  }

  // ---- Setters con notificación ----
  function setState(updates, notify = true) {
    const oldState = { ..._state };
    _state = { ..._state, ...updates };
    
    if (notify) {
      notifyListeners(_state, oldState);
    }
    return _state;
  }

  function set(path, value) {
    const keys = path.split('.');
    let obj = _state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = obj[keys[i]] || {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    notifyListeners(_state, _state);
    return _state;
  }

  // ---- Sistema de suscripciones ----
  function subscribe(key, callback) {
    if (!_listeners.has(key)) {
      _listeners.set(key, new Set());
    }
    _listeners.get(key).add(callback);
    
    return () => {
      _listeners.get(key)?.delete(callback);
    };
  }

  function notifyListeners(newState, oldState) {
    _listeners.forEach((callbacks, key) => {
      const newVal = get(key);
      const oldVal = key.split('.').reduce((obj, k) => obj?.[k], oldState);
      
      if (newVal !== oldVal) {
        callbacks.forEach(cb => cb(newVal, oldVal));
      }
    });
  }

  // ---- Métodos de dominio ----
  
  // Autenticación
  async function initAuth() {
    try {
      setState({ isLoading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await loadUserProfile(session);
        setState({ 
          session, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        setState({ 
          session: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } catch (err) {
      console.error('Error initAuth:', err);
      setState({ isLoading: false });
    }
  }

  async function loadUserProfile(session) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        await createDefaultProfile(session.user);
        return loadUserProfile(session);
      }

      if (error) throw error;

      const { data: lessonProgress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, module, completed_at, xp_earned')
        .eq('user_id', session.user.id);

      setState({
        currentUser: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          age_group: profile.age_group
        },
        xp: profile.xp || 0,
        level: profile.level || 1,
        streakDays: profile.streak_days || 0,
        totalLessons: profile.total_lessons_completed || 0,
        simTasksDone: profile.sim_tasks_done || 0,
        quizzesDone: profile.quizzes_done || 0,
        perfectQuizzes: profile.perfect_quizzes || 0,
        unlockedAchievements: profile.unlocked_achievements || [],
        completedLessons: lessonProgress?.map(l => l.lesson_id) || [],
        moduleProgress: profile.module_progress || {},
        currentModule: profile.last_module || 'pc_basico'
      });

      return profile;
    } catch (err) {
      console.error('Error loadUserProfile:', err);
      showToast('error', 'Error al cargar perfil');
    }
  }

  async function createDefaultProfile(authUser) {
    const { error } = await supabase.from('profiles').insert([{
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name || 'Estudiante',
      email: authUser.email,
      age_group: authUser.user_metadata?.age_group || 'adult',
      xp: 0,
      level: 1,
      streak_days: 0,
      total_lessons_completed: 0,
      sim_tasks_done: 0,
      quizzes_done: 0,
      perfect_quizzes: 0,
      unlocked_achievements: [],
      module_progress: {},
      last_module: 'pc_basico'
    }]);

    if (error) console.error('Error creating profile:', error);
  }

  // Cerrar sesión
  async function logout() {
    await supabase.auth.signOut();
    setState({
      currentUser: null,
      session: null,
      isAuthenticated: false,
      xp: 0,
      level: 1,
      completedLessons: [],
      exerciseState: { type: null, questionIndex: 0, score: 0, answers: [] }
    });
  }

  // ---- Inicialización ----
  function init() {
    initAuth();
  }

  return {
    getState,
    get,
    setState,
    set,
    subscribe,
    init,
    initAuth,
    loadUserProfile,
    logout
  };
})();

// Exponer globalmente
window.Store = Store;