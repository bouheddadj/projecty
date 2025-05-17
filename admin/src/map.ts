import * as L from "leaflet";
import { updateMap } from "./form";

// Workaround pour les icônes Leaflet dans Webpack
L.Icon.Default.imagePath = "/lib/leaflet/dist/images/";

const lat = 45.782;
const lng = 4.8656;
const zoom = 19;

let mymap: L.Map = L.map("map", {
  center: [lat, lng],
  zoom: zoom,
});

// Initialisation de la map
function initMap(): L.Map {
  L.tileLayer(
    "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ",
    {
      maxZoom: 21,
      minZoom: 1,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      // ❌ accessToken retiré car non reconnu par Leaflet
    },
  ).addTo(mymap);

  L.marker([45.78207, 4.86559])
    .addTo(mymap)
    .bindPopup("Entrée du bâtiment<br>Nautibus.")
    .openPopup();

  mymap.on("click", (e: L.LeafletMouseEvent) => {
    updateMap(mymap, [e.latlng.lat, e.latlng.lng], mymap.getZoom());
  });

  return mymap;
}

export default initMap;

