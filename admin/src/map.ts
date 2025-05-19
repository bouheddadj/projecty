import * as L from "leaflet";
import { updateMap } from "./form";
import { getToken } from "./auth";
import { voleurIcon, policierIcon, vitrineIcon, markerIcon } from "./icons";

// Coordonnées par défaut
const lat = 45.782;
const lng = 4.8656;
const zoom = 19;

// Création de la carte
let mymap: L.Map = L.map("map", {
  center: [lat, lng],
  zoom: zoom,
});

// Base API
const apiBaseUrl = process.env.BASE_URL_API;

const resourceMarkers: L.Marker[] = [];

// Initialisation
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
    },
  ).addTo(mymap);

  // Marqueur fixe pour l’entrée
  L.marker([45.78207, 4.86559], { icon: markerIcon })
    .addTo(mymap)
    .bindPopup("Entrée du bâtiment<br>Nautibus.")
    .openPopup();

  // Clic utilisateur
  mymap.on("click", (e: L.LeafletMouseEvent) => {
    const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
    updateMap(mymap, latlng, mymap.getZoom());
    sendPlayerPosition(latlng); // 💥 Envoi de la position
  });

  return mymap;
}

// ➤ Envoie la position actuelle du joueur
async function sendPlayerPosition(latlng: [number, number]): Promise<void> {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${apiBaseUrl}/game/resources/me/position`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ position: latlng }),
    });
  } catch (err) {
    console.error("Erreur lors de l'envoi de la position :", err);
  }
}

// ➤ Chargement des ressources (joueurs et vitrines)
export async function loadResources(map: L.Map): Promise<void> {
  try {
    const token = getToken();
    if (!token) throw new Error("Aucun token disponible");

    const response = await fetch(`${apiBaseUrl}/game/resources`, {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des ressources");
    }

    const resources = await response.json();
    console.log("Ressources chargées :", resources);

    // Nettoyage des anciens marqueurs
    resourceMarkers.forEach((marker) => map.removeLayer(marker));
    resourceMarkers.length = 0;

    resources.forEach((resource: any) => {
      if (resource.position) {
        let icon = markerIcon;

        if (resource.species === "POLICIER") icon = policierIcon;
        else if (resource.species === "VOLEUR") icon = voleurIcon;
        else if (resource.TTL) icon = vitrineIcon;

        const marker = L.marker(resource.position, { icon })
          .addTo(map)
          .bindPopup(
            resource.species
              ? `${resource.species} (${resource.id})`
              : `Ressource ${resource.id}`,
          );

        resourceMarkers.push(marker);
      }
    });
  } catch (err) {
    console.error("loadResources error:", err);
  }
}

export default initMap;
