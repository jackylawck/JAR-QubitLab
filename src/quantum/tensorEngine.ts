// src/quantum/tensorEngine.ts
/*
 * Project: J.A.R. QubitLab
 * Description: Zero-GC Multi-Qubit State Vector Engine
 * Sprint 3 專用，與 engine.ts 並存，不替換。
 */
import { QUANTUM_CONFIG } from '../constants';

export type QuantumGate = [number, number, number, number, number, number, number, number];

const INV_SQRT2 = 1 / Math.SQRT2;

export const GATES: Record<string, QuantumGate> = {
  H: [INV_SQRT2, 0, INV_SQRT2, 0, INV_SQRT2, 0, -INV_SQRT2, 0],
  X: [0, 0, 1, 0, 1, 0, 0, 0],
  Z: [1, 0, 0, 0, 0, 0, -1, 0],
};

export interface TensorAmplitude {
  index: number;
  re: number;
  im: number;
  modulus: number;
  phase: number;
  probability: number;
  label: string;
}

export class TensorEngine {
  public numQubits: number;
  public stateSize: number;
  public state: Float64Array;
  public refIdx: number;

  constructor(numQubits: number = 2) {
    if (numQubits > QUANTUM_CONFIG.MAX_SUPPORTED_QUBITS) {
      throw new Error(`[TensorEngine] Exceeded MAX_SUPPORTED_QUBITS: ${QUANTUM_CONFIG.MAX_SUPPORTED_QUBITS}`);
    }
    this.numQubits = numQubits;
    this.stateSize = 1 << numQubits;
    this.state = new Float64Array(this.stateSize * 2);
    this.refIdx = 0;
    this.reset();
  }

  public reset(): void {
    this.state.fill(0);
    this.state[0] = 1;
    this.refIdx = 0;
  }

  private bitMask(targetQubit: number): number {
    return 1 << (this.numQubits - 1 - targetQubit);
  }

  private lockGlobalPhase(prevRefIdx: number): void {
    let bestIdx = 0;
    let bestModSq = -1;
    for (let i = 0; i < this.stateSize; i++) {
      // 🌟 修復 TS2532：防禦陣列讀取
      const r = this.state[i * 2] ?? 0;
      const im = this.state[i * 2 + 1] ?? 0;
      const m = r * r + im * im;
      if (m > bestModSq + 1e-9) {
        bestModSq = m;
        bestIdx = i;
      }
    }

    const prevR = this.state[prevRefIdx * 2] ?? 0;
    const prevI = this.state[prevRefIdx * 2 + 1] ?? 0;
    const prevModSq = prevR * prevR + prevI * prevI;
    const shouldSwitch = prevModSq < 1e-6 || bestModSq > prevModSq * 1.5;
    const refIdx = shouldSwitch ? bestIdx : prevRefIdx;

    const refR = this.state[refIdx * 2] ?? 0;
    const refI = this.state[refIdx * 2 + 1] ?? 0;
    const refPhase = Math.atan2(refI, refR);
    const cos = Math.cos(-refPhase);
    const sin = Math.sin(-refPhase);

    for (let i = 0; i < this.stateSize; i++) {
      const r = this.state[i * 2] ?? 0;
      const im = this.state[i * 2 + 1] ?? 0;
      this.state[i * 2] = r * cos - im * sin;
      this.state[i * 2 + 1] = r * sin + im * cos;
    }

    this.refIdx = refIdx;
  }

  public applyGate(gate: QuantumGate, targetQubit: number): void {
    const bit = this.bitMask(targetQubit);
    const [m00r = 0, m00i = 0, m01r = 0, m01i = 0, m10r = 0, m10i = 0, m11r = 0, m11i = 0] = gate; // 🌟 防禦解構

    for (let i = 0; i < this.stateSize; i++) {
      if ((i & bit) === 0) {
        const j = i | bit;
        const r0 = this.state[i * 2] ?? 0;
        const i0 = this.state[i * 2 + 1] ?? 0;
        const r1 = this.state[j * 2] ?? 0;
        const i1 = this.state[j * 2 + 1] ?? 0;

        this.state[i * 2]     = (m00r * r0 - m00i * i0) + (m01r * r1 - m01i * i1);
        this.state[i * 2 + 1] = (m00r * i0 + m00i * r0) + (m01r * i1 + m01i * r1);
        this.state[j * 2]     = (m10r * r0 - m10i * i0) + (m11r * r1 - m11i * i1);
        this.state[j * 2 + 1] = (m10r * i0 + m10i * r0) + (m11r * i1 + m11i * r1);
      }
    }

    this.lockGlobalPhase(this.refIdx);
  }

  public applyPhaseGate(phi: number, targetQubit: number): void {
    const bit = this.bitMask(targetQubit);
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);

    for (let i = 0; i < this.stateSize; i++) {
      if ((i & bit) !== 0) {
        const r = this.state[i * 2] ?? 0;
        const im = this.state[i * 2 + 1] ?? 0;
        this.state[i * 2]     = r * cos - im * sin;
        this.state[i * 2 + 1] = r * sin + im * cos;
      }
    }

    this.lockGlobalPhase(this.refIdx);
  }

  public applyCNOT(controlQubit: number, targetQubit: number): void {
    if (controlQubit === targetQubit) return;
    const ctrlBit = this.bitMask(controlQubit);
    const tgtBit = this.bitMask(targetQubit);

    for (let i = 0; i < this.stateSize; i++) {
      if ((i & ctrlBit) !== 0 && (i & tgtBit) === 0) {
        const j = i | tgtBit;
        const tr = this.state[i * 2] ?? 0;
        const ti = this.state[i * 2 + 1] ?? 0;
        this.state[i * 2]     = this.state[j * 2] ?? 0;
        this.state[i * 2 + 1] = this.state[j * 2 + 1] ?? 0;
        this.state[j * 2]     = tr;
        this.state[j * 2 + 1] = ti;
      }
    }

    this.lockGlobalPhase(this.refIdx);
  }

  public collapse(): number {
    const rand = Math.random();
    let cumulative = 0;
    let idx = 0;

    for (let i = 0; i < this.stateSize; i++) {
      const r = this.state[i * 2] ?? 0;
      const im = this.state[i * 2 + 1] ?? 0;
      cumulative += r * r + im * im;
      if (rand <= cumulative || i === this.stateSize - 1) {
        idx = i;
        break;
      }
    }

    this.state.fill(0);
    this.state[idx * 2] = 1;
    this.refIdx = idx;
    return idx;
  }

  public getAmplitudes(): TensorAmplitude[] {
    const results: TensorAmplitude[] = [];
    for (let i = 0; i < this.stateSize; i++) {
      const re = this.state[i * 2] ?? 0;
      const im = this.state[i * 2 + 1] ?? 0;
      const probability = re * re + im * im;
      const modulus = Math.sqrt(probability);
      let phase = Math.atan2(im, re);
      if (modulus < QUANTUM_CONFIG.EPSILON) phase = 0;

      results.push({
        index: i,
        re,
        im,
        modulus,
        phase,
        probability,
        label: `|${i.toString(2).padStart(this.numQubits, '0')}⟩`,
      });
    }
    return results;
  }

  public computeConcurrence(): number {
    if (this.numQubits !== 2) return 0;
    const amps = this.getAmplitudes();
    
    // 🌟 核心修復：使用安全降級物件取代強制陣列解構 (消除 TS18048)
    const a00 = amps[0] ?? { re: 0, im: 0 };
    const a01 = amps[1] ?? { re: 0, im: 0 };
    const a10 = amps[2] ?? { re: 0, im: 0 };
    const a11 = amps[3] ?? { re: 0, im: 0 };
    
    const re = a00.re * a11.re - a00.im * a11.im - (a01.re * a10.re - a01.im * a10.im);
    const im = a00.re * a11.im + a00.im * a11.re - (a01.re * a10.im + a01.im * a10.re);
    return 2 * Math.sqrt(re * re + im * im);
  }
}
