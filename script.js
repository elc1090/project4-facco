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
var trackLayer = L.layerGroup().addTo(map); // Layer para o caminho percorrido
var currentPolyline = null; // Referência à linha azul atual
var currentLocationMarker = null; // Referência ao marcador vermelho da posição atual

fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data); // Exibe os dados retornados pela API

        var markers = data.saida; // Supondo que a resposta JSON tenha a estrutura { "saida": [...] }

        // Função para exibir os marcadores fixos da API
        function showMarkers() {
            markers.forEach(function(marker) {
                if (marker.Latitude !== '' && marker.Longitude !== '') {
                    L.marker([marker.Latitude, marker.Longitude])
                        .bindPopup("<strong>" + marker.Nome + "</strong><br>" + marker.Descricao)
                        .addTo(markersLayer);
                }
            });
        }

        // Exibir os marcadores fixos da API
        showMarkers();

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

                    // Remove o marcador vermelho atual, se existir
                    if (currentLocationMarker !== null) {
                        markersLayer.removeLayer(currentLocationMarker);
                    }

                    currentLocationMarker = L.marker([latitude, longitude], { icon: redIcon })
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

    // Remove a linha azul atual, se existir
    if (currentPolyline !== null) {
        trackLayer.removeLayer(currentPolyline);
        currentPolyline = null;
    }

    // Remove o marcador vermelho atual, se existir
    if (currentLocationMarker !== null) {
        markersLayer.removeLayer(currentLocationMarker);
        currentLocationMarker = null;
    }

    // Adiciona novamente o marcador vermelho na nova posição do usuário
    addCurrentLocationMarker();

    // Reinicia a gravação a partir do novo ponto
    isRecording = true;
    navigator.geolocation.getCurrentPosition(recordPosition, watcherror, { enableHighAccuracy: true, maximumAge: 0, timeout: Infinity });
    navigator.geolocation.watchPosition(recordPosition, watcherror, { enableHighAccuracy: true, maximumAge: 0, timeout: Infinity });
}




function recordPosition(position) {
    if (isRecording) {
        track.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

        var latLngs = track.map(function(point) {
            return L.latLng(point.latitude, point.longitude);
        });

        // Remove a linha azul atual, se existir
        if (currentPolyline !== null) {
            trackLayer.removeLayer(currentPolyline);
        }

        // Adiciona a nova linha azul
        currentPolyline = L.polyline(latLngs, { color: 'blue' }).addTo(trackLayer);
        map.fitBounds(currentPolyline.getBounds());
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
