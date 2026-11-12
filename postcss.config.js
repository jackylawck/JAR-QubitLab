// postcss.config.js
export default {
  plugins: {
    // 🌟 優化 1：加入 Tailwind 官方推薦的巢狀語法支援 (Nesting)
    // 注意：必須嚴格放置在 tailwindcss 之前
    'tailwindcss/nesting': {},
    
    tailwindcss: {},
    autoprefixer: {},
    
    // 🌟 優化 2：(架構防禦) 這裡刻意「不加入」 cssnano 等壓縮套件
    // 因為 Vite 的底層 (esbuild / lightningcss) 已經在 build 階段自動接管了 CSS 極速壓縮，
    // 若在 PostCSS 階段重複執行壓縮，不僅會拖慢 CI/CD 的建置速度，還可能引發 Source Map 錯位。
  },
}
