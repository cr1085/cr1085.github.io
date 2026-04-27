// ════════════════════════════════════════════
// config.js — Configuración de Supabase
// ════════════════════════════════════════════
// ⚠️  REEMPLAZA estos valores con los tuyos
//     Supabase Dashboard → Settings → API
// ════════════════════════════════════════════

const SUPABASE_CONFIG = {
  url:     'https://TU_PROJECT_ID.supabase.co',   // ← Cambia esto
  anonKey: 'TU_ANON_KEY',                          // ← Cambia esto
  storageBucket: 'videos',
  edgeFunctionUrl: 'https://TU_PROJECT_ID.supabase.co/functions/v1/process-video',
};

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
console.log('[config.js] ✓ Configuración cargada');
