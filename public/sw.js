const CACHE_NAME = "autogen-v3";
const urlsToCache = ["/", "/index.html", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
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
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response(
            `
              <html>
                <head><title>Aplikasi Siap</title></head>
                <body style="margin:0;padding:20px;font-family:Arial;text-align:center">
                  <h2>✅ Aplikasi Siap</h2>
                  <p>Sedang memuat versi terbaru...</p>
                  <script>setTimeout(() => location.reload(), 1500);</script>
                </body>
              </html>
            `,
            {
              headers: { "Content-Type": "text/html" },
            },
          );
        });
    }),
  );
});
