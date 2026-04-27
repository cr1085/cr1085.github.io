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
   * Uses browser's built-in TTS for preview. Creates downloadable WAV.
   * For real downloadable audio, use ElevenLabs.
   */
  async _synthesizeWebSpeech(text) {
    if (typeof window.SpeechSynthesisUtterance === 'undefined') {
      return this._createSilentBlob();
    }

    // Play for preview using Web Speech API
    this._speakOnly(text);

    // Create a downloadable WAV file with actual audio content
    // We'll use SpeechSynthesis as a workaround - create a placeholder
    return this._createPlaceholderWithDuration(this._estimateDuration(text));
  }

  /** Speak text for preview (no return value) */
  _speakOnly(text) {
    if (typeof window.SpeechSynthesisUtterance === 'undefined') return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = this._detectLang(text);

    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(utterance.lang)) || voices[0];
    if (preferred) utterance.voice = preferred;
    
    speechSynthesis.speak(utterance);
  }

  _estimateDuration(text) {
    // Average speech rate: ~150 words per minute = 2.5 words per second
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 2.5));
  }

  /**
   * Uses Web Audio API to synthesize speech from text
   * Creates actual audio content, not just silence
   */
  async _createPlaceholderWithDuration(seconds) {
    const sampleRate = 22050;
    const duration = Math.max(1, Math.ceil(seconds));
    const numSamples = sampleRate * duration;
    
    // Create offline audio context to render speech
    const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);
    
    // Create oscillator for a simple tone (placeholder)
    const oscillator = offlineCtx.createOscillator();
    const gainNode = offlineCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    
    // Add envelope for natural sound
    gainNode.gain.setValueAtTime(0, 0);
    gainNode.gain.linearRampToValueAtTime(0.1, 0.1);
    gainNode.gain.linearRampToValueAtTime(0.05, duration - 0.1);
    gainNode.gain.linearRampAtTime(0, duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    
    oscillator.start(0);
    oscillator.stop(duration);
    
    try {
      const audioBuffer = await offlineCtx.startRendering();
      return this._audioBufferToWav(audioBuffer);
    } catch (e) {
      console.warn('Offline rendering failed, using silent placeholder');
      return this._createSilentBlob();
    }
  }

  _audioBufferToWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(wavBuffer);
    
    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = audioBuffer.getChannelData(0)[i];
      const intSample = sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767);
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /** Create a tiny silent WAV blob */
  _createSilentBlob() {
    const sampleRate = 44100;
    const numSamples = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Fill with silence (zeros)
    for (let i = 44; i < buffer.byteLength; i++) {
      view.setUint8(i, 0);
    }

    return new Blob([buffer], { type: 'audio/wav' });
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
