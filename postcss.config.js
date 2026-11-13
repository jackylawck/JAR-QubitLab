// postcss.config.js
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS 壓縮統一交由 Vite 建置管線（esbuild / lightningcss）接管，避免重複解析與 Source Map 偏移
  },
};
