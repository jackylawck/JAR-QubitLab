// src/audio/soundEngine.ts
import { STORAGE_KEYS } from '../constants'; // 🌟 1. 引入常數

class QuantumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // 🌟 2. 使用常數避免魔法字串，並加入隱私模式存取防護
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

  // 全域解除掛起 (適用於 iOS Safari 嚴格策略)
  public unlock() {
    if (this.unlocked || typeof window === 'undefined') return;
    this.init();
    if (!this.ctx) return;

    // 播放一個極短的無聲震盪器，強制喚醒 AudioContext
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(0);
    osc.stop(0.01);

    this.unlocked = true;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        // 🌟 3. 使用常數，並加入隱私模式寫入防護
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

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // 5. 展台 3：抽樣滴答聲 (音高隨步數遞增)
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
    
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 6. 展台 3：單次測量開獎聲 (低頻衝擊 + 金屬鈴音)
  playCollapse() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    // 低頻衝擊
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.22);
    subGain.gain.setValueAtTime(0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.22);
    
    // 金屬鈴音
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'triangle';
    bellOsc.frequency.setValueAtTime(1560, t);
    bellGain.gain.setValueAtTime(0.2, t);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    bellOsc.connect(bellGain);
    bellGain.connect(this.masterGain);
    bellOsc.start(t);
    bellOsc.stop(t + 0.35);
  }

  // 7. 展台 3：糾纏驗證成功通關音 (C-E-G 和弦)
  playVictoryChord() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, idx) => {
      // 🌟 4. 型別安全修正：雖然 init() 確保 ctx 不為 null，但在 forEach 的 Closure 內，
      // TS 無法保證 this.ctx 在執行當下絕對不為 null。加入 Optional Chaining (?.) 與 if 檢查。
      if (!this.ctx || !this.masterGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.08; // 琶音效果
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  }

  // 8. 展台 3：雜質警告音 (低頻鋸齒波)
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
    
    osc.start(t);
    osc.stop(t + 0.14);
  }
}

export const sound = new QuantumAudioEngine();
