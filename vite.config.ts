import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // GitHub Pages 動態 Base URL
  base: process.env.GITHUB_ACTIONS ? '/JAR-QubitLab/' : '/',

  server: {
    host: true,
    open: true,
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,

    rollupOptions: {
      output: {
        // 🌟 修復 useLayoutEffect 報錯：
        // 僅將無 React 依賴的純 Three.js 核心獨立分塊快取，
        // 確保 React 與 @react-spring / @react-three 處於同一執行上下文，避免 CJS 橋接未定義
        manualChunks(id) {
          if (id.includes('node_modules/three/')) {
            return 'three-core';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },

  esbuild: {
    pure: process.env.GITHUB_ACTIONS ? ['console.log', 'console.info'] : [],
    drop: process.env.GITHUB_ACTIONS ? ['debugger'] : [],
  },
});
