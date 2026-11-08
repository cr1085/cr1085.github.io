/**
 * 3CB Code Arena — contrato inicial para migración a backend.
 * Este archivo es una guía de integración; la edición actual aún usa localStorage.
 * No coloques claves privadas, secretos ni credenciales de base de datos en GitHub Pages.
 */
export const ARENA_CONFIG = Object.freeze({
  apiBaseUrl: "", // Ej.: https://api.tudominio.com/v1 (solo URL pública)
  mode: "local"   // "local" mientras apiBaseUrl esté vacío
});

export class ArenaApi {
  constructor(config = ARENA_CONFIG) { this.config = config; }
  get connected() { return Boolean(this.config.apiBaseUrl); }

  async request(path, options = {}) {
    if (!this.connected) throw new Error("Backend no configurado: la plataforma sigue en modo local.");
    const response = await fetch(`${this.config.apiBaseUrl.replace(/\/$/,"")}${path}`, {
      ...options,
      headers: { "Content-Type":"application/json", ...(options.headers || {}) },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
    return response.status === 204 ? null : response.json();
  }

  // Endpoints sugeridos para implementar en Laravel/API cuando migres a Hostinger:
  // GET/POST   /auth/register, /auth/login, /auth/logout, /auth/me
  // GET/POST   /challenges, GET /challenges/:id, POST /submissions
  // GET/POST   /marathons, POST /marathons/:id/join, GET /marathons/:id/leaderboard
  // GET/POST   /community/posts, POST /community/posts/:id/comments
  // POST       /community/posts/:id/reactions
  // GET/POST   /indie/games
  // GET/POST   /organizations, /organization/members, /organization/events
  // POST       /billing/checkout, GET /billing/subscription
  // GET/POST   /admin/* (solo roles autorizados en el servidor)
}
