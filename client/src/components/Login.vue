<template>
  <div class="page">
    <div class="card login-card">
      <header class="login-header">
        <h1>Panique au Musée</h1>
        <p class="intro">Connecte-toi pour jouer !</p>
      </header>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="login">Login</label>
          <input
            type="text"
            id="login"
            v-model="username"
            placeholder="Votre identifiant"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Votre mot de passe"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit">Se connecter</button>

        <p v-if="message" class="feedback-message error">{{ message }}</p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LoginPage",
  props: {
    message: String,
  },
  emits: ["loginEvent", "loginError"],
  setup(props, { emit }) {
    const username = ref("");
    const password = ref("");
    const message = ref("");
    const router = useRouter();

    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;
    const API_URL_GAME = import.meta.env.VITE_API_URL_GAME;

    const decodeJWT = (token: string): any => {
      try {
        const base64 = token.split(".")[1];
        const json = atob(base64);
        return JSON.parse(json);
      } catch {
        return null;
      }
    };

    const login = async () => {
      try {
        const response = await fetch(`${API_URL_USERS}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: username.value,
            password: password.value,
          }),
        });

        if (!response.ok) throw new Error("Identifiants incorrects");

        const tokenHeader = response.headers.get("Authorization");
        if (!tokenHeader) throw new Error("Token manquant dans les headers");

        const token = tokenHeader.replace("Bearer ", "");
        sessionStorage.setItem("token", token); // 🔁 correction ici

        const payload = decodeJWT(token);
        if (!payload || !payload.species) {
          throw new Error("Token invalide ou incomplet");
        }

        if (payload.species !== "ADMIN") {
          await fetch(`${API_URL_GAME}/game/join`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        emit("loginEvent", token);
        router.push({ name: "Map" });
      } catch (err: any) {
        const errorMessage = err.message || "Erreur de connexion";
        emit("loginError", errorMessage);
        message.value = errorMessage;
      }
    };

    return { username, password, message, login };
  },
});
</script>

<style scoped>
.login-card {
  max-width: 480px;
}

.login-header {
  margin-bottom: 1.5rem;
}

.feedback-message.error {
  margin-top: 1rem;
  background-color: var(--error-color);
  color: #fff;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    padding: 1.25rem 1rem;
  }

  .login-header h1 {
    font-size: 1.3rem;
  }

  input,
  button {
    font-size: 0.95rem;
  }
}
</style>
