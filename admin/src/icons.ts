import * as L from "leaflet";

// require() pour charger les chemins d'images depuis src/img/
const voleurUrl = require("./img/voleur.svg");
const policierUrl = require("./img/policier.svg");
const vitrineUrl = require("./img/vitrine.svg");
const markerUrl = require("./img/marker.svg");

export const voleurIcon = L.icon({
  iconUrl: voleurUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export const policierIcon = L.icon({
  iconUrl: policierUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export const vitrineIcon = L.icon({
  iconUrl: vitrineUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export const markerIcon = L.icon({
  iconUrl: markerUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
