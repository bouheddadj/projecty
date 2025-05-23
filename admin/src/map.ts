import * as L from "leaflet";
import { updateMap } from "./form";
import { getToken } from "./auth";
import { voleurIcon, policierIcon, vitrineIcon, markerIcon } from "./icons";

// Coordonnées et zoom de départ
const DEFAULT_LAT = 45.782;
const DEFAULT_LNG = 4.8656;
const DEFAULT_ZOOM = 19;

// Base API
const apiBaseUrl = process.env.BASE_URL_API;

// Carte Leaflet
let mymap: L.Map;

// Marqueurs en mémoire pour pouvoir les retirer
const resourceMarkers: L.Marker[] = [];

// ✅ Initialise la carte
function initMap(): L.Map {
  mymap = L.map("map", {
    center: [DEFAULT_LAT, DEFAULT_LNG],
    zoom: DEFAULT_ZOOM,
  });

  L.tileLayer(
    "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ",
    {
      maxZoom: 21,
      minZoom: 1,
      tileSize: 512,
      zoomOffset: -1,
      attribution:
        '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> & Mapbox',
    }
  ).addTo(mymap);

  // Marqueur fixe de l'entrée
  L.marker([45.78207, 4.86559], { icon: markerIcon })
    .addTo(mymap)
    .bindPopup("Entrée du bâtiment<br>Nautibus.")
    .openPopup();

  // Clic sur la carte → MAJ position + envoi au serveur
  mymap.on("click", (e: L.LeafletMouseEvent) => {
    const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
    updateMap(mymap, latlng, mymap.getZoom());
    sendPlayerPosition(latlng);
  });

  // Chargement des éléments de jeu
  loadZRR(mymap);
  loadResources(mymap);

  setInterval(() => {
    loadResources(mymap);
  }, 5000);

  return mymap;
}

async function sendPlayerPosition(latlng: [number, number]): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${apiBaseUrl}/game/resources/me/position`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ position: latlng }),
    });
  } catch (err) {
    console.error("Erreur lors de l'envoi de la position :", err);
  }
}

export async function loadResources(map: L.Map): Promise<void> {
  try {
    const token = getToken();
    if (!token) throw new Error("Aucun token disponible");

    const response = await fetch(`${apiBaseUrl}/game/resources`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des ressources");
    }

    const resources = await response.json();
    console.log("Ressources chargées :", resources);

    resourceMarkers.forEach((m) => map.removeLayer(m));
    resourceMarkers.length = 0;

    resources.forEach((resource: any) => {
      if (!resource.position) return;

      let icon = markerIcon;
      if (resource.species === "POLICIER") icon = policierIcon;
      else if (resource.species === "VOLEUR") icon = voleurIcon;
      else if (resource.TTL) icon = vitrineIcon;

      const marker = L.marker(resource.position, { icon }).addTo(map);
      const label = resource.species
        ? `${resource.species} (${resource.id})`
        : resource.TTL
        ? `Vitrine TTL=${resource.TTL}`
        : `Objet ${resource.id}`;

      marker.bindPopup(label);
      resourceMarkers.push(marker);
    });
  } catch (err) {
    console.error("Erreur chargement ressources :", err);
  }
}

export async function loadZRR(map: L.Map): Promise<void> {
  try {
    const token = getToken();
    if (!token) throw new Error("Aucun token disponible");

    const response = await fetch(`${apiBaseUrl}/game/zrr`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) throw new Error("Impossible de charger la ZRR");

    const [point1, point2] = await response.json();

    const rectangle = L.rectangle([point1, point2], {
      color: "orange",
      weight: 2,
      dashArray: "5,5",
    });

    rectangle.addTo(map).bindPopup("ZRR (Zone réglementée)");
  } catch (err) {
    console.error("Erreur chargement ZRR :", err);
  }
}

export default initMap;
