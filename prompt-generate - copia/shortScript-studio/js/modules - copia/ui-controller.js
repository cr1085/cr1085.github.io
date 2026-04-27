/**
 * ui-controller.js
 * Handles all DOM rendering and UI state changes.
 */

import { Config } from '../config/config.js';

export class UIController {
  constructor(toast) {
    this.toast         = toast;
    this._activeTones  = new Set();
    this._init();
  }

  _init() {
    this._renderToneChips();
    this._renderQuickNiches();
  }

  /** ── Render tone chips ── */
  _renderToneChips() {
    const container = document.getElementById('tone-chips');
    if (!container) return;

    Config.TONES.forEach(({ label, value }) => {
      const chip = document.createElement('button');
      chip.className   = 'chip';
      chip.dataset.val = value;
      chip.textContent = label;
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        if (chip.classList.contains('active')) {
          this._activeTones.add(value);
        } else {
          this._activeTones.delete(value);
        }
      });
      container.appendChild(chip);
    });
  }

  /** ── Render quick niche chips ── */
  _renderQuickNiches() {
    const container = document.getElementById('quick-niches');
    if (!container) return;

    Config.QUICK_NICHES.forEach(niche => {
      const chip = document.createElement('button');
      chip.className   = 'chip';
      chip.textContent = niche;
      chip.addEventListener('click', () => {
        document.getElementById('input-topic').value = niche;
        document.getElementById('input-niche').value = niche;
      });
      container.appendChild(chip);
    });
  }

  /** Get active tone values */
  getActiveTones() {
    return [...this._activeTones];
  }

  /** Update mode badge */
  updateModeBadge(openaiKey) {
    const badge = document.getElementById('mode-badge');
    if (!badge) return;
    badge.textContent = openaiKey
      ? '🤖 GPT-4o-mini'
      : 'Sin API (local)';
  }

  /** ── Generate button loading state ── */
  setGenerating(loading) {
    const btn   = document.getElementById('btn-generate');
    const label = document.getElementById('btn-label');
    const icon  = document.getElementById('btn-icon-spark');

    if (loading) {
      btn.disabled     = true;
      label.textContent = 'GENERANDO…';
      icon.innerHTML   = `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="32" stroke-dashoffset="32" style="animation:spin 0.8s linear infinite;transform-origin:center"/>`;
    } else {
      btn.disabled     = false;
      label.textContent = 'GENERAR GUIONES';
      icon.innerHTML   = `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`;
    }
  }

  /** ── Render script cards ── */
  renderScripts(scripts, { onTabChange, onCopyScript, onPlayAudio }) {
    const grid = document.getElementById('scripts-grid');
    grid.innerHTML = '';

    scripts.forEach((script, i) => {
      const card = this._buildScriptCard(script, i, { onTabChange, onCopyScript, onPlayAudio });
      grid.appendChild(card);
    });
  }

  /** Build a single script card */
  _buildScriptCard(script, idx, { onTabChange, onCopyScript, onPlayAudio }) {
    const card = document.createElement('div');
    card.className  = 'script-card';
    card.dataset.idx = idx;

    // ── Header ──
    const header = document.createElement('div');
    header.className = 'script-card-header';
    header.innerHTML = `
      <span class="script-number">#${String(script.id).padStart(2,'0')}</span>
      <span class="script-title">${this._escHtml(script.title)}</span>
      <div class="flex gap-2 ml-auto">
        <button class="btn-copy btn-secondary text-xs px-3 py-1.5" title="Copiar narración">📋 Copiar</button>
        <button class="btn-play-audio btn-secondary text-xs px-3 py-1.5" title="Escuchar">🔊 Audio</button>
      </div>
    `;

    header.querySelector('.btn-copy').addEventListener('click', () => onCopyScript(script));
    header.querySelector('.btn-play-audio').addEventListener('click', () => onPlayAudio(idx));

    // ── Tabs ──
    const tabs = document.createElement('div');
    tabs.className = 'script-tabs';
    ['guion', 'subtitulos', 'hashtags', 'audio'].forEach((tab, ti) => {
      const t = document.createElement('button');
      t.className    = `script-tab${ti === 0 ? ' active' : ''}`;
      t.dataset.tab  = tab;
      t.textContent  = ['📝 Guion', '💬 Subtítulos', '#️⃣ Hashtags', '🔊 Audio'][ti];
      t.addEventListener('click', () => onTabChange(card, tab));
      tabs.appendChild(t);
    });

    // ── Content area ──
    const content = document.createElement('div');
    content.className = 'script-content';

    // Guion pane
    const guionPane = document.createElement('div');
    guionPane.className = 'tab-pane active';
    guionPane.dataset.pane = 'guion';
    (script.segments || []).forEach(seg => {
      const row = document.createElement('div');
      row.className = 'segment';
      row.innerHTML = `
        <span class="segment-label">${this._escHtml(seg.label)}</span>
        <span class="segment-text">${this._escHtml(seg.text)}</span>
      `;
      guionPane.appendChild(row);
    });

    // Subtitles pane
    const subPane = document.createElement('div');
    subPane.className = 'tab-pane';
    subPane.dataset.pane = 'subtitulos';
    if (script.subtitles && script.subtitles.length) {
      script.subtitles.forEach(sub => {
        const line = document.createElement('div');
        line.className = 'subtitle-line';
        line.innerHTML = `
          <span class="subtitle-tc">${sub.start}</span>
          <span>${this._escHtml(sub.text)}</span>
        `;
        subPane.appendChild(line);
      });
    } else {
      subPane.innerHTML = '<p class="text-ash text-sm">Subtítulos no disponibles.</p>';
    }

    // Hashtags pane
    const hashPane = document.createElement('div');
    hashPane.className = 'tab-pane flex flex-wrap gap-1 p-1';
    hashPane.dataset.pane = 'hashtags';
    (script.hashtags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'hashtag';
      span.textContent = tag;
      hashPane.appendChild(span);
    });

    // Audio pane
    const audioPane = document.createElement('div');
    audioPane.className = 'tab-pane';
    audioPane.dataset.pane = 'audio';
    audioPane.id = `audio-pane-${idx}`;
    audioPane.innerHTML = `
      <div class="text-ash text-sm flex items-center gap-3">
        <button class="btn-primary text-sm py-1.5 px-4 generate-audio-btn" data-idx="${idx}">
          🎙️ Generar audio
        </button>
        <span class="text-xs">o usa el botón "Generar Audios" arriba</span>
      </div>
    `;
    audioPane.querySelector('.generate-audio-btn')
      .addEventListener('click', () => onPlayAudio(idx));

    content.appendChild(guionPane);
    content.appendChild(subPane);
    content.appendChild(hashPane);
    content.appendChild(audioPane);

    card.appendChild(header);
    card.appendChild(tabs);
    card.appendChild(content);

    return card;
  }

  /** Attach an audio player blob to a script card */
  attachAudioPlayer(idx, blob) {
    const pane = document.getElementById(`audio-pane-${idx}`);
    if (!pane) return;

    const url = URL.createObjectURL(blob);
    pane.innerHTML = `
      <div class="audio-player">
        <span class="text-xs text-ash font-mono">Guion ${idx + 1}</span>
        <audio controls src="${url}" class="flex-1"></audio>
        <a href="${url}" download="audio_${String(idx+1).padStart(2,'0')}.${blob.type.includes('wav') ? 'wav' : 'webm'}"
           class="btn-secondary text-xs py-1 px-3">⬇</a>
      </div>
    `;
  }

  _escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}
