// ════════════════════════════════════════════════════════
// editor.js — Editor de subtítulos con estilos visuales
// ════════════════════════════════════════════════════════

const SubtitleEditor = (() => {

  // ── Estado ────────────────────────────────────────────
  let _entries      = [];   // [{ index, start, end, startSec, endSec, text }]
  let _activePreset = 'mrbeast';
  let _config       = {};
  let _videoEl      = null;
  let _overlayEl    = null;
  let _onSRTChange  = null;
  let _lastSubIdx   = -1;
  let _orientation   = 'horizontal';  // 'horizontal' | 'vertical'

  // ══════════════════════════════════════════════════════
  // PRESETS DE ESTILOS
  // ══════════════════════════════════════════════════════
  const PRESETS = {
    mrbeast: {
      label:         'MrBeast',
      emoji:         '⚡',
      fontFamily:    "'Bangers', Impact, 'Arial Black', sans-serif",
      fontSize:      58,
      color:         '#FFD700',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 4px 8px rgba(0,0,0,0.5)',
      bgColor:       'transparent',
      position:      'bottom',
      animation:     'pop',
      uppercase:     true,
      letterSpacing: 2,
      lineHeight:    1.0,
      maxWidth:      '85%',
      charsPerLine:  0,
    },
    tiktok: {
      label:         'TikTok',
      emoji:         '🎵',
      fontFamily:    "'Syne', 'Poppins', 'Proxima Nova', Arial, sans-serif",
      fontSize:      34,
      color:         '#FFFFFF',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.6)',
      bgColor:       'transparent',
      position:      'center',
      animation:     'pop',
      uppercase:     false,
      letterSpacing: 0.5,
      lineHeight:    1.2,
      maxWidth:      '88%',
      charsPerLine:  18,
    },
    reels: {
      label:         'Instagram Reels',
      emoji:         '📸',
      fontFamily:    "'Syne', 'Poppins', 'Proxima Nova', Arial, sans-serif",
      fontSize:      30,
      color:         '#FFFFFF',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 8px rgba(0,0,0,0.7)',
      bgColor:       'transparent',
      position:      'center',
      animation:     'pop',
      uppercase:     false,
      letterSpacing: 0.3,
      lineHeight:    1.3,
      maxWidth:      '85%',
      charsPerLine:  18,
    },
    netflix: {
      label:         'Netflix',
      emoji:         '🎬',
      fontFamily:    "'Syne', Arial, sans-serif",
      fontSize:      26,
      color:         '#FFFFFF',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 12px rgba(0,0,0,0.9)',
      bgColor:       'rgba(0,0,0,0.65)',
      position:      'bottom',
      animation:     'fade',
      uppercase:     false,
      letterSpacing: 0.3,
      lineHeight:    1.5,
      maxWidth:      '75%',
    },
    neon: {
      label:         'Neon',
      emoji:         '💫',
      fontFamily:    "'DM Mono', 'Courier New', monospace",
      fontSize:      28,
      color:         '#00FFFF',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '0 0 8px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #00CCCC, 0 0 60px #009999',
      bgColor:       'transparent',
      position:      'bottom',
      animation:     'fade',
      uppercase:     false,
      letterSpacing: 3,
      lineHeight:    1.4,
      maxWidth:      '80%',
    },
    fire: {
      label:         'Fire',
      emoji:         '🔥',
      fontFamily:    "'Bangers', Impact, 'Arial Black', sans-serif",
      fontSize:      52,
      color:         '#FF6B00',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '3px 3px 0 #7A0000, -2px -2px 0 #7A0000, 2px -2px 0 #7A0000, -2px 2px 0 #7A0000, 0 0 20px #FF4500, 0 0 40px #FF2200',
      bgColor:       'transparent',
      position:      'center',
      animation:     'slide',
      uppercase:     true,
      letterSpacing: 1,
      lineHeight:    1.0,
      maxWidth:      '80%',
    },
    minimal: {
      label:         'Minimal',
      emoji:         '✦',
      fontFamily:    "'Syne', Arial, sans-serif",
      fontSize:      22,
      color:         '#FFFFFF',
      stroke:        'transparent',
      strokeW:       0,
      shadow:        '0 2px 8px rgba(0,0,0,0.6)',
      bgColor:       'transparent',
      position:      'bottom',
      animation:     'fade',
      uppercase:     false,
      letterSpacing: 0,
      lineHeight:    1.6,
      maxWidth:      '70%',
    },
  };

  // ══════════════════════════════════════════════════════
  // INIT (punto de entrada público)
  // ══════════════════════════════════════════════════════
  function init(entries, videoEl, overlayEl, onSRTChange) {
    _entries     = entries.map((e, i) => ({ ...e, _uid: i }));
    _videoEl     = videoEl;
    _overlayEl   = overlayEl;
    _onSRTChange = onSRTChange;
    _lastSubIdx  = -1;

    _buildEditorUI();

    // Esperar metadatos para detectar orientación antes de aplicar preset
    const _onReady = () => {
      adjustLayout();
      _applyPreset(_activePreset);
      _startVideoSync();
    };

    if (videoEl.readyState >= 1) {
      _onReady();
    } else {
      videoEl.addEventListener('loadedmetadata', _onReady, { once: true });
      videoEl.addEventListener('loadeddata', _onReady, { once: true });
    }
  }

  // ══════════════════════════════════════════════════════
  // CONSTRUCCIÓN DE LA UI
  // ══════════════════════════════════════════════════════
  function _buildEditorUI() {
    const section = document.getElementById('editor-section');
    if (!section) return;
    section.innerHTML = '';
    section.classList.remove('hidden');

    // ── Título de sección ────────────────────────────
    const title = document.createElement('div');
    title.className = 'editor-section-title';
    title.innerHTML = '<span>🎨 Editor de Estilo</span>';
    section.appendChild(title);

    // ── Preset pills ─────────────────────────────────
    const presetsWrap = document.createElement('div');
    presetsWrap.className = 'presets-wrap';

    Object.entries(PRESETS).forEach(([key, preset]) => {
      const btn = document.createElement('button');
      btn.className = `preset-pill ${key === _activePreset ? 'active' : ''}`;
      btn.dataset.preset = key;
      btn.innerHTML = `<span>${preset.emoji}</span><span>${preset.label}</span>`;
      btn.addEventListener('click', () => _applyPreset(key));
      presetsWrap.appendChild(btn);
    });
    section.appendChild(presetsWrap);

    // ── Controles finos ──────────────────────────────
    const controls = document.createElement('div');
    controls.className = 'fine-controls';
    controls.innerHTML = `
      <div class="fine-ctrl-group">
        <label>Tamaño</label>
        <div class="range-row">
          <input type="range" id="ctrl-size" min="8" max="80" value="58" />
          <span id="ctrl-size-val" class="range-val">58px</span>
        </div>
      </div>
      <div class="fine-ctrl-group">
        <label>Color texto</label>
        <input type="color" id="ctrl-color" value="#FFD700" class="color-picker" />
      </div>
      <div class="fine-ctrl-group">
        <label>Posición</label>
        <select id="ctrl-position" class="mini-select">
          <option value="bottom">Abajo</option>
          <option value="center">Centro</option>
          <option value="top">Arriba</option>
        </select>
      </div>
      <div class="fine-ctrl-group">
        <label>Ajustar Y</label>
        <input type="range" id="ctrl-yoffset" class="mini-range" min="-100" max="100" value="0" style="width:80px" />
        <span id="ctrl-yoffset-val" class="mini-val">0</span>
      </div>
      <div class="fine-ctrl-group">
        <label>Caracteres/línea</label>
        <select id="ctrl-charsperline" class="mini-select">
          <option value="0">Automático</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="30">30</option>
          <option value="35">35</option>
          <option value="40">40</option>
        </select>
      </div>
      <div class="fine-ctrl-group">
        <label>Animación</label>
        <select id="ctrl-animation" class="mini-select">
          <option value="pop">Pop ⚡</option>
          <option value="fade">Fade ✦</option>
          <option value="slide">Slide ↑</option>
          <option value="bounce">Bounce 〜</option>
          <option value="none">Sin animación</option>
        </select>
      </div>
      <div class="fine-ctrl-group">
        <label>MAYÚSCULAS</label>
        <label class="toggle">
          <input type="checkbox" id="ctrl-upper" checked />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
      </div>
    `;
    section.appendChild(controls);
    _wireControls();

    // ── Lista editora de subtítulos ──────────────────
    const listHeader = document.createElement('div');
    listHeader.className = 'entries-header';
    listHeader.innerHTML = `
      <span>✏️ Editar subtítulos <span class="entry-cnt">${_entries.length} entradas</span></span>
      <button id="btn-add-entry" class="btn-add-entry">+ Añadir</button>
    `;
    section.appendChild(listHeader);

    const list = document.createElement('div');
    list.className = 'entries-list';
    list.id = 'entries-list';
    _entries.forEach(entry => list.appendChild(_buildEntryRow(entry)));
    section.appendChild(list);

    // Botón añadir entrada
    document.getElementById('btn-add-entry').addEventListener('click', () => _addEntry());
  }

  function _buildEntryRow(entry) {
    const row = document.createElement('div');
    row.className = 'entry-row';
    row.id = `erow-${entry._uid}`;

    const startFormatted = _secToMMSS(entry.startSec);
    const endFormatted   = _secToMMSS(entry.endSec);

    row.innerHTML = `
      <span class="entry-idx">${entry.index}</span>
      <button class="entry-time-btn" title="Ir a este momento">${startFormatted}</button>
      <input class="entry-input" type="text" value="${_escHtml(entry.text)}" placeholder="Texto..." />
      <button class="entry-del-btn" title="Eliminar">✕</button>
    `;

    // Click en tiempo → seek
    row.querySelector('.entry-time-btn').addEventListener('click', () => {
      if (_videoEl && !isNaN(entry.startSec)) {
        _videoEl.currentTime = entry.startSec + 0.05;
        _videoEl.play();
      }
    });

    // Edit text
    const input = row.querySelector('.entry-input');
    input.addEventListener('input', () => {
      entry.text = input.value;
      _notifyChange();
    });

    // Delete
    row.querySelector('.entry-del-btn').addEventListener('click', () => {
      _entries = _entries.filter(e => e._uid !== entry._uid);
      row.remove();
      _updateEntryCnt();
      _notifyChange();
    });

    return row;
  }

  function _addEntry() {
    const lastEntry = _entries[_entries.length - 1];
    const startSec  = lastEntry ? lastEntry.endSec + 0.5 : 0;
    const endSec    = startSec + 3;
    const uid       = Date.now();
    const entry     = {
      _uid:     uid,
      index:    _entries.length + 1,
      start:    SRT.secondsToTimestamp(startSec),
      end:      SRT.secondsToTimestamp(endSec),
      startSec, endSec,
      text:     'Nuevo subtítulo'
    };
    _entries.push(entry);
    document.getElementById('entries-list')?.appendChild(_buildEntryRow(entry));
    _updateEntryCnt();
    _notifyChange();
  }

  function _updateEntryCnt() {
    const el = document.querySelector('.entry-cnt');
    if (el) el.textContent = `${_entries.length} entradas`;
  }

  // ── Controles finos ──────────────────────────────────
  function _wireControls() {
    const get = id => document.getElementById(id);

    get('ctrl-size')?.addEventListener('input', function () {
      const val = parseInt(this.value);
      const display = get('ctrl-size-val');
      if (display) display.textContent = val + 'px';
      const currentStrokeW = _config.strokeW || 0;
      const strokeW = currentStrokeW > 0 ? Math.max(1, Math.round(val * 0.12)) : 0;
      _override({ fontSize: val, strokeW: strokeW });
    });

    get('ctrl-color')?.addEventListener('input', function () {
      _override({ color: this.value });
    });

    get('ctrl-position')?.addEventListener('change', function () {
      _override({ position: this.value });
    });

    get('ctrl-yoffset')?.addEventListener('input', function () {
      const val = parseInt(this.value) || 0;
      document.getElementById('ctrl-yoffset-val').textContent = val;
      _override({ yOffset: val });
    });

    get('ctrl-charsperline')?.addEventListener('change', function () {
      _override({ charsPerLine: parseInt(this.value) || 0 });
    });

    get('ctrl-animation')?.addEventListener('change', function () {
      _override({ animation: this.value });
    });

    get('ctrl-upper')?.addEventListener('change', function () {
      _override({ uppercase: this.checked });
    });
  }

  function _syncControls(cfg) {
    const get = id => document.getElementById(id);
    const sizeEl = get('ctrl-size');
    const sizeValEl = get('ctrl-size-val');
    if (sizeEl)    { sizeEl.value = cfg.fontSize; }
    if (sizeValEl) { sizeValEl.textContent = cfg.fontSize + 'px'; }
    const colorEl = get('ctrl-color');
    if (colorEl) colorEl.value = cfg.color || '#ffffff';
    const posEl = get('ctrl-position');
    if (posEl) posEl.value = cfg.position || 'bottom';
    const yOffsetEl = get('ctrl-yoffset');
    if (yOffsetEl) {
      yOffsetEl.value = cfg.yOffset || 0;
      const valEl = get('ctrl-yoffset-val');
      if (valEl) valEl.textContent = cfg.yOffset || 0;
    }
    const charsEl = get('ctrl-charsperline');
    if (charsEl) charsEl.value = cfg.charsPerLine || 0;
    const animEl = get('ctrl-animation');
    if (animEl) animEl.value = cfg.animation || 'pop';
    const upperEl = get('ctrl-upper');
    if (upperEl) upperEl.checked = !!cfg.uppercase;
  }

  // ══════════════════════════════════════════════════════
  // DETECTAR ORIENTACIÓN Y AJUSTAR LAYOUT
  // ══════════════════════════════════════════════════════
  function adjustLayout() {
    if (!_videoEl || !_overlayEl) return;

    const vw = _videoEl.videoWidth  || 16;
    const vh = _videoEl.videoHeight || 9;

    // Detectar orientación
    _orientation = vh > vw ? 'vertical' : 'horizontal';

    // Marcar el contenedor con data-orientation para CSS
    const container = _overlayEl.closest('.video-container') || _overlayEl.parentElement;
    if (container) {
      container.dataset.orientation = _orientation;
    }

    // Calcular fontSize auto-escalado basado en el ancho real del video renderizado
    const renderedWidth = _videoEl.clientWidth || container?.clientWidth || 400;
    const baseFontSize = _config.fontSize || 28;

    // Factor de escala: referencia 360px para vertical, 640px para horizontal
    const refWidth = _orientation === 'vertical' ? 360 : 640;
    const scaleFactor = Math.max(0.6, Math.min(2.0, renderedWidth / refWidth));

    // Para vertical: ajustar charsPerLine si está en automático
    let adjustedCharsPerLine = _config.charsPerLine || 0;
    if (_orientation === 'vertical' && adjustedCharsPerLine === 0) {
      adjustedCharsPerLine = Math.max(12, Math.round(renderedWidth / 24));
    }

    // Setear variables CSS en el contenedor para que clamp() las use
    if (container) {
      container.style.setProperty('--sub-scale', scaleFactor);
      container.style.setProperty('--video-ratio', (vw / vh).toFixed(3));
    }

    // Si el preset es automático en posición, ajustar según orientación
    // (el usuario puede sobreescribir manualmente)
    return { orientation: _orientation, scaleFactor, renderedWidth, videoW: vw, videoH: vh };
  }

  // ══════════════════════════════════════════════════════
  // APLICAR ESTILOS
  // ══════════════════════════════════════════════════════
  function _applyPreset(key) {
    _activePreset = key;
    _config = { ...PRESETS[key] };

    document.querySelectorAll('.preset-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === key);
    });

    _syncControls(_config);
    _applyToOverlay(_config);
  }

  function _override(overrides) {
    _config = { ..._config, ...overrides };
    _applyToOverlay(_config);
  }

  function _applyToOverlay(cfg) {
    if (!_overlayEl) return;

    // ── Posición: usar data-attr en vez de !important inline ──
    _overlayEl.dataset.pos = cfg.position || 'bottom';

    // Si hay texto activo, re-render para aplicar los nuevos estilos al span
    if (_overlayEl.children.length > 0) {
      const currentText = _overlayEl.querySelector('.subtitle-text')?.textContent || '';
      if (currentText) _renderSubtitleText(currentText, cfg.animation);
    }
  }

  // ══════════════════════════════════════════════════════
  // SYNC CON VIDEO
  // ══════════════════════════════════════════════════════
  function _startVideoSync() {
    if (!_videoEl || !_overlayEl) return;

    _videoEl.addEventListener('timeupdate', () => {
      const t      = _videoEl.currentTime;
      const active = _entries.find(e => t >= e.startSec && t <= e.endSec);
      const curIdx = active ? active._uid : -1;

      if (curIdx !== _lastSubIdx) {
        _lastSubIdx = curIdx;

        // Highlight entry row
        document.querySelectorAll('.entry-row').forEach(r => r.classList.remove('entry-active'));
        if (active) {
          const row = document.getElementById(`erow-${active._uid}`);
          if (row) {
            row.classList.add('entry-active');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }

        // Actualizar overlay
        if (active) {
          const text = _config.uppercase
            ? active.text.toUpperCase()
            : active.text;
          _renderSubtitleText(text, _config.animation);
        } else {
          _overlayEl.innerHTML = '';
        }
      }
    });

    // Recalculate on container resize
    const container = _overlayEl.closest('.video-container');
    if (container && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        adjustLayout();
        if (_lastSubIdx >= 0) {
          _applyToOverlay(_config);
        }
      });
      ro.observe(container);
    }
  }

  function _renderSubtitleText(text, animation = 'pop') {
    if (!_overlayEl) return;
    _overlayEl.innerHTML = '';
    void _overlayEl.offsetWidth;

    const span = document.createElement('span');
    span.className = `subtitle-text sub-anim-${animation}`;
    span.textContent = text;

    const cfg = _config;
    const hasBg = cfg.bgColor && cfg.bgColor !== 'transparent';

    // Calcular fontSize escalado según orientación
    const layout = adjustLayout();
    const scale = layout?.scaleFactor || 1;
    const scaledSize = Math.round(cfg.fontSize * scale);

    span.style.setProperty('--sub-color', cfg.color || '#ffffff');
    span.style.setProperty('--sub-shadow', cfg.shadow || 'none');
    span.style.setProperty('--sub-bg', hasBg ? cfg.bgColor : 'transparent');
    span.style.setProperty('--sub-font', cfg.fontFamily);
    span.style.setProperty('--sub-size', scaledSize + 'px');
    span.style.setProperty('--sub-tracking', (cfg.letterSpacing || 0) + 'px');
    span.style.setProperty('--sub-leading', cfg.lineHeight || 1.2);
    span.style.setProperty('--sub-maxw', cfg.maxWidth || '80%');

    if (cfg.uppercase) span.classList.add('sub-upper');

    _overlayEl.appendChild(span);
  }

  // ══════════════════════════════════════════════════════
  // EXPORT SRT
  // ══════════════════════════════════════════════════════
  function exportSRT() {
    return _entries
      .map((e, i) => `${i + 1}\n${e.start} --> ${e.end}\n${e.text}`)
      .join('\n\n') + '\n';
  }

  // ══════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════
  function _notifyChange() {
    if (_onSRTChange) _onSRTChange(exportSRT());
  }

  function _secToMMSS(sec) {
    if (!sec && sec !== 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function _escHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── API pública ──────────────────────────────────────
  function getBurnConfig() {
    const layout = adjustLayout();
    return {
      fontSize: _config.fontSize || 28,
      color: _config.color || '#FFFFFF',
      stroke: _config.stroke || 'transparent',
      strokeW: _config.strokeW || 0,
      shadow: _config.shadow || 'none',
      position: _config.position || 'center',
      bgColor: _config.bgColor || 'transparent',
      fontFamily: _config.fontFamily || 'Arial',
      uppercase: _config.uppercase || false,
      charsPerLine: _config.charsPerLine || 20,
      yOffset: _config.yOffset || 0,
      xOffset: _config.xOffset || 0,
      orientation: _orientation,
      scaleFactor: layout?.scaleFactor || 1,
    };
  }

  return { init, exportSRT, adjustLayout, get config() { return _config; }, get orientation() { return _orientation; }, getBurnConfig };

})();

window.SubtitleEditor = SubtitleEditor;
console.log('[editor.js] ✓ Editor de subtítulos cargado.');
