import * as L from 'leaflet';

const lat: number = 45.782;
const lng: number = 4.8656;
const zoom: number = 19;

let mymap: L.Map = L.map('map', {
    center: [lat, lng],
    zoom: zoom
});

function initMap(): L.Map {
    L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ', {
        maxZoom: 21,
        minZoom: 1,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(mymap);

    L.marker([45.78207, 4.86559]).addTo(mymap).bindPopup('Entrée du bâtiment<br>Nautibus.').openPopup();

    mymap.on('click', (e: { latlng: { lat: number; lng: number }; }) => {
        updateMap([e.latlng.lat, e.latlng.lng], mymap.getZoom());
    });

    return mymap;
}

function updateMap(latlng: [number, number], zoom: number): boolean {
    mymap.setView(latlng, zoom);
    return false;
}

export { updateMap };
export default initMap;
