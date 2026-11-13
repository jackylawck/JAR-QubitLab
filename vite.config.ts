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

    // 建置階段統一對齊 GitHub Pages 子路徑
    base: isBuild ? '/JAR-QubitLab/' : '/',

    server: {
      host: true,
      open: false,
    },

    preview: {
      host: true,
      port: 4173,
      strictPort: false,
    },

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
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

          manualChunks(id) {
            if (!/[\\/]node_modules[\\/]/.test(id)) return undefined;

            // 僅將純數學與 WebGL 底層的 three 獨立拆包（零 React 依賴，絕無循環引用風險）
            if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) {
              return 'three-core';
            }

            // 所有 React 與 R3F / Spring / Zustand 生態統一歸入 vendor，確保頂層執行順序安全
            return 'vendor';
          },
        },
      },
    },

    esbuild: {
      pure: isCI || isBuild ? ['console.log', 'console.info'] : [],
      drop: isCI || isBuild ? ['debugger'] : [],
      legalComments: 'none',
    },

    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
