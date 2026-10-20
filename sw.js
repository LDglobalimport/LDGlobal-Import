const CACHE_NAME = 'ldglobal-cache-v8';

// Archivos estáticos para soporte offline
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './logo-secundario.png',
  './logo-principal.png'
];

// Registrar eventos globales en la evaluación inicial
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

// Manejador del evento 'message' declarado en el hilo principal del Service Worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Estrategia de peticiones (Fetch)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Omitir dominios externos de analíticas o APIs dinámicas
  if (
    url.origin !== location.origin || 
    url.hostname.includes('google') || 
    url.hostname.includes('onesignal') || 
    url.hostname.includes('emailjs') || 
    url.hostname.includes('dolar') ||
    url.hostname.includes('dolarvzla')
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
