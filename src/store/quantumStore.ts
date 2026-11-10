// src/store/quantumStore.ts
import { create } from 'zustand';
import { ComplexAmplitude, GateName } from '../quantum/types';
import { initZeroState, applyGatePure, applyPhaseGate } from '../quantum/engine';

const INITIAL_QUBITS = 2;

/**
 * 2-qubit concurrence: C = 2|a00·a11 − a01·a10|
 * C = 0 → 可分態；C = 1 → 最大糾纏（貝爾態）。
 * 這是區分「H 後的可分疊加」與「CNOT 後的不可分糾纏」的唯一物理度量。
 * ⚠️ 僅支援 2-qubit。3+ qubit 需改用 negativity 或 von Neumann entropy。
 */
function computeConcurrence(amps: ComplexAmplitude[]): number {
  if (amps.length !== 4) return 0;
  const [a00, a01, a10, a11] = amps;
  
  const re = a00.re * a11.re - a00.im * a11.im - (a01.re * a10.re - a01.im * a10.im);
  const im = a00.re * a11.im + a00.im * a11.re - (a01.re * a10.im + a01.im * a10.re);
  
  return 2 * Math.sqrt(re * re + im * im);
}

export interface QuantumState {
  qubitCount: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
  isMaximallyEntangled: boolean;
  
  // 核心通用與測量 API (Sprint 1 & Sprint 3)
  applyGate: (gate: GateName, targets: number[]) => void;
  measureOutcome: (rng?: () => number) => number;
  collapse: (rng?: () => number) => number;
  reset: () => void;
  resetBoothOne: () => void;

  // 連續相位干涉專用 API (Sprint 2 展台 2)
  isSplit: boolean;
  phaseAngle: number; // 弧度 [0, 2π)
  _afterHSnapshot: { amplitudes: ComplexAmplitude[]; refIdx: number } | null; // 🌟 效能優化：態向量快取
  splitBoothTwo: () => void;
  setPhaseAngle: (angle: number) => void;
  collideBoothTwo: () => void;
  resetBoothTwo: () => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: INITIAL_QUBITS,
  ...initZeroState(INITIAL_QUBITS),
  isMaximallyEntangled: false,

  // ==========================================
  // Sprint 1 & 3: 通用邏輯與測量坍縮
  // ==========================================
  applyGate: (gate, targets) => {
    const { amplitudes, refIdx, qubitCount } = get();
    
    // 🌟 優化：引擎已具備防禦性拷貝，直接傳入 amplitudes
    const nextState = applyGatePure(amplitudes, refIdx, gate, targets, qubitCount);

    set({
      amplitudes: nextState.amplitudes,
      refIdx: nextState.refIdx,
      isMaximallyEntangled: computeConcurrence(nextState.amplitudes) > 0.99,
    });
  },

  measureOutcome: (rng = Math.random) => {
    const { amplitudes } = get();
    
    let maxIdx = 0;
    let maxProb = -1;
    let totalProb = 0;
    
    const probs = amplitudes.map((a, i) => {
      const p = a.modulus ** 2;
      if (p > maxProb) {
        maxProb = p;
        maxIdx = i;
      }
      totalProb += p;
      return p;
    });

    const rand = rng() * totalProb;
    let cumulative = 0;
    
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) return i;
    }
    
    return maxIdx;
  },

  collapse: (rng = Math.random) => {
    const { qubitCount, measureOutcome } = get();
    const outcomeIdx = measureOutcome(rng);
    const size = 1 << qubitCount;

    const collapsedAmps: ComplexAmplitude[] = Array.from({ length: size }, (_, i) => ({
      re: i === outcomeIdx ? 1 : 0,
      im: 0,
      modulus: i === outcomeIdx ? 1 : 0,
      phase: 0,
    }));

    set({
      amplitudes: collapsedAmps,
      refIdx: outcomeIdx,
      isMaximallyEntangled: false,
    });

    return outcomeIdx;
  },

  reset: () => {
    const zero = initZeroState(get().qubitCount);
    set({ 
      ...zero, 
      isMaximallyEntangled: false,
      isSplit: false,
      phaseAngle: 0,
      _afterHSnapshot: null
    });
  },
  resetBoothOne: () => get().reset(),

  // ==========================================
  // Sprint 2: 展台 2 專用連續干涉邏輯
  // ==========================================
  isSplit: false,
  phaseAngle: 0,
  _afterHSnapshot: null,

  splitBoothTwo: () => {
    const { qubitCount } = get();
    const zero = initZeroState(qubitCount);
    
    // 🌟 優化：直接傳入 amplitudes
    const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], qubitCount);
    
    set({
      isSplit: true,
      phaseAngle: 0,
      amplitudes: afterH.amplitudes,
      refIdx: afterH.refIdx,
      isMaximallyEntangled: false,
      _afterHSnapshot: afterH, // 🌟 建立快取，供 setPhaseAngle 60Hz 拖曳時復用
    });
  },

  setPhaseAngle: (angle: number) => {
    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const { qubitCount, isSplit, _afterHSnapshot } = get();

    if (!isSplit || !_afterHSnapshot) {
      set({ phaseAngle: normAngle });
      return;
    }

    // 🌟 效能優化：直接從 _afterHSnapshot (H 門之後的基底態) 計算相移
    // 徹底消除每幀重建 |00> 與重新計算 H 門的 GC 與浮點運算開銷
    const afterP = applyPhaseGate(
      _afterHSnapshot.amplitudes, 
      normAngle, 
      0, 
      qubitCount, 
      _afterHSnapshot.refIdx
    );

    set({
      phaseAngle: normAngle,
      amplitudes: afterP.amplitudes,
      refIdx: afterP.refIdx,
      isMaximallyEntangled: false,
    });
  },

  collideBoothTwo: () => {
    const { amplitudes, refIdx, qubitCount, isSplit } = get();
    if (!isSplit) return;

    // 🌟 優化：直接傳入 amplitudes
    const finalState = applyGatePure(amplitudes, refIdx, 'H', [0], qubitCount);
    
    set({
      isSplit: false,
      amplitudes: finalState.amplitudes,
      refIdx: finalState.refIdx,
      isMaximallyEntangled: false,
      _afterHSnapshot: null, // 對撞後清空快取
    });
  },

  resetBoothTwo: () => get().reset(),
}));
