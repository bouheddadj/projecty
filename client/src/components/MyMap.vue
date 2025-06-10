<template>
  <section class="map-page">
    <div class="map-card">
      <h1>🎮 Carte du Jeu</h1>
      <p class="intro">Surveille ton environnement et agis rapidement !</p>

      <div class="score-display">Score : {{ store.currentUser.score }}</div>

      <div id="map" class="map" ref="map"></div>

      <div class="action-buttons">
        <button @click="goToProfile" class="profile-button">
          Modifier mon profil
        </button>
        <button @click="logout" class="logout-button">Quitter le jeu</button>
      </div>

      <div
        v-if="showMessage"
        :class="['feedback-message', isError ? 'error' : 'success']"
      >
        {{ showMessage }}
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Layer as LeafletLayer,
  DivIcon as LeafletDivIcon,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGameStore } from "@/stores/gameStore";

export default {
  name: "MyMap",
  setup() {
    const router = useRouter();
    const mapRef = ref<LeafletMap | null>(null);
    const markers: LeafletMarker[] = [];
    const store = useGameStore();
    const showMessage = ref("");
    const isError = ref(false);

    const API_URL_GAME = import.meta.env.VITE_API_URL_GAME;
    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;

    const logout = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return router.push({ name: "Login" });

      try {
        await fetch(`${API_URL_GAME}/game/leave`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetch(`${API_URL_USERS}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        sessionStorage.removeItem("token");
        router.push({ name: "Login" });

        if (Notification.permission === "granted") {
          new Notification("Déconnexion", {
            body: "Vous êtes bien déconnecté.",
            icon: "/pwa-192x192.png",
          });
        }

        setTimeout(() => {
          router.push({ name: "Login" });
        }, 500);
      } catch (err) {
        console.error("Erreur de déconnexion :", err);
      }
    };

    const goToProfile = () => router.push({ name: "Profile" });

    const drawZRR = (() => {
      let zrrLayer: LeafletLayer | null = null;
      return async (map: LeafletMap) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch(`${API_URL_GAME}/game/zrr`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return;
          const [p1, p2] = await res.json();
          store.setZrr([p1, p2]);
          if (zrrLayer) {
            map.removeLayer(zrrLayer);
          }
          zrrLayer = L.rectangle([p1, p2], {
            color: "orange",
            weight: 2,
            dashArray: "4",
          })
            .addTo(map)
            .bindPopup("ZRR (Zone réglementée)");
        } catch (err) {
          console.error("ZRR error :", err);
        }
      };
    })();

    const getIcon = (res: any): LeafletDivIcon => {
      let type = "autre";
      let emoji = "❓";
      let color = "#bbb";
      let border = "2px solid #bbb";
      let isCurrentUser = false;
      let label = "";
      let timer = "";
      let fontSize = "2.1rem";

      if (res.TTL !== undefined) {
        type = "vitrine";
        emoji = "💎";
        color = "#fff";
        border = "2px solid #e3c77b";
        fontSize = "1.5rem";
        const vitrine = store.vitrinesAvecInfos.find((v) => v.id === res.id);
        const ttl = vitrine
          ? vitrine.ttl.toFixed(1)
          : Math.max(0, Math.round(res.TTL));
        timer = `<span class='vitrine-timer' style='display:block;font-size:0.95rem;color:#ff5722;font-weight:bold;margin-top:2px;'>${ttl}s</span>`; // Couleur modifiée (orange vif)
      } else if (res.species === "POLICIER") {
        type = "policier";
        emoji = "👮‍♂️";
        color = "#4da6ff";
        border = "2px solid #4da6ff";
      } else if (res.species === "VOLEUR") {
        type = "voleur";
        emoji = "🕵️‍♂️";
        color = "#ff4d4d";
        border = "2px solid #ff4d4d";
      }

      if (res.id && res.id === store.currentUser.login) {
        isCurrentUser = true;
        border = "3px solid #222";
      }

      if (res.id && res.species) {
        label = `<span class='marker-label' style='display:block;font-size:1.05rem;color:${isCurrentUser ? "#222" : color};font-weight:${isCurrentUser ? "bold" : "normal"};margin-top:2px;'>${isCurrentUser ? "Moi" : res.id}</span>`;
      }

      const bg = isCurrentUser ? "#ffe082" : "#111";
      const shadow = isCurrentUser
        ? "0 0 16px #ffe082"
        : "0 0 12px rgba(227,199,123,0.3)";

      return L.divIcon({
        className: `marker-wrapper marker-${type}${isCurrentUser ? " marker-current" : ""}`,
        html: `
          <div style=\"display:flex;flex-direction:column;align-items:center;\">
            <span class=\"icon\" style=\"font-size:${fontSize};background:${bg};border:${border};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:${shadow};\">${emoji}</span>
            ${timer}
            ${label}
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 32],
        popupAnchor: [0, -32],
      });
    };

    const loadResources = async (map: LeafletMap) => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL_GAME}/game/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resources = await res.json();
        store.setResources(resources);
        markers.forEach((m) => map.removeLayer(m));
        markers.length = 0;

        resources.forEach((r: any) => {
          if (!r.position) return;
          if (r.TTL !== undefined && r.TTL <= 0) return; // Ne pas afficher les vitrines TTL=0
          const marker = L.marker(r.position, { icon: getIcon(r) }).addTo(map);
          marker.bindPopup(() => {
            if (r.TTL !== undefined) {
              const vitrine = store.vitrinesAvecInfos.find(
                (v) => v.id === r.id,
              );
              const ttl = vitrine ? vitrine.ttl.toFixed(1) : "??";
              const dist = store.currentUser?.position
                ? Math.round(
                    Math.sqrt(
                      Math.pow(
                        store.currentUser.position[0] - r.position[0],
                        2,
                      ) +
                        Math.pow(
                          store.currentUser.position[1] - r.position[1],
                          2,
                        ),
                    ) * 111139,
                  )
                : "?";
              return `TTL : ${ttl}s<br>Distance : ${dist}m`;
            }
            return r.species || r.id;
          });
          marker.on("click", async () => {
            if (r.TTL && r.id) {
              const message = await store.interactWithShowcase(r.id, token);
              if (message) {
                isError.value =
                  message.toLowerCase().includes("trop loin") ||
                  message.toLowerCase().includes("erreur") ||
                  message.toLowerCase().includes("invalid");
                showMessage.value = message;
                setTimeout(() => (showMessage.value = ""), 8000);
              }
            }
          });
          markers.push(marker);
        });
      } catch (err) {
        console.error("Ressources error :", err);
      }
    };

    const decodeToken = () => {
      const token = sessionStorage.getItem("token");
      if (!token) return null;
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return null;
      }
    };

    onMounted(() => {
      const payload = decodeToken();
      if (!payload) return router.push({ name: "Login" });

      store.setCurrentUser({ login: payload.sub, species: payload.species });
      const token = sessionStorage.getItem("token");
      if (token) store.updateServerPosition(token);

      const map = L.map("map", {
        center: [45.782, 4.8656],
        zoom: 18,
        minZoom: 12, // Permet de dézoomer largement
        maxZoom: 21,
        zoomControl: true,
      });
      mapRef.value = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OSM</a>',
        minZoom: 12,
        maxZoom: 21,
      }).addTo(map);

      map.locate({ watch: true });
      map.on("locationfound", (e: any) => {
        store.setUserPosition([e.latlng.lat, e.latlng.lng]);
      });

      navigator.geolocation.watchPosition(
        async (position) => {
          store.setUserPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          if (token) store.updateServerPosition(token);
        },
        null,
        { enableHighAccuracy: true },
      );

      drawZRR(map);
      loadResources(map);

      // Mise à jour continue de la position utilisateur et envoi à l'API toutes les secondes
      let lastSentPosition: [number, number] | null = null;
      setInterval(() => {
        if (store.currentUser.position) {
          const token = sessionStorage.getItem("token");
          if (
            token &&
            (!lastSentPosition ||
              store.currentUser.position[0] !== lastSentPosition[0] ||
              store.currentUser.position[1] !== lastSentPosition[1])
          ) {
            store.updateServerPosition(token);
            lastSentPosition = [...store.currentUser.position];
          }
        }
      }, 1000);

      // Ajout du rechargement automatique des ressources et de la ZRR
      setInterval(() => loadResources(map), 3000); // ressources toutes les 3 secondes
      setInterval(() => drawZRR(map), 5000); // ZRR toutes les 5s
    });

    return {
      mapRef,
      logout,
      goToProfile,
      showMessage,
      isError,
      store,
    };
  },
};
</script>

<style scoped>
.map-page {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background-color: var(--main-bg);
  min-height: calc(100vh - 80px); /* Prend en compte la hauteur de l'en-tête */
  box-sizing: border-box;
}

.map-card {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  padding: 2rem;
  width: 100%;
  max-width: 840px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h1 {
  font-size: 1.6rem;
  text-align: center;
  color: var(--accent);
}

.intro {
  text-align: center;
  color: var(--text-muted);
}

.score-display {
  background: var(--success-color);
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.map {
  height: 420px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-button,
.logout-button {
  flex: 1 1 48%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.profile-button {
  background: var(--accent);
  color: white;
}

.logout-button {
  background: var(--error-color);
  color: white;
}

.profile-button:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.logout-button:hover {
  background: #b71c1c;
  transform: translateY(-1px);
}

.feedback-message {
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.success {
  background-color: var(--success-color);
  color: #fff;
}

.error {
  background-color: var(--error-color);
  color: #fff;
}

@media (max-width: 640px) {
  .map-card {
    padding: 1.25rem 1rem;
  }

  .map {
    height: 300px;
  }
}
</style>
