// src/quantum/types.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Core Type Definitions for Quantum State Engine
 */

// 🌟 優化 1：Single Source of Truth (單一真相源)
// 透過 as const 陣列推導型別，未來 UI 渲染閘門選單時可直接 import SUPPORTED_GATES
export const SUPPORTED_GATES = ['H', 'X', 'Z', 'CNOT'] as const;

// 支援的離散量子門集合 (連續相位 P 門由引擎獨立的 applyPhaseGate 處理)
export type GateName = typeof SUPPORTED_GATES[number];

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
// 🌟 優化 2：明確展開屬性，提升 IDE 型別提示 (Intellisense) 體驗
export interface ComplexAmplitude {
  readonly re: number;
  readonly im: number;
  readonly modulus: number; // |α| ∈ [0, 1] 振幅模長 (機率 = modulus²)
  readonly phase: number;   // arg(α) ∈ [0, 2π) 絕對相位角
}
