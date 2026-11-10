/// <reference types="vite/client" />

/**
 * ==========================================
 * 🌟 優化 1：嚴格型別化環境變數 (Environment Variables Typing)
 * ==========================================
 * 讓 IDE 在輸入 import.meta.env. 時具備完美的自動補完與型別檢查，
 * 徹底杜絕打錯字導致的線上 Bug。
 */
interface ImportMetaEnv {
  /** 
   * Vite 內建的 Base URL (由 vite.config.ts 定義)。
   * 在 GitHub Pages 上線時將自動對應為 '/JAR-QubitLab/'
   */
  readonly BASE_URL: string;
  
  /** 判斷是否為本地開發環境 */
  readonly DEV: boolean;
  
  /** 判斷是否為生產建置環境 */
  readonly PROD: boolean;

  // 💡 如果未來有新增 .env 變數 (例如 VITE_APP_VERSION)，請在此處擴充：
  // readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * ==========================================
 * 🌟 優化 2：3D 與量子專案特規資源型別宣告 (Asset Modules)
 * ==========================================
 * 未來若需要透過 import 語法直接載入字體或自訂的 WebGL 著色器，
 * TypeScript 將能正確辨識，不會噴出紅字錯誤。
 */
declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}
