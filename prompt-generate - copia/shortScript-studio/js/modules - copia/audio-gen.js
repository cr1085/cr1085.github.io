/**
 * audio-gen.js
 * Text-to-speech generation.
 * Priority:
 *   1. ElevenLabs API (if key provided) — high quality voices
 *   2. Web Speech API (SpeechSynthesis) — built-in, always available
 */

export class AudioGen {
  constructor(storage, toast) {
    this.storage = storage;
    this.toast   = toast;
  }

  /**
   * Synthesize text to audio Blob
   * @param {string} text
   * @returns {Promise<Blob>}
   */
  async synthesize(text) {
    const elKey = this.storage.getKey('elevenlabs');

    if (elKey) {
      try {
        return await this._synthesizeElevenLabs(text, elKey);
      } catch (err) {
        console.warn('ElevenLabs failed, falling back to Web Speech:', err);
      }
    }

    return this._synthesizeWebSpeech(text);
  }

  /** ── ElevenLabs TTS ── */
  async _synthesizeElevenLabs(text, apiKey) {
    // Default voice: "Rachel" — change voiceId as needed
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':    apiKey,
          'Content-Type':  'application/json',
          'Accept':        'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id:          'eleven_multilingual_v2',
          voice_settings:    { stability: 0.5, similarity_boost: 0.85 },
        }),
      }
    );

    if (!resp.ok) throw new Error(`ElevenLabs error: ${resp.status}`);

    return await resp.blob();
  }

  /**
   * ── Web Speech API (SpeechSynthesis) ──
   * Records speech to AudioBuffer via AudioContext + MediaRecorder.
   * Falls back to a silent placeholder if recording isn't available.
   */
  async _synthesizeWebSpeech(text) {
    // Try to record via MediaRecorder
    if (
      typeof window.SpeechSynthesisUtterance !== 'undefined' &&
      typeof window.MediaRecorder !== 'undefined' &&
      typeof AudioContext !== 'undefined'
    ) {
      try {
        return await this._recordSpeech(text);
      } catch {
        // silently fall through
      }
    }

    // Minimal fallback: just speak (no blob returned)
    this._speakOnly(text);
    return this._createSilentBlob();
  }

  /** Record speech synthesis output */
  _recordSpeech(text) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate  = 0.95;
      utterance.pitch = 1.0;
      utterance.lang  = this._detectLang(text);

      // Pick a good voice
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith(utterance.lang) && !v.localService
      ) || voices.find(v => v.lang.startsWith(utterance.lang));
      if (preferred) utterance.voice = preferred;

      // We'll use MediaStream + Web Audio to record
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx      = new AudioCtx();
      const dest     = ctx.createMediaStreamDestination();
      
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/wav';
      }
      
      const recorder = new MediaRecorder(dest.stream, { mimeType });
      const chunks   = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        try {
          const wavBlob = await this._convertToWav(blob);
          ctx.close();
          resolve(wavBlob);
        } catch (e) {
          ctx.close();
          resolve(blob);
        }
      };

      utterance.onstart = () => recorder.start();
      utterance.onend   = () => setTimeout(() => recorder.stop(), 300);
      utterance.onerror = () => {
        recorder.stop();
        reject(new Error('SpeechSynthesis error'));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /** Just speak without recording */
  _speakOnly(text) {
    if (typeof window.SpeechSynthesisUtterance === 'undefined') return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = this._detectLang(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  /** Create a tiny silent WAV blob as placeholder */
  _createSilentBlob() {
    // 44-byte WAV header + 1 second of silence
    const sampleRate = 8000;
    const duration   = 1;
    const numSamples = sampleRate * duration;
    const buffer     = new ArrayBuffer(44 + numSamples * 2);
    const view       = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0,  'RIFF');
    view.setUint32(4,  36 + numSamples * 2, true);
    writeStr(8,  'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1,  true); // PCM
    view.setUint16(22, 1,  true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2,  true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    return new Blob([buffer], { type: 'audio/wav' });
  }

  async _convertToWav(webmBlob) {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(wavBuffer);
    
    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numberOfChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
        const intSample = sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767);
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
    
    await audioCtx.close();
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  _detectLang(text) {
    // Very simple heuristic — detect based on character frequency
    const spanish = (text.match(/[áéíóúüñ¡¿]/gi) || []).length;
    return spanish > 0 ? 'es-ES' : 'en-US';
  }
}
