/* ============================================================
   QRConvert — script.js
   ============================================================
   CONFIGURACIÓN SUPABASE:
   Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con tus valores
   del panel de Supabase → Settings → API
   ============================================================ */

const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

/* ===== INIT SUPABASE ===== */
let supabase = null;
let currentUser = null;

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase no configurado. Funciona en modo local.', e);
}

/* ===== DOM REFERENCES ===== */
const $ = id => document.getElementById(id);

const mainInput     = $('mainInput');
const detectBadge   = $('detectBadge');
const btnConvert    = $('btnConvert');
const btnLoader     = $('btnLoader');
const outputCard    = $('outputCard');
const outputLabel   = $('outputLabel');
const outputMeta    = $('outputMeta');
const qrCanvas      = $('qrCanvas');
const qrWrapper     = $('qrWrapper');
const linkOutput    = $('linkOutput');
const linkBox       = $('linkBox');
const btnDownload   = $('btnDownload');
const btnCopy       = $('btnCopy');
const errorCard     = $('errorCard');
const errorMsg      = $('errorMsg');
const imageUpload   = $('imageUpload');
const dropOverlay   = $('dropOverlay');
const inputZone     = $('inputZone');
const themeToggle   = $('themeToggle');
const authBtn       = $('authBtn');
const logoutBtn     = $('logoutBtn');
const historyBtn    = $('historyBtn');
const authModal     = $('authModal');
const historyModal  = $('historyModal');
const closeAuth     = $('closeAuthModal');
const closeHistory  = $('closeHistoryModal');
const authMsg       = $('authMsg');
const toast         = $('toast');

/* ===== STATE ===== */
let currentAction   = 'qr';   // 'qr' | 'link'
let currentQRInstance = null;
let uploadedImageURL = null;
let toastTimer = null;

/* ===== THEME ===== */
const savedTheme = localStorage.getItem('qrc-theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☽' : '☀';

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('qrc-theme', next);
  themeToggle.textContent = next === 'dark' ? '☽' : '☀';
});

/* ===== TOAST ===== */
function showToast(msg, duration = 2500) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ===== INPUT TYPE DETECTION ===== */
function detectInputType(value) {
  if (!value || !value.trim()) return 'empty';
  const v = value.trim();
  if (/^https?:\/\/.+(youtube|youtu\.be|vimeo|tiktok|twitch)/i.test(v)) return 'video';
  if (/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)/i.test(v)) return 'image';
  if (/^https?:\/\/[^\s]+/i.test(v) || /^www\./i.test(v)) return 'url';
  if (uploadedImageURL) return 'image';
  return 'text';
}

const typeMeta = {
  empty: { label: 'Esperando input…', cls: '' },
  url:   { label: '🔗 URL', cls: 'type-url' },
  video: { label: '🎬 Video', cls: 'type-video' },
  image: { label: '🖼 Imagen', cls: 'type-image' },
  text:  { label: '📝 Texto', cls: 'type-text' }
};

function updateDetection() {
  const type = detectInputType(mainInput.value);
  const meta = typeMeta[type] || typeMeta.empty;
  detectBadge.textContent = meta.label;
  detectBadge.className   = 'detect-badge' + (meta.cls ? ' ' + meta.cls : '');
}

mainInput.addEventListener('input', updateDetection);

/* ===== ACTION BUTTONS ===== */
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAction = btn.dataset.action;
  });
});

/* ===== IMAGE UPLOAD ===== */
imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleImageFile(file);
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showError('Por favor sube un archivo de imagen válido.');
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    uploadedImageURL = ev.target.result;
    mainInput.value = `[Imagen subida: ${file.name}]`;
    updateDetection();
    showToast('✅ Imagen cargada — ahora presiona Convertir');
  };
  reader.readAsDataURL(file);
}

/* ===== DRAG & DROP ===== */
inputZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropOverlay.classList.add('active');
});

inputZone.addEventListener('dragleave', () => {
  dropOverlay.classList.remove('active');
});

inputZone.addEventListener('drop', e => {
  e.preventDefault();
  dropOverlay.classList.remove('active');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageFile(file);
  } else {
    const text = e.dataTransfer.getData('text');
    if (text) { mainInput.value = text; updateDetection(); }
  }
});

/* ===== GENERATE QR ===== */
function generateQR(content) {
  return new Promise((resolve, reject) => {
    qrCanvas.innerHTML = '';
    try {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      currentQRInstance = new QRCode(qrCanvas, {
        text: content,
        width: 220,
        height: 220,
        colorDark: isDark ? '#c8ff00' : '#1a1a2e',
        colorLight: isDark ? '#111118' : '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      setTimeout(() => resolve(), 300);
    } catch (e) {
      reject(e);
    }
  });
}

/* ===== GENERATE SHAREABLE LINK ===== */
function generateShareableLink(content) {
  const type = detectInputType(content);
  if (type === 'url' || type === 'video') return content.trim();
  const encoded = encodeURIComponent(content.trim());
  return `${window.location.origin}${window.location.pathname}?q=${encoded}`;
}

/* ===== SHOW / HIDE HELPERS ===== */
function showError(msg) {
  errorMsg.textContent = msg;
  errorCard.classList.remove('hidden');
  outputCard.classList.add('hidden');
}

function hideError() {
  errorCard.classList.add('hidden');
}

function setLoading(on) {
  btnConvert.querySelector('span').style.opacity = on ? '0.5' : '1';
  btnLoader.classList.toggle('hidden', !on);
  btnConvert.disabled = on;
}

/* ===== MAIN CONVERT ===== */
btnConvert.addEventListener('click', async () => {
  hideError();
  const rawInput = mainInput.value.trim();
  const content  = uploadedImageURL || rawInput;

  if (!content) {
    showError('Por favor ingresa texto, URL o una imagen antes de convertir.');
    return;
  }

  setLoading(true);

  try {
    if (currentAction === 'qr') {
      // For images: encode the URL or data URI; for other content encode directly
      const qrContent = uploadedImageURL
        ? `[Imagen] ${rawInput}`
        : content.length > 2000
          ? content.substring(0, 2000) + '…'
          : content;

      await generateQR(qrContent);

      outputLabel.textContent = 'Tu código QR';
      qrWrapper.classList.remove('hidden');
      linkOutput.classList.add('hidden');
      outputMeta.textContent = `${qrContent.length} caracteres • Haz clic en "Descargar" para guardar`;

    } else {
      // Shareable link
      const link = generateShareableLink(uploadedImageURL ? rawInput : content);
      linkBox.textContent = link;
      qrWrapper.classList.add('hidden');
      linkOutput.classList.remove('hidden');
      outputLabel.textContent = 'Enlace compartible';
      outputMeta.textContent = 'Haz clic en "Copiar" para copiar al portapapeles';
    }

    outputCard.classList.remove('hidden');

    // Save to history if logged in
    if (currentUser && supabase) {
      await saveHistory({
        type: currentAction === 'qr' ? 'QR' : 'Link',
        content: uploadedImageURL ? `[Imagen] ${rawInput}` : content.substring(0, 300),
        user_id: currentUser.id
      });
    }

  } catch (err) {
    console.error(err);
    showError('Error al generar el QR. Intenta con un texto más corto o una URL válida.');
  } finally {
    setLoading(false);
  }
});

/* ===== DOWNLOAD QR ===== */
btnDownload.addEventListener('click', () => {
  const canvas = qrCanvas.querySelector('canvas');
  const img    = qrCanvas.querySelector('img');
  let dataURL;

  if (canvas) {
    dataURL = canvas.toDataURL('image/png');
  } else if (img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || 220;
    c.height = img.naturalHeight || 220;
    c.getContext('2d').drawImage(img, 0, 0);
    dataURL = c.toDataURL('image/png');
  } else {
    showToast('⚠ No hay QR que descargar.');
    return;
  }

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'qr-code.png';
  a.click();
  showToast('✅ QR descargado como PNG');
});

/* ===== COPY LINK ===== */
btnCopy.addEventListener('click', async () => {
  let textToCopy = '';

  if (currentAction === 'link') {
    textToCopy = linkBox.textContent;
  } else {
    // Copy QR image as data URL fallback → copy the content used
    const meta = outputMeta.textContent;
    const canvas = qrCanvas.querySelector('canvas');
    if (canvas) {
      try {
        canvas.toBlob(async blob => {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('✅ QR copiado como imagen');
        });
        return;
      } catch {
        textToCopy = mainInput.value;
      }
    }
  }

  if (!textToCopy) { showToast('⚠ Nada que copiar'); return; }

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast('✅ Copiado al portapapeles');
  } catch {
    showToast('⚠ No se pudo copiar. Cópialo manualmente.');
  }
});

/* ===== SUPABASE AUTH ===== */
async function checkSession() {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      currentUser = data.session.user;
      updateUI(true);
    }
  } catch (e) {
    console.warn('Session check error', e);
  }
}

function updateUI(loggedIn) {
  if (loggedIn) {
    authBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    historyBtn.style.display = 'block';
  } else {
    authBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    historyBtn.style.display = 'none';
    currentUser = null;
  }
}

/* Auth button → open modal */
authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeAuth.addEventListener('click', () => authModal.classList.add('hidden'));
authModal.addEventListener('click', e => { if (e.target === authModal) authModal.classList.add('hidden'); });

/* Tabs */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    $('authLogin').classList.toggle('hidden', which !== 'login');
    $('authRegister').classList.toggle('hidden', which !== 'register');
    authMsg.textContent = '';
    authMsg.style.color = '';
  });
});

/* Login */
$('btnLogin').addEventListener('click', async () => {
  if (!supabase) { setAuthMsg('⚠ Supabase no configurado.', '#ff8080'); return; }
  const email = $('loginEmail').value.trim();
  const pass  = $('loginPassword').value;
  if (!email || !pass) { setAuthMsg('Por favor completa ambos campos.', '#ff8080'); return; }

  setAuthMsg('Iniciando sesión…', 'var(--text-muted)');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) { setAuthMsg('❌ ' + error.message, '#ff8080'); return; }
  currentUser = data.user;
  updateUI(true);
  authModal.classList.add('hidden');
  showToast('👋 Bienvenido de vuelta');
});

/* Register */
$('btnRegister').addEventListener('click', async () => {
  if (!supabase) { setAuthMsg('⚠ Supabase no configurado.', '#ff8080'); return; }
  const email = $('regEmail').value.trim();
  const pass  = $('regPassword').value;
  if (!email || !pass) { setAuthMsg('Por favor completa ambos campos.', '#ff8080'); return; }
  if (pass.length < 6) { setAuthMsg('La contraseña debe tener al menos 6 caracteres.', '#ff8080'); return; }

  setAuthMsg('Creando cuenta…', 'var(--text-muted)');
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) { setAuthMsg('❌ ' + error.message, '#ff8080'); return; }
  setAuthMsg('✅ Cuenta creada. Revisa tu correo para confirmar.', '#80ff80');
});

/* Google OAuth */
$('btnGoogleLogin').addEventListener('click', async () => {
  if (!supabase) { setAuthMsg('⚠ Supabase no configurado.', '#ff8080'); return; }
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
});

/* Logout */
logoutBtn.addEventListener('click', async () => {
  if (supabase) await supabase.auth.signOut();
  updateUI(false);
  showToast('👋 Sesión cerrada');
});

function setAuthMsg(msg, color) {
  authMsg.textContent = msg;
  authMsg.style.color = color || '';
}

/* Auth state change listener */
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      currentUser = session.user;
      updateUI(true);
    } else {
      updateUI(false);
    }
  });
}

/* ===== HISTORY ===== */
historyBtn.addEventListener('click', async () => {
  historyModal.classList.remove('hidden');
  await loadHistory();
});

closeHistory.addEventListener('click', () => historyModal.classList.add('hidden'));
historyModal.addEventListener('click', e => { if (e.target === historyModal) historyModal.classList.add('hidden'); });

async function saveHistory({ type, content, user_id }) {
  if (!supabase) return;
  try {
    await supabase.from('conversions').insert([{
      user_id,
      type,
      content,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.warn('Error guardando historial:', e);
  }
}

async function loadHistory() {
  const historyList = $('historyList');
  historyList.innerHTML = '<p class="history-empty">Cargando…</p>';

  if (!supabase || !currentUser) {
    historyList.innerHTML = '<p class="history-empty">Inicia sesión para ver tu historial.</p>';
    return;
  }

  try {
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!data || data.length === 0) {
      historyList.innerHTML = '<p class="history-empty">Sin conversiones aún. ¡Genera tu primer QR!</p>';
      return;
    }

    historyList.innerHTML = '';
    data.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      const date = new Date(item.created_at).toLocaleString('es-CO', {
        dateStyle: 'short', timeStyle: 'short'
      });
      el.innerHTML = `
        <div class="history-item-type">${item.type}</div>
        <div class="history-item-content">${escapeHtml(item.content)}</div>
        <div class="history-item-date">${date}</div>
      `;
      el.addEventListener('click', () => {
        mainInput.value = item.content.replace(/^\[Imagen\] /, '');
        updateDetection();
        historyModal.classList.add('hidden');
        showToast('📋 Contenido cargado del historial');
      });
      historyList.appendChild(el);
    });
  } catch (e) {
    historyList.innerHTML = `<p class="history-empty">Error: ${e.message}</p>`;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ===== URL PARAM → AUTO-FILL ===== */
function loadFromURLParam() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    mainInput.value = decodeURIComponent(q);
    updateDetection();
    showToast('🔗 Contenido cargado desde enlace');
  }
}

/* ===== INIT ===== */
checkSession();
loadFromURLParam();
