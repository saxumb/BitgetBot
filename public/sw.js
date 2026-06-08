const CACHE_NAME = "bitget-ai-bot-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/icon.svg",
  "/manifest.json"
];

// Install Event - cache initial shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell and static assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network-first or cache fallback for assets, STRICTLY bypass API routes
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If request is an API call, let it pass straight to the network (never cache bot simulation endpoints)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle document/assets with cache fallback strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache new successful responses for non-api routes
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic" &&
          event.request.method === "GET"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable or timed out
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optional SPA fallback if HTML is requested
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        });
      })
  );
});
