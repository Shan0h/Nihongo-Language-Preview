// Soothing Japanese Zen / Lofi Ambient BGM Synthesizer via Web Audio API

class BackgroundMusic {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private timerId: NodeJS.Timeout | number | null = null;
  private volume = 0.35; // Default soothing volume

  // Traditional Japanese Yo-sen & In-sen Pentatonic Scale frequencies (Hz)
  // D4, E4, G4, A4, B4, D5, E5, G5, A5
  private pentatonicNotes = [
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('nihongo-bgm-volume');
      if (savedVolume) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  // Play a single delicate Koto-like plucked note
  private playKotoPluck(freq: number, time: number, duration: number = 2.4, velocity: number = 0.25) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const noteGain = ctx.createGain();

      // Triangle + Sine for organic wooden string resonance
      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(freq, time);
      // Slight overtone detune for organic string buzz
      osc2.frequency.setValueAtTime(freq * 2.002, time);

      // Warm low-pass acoustic dampening
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, time);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.9, time + duration);

      // Natural acoustic pluck ADSR envelope
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.exponentialRampToValueAtTime(velocity * (this.isMuted ? 0 : this.volume), time + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
    } catch {}
  }

  // Ambient bamboo pad chord
  private playAmbientPad(chordFreqs: number[], time: number, duration: number = 5.0) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    chordFreqs.forEach((freq) => {
      try {
        const osc = ctx.createOscillator();
        const padGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq / 2, time); // Sub-octave warmth

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, time);

        // Slow swell
        padGain.gain.setValueAtTime(0.0001, time);
        padGain.gain.linearRampToValueAtTime(0.06 * (this.isMuted ? 0 : this.volume), time + 1.5);
        padGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(filter);
        filter.connect(padGain);
        padGain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + duration);
      } catch {}
    });
  }

  // Looping musical pattern scheduler
  private step = 0;
  private scheduleMusicCycle = () => {
    if (!this.isPlaying || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Peaceful Japanese chord progressions (Root frequencies in Hz)
    const chords = [
      [293.66, 440.00, 587.33], // D minor/pentatonic
      [392.00, 493.88, 783.99], // G major
      [440.00, 659.25, 880.00], // A sus
      [329.63, 493.88, 659.25], // E minor
    ];

    const currentChord = chords[this.step % chords.length];

    // Swelling soft pad
    this.playAmbientPad(currentChord, now, 5.5);

    // Play 3 to 4 delicate arpeggiated koto notes
    const noteIndices = [
      Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 4) + 2,
      Math.floor(Math.random() * 3) + 5,
    ];

    noteIndices.forEach((idx, i) => {
      const noteFreq = this.pentatonicNotes[idx % this.pentatonicNotes.length];
      const offset = i * 0.75 + (Math.random() * 0.2);
      this.playKotoPluck(noteFreq, now + offset, 2.5, 0.22);
    });

    // Occasional gentle high wind chime
    if (Math.random() > 0.5) {
      const highChime = this.pentatonicNotes[Math.floor(Math.random() * 3) + 6];
      this.playKotoPluck(highChime, now + 2.8, 3.2, 0.14);
    }

    this.step++;
    this.timerId = setTimeout(this.scheduleMusicCycle, 3800);
  };

  start() {
    if (this.isPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    this.isPlaying = true;
    this.scheduleMusicCycle();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      if (typeof window !== 'undefined') {
        localStorage.setItem('nihongo-bgm-enabled', 'false');
      }
    } else {
      this.start();
      if (typeof window !== 'undefined') {
        localStorage.setItem('nihongo-bgm-enabled', 'true');
      }
    }
    return this.isPlaying;
  }

  resumeIfSuspended() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('nihongo-bgm-volume', this.volume.toString());
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const bgm = new BackgroundMusic();
