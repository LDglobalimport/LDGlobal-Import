const CACHE_NAME = 'ldglobal-cache-v5';

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
      // Usamos map para capturar errores individuales y no abortar si falta una imagen
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
  // Ignorar peticiones que no sean GET (como el POST a Google Apps Script)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar peticiones a servicios/APIs externas (EmailJS, OneSignal, Google Sheets, DolarAPI)
  if (
    url.origin !== location.origin || 
    url.hostname.includes('google') || 
    url.hostname.includes('onesignal') || 
    url.hostname.includes('emailjs') || 
    url.hostname.includes('dolar')
  ) {
    return; // El navegador las maneja directamente por red
  }

  // Para archivos propios del sitio: Responder desde caché, si no existe buscar en la red
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback si está totalmente sin conexión y pide una página HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
