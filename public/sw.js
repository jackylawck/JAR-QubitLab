// public/sw.js
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
const CACHE_NAME = 'jar-qubitlab-v1';

// 預快取核心入口資源，確保首次安裝後立即具備完整離線啟動能力
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './JARQubitLab192icon.png',
  './JARQubitLab512icon.png',
];

// 1. 安裝階段：預快取核心殼層並立即跳過等待
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        // 開發環境或部分檔案尚未就緒時靜默容錯，不阻斷 SW 安裝
      })
      .then(() => self.skipWaiting())
  );
});

// 2. 啟動階段：清理舊版快取並原子化接管所有開啟分頁
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. 攔截請求：Network-First（網路優先，斷網自動回退本地快取）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // 僅處理 http / https 請求，過濾 chrome-extension:// 等非標準協定
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 僅快取同源且完整的 HTTP 200 回應（排除 206 Partial Content 與跨域不透明回應）
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {});
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // 離線導覽請求（如帶參數啟動 PWA）自動回退至應用首頁殼層
        if (request.mode === 'navigate') {
          const fallbackHtml =
            (await caches.match('./index.html')) || (await caches.match('./'));
          if (fallbackHtml) return fallbackHtml;
        }

        // 避免回傳 undefined 觸發 TypeError
        return Response.error();
      })
  );
});
