/**
 * storage.js — localStorage wrapper for API keys and settings
 */

export class StorageManager {
  static PREFIX = 'sss_';

  /** Save a value */
  set(key, value) {
    try {
      localStorage.setItem(StorageManager.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  }

  /** Get a value */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(StorageManager.PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /** Remove a value */
  remove(key) {
    localStorage.removeItem(StorageManager.PREFIX + key);
  }

  /** ── API Keys ── */
  saveKeys({ openai, elevenlabs, supabaseUrl, supabaseAnon }) {
    if (openai)       this.set('openai_key',      openai);
    if (elevenlabs)   this.set('elevenlabs_key',  elevenlabs);
    if (supabaseUrl)  this.set('supabase_url',    supabaseUrl);
    if (supabaseAnon) this.set('supabase_anon',   supabaseAnon);
  }

  getKey(service) {
    if (window.APP_CONFIG?.[service]) return window.APP_CONFIG[service];
    return this.get(service, '');
  }

  setKey(service, value) {
    window.APP_CONFIG = window.APP_CONFIG || {};
    window.APP_CONFIG[service] = value;
    this.set(service, value);
  }

  /** Restore keys into modal inputs (if they exist in DOM) */
  restoreKeys() {
    const fields = {
      'key-openai':        this.getKey('openai'),
      'key-elevenlabs':    this.getKey('elevenlabs'),
      'key-supabase-url':  this.getKey('supabaseUrl'),
      'key-supabase-anon': this.getKey('supabaseAnon'),
    };

    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    }
  }
}
