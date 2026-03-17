// VERSION: 2026-03-16
// Auto-updating service worker for FRC 6147 Scouting App

// Install: activate immediately
self.addEventListener("install", event => {
  self.skipWaiting();
});

// Activate: take control of all pages right away
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Network-first strategy:
// Always try to fetch the newest files from the server.
// If offline, fall back to cache.
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});