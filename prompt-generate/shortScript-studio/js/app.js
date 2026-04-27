/**
 * ShortScript Studio — Main App Entry
 * Bootstraps all modules and wires up global events.
 */

import { Config }         from './config/config.js';
import { StorageManager } from './utils/storage.js';
import { ToastManager }   from './utils/toast.js';
import { ModalManager }   from './utils/modal.js';
import { SupabaseClient } from './modules/supabase-client.js';
import { UIController }   from './modules/ui-controller.js';
import { PromptBuilder }  from './modules/prompt-builder.js';
import { ScriptGenerator } from './modules/script-generator.js';
import { SubtitleGen }    from './modules/subtitle-gen.js';
import { AudioGen }       from './modules/audio-gen.js';
import { AudioRecorder }  from './modules/audio-recorder.js';
import { ZipExporter }    from './modules/zip-exporter.js';
import { CommunityHub }   from './modules/community-hub.js';
import { HookLibrary }    from './modules/hook-library.js';
import { TemplateManager } from './modules/template-manager.js';

export class App {
  constructor() {
    this.config    = new Config();
    this.storage   = new StorageManager();
    this.toast     = new ToastManager();
    this.modal     = new ModalManager();
    this.supabase  = new SupabaseClient(this.storage);
    this.ui        = new UIController(this.toast);
    this.promptBuilder  = new PromptBuilder();
    this.scriptGen      = new ScriptGenerator(this.storage, this.toast);
    this.subtitleGen    = new SubtitleGen();
    this.audioGen       = new AudioGen(this.storage, this.toast);
    this.audioRecorder  = new AudioRecorder();
    this.zipExporter    = new ZipExporter(this.toast);
    this.community      = new CommunityHub(this.supabase, this.toast);
    this.hookLib        = new HookLibrary();
    this.templateMgr    = new TemplateManager();

    /** Generated scripts store */
    this.generatedScripts = [];
    this.generatedAudios  = {};
    this.recordedAudioBlobs = {};

    this.sessionCount = 0;
    this.currentRecordIndex = -1;
    this.currentRecordBlob = null;
  }

  async init() {
    // Load API keys from config
    this.ui.updateModeBadge(this.storage.getKey('openai'));

    // Render sidebar data
    this.hookLib.render();
    this.templateMgr.render(this.applyTemplate.bind(this));

    // Load community prompts (with Supabase if configured)
    await this.community.load();

    // Wire up all events
    this._bindEvents();

    // Show help modal on first visit
    const hasSeenHelp = this.storage.getKey('hasSeenHelp');
    if (!hasSeenHelp) {
      setTimeout(() => this.modal.open('help'), 1000);
      this.storage.setKey('hasSeenHelp', 'true');
    }

    console.log('%cShortScript Studio ✓', 'color:#00FF94;font-weight:bold;font-size:16px');
  }

  /** ── Event Binding ── */
  _bindEvents() {
    // Close modals
    document.querySelectorAll('.modal-close')
      .forEach(btn => btn.addEventListener('click', () => this.modal.closeAll()));

    // Structure select → show/hide custom textarea
    document.getElementById('input-structure')
      .addEventListener('change', e => {
        const wrap = document.getElementById('custom-structure-wrap');
        wrap.classList.toggle('hidden', e.target.value !== 'custom');
      });

    // Advanced options toggle
    document.getElementById('btn-toggle-advanced')
      .addEventListener('click', () => {
        const panel = document.getElementById('advanced-options');
        const btn   = document.getElementById('btn-toggle-advanced');
        const isHidden = panel.classList.toggle('hidden');
        btn.textContent = isHidden ? 'Mostrar ▾' : 'Ocultar ▴';
      });

    // Generate button
    const btnGen = document.getElementById('btn-generate');
    btnGen.addEventListener('click', () => {
      console.log('[App] Generate button clicked');
      this._handleGenerate();
    });

    // Regenerate
    document.getElementById('btn-regen')
      .addEventListener('click', () => this._handleGenerate());

    // Generate audios
    document.getElementById('btn-gen-audio')
      .addEventListener('click', () => this._handleGenerateAudio());

    // Download ZIP
    document.getElementById('btn-download-zip')
      .addEventListener('click', () => this._handleDownloadZip());

    // Refresh hook library
    document.getElementById('btn-refresh-hooks')
      .addEventListener('click', () => this.hookLib.refresh());

    // Share prompt modal
    document.getElementById('btn-share-prompt')
      .addEventListener('click', () => this.modal.open('share'));
    document.getElementById('btn-submit-share')
      .addEventListener('click', () => this._handleSharePrompt());

    // Help modal
    document.getElementById('btn-help')
      .addEventListener('click', () => this.modal.open('help'));

    // Recording
    document.getElementById('btn-record-voice')
      .addEventListener('click', () => {
        if (this.generatedScripts.length === 0) {
          this.toast.show('⚠️ Genera guiones primero', 'warn');
          return;
        }
        this._populateScriptSelector();
        this.currentRecordIndex = 0;
        this._prepareForRecording();
        this.modal.open('record');
      });
    document.getElementById('btn-start-record')
      .addEventListener('click', () => this._handleStartRecord());
    document.getElementById('btn-stop-record')
      .addEventListener('click', () => this._handleStopRecord());
    document.getElementById('btn-pause-record')
      .addEventListener('click', () => this._handlePauseRecord());
    document.getElementById('btn-cancel-record')
      .addEventListener('click', () => this._handleCancelRecord());
    document.getElementById('btn-save-record')
      .addEventListener('click', () => this._handleSaveRecord());
    document.getElementById('btn-discard-record')
      .addEventListener('click', () => this._handleDiscardRecord());
    document.getElementById('btn-next-script')
      .addEventListener('click', () => this._handleNextScriptRecord());
    document.getElementById('btn-finish-recording')
      .addEventListener('click', () => this._handleFinishRecording());
    document.getElementById('record-script-select')
      .addEventListener('change', (e) => this._handleScriptSelect(e));
    document.getElementById('btn-toggle-teleprompter')
      .addEventListener('click', () => this._handleToggleTeleprompter());

    // Filter inputs
    this._bindFilterEvents();

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop')
      .forEach(backdrop => {
        backdrop.addEventListener('click', e => {
          if (e.target === backdrop) this.modal.closeAll();
        });
      });

    // Script card audio actions (event delegation)
    document.getElementById('scripts-grid').addEventListener('click', e => {
      const removeBtn = e.target.closest('.remove-audio-btn');
      if (removeBtn) {
        const idx = parseInt(removeBtn.dataset.idx);
        this._removeAudio(idx);
        return;
      }
      const regenBtn = e.target.closest('.regenerate-audio-btn');
      if (regenBtn) {
        const idx = parseInt(regenBtn.dataset.idx);
        this._playSingleAudio(idx);
      }
    });
  }

  /** ── Core: Generate Scripts ── */
  async _handleGenerate() {
    console.log('[App] _handleGenerate called');
    const topic = document.getElementById('input-topic').value.trim();
    if (!topic) {
      this.toast.show('⚠️ Escribe un tema para continuar', 'warn');
      document.getElementById('input-topic').focus();
      return;
    }

    const params = this._collectParams();
    const prompt = this.promptBuilder.build(params);

    this.ui.setGenerating(true);
    this._showLoader('generate');

    try {
      const scripts = await this.scriptGen.generate(prompt, params);
      this.generatedScripts = scripts;
      this.generatedAudios  = {};

      // Enrich each script with subtitles + hashtags
      scripts.forEach((script, i) => {
        script.subtitles = this.subtitleGen.generate(script.narration, params.duration);
        scripts[i] = script;
      });

      this.ui.renderScripts(scripts, {
        onTabChange:   (cardEl, tab)   => this._onTabChange(cardEl, tab),
        onCopyScript:  (script)        => this._copyToClipboard(script.narration),
        onPlayAudio:   (idx)           => this._playSingleAudio(idx),
      }, this.generatedAudios);

      // Show results section
      document.getElementById('results-section').classList.remove('hidden');
      document.getElementById('results-section')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });

      this.sessionCount++;
      document.getElementById('session-count').textContent = this.sessionCount;

      this._hideLoader('generate');
      this.toast.show(`✓ ${scripts.length} guiones generados`, 'success');
    } catch (err) {
      console.error(err);
      this._hideLoader('generate');
      this.toast.show('Error generando guiones: ' + err.message, 'error');
    } finally {
      this.ui.setGenerating(false);
      this._hideLoader('generate');
    }
  }

  /** ── Loader Helpers ── */
  _showLoader(type) {
    const loader = document.getElementById(`loader-${type}`);
    if (loader) {
      loader.style.display = 'flex';
      if (type === 'generate' && window.showLoader) {
        window.showLoader();
      }
    }
  }

  _hideLoader(type) {
    const loader = document.getElementById(`loader-${type}`);
    if (loader) {
      loader.style.display = 'none';
      if (type === 'generate' && window.hideLoader) {
        window.hideLoader();
      }
    }
  }

  /** ── Core: Generate Audios ── */
  async _handleGenerateAudio() {
    console.log('[App] _handleGenerateAudio iniciado');
    if (!this.generatedScripts.length) {
      this.toast.show('Primero genera guiones', 'warn');
      return;
    }

    const progress = document.getElementById('audio-progress');
    const bar      = document.getElementById('audio-progress-bar');
    progress.classList.remove('hidden');

    const total = this.generatedScripts.length;
    console.log('[App] Generando', total, 'audios...');
    
    for (let i = 0; i < total; i++) {
      console.log('[App] Generando audio', i + 1, 'de', total);
      bar.style.width = `${Math.round((i / total) * 100)}%`;
      try {
        const blob = await this.audioGen.synthesize(this.generatedScripts[i].narration);
        console.log('[App] Audio', i, 'generado, size:', blob?.size);
        this.generatedAudios[i] = blob;
        this.ui.attachAudioPlayer(i, blob, true);
      } catch (e) {
        console.error('[App] Audio', i, 'falló:', e.message);
        this.toast.show(`Audio ${i+1}: ${e.message}`, 'error', 5000);
      }
    }

    bar.style.width = '100%';
    setTimeout(() => progress.classList.add('hidden'), 1500);
    this._refreshAudioIndicators();
    this.toast.show('🎙️ Audios generados', 'success');
  }

  /** ── Core: Download ZIP ── */
  async _handleDownloadZip() {
    if (!this.generatedScripts.length) {
      this.toast.show('Primero genera guiones', 'warn');
      return;
    }

    const topic = document.getElementById('input-topic').value.trim();
    this._showLoader('zip');

    const allAudios = { ...this.generatedAudios, ...this.recordedAudioBlobs };
    try {
      await this.zipExporter.export({
        topic,
        scripts: this.generatedScripts,
        audios:  allAudios,
      });
    } finally {
      this._hideLoader('zip');
    }
  }

  /** ── Tab change in script card ── */
  _onTabChange(cardEl, tab) {
    cardEl.querySelectorAll('.script-tab').forEach(t => t.classList.remove('active'));
    cardEl.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    cardEl.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    cardEl.querySelector(`[data-pane="${tab}"]`).classList.add('active');
  }

  /** ── Play single audio (TTS inline) ── */
  async _playSingleAudio(idx) {
    if (this.generatedAudios[idx]) {
      return;
    }
    try {
      const blob = await this.audioGen.synthesize(this.generatedScripts[idx].narration);
      this.generatedAudios[idx] = blob;
      this.ui.attachAudioPlayer(idx, blob, true);
      this._refreshAudioIndicators();
    } catch (e) {
      this.toast.show('Error al generar audio: ' + e.message, 'error');
    }
  }

  /** ── Remove audio from script ── */
  _removeAudio(idx) {
    if (!this.generatedAudios[idx]) return;
    delete this.generatedAudios[idx];
    const pane = document.getElementById(`audio-pane-${idx}`);
    if (pane) {
      pane.innerHTML = `
        <div class="text-ash text-sm flex items-center gap-3">
          <button class="btn-primary text-sm py-1.5 px-4 generate-audio-btn" data-idx="${idx}">
            🎙️ Generar audio
          </button>
          <span class="text-xs">o usa el botón "Generar Audios" arriba</span>
        </div>
      `;
      pane.querySelector('.generate-audio-btn').addEventListener('click', () => this._playSingleAudio(idx));
    }
    this._refreshAudioIndicators();
    this.toast.show('Audio eliminado', 'success');
  }

  /** ── Refresh audio indicators in headers ── */
  _refreshAudioIndicators() {
    document.querySelectorAll('.script-card').forEach(card => {
      const idx = parseInt(card.dataset.idx);
      const hasAudio = !!this.generatedAudios[idx];
      const header = card.querySelector('.script-card-header');
      const existing = header.querySelector('.text-green');
      if (hasAudio && !existing) {
        const indicator = document.createElement('span');
        indicator.className = 'text-green text-xs ml-2';
        indicator.title = 'Audio disponible';
        indicator.textContent = '🔊';
        header.insertBefore(indicator, header.querySelector('.flex'));
      } else if (!hasAudio && existing) {
        existing.remove();
      }
    });
  }

  /** ── Collect all form params ── */
  _collectParams() {
    const structure = document.getElementById('input-structure').value;
    return {
      topic:         document.getElementById('input-topic').value.trim(),
      niche:         document.getElementById('input-niche').value.trim(),
      count:         parseInt(document.getElementById('input-count').value),
      duration:      parseInt(document.getElementById('input-duration').value),
      structure,
      customStructure: structure === 'custom'
        ? document.getElementById('input-custom-structure').value.trim()
        : null,
      tone:          this.ui.getActiveTones(),
      language:      document.getElementById('input-language').value,
      customHook:    document.getElementById('input-custom-hook').value.trim(),
      customCta:     document.getElementById('input-custom-cta').value.trim(),
      avoidWords:    document.getElementById('input-avoid-words').value.trim(),
      extraContext:  document.getElementById('input-extra-context').value.trim(),
    };
  }

  /** ── Apply template from sidebar ── */
  applyTemplate(template) {
    if (template.topic)     document.getElementById('input-topic').value = template.topic;
    if (template.niche)     document.getElementById('input-niche').value = template.niche;
    if (template.structure) document.getElementById('input-structure').value = template.structure;
    if (template.customHook) document.getElementById('input-custom-hook').value = template.customHook;
    if (template.cta)       document.getElementById('input-custom-cta').value = template.cta;
    this.toast.show('Plantilla aplicada ✓', 'success');
  }

  /** ── Share prompt to community ── */
  async _handleSharePrompt() {
    const name   = document.getElementById('share-name').value.trim();
    const niche  = document.getElementById('share-niche').value.trim();
    const prompt = document.getElementById('share-prompt-text').value.trim();

    if (!name || !prompt) {
      this.toast.show('Completa nombre y prompt', 'warn');
      return;
    }

    await this.community.share({ name, niche, prompt });
    this.modal.closeAll();
    document.getElementById('share-name').value    = '';
    document.getElementById('share-niche').value   = '';
    document.getElementById('share-prompt-text').value = '';
  }

  /** ── Copy text to clipboard ── */
  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.show('Copiado al portapapeles ✓', 'success');
    } catch {
      this.toast.show('No se pudo copiar', 'error');
    }
  }

  /** ── Voice Recording ── */
  async _handleStartRecord() {
    try {
      await this.audioRecorder.startRecording();
      this._updateRecordUI('recording');
      this.toast.show('🎙️ Grabando...', 'info');
    } catch (err) {
      this.toast.show('Error al grabar: ' + err.message, 'error');
    }
  }

  async _handleStopRecord() {
    try {
      const blob = await this.audioRecorder.stopRecording();
      this._updateRecordUI('stopped');
      this._showRecordPreview(blob);
      this.toast.show('✓ Grabación guardada', 'success');
    } catch (err) {
      this.toast.show('Error al detener: ' + err.message, 'error');
    }
  }

  _handlePauseRecord() {
    if (this.audioRecorder.isPaused) {
      this.audioRecorder.resumeRecording();
      document.getElementById('btn-pause-record').innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      document.getElementById('record-status').innerHTML = '<span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span> Grabando...';
    } else {
      this.audioRecorder.pauseRecording();
      document.getElementById('btn-pause-record').innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';
      document.getElementById('record-status').innerHTML = '<span class="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Pausado';
    }
  }

  _handleCancelRecord() {
    this.audioRecorder.cancelRecording();
    this._updateRecordUI('idle');
    this.toast.show('Grabación cancelada', 'warn');
  }

  _handleSaveRecord() {
    const preview = document.getElementById('record-audio-preview');
    if (preview.src && this.currentRecordIndex >= 0) {
      const blob = this.currentRecordBlob;
      this.recordedAudioBlobs[this.currentRecordIndex] = blob;
      this.generatedAudios[this.currentRecordIndex] = preview.src;
      this._updateScriptHasRecordingUI(this.currentRecordIndex, true);
      this.toast.show('✓ Voz guardada para guion ' + (this.currentRecordIndex + 1), 'success');
      document.getElementById('next-script-section').classList.remove('hidden');
    }
  }

  _handleNextScriptRecord() {
    if (this.currentRecordIndex < this.generatedScripts.length - 1) {
      this.currentRecordIndex++;
      this._prepareForRecording();
    } else {
      this.toast.show('✓ Todos los guiones tienen audio', 'success');
      this._handleFinishRecording();
    }
  }

  _handleFinishRecording() {
    this.modal.close('record');
    this._resetRecordUI();
    this._updateAudioButtonsState();
  }

  _handleScriptSelect(e) {
    const index = parseInt(e.target.value);
    if (!isNaN(index)) {
      this.currentRecordIndex = index;
      this._prepareForRecording();
    }
  }

  _handleToggleTeleprompter() {
    const section = document.getElementById('teleprompter-section');
    const text = document.getElementById('teleprompter-text');
    section.classList.toggle('hidden');
  }

  _prepareForRecording() {
    const select = document.getElementById('record-script-select');
    select.value = this.currentRecordIndex;
    
    if (this.generatedScripts[this.currentRecordIndex]) {
      const script = this.generatedScripts[this.currentRecordIndex];
      document.getElementById('teleprompter-text').textContent = script.narration;
      document.getElementById('teleprompter-section').classList.remove('hidden');
    }
    
    document.getElementById('next-script-section').classList.add('hidden');
    this._resetRecordUI();
  }

  _populateScriptSelector() {
    const select = document.getElementById('record-script-select');
    select.innerHTML = '<option value="">-- Selecciona un guion --</option>';
    
    this.generatedScripts.forEach((script, i) => {
      const hasAudio = this.recordedAudioBlobs[i] ? true : false;
      const title = script.title || `Guion ${i + 1}`;
      const option = document.createElement('option');
      option.value = i;
      option.textContent = hasAudio ? `✅ ${title}` : `📝 ${title}`;
      select.appendChild(option);
    });
  }

  _updateScriptHasRecordingUI(index, hasAudio) {
    this.ui.attachAudioPlayer(index, this.recordedAudioBlobs[index], true);
  }

  _updateAudioButtonsState() {
    const hasScripts = this.generatedScripts.length > 0;
    const btnRecord = document.getElementById('btn-record-voice');
    if (btnRecord) {
      btnRecord.disabled = !hasScripts;
      btnRecord.classList.toggle('opacity-50', !hasScripts);
    }
  }

  _updateRecordUI(state) {
    const startBtn = document.getElementById('btn-start-record');
    const stopBtn = document.getElementById('btn-stop-record');
    const pauseBtn = document.getElementById('btn-pause-record');
    const cancelBtn = document.getElementById('btn-cancel-record');
    const saveBtn = document.getElementById('btn-save-record');
    const discardBtn = document.getElementById('btn-discard-record');
    const status = document.getElementById('record-status');

    startBtn.classList.toggle('hidden', state !== 'idle');
    stopBtn.classList.toggle('hidden', state === 'idle' || state === 'stopped');
    pauseBtn.classList.toggle('hidden', state === 'idle' || state === 'stopped');
    cancelBtn.classList.toggle('hidden', state === 'idle' || state === 'stopped');
    saveBtn.classList.toggle('hidden', state !== 'stopped');
    discardBtn.classList.toggle('hidden', state !== 'stopped');

    if (state === 'idle') {
      status.innerHTML = '<span class="inline-block w-3 h-3 bg-ash rounded-full mr-2"></span> Presiona el botón para empezar a grabar';
    } else if (state === 'recording') {
      status.innerHTML = '<span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span> Grabando...';
    } else if (state === 'stopped') {
      status.innerHTML = '<span class="inline-block w-3 h-3 bg-neon rounded-full mr-2"></span> Grabación terminada';
    }
  }

  _showRecordPreview(blob) {
    const preview = document.getElementById('record-preview');
    const audio = document.getElementById('record-audio-preview');
    const url = URL.createObjectURL(blob);
    audio.src = url;
    this.currentRecordBlob = blob;
    preview.classList.remove('hidden');
  }

  _resetRecordUI() {
    this._updateRecordUI('idle');
    document.getElementById('record-preview').classList.add('hidden');
    document.getElementById('record-audio-preview').src = '';
    this.currentRecordBlob = null;
  }

  _bindFilterEvents() {
    const eqLow = document.getElementById('filter-eq-low');
    const eqLowVal = document.getElementById('eq-low-value');
    if (eqLow && eqLowVal) {
      eqLow.addEventListener('input', () => {
        eqLowVal.textContent = eqLow.value;
        this.audioRecorder.setFilters({ eqLow: parseInt(eqLow.value) });
      });
    }

    const eqMid = document.getElementById('filter-eq-mid');
    const eqMidVal = document.getElementById('eq-mid-value');
    if (eqMid && eqMidVal) {
      eqMid.addEventListener('input', () => {
        eqMidVal.textContent = eqMid.value;
        this.audioRecorder.setFilters({ eqMid: parseInt(eqMid.value) });
      });
    }

    const eqHigh = document.getElementById('filter-eq-high');
    const eqHighVal = document.getElementById('eq-high-value');
    if (eqHigh && eqHighVal) {
      eqHigh.addEventListener('input', () => {
        eqHighVal.textContent = eqHigh.value;
        this.audioRecorder.setFilters({ eqHigh: parseInt(eqHigh.value) });
      });
    }

    const compression = document.getElementById('filter-compression');
    if (compression) {
      compression.addEventListener('change', () => {
        this.audioRecorder.setFilters({ compression: compression.checked });
      });
    }

    const noise = document.getElementById('filter-noise');
    if (noise) {
      noise.addEventListener('change', () => {
        this.audioRecorder.setFilters({ noiseReduction: noise.checked });
      });
    }
  }
}

// ── Bootstrap ──
// Auto-init disabled - initialized via HTML after auth check
// const app = new App();
// app.init().catch(console.error);
