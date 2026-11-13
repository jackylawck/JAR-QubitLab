// vite.config.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const isCI = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [react()],

    // 建置階段統一對齊 GitHub Pages 子路徑，確保本機 `npm run preview` 與線上環境 100% 一致
    base: isBuild ? '/JAR-QubitLab/' : '/',

    server: {
      host: true,
      open: false,
    },

    // 支援局域網手機真機實測生產包與 Service Worker 離線快取
    preview: {
      host: true,
      port: 4173,
      strictPort: false,
    },

    // 加速本地開發冷啟動，避免 Three.js 與 R3F 龐大模組重複預編譯
    optimizeDeps: {
      include: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-spring/three',
        'zustand',
      ],
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
            if (!/[\\/]node_modules[\\/]/.test(id)) return undefined;

            // 1. Three.js 核心幾何與著色器引擎獨立成塊（變動頻率最低，快取壽命最長）
            if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) {
              return 'three-core';
            }

            // 2. React 渲染器與 R3F / Spring 生態獨立成塊
            if (
              /[\\/]node_modules[\\/](react|react-dom|scheduler|@react-three|@react-spring)[\\/]/.test(
                id
              )
            ) {
              return 'r3f-vendor';
            }

            // 3. 其餘輕量工具（Zustand 等）
            return 'vendor';
          },
        },
      },
    },

    esbuild: {
      // 僅在正式建置或 CI 環境抹除一般除錯日誌；easterEgg.ts 透過 bind(console) 免疫此規則
      pure: isCI || isBuild ? ['console.log', 'console.info'] : [],
      drop: isCI || isBuild ? ['debugger'] : [],
      legalComments: 'none',
    },

    // 採用原生 node 環境執行純量子演算法與狀態單元測試，零外部 DOM 依賴、CI 秒過
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
