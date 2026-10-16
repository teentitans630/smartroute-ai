class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private isSpeaking = false;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a distinct, ISO-standard highway safety auditory warning chime.
   * Dual-tone pulsed buzzer: 880Hz (A5) descending to 660Hz (E5).
   */
  public playEmergencyChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Pulse 1: 880Hz
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.15);

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Pulse 2: 980Hz - 660Hz (Higher urgency second pip)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(987, now + 0.22);
      osc2.frequency.exponentialRampToValueAtTime(659, now + 0.42);

      gain2.gain.setValueAtTime(0.28, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.47);
    } catch (e) {
      console.warn('Audio chime playback omitted or blocked by browser policy:', e);
    }
  }

  /**
   * Spoken audio announcement via SpeechSynthesis.
   */
  public speakAlert(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isSpeaking) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  }

  public triggerFullWarning(message: string, spokenText: string, isMuted: boolean = false) {
    if (isMuted) return;
    this.playEmergencyChime();
    setTimeout(() => {
      this.speakAlert(spokenText);
    }, 450);
  }
}

export const soundAlert = new AudioAlertService();
