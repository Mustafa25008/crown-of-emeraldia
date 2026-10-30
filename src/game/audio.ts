// Web Audio API Chiptune & Retro Sound Effects Engine
// Purely synthesized 16-bit sounds and looping background music with zero external audio files

type TrackName =
  | 'OVERWORLD'
  | 'FOREST'
  | 'CAVERN'
  | 'FORTRESS'
  | 'CASTLE_BOSS'
  | 'UNDERWATER'
  | 'DESERT'
  | 'SNOW'
  | 'VOLCANO';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private volume: number = 0.7;
  private musicInterval: number | null = null;
  private currentTrack: TrackName | null = null;
  private noteIndex: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private ensureContext(): AudioContext | null {
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

  public updateSettings(soundEnabled: boolean, musicEnabled: boolean, volume: number) {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
    this.volume = Math.max(0, Math.min(1, volume));
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentTrack && !this.musicInterval) {
      this.playMusic(this.currentTrack);
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    gainMult: number = 0.15,
    slideToFreq?: number,
    delayMs: number = 0
  ) {
    if (!this.soundEnabled || this.volume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delayMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), startTime + duration);
    }

    const peakGain = gainMult * this.volume;
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playJump(isBig: boolean = false) {
    const startFreq = isBig ? 160 : 220;
    const endFreq = isBig ? 480 : 620;
    this.playTone(startFreq, 0.16, 'square', 0.14, endFreq);
  }

  public playSwim() {
    this.playTone(240, 0.08, 'triangle', 0.16, 420, 0);
    this.playTone(360, 0.07, 'sine', 0.12, 540, 45);
  }

  public playCoin() {
    this.playTone(987.77, 0.08, 'square', 0.14, undefined, 0); // B5
    this.playTone(1318.51, 0.25, 'square', 0.14, undefined, 75); // E6
  }

  public playBump() {
    this.playTone(140, 0.09, 'triangle', 0.2, 70);
  }

  public playBreakBlock() {
    this.playTone(180, 0.06, 'sawtooth', 0.18, 60, 0);
    this.playTone(130, 0.09, 'sawtooth', 0.16, 45, 45);
    this.playTone(95, 0.12, 'square', 0.14, 40, 90);
  }

  public playPowerUpAppear() {
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.07, 'square', 0.12, undefined, idx * 45);
    });
  }

  public playPowerUpCollect() {
    const notes = [330, 392, 659, 523, 587, 784, 659, 784, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.08, 'square', 0.14, undefined, idx * 55);
    });
  }

  public playStomp() {
    this.playTone(420, 0.08, 'square', 0.16, 160, 0);
    this.playTone(580, 0.1, 'triangle', 0.15, 280, 50);
  }

  public playFireball() {
    this.playTone(720, 0.08, 'sawtooth', 0.12, 220);
  }

  public playTailSpin() {
    this.playTone(260, 0.07, 'triangle', 0.18, 620, 0);
    this.playTone(380, 0.09, 'square', 0.14, 180, 55);
  }

  public playDamage() {
    const notes = [440, 392, 349, 293, 220];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.08, 'sawtooth', 0.16, undefined, idx * 55);
    });
  }

  public playDeath() {
    const notes = [493.88, 698.46, 698.46, 698.46, 659.25, 587.33, 523.25, 392.0, 261.63];
    const delays = [0, 120, 240, 360, 480, 600, 720, 860, 1020];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.12, 'square', 0.16, undefined, delays[idx]);
    });
  }

  public playCheckpoint() {
    this.playTone(523.25, 0.09, 'triangle', 0.18, undefined, 0);
    this.playTone(659.25, 0.09, 'triangle', 0.18, undefined, 90);
    this.playTone(783.99, 0.12, 'triangle', 0.18, undefined, 180);
    this.playTone(1046.5, 0.25, 'square', 0.16, undefined, 270);
  }

  public playLevelClear() {
    const melody = [
      { f: 261.63, d: 0.12, t: 0 },
      { f: 329.63, d: 0.12, t: 120 },
      { f: 392.0, d: 0.12, t: 240 },
      { f: 523.25, d: 0.18, t: 360 },
      { f: 659.25, d: 0.18, t: 540 },
      { f: 783.99, d: 0.35, t: 720 },
      { f: 659.25, d: 0.3, t: 1080 },
      { f: 1046.5, d: 0.45, t: 1400 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'square', 0.16, undefined, m.t);
    });
  }

  public playBossHit() {
    this.playTone(160, 0.12, 'sawtooth', 0.22, 65, 0);
    this.playTone(320, 0.15, 'square', 0.18, 110, 80);
  }

  public playBossDefeat() {
    for (let i = 0; i < 8; i++) {
      this.playTone(220 + i * 90, 0.14, 'sawtooth', 0.18, 80, i * 110);
    }
    this.playLevelClear();
  }

  public playMusic(track: TrackName) {
    this.currentTrack = track;
    if (!this.musicEnabled) return;

    this.stopMusicIntervalOnly();
    this.noteIndex = 0;

    const melodies: Record<TrackName, { notes: number[]; tempoMs: number; wave: OscillatorType; bass: number[] }> = {
      OVERWORLD: {
        notes: [330, 330, 0, 330, 0, 262, 330, 0, 392, 0, 0, 0, 196, 0, 0, 0, 262, 0, 196, 0, 165, 0, 220, 0, 247, 0, 233, 220, 0, 196, 330, 392],
        bass:  [131, 131, 131, 131, 98, 98, 131, 131, 196, 196, 98, 98, 98, 98, 98, 98, 131, 131, 98, 98, 82, 82, 110, 110, 123, 123, 110, 110, 98, 98, 131, 196],
        tempoMs: 170,
        wave: 'square',
      },
      FOREST: {
        notes: [293, 349, 440, 0, 392, 349, 330, 0, 293, 330, 349, 293, 262, 0, 220, 0, 293, 349, 440, 523, 493, 440, 392, 0, 349, 330, 293, 262, 293, 0, 0, 0],
        bass:  [146, 146, 220, 220, 196, 196, 165, 165, 146, 146, 174, 146, 131, 131, 110, 110, 146, 146, 220, 220, 196, 196, 196, 196, 174, 165, 146, 131, 146, 146, 110, 110],
        tempoMs: 185,
        wave: 'triangle',
      },
      CAVERN: {
        notes: [262, 523, 220, 440, 233, 466, 0, 0, 262, 523, 220, 440, 233, 466, 0, 0, 175, 349, 147, 294, 156, 311, 0, 0, 196, 220, 233, 196, 175, 0, 0, 0],
        bass:  [131, 0, 110, 0, 116, 0, 98, 0, 131, 0, 110, 0, 116, 0, 98, 0, 87, 0, 73, 0, 78, 0, 65, 0, 98, 110, 116, 98, 87, 0, 65, 0],
        tempoMs: 210,
        wave: 'triangle',
      },
      FORTRESS: {
        notes: [220, 0, 233, 0, 220, 0, 262, 247, 220, 0, 196, 0, 220, 0, 0, 0, 293, 0, 311, 0, 293, 0, 349, 330, 293, 0, 262, 0, 220, 0, 0, 0],
        bass:  [110, 110, 116, 116, 110, 110, 131, 123, 110, 110, 98, 98, 110, 110, 82, 82, 146, 146, 156, 156, 146, 146, 175, 165, 146, 146, 131, 131, 110, 110, 82, 82],
        tempoMs: 160,
        wave: 'sawtooth',
      },
      CASTLE_BOSS: {
        notes: [165, 175, 165, 196, 165, 175, 220, 196, 165, 175, 165, 196, 247, 233, 220, 196, 220, 233, 220, 262, 220, 233, 293, 262, 247, 220, 196, 175, 165, 0, 165, 0],
        bass:  [82, 82, 87, 87, 82, 82, 110, 98, 82, 82, 87, 87, 123, 116, 110, 98, 110, 110, 116, 116, 110, 110, 146, 131, 123, 110, 98, 87, 82, 82, 82, 82],
        tempoMs: 135,
        wave: 'sawtooth',
      },
      UNDERWATER: {
        notes: [
          293, 330, 370, 392, 440, 494, 523, 0, 523, 523, 0, 494,
          523, 0, 0, 392, 0, 0, 392, 370, 392, 440, 0, 0,
          293, 330, 370, 392, 440, 494, 587, 0, 523, 494, 0, 440,
          392, 0, 0, 523, 0, 0, 494, 440, 392, 523, 0, 0,
        ],
        bass: [
          131, 196, 196, 146, 220, 220, 131, 196, 196, 131, 196, 196,
          131, 196, 196, 123, 196, 196, 110, 165, 165, 146, 220, 220,
          131, 196, 196, 146, 220, 220, 146, 220, 220, 146, 220, 220,
          196, 247, 247, 131, 196, 196, 146, 196, 196, 131, 196, 131,
        ],
        tempoMs: 185,
        wave: 'triangle',
      },
      DESERT: {
        notes: [
          330, 0, 349, 415, 440, 0, 415, 349,
          330, 293, 330, 349, 330, 0, 247, 0,
          330, 0, 349, 415, 494, 0, 440, 415,
          349, 330, 293, 247, 330, 0, 0, 0,
        ],
        bass: [
          165, 165, 247, 165, 175, 175, 247, 175,
          165, 165, 247, 165, 123, 123, 165, 123,
          165, 165, 247, 165, 220, 220, 165, 220,
          175, 165, 146, 123, 165, 165, 123, 165,
        ],
        tempoMs: 165,
        wave: 'square',
      },
      SNOW: {
        notes: [
          523, 659, 784, 659, 587, 698, 659, 523,
          440, 523, 659, 523, 494, 587, 523, 0,
          523, 659, 784, 880, 784, 659, 587, 523,
          440, 494, 523, 587, 523, 0, 0, 0,
        ],
        bass: [
          131, 196, 262, 196, 146, 220, 131, 196,
          110, 165, 220, 165, 123, 196, 131, 131,
          131, 196, 262, 196, 175, 220, 146, 196,
          110, 123, 131, 146, 131, 196, 131, 0,
        ],
        tempoMs: 165,
        wave: 'triangle',
      },
      VOLCANO: {
        notes: [
          220, 0, 262, 247, 220, 0, 196, 220,
          293, 0, 311, 293, 262, 247, 220, 0,
          330, 0, 349, 330, 293, 262, 247, 262,
          220, 196, 175, 165, 220, 0, 220, 0,
        ],
        bass: [
          110, 110, 131, 123, 110, 110, 98, 110,
          146, 146, 156, 146, 131, 123, 110, 110,
          165, 165, 175, 165, 146, 131, 123, 131,
          110, 98, 87, 82, 110, 110, 82, 110,
        ],
        tempoMs: 150,
        wave: 'sawtooth',
      },
    };

    const selected = melodies[track];
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || this.volume <= 0.01) return;
      const ctx = this.ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      const idx = this.noteIndex % selected.notes.length;
      const leadNote = selected.notes[idx];
      const bassNote = selected.bass[idx];

      if (leadNote > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = selected.wave;
        osc.frequency.setValueAtTime(leadNote, ctx.currentTime);
        const dur = (selected.tempoMs / 1000) * 0.8;
        gain.gain.setValueAtTime(0.045 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      }

      if (bassNote > 0) {
        const oscB = ctx.createOscillator();
        const gainB = ctx.createGain();
        oscB.type = 'triangle';
        oscB.frequency.setValueAtTime(bassNote, ctx.currentTime);
        const dur = (selected.tempoMs / 1000) * 0.7;
        gainB.gain.setValueAtTime(0.05 * this.volume, ctx.currentTime);
        gainB.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        oscB.connect(gainB);
        gainB.connect(ctx.destination);
        oscB.start();
        oscB.stop(ctx.currentTime + dur);
      }

      this.noteIndex++;
    }, selected.tempoMs);
  }

  private stopMusicIntervalOnly() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public stopMusic() {
    this.stopMusicIntervalOnly();
    this.currentTrack = null;
  }
}

export const soundManager = new SoundManager();
