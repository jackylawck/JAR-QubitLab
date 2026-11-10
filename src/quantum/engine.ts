// src/quantum/engine.ts
import { ComplexAmplitude, GateName, RawComplex } from './types';

/**
 * 位序約定（全專案唯一真理）：
 * - 顯示層與引擎層統一使用 BIG-ENDIAN：|q0 q1 ... qn⟩，q0 在最左側。
 * - 索引 i 的二進位字串補零到 n 位，最左位對應 q0。
 * - 例：2 qubits 時，索引 2 = "10" = |q0=1, q1=0⟩。
 */

export function initZeroState(qubitCount: number): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = 1 << qubitCount; // 使用位元左移替代 Math.pow 更高效
  const raw = new Array(size);
  for (let i = 0; i < size; i++) {
    raw[i] = { re: i === 0 ? 1 : 0, im: 0 };
  }
  return processStateVector(raw, 0);
}

export function processStateVector(
  amplitudes: ReadonlyArray<RawComplex>, // 支援傳入 ComplexAmplitude[]
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  let bestIdx = 0;
  let bestModSq = -1;
  const size = amplitudes.length;

  for (let i = 0; i < size; i++) {
    const m = amplitudes[i].re ** 2 + amplitudes[i].im ** 2;
    if (m > bestModSq + 1e-9) {
      bestModSq = m;
      bestIdx = i;
    }
  }

  // 1.5x 遲滯鎖相演算法：防止逐步演化時全域相位閃爍
  const prevAmp = amplitudes[prevRefIdx] ?? { re: 0, im: 0 };
  const prevModSq = prevAmp.re ** 2 + prevAmp.im ** 2;
  const shouldSwitch = prevModSq < 1e-6 || bestModSq > prevModSq * 1.5;
  const refIdx = shouldSwitch ? bestIdx : prevRefIdx;

  // 計算基準相位的逆旋轉角
  const refAmp = amplitudes[refIdx] ?? { re: 1, im: 0 };
  const refPhase = Math.atan2(refAmp.im, refAmp.re);
  const cos = Math.cos(-refPhase);
  const sin = Math.sin(-refPhase);

  // 🌟 優化：使用定長陣列取代 .map()，效能更佳
  const processed: ComplexAmplitude[] = new Array(size);
  for (let i = 0; i < size; i++) {
    const a = amplitudes[i];
    const normRe = a.re * cos - a.im * sin;
    const normIm = a.re * sin + a.im * cos;
    const mod = Math.sqrt(normRe ** 2 + normIm ** 2);
    let p = Math.atan2(normIm, normRe);
    if (p < 0) p += 2 * Math.PI;

    processed[i] = { re: normRe, im: normIm, modulus: mod, phase: p };
  }

  return { amplitudes: processed, refIdx };
}

function executeUnitaryMatrix(
  state: ReadonlyArray<RawComplex>,
  gate: GateName,
  targets: number[],
  qubitCount: number
): RawComplex[] {
  const size = state.length;
  const nextState: RawComplex[] = new Array(size);

  // 🌟 優化 1：統一在最外層進行一次防禦性拷貝 (Store 不需再手動 map)
  for (let i = 0; i < size; i++) {
    nextState[i] = { re: state[i].re, im: state[i].im };
  }

  const q = targets[0];
  const bitMask = 1 << (qubitCount - 1 - q);

  // 🌟 優化 2：Zero-GC 內圈運算。直接原地修改 nextState[i].re / im，杜絕物件分配
  if (gate === 'H') {
    const invSqrt2 = 1 / Math.SQRT2;
    for (let i = 0; i < size; i++) {
      if ((i & bitMask) === 0) {
        const i1 = i | bitMask;
        const a0Re = nextState[i].re;
        const a0Im = nextState[i].im;
        const a1Re = nextState[i1].re;
        const a1Im = nextState[i1].im;

        nextState[i].re = (a0Re + a1Re) * invSqrt2;
        nextState[i].im = (a0Im + a1Im) * invSqrt2;
        nextState[i1].re = (a0Re - a1Re) * invSqrt2;
        nextState[i1].im = (a0Im - a1Im) * invSqrt2;
      }
    }
  } else if (gate === 'X') {
    for (let i = 0; i < size; i++) {
      if ((i & bitMask) === 0) {
        const i1 = i | bitMask;
        const tmpRe = nextState[i].re;
        const tmpIm = nextState[i].im;
        nextState[i].re = nextState[i1].re;
        nextState[i].im = nextState[i1].im;
        nextState[i1].re = tmpRe;
        nextState[i1].im = tmpIm;
      }
    }
  } else if (gate === 'Z') {
    for (let i = 0; i < size; i++) {
      if ((i & bitMask) !== 0) {
        nextState[i].re = -nextState[i].re;
        nextState[i].im = -nextState[i].im;
      }
    }
  } else if (gate === 'CNOT') {
    if (targets.length !== 2) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn(`[Quantum Engine] CNOT requires exactly 2 targets, got ${targets.length}`);
      }
    } else {
      const ctrl = targets[0];
      const tgt = targets[1];
      const ctrlMask = 1 << (qubitCount - 1 - ctrl);
      const tgtMask = 1 << (qubitCount - 1 - tgt);

      for (let i = 0; i < size; i++) {
        if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
          const i1 = i | tgtMask;
          const tmpRe = nextState[i].re;
          const tmpIm = nextState[i].im;
          nextState[i].re = nextState[i1].re;
          nextState[i].im = nextState[i1].im;
          nextState[i1].re = tmpRe;
          nextState[i1].im = tmpIm;
        }
      }
    }
  }

  return nextState;
}

export function applyGatePure(
  state: ReadonlyArray<RawComplex>, // 支援直接傳入 Store 的 amplitudes
  prevRefIdx: number,
  gate: GateName,
  targets: number[],
  qubitCount: number
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const evolvedRaw = executeUnitaryMatrix(state, gate, targets, qubitCount);
  return processStateVector(evolvedRaw, prevRefIdx);
}

// 🌟 尋回 Sprint 2 核心：連續相位干涉門 P(phi)
export function applyPhaseGate(
  state: ReadonlyArray<RawComplex>,
  phi: number,
  target: number,
  qubitCount: number,
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = state.length;
  const bitMask = 1 << (qubitCount - 1 - target);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const nextRaw: RawComplex[] = new Array(size);
  for (let i = 0; i < size; i++) {
    // 零 GC 內部直接拷貝與計算
    if ((i & bitMask) === 0) {
      nextRaw[i] = { re: state[i].re, im: state[i].im };
    } else {
      const re = state[i].re;
      const im = state[i].im;
      nextRaw[i] = {
        re: re * cosPhi - im * sinPhi,
        im: re * sinPhi + im * cosPhi,
      };
    }
  }

  return processStateVector(nextRaw, prevRefIdx);
}
