// VERSION: 2026-03-17
// Offline-capable, auto-updating service worker for FRC 6147 Scouting App

const CACHE_NAME = "scouting-cache-v2026-03-17";

// Add every file your app needs to load offline
const FILES_TO_CACHE = [
  "/",               // root
  "/index.html",
  "/app.js",
  "/styles.css",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install: pre-cache everything
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: remove old caches + take control immediately
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first, fallback to cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh version
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});