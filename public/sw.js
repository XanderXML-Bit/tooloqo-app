// Tooloqo Service Worker for Offline Support
const CACHE_NAME = 'tooloqo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Tooloqo SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Tooloqo SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Tooloqo SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Tooloqo SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (except CDN)
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isTailwindCDN = url.hostname === 'cdn.tailwindcss.com';

  if (!isSameOrigin && !isTailwindCDN) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
          })
          .catch(() => {
            // Network failed, but we have cache
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          // Cache successful responses
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Network failed and not in cache
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
