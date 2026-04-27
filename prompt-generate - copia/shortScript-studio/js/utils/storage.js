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
  saveKeys({ openai, elevenlabs }) {
    if (openai)       this.set('openai_key',      openai);
    if (elevenlabs)   this.set('elevenlabs_key',  elevenlabs);
  }

  getKey(service) {
    const map = {
      openai:       'openai_key',
      elevenlabs:   'elevenlabs_key',
    };
    return this.get(map[service] || service, '');
  }

  /** Restore keys into modal inputs (if they exist in DOM) */
  restoreKeys() {
    const fields = {
      'key-openai':     this.getKey('openai'),
      'key-elevenlabs': this.getKey('elevenlabs'),
    };

    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    }
  }
}
