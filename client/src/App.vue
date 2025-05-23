<template>
  <div class="app-wrapper">
    <header class="app-header">
      <h1>Panique au Musée</h1>

      <nav v-if="showMenu" class="navbar">
        <RouterLink to="/login" class="nav-link">Connexion</RouterLink>
        <RouterLink to="/register" class="nav-link">Créer un compte</RouterLink>
      </nav>
    </header>

    <main class="main-content">
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
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.app-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.navbar {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-link:hover {
  background-color: #e0f7f1;
  color: #007e6a;
}

.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
  border-bottom: 2px solid #42b983;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
