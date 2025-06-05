import * as L from "leaflet";
import { updateMap } from "./form";
import { getToken } from "./auth";
import { voleurIcon, policierIcon, vitrineIcon, markerIcon } from "./icons";

// Coordonnées et zoom de départ
const DEFAULT_LAT = 45.782;
const DEFAULT_LNG = 4.8656;
const DEFAULT_ZOOM = 19;

const apiBaseUrl = process.env.BASE_URL_API;

let mymap: L.Map;

const resourceMarkers: L.Marker[] = [];

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

  L.marker([45.78207, 4.86559], { icon: markerIcon })
    .addTo(mymap)
    .bindPopup("Entrée du bâtiment<br>Nautibus.")
    .openPopup();

  mymap.on("click", async (e: L.LeafletMouseEvent) => {
    if (
      (e.originalEvent?.target as HTMLElement)?.classList?.contains(
        "leaflet-popup-content-wrapper"
      )
    ) {
      return;
    }
    const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
    try {
      const token = getToken();
      if (!token) return;
      const zrrRes = await fetch(`${apiBaseUrl}/game/zrr`, {
        method: "GET",
        headers: { Authorization: token },
      });
      if (!zrrRes.ok) return;
      const [p1, p2] = await zrrRes.json();
      const latMin = Math.min(p1[0], p2[0]);
      const latMax = Math.max(p1[0], p2[0]);
      const lngMin = Math.min(p1[1], p2[1]);
      const lngMax = Math.max(p1[1], p2[1]);
      if (
        latlng[0] < latMin ||
        latlng[0] > latMax ||
        latlng[1] < lngMin ||
        latlng[1] > lngMax
      ) {
        alert(
          "Vous ne pouvez ajouter une vitrine qu'à l'intérieur de la ZRR !"
        );
        return;
      }
      let ttl = 60;
      const ttlInput = document.getElementById(
        "ttl"
      ) as HTMLInputElement | null;
      if (ttlInput && !isNaN(parseInt(ttlInput.value))) {
        ttl = parseInt(ttlInput.value);
      }
      await fetch(`${apiBaseUrl}/admin/showcase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          position: latlng,
          TTL: ttl,
        }),
      });
      loadResources(mymap);
    } catch (err) {
      console.error("Erreur lors de l'ajout de la vitrine :", err);
    }
  });

  loadZRR(mymap);
  loadResources(mymap);

  setInterval(() => {
    loadResources(mymap);
  }, 5000);

  setInterval(() => {
    loadZRR(mymap);
  }, 2000);

  return mymap;
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

      // Ajout du comportement : clic sur vitrine => suppression si à moins de 5m
      if (resource.TTL) {
        marker.on("click", async () => {
          try {
            const token = getToken();
            if (!token) return;
            // Récupérer la position du joueur courant
            const meRes = await fetch(`${apiBaseUrl}/game/resources/me`, {
              method: "GET",
              headers: { Authorization: token },
            });
            if (!meRes.ok) return;
            const me = await meRes.json();
            if (!me.position) return;
            // Calcul de la distance (Haversine)
            const toRad = (v: number) => (v * Math.PI) / 180;
            const [lat1, lng1] = me.position;
            const [lat2, lng2] = resource.position;
            const R = 6371000;
            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;
            if (dist <= 5) {
              // Suppression de la vitrine (mettre TTL=0 via API)
              await fetch(`${apiBaseUrl}/admin/showcase`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token,
                },
                body: JSON.stringify({ id: resource.id, TTL: 0 }),
              });
              loadResources(map);
            } else {
              alert("Vous devez être à moins de 5m de la vitrine pour l'ouvrir.");
            }
          } catch (err) {
            console.error("Erreur suppression vitrine:", err);
          }
        });
      }
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

    map.eachLayer((layer) => {
      if (
        layer instanceof L.Rectangle &&
        layer.getPopup()?.getContent() === "ZRR (Zone réglementée)"
      ) {
        map.removeLayer(layer);
      }
    });

    const rectangle = L.rectangle([point1, point2], {
      color: "orange",
      weight: 2,
      dashArray: "5,5",
      fill: false, // Pas de remplissage, juste le contour
    });

    rectangle.addTo(map).bindPopup("ZRR (Zone réglementée)");
  } catch (err) {
    console.error("Erreur chargement ZRR :", err);
  }
}

export default initMap;
