/**
 * toast.js — Simple toast notification manager
 */

export class ToastManager {
  constructor() {
    this._timer = null;
  }

  /**
   * Show a toast message
   * @param {string} message
   * @param {'success'|'warn'|'error'|'info'} type
   * @param {number} duration — ms
   */
  show(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    const inner = document.getElementById('toast-inner');
    const icon  = document.getElementById('toast-icon');
    const msg   = document.getElementById('toast-msg');

    if (!toast) return;

    const icons = {
      success: '✓',
      warn:    '⚠',
      error:   '✕',
      info:    'ℹ',
    };

    const colors = {
      success: 'border-neon/30 text-neon',
      warn:    'border-yellow-500/30 text-yellow-400',
      error:   'border-red-500/30 text-red-400',
      info:    'border-white/10 text-white',
    };

    // Reset classes
    inner.className = `bg-ink-light border text-sm px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 ${colors[type] || colors.info}`;
    icon.textContent  = icons[type] || icons.info;
    msg.textContent   = message;

    toast.classList.remove('hidden');

    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => toast.classList.add('hidden'), duration);
  }
}
