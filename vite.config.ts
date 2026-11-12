import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // 🌟 GitHub Pages 動態 Base URL
  base: process.env.GITHUB_ACTIONS ? '/JAR-QubitLab/' : '/',

  // 🌟 優化 1：本地開發體驗 (DX)
  server: {
    host: true, // 允許透過區域網路 IP 連線，方便用手機實機測試觸控與 PWA 體驗
    open: true, // 啟動開發伺服器時自動開啟瀏覽器
  },

  // 🌟 優化 2：生產環境建置策略 (Build Optimization)
  build: {
    target: 'es2022', // 與 tsconfig 嚴格對齊，支援現代 ES 語法
    sourcemap: false, // 關閉 SourceMap：保護量子引擎源碼不外流，且大幅縮減打包體積
    chunkSizeWarningLimit: 800, // Three.js 生態較大，適度調高警告閾值避免終端機刷頻
    
    // 🌟 優化 3：進階 Rollup 分塊策略 (Manual Chunks)
    rollupOptions: {
      output: {
        manualChunks: {
          // 模組 1：React 核心 (極少變動，利於瀏覽器永久快取)
          'react-vendor': ['react', 'react-dom'],
          // 模組 2：3D 渲染引擎 (重量級模組獨立打包，避免阻塞業務邏輯載入)
          'three-engine': ['three', '@react-three/fiber', '@react-three/drei'],
          // 模組 3：動畫與狀態管理 (Spring 與 Zustand)
          'spring-state': ['@react-spring/three', 'zustand'],
        }
      }
    }
  },

  // 🌟 優化 4：隱私與效能防護 (Zero-GC & Privacy)
  esbuild: {
    // 僅在生產環境中移除 console.log 與 console.info，保留 warn 與 error 用於關鍵錯誤捕捉
    pure: process.env.GITHUB_ACTIONS ? ['console.log', 'console.info'] : [],
    // 徹底移除 debugger 語句
    drop: process.env.GITHUB_ACTIONS ? ['debugger'] : [],
  }
});
