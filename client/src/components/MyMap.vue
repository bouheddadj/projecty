<template>
  <div class="map-page">
    <div class="map-card">
      <h1>🎮 Carte du Jeu</h1>
      <p class="intro">Surveille ton environnement et agis rapidement !</p>

      <div id="map" class="map" ref="map"></div>
      <button @click="goToProfile" class="profile-button">
        Modifier mon profil
      </button>
      <button @click="logout">Quitter le jeu</button>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
// @ts-ignore
import "leaflet.awesome-markers";

export default {
  name: "MyMap",
  setup() {
    const router = useRouter();
    // @ts-ignore
    const API_URL_GAME = import.meta.env.VITE_API_URL_GAME;
    // @ts-ignore
    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;

    const goToProfile = () => {
      router.push({ name: "Profile" });
    };

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

    // @ts-ignore
    const drawZRR = async (map: L.Map) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL_GAME}/game/zrr`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const [point1, point2] = await res.json();
        L.rectangle([point1, point2], {
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

    // @ts-ignore
    const loadResources = async (map: L.Map) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL_GAME}/game/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resources = await res.json();
        resources.forEach((res: any) => {
          const pos = res.position;
          if (!pos) return;

          const icon = getIcon(res);
          L.marker(pos, { icon })
            .addTo(map)
            .bindPopup(res.species || res.id);
        });
      } catch (err) {
        console.error("Ressources error :", err);
      }
    };

    const getIcon = (res: any) => {
      const AwesomeMarkers = (window as any).L.AwesomeMarkers;
      let icon = "question";
      let color = "cadetblue";

      if (res.species === "POLICIER") {
        icon = "shield";
        color = "blue";
      } else if (res.species === "VOLEUR") {
        icon = "user-secret";
        color = "red";
      } else if (res.TTL) {
        icon = "archive";
        color = "green";
      }

      return AwesomeMarkers.icon({
        icon,
        prefix: "fa",
        markerColor: color,
        extraClasses: "fa-2x",
      });
    };

    onMounted(() => {
      const token = localStorage.getItem("token");
      if (!token) return router.push({ name: "Login" });

      const map = L.map("map", {
        center: [45.782, 4.8656],
        zoom: 19,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      drawZRR(map);
      loadResources(map);
    });

    return { logout, goToProfile };
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
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.profile-button:hover {
  background-color: #0056b3;
}
</style>
