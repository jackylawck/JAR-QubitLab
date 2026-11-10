// src/quantum/types.ts
export type GateName = 'H' | 'X' | 'Z' | 'CNOT' | 'PHASE_NOOP';

export interface RawComplex {
  re: number;
  im: number;
}

/**
 * 渲染與對外呈現型別。
 * ⚠️ CRITICAL: 內部麼正矩陣運算僅讀取 re 與 im；modulus 與 phase 為派生緩存，輸入時一律忽略。
 */
export interface ComplexAmplitude extends RawComplex {
  readonly modulus: number; // |α| ∈ [0, 1]
  readonly phase: number;   // arg(α) ∈ [0, 2π)
}
