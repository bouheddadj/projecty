<template>
  <header>
    <h1>Panique au Musée</h1>
  </header>

  <main>
    <!-- Si non connecté -->
    <div v-if="!logged">
      <HelloWorld msg="Bienvenue invité, connectez-vous" />
      <Login
        :message="loginErrorMessage"
        @loginEvent="handleLogin"
        @loginError="handleLoginError"
      />
    </div>

    <!-- Si connecté -->
    <div v-else>
      <HelloWorld msg="Bienvenue, joueur authentifié" />
      <button @click="logout">Se déconnecter</button>
      <MyMap />
    </div>
  </main>
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import Login from './components/Login.vue';
import MyMap from './components/MyMap.vue';

export default {
  components: { HelloWorld, Login, MyMap },
  data() {
    return {
      logged: false,
      loginErrorMessage: '',
    };
  },
  methods: {
    handleLogin(token: string) {
      console.log('Token reçu et stocké');
      this.logged = true;
      this.loginErrorMessage = '';
      localStorage.setItem('token', token); // facultatif
    },
    handleLoginError(message: string) {
      console.log('Erreur de login :', message);
      this.loginErrorMessage = message;
    },
    logout() {
      console.log('Déconnexion');
      this.logged = false;
      localStorage.removeItem('token');
    }
  }
};
</script>

