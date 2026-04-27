// ================================================
// auth.js — Registro, Login, Logout
// ================================================

// ---- REGISTRO ----
async function registerUser() {
  const name = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const password = document.getElementById('regPassword')?.value;
  const age = document.getElementById('regAge')?.value;
  const errorEl = document.getElementById('registerError');
  const loadingEl = document.getElementById('authLoading');

  // Validaciones
  if (!name || !email || !password || !age) {
    showError(errorEl, '⚠️ Por favor completa todos los campos.');
    return;
  }

  if (password.length < 6) {
    showError(errorEl, '⚠️ La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  showLoading(loadingEl, true);

  try {
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, age_group: age }
      }
    });

    if (error) throw error;

    const userId = data.user.id;

    // 2. Crear perfil en tabla `profiles`
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        full_name: name,
        email: email,
        age_group: age,
        xp: 0,
        level: 1,
        streak_days: 0,
        total_lessons_completed: 0
      }]);

    if (profileError) console.warn('Perfil error (puede que ya exista):', profileError.message);

    showLoading(loadingEl, false);
    showToast('success', '¡Cuenta creada!', 'Redirigiendo al dashboard...');

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 1200);

  } catch (err) {
    showLoading(loadingEl, false);
    const msg = translateAuthError(err.message);
    showError(errorEl, msg);
  }
}

// ---- LOGIN ----
async function loginUser() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errorEl = document.getElementById('loginError');
  const loadingEl = document.getElementById('authLoading');

  if (!email || !password) {
    showError(errorEl, '⚠️ Ingresa tu email y contraseña.');
    return;
  }

  showLoading(loadingEl, true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    showLoading(loadingEl, false);
    showToast('success', '¡Bienvenido!', 'Cargando tu perfil...');

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 800);

  } catch (err) {
    showLoading(loadingEl, false);
    showError(errorEl, translateAuthError(err.message));
  }
}

// ---- LOGOUT ----
async function logoutUser() {
  try {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
    window.location.href = 'index.html';
  }
}

// ---- HELPERS ----
function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 5000);
}

function showLoading(element, show) {
  if (!element) return;
  if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

function translateAuthError(msg) {
  const errors = {
    'Invalid login credentials': '❌ Email o contraseña incorrectos.',
    'Email not confirmed': '📧 Confirma tu email antes de entrar.',
    'User already registered': '⚠️ Ya existe una cuenta con ese email.',
    'Password should be at least 6 characters': '⚠️ La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address': '⚠️ Email no válido.',
    'signup disabled': '⚠️ El registro está desactivado temporalmente.',
  };

  for (const [key, value] of Object.entries(errors)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value;
  }

  return `❌ Error: ${msg}`;
}

// ---- EVENT LISTENERS ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnLogin')?.addEventListener('click', loginUser);
  document.getElementById('btnRegister')?.addEventListener('click', registerUser);

  // Enter key support
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginUser();
  });

  document.getElementById('regPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') registerUser();
  });
});
