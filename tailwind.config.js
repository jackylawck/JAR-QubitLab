// tailwind.config.js
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // 僅在具備真實滑鼠指標的裝置啟用 :hover，杜絕 iOS/Android 觸控後的 Hover 殘留
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        quantum: {
          q0: '#38bdf8',        // sky-400 (展台 1 基礎態)
          q1: '#22d3ee',        // cyan-400 (展台 2 干涉態)
          entangled: '#a855f7', // purple-500 (展台 3 貝爾糾纏態)
          teleport: '#10b981',  // emerald-500 (展台 4 隱形傳態)
          classical: '#fbbf24', // amber-400 (經典通訊位元)
        },
      },
      fontFamily: {
        math: ['"Noto Sans Math"', 'sans-serif'],
      },
    },
  },
  plugins: [
    // 集中管理安全區域與捲軸隱藏工具類（Single Source of Truth）
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.pt-safe': {
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        },
        '.pb-safe': {
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        },
        '.min-h-screen-safe': {
          minHeight: [
            'calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
            'calc(100dvh - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
          ],
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};
