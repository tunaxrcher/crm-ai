const CACHE_NAME = 'kpi-ai-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/auto-import-evx-logo.png?v=1.0.0',
];

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Always try to fetch from network first for manifest and icons
        if (event.request.url.includes('manifest.json') || 
            event.request.url.includes('.png') ||
            event.request.url.includes('.ico')) {
          return fetch(event.request).catch(() => response);
        }
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
}); 