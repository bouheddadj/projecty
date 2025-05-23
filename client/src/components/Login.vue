<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Panique au Musée</h1>
      <p class="intro">Connecte-toi pour jouer !</p>

      <div class="form-group">
        <label for="login">Login</label>
        <input
          type="text"
          id="login"
          v-model="username"
          placeholder="Votre identifiant"
        />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Votre mot de passe"
        />
      </div>

      <button @click="login">Se connecter</button>

      <p v-if="message" class="error">{{ message }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginPage',
  props: {
    message: String,
  },
  emits: ['loginEvent', 'loginError'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');
    const message = ref('');
    const router = useRouter();

    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;
    const API_URL_GAME = import.meta.env.VITE_API_URL_GAME;

    // 🔍 Fonction pour décoder un JWT
    const decodeJWT = (token: string): any => {
      try {
        const base64 = token.split('.')[1];
        const json = atob(base64);
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    };

    const login = async () => {
      try {
        const response = await fetch(`${API_URL_USERS}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: username.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          throw new Error('Identifiants incorrects');
        }

        const tokenHeader = response.headers.get('Authorization');
        if (!tokenHeader) {
          throw new Error('Token manquant dans les headers');
        }

        const token = tokenHeader.replace('Bearer ', '');
        localStorage.setItem('token', token);

        const payload = decodeJWT(token);
        if (!payload || !payload.species) {
          throw new Error('Token invalide ou incomplet');
        }

        // 🧠 Ajouter le joueur au jeu s’il n’est pas ADMIN
        if (payload.species !== 'ADMIN') {
          await fetch(`${API_URL_GAME}/game/join`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        emit('loginEvent', token);
        router.push({ name: 'Map' });
      } catch (err: any) {
        const errorMessage = err.message || 'Erreur de connexion';
        emit('loginError', errorMessage);
        message.value = errorMessage;
      }
    };

    return {
      username,
      password,
      message,
      login,
    };
  },
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background: #f3f4f6;
}

.login-card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 360px;
  text-align: center;
}

h1 {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  color: #333;
}

.intro {
  margin-bottom: 1.5rem;
  color: #666;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #444;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #369b6e;
}

.error {
  margin-top: 1rem;
  color: #d93025;
  font-weight: 500;
}
</style>
