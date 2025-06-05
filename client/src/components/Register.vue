<template>
  <div class="page register-page">
    <div class="register-container">
      <header>
        <h1>Créer un compte</h1>
        <p class="intro">Rejoins l'aventure au musée !</p>
      </header>

      <form @submit.prevent="register" class="register-form" autocomplete="off">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            v-model="username"
            id="username"
            type="text"
            placeholder="Votre identifiant"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="Votre mot de passe"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="species">Choisis ton camp</label>
          <select v-model="species" id="species">
            <option value="VOLEUR">🕵️‍♂️ Voleur</option>
            <option value="POLICIER">👮‍♀️ Policier</option>
          </select>
        </div>

        <div class="form-group">
          <label for="avatar">URL de votre avatar (optionnel)</label>
          <input
            v-model="avatar"
            id="avatar"
            type="url"
            placeholder="https://exemple.com/avatar.png"
          />
        </div>

        <button type="submit">S'inscrire</button>

        <p
          v-if="message"
          class="feedback-message"
          :class="{
            success: message.includes('succès'),
            error: message.includes('Erreur'),
          }"
        >
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "Register",
  setup() {
    const username = ref("");
    const password = ref("");
    const species = ref("VOLEUR");
    const avatar = ref("");
    const message = ref("");
    const router = useRouter();

    const API_URL = import.meta.env.VITE_API_URL_USERS;

    const defaultAvatars: Record<string, string> = {
      VOLEUR: "https://cdn-icons-png.flaticon.com/512/1126/1126954.png",
      POLICIER:
        "https://img.freepik.com/vecteurs-premium/icone-avatar-policier-illustration-plate_98396-42919.jpg",
    };

    const register = async () => {
      try {
        const avatarUrl = avatar.value.trim()
          ? avatar.value
          : defaultAvatars[species.value];

        const payload = {
          login: username.value,
          password: password.value,
          species: species.value,
          image: avatarUrl,
        };

        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Erreur lors de l'inscription");

        message.value = "Compte créé avec succès ! Redirection...";
        setTimeout(() => router.push({ name: "Login" }), 1500);
      } catch (err: any) {
        message.value = err.message || "Erreur inconnue";
      }
    };

    return { username, password, species, avatar, message, register };
  },
};
</script>

<style scoped>
.page.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  min-height: calc(100vh - 80px);
  background-color: var(--main-bg);
  box-sizing: border-box;
  overflow: hidden;
}

.register-container {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 540px;
  box-sizing: border-box;
}

h1 {
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--accent);
  text-align: center;
}

.intro {
  margin-bottom: 1.25rem;
  color: var(--text-muted);
  font-size: 1rem;
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--accent);
  font-size: 0.95rem;
}

input,
select {
  padding: 0.65rem 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
}

input:focus,
select:focus {
  border-color: var(--accent);
  outline: none;
}

button {
  padding: 0.75rem;
  background-color: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.feedback-message {
  margin-top: 1rem;
  font-size: 0.95rem;
  padding: 0.6rem;
  border-radius: 6px;
  text-align: center;
}

.feedback-message.success {
  background-color: var(--success-color);
  color: white;
}

.feedback-message.error {
  background-color: var(--error-color);
  color: white;
}

@media (max-width: 640px) {
  .register-container {
    padding: 1.25rem 1rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  .intro {
    font-size: 0.95rem;
  }

  input,
  select,
  button {
    font-size: 0.95rem;
  }
}
</style>
