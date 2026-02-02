const CACHE_NAME = "autogen-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/assets/*",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("/surat") ||
    event.request.url.includes("/cv") ||
    event.request.url.includes("/materi")
  ) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        return new Response(
          `
          <html>
            <head><title>Update Diperlukan</title></head>
            <body style="margin:0;padding:20px;font-family:Arial">
              <h2>🛠️ Aplikasi Diperbarui</h2>
              <p>Halaman ini telah diperbarui. Silakan refresh atau buka di tab baru.</p>
              <button onclick="location.reload()">🔄 Refresh Sekarang</button>
            </body>
          </html>
        `,
          {
            headers: { "Content-Type": "text/html" },
          },
        );
      }),
  );
});
