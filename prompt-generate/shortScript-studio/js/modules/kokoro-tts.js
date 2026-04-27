/**
 * kokoro-tts.js - Wrapper for Kokoro TTS (free, open-source, runs in browser)
 * Uses WebGPU/WASM via Transformers.js - no API keys needed
 */

export class KokoroTTS {
  constructor() {
    this.tts = null;
    this.loaded = false;
    this.loading = false;
    this.loadPromise = null;
  }

  async load(timeoutMs = 30000) {
    if (this.loaded) return true;
    
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loading = true;
    
    this.loadPromise = new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.loading = false;
        this.loadPromise = null;
        reject(new Error('Timeout cargando modelo Kokoro (30s). Verifica tu conexión a internet.'));
      }, timeoutMs);

      try {
        console.log('Cargando Kokoro TTS desde jsdelivr...');
        const { KokoroTTS } = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
        
console.log('Descargando modelo ONNX desde HuggingFace (esto puede tomar un momento)...');
        
        this.tts = await KokoroTTS.from_pretrained(
          'onnx-community/Kokoro-82M-v1.0-ONNX',
          {
            dtype: 'q8',
            device: 'wasm',
          }
        );
        
        console.log('Modelo Kokoro TTS inicializado correctamente');

        clearTimeout(timeout);
        this.loaded = true;
        this.loading = false;
        console.log('Kokoro TTS cargado correctamente');
        resolve(true);
      } catch (err) {
        clearTimeout(timeout);
        this.loading = false;
        this.loadPromise = null;
        console.error('Error cargando Kokoro TTS:', err);
        reject(err);
      }
    });

    return this.loadPromise;
  }

  listVoices() {
    if (!this.tts) return [];
    return this.tts.list_voices();
  }

  async generate(text, voice = 'af_heart') {
    if (!this.tts) {
      throw new Error('Kokoro TTS no cargado');
    }

    const audio = await this.tts.generate(text, { voice });
    return audio;
  }

  async generateBlob(text, voice = 'af_heart') {
    const audio = await this.generate(text, voice);
    const wavData = audio.toWav();
    return new Blob([wavData], { type: 'audio/wav' });
  }
}

export const kokoroInstance = new KokoroTTS();