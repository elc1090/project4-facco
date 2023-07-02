// Define o nome do cache
var cacheName = 'jardim-botanico-cache-v1';

// Lista de arquivos a serem armazenados em cache
var filesToCache = [
  'home.html',
  'Mapa.html',
  'agendamento.html',
  'contato.html',
  'stylesCont.css',
  'stylesHome.css',
  'stylesNav.css',
  'stylesMap.css',
  'stylesAgend.css',
  'jard1.jpg',
  'jard2.jpg',
  'jard3.jpg',
  'jard4.jpg',
  'jard5.jpg',
  'jard6.jpg',
  'jard7.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.3/tiny-slider.css',
  'https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.3/min/tiny-slider.js',
  'https://cdn.jsdelivr.net/npm/keen-slider@6.8.5/keen-slider.min.css',
  'https://cdn.jsdelivr.net/npm/keen-slider@6.8.5/keen-slider.min.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.js'
];

// Evento de instalação do Service Worker
self.addEventListener('install', function(event) {
  // Realiza a instalação e armazena os arquivos em cache
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
  );
});

// Evento de ativação do Service Worker
self.addEventListener('activate', function(event) {
  // Limpa os caches antigos
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== cacheName;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
});

// Intercepta as solicitações de rede
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna a resposta do cache se encontrada
        if (response) {
          return response;
        }

        // Caso contrário, realiza a solicitação de rede
        return fetch(event.request);
      })
  );
});
