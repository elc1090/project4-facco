// Registra o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            console.log('Service Worker registrado com sucesso:', registration.scope);
        }, function(error) {
            console.log('Falha ao registrar o Service Worker:', error);
        });
    });
  }
  
  
  var map = L.map('map').setView([-29.7169, -53.7299], 16);
  
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);
  
  
  // URL da API
  var url = 'https://script.google.com/macros/s/AKfycbzwVOtrIg-xJMk9eya2yVULSTdryq0f-6vGLN6XNstIomErMlB0yofoCBQvbNkrC7iMnw/exec';
  
  
  var markersLayer = L.layerGroup().addTo(map); // Layer para os marcadores
  
  
  fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data); // Exibe os dados retornados pela API
  
  
        var markers = data.saida; // Supondo que a resposta JSON tenha a estrutura { "saida": [...] }
  
  
        // Função para exibir ou ocultar os marcadores de acordo com a categoria selecionada
        function updateMarkers() {
            markersLayer.clearLayers(); // Limpa os marcadores no mapa
  
  
            var selectedCategories = Array.from(document.querySelectorAll('#categorias input[name="categoria"]:checked'))
                .map(function(checkbox) {
                    return checkbox.value;
                });
  
  
            markers.forEach(function(marker) {
                if (selectedCategories.includes(marker.Categoria) && marker.Latitude !== '' && marker.Longitude !== '') {
                    L.marker([marker.Latitude, marker.Longitude])
                        .bindPopup("<strong>" + marker.Nome + "</strong><br>" + marker.Descricao)
                        .addTo(markersLayer);
                }
            });
        }
  
  
        // Adicionar event listeners para os checkboxes de categoria
        var categoriaCheckboxes = document.querySelectorAll('#categorias input[name="categoria"]');
        categoriaCheckboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', updateMarkers);
        });
  
  
        // Exibir marcadores iniciais
        updateMarkers();
  
  
        // Função para adicionar o marcador da localização atual
        function addCurrentLocationMarker() {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
  
  
                    var redIcon = L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
  
  
                    L.marker([latitude, longitude], { icon: redIcon })
                        .bindPopup("Você está aqui")
                        .addTo(markersLayer);
  
  
                    map.setView([latitude, longitude], 16);
                });
            }
        }
  
  
        // Adicionar o marcador da localização atual
        addCurrentLocationMarker();
    })
    .catch(function(error) {
        console.log('Erro:', error);
    });
  