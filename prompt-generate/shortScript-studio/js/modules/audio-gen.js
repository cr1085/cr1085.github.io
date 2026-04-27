/**
 * audio-gen.js
 * Text-to-speech generation.
 * Priority: Puter.js (free, neural) > OpenAI TTS > ElevenLabs > Kokoro > Web Speech
 */

import { kokoroInstance } from './kokoro-tts.js';

export class AudioGen {
  constructor(storage, toast) {
    this.storage = storage;
    this.toast   = toast;
    this.kokoro  = kokoroInstance;
  }

  /**
   * Synthesize text to audio.
   * @param {string} text
   * @returns {Promise<Blob>}
   */
  async synthesize(text) {
    console.log('[AudioGen] synthesize() para', text.length, 'caracteres');

    // 0. Puter.js (free, neural voices, no API key)
    try {
      const blob = await this._puterTTS(text);
      if (blob && blob.size > 1000) {
        console.log('[AudioGen] ✓ Puter.js exitoso, size:', blob.size);
        return blob;
      }
    } catch (err) {
      console.warn('[AudioGen] Puter.js falló:', err.message);
      this.toast.show('Puter.js: ' + err.message + '. Probando otros métodos...', 'warn', 4000);
    }

    // 1. OpenAI TTS (requires API key)
    const oaiKey = this.storage.getKey('openai');
    if (oaiKey) {
      try {
        const blob = await this._openAiTTS(text, oaiKey);
        if (blob && blob.size > 1000) return blob;
      } catch (err) {
        console.warn('[AudioGen] OpenAI TTS falló:', err.message);
      }
    }

    // 2. ElevenLabs (requires API key)
    const elKey = this.storage.getKey('elevenlabs');
    if (elKey) {
      try {
        const blob = await this._elevenLabs(text, elKey);
        if (blob && blob.size > 1000) return blob;
      } catch (err) {
        console.warn('[AudioGen] ElevenLabs falló:', err.message);
      }
    }

    // 3. Kokoro TTS (free, browser-based, no API key)
    try {
      const blob = await this._kokoroTTS(text);
      if (blob && blob.size > 1000) return blob;
    } catch (err) {
      console.warn('[AudioGen] Kokoro falló:', err.message);
    }

    // 4. Web Speech API (always available, speaks + returns placeholder)
    try {
      this._speakInBrowser(text);
      this.toast.show('🔊 Usando voz del navegador (sin descarga de audio)', 'info', 4000);
    } catch (err) {
      console.warn('[AudioGen] Web Speech falló:', err.message);
    }

    return this._buildPlaceholderWav(text);
  }

  // ── 0. Puter.js TTS (free, neural voices, no API key) ──
  async _puterTTS(text) {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js no cargado');
    }

    this.toast.show('🎤 Generando audio con Puter.js (neural)...', 'info', 3000);
    console.log('[AudioGen] Puter.js TTS iniciado');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout - Puter.js tardó demasiado (>30s)'));
      }, 30000);

      const lang = this._detectLangForPuter(text);

      puter.ai.txt2speech(text, {
        language: lang,
        engine: 'neural',
      }).then(audioEl => {
        clearTimeout(timeout);
        console.log('[AudioGen] Puter.js audio element recibido, src:', audioEl?.src);

        if (!audioEl || !audioEl.src) {
          reject(new Error('Puter.js no devolvió audio válido'));
          return;
        }

        fetch(audioEl.src)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then(blob => {
            console.log('[AudioGen] Puter.js blob size:', blob.size);
            if (blob.size < 1000) {
              reject(new Error('Audio generado demasiado pequeño'));
              return;
            }
            audioEl.play().catch(() => {});
            resolve(blob);
          })
          .catch(err => {
            console.error('[AudioGen] Error fetching Puter blob:', err);
            reject(err);
          });

      }).catch(err => {
        clearTimeout(timeout);
        console.error('[AudioGen] Puter.js error:', err);
        reject(err);
      });
    });
  }

  _detectLangForPuter(text) {
    const esChars = (text.match(/[áéíóúüñ¡¿]/gi) || []).length;
    const ptChars = (text.match(/[ãõç]/gi) || []).length;
    if (ptChars > esChars && ptChars > 1) return 'pt-BR';
    if (esChars > 0) return 'es-ES';
    return 'en-US';
  }

  // ── 1. OpenAI TTS (requires API key) ──
  async _openAiTTS(text, apiKey) {
    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:           'tts-1',
        input:           text,
        voice:           'nova',
        response_format: 'mp3',
        speed:           1.0,
      }),
    });

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `HTTP ${resp.status}`);
    }

    const blob = await resp.blob();
    if (blob.size < 500) throw new Error('Blob vacío de OpenAI TTS');
    return blob;
  }

  // ── 2. ElevenLabs (requires API key) ──
  async _elevenLabs(text, apiKey) {
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':   apiKey,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id:       'eleven_multilingual_v2',
          voice_settings: { stability: 0.45, similarity_boost: 0.80 },
        }),
      }
    );

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      throw new Error(errJson?.detail?.message || `HTTP ${resp.status}`);
    }

    const blob = await resp.blob();
    if (blob.size < 500) throw new Error('Blob vacío de ElevenLabs');
    return blob;
  }

  // ── 3. Kokoro TTS (free, browser-based, no API key) ──
  async _kokoroTTS(text) {
    this.toast.show('🎤 Generando audio con Kokoro…', 'info', 2000);

    const loaded = await this.kokoro.load(25000);
    if (!loaded) {
      throw new Error('Kokoro no disponible');
    }

    return await this.kokoro.generateBlob(text, 'af_heart');
  }

  // ── 4. Web Speech API (browser fallback, speaks only) ──
  _speakInBrowser(text) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = this._detectLang(text);
    utter.rate = 0.92;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const lang = utter.lang.split('-')[0];
    const voice =
      voices.find(v => v.lang === utter.lang && !v.localService) ||
      voices.find(v => v.lang.startsWith(lang) && !v.localService) ||
      voices.find(v => v.lang.startsWith(lang)) || null;

    if (voice) utter.voice = voice;
    speechSynthesis.speak(utter);
  }

  // ── 5. WAV placeholder with embedded text ──
  _buildPlaceholderWav(text) {
    const note = [
      'AUDIO PLACEHOLDER — Audio generado con voz del navegador.',
      '',
      'Texto del guion:',
      '──────────────────────────────────────────────────────────',
      text.substring(0, 1000) + (text.length > 1000 ? '...' : ''),
      '──────────────────────────────────────────────────────────',
    ].join('\n');

    const noteBytes = new TextEncoder().encode(note);
    const notePadded = noteBytes.length + (noteBytes.length % 2);

    const sampleRate = 22050;
    const numSamples = sampleRate;
    const pcmSize = numSamples * 2;

    const listPayload = 4 + 4 + 4 + notePadded;
    const riffPayload = 4 + 24 + (8 + pcmSize) + (8 + listPayload);

    const buf = new ArrayBuffer(8 + riffPayload);
    const view = new DataView(buf);
    let p = 0;

    const w4 = (s) => { for (let i = 0; i < 4; i++) view.setUint8(p++, s.charCodeAt(i)); };
    const u16 = (v) => { view.setUint16(p, v, true); p += 2; };
    const u32 = (v) => { view.setUint32(p, v, true); p += 4; };

    w4('RIFF'); u32(riffPayload); w4('WAVE');
    w4('fmt '); u32(16);
    u16(1); u16(1); u32(sampleRate); u32(sampleRate * 2); u16(2); u16(16);
    w4('data'); u32(pcmSize);
    p += pcmSize;
    w4('LIST'); u32(listPayload);
    w4('INFO'); w4('ICMT'); u32(notePadded);
    noteBytes.forEach(b => view.setUint8(p++, b));
    if (noteBytes.length % 2 !== 0) p++;

    return new Blob([buf], { type: 'audio/wav' });
  }

  _detectLang(text) {
    const esChars = (text.match(/[áéíóúüñ¡¿]/gi) || []).length;
    const ptChars = (text.match(/[ãõç]/gi) || []).length;
    if (ptChars > esChars && ptChars > 1) return 'pt-BR';
    if (esChars > 0) return 'es-ES';
    return 'en-US';
  }
}
