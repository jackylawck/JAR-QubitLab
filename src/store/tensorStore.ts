// src/store/tensorStore.ts（Sprint 3 新建）
import { create } from 'zustand';
import { TensorEngine, GATES, TensorAmplitude } from '../quantum/tensorEngine';

interface TensorState {
  engine: TensorEngine;
  amplitudes: TensorAmplitude[];
  isMaximallyEntangled: boolean;
  applyH: (q: number) => void;
  applyCNOT: (c: number, t: number) => void;
  reset: () => void;
}

export const useTensorStore = create<TensorState>((set, get) => ({
  engine: new TensorEngine(2),
  amplitudes: new TensorEngine(2).getAmplitudes(),
  isMaximallyEntangled: false,
  applyH: (q) => {
    const { engine } = get();
    engine.applyGate(GATES.H, q);
    set({
      amplitudes: engine.getAmplitudes(),
      isMaximallyEntangled: engine.computeConcurrence() > 0.99,
    });
  },
  // ...
}));