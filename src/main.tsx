// src/main.tsx
import { StrictMode } from 'react'; // 🌟 優化 2：只引入需要的 StrictMode，捨棄厚重的全域 React 引入
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 🌟 保留你優秀的邏輯：僅在開發環境 (DEV) 且為觸控螢幕時，動態載入 Eruda 除錯面板
if (import.meta.env.DEV && window.matchMedia('(pointer: coarse)').matches) {
  import('eruda').then(({ default: eruda }) => eruda.init());
}

const rootElement = document.getElementById('root');

// 🌟 優化 3：防禦性編程取代危險的非空斷言 (!)
if (!rootElement) {
  throw new Error('❌ Failed to find the root element. Ensure there is a <div id="root"></div> in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
