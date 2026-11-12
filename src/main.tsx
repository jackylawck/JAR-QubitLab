// src/main.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initCyberpunkEasterEgg } from './utils/easterEgg';

// 🌟 啟動 F12 賽博龐克量子科普彩蛋 (LAST_ORDER 協定)
initCyberpunkEasterEgg();

// 🌟 優化 1：安全提取環境變數，防堵 Vitest/Jest 等純 Node 測試環境中 import.meta 解析失敗導致的崩潰
const isDev = import.meta.env?.DEV ?? false;
const isProd = import.meta.env?.PROD ?? false;
const baseUrl = import.meta.env?.BASE_URL ?? '/';

// 🌟 移動端除錯：僅在開發環境 (DEV) 且為觸控螢幕時動態載入 Eruda 面板
if (isDev && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
  import('eruda')
    .then(({ default: eruda }) => eruda.init())
    // 🌟 優化 2：捕捉動態載入失敗 (如網路抖動或模組缺失)，防止 Unhandled Promise Rejection 污染主線程
    .catch((err) => console.warn('[JAR-QubitLab] Eruda failed to load:', err)); 
}

// 🌟 優化 3：PWA 離線支援 (Service Worker 註冊)
// 確保量子實驗室能達到「斷網可用、純前端 RAM 運行」的極致隱私與效能標準
if (isProd && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 配合 Vite PWA 或標準 sw.js，並對接 GitHub Pages 的 Base URL
    navigator.serviceWorker.register(`${baseUrl}sw.js`)
      .catch((err) => console.warn('[JAR-QubitLab] Service Worker registration failed:', err));
  });
}

const rootElement = document.getElementById('root');

// 🌟 防禦性編程：取代危險的非空斷言 (!)，容器缺失時拋出精確異常
if (!rootElement) {
  throw new Error('❌ Failed to find the root element. Ensure there is a <div id="root"></div> in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
