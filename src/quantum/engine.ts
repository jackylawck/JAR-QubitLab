// src/quantum/engine.ts
import { ComplexAmplitude, GateName, RawComplex } from './types';

/**
 * 位序約定（全專案唯一真理）：
 * - 顯示層與引擎層統一使用 BIG-ENDIAN：|q0 q1 ... qn⟩，q0 在最左側。
 * - 索引 i 的二進位字串補零到 n 位，最左位對應 q0。
 * - 例：2 qubits 時，索引 2 = "10" = |q0=1, q1=0⟩。
 */

export function initZeroState(qubitCount: number): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const size = Math.pow(2, qubitCount);
  const raw = Array.from({ length: size }, (_, i) => ({ re: i === 0 ? 1 : 0, im: 0 }));
  return processStateVector(raw, 0);
}

export function processStateVector(
  amplitudes: RawComplex[],
  prevRefIdx: number = 0
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const modSq = (a: RawComplex) => a.re ** 2 + a.im ** 2;

  let bestIdx = 0;
  let bestModSq = -1;
  for (let i = 0; i < amplitudes.length; i++) {
    const m = modSq(amplitudes[i]);
    if (m > bestModSq + 1e-9) {
      bestModSq = m;
      bestIdx = i;
    }
  }

  // 1.5x 遲滯鎖相演算法：防止逐步演化時全域相位閃爍
  const prevModSq = modSq(amplitudes[prevRefIdx] ?? { re: 0, im: 0 });
  const shouldSwitch = prevModSq < 1e-6 || bestModSq > prevModSq * 1.5;
  const refIdx = shouldSwitch ? bestIdx : prevRefIdx;

  // 計算基準相位的逆旋轉角
  const refPhase = Math.atan2(amplitudes[refIdx].im, amplitudes[refIdx].re);
  const cos = Math.cos(-refPhase);
  const sin = Math.sin(-refPhase);

  const processed = amplitudes.map((a) => {
    const normRe = a.re * cos - a.im * sin;
    const normIm = a.re * sin + a.im * cos;
    const mod = Math.sqrt(normRe ** 2 + normIm ** 2);
    let p = Math.atan2(normIm, normRe);
    if (p < 0) p += 2 * Math.PI;

    return { re: normRe, im: normIm, modulus: mod, phase: p };
  });

  return { amplitudes: processed, refIdx };
}

function executeUnitaryMatrix(
  state: RawComplex[],
  gate: GateName,
  targets: number[],
  qubitCount: number
): RawComplex[] {
  const size = state.length;
  const nextState = state.map((s) => ({ re: s.re, im: s.im }));

  if (gate === 'PHASE_NOOP') return nextState;

  const q = targets[0];
  const bitMask = 1 << (qubitCount - 1 - q); // Big-Endian 位遮罩

  if (gate === 'H') {
    const invSqrt2 = 1 / Math.SQRT2;
    for (let i = 0; i < size; i++) {
      if ((i & bitMask) === 0) {
        const i1 = i | bitMask;
        const a0 = state[i], a1 = state[i1];
        nextState[i] = { re: (a0.re + a1.re) * invSqrt2, im: (a0.im + a1.im) * invSqrt2 };
        nextState[i1] = { re: (a0.re - a1.re) * invSqrt2, im: (a0.im - a1.im) * invSqrt2 };
      }
    }
  } else if (gate === 'X') {
    for (let i = 0; i < size; i++) {
      if ((i & bitMask) === 0) {
        const i1 = i | bitMask;
        const temp = nextState[i];
        nextState[i] = nextState[i1];
        nextState[i1] = temp;
      }
    }
  } else if (gate === 'CNOT' && targets.length === 2) {
    const ctrl = targets[0];
    const tgt = targets[1];
    const ctrlMask = 1 << (qubitCount - 1 - ctrl);
    const tgtMask = 1 << (qubitCount - 1 - tgt);

    for (let i = 0; i < size; i++) {
      // 僅當控制位元為 1 時，且我們處於目標位元為 0 的那一對
      if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
        const i1 = i | tgtMask;
        const temp = nextState[i];
        nextState[i] = nextState[i1];
        nextState[i1] = temp;
      }
    }
  }

  return nextState;
}

export function applyGatePure(
  state: RawComplex[],
  prevRefIdx: number,
  gate: GateName,
  targets: number[],
  qubitCount: number
): { amplitudes: ComplexAmplitude[]; refIdx: number } {
  const evolvedRaw = executeUnitaryMatrix(state, gate, targets, qubitCount);
  return processStateVector(evolvedRaw, prevRefIdx);
}
