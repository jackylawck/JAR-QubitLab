/// <reference types="vite/client" />

/**
 * Project: J.A.R. QubitLab
 * 擴充專案自訂環境變數（內建 BASE_URL、DEV、PROD 已由 vite/client 提供）
 */
interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * WebGL / Three.js 自訂著色器模組型別宣告（Vite 預設未涵蓋）
 */
declare module '*.glsl' {
  const shader: string;
  export default shader;
}

declare module '*.vert' {
  const shader: string;
  export default shader;
}

declare module '*.frag' {
  const shader: string;
  export default shader;
}

declare module '*.wgsl' {
  const shader: string;
  export default shader;
}
