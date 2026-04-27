// ════════════════════════════════════════════
// supabase.js — Stub / cliente Supabase
// ════════════════════════════════════════════
// Si SUPABASE_CONFIG está definido (config.js cargado), 
// intentamos crear el cliente real. Si no, usamos stubs 
// que no rompen la app.
// ════════════════════════════════════════════

(function () {

  // ── Intentar crear cliente real ──────────
  let supabase = null;

  try {
    if (
      window.SUPABASE_CONFIG &&
      window.SUPABASE_CONFIG.url &&
      window.SUPABASE_CONFIG.url !== 'https://TU_PROJECT_ID.supabase.co' &&
      window.supabase
    ) {
      supabase = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
      console.log('[supabase.js] ✓ Cliente Supabase real iniciado');
    } else {
      console.warn('[supabase.js] ⚠ Supabase no configurado — modo local activado');
    }
  } catch (e) {
    console.warn('[supabase.js] Error creando cliente Supabase:', e.message);
  }

  // ── waitForSupabase (compatibilidad) ────
  window.waitForSupabase = async () => {
    // No hay nada que esperar en este setup
    return;
  };

  // ══════════════════════════════════════
  // Auth (stubs si no hay Supabase real)
  // ══════════════════════════════════════
  window.Auth = {
    async getSession() {
      if (!supabase) return null;
      try {
        const { data } = await supabase.auth.getSession();
        return data?.session || null;
      } catch { return null; }
    },
    async login(email, password) {
      if (!supabase) throw new Error('Supabase no configurado');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async register(email, password) {
      if (!supabase) throw new Error('Supabase no configurado');
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async logout() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
    onAuthChange(callback) {
      if (!supabase) return;
      supabase.auth.onAuthStateChange(callback);
    }
  };

  // ══════════════════════════════════════
  // Storage
  // ══════════════════════════════════════
  window.Storage = {
    async uploadVideo(file, userId, onProgress) {
      if (!supabase) throw new Error('Supabase Storage no configurado');
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from(window.SUPABASE_CONFIG?.storageBucket || 'videos')
        .upload(path, file, { onUploadProgress: (e) => onProgress && onProgress(Math.round(e.loaded / e.total * 100)) });
      if (error) throw error;
      return path;
    },
    async uploadSRT(content, userId, videoId) {
      if (!supabase) throw new Error('Supabase Storage no configurado');
      const path = `${userId}/${videoId}.srt`;
      const blob = new Blob([content], { type: 'text/plain' });
      const { error } = await supabase.storage
        .from(window.SUPABASE_CONFIG?.storageBucket || 'videos')
        .upload(path, blob, { upsert: true });
      if (error) throw error;
      return path;
    },
    async getPublicVideoUrl(storagePath) {
      if (!supabase) return null;
      const { data } = supabase.storage
        .from(window.SUPABASE_CONFIG?.storageBucket || 'videos')
        .getPublicUrl(storagePath);
      return data?.publicUrl || null;
    },
    getItem:    (k) => localStorage.getItem(k),
    setItem:    (k, v) => localStorage.setItem(k, v),
    removeItem: (k) => localStorage.removeItem(k),
  };

  // ══════════════════════════════════════
  // DB
  // ══════════════════════════════════════
  window.DB = {
    async createVideoRecord({ userId, filename, storagePath, language, model }) {
      if (!supabase) throw new Error('Supabase DB no configurado');
      const { data, error } = await supabase
        .from('videos')
        .insert([{ user_id: userId, filename, storage_path: storagePath, language, model, status: 'processing' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateVideoRecord(id, updates) {
      if (!supabase) throw new Error('Supabase DB no configurado');
      const { error } = await supabase.from('videos').update(updates).eq('id', id);
      if (error) throw error;
    },
    async getUserVideos(userId) {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    }
  };

  console.log('[supabase.js] ✓ Auth, Storage y DB listos');

})();
