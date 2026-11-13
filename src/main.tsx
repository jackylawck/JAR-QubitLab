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

// 啟動 F12 賽博龐克量子科普彩蛋 (LAST_ORDER 協定)
initCyberpunkEasterEgg();

const isDev = import.meta.env?.DEV ?? false;
const isProd = import.meta.env?.PROD ?? false;
const rawBaseUrl = import.meta.env?.BASE_URL ?? '/';
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

// 1. 移動端除錯：僅在開發環境 (DEV) 且為觸控螢幕時動態載入 Eruda 面板
if (isDev && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
  import('eruda')
    .then(({ default: eruda }) => eruda.init())
    .catch((err) => console.warn('[JAR-QubitLab] Eruda failed to load:', err));
}

// 2. Vite 部署新版本導致舊 Chunk Hash 失效時的自動恢復防護
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    window.location.reload();
  });
}

// 3. PWA 離線支援與無縫版本熱更新 (Service Worker Lifecycle)
if (isProd && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const registerSW = () => {
    const swUrl = `${baseUrl}sw.js`;
    // 記錄註冊前是否已有舊版 SW 控制頁面，避免首次造訪因 clients.claim() 觸發多餘重整
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker
      .register(swUrl, { scope: baseUrl })
      .catch((err) => console.warn('[JAR-QubitLab] Service Worker registration failed:', err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW, { once: true });
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('❌ Failed to find the root element. Ensure there is a <div id="root"></div> in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
