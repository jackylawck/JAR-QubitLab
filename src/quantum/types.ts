// src/quantum/types.ts

// 支援的離散量子門集合 (連續相位 P 門由引擎獨立的 applyPhaseGate 處理)
export type GateName = 'H' | 'X' | 'Z' | 'CNOT';

/**
 * 引擎內部底層運算型別。
 * 允許原地修改 (In-place mutation) 以達成 Zero-GC。
 */
export interface RawComplex {
  re: number;
  im: number;
}

/**
 * 渲染與對外呈現型別。
 * ⚠️ CRITICAL: 
 * 1. 內部么正矩陣運算僅讀取 re 與 im；modulus 與 phase 為派生緩存，輸入時一律忽略。
 * 2. 嚴格唯讀 (Strict Readonly)：UI 組件絕對不可竄改任何屬性，確保物理狀態與派生屬性永遠同步。
 */
export interface ComplexAmplitude extends Readonly<RawComplex> {
  readonly modulus: number; // |α| ∈ [0, 1] 振幅模長 (機率 = modulus²)
  readonly phase: number;   // arg(α) ∈ [0, 2π) 絕對相位角
}
