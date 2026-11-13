// src/store/teleportStore.ts
import { create } from 'zustand';
import { TensorEngine, GATES } from '../quantum/tensorEngine';

export type TeleportPhase = 'prepare' | 'measure' | 'correct' | 'success' | 'failed';

const DEFAULT_THETA = Math.PI / 3;
const DEFAULT_PHI = Math.PI / 4;

interface TeleportState {
  engine: TensorEngine;
  phase: TeleportPhase;
  aliceTheta: number;
  alicePhi: number;
  classicalBits: 0 | 1 | 2 | 3 | null;
  lastUserBits: 0 | 1 | 2 | 3 | null;
  bellPairReady: boolean;
  isBlindMode: boolean;
  failedCount: number;
  aliceModuli: [number, number, number, number];
  bobModuli: [number, number];
  bobCurrentPhases: [number, number] | null;
  fidelity: number;
  engineSnapshotBuffer: Float64Array;
  engineSnapshotMeta: {
    refIdx: number;
    bobCurrentPhases: [number, number] | null;
    bobModuli: [number, number];
  } | null;

  setAliceState: (theta: number, phi: number) => void;
  createBellPair: () => void;
  measureAlice: () => void;
  applyCorrection: (userBits: 0 | 1 | 2 | 3) => void;
  retryCorrection: () => void;
  toggleBlindMode: () => void;
  reset: () => void;
}

/**
 * 寫入 Alice 初始未知態 |ψ⟩ ⊗ |00⟩
 * q0 = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩, q1 = |0⟩, q2 = |0⟩
 */
function writeAliceInitialState(engine: TensorEngine, theta: number, phi: number): void {
  engine.reset();
  const c0 = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  // 索引 0 = |000⟩, 索引 4 = |100⟩
  engine.state[0] = c0;
  engine.state[1] = 0;
  engine.state[8] = s * Math.cos(phi);
  engine.state[9] = s * Math.sin(phi);
}

/**
 * 對 3-Qubit 引擎執行單一 Qubit 局部投影測量並重新歸一化
 */
function measureSingleQubit(engine: TensorEngine, targetQubit: number): 0 | 1 {
  const bitMask = 1 << (engine.numQubits - 1 - targetQubit);
  let prob0 = 0;

  for (let i = 0; i < engine.stateSize; i++) {
    if ((i & bitMask) === 0) {
      const r = engine.state[i * 2]!;
      const im = engine.state[i * 2 + 1]!;
      prob0 += r * r + im * im;
    }
  }

  const outcome: 0 | 1 = Math.random() < prob0 ? 0 : 1;
  const normProb = outcome === 0 ? prob0 : 1 - prob0;
  const invNorm = normProb > 1e-12 ? 1 / Math.sqrt(normProb) : 0;

  for (let i = 0; i < engine.stateSize; i++) {
    const bitVal = (i & bitMask) === 0 ? 0 : 1;
    if (bitVal === outcome) {
      engine.state[i * 2] = engine.state[i * 2]! * invNorm;
      engine.state[i * 2 + 1] = engine.state[i * 2 + 1]! * invNorm;
    } else {
      engine.state[i * 2] = 0;
      engine.state[i * 2 + 1] = 0;
    }
  }

  return outcome;
}

/**
 * 計算 Alice (q0, q1) 與 Bob (q2) 的邊際模長
 */
function extractMarginalModuli(engine: TensorEngine): {
  aliceModuli: [number, number, number, number];
  bobModuli: [number, number];
} {
  const aProb = [0, 0, 0, 0];
  const bProb = [0, 0];

  for (let i = 0; i < 8; i++) {
    const r = engine.state[i * 2]!;
    const im = engine.state[i * 2 + 1]!;
    const p = r * r + im * im;
    const aliceIdx = (i >> 1) & 0b11;
    const bobIdx = i & 0b01;
    aProb[aliceIdx]! += p;
    bProb[bobIdx]! += p;
  }

  return {
    aliceModuli: [
      Math.sqrt(aProb[0]!),
      Math.sqrt(aProb[1]!),
      Math.sqrt(aProb[2]!),
      Math.sqrt(aProb[3]!),
    ],
    bobModuli: [Math.sqrt(bProb[0]!), Math.sqrt(bProb[1]!)],
  };
}

/**
 * 提取 Bob (q2) 坍縮後的相對相位（以 |0⟩ 為基準歸一化）
 */
function extractBobPhases(engine: TensorEngine, bits: 0 | 1 | 2 | 3 | null): [number, number] | null {
  if (bits === null) return null;
  const baseIdx = bits << 1;
  const r0 = engine.state[baseIdx * 2]!;
  const i0 = engine.state[baseIdx * 2 + 1]!;
  const r1 = engine.state[(baseIdx | 1) * 2]!;
  const i1 = engine.state[(baseIdx | 1) * 2 + 1]!;

  const phase0 = Math.atan2(i0, r0);
  let phase1 = Math.atan2(i1, r1) - phase0;

  while (phase1 > Math.PI) phase1 -= 2 * Math.PI;
  while (phase1 <= -Math.PI) phase1 += 2 * Math.PI;

  return [0, phase1];
}

/**
 * 計算 Bob 最終態與 Alice 初始目標態之間的量子保真度 |⟨ψ_target|ψ_Bob⟩|²
 */
function computeTeleportFidelity(
  engine: TensorEngine,
  bits: 0 | 1 | 2 | 3,
  theta: number,
  phi: number
): number {
  const baseIdx = bits << 1;
  const b0Re = engine.state[baseIdx * 2]!;
  const b0Im = engine.state[baseIdx * 2 + 1]!;
  const b1Re = engine.state[(baseIdx | 1) * 2]!;
  const b1Im = engine.state[(baseIdx | 1) * 2 + 1]!;

  // 目標態 ⟨ψ| = [cos(θ/2), e^{-iφ}sin(θ/2)]
  const t0Re = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const t1Re = s * Math.cos(-phi);
  const t1Im = s * Math.sin(-phi);

  const innerRe = t0Re * b0Re + (t1Re * b1Re - t1Im * b1Im);
  const innerIm = t0Re * b0Im + (t1Re * b1Im + t1Im * b1Re);

  return Math.min(1, Math.max(0, innerRe * innerRe + innerIm * innerIm));
}

export const useTeleportStore = create<TeleportState>((set, get) => {
  const initEngine = new TensorEngine(3);
  writeAliceInitialState(initEngine, DEFAULT_THETA, DEFAULT_PHI);
  const initModuli = extractMarginalModuli(initEngine);

  return {
    engine: initEngine,
    phase: 'prepare',
    aliceTheta: DEFAULT_THETA,
    alicePhi: DEFAULT_PHI,
    classicalBits: null,
    lastUserBits: null,
    bellPairReady: false,
    isBlindMode: false,
    failedCount: 0,
    aliceModuli: initModuli.aliceModuli,
    bobModuli: initModuli.bobModuli,
    bobCurrentPhases: null,
    fidelity: 0,
    engineSnapshotBuffer: new Float64Array(initEngine.stateSize * 2),
    engineSnapshotMeta: null,

    setAliceState: (theta, phi) => {
      const { engine, phase } = get();
      if (phase !== 'prepare') return;
      writeAliceInitialState(engine, theta, phi);
      const { aliceModuli, bobModuli } = extractMarginalModuli(engine);
      set({ aliceTheta: theta, alicePhi: phi, aliceModuli, bobModuli });
    },

    createBellPair: () => {
      const { engine, phase } = get();
      if (phase !== 'prepare') return;
      const H = GATES.H;
      if (!H) return;

      engine.applyGate(H, 1);
      engine.applyCNOT(1, 2);
      const { aliceModuli, bobModuli } = extractMarginalModuli(engine);

      set({
        phase: 'measure',
        bellPairReady: true,
        aliceModuli,
        bobModuli,
      });
    },

    measureAlice: () => {
      const { engine, phase, bellPairReady, engineSnapshotBuffer } = get();
      if (phase !== 'measure' || !bellPairReady) return;
      const H = GATES.H;
      if (!H) return;

      engine.applyCNOT(0, 1);
      engine.applyGate(H, 0);

      const m0 = measureSingleQubit(engine, 0);
      const m1 = measureSingleQubit(engine, 1);
      const bits = ((m0 << 1) | m1) as 0 | 1 | 2 | 3;

      const { aliceModuli, bobModuli } = extractMarginalModuli(engine);
      const bobCurrentPhases = extractBobPhases(engine, bits);

      if (import.meta.env.DEV && engineSnapshotBuffer.length !== engine.state.length) {
        console.warn(`[teleportStore] Snapshot buffer mismatch: ${engineSnapshotBuffer.length} vs ${engine.state.length}`);
      }
      engineSnapshotBuffer.set(engine.state);

      set({
        classicalBits: bits,
        phase: 'correct',
        aliceModuli,
        bobModuli,
        bobCurrentPhases,
        engineSnapshotMeta: {
          refIdx: engine.refIdx,
          bobCurrentPhases,
          bobModuli,
        },
      });
    },

    applyCorrection: (userBits) => {
      const { engine, phase, classicalBits, aliceTheta, alicePhi, failedCount } = get();
      if (phase !== 'correct' || classicalBits === null) return;

      const X = GATES.X;
      const Z = GATES.Z;
      if (!X || !Z) return;

      // 01 (bit 0) -> X Gate, 10 (bit 1) -> Z Gate
      if (userBits & 0b01) engine.applyGate(X, 2);
      if (userBits & 0b10) engine.applyGate(Z, 2);

      const { aliceModuli, bobModuli } = extractMarginalModuli(engine);
      const fidelity = computeTeleportFidelity(engine, classicalBits, aliceTheta, alicePhi);
      const isSuccess = userBits === classicalBits;
      const bobCurrentPhases = extractBobPhases(engine, classicalBits);

      set({
        phase: isSuccess ? 'success' : 'failed',
        lastUserBits: userBits,
        failedCount: isSuccess ? 0 : failedCount + 1,
        aliceModuli,
        bobModuli,
        bobCurrentPhases,
        fidelity,
        engineSnapshotMeta: isSuccess ? null : get().engineSnapshotMeta,
      });
    },

    retryCorrection: () => {
      const { phase, engine, engineSnapshotBuffer, engineSnapshotMeta } = get();
      if (phase !== 'failed' || !engineSnapshotMeta) return;

      engine.state.set(engineSnapshotBuffer);
      engine.refIdx = engineSnapshotMeta.refIdx;

      set({
        phase: 'correct',
        lastUserBits: null,
        bobCurrentPhases: engineSnapshotMeta.bobCurrentPhases,
        bobModuli: engineSnapshotMeta.bobModuli,
        fidelity: 0,
      });
    },

    toggleBlindMode: () => {
      set((state) => ({ isBlindMode: !state.isBlindMode }));
    },

    reset: () => {
      const { engine } = get();
      writeAliceInitialState(engine, DEFAULT_THETA, DEFAULT_PHI);
      const { aliceModuli, bobModuli } = extractMarginalModuli(engine);
      set({
        phase: 'prepare',
        aliceTheta: DEFAULT_THETA,
        alicePhi: DEFAULT_PHI,
        classicalBits: null,
        lastUserBits: null,
        bellPairReady: false,
        failedCount: 0,
        aliceModuli,
        bobModuli,
        bobCurrentPhases: null,
        fidelity: 0,
        engineSnapshotMeta: null,
      });
    },
  };
});
