// tailwind.config.js
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 🌟 優化 1：PWA 行動端體驗防護 (杜絕 Hover 殘留)
  future: {
    hoverOnlyWhenSupported: true, 
  },
  theme: {
    extend: {
      // 🌟 優化 2：擴充量子主題語義色 (可選，讓程式碼更具領域性)
      colors: {
        quantum: {
          q0: '#38bdf8', // sky-400 (展台 1 基礎態)
          q1: '#22d3ee', // cyan-400 (展台 2 干涉態)
          entangled: '#a855f7', // purple-500 (展台 3 糾纏態)
        }
      },
      // 擴充字體以支援數學符號
      fontFamily: {
        math: ['"Noto Sans Math"', 'sans-serif'],
      }
    },
  },
  plugins: [
    // 🌟 優化 3：注入安全區域 (Safe Area) 的 Utility Classes
    plugin(function({ addUtilities }) {
      addUtilities({
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.min-h-screen-safe': {
          minHeight: 'calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
        }
      })
    })
  ],
}
