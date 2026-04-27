// ════════════════════════════════════════════════════════
// whisper.js — Transcripción LOCAL con Whisper via Transformers.js
// Corre 100% en el navegador del usuario. Sin costos de API.
// Modelo: openai/whisper-tiny  (~80MB, se cachea en el navegador)
// ════════════════════════════════════════════════════════

const WhisperEngine = (() => {

  let pipeline = null;
  let isLoading = false;
  let onProgressCallback = null;

  // ── Cargar Transformers.js via script dinámico ──────────────
  // Así no necesitamos type="module" en el HTML
  function importTransformers() {
    if (window.__transformers_promise) return window.__transformers_promise;

    window.__transformers_promise = new Promise((resolve, reject) => {
      // Si ya está cargado
      if (window.__transformers) {
        resolve(window.__transformers);
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import * as T from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
        window.__transformers = T;
        window.dispatchEvent(new Event('transformers-ready'));
      `;
      script.onerror = () => reject(new Error('No se pudo cargar Transformers.js'));
      document.head.appendChild(script);

      window.addEventListener('transformers-ready', () => resolve(window.__transformers), { once: true });
    });

    return window.__transformers_promise;
  }

  // ══════════════════════════════════════════════════
  // Cargar el modelo Whisper (solo la primera vez)
  // ══════════════════════════════════════════════════
  async function loadModel(onProgress) {
    if (pipeline) return pipeline; // Ya cargado
    if (isLoading) {
      // Esperar a que termine de cargar
      await new Promise(r => {
        const interval = setInterval(() => {
          if (!isLoading) { clearInterval(interval); r(); }
        }, 200);
      });
      return pipeline;
    }

    isLoading = true;
    onProgressCallback = onProgress;

    try {
      const { pipeline: createPipeline, env } = await importTransformers();

      // Usar caché del navegador para no re-descargar
      env.allowLocalModels = false;
      env.useBrowserCache  = true;

      if (onProgress) onProgress({ status: 'loading', message: 'Descargando modelo Whisper...', progress: 0 });

      pipeline = await createPipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-small',  // ~480MB — mucho más preciso que tiny, especialmente para español
        {
          progress_callback: (info) => {
            if (onProgress && info.status === 'progress') {
              const pct = Math.round(info.progress || 0);
              onProgress({
                status: 'downloading',
                message: `Descargando modelo: ${pct}%`,
                progress: pct,
                file: info.file
              });
            }
          }
        }
      );

      if (onProgress) onProgress({ status: 'ready', message: 'Modelo listo', progress: 100 });
      return pipeline;

    } finally {
      isLoading = false;
    }
  }

  // ══════════════════════════════════════════════════
  // Extraer audio de un File de video usando Web Audio API
  // ══════════════════════════════════════════════════
  async function extractAudioFromFile(file, onProgress) {
    if (onProgress) onProgress({ status: 'extracting', message: 'Extrayendo audio del video...', progress: 0 });

    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext({ sampleRate: 16000 }); // Whisper necesita 16kHz

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();

    // Whisper necesita mono a 16kHz — tomar el primer canal
    const channelData = audioBuffer.getChannelData(0);

    if (onProgress) onProgress({ status: 'extracting', message: 'Audio extraído correctamente', progress: 100 });

    return channelData;
  }

  // ══════════════════════════════════════════════════
  // Transcribir audio con Whisper local
  // ══════════════════════════════════════════════════
  async function transcribe(file, language = 'es', onProgress) {
    // 1. Cargar modelo (se cachea después de la primera descarga)
    const model = await loadModel(prog => {
      if (onProgress) onProgress({ ...prog, phase: 'model' });
    });

    // 2. Extraer audio del video
    const audioData = await extractAudioFromFile(file, prog => {
      if (onProgress) onProgress({ ...prog, phase: 'audio' });
    });

    if (onProgress) onProgress({ status: 'transcribing', message: 'Whisper está analizando el audio...', progress: 0, phase: 'transcribe' });

    // 3. Configurar opciones de transcripción anti-alucinación
    const options = {
      return_timestamps: true,
      chunk_length_s:    20,     // Chunks cortos = menos contexto = menos alucinación
      stride_length_s:   2,      // Overlap mínimo
      condition_on_previous_text: false,  // CRÍTICO: evita que Whisper repita texto previo
    };

    if (language && language !== 'auto') {
      options.language = language;
      options.task     = 'transcribe';
    }

    // 4. Ejecutar Whisper
    const result = await model(audioData, options);

    if (onProgress) onProgress({ status: 'done', message: '¡Transcripción completada!', progress: 100, phase: 'transcribe' });

    return result;
  }

  // ══════════════════════════════════════════════════
  // Convertir resultado de Whisper a SRT crudo
  // (post-procesamiento se hace en srt.js.postProcess)
  // ══════════════════════════════════════════════════
  function resultToSRT(result) {
    const chunks = result.chunks || [];

    if (!chunks.length) {
      if (result.text && result.text.trim()) {
        return `1\n00:00:00,000 --> 00:00:05,000\n${result.text.trim()}\n`;
      }
      return '';
    }

    return chunks
      .filter(chunk => chunk.text && chunk.text.trim())
      .map((chunk, i) => {
        const start = chunk.timestamp?.[0] ?? i * 3;
        const end   = chunk.timestamp?.[1] ?? (i + 1) * 3;
        return `${i + 1}\n${toSRTTime(start)} --> ${toSRTTime(end)}\n${chunk.text.trim().replace(/\s+/g, ' ')}`;
      })
      .join('\n\n') + '\n';
  }

  // ══════════════════════════════════════════════════
  // Función principal: video File → SRT string
  // ══════════════════════════════════════════════════
  async function generateSubtitles(file, language, onProgress) {
    try {
      const result = await transcribe(file, language, onProgress);
      const srt    = resultToSRT(result);

      if (!srt || !srt.trim()) {
        throw new Error('No se detectó audio con voz en el video.');
      }

      return srt;
    } catch (err) {
      console.error('[whisper.js] Error:', err);
      throw err;
    }
  }

  // ══════════════════════════════════════════════════
  // Helper: segundos → formato SRT  00:00:00,000
  // ══════════════════════════════════════════════════
  function toSRTTime(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const ms   = Math.round((seconds % 1) * 1000);
    const secs = Math.floor(seconds) % 60;
    const mins = Math.floor(seconds / 60) % 60;
    const hrs  = Math.floor(seconds / 3600);

    return [
      String(hrs).padStart(2, '0'),
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].join(':') + ',' + String(ms).padStart(3, '0');
  }

  // ══════════════════════════════════════════════════
  // Verificar si el navegador soporta WebAssembly
  // (requerido para Transformers.js)
  // ══════════════════════════════════════════════════
  function isSupported() {
    try {
      if (typeof WebAssembly !== 'object') return false;
      if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return false;
      return true;
    } catch {
      return false;
    }
  }

  return {
    generateSubtitles,
    loadModel,
    isSupported,
    toSRTTime,
    resultToSRT
  };

})();

window.WhisperEngine = WhisperEngine;
console.log('[whisper.js] ✓ Motor de transcripción local listo. WebAssembly:', WhisperEngine.isSupported() ? 'Soportado ✓' : 'NO soportado ✗');
