const CACHE_NAME = 'ldglobal-cache-v6';

// Archivos estáticos principales para trabajar offline
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './logo-secundario.png',
  './logo-principal.png'
];

// 1. Instalación
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url))
      );
    })
  );
});

// 2. Activación y limpieza de caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Estrategia de Fetch (Red / Caché)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (
    url.origin !== location.origin || 
    url.hostname.includes('google') || 
    url.hostname.includes('onesignal') || 
    url.hostname.includes('emailjs') || 
    url.hostname.includes('dolar')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
