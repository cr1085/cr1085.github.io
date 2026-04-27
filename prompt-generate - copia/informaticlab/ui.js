// ================================================
// ui.js — Notificaciones, animaciones, XP popup
// ================================================

// ---- TOAST NOTIFICATIONS ----
function showToast(type, title, sub = '', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', xp: '⭐' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '📢'}</span>
    <div class="toast-msg">
      <span class="toast-title">${title}</span>
      ${sub ? `<span class="toast-sub">${sub}</span>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- XP FLOATING POPUP ----
function showXpGain(amount, x, y) {
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = `+${amount} XP`;
  popup.style.left = (x || window.innerWidth / 2) + 'px';
  popup.style.top = (y || window.innerHeight / 2) + 'px';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1200);
}

// ---- LEVEL UP MODAL ----
function showLevelUp(level, levelName, unlockText = '') {
  const modal = document.getElementById('levelUpModal');
  const badge = document.getElementById('levelUpBadge');
  const name = document.getElementById('levelUpName');
  const unlock = document.getElementById('levelUpUnlock');

  if (!modal) return;

  badge.textContent = `Nv. ${level}`;
  name.innerHTML = `¡Ahora eres <strong>${levelName}</strong>!`;
  unlock.textContent = unlockText;

  modal.classList.remove('hidden');

  // Vibrar si es móvil
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// ---- SECTION TRANSITION ----
function animateSectionIn(sectionId) {
  const sec = document.getElementById(sectionId);
  if (sec) {
    sec.style.opacity = '0';
    sec.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      sec.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      sec.style.opacity = '1';
      sec.style.transform = 'translateY(0)';
    });
  }
}

// ---- PROGRESS BAR ANIMATION ----
function animateBar(element, targetPercent, delay = 0) {
  setTimeout(() => {
    if (element) element.style.width = `${Math.min(100, targetPercent)}%`;
  }, delay);
}

// ---- STAGGER ANIMATION ----
function staggerItems(selector, delayStep = 60) {
  const items = document.querySelectorAll(selector);
  items.forEach((item, i) => {
    item.style.animationDelay = `${i * delayStep}ms`;
    item.classList.add('animate-in');
  });
}

// ---- CONFETTI BURST (ligero, sin librería) ----
function confettiBurst() {
  const colors = ['#4F46E5', '#7C3AED', '#F59E0B', '#10B981', '#EC4899'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 6}px;
      height: ${Math.random() * 6 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 2px;
      left: ${Math.random() * 100}vw;
      top: -20px;
      z-index: 9999;
      pointer-events: none;
      transform: rotate(${Math.random() * 360}deg);
      animation: confettiFall ${Math.random() * 1.5 + 1}s ease-in forwards;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2600);
  }
}

// Agregar animación confetti al CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(${Math.random() * 720}deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
