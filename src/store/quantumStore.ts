// src/store/quantumStore.ts
import { create } from 'zustand';
import { ComplexAmplitude, GateName } from '../quantum/types';
import { initZeroState, applyGatePure } from '../quantum/engine';

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
  
  applyGate: (gate: GateName, targets: number[]) => void;
  measureOutcome: (rng?: () => number) => number;
  collapse: (rng?: () => number) => number;
  reset: () => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: INITIAL_QUBITS,
  ...initZeroState(INITIAL_QUBITS),
  isMaximallyEntangled: false,

  applyGate: (gate, targets) => {
    const { amplitudes, refIdx, qubitCount } = get();
    
    // 防禦性複製：剝除派生欄位，強制引擎重新計算
    const rawInput = amplitudes.map((a) => ({ re: a.re, im: a.im }));
    const nextState = applyGatePure(rawInput, refIdx, gate, targets, qubitCount);

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

    const rand = rng() * totalProb; // 縮放至實際總機率
    let cumulative = 0;
    
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) return i;
    }
    
    return maxIdx; // 浮點誤差的絕對底線防護
  },

  collapse: (rng = Math.random) => {
    const { qubitCount, measureOutcome } = get();
    const outcomeIdx = measureOutcome(rng);
    const size = 1 << qubitCount;

    // 直接構造坍縮後的基態 |outcomeIdx⟩
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
    const qCount = get().qubitCount;
    set({ ...initZeroState(qCount), isMaximallyEntangled: false });
  },
}));
