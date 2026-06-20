// Service worker for Wondrous Journal — caches the app shell for offline support.
// Vite bundles JS/CSS into hashed filenames we can't predict here, so we only
// pre-cache the static shell files. All other assets are served network-first
// and cached on the way through so the app still loads offline after first use.

const CACHE_NAME = 'wondrous-journal-shell-v2';

// Only cache files that exist at predictable URLs after `vite build`.
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete any old caches from previous versions.
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

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests (e.g. Supabase API calls).
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    // Network-first: try the network, fall back to cache if offline.
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for offline use.
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
