/**
 * ACOUSTIC ENGINE - HIGH-END PROCEDURAL SOUND SYNTHESIS
 * 
 * Uses Web Audio API to generate tactile, organic, mechanical acoustic cues:
 * 1. Disassembly: Precision mechanical clamp release + pneumatic air bloom + sub-bass weight
 * 2. Reassembly In-Flight: Gentle reverse spatial whoosh
 * 3. Reassembly Lock: Tactile neodymium magnetic snap + brushed metal detent latch
 * 4. Micro-tick: Subtle tactile interaction feedback for hover states
 */

class AcousticEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientActive: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.42, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public startAmbient() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || this.ambientActive) return;

    const now = ctx.currentTime;
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.0001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.055, now + 2.5);
    this.ambientGain.connect(this.masterGain);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(850, now);
    lowpass.Q.setValueAtTime(0.35, now);
    lowpass.connect(this.ambientGain);

    const frequencies = [110, 164.81, 220];
    this.ambientOscillators = frequencies.map((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index === 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(index === 2 ? 0.12 : 0.08, now);
      osc.connect(gain);
      gain.connect(lowpass);
      osc.start(now);
      return osc;
    });

    this.ambientActive = true;
  }

  public stopAmbient() {
    if (!this.ctx || !this.ambientGain || !this.ambientActive) return;
    const now = this.ctx.currentTime;
    const gain = this.ambientGain;
    gain.gain.cancelScheduledValues(now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    this.ambientOscillators.forEach((osc) => {
      try { osc.stop(now + 1.25); } catch {}
    });
    this.ambientOscillators = [];
    this.ambientActive = false;
    window.setTimeout(() => gain.disconnect(), 1400);
    this.ambientGain = null;
  }

  public toggleAmbient(): boolean {
    if (this.ambientActive) this.stopAmbient();
    else this.startAmbient();
    return this.ambientActive;
  }

  public getIsAmbientActive(): boolean {
    return this.ambientActive;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.42, now + 0.08);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * 1. Disassembly Audio Cue
   * Triggered when headphone starts exploding:
   * - Crisp mechanical latch release (dual metallic click)
   * - Soft acoustic pneumatic whoosh (bandpassed noise sweep)
   * - Warm sub-acoustic body bloom (descending sub sine wave)
   */
  public playDisassembly() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // --- A. Mechanical Precision Detent Release (High Metallic Click) ---
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.045);

    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(1400, now);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);

    clickOsc.start(now);
    clickOsc.stop(now + 0.06);

    // --- B. Tactile Slider Friction / Secondary Release (delayed 30ms) ---
    const frictionOsc = ctx.createOscillator();
    const frictionGain = ctx.createGain();
    frictionOsc.type = 'sine';
    frictionOsc.frequency.setValueAtTime(1200, now + 0.03);
    frictionOsc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    frictionGain.gain.setValueAtTime(0, now);
    frictionGain.gain.setValueAtTime(0.18, now + 0.03);
    frictionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    frictionOsc.connect(frictionGain);
    frictionGain.connect(this.masterGain);

    frictionOsc.start(now + 0.03);
    frictionOsc.stop(now + 0.15);

    // --- C. Pneumatic Air Release (Gentle filtered noise buffer) ---
    const bufferSize = ctx.sampleRate * 0.7; // 700ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(1.8, now);
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(420, now + 0.65);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.24, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.68);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.7);

    // --- D. Warm Sub-Acoustic Bloom (Tactile spatial weight) ---
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

    subGain.gain.setValueAtTime(0.28, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start(now);
    subOsc.stop(now + 0.45);
  }

  /**
   * 2. Reassembly In-Flight Spatial Whoosh
   * Triggered when headphone components begin traveling back toward each other
   */
  public playReassemblyWhoosh() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const duration = 0.85;

    // Filtered noise swoosh rising in pitch
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, now);
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  }

  /**
   * 3. Reassembly Lock Audio Cue
   * Triggered at the exact moment parts snap back together:
   * - Neodymium magnetic snap (dry acoustic transient)
   * - Metallic latch ring (subtle 3.2kHz harmonic ping)
   * - Solid seated contact thud (130Hz damped punch)
   */
  public playReassemblyLock() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // --- A. Neodymium Magnetic Snap (Tight, snappy transient) ---
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const snapFilter = ctx.createBiquadFilter();

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(3600, now);
    snapOsc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

    snapFilter.type = 'lowpass';
    snapFilter.frequency.setValueAtTime(4200, now);

    snapGain.gain.setValueAtTime(0.48, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterGain);

    snapOsc.start(now);
    snapOsc.stop(now + 0.05);

    // --- B. Brushed Aluminum Ring (Subtle premium metallic resonance) ---
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2850, now);

    pingGain.gain.setValueAtTime(0.12, now);
    pingGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);

    pingOsc.connect(pingGain);
    pingGain.connect(this.masterGain);

    pingOsc.start(now);
    pingOsc.stop(now + 0.25);

    // --- C. Solid Contact Thud (Wood/polymer/metal seated lock) ---
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(140, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    thudGain.gain.setValueAtTime(0.38, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    thudOsc.start(now);
    thudOsc.stop(now + 0.16);
  }

  /**
   * 4. Tactile Micro-Tick
   * For interactive hover states on cups and buttons
   */
  public playMicroTick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.018);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.022);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }
}

export const acousticEngine = new AcousticEngine();
