<template>
  <div class="map-page">
    <div class="map-card">
      <h1>🎮 Carte du Jeu</h1>
      <p class="intro">Surveille ton environnement et agis rapidement !</p>

      <div class="score-display">Score : {{ store.currentUser.score }}</div>

      <div id="map" class="map" ref="map"></div>

      <button @click="goToProfile" class="profile-button">
        Modifier mon profil
      </button>
      <button @click="logout">Quitter le jeu</button>

      <div
        v-if="showMessage"
        :class="['feedback-message', isError ? 'error' : 'success']"
      >
        {{ showMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";
import { useGameStore } from "@/stores/gameStore";

export default {
  name: "MyMap",
  setup() {
    const router = useRouter();
    const mapRef = ref<L.Map | null>(null);
    const markers: L.Marker[] = [];
    const store = useGameStore();
    const showMessage = ref("");
    const isError = ref(false);

    const API_URL_GAME = import.meta.env.VITE_API_URL_GAME;
    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;

    const logout = async () => {
      const token = localStorage.getItem("token");
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

        localStorage.removeItem("token");
        router.push({ name: "Login" });
      } catch (err) {
        console.error("Erreur de déconnexion :", err);
      }
    };

    const goToProfile = () => router.push({ name: "Profile" });

    const drawZRR = async (map: L.Map) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL_GAME}/game/zrr`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const [p1, p2] = await res.json();
        store.setZrr([p1, p2]);

        L.rectangle([p1, p2], {
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

    const getIcon = (res: any) => {
      const AwesomeMarkers = (window as any).L.AwesomeMarkers;
      let icon = "question",
        color = "cadetblue";

      if (res.species === "POLICIER") {
        icon = "shield";
        color = "blue";
      } else if (res.species === "VOLEUR") {
        icon = "user-secret";
        color = "red";
      } else if (res.TTL) {
        icon = "diamond";
        color = "black";
      }

      if (res.id === store.currentUser.login) {
        color = "green";
      }

      return AwesomeMarkers.icon({
        icon,
        prefix: "fa",
        markerColor: color,
        extraClasses: "fa-2x",
      });
    };

    const loadResources = async (map: L.Map) => {
      const token = localStorage.getItem("token");
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

          const marker = L.marker(r.position, { icon: getIcon(r) })
            .addTo(map)
            .bindPopup(() => {
              if (r.TTL) {
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
              const token = localStorage.getItem("token");
              if (!token) return;
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
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
      } catch {
        return null;
      }
    };

    onMounted(() => {
      let watchId: number | null = null;
      const payload = decodeToken();
      if (!payload) return router.push({ name: "Login" });

      store.setCurrentUser({
        login: payload.sub,
        species: payload.species,
      });

      const token = localStorage.getItem("token");
      if (token) {
        store.updateServerPosition(token); // Envoie initial
      }

      const map = L.map("map", {
        center: [45.782, 4.8656],
        zoom: 30,
      });
      mapRef.value = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      map.locate({ watch: true });
      map.on("locationfound", (e) => {
        const latlng: [number, number] = [e.latitude, e.longitude];
        store.setUserPosition(latlng);
      });

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          store.setUserPosition(coords);

          const token = localStorage.getItem("token");
          if (token) {
            await store.updateServerPosition(token);
          }
        },
        (err) => {
          console.error("Erreur de géolocalisation :", err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
      );

      drawZRR(map);
      loadResources(map);
      setInterval(() => loadResources(map), 5000);
      setInterval(() => {
        store.lastUpdate = Date.now();
      }, 1000);
    });
    return { logout, goToProfile, showMessage, isError, store };
  },
};
</script>

<style scoped>
.map-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: #f3f4f6;
  padding: 2rem;
}

.map-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.map-card h1 {
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
  color: #333;
}

.intro {
  margin-bottom: 1.2rem;
  color: #555;
  font-size: 0.95rem;
}

.score-display {
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.map {
  height: 360px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  overflow: hidden;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #d9534f;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #c9302c;
}

.profile-button {
  background-color: #007bff;
  color: white;
  margin-bottom: 1rem;
}

.profile-button:hover {
  background-color: #0056b3;
}

.feedback-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: bold;
  text-align: center;
}

.feedback-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.feedback-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
