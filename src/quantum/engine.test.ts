// src/quantum/engine.test.ts
import { describe, it, expect } from 'vitest';
import { applyGatePure, initZeroState, processStateVector } from './engine';

describe('Quantum Engine Integrity & Big-Endian Verification', () => {
  it('1. 驗證 Big-Endian: X(q0) 應將 |00⟩ 翻轉為 |10⟩ (索引 2，而非索引 1)', () => {
    const init = initZeroState(2);
    const { amplitudes } = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    expect(amplitudes[2].modulus).toBeCloseTo(1.0);
    expect(amplitudes[1].modulus).toBeCloseTo(0.0);
  });

  it('2. 驗證 CNOT 作用: ctrl=q0, tgt=q1 作用於 |10⟩ 應輸出 |11⟩ (索引 3)', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [0, 1], 2);
    expect(step2.amplitudes[3].modulus).toBeCloseTo(1.0);
    expect(step2.amplitudes[2].modulus).toBeCloseTo(0.0);
  });

  it('3. 驗證 CNOT 反向防呆: ctrl=q1, tgt=q0 作用於 |10⟩ 應保持 |10⟩', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2); // q0=1, q1=0
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [1, 0], 2); // q1 沒激發，不觸發翻轉
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
      { re: Math.sqrt(0.51), im: 0 }, // 0.51 / 0.49 ≈ 1.04 < 1.5
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(0);
  });

  it('5. 鎖相切換：候選超過 1.5 倍時，refIdx 應切換至新基準（切換至索引 3）', () => {
    const dummy = [
      { re: Math.sqrt(0.3), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sqrt(0.7), im: 0 }, // 0.70 / 0.30 ≈ 2.33 > 1.5
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(3);
  });
});
