// src/constants.ts

/**
 * ==========================================
 * 1. 靜態資源路徑 (Asset Paths)
 * ==========================================
 * 確保 Vite 建置時能正確對接 GitHub Pages 的 Base URL (例如 /JAR-QubitLab/)
 */
export const FONT_MATH_PATH = `${import.meta.env.BASE_URL}fonts/NotoSansMath-Regular.woff`;

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

/**
 * ==========================================
 * 3. 量子系統常數 (Quantum System Config)
 * ==========================================
 * 為 Sprint 3 (多 Qubit 糾纏與 CNOT) 預留的系統邊界防護參數
 */
export const QUANTUM_CONFIG = {
  INITIAL_QUBITS: 2,
  MAX_SUPPORTED_QUBITS: 3, // 預留 3 Qubits 上限以防矩陣指數級爆炸導致手機瀏覽器 OOM
} as const;
