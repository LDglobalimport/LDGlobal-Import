const CACHE_NAME = 'ldglobal-cache-v3';

// Archivos esenciales para almacenar en caché
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './logo-secundario.png',
  './logo-principal.png',
  './icon-192.png',
  './icon-512.png'
];

// Evento de Instalación: Guarda los recursos iniciales en el caché
self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al nuevo Service Worker a activarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché cargado correctamente');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Activación: Elimina versiones antiguas de caché si actualizas la versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de las páginas abiertas
});

// Evento Fetch: Responde desde el caché o busca en la red si no existe
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso en caché si existe, si no, lo busca en la red
        return response || fetch(event.request);
      })
  );
});
