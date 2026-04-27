// ════════════════════════════════════════════════════════
// auth-gate.js — Protege ShortScript Studio con sesión de PromptLab
// Comparte la sesión Supabase de PromptLab (mismo dominio).
// ════════════════════════════════════════════════════════
(function () {
  'use strict';

  const PROMPTLAB_URL = '../index.html';

  function findSession() {
    const candidates = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith('sb-') ||
        key.includes('supabase') ||
        key.includes('auth-token')
      ) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        try {
          const data = JSON.parse(raw);

          if (data.access_token && data.user) {
            candidates.push({
              access_token: data.access_token,
              refresh_token: data.refresh_token || null,
              user: data.user,
              expires_at: data.expires_at || null
            });
          }
        } catch (e) {
          if (raw.split('.').length === 3) {
            try {
              const payload = JSON.parse(atob(raw.split('.')[1]));
              if (payload.sub) {
                candidates.push({
                  access_token: raw,
                  refresh_token: null,
                  user: { id: payload.sub, email: payload.email || '' },
                  expires_at: payload.exp || null
                });
              }
            } catch (e2) {}
          }
        }
      }
    }

    return candidates.length > 0 ? candidates[0] : null;
  }

  function showLoadingScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'auth-gate-loading';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: #0A0A0F;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Bebas Neue', Arial, sans-serif;
      color: #fff; gap: 16px;
    `;
    overlay.innerHTML = `
      <div style="width:40px;height:40px;border:3px solid #333;
        border-top-color:#00FF94;border-radius:50%;
        animation:ag-spin 0.8s linear infinite"></div>
      <span style="font-size:0.9rem;opacity:0.6">Verificando sesión...</span>
      <style>@keyframes ag-spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function showAuthRequired() {
    document.getElementById('auth-gate-loading')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'auth-gate-blocked';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: #0A0A0F;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Bebas Neue', Arial, sans-serif;
      color: #fff; gap: 20px; text-align: center; padding: 2rem;
    `;
    overlay.innerHTML = `
      <div style="font-size:3rem">🔒</div>
      <h2 style="font-size:1.5rem;margin:0">Inicia sesión para usar ShortScript Studio</h2>
      <p style="opacity:0.5;max-width:380px;line-height:1.5;margin:0">
        Necesitas una cuenta en PromptLab para generar guiones virales.
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <a href="${PROMPTLAB_URL}"
           style="background:#00FF94;color:#0A0A0F;padding:12px 28px;
           border-radius:50px;text-decoration:none;font-weight:700;
           font-size:0.95rem;transition:transform 0.2s"
           onmouseover="this.style.transform='scale(1.05)'"
           onmouseout="this.style.transform='scale(1)'">
          Ir a PromptLab
        </a>
        <a href="${PROMPTLAB_URL}"
           style="background:transparent;color:#fff;padding:12px 28px;
           border-radius:50px;text-decoration:none;font-weight:600;
           font-size:0.95rem;border:1px solid #333;transition:all 0.2s"
           onmouseover="this.style.borderColor='#00FF94'"
           onmouseout="this.style.borderColor='#333'">
          Crear cuenta gratis
        </a>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function injectUserSession(user) {
    window.__PROMPTLAB_USER = {
      id:    user.id,
      email: user.email || '',
      role:  user.role || 'authenticated',
    };
  }

  async function gate() {
    // Create a content shield that hides app content
    const shield = document.createElement('div');
    shield.id = 'app-shield';
    shield.style.cssText = 'position:fixed;inset:0;z-index:99998;background:#0A0A0F;opacity:1;transition:opacity 0.4s;';
    document.body.appendChild(shield);

    const loading = showLoadingScreen();

    await new Promise(r => setTimeout(r, 300));

    const session = findSession();

    if (!session) {
      shield.remove();
      showAuthRequired();
      return false;
    }

    console.log('[auth-gate] Sesión encontrada para:', session.user?.email || session.user?.id);
    injectUserSession(session.user);
    loading.remove();
    shield.style.opacity = '0';
    setTimeout(() => shield.remove(), 400);
    return true;
  }

  window.__AUTH_GATE = gate();

})();