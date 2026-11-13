// src/audio/soundEngine.ts
import { STORAGE_KEYS } from '../constants';

class QuantumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SOUND_MUTED);
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      } catch (e) {
        console.warn('[JAR-QubitLab] localStorage access denied in privacy mode.');
      }
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlock() {
    if (this.unlocked || typeof window === 'undefined') return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(0);
    osc.stop(0.01);
    
    // 🌟 優化 2：主動斷開節點，防止 Memory Leak
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    this.unlocked = true;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
      } catch (e) {} 
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  // 1. 展台 1：撥動 H 門分光桿的沉重機械聲
  playLever() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 2. 展台 1：拍下測量快門的雙層水晶質感聲
  playShutter() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const base = this.ctx.createOscillator();
    const baseGain = this.ctx.createGain();
    base.type = 'triangle';
    base.frequency.setValueAtTime(2400, t);
    base.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
    baseGain.gain.setValueAtTime(0.25, t);
    baseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    
    base.connect(baseGain);
    baseGain.connect(this.masterGain);
    
    base.onended = () => {
      base.disconnect();
      baseGain.disconnect();
    };
    base.start(t);
    base.stop(t + 0.06);

    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(2400 * 2.76, t); 
    overtoneGain.gain.setValueAtTime(0.12, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    overtone.connect(overtoneGain);
    overtoneGain.connect(this.masterGain);

    overtone.onended = () => {
      overtone.disconnect();
      overtoneGain.disconnect();
    };
    overtone.start(t);
    overtone.stop(t + 0.15);
  }

  // 3. 展台 2：相消干涉的蒸發聲
  playEvaporate() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(4000, t + 0.3); 
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.onended = () => {
      noise.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    noise.start(t);
    noise.stop(t + 0.4); 
  }

  // 4. 展台 2：相長干涉的能量合體聲
  playMerge() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(220, t + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // 5. 展台 3：抽樣滴答聲
  playTick(stepIndex = 0) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700 + stepIndex * 20, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 6. 展台 3：單次測量開獎聲
  playCollapse() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.22);
    subGain.gain.setValueAtTime(0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    
    subOsc.onended = () => {
      subOsc.disconnect();
      subGain.disconnect();
    };
    subOsc.start(t);
    subOsc.stop(t + 0.22);
    
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'triangle';
    bellOsc.frequency.setValueAtTime(1560, t);
    bellGain.gain.setValueAtTime(0.2, t);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    
    bellOsc.connect(bellGain);
    bellGain.connect(this.masterGain);
    
    bellOsc.onended = () => {
      bellOsc.disconnect();
      bellGain.disconnect();
    };
    bellOsc.start(t);
    bellOsc.stop(t + 0.35);
  }

  // 7. 展台 3：糾纏驗證成功通關音
  playVictoryChord() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; 
    
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.08; 
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };

      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  }

  // 8. 展台 3：雜質警告音
  playGlitch() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);
    filter.Q.setValueAtTime(1.5, t);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(85, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // 🌟 9. 展台 4：光球飛越 (0.6秒)
  public playTeleport() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.6);

    filter.type = 'bandpass';
    filter.Q.value = 5;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1500, t + 0.6);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // 🌟 10. 展台 4：成功修正 (0.8秒，C-E-G-C 琶音)
  public playSuccess() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = t + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  // 🌟 11. 展台 4：失敗修正 (0.3秒，120→60Hz 下滑)
  public playFail() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(100, t + 0.3);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const sound = new QuantumAudioEngine();
