<template>
  <header>
    <h1>Panique au Musée</h1>

    <nav>
      <RouterLink to="/login">Login</RouterLink> |
      <RouterLink to="/map">Carte</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router';

export default {
  components: {
    RouterLink,
    RouterView,
  },
};
</script>

<style scoped>
nav {
  margin: 1em 0;
}

nav a {
  text-decoration: none;
  padding: 0.5em;
  color: #333;
}

nav a.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
}
</style>

