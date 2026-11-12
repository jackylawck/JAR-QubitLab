// vite.config.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isCI = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  plugins: [react()],

  // GitHub Pages 動態子路徑對齊
  base: isCI ? '/JAR-QubitLab/' : '/',

  server: {
    host: true,
    open: true,
  },

  // 支援本機以 `npm run preview` 在局域網手機實測生產環境與 Service Worker
  preview: {
    host: true,
    port: 4173,
  },

  // 加速本地開發冷啟動，避免 Three.js 龐大模組重複預編譯
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', '@react-spring/three', 'zustand'],
  },

  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,

    rollupOptions: {
      output: {
        // 明確指定產物命名格式，利於瀏覽器長效強快取 (Immutable Cache)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        manualChunks(id) {
          // 跨平台路徑正則（相容 Windows 反斜線與 Linux 正斜線），確保本機與 CI 分塊一致
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) {
            return 'three-core';
          }
          if (/[\\/]node_modules[\\/]/.test(id)) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },

  esbuild: {
    // 僅抹除一般除錯日誌；easterEgg.ts 已透過 console.log.bind(console) 免疫此規則
    pure: isCI ? ['console.log', 'console.info'] : [],
    drop: isCI ? ['debugger'] : [],
    legalComments: 'none',
  },
});
