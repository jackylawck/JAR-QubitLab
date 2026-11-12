/// <reference types="vite/client" />

/**
 * ==========================================
 * 🌟 優化 1：擴展自訂環境變數 (Environment Variables Typing)
 * ==========================================
 * 注意：頂部的 `<reference types="vite/client" />` 已經為我們自動注入了 
 * BASE_URL、DEV、PROD 與 MODE 等內建型別。
 * 為了符合 TypeScript 的 DRY 原則，我們不需要重複宣告它們，
 * 而是專注於擴充專案專屬的 `VITE_` 前綴變數。
 */
interface ImportMetaEnv {
  // 💡 在此處擴充所有 .env 中定義的自訂變數，讓 IDE 具備完美自動補完：
  // readonly VITE_APP_VERSION: string;
  // readonly VITE_ENABLE_DEBUG_TOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * ==========================================
 * 🌟 優化 2：3D 引擎與音效特規資源宣告 (Asset Modules Declarations)
 * ==========================================
 * 補齊 WebGL 著色器 (Shaders) 與 Web Audio 音效檔的型別解析，
 * 確保在使用 `import url from './audio.mp3'` 或引入自訂材質時，
 * TypeScript 能夠正確識別路徑字串，不會拋出 Module not found 的紅字錯誤。
 */

// 🎨 WebGL Shaders (Three.js 自訂材質必備)
declare module '*.glsl' { const value: string; export default value; }
declare module '*.vert' { const value: string; export default value; }
declare module '*.frag' { const value: string; export default value; }

// 🔤 Web Fonts (3D 懸浮標籤字體)
declare module '*.woff' { const src: string; export default src; }
declare module '*.woff2' { const src: string; export default src; }

// 🎵 Web Audio (Sprint 4 音效回饋機制)
declare module '*.mp3' { const src: string; export default src; }
declare module '*.wav' { const src: string; export default src; }
declare module '*.ogg' { const src: string; export default src; }
