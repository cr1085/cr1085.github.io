/**
 * audio-recorder.js
 * Grabación de voz del usuario con filtros de audio usando Web Audio API (gratis)
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.chunks = [];
    this.isRecording = false;
    this.isPaused = false;
    
    this.filters = {
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compression: false,
      noiseReduction: false,
    };
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      
      this.sourceNode = this._applyFilters(this.sourceNode);

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.isPaused = false;

      return true;
    } catch (err) {
      console.error('[AudioRecorder] Error al iniciar:', err);
      throw err;
    }
  }

  _applyFilters(source) {
    let node = source;

    node = this._createEQ(node);
    node = this._createCompressor(node);
    node = this._createNoiseGate(node);

    return node;
  }

  _createEQ(source) {
    const ctx = this.audioContext;
    const eq = ctx.createBiquadFilter();
    eq.type = 'lowshelf';
    eq.frequency.value = 320;
    eq.gain.value = this.filters.eqLow;

    const eqMid = ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1000;
    eqMid.gain.value = this.filters.eqMid;
    eqMid.Q.value = 0.5;

    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 3200;
    eqHigh.gain.value = this.filters.eqHigh;

    source.connect(eq).connect(eqMid).connect(eqHigh);
    return eqHigh;
  }

  _createCompressor(source) {
    if (!this.filters.compression) return source;
    
    const ctx = this.audioContext;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    source.connect(compressor);
    return compressor;
  }

  _createNoiseGate(source) {
    if (!this.filters.noiseReduction) return source;

    const ctx = this.audioContext;
    const noiseGate = ctx.createDynamicsCompressor();
    noiseGate.threshold.value = -40;
    noiseGate.knee.value = 0;
    noiseGate.ratio.value = 20;
    noiseGate.attack.value = 0.001;
    noiseGate.release.value = 0.1;

    source.connect(noiseGate);
    return noiseGate;
  }

  pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No hay grabación activa'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        
        this.isRecording = false;
        this.isPaused = false;

        this._cleanup();

        resolve(blob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  cancelRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    this.isRecording = false;
    this.isPaused = false;
    this.chunks = [];
    this._cleanup();
  }

  _cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.sourceNode = null;
    this.chunks = [];
  }

  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
  }

  getFilters() {
    return { ...this.filters };
  }

  static getSupportedFilters() {
    return [
      { id: 'eqLow', label: 'Bajo (Bass)', min: -12, max: 12, default: 0 },
      { id: 'eqMid', label: 'Medios (Mid)', min: -12, max: 12, default: 0 },
      { id: 'eqHigh', label: 'Alto (Treble)', min: -12, max: 12, default: 0 },
      { id: 'compression', label: 'Compresión', type: 'boolean', default: false },
      { id: 'noiseReduction', label: 'Reducción de ruido', type: 'boolean', default: false },
    ];
  }

  static getMicrophonePermission() {
    return navigator.permissions.query({ name: 'microphone' });
  }
}
