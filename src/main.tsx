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

// 🌟 移動端除錯：僅在開發環境 (DEV) 且為觸控螢幕時動態載入 Eruda 面板 (加上可選鏈 ?. 防禦)
if (import.meta.env.DEV && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
  import('eruda').then(({ default: eruda }) => eruda.init());
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
