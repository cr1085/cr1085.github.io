// ============================================================
// SUPABASE SERVICE
// Handles all backend communication
// ============================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class SupabaseService {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.initialized = false;
  }

  init() {
    if (typeof supabase === 'undefined') {
      console.warn('Supabase SDK not loaded, running in offline mode');
      this.initialized = false;
      return false;
    }
    try {
      this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      this.initialized = true;
      console.log('Supabase initialized');
      return true;
    } catch (e) {
      console.warn('Supabase init failed, running offline:', e.message);
      this.initialized = false;
      return false;
    }
  }

  async signInAnonymous() {
    if (!this.initialized) return this._offlineUser();
    try {
      const { data, error } = await this.client.auth.signInAnonymously();
      if (error) throw error;
      this.currentUser = data.user;
      return data.user;
    } catch (e) {
      console.warn('Auth failed, using offline mode:', e.message);
      return this._offlineUser();
    }
  }

  async signInWithEmail(email, password) {
    if (!this.initialized) return this._offlineUser();
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.currentUser = data.user;
    return data.user;
  }

  async signUpWithEmail(email, password, username) {
    if (!this.initialized) return this._offlineUser();
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await this.createUserProfile(data.user.id, username || email.split('@')[0]);
    }
    this.currentUser = data.user;
    return data.user;
  }

  async createUserProfile(userId, username) {
    if (!this.initialized) return null;
    const { data, error } = await this.client.from('users').upsert({
      id: userId,
      username,
      xp: 0,
      wins: 0,
      created_at: new Date().toISOString()
    });
    if (error) console.error('Profile create error:', error);
    return data;
  }

  async getUserProfile(userId) {
    if (!this.initialized) return this._offlineProfile();
    const { data, error } = await this.client
      .from('users').select('*').eq('id', userId).single();
    if (error) return this._offlineProfile();
    return data;
  }

  async updateUserXP(userId, xpToAdd) {
    if (!this.initialized) return null;
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;
    const { data, error } = await this.client
      .from('users').update({ xp: (profile.xp || 0) + xpToAdd }).eq('id', userId);
    if (error) console.error('XP update error:', error);
    return data;
  }

  async recordWin(userId) {
    if (!this.initialized) return null;
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;
    const { data, error } = await this.client
      .from('users').update({ wins: (profile.wins || 0) + 1 }).eq('id', userId);
    if (error) console.error('Win record error:', error);
    return data;
  }

  async saveMatch(matchData) {
    if (!this.initialized) return { id: 'offline_' + Date.now() };
    const { data, error } = await this.client.from('matches').insert({
      players: matchData.players,
      current_turn: matchData.currentTurn,
      state: matchData.state,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) { console.error('Match save error:', error); return null; }
    return data;
  }

  async updateMatch(matchId, matchData) {
    if (!this.initialized || matchId.startsWith('offline_')) return null;
    const { data, error } = await this.client
      .from('matches').update({
        current_turn: matchData.currentTurn,
        state: matchData.state,
        updated_at: new Date().toISOString()
      }).eq('id', matchId);
    if (error) console.error('Match update error:', error);
    return data;
  }

  async getRandomQuestion(type = null) {
    if (!this.initialized) return null;
    let query = this.client.from('questions').select('*');
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)];
  }

  async seedQuestions() {
    if (!this.initialized) return;
    const { data } = await this.client.from('questions').select('id').limit(1);
    if (data && data.length > 0) return; // Already seeded
    const questions = window.GAME_QUESTIONS || [];
    if (questions.length === 0) return;
    const { error } = await this.client.from('questions').insert(questions);
    if (error) console.error('Seed error:', error);
    else console.log('Questions seeded!');
  }

  _offlineUser() {
    return { id: 'offline_player_' + Date.now(), email: null, isOffline: true };
  }

  _offlineProfile() {
    return { id: 'offline', username: 'Player', xp: 0, wins: 0 };
  }
}

window.SupabaseService = new SupabaseService();
