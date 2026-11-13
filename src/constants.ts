// src/constants.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */

/**
 * ==========================================
 * 1. 靜態資源路徑 (Asset Paths)
 * ==========================================
 */
const getBaseUrl = (): string => {
  try {
    const raw = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
    return raw.endsWith('/') ? raw : `${raw}/`;
  } catch {
    return '/';
  }
};

export const BASE_URL = getBaseUrl();

export const ASSETS = Object.freeze({
  FONT_MATH: `${BASE_URL}fonts/NotoSansMath-Regular.woff`,
} as const);

export const FONT_MATH_PATH = ASSETS.FONT_MATH;

/**
 * ==========================================
 * 2. 持久化存儲鍵值註冊表 (Storage Keys Registry)
 * ==========================================
 */
export const STORAGE_KEYS = Object.freeze({
  LOCALE: 'jar_qubitlab_locale',
  SOUND_MUTED: 'jar_qubitlab_sound_muted',
} as const);

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * ==========================================
 * 3. 數學與物理常數 (Math & Quantum System Config)
 * ==========================================
 */
export const MATH_CONSTANTS = Object.freeze({
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI * 0.5,
  INV_SQRT2: Math.SQRT1_2,
} as const);

export const QUANTUM_CONFIG = Object.freeze({
  INITIAL_QUBITS: 2,
  MAX_SUPPORTED_QUBITS: 3,

  // 數值歸零與浮點誤差容忍閾值（對齊 engine.ts 與 tensorEngine.ts）
  EPSILON: 1e-9,

  // 1.5x 遲滯鎖相切換倍率與最小振幅切換門檻
  PHASE_LOCK_HYSTERESIS: 1.5,
  PHASE_LOCK_MIN_MOD_SQ: 1e-6,

  // 展台 3 貝爾態統計抽樣預設次數與單次間隔 (ms)
  DEFAULT_SAMPLE_COUNT: 20,
  SAMPLE_INTERVAL_MS: 150,
} as const);
