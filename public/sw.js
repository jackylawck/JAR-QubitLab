// public/sw.js
const CACHE_NAME = 'jar-qubitlab-v1';

// 安裝階段：立即接管控制權
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 啟動階段：清理舊版快取，確保使用者永遠拿到最新部署版本
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 攔截請求：Network-First（網路優先，斷網時自動回退至本地快取）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 僅快取同源且成功的靜態資源
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
