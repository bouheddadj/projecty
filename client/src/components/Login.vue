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
      } catch (e) {
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

        if (!response.ok) {
          throw new Error("Identifiants incorrects");
        }

        const tokenHeader = response.headers.get("Authorization");
        if (!tokenHeader) {
          throw new Error("Token manquant dans les headers");
        }

        const token = tokenHeader.replace("Bearer ", "");
        localStorage.setItem("token", token);

        const payload = decodeJWT(token);
        if (!payload || !payload.species) {
          throw new Error("Token invalide ou incomplet");
        }

        if (payload.species !== "ADMIN") {
          await fetch(`${API_URL_GAME}/game/join`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap");

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: #0b0b0b;
  font-family: "Playfair Display", serif;
  color: #f0f0f0;
  box-sizing: border-box;
}

.login-card {
  background: #161616;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(227, 199, 123, 0.15);
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid #333;
}

h1 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  color: #e3c77b;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.intro {
  margin-bottom: 1.5rem;
  color: #bbb;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #e3c77b;
}

input {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #555;
  border-radius: 6px;
  font-size: 1rem;
  background: #1f1f1f;
  color: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #e3c77b;
  outline: none;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #e3c77b;
  color: #0b0b0b;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

button:hover {
  background-color: #cfb45e;
  transform: translateY(-1px);
}

.error {
  margin-top: 1rem;
  color: #e57373;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 600px) {
  .login-page {
    padding: 1rem;
  }

  .login-card {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .intro {
    font-size: 0.95rem;
  }

  input,
  button {
    font-size: 0.95rem;
  }
}
</style>
