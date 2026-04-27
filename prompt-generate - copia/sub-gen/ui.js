// ════════════════════════════════════════════
// ui.js — Utilidades de interfaz de usuario
// ════════════════════════════════════════════

const UI = {

  // ── TOASTS ──────────────────────────────

  /**
   * Mostrar notificación toast
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number} duration - ms
   */
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  },

  // ── SCREENS ─────────────────────────────

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`${name}-screen`);
    if (screen) screen.classList.add('active');
  },

  // ── VIEWS (dentro del dashboard) ────────

  showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${name}`);
    if (view) view.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-view="${name}"]`);
    if (navItem) navItem.classList.add('active');

    const titles = {
      upload:  { title: 'Subir Video', subtitle: 'Sube un video y genera subtítulos automáticamente con IA' },
      history: { title: 'Historial',   subtitle: 'Tus videos procesados anteriormente' }
    };

    if (titles[name]) {
      document.getElementById('view-title').textContent    = titles[name].title;
      document.getElementById('view-subtitle').textContent = titles[name].subtitle;
    }
  },

  // ── AUTH TABS ───────────────────────────

  initAuthTabs() {
    // Auth tabs may not exist (auth screen removed)
    const tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(`tab-${tab}`);
        if (panel) panel.classList.add('active');
        this.clearAuthMessage();
      });
    });
  },

  setAuthMessage(msg, type = 'error') {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.textContent = msg;
    el.className = `auth-message ${type}`;
  },

  clearAuthMessage() {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.textContent = '';
    el.className = 'auth-message';
  },

  // ── PROGRESS STEPS ──────────────────────

  /**
   * Actualizar estado de un paso del proceso
   * @param {'upload'|'process'|'transcribe'|'generate'} stepId
   * @param {'pending'|'active'|'done'|'error'} state
   * @param {string} message
   */
  setStep(stepId, state, message = '') {
    const step = document.getElementById(`step-${stepId}`);
    if (!step) return;

    step.className = `step ${state}`;
    const statusEl = step.querySelector('.step-status');

    const defaultMessages = {
      pending:   'Esperando...',
      active:    'En progreso...',
      done:      'Completado',
      error:     'Error'
    };

    statusEl.textContent = message || defaultMessages[state];
  },

  setProgress(percent, message = '') {
    const bar = document.getElementById('main-progress-bar');
    const msg = document.getElementById('progress-message');
    if (bar) bar.style.width = `${percent}%`;
    if (msg && message) msg.textContent = message;
  },

  // ── PANELS ──────────────────────────────

  showUploadZone() {
    document.getElementById('upload-zone').classList.remove('hidden');
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('progress-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.add('hidden');

    // Reset progress bar for clean start
    const bar = document.getElementById('main-progress-bar');
    if (bar) bar.style.width = '0%';
    const msg = document.getElementById('progress-message');
    if (msg) msg.textContent = 'Iniciando proceso...';
  },

  showFilePreview() {
    document.getElementById('upload-zone').classList.add('hidden');
    document.getElementById('file-preview').classList.remove('hidden');
    document.getElementById('progress-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.add('hidden');
  },

  showProgressPanel() {
    document.getElementById('upload-zone').classList.add('hidden');
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('progress-panel').classList.remove('hidden');
    document.getElementById('result-panel').classList.add('hidden');

    // Reset steps
    ['upload', 'process', 'transcribe', 'generate'].forEach(s =>
      this.setStep(s, 'pending')
    );
    this.setProgress(0, 'Iniciando proceso...');
  },

  showResultPanel(srtContent, videoUrl, info, onSRTEdit) {
    document.getElementById('upload-zone').classList.add('hidden');
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('progress-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.remove('hidden');

    // Info
    if (info) {
      document.getElementById('result-subtitle-info').textContent = info;
    }

    // SRT preview (raw)
    document.getElementById('srt-content').textContent = srtContent;

    // Video
    const video = document.getElementById('result-video');
    video.src = videoUrl;
    
    // Handle video load errors — try recreating blob URL
    video.onerror = () => {
      console.error("[showResultPanel] Video failed to load:", videoUrl);
      // Try one more time after a short delay (blob URL race condition)
      setTimeout(() => {
        if (video.src === videoUrl && video.readyState === 0) {
          console.log("[showResultPanel] Retrying video load...");
          video.src = '';
          video.load();
          video.src = videoUrl;
          video.load();
        }
      }, 500);
    };

    // Parsear SRT para el overlay y el editor
    const parsed  = SRT.parse(srtContent);
    const overlay = document.getElementById('subtitle-overlay');

    // Inicializar el editor de estilos
    if (window.SubtitleEditor) {
      SubtitleEditor.init(parsed, video, overlay, (newSRT) => {
        // Actualizar vista previa SRT cuando el usuario edita
        document.getElementById('srt-content').textContent = newSRT;
        if (onSRTEdit) onSRTEdit(newSRT);
      });
    } else {
      // Fallback: overlay básico sin editor
      video.addEventListener('timeupdate', () => {
        const text = SRT.getActiveSubtitle(parsed, video.currentTime);
        overlay.innerHTML = text
          ? `<span class="subtitle-text">${text}</span>`
          : '';
      });
    }
  },

  // ── HISTORY CARDS ───────────────────────

  renderHistoryCard(video, onDownload) {
    const card = document.createElement('div');
    card.className = 'history-card';

    const statusMap = {
      done:       { cls: 'badge-done',    label: '✓ Listo' },
      processing: { cls: 'badge-process', label: '⟳ Procesando' },
      error:      { cls: 'badge-error',   label: '✕ Error' }
    };

    const status = statusMap[video.status] || statusMap.error;
    const date   = new Date(video.created_at).toLocaleDateString('es', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    card.innerHTML = `
      <div class="history-card-title" title="${video.filename}">${video.filename}</div>
      <div class="history-card-meta">
        <span>${date}</span>
        <span>${video.language?.toUpperCase() || '—'}</span>
      </div>
      <span class="history-card-badge ${status.cls}">${status.label}</span>
      ${video.status === 'done' ? `
        <div class="history-card-actions">
          <button class="btn-sm btn-dl">↓ Descargar SRT</button>
        </div>
      ` : ''}
    `;

    if (video.status === 'done') {
      card.querySelector('.btn-dl').addEventListener('click', e => {
        e.stopPropagation();
        onDownload(video);
      });
    }

    return card;
  },

  renderHistory(videos, onDownload) {
    const grid = document.getElementById('history-grid');
    grid.innerHTML = '';

    if (!videos.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">◷</span>
          <p>Todavía no tienes videos procesados</p>
        </div>
      `;
      return;
    }

    videos.forEach(video => {
      grid.appendChild(this.renderHistoryCard(video, onDownload));
    });
  },

  // ── HELPERS ─────────────────────────────

  setLoading(btnId, loading, text = '') {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    if (text) btn.querySelector('span:first-child').textContent = text;
  },

  formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

window.UI = UI;
