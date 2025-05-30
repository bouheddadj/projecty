<template>
  <div class="app-layout">
    <header class="app-header">
      <h1>Panique au Musée</h1>

      <nav v-if="showMenu" class="navbar">
        <RouterLink to="/login" class="nav-link">Connexion</RouterLink>
        <RouterLink to="/register" class="nav-link">Créer un compte</RouterLink>
      </nav>
    </header>

    <main class="main-container">
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
import { computed } from "vue";

export default {
  name: "AppLayout",
  components: {
    RouterLink,
    RouterView,
  },
  setup() {
    const route = useRoute();
    const showMenu = computed(() =>
      ["/login", "/register"].includes(route.path),
    );

    return { showMenu };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap");

.app-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #0b0b0b;
  color: #f0f0f0;
  font-family: "Playfair Display", serif;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(to right, #111, #1c1c1c);
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  text-align: center;
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 1.8rem;
  color: #e3c77b;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 1px;
}

.navbar {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: #f0f0f0;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-link:hover {
  background-color: #1e1e1e;
  border-color: #e3c77b;
  color: #e3c77b;
}

.router-link-exact-active {
  font-weight: bold;
  color: #e3c77b;
  border-bottom: 2px solid #e3c77b;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

/* Responsive */
@media (max-width: 600px) {
  .app-header h1 {
    font-size: 1.4rem;
  }

  .navbar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link {
    font-size: 0.95rem;
  }

  .main-container {
    padding: 1rem;
  }
}
</style>
