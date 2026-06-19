/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private droneOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private droneGain: GainNode | null = null;
  private isDronePlaying = false;
  private isMuted = false;
  private voiceEnabled = true;
  private ambientTimer: any = null;

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isDronePlaying) {
      this.stopDrone();
    } else if (!muted && !this.isDronePlaying && localStorage.getItem("drone_enabled") === "true") {
      this.startDrone();
    }
  }

  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  getMute() {
    return this.isMuted;
  }

  getVoice() {
    return this.voiceEnabled;
  }

  /**
   * Synthesizes a beautiful spiritual temple bell / Tibetan singing bowl chime.
   * Uses FM synthesis / multiple harmonic frequencies to sound highly cinematic.
   */
  playBell(frequency = 293.66) { // D4 is very spiritual (Anahata chakra frequency approx)
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // We combine multiple sine wave partials to mimic a bronze temple bell
    const partials = [
      { ratio: 1.0, volume: 0.8, decay: 3.5 },  // Fundamental
      { ratio: 1.5, volume: 0.4, decay: 2.5 },  // Overone (Perfect Fifth)
      { ratio: 2.0, volume: 0.35, decay: 2.0 }, // Octave
      { ratio: 2.76, volume: 0.25, decay: 1.2 },// Minor 7th overtone
      { ratio: 3.4, volume: 0.15, decay: 0.8 }, // Metallic overtone
      { ratio: 4.2, volume: 0.1, decay: 0.5 },  // Fast ringing part
    ];

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.7, now + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
    masterGain.connect(this.ctx.destination);

    partials.forEach((partial) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency * partial.ratio, now);

      gainNode.gain.setValueAtTime(partial.volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now);
      osc.stop(now + Math.max(partial.decay, 4));
    });
  }

  /**
   * Play a lighter, sparkly sound for golden beads / special items
   */
  playSparkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 523.25; // C5 (high and bright)

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    masterGain.connect(this.ctx.destination);

    // Arpeggio sparkle
    [0, 4, 7, 12].forEach((semitone, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const delay = index * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq * Math.pow(2, semitone / 12), now + delay);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.4);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.5);
    });
  }

  /**
   * Synthesizes a deep negative boom / error sound when hitting bad obstacles (vikaars)
   */
  playVikaarSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.6, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Speaks the "Om Bhikshu" sacred chant. Uses window.speechSynthesis.
   * Leverages custom pitch and tempo to be deeply meditative and soothing.
   */
  speakChant(chantText = "Om Bhikshu") {
    if (this.isMuted || !this.voiceEnabled) return;

    // Use speech synthesis
    if ("speechSynthesis" in window) {
      // Cancel previous utterances so they don't queue up when fast-tapping
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(chantText);
      utterance.rate = 0.85; //meditative, calm, slow
      utterance.pitch = 0.75; //deep, resonant, masculine/monk-like if supported, else soft deep tone

      // Try to find a voice that supports Hindi/Indian English for authentic pronunciation
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("hi") ||
          v.lang.startsWith("en-IN") ||
          v.name.includes("Indian") ||
          v.name.includes("Male")
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Play a traditional, spiritually uplifting bhajan/mantra melody (procedural raga notes)
   * to celebrate a successful Mala completion!
   */
  playBhajanMelody() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Serene traditional bhajan pentatonic note sequence (Raga Bhupali)
    const melody = [
      { freq: 392.00, duration: 0.35, delay: 0.0 }, // G4
      { freq: 440.00, duration: 0.35, delay: 0.35 }, // A4
      { freq: 523.25, duration: 0.5, delay: 0.7 }, // C5
      { freq: 587.33, duration: 0.35, delay: 1.2 }, // D5
      { freq: 659.25, duration: 0.5, delay: 1.55 }, // E5
      { freq: 587.33, duration: 0.35, delay: 2.05 }, // D5
      { freq: 523.25, duration: 0.35, delay: 2.4 }, // C5
      { freq: 440.00, duration: 0.35, delay: 2.75 }, // A4
      { freq: 523.25, duration: 0.7, delay: 3.1 }, // C5 (resolving note)
    ];

    melody.forEach((note) => {
      if (!this.ctx) return;
      const t = now + note.delay;

      // Primary tone: warm, plucky triangle wave simulating a santoor/harp string
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, t);

      // Sitar-like bridge overtone buzz
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(note.freq * 2, t);
      overtoneGain.gain.setValueAtTime(0.06, t);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, t + note.duration * 0.6);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(note.freq * 1.5, t);
      filter.Q.setValueAtTime(1.2, t);

      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(0.35, t + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + note.duration);

      osc.connect(filter);
      filter.connect(gainNode);
      overtone.connect(overtoneGain);
      overtoneGain.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(t);
      overtone.start(t);
      osc.stop(t + note.duration + 0.2);
      overtone.stop(t + note.duration + 0.2);
    });
  }

  /**
   * Plays a random high-pitched gentle crystal bell wind chime to simulate a temple environment.
   */
  private playRandomChime() {
    if (this.isMuted || !this.ctx || !this.isDronePlaying) return;
    const now = this.ctx.currentTime;

    // Sweet peaceful pentatonic chime frequency choice (simulating warm wind blown brass chimes)
    const chimeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Dynamic slightly vibrating frequency
    osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

    gainNode.gain.setValueAtTime(0, now);
    // Delicate, tiny attack and long decay
    gainNode.gain.linearRampToValueAtTime(0.045, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 3.0);
  }

  /**
   * Starts a meditative, deep, continuous drone ("Om / Singing Bowl") in the background.
   * Ideal for Samayik/Sadhana immersion.
   */
  startDrone() {
    if (this.isMuted || this.isDronePlaying) return;
    this.init();
    if (!this.ctx) return;

    this.isDronePlaying = true;
    const now = this.ctx.currentTime;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, now);
    this.droneGain.gain.linearRampToValueAtTime(0.18, now + 2.0); // Smooth fade-in
    this.droneGain.connect(this.ctx.destination);

    // Deep multi-harmonic meditative drone structure:
    // Fundamental frequency (C2 = 65.41Hz, or A1/C3)
    // 110Hz (A2), 165Hz (E3), 220Hz (A3) forms a beautiful resonant Chord
    const droneFreqs = [110, 165, 220, 330];

    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.droneGain) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Add a slight vibrato and detuning to mimic human or organic bowl sounds
      osc.detune.setValueAtTime((idx - 1.5) * 4, now);

      // Low frequency oscillator (LFO) to create a gentle swelling amplitude wave
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, now); // Very slow swell

      lfoGain.gain.setValueAtTime(0.04, now); // mod intensity
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain); // modulate volume

      // Set baseline partial volume
      const baseVol = idx === 0 ? 0.25 : idx === 1 ? 0.2 : idx === 2 ? 0.15 : 0.08;
      oscGain.gain.setValueAtTime(baseVol, now);

      osc.connect(oscGain);
      oscGain.connect(this.droneGain);

      lfo.start(now);
      osc.start(now);

      this.droneOscillators.push({ osc, gain: oscGain });
    });

    // Start periodic gentle temple ambient wind chimes to enhance spiritual atmosphere
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
    }
    // Play immediately and then periodically
    setTimeout(() => this.playRandomChime(), 1000);
    this.ambientTimer = setInterval(() => {
      this.playRandomChime();
    }, 4500 + Math.random() * 4500);
  }

  stopDrone() {
    if (!this.isDronePlaying) return;
    this.isDronePlaying = false;

    // Clear background temple chimes timer
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }

    const now = this.ctx ? this.ctx.currentTime : 0;

    if (this.droneGain && this.ctx) {
      // Fade-out drone over 1.5 seconds smoothly
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      const oscsToStop = [...this.droneOscillators];
      this.droneOscillators = [];

      setTimeout(() => {
        oscsToStop.forEach(({ osc }) => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore if already stopped
          }
        });
      }, 1600);
    }
  }

  isDroneActive() {
    return this.isDronePlaying;
  }
}

export const audio = new AudioEngine();
