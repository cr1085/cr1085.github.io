// ════════════════════════════════════════════
// auth.js — Autenticación con Supabase
// ════════════════════════════════════════════

console.log('[auth.js] window.Supabase:', typeof window.supabase);
console.log('[auth.js] window.SUPABASE_CONFIG:', typeof window.SUPABASE_CONFIG);

(function () {

  // ── Crear cliente si no existe ──
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    
    // Intentar crear cliente directamente
    if (window.Supabase && window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
      window.supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
      console.log('[auth.js] Cliente creado desde auth.js');
      return window.supabaseClient;
    }
    
    console.error('[auth.js] No se pudo crear cliente:', {
      Supabase: !!window.supabase,
      config: !!window.SUPABASE_CONFIG,
      url: window.SUPABASE_CONFIG?.url,
      key: !!window.SUPABASE_CONFIG?.anonKey
    });
    throw new Error('Supabase client no disponible. Verifica config.js y que se haya cargado supabase-js.');
  }

  // ══════════════════════════════════════
  // REGISTRO DE USUARIO
  // ══════════════════════════════════════
  async function register(email, password) {
    const client = getClient();

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos.');
    }
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) throw error;

    return data;
  }

  // ══════════════════════════════════════
  // INICIO DE SESIÓN
  // ══════════════════════════════════════
  async function login(email, password) {
    const client = getClient();

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos.');
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;

    return data;
  }

  // ══════════════════════════════════════
  // CIERRE DE SESIÓN
  // ══════════════════════════════════════
  async function logout() {
    const client = getClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  // ══════════════════════════════════════
  // OBTENER SESIÓN ACTIVA
  // ══════════════════════════════════════
  async function getSession() {
    const client = getClient();
    const { data: { session }, error } = await client.auth.getSession();
    if (error) {
      console.warn('[auth.js] Error obteniendo sesión:', error.message);
      return null;
    }
    return session;
  }

  // ══════════════════════════════════════
  // OBTENER USUARIO ACTUAL
  // ══════════════════════════════════════
  async function getUser() {
    const session = await getSession();
    return session?.user || null;
  }

  // ══════════════════════════════════════
  // ESCUCHAR CAMBIOS DE AUTH
  // ══════════════════════════════════════
  function onAuthChange(callback) {
    const client = getClient();
    return client.auth.onAuthStateChange((event, session) => {
      console.log('[auth.js] Auth state change:', event);
      callback(event, session);
    });
  }

  // ══════════════════════════════════════
  // MENSAJES DE ERROR AMIGABLES
  // ══════════════════════════════════════
  function friendlyError(message) {
    const msgs = {
      'Invalid login credentials':    'Email o contraseña incorrectos.',
      'Email not confirmed':           'Debes confirmar tu email antes de ingresar.',
      'User already registered':       'Este email ya tiene una cuenta. Inicia sesión.',
      'already registered':            'Este email ya tiene una cuenta. Inicia sesión.',
      'Password should be at least':   'La contraseña debe tener al menos 6 caracteres.',
      'Unable to validate email':      'El formato del email no es válido.',
      'Invalid email':                 'El formato del email no es válido.',
      'Signups not allowed':           'El registro está deshabilitado. Contacta al administrador.',
      'Email rate limit exceeded':     'Demasiados intentos. Intenta más tarde.',
    };

    for (const [key, friendly] of Object.entries(msgs)) {
      if (message && message.includes(key)) return friendly;
    }

    return message || 'Ocurrió un error desconocido. Intenta de nuevo.';
  }

  // ══════════════════════════════════════
  // EXPORTAR AL SCOPE GLOBAL
  // ══════════════════════════════════════
  window.Auth = {
    register,
    login,
    logout,
    getSession,
    getUser,
    onAuthChange,
    friendlyError
  };

  console.log('[auth.js] ✓ Módulo de autenticación cargado correctamente.');

})();
