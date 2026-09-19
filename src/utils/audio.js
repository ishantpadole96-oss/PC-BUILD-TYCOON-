// Audio Effects Engine using Web Audio API
// Generates responsive, procedural sound effects without relying on external MP3 downloads

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this._volume = 0.85;
    this._fanNode = null;
    this._fanGain = null;
    this.uiSoundsEnabled = true;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio not supported or blocked by policy
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  get isMuted() {
    return this.muted;
  }

  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this._volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this._volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  // ─── CORE UI SOUNDS ───

  // UI Button Click
  playClick() {
    if (this.muted || !this.uiSoundsEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Hover Tick — subtle micro-feedback for interactive elements
  playHover() {
    if (this.muted || !this.uiSoundsEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  // Tab Switch — snappy navigation click
  playTabSwitch() {
    if (this.muted || !this.uiSoundsEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Short metallic snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.03);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // ─── COMPONENT ASSEMBLY SOUNDS ───

  // Component Snap / Install (Tactile mechanical click)
  playInstall() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Primary mechanical snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // Second metallic ping
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1400, t + 0.02);
    ping.frequency.exponentialRampToValueAtTime(800, t + 0.09);

    pingGain.gain.setValueAtTime(0.15, t + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    ping.connect(pingGain);
    pingGain.connect(this.masterGain);

    ping.start(t + 0.02);
    ping.stop(t + 0.09);
  }

  // Component Remove
  playRemove() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.06);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Screw Tighten — ratcheting mechanical sound for assembly context
  playScrewTighten() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const start = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(350 + i * 80, start);
      osc.frequency.exponentialRampToValueAtTime(200 + i * 40, start + 0.035);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.045);
    }
  }

  // ─── POWER & BOOT SOUNDS ───

  // Power Button Click + Relay Click
  playPowerClick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Full Power On Sequence — for OS-level boot transition  
  // (Heavy relay thunk → capacitor whine → ascending tone)
  playPowerOn() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy relay thunk
    const thunk = this.ctx.createOscillator();
    const thunkGain = this.ctx.createGain();
    thunk.type = 'square';
    thunk.frequency.setValueAtTime(80, t);
    thunk.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    thunkGain.gain.setValueAtTime(0.35, t);
    thunkGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    thunk.connect(thunkGain);
    thunkGain.connect(this.masterGain);
    thunk.start(t);
    thunk.stop(t + 0.13);

    // Capacitor whine
    const whine = this.ctx.createOscillator();
    const whineGain = this.ctx.createGain();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(2000, t + 0.1);
    whine.frequency.exponentialRampToValueAtTime(6000, t + 0.5);
    whineGain.gain.setValueAtTime(0.04, t + 0.1);
    whineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    whine.connect(whineGain);
    whineGain.connect(this.masterGain);
    whine.start(t + 0.1);
    whine.stop(t + 0.55);

    // Ascending warm tone
    const warm = this.ctx.createOscillator();
    const warmGain = this.ctx.createGain();
    warm.type = 'triangle';
    warm.frequency.setValueAtTime(200, t + 0.2);
    warm.frequency.exponentialRampToValueAtTime(600, t + 0.8);
    warmGain.gain.setValueAtTime(0.1, t + 0.2);
    warmGain.gain.exponentialRampToValueAtTime(0.01, t + 0.85);
    warm.connect(warmGain);
    warmGain.connect(this.masterGain);
    warm.start(t + 0.2);
    warm.stop(t + 0.9);
  }

  // Motherboard POST Good Beep (1 Short High Beep)
  playPostBeep() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5 note (classic BIOS buzzer)
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setValueAtTime(0.25, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Motherboard POST Error Beeps (3 Long Beeps)
  playPostError() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const start = t + (i * 0.28);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, start); // A4 lower alarm beep
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.setValueAtTime(0.3, start + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.23);
    }
  }

  // OS Boot Chime (Pleasant synthesizer chord)
  playBootChime() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Major 7th chord arpeggio
    const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const start = t + (idx * 0.09);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.95);
    });
  }

  // ─── ECONOMY / TRANSACTION SOUNDS ───

  // Cash / Order Complete (Cha-ching celebration)
  playCash() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [800, 1000, 1200, 1600];
    notes.forEach((freq, i) => {
      const start = t + (i * 0.05);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  // Coin Collect — short cheerful ping for small gains
  playCoinCollect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // ─── ALERT & STATUS SOUNDS ───

  // Warning / Danger Alert
  playWarning() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Error Buzz — harsh dissonant buzz for errors
  playError() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Two detuned oscillators for dissonance
    [110, 117].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.setValueAtTime(0.2, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Notification Chime — pleasant two-tone ding for info notifications
  playNotification() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { freq: 880, start: 0, dur: 0.15 },
      { freq: 1100, start: 0.1, dur: 0.2 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);

      gain.gain.setValueAtTime(0.15, t + start);
      gain.gain.exponentialRampToValueAtTime(0.005, t + start + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + start);
      osc.stop(t + start + dur + 0.01);
    });
  }

  // Success Jingle — triumphant short ascending major chord
  playSuccess() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
    notes.forEach((freq, i) => {
      const start = t + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  // ─── SPECIAL GAME SOUNDS ───

  // Level Up Fanfare — epic ascending chord with shimmer
  playLevelUp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant ascending fanfare
    const fanfare = [
      { freq: 523.25, delay: 0 },     // C5
      { freq: 659.25, delay: 0.1 },   // E5
      { freq: 783.99, delay: 0.2 },   // G5
      { freq: 1046.50, delay: 0.35 }, // C6
      { freq: 1318.51, delay: 0.5 },  // E6
    ];

    fanfare.forEach(({ freq, delay }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.22, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.005, t + delay + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + delay);
      osc.stop(t + delay + 0.85);
    });

    // Shimmer overlay  
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(4000, t + 0.3);
    shimmer.frequency.exponentialRampToValueAtTime(8000, t + 1.0);
    shimmerGain.gain.setValueAtTime(0.04, t + 0.3);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    shimmer.start(t + 0.3);
    shimmer.stop(t + 1.05);
  }

  // Whoosh — transition sweep sound for page/window changes
  playWhoosh() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // White noise burst swept with a filter
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
    filter.Q.setValueAtTime(0.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(t);
    noiseSource.stop(t + 0.16);
  }

  // Typing Keyboard — individual keypress sound  
  playKeystroke() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Noise-based click
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000 + Math.random() * 2000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(t);
    noiseSource.stop(t + 0.025);
  }

  // Benchmark Running — pulsing electronic hum
  playBenchmarkPulse() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.6);

    // LFO for pulsing effect
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8, t);
    lfoGain.gain.setValueAtTime(0.08, t);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.75);
    lfo.stop(t + 0.75);
  }

  // PC Fan Hum — starts/stops a continuous ambient low-frequency hum
  startFanHum() {
    if (this.muted || this._fanNode) return;
    this.ensureContext();
    if (!this.ctx) return;

    this._fanGain = this.ctx.createGain();
    this._fanGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this._fanGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.5);

    this._fanNode = this.ctx.createOscillator();
    this._fanNode.type = 'triangle';
    this._fanNode.frequency.setValueAtTime(85, this.ctx.currentTime);

    // Add subtle modulation for realism
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.3, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(5, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this._fanNode.frequency);
    lfo.start();
    this._fanLfo = lfo;

    this._fanNode.connect(this._fanGain);
    this._fanGain.connect(this.masterGain);

    this._fanNode.start();
  }

  stopFanHum() {
    if (!this._fanNode || !this.ctx) return;
    try {
      this._fanGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      const node = this._fanNode;
      const lfo = this._fanLfo;
      setTimeout(() => {
        try { node.stop(); } catch {}
        try { lfo.stop(); } catch {}
      }, 400);
    } catch {}
    this._fanNode = null;
    this._fanLfo = null;
    this._fanGain = null;
  }

  // Drag Sound — for drag & drop interactions
  playDragStart() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.065);
  }

  playDragDrop() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.055);
  }
}

export const soundFx = new SoundManager();
