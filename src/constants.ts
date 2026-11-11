// src/constants.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */

/**
 * ==========================================
 * 1. 靜態資源路徑 (Asset Paths)
 * ==========================================
 * 確保 Vite 建置時能正確對接 GitHub Pages 的 Base URL (例如 /JAR-QubitLab/)
 * 🌟 優化：加入 `?.` 與 fallback，防堵 Vitest/Jest 測試環境下 import.meta 缺失導致的崩潰
 */
export const FONT_MATH_PATH = `${import.meta.env?.BASE_URL || '/'}fonts/NotoSansMath-Regular.woff`;

/**
 * ==========================================
 * 2. 持久化存儲鍵值註冊表 (Storage Keys Registry)
 * ==========================================
 * 集中管理所有寫入 LocalStorage 的 Key，防範拼寫錯誤與全域衝突
 */
export const STORAGE_KEYS = {
  LOCALE: 'jar_qubitlab_locale',
  SOUND_MUTED: 'jar_qubitlab_sound_muted',
} as const;

// 🌟 優化：提取 Value 成為聯合型別 ('jar_qubitlab_locale' | 'jar_qubitlab_sound_muted')
// 未來若有工具函數 `function getStorage(key: StorageKey)` 即可享受最嚴格的 TS 提示
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * ==========================================
 * 3. 量子系統常數 (Quantum System Config)
 * ==========================================
 * 為 Sprint 3 (多 Qubit 糾纏與 CNOT) 預留的系統邊界防護參數
 */
export const QUANTUM_CONFIG = {
  INITIAL_QUBITS: 2,
  MAX_SUPPORTED_QUBITS: 3, // 預留 3 Qubits 上限，防範 2^N 矩陣指數級爆炸導致手機瀏覽器 OOM (Out of Memory)
  
  // 🌟 優化：浮點數運算容差 (Epsilon)
  // Float64 在計算相消干涉或 CNOT 糾纏度時常有極小誤差 (如 1.22e-16)
  // 往後判斷「是否為零」或「機率是否為 1」請統一使用此容差：Math.abs(val) < EPSILON
  EPSILON: 1e-8, 
} as const;
