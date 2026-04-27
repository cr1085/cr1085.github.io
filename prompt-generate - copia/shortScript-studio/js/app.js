/**
 * ShortScript Studio — Main App Entry
 * Bootstraps all modules and wires up global events.
 */

import { Config }         from './config/config.js';
import { StorageManager } from './utils/storage.js';
import { ToastManager }   from './utils/toast.js';
import { ModalManager }   from './utils/modal.js';
import { ApiClient }   from './modules/api-client.js';
import { UIController }   from './modules/ui-controller.js';
import { PromptBuilder }  from './modules/prompt-builder.js';
import { ScriptGenerator }from './modules/script-generator.js';
import { SubtitleGen }    from './modules/subtitle-gen.js';
import { AudioGen }       from './modules/audio-gen.js';
import { ZipExporter }    from './modules/zip-exporter.js';
import { CommunityHub }   from './modules/community-hub.js';
import { HookLibrary }    from './modules/hook-library.js';
import { TemplateManager }from './modules/template-manager.js';

class App {
  constructor() {
    this.config    = new Config();
    this.storage   = new StorageManager();
    this.toast     = new ToastManager();
    this.modal     = new ModalManager();
    this.api      = new ApiClient(this.storage);
    this.ui        = new UIController(this.toast);
    this.promptBuilder  = new PromptBuilder();
    this.scriptGen      = new ScriptGenerator(this.storage, this.toast);
    this.subtitleGen    = new SubtitleGen();
    this.audioGen       = new AudioGen(this.storage, this.toast);
    this.zipExporter    = new ZipExporter(this.toast);
    this.community = new CommunityHub(this.api, this.toast);
    this.hookLib        = new HookLibrary();
    this.templateMgr    = new TemplateManager();

    /** Generated scripts store */
    this.generatedScripts = [];
    this.generatedAudios  = {};

    this.sessionCount = 0;
  }

  async init() {
    // Render sidebar data
    this.hookLib.render();
    this.templateMgr.render(this.applyTemplate.bind(this));

    // Load community prompts silently (non-blocking)
    this.community.load().catch(() => {});

    // Wire up all events
    this._bindEvents();

    console.log('%cShortScript Studio ✓', 'color:#00FF94;font-weight:bold;font-size:16px');
  }

  /** ── Event Binding ── */
  _bindEvents() {
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
    document.getElementById('btn-generate')
      .addEventListener('click', () => this._handleGenerate());

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

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop')
      .forEach(backdrop => {
        backdrop.addEventListener('click', e => {
          if (e.target === backdrop) this.modal.closeAll();
        });
      });
  }

  /** ── Core: Generate Scripts ── */
  async _handleGenerate() {
    const topic = document.getElementById('input-topic').value.trim();
    if (!topic) {
      this.toast.show('⚠️ Escribe un tema para continuar', 'warn');
      document.getElementById('input-topic').focus();
      return;
    }

    const params = this._collectParams();
    const prompt = this.promptBuilder.build(params);

    this.ui.setGenerating(true);

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
      });

      // Show results section
      document.getElementById('results-section').classList.remove('hidden');
      document.getElementById('results-section')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });

      this.sessionCount++;
      document.getElementById('session-count').textContent = this.sessionCount;

      this.toast.show(`✓ ${scripts.length} guiones generados`, 'success');
    } catch (err) {
      console.error(err);
      this.toast.show('Error generando guiones: ' + err.message, 'error');
    } finally {
      this.ui.setGenerating(false);
    }
  }

  /** ── Core: Generate Audios ── */
  async _handleGenerateAudio() {
    if (!this.generatedScripts.length) {
      this.toast.show('Primero genera guiones', 'warn');
      return;
    }

    const progress = document.getElementById('audio-progress');
    const bar      = document.getElementById('audio-progress-bar');
    const label    = document.getElementById('audio-progress-label');
    progress.classList.remove('hidden');
    bar.style.width = '0%';

    const total = this.generatedScripts.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
      try {
        this.toast.show(`Generando audio ${i + 1}/${total}...`, 'info', 2000);
        
        const blob = await this.audioGen.synthesize(this.generatedScripts[i].narration);
        this.generatedAudios[i] = blob;
        this.ui.attachAudioPlayer(i, blob);
        
        completed++;
        const percent = Math.round((completed / total) * 100);
        bar.style.width = `${percent}%`;
        if (label) label.textContent = `${completed}/${total}`;
        
      } catch (e) {
        console.warn(`Audio ${i} failed:`, e.message);
        this.generatedAudios[i] = null;
      }
    }

    bar.style.width = '100%';
    setTimeout(() => progress.classList.add('hidden'), 1500);
    this.toast.show(`🎙️ ${completed} audios generados`, 'success');
  }

  /** ── Core: Download ZIP ── */
  async _handleDownloadZip() {
    if (!this.generatedScripts.length) {
      this.toast.show('Primero genera guiones', 'warn');
      return;
    }

    const topic = document.getElementById('input-topic').value.trim();

    await this.zipExporter.export({
      topic,
      scripts: this.generatedScripts,
      audios:  this.generatedAudios,
    });
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
      // Already generated, UI handles playback
      return;
    }
    try {
      const blob = await this.audioGen.synthesize(this.generatedScripts[idx].narration);
      this.generatedAudios[idx] = blob;
      this.ui.attachAudioPlayer(idx, blob);
    } catch (e) {
      this.toast.show('Error al generar audio: ' + e.message, 'error');
    }
  }

  /** ── Collect all form params ── */
  _collectParams() {
    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    };
    
    const structure = getVal('input-structure', 'hook-fact-cta');
    return {
      topic:         getVal('input-topic').trim(),
      niche:         getVal('input-niche').trim(),
      count:         parseInt(getVal('input-count', '5')) || 5,
      duration:      parseInt(getVal('input-duration', '30')) || 30,
      structure,
      customStructure: structure === 'custom'
        ? getVal('input-custom-structure').trim()
        : null,
      tone:          this.ui.getActiveTones(),
      language:      getVal('input-language', 'es'),
      customHook:    getVal('input-custom-hook').trim(),
      customCta:     getVal('input-custom-cta').trim(),
      avoidWords:    getVal('input-avoid-words').trim(),
      extraContext:  getVal('input-extra-context').trim(),
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
}

// ── Bootstrap ──
const app = new App();
app.init().catch(console.error);
