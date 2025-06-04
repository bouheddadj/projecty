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

    const getIcon = (res: any): L.DivIcon => {
      let type = "autre";
      if (res.species === "POLICIER") type = "policier";
      else if (res.species === "VOLEUR") type = "voleur";
      else if (res.TTL) type = "vitrine";

      return L.divIcon({
        className: "",
        html: `<div class="marker-wrapper marker-${type}"><span class="icon">${
          type === "policier"
            ? "👮‍♂️"
            : type === "voleur"
              ? "🕵️‍♂️"
              : type === "vitrine"
                ? "💎"
                : "❓"
        }</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
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
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return null;
      }
    };

    onMounted(() => {
      const payload = decodeToken();
      if (!payload) return router.push({ name: "Login" });

      store.setCurrentUser({ login: payload.sub, species: payload.species });
      const token = localStorage.getItem("token");
      if (token) store.updateServerPosition(token);

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
        store.setUserPosition([e.latitude, e.longitude]);
      });

      navigator.geolocation.watchPosition(
        async (position) => {
          store.setUserPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          if (token) await store.updateServerPosition(token);
        },
        (err) => console.error("Erreur de géolocalisation :", err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
      );

      drawZRR(map);
      loadResources(map);
      setInterval(() => {
        loadResources(map);
        const token = localStorage.getItem("token");
        if (token) store.decrementShowcasesTTL(token);
      }, 1000);
      setInterval(() => (store.lastUpdate = Date.now()), 1000);
    });

    return { logout, goToProfile, showMessage, isError, store };
  },
};
</script>

<style scoped>
.marker-wrapper {
  background-color: #111;
  border: 2px solid #e3c77b;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 12px rgba(227, 199, 123, 0.3);
  transition: transform 0.2s ease;
}

.marker-wrapper:hover {
  transform: scale(1.1);
}

.icon {
  font-size: 1.4rem;
  line-height: 1;
}

.marker-policier .icon {
  color: #4da6ff;
}

.marker-voleur .icon {
  color: #ff4d4d;
}

.marker-vitrine .icon {
  color: #ffffff;
  text-shadow: 0 0 4px #e3c77b;
}

.marker-autre .icon {
  color: #bbb;
}
</style>
