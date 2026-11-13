// src/quantum/types.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Core Type Definitions for Quantum State Engine
 */

// Single Source of Truth：透過 as const 陣列推導閘門聯集型別
export const SUPPORTED_GATES = ['H', 'X', 'Z', 'CNOT'] as const;

// 支援的離散量子門集合（連續相位 P 門由引擎獨立的 applyPhaseGate 處理）
export type GateName = (typeof SUPPORTED_GATES)[number];

// 展台 4 量子隱形傳態的兩位元經典通道訊息（00, 01, 10, 11）
export type ClassicalTwoBit = 0 | 1 | 2 | 3;

/**
 * 引擎內部底層運算複數型別。
 * 允許原地修改 (In-place mutation) 以達成 Zero-GC。
 */
export interface RawComplex {
  re: number;
  im: number;
}

/**
 * 傳入純函數量子引擎的不可變狀態向量快照。
 */
export type QuantumStateVector = ReadonlyArray<RawComplex>;

/**
 * 渲染與對外呈現型別。
 * ⚠️ CRITICAL:
 * 1. 內部么正矩陣運算僅讀取 re 與 im；modulus 與 phase 為派生緩存，輸入時一律忽略。
 * 2. 嚴格唯讀 (Strict Readonly)：UI 組件不可竄改任何屬性，確保物理狀態與派生屬性同步。
 */
export interface ComplexAmplitude {
  readonly re: number;
  readonly im: number;
  readonly modulus: number; // |α| ∈ [0, 1] 振幅模長（機率 = modulus²）
  readonly phase: number;   // arg(α) ∈ [0, 2π) 絕對相位角
}

/**
 * 量子態演化後的標準輸出契約（含 1.5x 遲滯鎖相基準索引）。
 */
export interface StateEvolutionResult {
  readonly amplitudes: ComplexAmplitude[];
  readonly refIdx: number;
}

/**
 * 全域投影測量（Projective Measurement）後的坍縮輸出契約。
 */
export interface MeasurementResult extends StateEvolutionResult {
  readonly collapsedIndex: number;
}
