self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('jardim-botanico-ufsm').then(function(cache) {
        return cache.addAll([
          '/',
          '/home.html',
          '/Mapa.html',
          '/agendamento.html',
          '/contato.html',
          '/stylesHome.css',
          '/stylesNav.css',
          '/stylesCont.css',
          '/stylesMap.css',
          '/stylesAgend.css',
          '/jard1.jpg',
          '/jard2.jpg',
          '/jard3.jpg',
          '/jard4.jpg',
          '/jard5.jpg',
          '/jard6.jpg',
          '/jard7.jpg',
          '/script.js',
          'https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.3/tiny-slider.css',
          'https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.3/min/tiny-slider.js',
          'https://cdn.jsdelivr.net/npm/keen-slider@6.8.5/keen-slider.min.css',
          'https://cdn.jsdelivr.net/npm/keen-slider@6.8.5/keen-slider.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css',
          'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css',
          'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.js',
        ]);
      })
    );
  });
  
  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(cacheName)
        .then(function(cache) {
          return cache.addAll(filesToCache);
        })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          return response || fetch(event.request);
        })
    );
  });