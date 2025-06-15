const CACHE_NAME = 'blessibles-cache-v1';
const API_CACHE_NAME = 'blessibles-api-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/images/fallback-image.png',
  OFFLINE_URL,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME).map((name) => caches.delete(name))
        );
      })
    ])
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle API caching for gallery and testimonials
  if (url.pathname.startsWith('/api/gallery') || url.pathname.startsWith('/api/testimonials')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) =>
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // Default: static assets and navigation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          // Optionally cache new requests
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          if (event.request.destination === 'image') {
            return caches.match('/images/fallback-image.png');
          }
        });
    })
  );
}); 