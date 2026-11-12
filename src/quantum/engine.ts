// src/quantum/engine.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { ComplexAmplitude, GateName, RawComplex } from './types';

const MAX_SCRATCH_SIZE = 16; 
const scratchRe = new Float64Array(MAX_SCRATCH_SIZE);
const scratchIm = new Float64Array(MAX_SCRATCH_SIZE);

/**
 * 將輸入狀態載入連續記憶體暫存區 (🌟 修復 TS2532/TS18048：加入安全 fallback)
 */
function loadStateToScratch(state: ReadonlyArray<RawComplex>, size: number): void {
  for (let i = 0; i < size; i++) {
    const c = state[i];
    scratchRe[i] = c ? c.re : 0;
    scratchIm[i] = c ? c.im : 0;
  }
}

export function initZeroState(qubitCount: number): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = 1 << qubitCount;
  scratchRe[0] = 1;
  scratchIm[0] = 0;
  for (let i = 1; i < size; i++) {
    scratchRe[i] = 0;
    scratchIm[i] = 0;
  }
  return processFromScratch(size, 0);
}

function processFromScratch(
  size: number,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  let bestIdx = 0;
  let bestModSq = -1;

  for (let i = 0; i < size; i++) {
    const re = scratchRe[i] ?? 0;
    const im = scratchIm[i] ?? 0;
    const m = re * re + im * im;
    if (m > bestModSq + 1e-9) {
      bestModSq = m;
      bestIdx = i;
    }
  }

  // 1.5x 遲滯鎖相：防範逐步演化時因數值浮動導致全域相位突跳
  let prevModSq = 0;
  if (prevRefIdx < size) {
    const pRe = scratchRe[prevRefIdx] ?? 0;
    const pIm = scratchIm[prevRefIdx] ?? 0;
    prevModSq = pRe * pRe + pIm * pIm;
  }

  const shouldSwitch = prevModSq < 1e-6 || bestModSq > prevModSq * 1.5;
  const refIdx = shouldSwitch ? bestIdx : prevRefIdx;

  const refRe = scratchRe[refIdx] ?? 0;
  const refIm = scratchIm[refIdx] ?? 0;
  const refPhase = Math.atan2(refIm, refRe);
  const cos = Math.cos(-refPhase);
  const sin = Math.sin(-refPhase);

  const processed: ComplexAmplitude[] = new Array(size);
  for (let i = 0; i < size; i++) {
    const re = scratchRe[i] ?? 0;
    const im = scratchIm[i] ?? 0;
    const normRe = re * cos - im * sin;
    const normIm = re * sin + im * cos;
    const mod = Math.sqrt(normRe * normRe + normIm * normIm);
    let p = Math.atan2(normIm, normRe);
    if (p < 0) p += 2 * Math.PI;

    processed[i] = { re: normRe, im: normIm, modulus: mod, phase: p };
  }

  return { amplitudes: processed, refIdx };
}

export function processStateVector(
  amplitudes: ReadonlyArray<RawComplex>,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = amplitudes.length;
  loadStateToScratch(amplitudes, size);
  return processFromScratch(size, prevRefIdx);
}

function executeUnitaryInScratch(
  gate: GateName,
  targets: number[],
  qubitCount: number
): void {
  const size = 1 << qubitCount;
  const q = targets[0] ?? 0; // 🌟 修復 TS2532：防禦陣列無目標
  const bitMask = 1 << (qubitCount - 1 - q);
  const step = bitMask << 1;

  if (gate === 'H') {
    const invSqrt2 = 1 / Math.SQRT2;
    for (let i = 0; i < size; i += step) {
      for (let j = 0; j < bitMask; j++) {
        const i0 = i + j;
        const i1 = i0 + bitMask;

        const a0Re = scratchRe[i0] ?? 0;
        const a0Im = scratchIm[i0] ?? 0;
        const a1Re = scratchRe[i1] ?? 0;
        const a1Im = scratchIm[i1] ?? 0;

        scratchRe[i0] = (a0Re + a1Re) * invSqrt2;
        scratchIm[i0] = (a0Im + a1Im) * invSqrt2;
        scratchRe[i1] = (a0Re - a1Re) * invSqrt2;
        scratchIm[i1] = (a0Im - a1Im) * invSqrt2;
      }
    }
  } else if (gate === 'X') {
    for (let i = 0; i < size; i += step) {
      for (let j = 0; j < bitMask; j++) {
        const i0 = i + j;
        const i1 = i0 + bitMask;

        const tmpRe = scratchRe[i0] ?? 0;
        const tmpIm = scratchIm[i0] ?? 0;
        scratchRe[i0] = scratchRe[i1] ?? 0;
        scratchIm[i0] = scratchIm[i1] ?? 0;
        scratchRe[i1] = tmpRe;
        scratchIm[i1] = tmpIm;
      }
    }
  } else if (gate === 'Z') {
    for (let i = 0; i < size; i += step) {
      for (let j = 0; j < bitMask; j++) {
        const i1 = i + j + bitMask;
        const re1 = scratchRe[i1] ?? 0;
        const im1 = scratchIm[i1] ?? 0;
        scratchRe[i1] = -re1;
        scratchIm[i1] = -im1;
      }
    }
  } else if (gate === 'CNOT') {
    if (targets.length !== 2) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn(`[Quantum Engine] CNOT requires exactly 2 targets, got ${targets.length}`);
      }
      return;
    }

    const ctrl = targets[0] ?? 0;
    const tgt = targets[1] ?? 0;
    const ctrlMask = 1 << (qubitCount - 1 - ctrl);
    const tgtMask = 1 << (qubitCount - 1 - tgt);

    for (let i = 0; i < size; i++) {
      if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
        const i1 = i | tgtMask;
        const tmpRe = scratchRe[i] ?? 0;
        const tmpIm = scratchIm[i] ?? 0;
        scratchRe[i] = scratchRe[i1] ?? 0;
        scratchIm[i] = scratchIm[i1] ?? 0;
        scratchRe[i1] = tmpRe;
        scratchIm[i1] = tmpIm;
      }
    }
  }
}

export function applyGatePure(
  state: ReadonlyArray<RawComplex>,
  prevRefIdx: number,
  gate: GateName,
  targets: number[],
  qubitCount: number
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = 1 << qubitCount;
  loadStateToScratch(state, size);
  executeUnitaryInScratch(gate, targets, qubitCount);
  return processFromScratch(size, prevRefIdx);
}

export function applyPhaseGate(
  state: ReadonlyArray<RawComplex>,
  phi: number,
  target: number,
  qubitCount: number,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = 1 << qubitCount;
  loadStateToScratch(state, size);

  const bitMask = 1 << (qubitCount - 1 - target);
  const step = bitMask << 1;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  for (let i = 0; i < size; i += step) {
    for (let j = 0; j < bitMask; j++) {
      const i1 = i + j + bitMask;
      const re = scratchRe[i1] ?? 0;
      const im = scratchIm[i1] ?? 0;
      scratchRe[i1] = re * cosPhi - im * sinPhi;
      scratchIm[i1] = re * sinPhi + im * cosPhi;
    }
  }

  return processFromScratch(size, prevRefIdx);
}

/**
 * 嚴格計算 2-Qubit 糾纏度 (Wootters' Concurrence):
 * 🌟 修復 TS18048：保證 a00, a01, a10, a11 安全解構
 */
export function calculateConcurrence(amplitudes: ReadonlyArray<RawComplex>): number {
  if (amplitudes.length !== 4) return 0;

  const a00 = amplitudes[0] ?? { re: 0, im: 0 };
  const a01 = amplitudes[1] ?? { re: 0, im: 0 };
  const a10 = amplitudes[2] ?? { re: 0, im: 0 };
  const a11 = amplitudes[3] ?? { re: 0, im: 0 };

  const z1Re = a00.re * a11.re - a00.im * a11.im;
  const z1Im = a00.re * a11.im + a00.im * a11.re;

  const z2Re = a01.re * a10.re - a01.im * a10.im;
  const z2Im = a01.re * a10.im + a01.im * a10.re;

  const diffRe = z1Re - z2Re;
  const diffIm = z1Im - z2Im;

  const concurrence = 2 * Math.sqrt(diffRe * diffRe + diffIm * diffIm);
  return Math.min(1, Math.max(0, concurrence));
}

/**
 * 純函數量子全域投影測量 (Projective Measurement):
 * 🌟 修復 TS18048 / TS2532
 */
export function measureCollapsePure(
  state: ReadonlyArray<RawComplex>,
  qubitCount: number,
  rng: () => number = Math.random
): {
  collapsedIndex: number;
  amplitudes: ComplexAmplitude[];
  refIdx: number;
} {
  const size = 1 << qubitCount;
  const probabilities = new Float64Array(size);
  let totalProb = 0;

  for (let i = 0; i < size; i++) {
    const c = state[i];
    const re = c ? c.re : 0;
    const im = c ? c.im : 0;
    const p = re * re + im * im;
    probabilities[i] = p;
    totalProb += p;
  }

  const dice = rng() * (totalProb > 0 ? totalProb : 1);
  let accumulated = 0;
  let collapsedIndex = size - 1;

  for (let i = 0; i < size; i++) {
    accumulated += probabilities[i] ?? 0;
    if (dice <= accumulated) {
      collapsedIndex = i;
      break;
    }
  }

  for (let i = 0; i < size; i++) {
    scratchRe[i] = i === collapsedIndex ? 1 : 0;
    scratchIm[i] = 0;
  }

  const result = processFromScratch(size, collapsedIndex);
  return {
    collapsedIndex,
    amplitudes: result.amplitudes,
    refIdx: result.refIdx,
  };
}
