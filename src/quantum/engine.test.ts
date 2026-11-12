// src/quantum/engine.test.ts
import { describe, it, expect } from 'vitest';
import { applyGatePure, initZeroState, processStateVector, applyPhaseGate, calculateConcurrence } from './engine';
import { GateName, RawComplex } from './types';

describe('Quantum Engine Integrity & Big-Endian Verification', () => {
  it('1. 驗證 Big-Endian: X(q0) 應將 |00⟩ 翻轉為 |10⟩ (索引 2，而非索引 1)', () => {
    const init = initZeroState(2);
    const { amplitudes } = applyGatePure(init.amplitudes, 0, 'X', [0], 2);

    expect(amplitudes.length).toBe(4);
    expect(amplitudes[0]!.modulus).toBeCloseTo(0.0);
    expect(amplitudes[1]!.modulus).toBeCloseTo(0.0);
    expect(amplitudes[2]!.modulus).toBeCloseTo(1.0);
    expect(amplitudes[3]!.modulus).toBeCloseTo(0.0);
  });

  it('2. 驗證 CNOT 作用: ctrl=q0, tgt=q1 作用於 |10⟩ 應輸出 |11⟩ (索引 3)', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [0, 1], 2);

    expect(step2.amplitudes[0]!.modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[1]!.modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[2]!.modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[3]!.modulus).toBeCloseTo(1.0);
  });

  it('3. 驗證 CNOT 反向防呆: ctrl=q1, tgt=q0 作用於 |10⟩ 應保持 |10⟩', () => {
    const init = initZeroState(2);
    const step1 = applyGatePure(init.amplitudes, 0, 'X', [0], 2);
    const step2 = applyGatePure(step1.amplitudes, step1.refIdx, 'CNOT', [1, 0], 2);

    expect(step2.amplitudes[0]!.modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[1]!.modulus).toBeCloseTo(0.0);
    expect(step2.amplitudes[2]!.modulus).toBeCloseTo(1.0);
    expect(step2.amplitudes[3]!.modulus).toBeCloseTo(0.0);
  });
});

describe('Global Phase Lock Hysteresis (processStateVector)', () => {
  it('4. 鎖相遲滯：候選未達 1.5 倍前，refIdx 不得漂移（保持舊索引 0）', () => {
    // 🌟 優化 1：匹配最新的引擎輸入格式 (RawComplex)
    const dummy: RawComplex[] = [
      { re: Math.sqrt(0.49), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sqrt(0.51), im: 0 },
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(0);
  });

  it('5. 鎖相切換：候選超過 1.5 倍時，refIdx 應切換至新基準（切換至索引 3）', () => {
    const dummy: RawComplex[] = [
      { re: Math.sqrt(0.3), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sqrt(0.7), im: 0 },
    ];
    const { refIdx } = processStateVector(dummy, 0);
    expect(refIdx).toBe(3); // 0.7 > 0.3 * 1.5 (0.45)
  });
});

describe('Phase & Normalization Accuracy', () => {
  it('6. 驗證 Z 門相位翻轉: Z(q0) 作用於 |+0⟩ 應使 |10⟩ 振幅相位變為 π', () => {
    const init = initZeroState(2);
    const h = applyGatePure(init.amplitudes, 0, 'H', [0], 2);
    expect(h.amplitudes[2]!.phase).toBeCloseTo(0, 5);

    const z = applyGatePure(h.amplitudes, h.refIdx, 'Z', [0], 2);
    expect(z.amplitudes[0]!.phase).toBeCloseTo(0, 5);
    expect(z.amplitudes[2]!.phase).toBeCloseTo(Math.PI, 5);
  });

  it('7. 驗證 H 門標準化: H(q0) 作用於 |00⟩ 應產生兩個模長 1/√2 的振幅', () => {
    const init = initZeroState(2);
    const { amplitudes } = applyGatePure(init.amplitudes, 0, 'H', [0], 2);
    expect(amplitudes[0]!.modulus).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(amplitudes[2]!.modulus).toBeCloseTo(1 / Math.SQRT2, 5);
    expect(amplitudes[1]!.modulus).toBeCloseTo(0, 5);
    expect(amplitudes[3]!.modulus).toBeCloseTo(0, 5);
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

describe('Sprint 2: Mach-Zehnder Full Sequence (H -> P(phi) -> H)', () => {
  // 🌟 優化 3：利用 test.each 拆解測試，錯誤定位更精準
  const testAngles = [
    { phi: 0, name: '0' },
    { phi: Math.PI / 4, name: 'PI/4' },
    { phi: Math.PI / 3, name: 'PI/3' },
    { phi: Math.PI / 2, name: 'PI/2' },
    { phi: (2 * Math.PI) / 3, name: '2PI/3' },
    { phi: Math.PI, name: 'PI' },
    { phi: (3 * Math.PI) / 2, name: '3PI/2' },
  ];

  it.each(testAngles)('9. phi = $name 時滿足概率轉移與能量守恆', ({ phi }) => {
    const zero = initZeroState(2);
    const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], 2);
    const afterP = applyPhaseGate(afterH.amplitudes, phi, 0, 2, afterH.refIdx);
    const finalState = applyGatePure(afterP.amplitudes, afterP.refIdx, 'H', [0], 2);

    const pA = finalState.amplitudes[0]!.modulus ** 2;
    const pB = finalState.amplitudes[2]!.modulus ** 2;

    expect(pA).toBeCloseTo(Math.cos(phi / 2) ** 2, 5);
    expect(pB).toBeCloseTo(Math.sin(phi / 2) ** 2, 5);
    expect(pA + pB).toBeCloseTo(1.0, 5); 
  });

  it('10. phi = 0 時應完全相長干涉進入 Path A，Path B 湮滅為 0', () => {
    const zero = initZeroState(2);
    const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], 2);
    const afterP = applyPhaseGate(afterH.amplitudes, 0, 0, 2, afterH.refIdx);
    const finalState = applyGatePure(afterP.amplitudes, afterP.refIdx, 'H', [0], 2);

    expect(finalState.amplitudes[0]!.modulus ** 2).toBeCloseTo(1.0, 5);
    expect(finalState.amplitudes[2]!.modulus ** 2).toBeCloseTo(0.0, 5);
  });

  it('11. phi = PI 時應完全轉移進入 Path B，Path A 湮滅為 0', () => {
    const zero = initZeroState(2);
    const afterH = applyGatePure(zero.amplitudes, zero.refIdx, 'H', [0], 2);
    const afterP = applyPhaseGate(afterH.amplitudes, Math.PI, 0, 2, afterH.refIdx);
    const finalState = applyGatePure(afterP.amplitudes, afterP.refIdx, 'H', [0], 2);

    expect(finalState.amplitudes[0]!.modulus ** 2).toBeCloseTo(0.0, 5);
    expect(finalState.amplitudes[2]!.modulus ** 2).toBeCloseTo(1.0, 5);
  });
});
