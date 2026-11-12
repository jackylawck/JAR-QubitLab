// src/store/quantumStore.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { create } from 'zustand';
import { ComplexAmplitude, GateName } from '../quantum/types';
import { TensorEngine, GATES } from '../quantum/tensorEngine';
import { QUANTUM_CONFIG } from '../constants'; 

export interface QuantumState {
  qubitCount: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
  isMaximallyEntangled: boolean;

  // 通用操作與測量 (Sprint 1)
  applyGate: (gate: GateName, targets: number[]) => void;
  collapse: (rng?: () => number) => number;
  reset: () => void;
  resetBoothOne: () => void;

  // 連續相位干涉專用 (Sprint 2)
  isSplit: boolean;
  phaseAngle: number;
  // 🌟 Zero-GC 優化：使用 Float64Array 取代物件陣列深拷貝
  _afterHSnapshotState: Float64Array | null; 
  _afterHSnapshotRefIdx: number | null;
  
  splitBoothTwo: () => void;
  setPhaseAngle: (angle: number) => void;
  collideBoothTwo: () => void;
  resetBoothTwo: () => void;
}

// 🌟 全域共享的單量子位元引擎，所有 Booth 1 & 2 的運算都在此記憶體池中進行
const engine = new TensorEngine(QUANTUM_CONFIG.INITIAL_QUBITS);

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: QUANTUM_CONFIG.INITIAL_QUBITS, 
  amplitudes: engine.getAmplitudes(),
  refIdx: engine.refIdx,
  isMaximallyEntangled: false, // 單 Qubit 永遠為 false

  // ==========================================
  // Sprint 1: 通用邏輯與測量坍縮
  // ==========================================
  applyGate: (gateName, targets) => {
    set(() => {
      const gate = GATES[gateName];
      if (gate) {
        engine.applyGate(gate, targets[0]);
      }
      return {
        amplitudes: engine.getAmplitudes(),
        refIdx: engine.refIdx,
      };
    });
  },

  collapse: () => {
    let outcome = 0;
    set(() => {
      // 🌟 直接調用高階引擎的測量方法，處理坍縮與歸一化
      outcome = engine.measureQubit(0);
      return {
        amplitudes: engine.getAmplitudes(),
        refIdx: engine.refIdx,
      };
    });
    return outcome;
  },

  reset: () => {
    engine.reset();
    set({
      amplitudes: engine.getAmplitudes(),
      refIdx: engine.refIdx,
      isMaximallyEntangled: false,
      isSplit: false,
      phaseAngle: 0,
      _afterHSnapshotState: null,
      _afterHSnapshotRefIdx: null,
    });
  },
  resetBoothOne: () => get().reset(),

  // ==========================================
  // Sprint 2: 展台 2 專用連續干涉邏輯
  // ==========================================
  isSplit: false,
  phaseAngle: 0,
  _afterHSnapshotState: null,
  _afterHSnapshotRefIdx: null,

  splitBoothTwo: () => {
    set(() => {
      engine.reset();
      const H = GATES.H;
      if (H) engine.applyGate(H, 0);
      
      // 🌟 Zero-GC 快照：直接複製底層陣列記憶體
      const snapshot = new Float64Array(engine.state);

      return {
        isSplit: true,
        phaseAngle: 0,
        amplitudes: engine.getAmplitudes(),
        refIdx: engine.refIdx,
        _afterHSnapshotState: snapshot, 
        _afterHSnapshotRefIdx: engine.refIdx,
      };
    });
  },

  setPhaseAngle: (angle: number) => {
    const normAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    set((state) => {
      if (!state.isSplit || !state._afterHSnapshotState || state._afterHSnapshotRefIdx === null) {
        return { phaseAngle: normAngle };
      }

      // 🌟 極速狀態恢復：覆寫陣列，瞬間時光倒流
      engine.state.set(state._afterHSnapshotState);
      engine.refIdx = state._afterHSnapshotRefIdx;

      // 在恢復的狀態上套用新的 Phase (模擬 Z 軸旋轉)
      // |ψ⟩ = (|0⟩ + e^{iφ}|1⟩)/√2
      const P = [
        { re: 1, im: 0 }, { re: 0, im: 0 },
        { re: 0, im: 0 }, { re: Math.cos(normAngle), im: Math.sin(normAngle) }
      ];
      engine.applyGate(P, 0);

      return {
        phaseAngle: normAngle,
        amplitudes: engine.getAmplitudes(),
        refIdx: engine.refIdx,
      };
    });
  },

  collideBoothTwo: () => {
    set((state) => {
      if (!state.isSplit) return state;
      const H = GATES.H;
      if (H) engine.applyGate(H, 0);

      return {
        isSplit: false,
        amplitudes: engine.getAmplitudes(),
        refIdx: engine.refIdx,
        _afterHSnapshotState: null,
        _afterHSnapshotRefIdx: null,
      };
    });
  },

  resetBoothTwo: () => get().reset(),
}));
