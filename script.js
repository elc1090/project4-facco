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

var markersLayer = L.layerGroup().addTo(map); // Layer para os marcadores
var trackLayer = L.layerGroup().addTo(map); // Layer para o caminho do usuário

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

var track = [];
var isRecording = false;

function watcherror(err) {
    var mapDiv = document.getElementById("loc");
    mapDiv.innerHTML = err.message;
}

function startRecording() {
    isRecording = true;
    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
    document.getElementById("resetBtn").disabled = false;
    navigator.geolocation.watchPosition(recordPosition, watcherror, { enableHighAccuracy: true, maximumAge: 0, timeout: Infinity });
}

function stopRecording() {
    isRecording = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("downloadBtn").disabled = false;

    navigator.geolocation.clearWatch(recordPosition);
}

function resetTrack() {
    track = [];
    document.getElementById("downloadBtn").disabled = true;
    document.getElementById("resetBtn").disabled = true;
    document.getElementById("loc").innerHTML = "";
    trackLayer.clearLayers();
}

function recordPosition(position) {
    if (isRecording) {
        track.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

        var mapDiv = document.getElementById("loc");
        mapDiv.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;

        updateTrackPath();
    }
}

function updateTrackPath() {
    trackLayer.clearLayers();

    var latLngs = track.map(function(position) {
        return L.latLng(position.latitude, position.longitude);
    });

    if (latLngs.length > 0) {
        var trackPath = L.polyline(latLngs, { color: 'red' }).addTo(trackLayer);
        map.fitBounds(trackPath.getBounds());
    }
}

function downloadTrack() {
    var csvContent = "data:text/csv;charset=utf-8,";
    track.forEach(function(position) {
        csvContent += position.latitude + "," + position.longitude + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "geocoded_track.csv");
    document.body.appendChild(link);

    link.click();
}
