// ============================================================
// AUDIO MANAGER
// Generates sound effects via Web Audio API (no files needed)
// ============================================================

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, type, duration, volume = 0.3, startTime = 0) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playDiceRoll() {
    // Rattling dice sound
    for (let i = 0; i < 8; i++) {
      const freq = 200 + Math.random() * 300;
      this._tone(freq, 'square', 0.05, 0.15, i * 0.05);
    }
  }

  playMove() {
    // Hoppy movement sound
    this._tone(523, 'sine', 0.1, 0.2, 0);
    this._tone(659, 'sine', 0.1, 0.2, 0.1);
    this._tone(784, 'sine', 0.12, 0.2, 0.2);
  }

  playCorrect() {
    // Victory fanfare
    this._tone(523, 'sine', 0.15, 0.3, 0);
    this._tone(659, 'sine', 0.15, 0.3, 0.15);
    this._tone(784, 'sine', 0.15, 0.3, 0.3);
    this._tone(1047, 'sine', 0.3, 0.3, 0.45);
  }

  playWrong() {
    // Buzzer
    this._tone(200, 'sawtooth', 0.2, 0.3, 0);
    this._tone(150, 'sawtooth', 0.3, 0.3, 0.2);
  }

  playTrap() {
    // Ominous descending
    this._tone(400, 'sawtooth', 0.1, 0.25, 0);
    this._tone(300, 'sawtooth', 0.1, 0.25, 0.1);
    this._tone(200, 'sawtooth', 0.2, 0.25, 0.2);
    this._tone(100, 'sawtooth', 0.3, 0.25, 0.35);
  }

  playPower() {
    // Magical sparkle
    for (let i = 0; i < 5; i++) {
      this._tone(800 + i * 200, 'sine', 0.1, 0.2, i * 0.08);
    }
  }

  playWin() {
    // Big win jingle
    const notes = [523, 659, 784, 1047, 1319, 1047, 784, 1047];
    notes.forEach((f, i) => this._tone(f, 'sine', 0.2, 0.4, i * 0.12));
  }

  playLose() {
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((f, i) => this._tone(f, 'sawtooth', 0.2, 0.3, i * 0.15));
  }

  playButton() {
    this._tone(800, 'sine', 0.05, 0.15);
  }

  playPrefer() {
    // Mysterious choice sound
    this._tone(440, 'triangle', 0.15, 0.2, 0);
    this._tone(554, 'triangle', 0.15, 0.2, 0.12);
    this._tone(659, 'triangle', 0.25, 0.2, 0.24);
  }
}

window.AudioManager = new AudioManager();
