// src/store/quantumStore.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { create } from 'zustand';
import { ComplexAmplitude, GateName, RawComplex } from '../quantum/types';
import {
  initZeroState,
  applyGatePure,
  applyPhaseGate,
  calculateConcurrence,
  measureCollapsePure,
} from '../quantum/engine';
import { QUANTUM_CONFIG } from '../constants'; // 🌟 引入全域設定，消滅雙重真相源

export interface QuantumState {
  qubitCount: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
  isMaximallyEntangled: boolean;

  // 核心通用與測量 API (Sprint 1 & Sprint 3)
  applyGate: (gate: GateName, targets: number[]) => void;
  collapse: (rng?: () => number) => number;
  reset: () => void;
  resetBoothOne: () => void;

  // 連續相位干涉專用 API (Sprint 2 展台 2)
  isSplit: boolean;
  phaseAngle: number;
  _afterHSnapshot: ReadonlyArray<RawComplex> | null; 
  splitBoothTwo: () => void;
  setPhaseAngle: (angle: number) => void;
  collideBoothTwo: () => void;
  resetBoothTwo: () => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: QUANTUM_CONFIG.INITIAL_QUBITS, // 🌟 使用 constants
  ...initZeroState(QUANTUM_CONFIG.INITIAL_QUBITS),
  isMaximallyEntangled: false,

  // ==========================================
  // Sprint 1 & 3: 通用邏輯與測量坍縮
  // ==========================================
  applyGate: (gate, targets) => {
    set((state) => {
      const { amplitudes: nextAmps, refIdx: nextRef } = applyGatePure(
        state.amplitudes,
        state.refIdx,
        gate,
        targets,
        state.qubitCount
      );
      return {
        amplitudes: nextAmps,
        refIdx: nextRef,
        isMaximallyEntangled: calculateConcurrence(nextAmps) > 0.99, // 🌟 對接引擎原生函數
      };
    });
  },

  collapse: (rng = Math.random) => {
    let outcome = 0;
    set((state) => {
      // 🌟 將骯髒的機率擲骰邏輯外包給純函數 `measureCollapsePure`，Store 保持純淨
      const result = measureCollapsePure(state.amplitudes, state.qubitCount, rng);
      outcome = result.collapsedIndex;
      return {
        amplitudes: result.amplitudes,
        refIdx: result.refIdx,
        isMaximallyEntangled: false,
      };
    });
    return outcome;
  },

  reset: () => {
    set((state) => ({
      ...initZeroState(state.qubitCount),
      isMaximallyEntangled: false,
      isSplit: false,
      phaseAngle: 0,
      _afterHSnapshot: null,
    }));
  },
  resetBoothOne: () => get().reset(),

  // ==========================================
  // Sprint 2: 展台 2 專用連續干涉邏輯
  // ==========================================
  isSplit: false,
  phaseAngle: 0,
  _afterHSnapshot: null,

  splitBoothTwo: () => {
    set((state) => {
      const zero = initZeroState(state.qubitCount);
      const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], state.qubitCount);
      
      // 🌟 優化 1：深拷貝快取，徹底杜絕物件參照污染 (Object Reference Contamination)
      // 在嚴苛的 React 18 Concurrent Mode 甚至未來的 GC 週期中，
      // 若 afterH.amplitudes 與 _afterHSnapshot 指向同一個記憶體位址，
      // 可能導致後續在 setPhaseAngle 修改狀態時，原始快照被意外覆寫。
      const snapshot: ReadonlyArray<RawComplex> = afterH.amplitudes.map(amp => ({ re: amp.re, im: amp.im }));

      return {
        isSplit: true,
        phaseAngle: 0,
        amplitudes: afterH.amplitudes,
        refIdx: afterH.refIdx,
        isMaximallyEntangled: false,
        _afterHSnapshot: snapshot, 
      };
    });
  },

  setPhaseAngle: (angle: number) => {
    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    set((state) => {
      if (!state.isSplit || !state._afterHSnapshot) return { phaseAngle: normAngle };

      // 🌟 60Hz 極速運算：傳入快取的 Raw 狀態陣列
      const afterP = applyPhaseGate(
        state._afterHSnapshot,
        normAngle,
        0,
        state.qubitCount,
        state.refIdx
      );

      return {
        phaseAngle: normAngle,
        amplitudes: afterP.amplitudes,
        refIdx: afterP.refIdx,
        isMaximallyEntangled: false,
      };
    });
  },

  collideBoothTwo: () => {
    set((state) => {
      if (!state.isSplit) return state;
      const finalState = applyGatePure(state.amplitudes, state.refIdx, 'H', [0], state.qubitCount);
      return {
        isSplit: false,
        amplitudes: finalState.amplitudes,
        refIdx: finalState.refIdx,
        isMaximallyEntangled: false,
        _afterHSnapshot: null,
      };
    });
  },

  resetBoothTwo: () => get().reset(),
}));
