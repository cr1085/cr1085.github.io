/**
 * supabase-client.js
 * Thin wrapper around the Supabase JS client.
 * Auto-initializes from stored keys. No-ops gracefully if not configured.
 */

import { Config } from '../config/config.js';

export class SupabaseClient {
  constructor(storage) {
    this.storage = storage;
    this.client  = null;
    this._tryInit();
  }

  _tryInit() {
    const url  = this.storage.getKey('supabaseUrl');
    const anon = this.storage.getKey('supabaseAnon');
    if (url && anon && typeof supabase !== 'undefined') {
      try {
        this.client = supabase.createClient(url, anon);
      } catch (e) {
        console.warn('Supabase init failed:', e);
      }
    }
  }

  reinit(url, anon) {
    if (url && anon && typeof supabase !== 'undefined') {
      try {
        this.client = supabase.createClient(url, anon);
      } catch (e) {
        console.warn('Supabase reinit failed:', e);
      }
    }
  }

  isReady() {
    return !!this.client;
  }

  /** ── Community Prompts ── */
  async fetchPrompts(limit = 20) {
    if (!this.isReady()) return [];
    const { data, error } = await this.client
      .from(Config.SUPABASE_TABLES.PROMPTS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) { console.warn('fetchPrompts:', error); return []; }
    return data || [];
  }

  async insertPrompt({ name, niche, prompt }) {
    if (!this.isReady()) throw new Error('Supabase no configurado');
    const { error } = await this.client
      .from(Config.SUPABASE_TABLES.PROMPTS)
      .insert([{ name, niche, prompt, created_at: new Date().toISOString() }]);
    if (error) throw error;
  }

  /** ── Shared Scripts ── */
  async saveScript(script) {
    if (!this.isReady()) return null;
    const { data, error } = await this.client
      .from(Config.SUPABASE_TABLES.SCRIPTS)
      .insert([{ ...script, created_at: new Date().toISOString() }])
      .select();
    if (error) { console.warn('saveScript:', error); return null; }
    return data?.[0];
  }
}
