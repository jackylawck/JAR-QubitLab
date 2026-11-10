// src/quantum/engine.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { ComplexAmplitude, GateName, RawComplex } from './types';

/**
 * 位序約定（全專案唯一真理）：
 * - 顯示層與引擎層統一使用 BIG-ENDIAN：|q0 q1 ... qn⟩，q0 在最左側 (MSB)。
 * - 索引 i 的二進位字串補零到 n 位，最左位對應 q0。
 * - 例：2 qubits 時，索引 2 = "10" = |q0=1, q1=0⟩。
 */

// 🌟 Zero-GC 靜態運算暫存區 (L1 緩存友善，徹底消除中介物件分配)
const MAX_SCRATCH_SIZE = 16; // 專案規格上限 (預留至 4 Qubits = 16 狀態)
const scratchRe = new Float64Array(MAX_SCRATCH_SIZE);
const scratchIm = new Float64Array(MAX_SCRATCH_SIZE);

/**
 * 將輸入狀態載入連續記憶體暫存區
 */
function loadStateToScratch(state: ReadonlyArray<RawComplex>, size: number): void {
  for (let i = 0; i < size; i++) {
    scratchRe[i] = state[i].re;
    scratchIm[i] = state[i].im;
  }
}

/**
 * 初始化全零基態 |0...0⟩
 */
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

/**
 * 遲滯鎖相與全域規格化運算：
 * 直接由 Scratch 暫存區一次性構建最終 ComplexAmplitude 陣列，省去中介 RawComplex[] 分配
 */
function processFromScratch(
  size: number,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  let bestIdx = 0;
  let bestModSq = -1;

  for (let i = 0; i < size; i++) {
    const m = scratchRe[i] * scratchRe[i] + scratchIm[i] * scratchIm[i];
    if (m > bestModSq + 1e-9) {
      bestModSq = m;
      bestIdx = i;
    }
  }

  // 1.5x 遲滯鎖相：防範逐步演化時因數值浮動導致全域相位突跳
  const prevModSq =
    prevRefIdx < size
      ? scratchRe[prevRefIdx] * scratchRe[prevRefIdx] + scratchIm[prevRefIdx] * scratchIm[prevRefIdx]
      : 0;

  const shouldSwitch = prevModSq < 1e-6 || bestModSq > prevModSq * 1.5;
  const refIdx = shouldSwitch ? bestIdx : prevRefIdx;

  // 計算基準相位的逆旋轉角 (以 refIdx 為零相位基準)
  const refRe = scratchRe[refIdx];
  const refIm = scratchIm[refIdx];
  const refPhase = Math.atan2(refIm, refRe);
  const cos = Math.cos(-refPhase);
  const sin = Math.sin(-refPhase);

  const processed: ComplexAmplitude[] = new Array(size);
  for (let i = 0; i < size; i++) {
    const re = scratchRe[i];
    const im = scratchIm[i];
    const normRe = re * cos - im * sin;
    const normIm = re * sin + im * cos;
    const mod = Math.sqrt(normRe * normRe + normIm * normIm);
    let p = Math.atan2(normIm, normRe);
    if (p < 0) p += 2 * Math.PI;

    processed[i] = { re: normRe, im: normIm, modulus: mod, phase: p };
  }

  return { amplitudes: processed, refIdx };
}

/**
 * 外部相容介面：供需要直接對原始態向量進行後處理的場景
 */
export function processStateVector(
  amplitudes: ReadonlyArray<RawComplex>,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = amplitudes.length;
  loadStateToScratch(amplitudes, size);
  return processFromScratch(size, prevRefIdx);
}

/**
 * 么正矩陣核心運算 (Stride 步長跨距無分支算法)
 */
function executeUnitaryInScratch(
  gate: GateName,
  targets: number[],
  qubitCount: number
): void {
  const size = 1 << qubitCount;
  const q = targets[0];
  const bitMask = 1 << (qubitCount - 1 - q);
  const step = bitMask << 1;

  if (gate === 'H') {
    const invSqrt2 = 1 / Math.SQRT2;
    // 🌟 步長跨距雙迴圈：迭代次數減半 (2^(n-1))，完全消除 if ((i & bitMask) === 0) 分支預測開銷
    for (let i = 0; i < size; i += step) {
      for (let j = 0; j < bitMask; j++) {
        const i0 = i + j;
        const i1 = i0 + bitMask;

        const a0Re = scratchRe[i0];
        const a0Im = scratchIm[i0];
        const a1Re = scratchRe[i1];
        const a1Im = scratchIm[i1];

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

        const tmpRe = scratchRe[i0];
        const tmpIm = scratchIm[i0];
        scratchRe[i0] = scratchRe[i1];
        scratchIm[i0] = scratchIm[i1];
        scratchRe[i1] = tmpRe;
        scratchIm[i1] = tmpIm;
      }
    }
  } else if (gate === 'Z') {
    // 🌟 Z 閘特性：僅需翻轉目標位元為 1 的項 (i1)，完全不需讀取或寫入 i0
    for (let i = 0; i < size; i += step) {
      for (let j = 0; j < bitMask; j++) {
        const i1 = i + j + bitMask;
        scratchRe[i1] = -scratchRe[i1];
        scratchIm[i1] = -scratchIm[i1];
      }
    }
  } else if (gate === 'CNOT') {
    if (targets.length !== 2) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn(`[Quantum Engine] CNOT requires exactly 2 targets, got ${targets.length}`);
      }
      return;
    }

    const ctrl = targets[0];
    const tgt = targets[1];
    const ctrlMask = 1 << (qubitCount - 1 - ctrl);
    const tgtMask = 1 << (qubitCount - 1 - tgt);

    for (let i = 0; i < size; i++) {
      if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
        const i1 = i | tgtMask;
        const tmpRe = scratchRe[i];
        const tmpIm = scratchIm[i];
        scratchRe[i] = scratchRe[i1];
        scratchIm[i] = scratchIm[i1];
        scratchRe[i1] = tmpRe;
        scratchIm[i1] = tmpIm;
      }
    }
  }
}

/**
 * 套用標準單/雙量子閘
 */
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

/**
 * 連續相移門 P(phi)：
 * 僅旋轉目標位元為 |1⟩ 的振幅，|0⟩ 完全免受運算與拷貝
 */
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
      const re = scratchRe[i1];
      const im = scratchIm[i1];
      scratchRe[i1] = re * cosPhi - im * sinPhi;
      scratchIm[i1] = re * sinPhi + im * cosPhi;
    }
  }

  return processFromScratch(size, prevRefIdx);
}

/**
 * ==========================================
 * Sprint 3 原生核心：糾纏度與觀測坍縮引擎
 * ==========================================
 */

/**
 * 嚴格計算 2-Qubit 糾纏度 (Wootters' Concurrence):
 * C(|ψ⟩) = 2 |a00 a11 - a01 a10|
 * - 0.0: 完全可分態 (Separable State, 例如 |00⟩ 或 (|0⟩+|1⟩)⊗|0⟩)
 * - 1.0: 最大糾纏態 (Bell State, 例如 (|00⟩+|11⟩)/√2)
 */
export function calculateConcurrence(amplitudes: ReadonlyArray<RawComplex>): number {
  if (amplitudes.length !== 4) return 0;

  const a00 = amplitudes[0];
  const a01 = amplitudes[1];
  const a10 = amplitudes[2];
  const a11 = amplitudes[3];

  // z1 = a00 * a11
  const z1Re = a00.re * a11.re - a00.im * a11.im;
  const z1Im = a00.re * a11.im + a00.im * a11.re;

  // z2 = a01 * a10
  const z2Re = a01.re * a10.re - a01.im * a10.im;
  const z2Im = a01.re * a10.im + a01.im * a10.re;

  const diffRe = z1Re - z2Re;
  const diffIm = z1Im - z2Im;

  const concurrence = 2 * Math.sqrt(diffRe * diffRe + diffIm * diffIm);
  return Math.min(1, Math.max(0, concurrence));
}

/**
 * 純函數量子全域投影測量 (Projective Measurement):
 * 根據波函數概率密度 |α_i|^2 進行擲骰，並強制坍縮至單一本徵態
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
    const p = state[i].re * state[i].re + state[i].im * state[i].im;
    probabilities[i] = p;
    totalProb += p;
  }

  // 擲骰坍縮
  const dice = rng() * (totalProb > 0 ? totalProb : 1);
  let accumulated = 0;
  let collapsedIndex = size - 1;

  for (let i = 0; i < size; i++) {
    accumulated += probabilities[i];
    if (dice <= accumulated) {
      collapsedIndex = i;
      break;
    }
  }

  // 坍縮後僅有中選索引振幅為 1，其餘全為 0
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
