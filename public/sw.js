const CACHE_NAME = 'kpi-ai-v1.0.1';
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
  // Skip service worker for navigation requests to avoid redirect issues in Safari
  if (event.request.mode === 'navigate') {
    return;
  }

  // Skip service worker for API requests to avoid redirect issues
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Only handle static assets (manifest, icons, images)
  const isStaticAsset = event.request.url.includes('manifest.json') || 
                        event.request.url.includes('.png') ||
                        event.request.url.includes('.ico') ||
                        event.request.url.includes('.jpg') ||
                        event.request.url.includes('.jpeg') ||
                        event.request.url.includes('.webp') ||
                        event.request.url.includes('.svg');

  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache if response is not ok
            if (!response || !response.ok) {
              return response;
            }

            // Cache the response
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });

            return response;
          });
      })
  );
}); 