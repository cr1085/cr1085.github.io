/**
 * api-client.js
 * Backend API wrapper for database operations.
 * All requests go through server-side PHP to hide credentials.
 */

const API_BASE = 'http://localhost:8080/supabase.php';

export class ApiClient {
  constructor(storage) {
    this.storage = storage;
    this._ready = true;
  }

  isReady() {
    return this._ready;
  }

  async _fetch(action, data = null) {
    try {
      const url = API_BASE + '?action=' + action;
      
      const res = await fetch(url);
      const json = await res.json();
      console.log('API Response:', json);
      return json;
    } catch (e) {
      console.warn('API call failed:', e);
      return [];
    }
  }

  async fetchPrompts(limit = 20) {
    const result = await this._fetch('get_prompts');
    return Array.isArray(result) ? result.slice(0, limit) : [];
  }

  async insertPrompt({ name, niche, prompt }) {
    return await this._fetch('save_prompt', { name, niche, prompt });
  }

  async saveScript(script) {
    return await this._fetch('save_script', script);
  }
}