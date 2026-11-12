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

// 🌟 安全提取環境變數，防堵純 Node 測試環境中 import.meta 解析失敗
const isDev = import.meta.env?.DEV ?? false;
const isProd = import.meta.env?.PROD ?? false;
const rawBaseUrl = import.meta.env?.BASE_URL ?? '/';
// 🌟 優化 1：路徑結尾斜線防禦，避免 BASE_URL 缺少 '/' 時拼接出錯誤的 sw.js 路徑
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

// 🌟 移動端除錯：僅在開發環境 (DEV) 且為觸控螢幕時動態載入 Eruda 面板
if (isDev && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
  import('eruda')
    .then(({ default: eruda }) => eruda.init())
    .catch((err) => console.warn('[JAR-QubitLab] Eruda failed to load:', err));
}

// 🌟 優化 2：PWA 離線支援與無縫版本熱更新 (Service Worker Lifecycle)
if (isProd && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${baseUrl}sw.js`;

    navigator.serviceWorker
      .register(swUrl, { scope: baseUrl })
      .catch((err) => console.warn('[JAR-QubitLab] Service Worker registration failed:', err));

    // 當新版 sw.js 透過 skipWaiting() 接管控制權時，自動刷新頁面以對齊最新 Vite Chunk Hash，
    // 防止舊版快取 HTML 請求已被覆蓋的舊版 JS 檔而產生白畫面
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

const rootElement = document.getElementById('root');

// 🌟 防禦性編程：取代非空斷言 (!)，容器缺失時拋出精確異常
if (!rootElement) {
  throw new Error('❌ Failed to find the root element. Ensure there is a <div id="root"></div> in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
