// src/store/quantumStore.ts
import { create } from 'zustand';
import { ComplexAmplitude, GateName } from '../quantum/types';
import { initZeroState, applyGatePure } from '../quantum/engine';

interface QuantumState {
  qubitCount: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
  isMaximallyEntangled: boolean;
  applyGate: (gate: GateName, targets: number[]) => void;
  measureOutcome: (rng?: () => number) => number;
  reset: () => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: 2,
  ...initZeroState(2),
  isMaximallyEntangled: false,

  applyGate: (gate, targets) => {
    const { amplitudes, refIdx, qubitCount } = get();
    
    // 嚴格轉型為 RawComplex，遵守 engine.ts 的輸入契約
    const rawInput = amplitudes.map((a) => ({ re: a.re, im: a.im }));
    
    const nextState = applyGatePure(
      rawInput,
      refIdx,
      gate,
      targets,
      qubitCount
    );

    // 糾纏態啟發式判定 (針對 2-Qubit 簡化版)：
    // 當有兩個狀態的機率各佔 50% (|α| ≈ 0.707)，其餘為 0 時，觸發展台 3 的連鎖扭蛋條件
    let isEntangled = false;
    if (qubitCount === 2) {
      const activeStates = nextState.amplitudes.filter(a => a.modulus > 0.1);
      if (activeStates.length === 2) {
        isEntangled = activeStates.every(a => Math.abs(a.modulus - 0.707) < 0.05);
      }
    }

    set({
      amplitudes: nextState.amplitudes,
      refIdx: nextState.refIdx,
      isMaximallyEntangled: isEntangled
    });
  },

  measureOutcome: (rng = Math.random) => {
    const { amplitudes } = get();
    const rand = rng();
    let cumulative = 0;
    
    // 依據模長平方 (機率) 進行輪盤賭選擇
    for (let i = 0; i < amplitudes.length; i++) {
      cumulative += amplitudes[i].modulus ** 2;
      if (rand <= cumulative) return i;
    }
    return amplitudes.length - 1; // 浮點誤差 Fallback
  },

  reset: () => {
    const qCount = get().qubitCount;
    set({ ...initZeroState(qCount), isMaximallyEntangled: false });
  }
}));
