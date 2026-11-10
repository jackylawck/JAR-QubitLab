// src/quantum/engine.test.ts
import { describe, it, expect } from 'vitest';
import { applyGatePure, initZeroState, processStateVector } from './engine';
import { GateName } from './types';

describe('Quantum Engine Integrity & Big-Endian Verification', () => {
  it('1. 驗證 Big-Endian: X(q0) 應將 |00⟩ 翻轉為 |10⟩ (索引 2，而非索引 1)', () => {
    const init = initZeroState(2);
    const { amplitudes } = applyGatePure(init.amplitudes, 0, 'X', [0], 2);

    expect(amplitudes[0].modulus).toBeCloseTo(0.0);
    expect(amplitudes[1].modulus).toBeCloseTo(0.0);
    expect(amplitudes[2].modulus).toBeCloseTo(1.0);
    expect(amplitudes[3].modulus).toBeCloseTo(0.0);
  });

  it('2. 驗證 CNOT 作用: ctrl=q0, tgt=q1 作用於 |10⟩ 應輸出 |11⟩ (索引 3)', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [0, 1], 2);

    expect(step2.amplitudes[0].modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[1].modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[2].modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[3].modulus).toBeCloseTo(1.0);
  });

  it('3. 驗證 CNOT 反向防呆: ctrl=q1, tgt=q0 作用於 |10⟩ 應保持 |10⟩', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [1, 0], 2);

    expect(step2.amplitudes[0].modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[1].modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[2].modulus).toBeCloseTo(1.0);
    expect(step2.amplitudes[3].modulus).toBeCloseTo(0.0);
  });
});

describe('Global Phase Lock Hysteresis (processStateVector)', () => {
  it('4. 鎖相遲滯：候選未達 1.5 倍前，refIdx 不得漂移（保持舊索引 0）', () => {
    const dummy = [
      { re: Math.sqrt(0.49), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sqrt(0.51), im: 0 },
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(0);
  });

  it('5. 鎖相切換：候選超過 1.5 倍時，refIdx 應切換至新基準（切換至索引 3）', () => {
    const dummy = [
      { re: Math.sqrt(0.3), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sqrt(0.7), im: 0 },
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(3);
  });
});

describe('Phase & Normalization Accuracy', () => {
  it('6. 驗證 Z 門相位翻轉: Z(q0) 作用於 |+0⟩ 應使 |10⟩ 振幅相位變為 π', () => {
    const init = initZeroState(2);
    const h = applyGatePure(init.amplitudes, 0, 'H', [0], 2);
    expect(h.amplitudes[2].phase).toBeCloseTo(0, 5);

    const z = applyGatePure(h.amplitudes, h.refIdx, 'Z', [0], 2);
    expect(z.amplitudes[0].phase).toBeCloseTo(0, 5);
    expect(z.amplitudes[2].phase).toBeCloseTo(Math.PI, 5);
  });

  it('7. 驗證 H 門標準化: H(q0) 作用於 |00⟩ 應產生兩個模長 1/√2 的振幅', () => {
    const init = initZeroState(2);
    const { amplitudes } = applyGatePure(init.amplitudes, 0, 'H', [0], 2);
    expect(amplitudes[0].modulus).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(amplitudes[2].modulus).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(amplitudes[1].modulus).toBeCloseTo(0, 5);
    expect(amplitudes[3].modulus).toBeCloseTo(0, 5);
  });

  it('8. 歸一化守恆: 任意 Gate 序列後總機率應恆為 1.0', () => {
    let state = initZeroState(2);
    const gates: Array<[GateName, number[]]> = [
      ['H', [0]],
      ['CNOT', [0, 1]],
      ['Z', [0]],
      ['H', [1]],
      ['X', [0]],
    ];

    for (const [gate, targets] of gates) {
      state = applyGatePure(state.amplitudes, state.refIdx, gate, targets, 2);
    }

    const totalProb = state.amplitudes.reduce((s, a) => s + a.modulus ** 2, 0);
    expect(totalProb).toBeCloseTo(1.0, 5);
  });
});
