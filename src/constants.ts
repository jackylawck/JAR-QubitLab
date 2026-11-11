// src/constants.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */

/**
 * ==========================================
 * 1. 靜態資源路徑 (Asset Paths)
 * ==========================================
 * 🌟 優化：透過閉包與 `any` 斷言封裝 `import.meta`。
 * 徹底防堵非 ESM 測試環境（如純 Node.js 或舊版 Jest）中因無法解析 `import.meta` 關鍵字而導致的 SyntaxError。
 */
const getBaseUrl = (): string => {
  try {
    return (import.meta as any).env?.BASE_URL || '/';
  } catch {
    return '/';
  }
};
export const FONT_MATH_PATH = `${getBaseUrl()}fonts/NotoSansMath-Regular.woff`;

/**
 * ==========================================
 * 2. 持久化存儲鍵值註冊表 (Storage Keys Registry)
 * ==========================================
 * 🌟 優化：加上 `Object.freeze()`。
 * `as const` 僅提供編譯期（Compile-time）的唯讀保護，`Object.freeze()` 則提供運行時（Runtime）的絕對不可變性，防止第三方套件或意外操作竄改。
 */
export const STORAGE_KEYS = Object.freeze({
  LOCALE: 'jar_qubitlab_locale',
  SOUND_MUTED: 'jar_qubitlab_sound_muted',
} as const);

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * ==========================================
 * 3. 量子系統常數 (Quantum System Config)
 * ==========================================
 */
export const QUANTUM_CONFIG = Object.freeze({
  INITIAL_QUBITS: 2,
  MAX_SUPPORTED_QUBITS: 3, 
  
  // 🌟 優化：將 EPSILON 從 1e-8 調整為 1e-9，
  // 完美對齊 Sprint 3 `tensorEngine.ts` 內部 1.5x 遲滯鎖相與 `getAmplitudes()` 的歸零閾值。
  EPSILON: 1e-9, 
} as const);
