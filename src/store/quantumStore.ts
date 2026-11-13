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
import { QUANTUM_CONFIG } from '../constants';

export interface QuantumState {
  qubitCount: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
  isMaximallyEntangled: boolean;

  applyGate: (gate: GateName, targets: number[]) => void;
  collapse: (rng?: () => number) => number;
  reset: () => void;
  resetBoothOne: () => void;

  isSplit: boolean;
  phaseAngle: number;
  _afterHSnapshot: ReadonlyArray<RawComplex> | null;
  splitBoothTwo: () => void;
  setPhaseAngle: (angle: number) => void;
  collideBoothTwo: () => void;
  resetBoothTwo: () => void;
}

export const useQuantumStore = create<QuantumState>((set, get) => ({
  qubitCount: QUANTUM_CONFIG.INITIAL_QUBITS,
  ...initZeroState(QUANTUM_CONFIG.INITIAL_QUBITS),
  isMaximallyEntangled: false,

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
        isMaximallyEntangled: calculateConcurrence(nextAmps) > 0.99,
      };
    });
  },

  collapse: (rng = Math.random) => {
    let outcome = 0;
    set((state) => {
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

  isSplit: false,
  phaseAngle: 0,
  _afterHSnapshot: null,

  splitBoothTwo: () => {
    set((state) => {
      const zero = initZeroState(state.qubitCount);
      const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], state.qubitCount);
      const snapshot: ReadonlyArray<RawComplex> = afterH.amplitudes.map((amp) => ({ re: amp.re, im: amp.im }));

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
