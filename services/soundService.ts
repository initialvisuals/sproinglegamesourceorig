class SoundService {
  private audioContext: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicScheduler: number | null = null;
  private nextNoteTime = 0;
  private currentNote = 0;

  // E Arabic Scale (Hijaz Kar) starting from E3
  private readonly E_ARABIC_SCALE_HZ = [
    164.81, // E3
    174.61, // F3
    207.65, // G#3
    220.00, // A3
    246.94, // B3
    261.63, // C4
    311.13, // D#4
    329.63, // E4 (octave)
  ];

  // 8 bars, 8th notes (16 notes per 2 bars)
  private readonly melodySequence = [
    0, 5, 4, 3, 2, 3, 4, 3, 0, 5, 4, 3, 2, 1, 0, null,
    0, 6, 5, 4, 3, 4, 5, 4, 0, 6, 5, 4, 3, 2, 1, null,
    1, 5, 4, 3, 2, 3, 4, 3, 1, 5, 4, 3, 2, 1, 0, null,
    2, 6, 5, 4, 3, 4, 5, 4, 2, 5, 4, 3, 2, 1, 2, null,
  ];
  // 8 bars, quarter notes (4 notes per 2 bars)
  private readonly bassSequence = [
    0, 3, 4, 1,
    0, 4, 3, 2,
    1, 4, 3, 0,
    2, 3, 4, 0,
  ];
  private readonly NOTE_DURATION = 0.18; // 8th notes at ~166bpm

  private getContext(): AudioContext | null {
    if (!this.audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = context;

      this.sfxGainNode = context.createGain();
      this.sfxGainNode.connect(context.destination);

      this.musicGainNode = context.createGain();
      this.musicGainNode.connect(context.destination);
    }
    return this.audioContext;
  }

  public resumeContext() {
    const context = this.getContext();
    if (context && context.state === 'suspended') {
      context.resume();
    }
  }

  setMusicVolume(volume: number) {
    this.getContext();
    if(this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(volume * 0.4, this.audioContext!.currentTime); // Max music volume is 40%
    }
  }

  setSfxVolume(volume: number) {
    this.getContext();
    if (this.sfxGainNode) {
        this.sfxGainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  private playSound(type: OscillatorType, frequency: number, duration: number, volume = 0.5, attack = 0.01, decay = 0.1, freqSweep = 0, onEnded?: () => void) {
    const context = this.getContext();
    if (!context || !this.sfxGainNode) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    gainNode.connect(this.sfxGainNode);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    if (freqSweep !== 0) {
      oscillator.frequency.exponentialRampToValueAtTime(frequency + freqSweep, context.currentTime + duration);
    }
    
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    
    oscillator.connect(gainNode);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
    if (onEnded) oscillator.onended = onEnded;
  }
  
  private playMusicNote(noteTime: number, type: OscillatorType, freq: number, duration: number, volume: number) {
    const context = this.getContext();
    if (!context || !this.musicGainNode) return;
    
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = freq + (Math.random() * 2 - 1);

    const gainNode = context.createGain();
    gainNode.connect(this.musicGainNode);
    gainNode.gain.setValueAtTime(0, noteTime);
    gainNode.gain.linearRampToValueAtTime(volume, noteTime + 0.01);
    gainNode.gain.setValueAtTime(volume, noteTime + duration * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, noteTime + duration);
    
    oscillator.connect(gainNode);
    oscillator.start(noteTime);
    oscillator.stop(noteTime + duration);
  }

  private scheduleNotes() {
    const context = this.getContext();
    if (!context || !this.isMusicPlaying) return;

    while (this.nextNoteTime < context.currentTime + 0.1) {
      const melodyNoteIndex = this.melodySequence[this.currentNote % this.melodySequence.length];
      if (melodyNoteIndex !== null) {
        const freq = this.E_ARABIC_SCALE_HZ[melodyNoteIndex] * 2;
        this.playMusicNote(this.nextNoteTime, 'triangle', freq, this.NOTE_DURATION, 0.6);
      }
      if (this.currentNote % 2 === 0) {
        const bassNoteIndex = this.bassSequence[Math.floor(this.currentNote / 2) % this.bassSequence.length];
        const freq = this.E_ARABIC_SCALE_HZ[bassNoteIndex];
        this.playMusicNote(this.nextNoteTime, 'square', freq, this.NOTE_DURATION * 2, 0.4);
      }
      this.nextNoteTime += this.NOTE_DURATION;
      this.currentNote++;
    }
    this.musicScheduler = window.setTimeout(() => this.scheduleNotes(), 25);
  }

  playBackgroundMusic() {
    if (this.isMusicPlaying) return;
    const context = this.getContext();
    if (!context || !this.musicGainNode) return;
    this.isMusicPlaying = true;
    this.currentNote = 0;
    this.nextNoteTime = context.currentTime;
    this.scheduleNotes();
  }

  stopBackgroundMusic() {
    if (!this.isMusicPlaying) return;
    if (this.musicScheduler) {
      clearTimeout(this.musicScheduler);
      this.musicScheduler = null;
    }
    this.isMusicPlaying = false;
  }

  playSproing() { this.playSound('sine', 440, 0.2, 0.3, 0.01, 0.15, 880); }
  playCrunch() { this.playSound('square', 100, 0.15, 0.4, 0.01, 0.1, -50); }
  playBump() { this.playSound('sawtooth', 80, 0.1, 0.3, 0.01, 0.08); }
  playHeal() {
    this.playSound('sine', 523, 0.4, 0.4, 0.01, 0.3);
    setTimeout(() => this.playSound('sine', 659, 0.3, 0.4, 0.01, 0.2), 100);
  }
  playPlayerDeath() { this.playSound('sawtooth', 200, 0.8, 0.5, 0.02, 0.7, -150); }
  playEnemyDeath() { this.playSound('square', 150, 0.3, 0.4, 0.01, 0.25, -100); }
  playNextLevel() {
    this.playSound('triangle', 330, 0.2, 0.3, 0.01, 0.15, 330);
    setTimeout(() => this.playSound('triangle', 660, 0.3, 0.3, 0.01, 0.25, 330), 150);
  }
  playStart() {
    this.playSound('sine', 261, 0.1, 0.3);
    setTimeout(() => this.playSound('sine', 329, 0.1, 0.3), 100);
    setTimeout(() => this.playSound('sine', 392, 0.2, 0.3), 200);
  }
  playSelect() { this.playSound('triangle', 800, 0.1, 0.2); }
  playTrap() { this.playSound('square', 1200, 0.08, 0.3, 0.005, 0.05, -800); }
  playGoldPickup() {
    this.playSound('sine', 1046, 0.1, 0.2, 0.01, 0.08);
    setTimeout(() => this.playSound('sine', 1318, 0.15, 0.2, 0.01, 0.12), 80);
  }
  playArrowPickup() { this.playSound('triangle', 600, 0.15, 0.3, 0.01, 0.1, 200); }
  playArrowFire() { this.playSound('sawtooth', 1500, 0.2, 0.2, 0.01, 0.18, -1000); }
  playArrowHit() { this.playSound('square', 300, 0.1, 0.4, 0.005, 0.08); }
  playBombDrop() { this.playSound('sine', 300, 0.2, 0.4, 0.01, 0.1, -100); }
  playExplosion() { this.playSound('sawtooth', 50, 0.8, 0.6, 0.01, 0.7, 200); }
  playFall() { this.playSound('sawtooth', 400, 0.6, 0.4, 0.01, 0.5, -350); }
  playLevelUp() {
    this.playSound('sine', 440, 0.1, 0.4);
    setTimeout(() => this.playSound('sine', 554, 0.1, 0.4), 100);
    setTimeout(() => this.playSound('sine', 660, 0.1, 0.4), 200);
    setTimeout(() => this.playSound('sine', 880, 0.4, 0.4), 300);
  }
  playShopBuy() {
    this.playSound('triangle', 1200, 0.1, 0.25);
    setTimeout(() => this.playSound('triangle', 1500, 0.15, 0.25), 100);
  }
  playPoisoned() { this.playSound('sawtooth', 400, 0.3, 0.3, 0.01, 0.2, -200); }
  playPoisonTick() { this.playSound('square', 200, 0.1, 0.2, 0.01, 0.08, 100); }
  playCure() { this.playSound('sine', 880, 0.5, 0.4, 0.01, 0.4, 200); }
}

export const soundService = new SoundService();