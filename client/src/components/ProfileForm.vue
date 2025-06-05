<template>
  <section class="profile-page">
    <div class="profile-card">
      <h2>Modifier mon profil</h2>

      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <input
            id="newPassword"
            type="password"
            v-model="newPassword"
            placeholder="Nouveau mot de passe"
          />
        </div>

        <div class="form-group">
          <label for="avatarUrl">URL de l'avatar</label>
          <input
            id="avatarUrl"
            type="text"
            v-model="avatarUrl"
            placeholder="https://mon-site.com/image.jpg"
          />
        </div>

        <div class="action-buttons">
          <button type="submit">Mettre à jour</button>
          <button type="button" class="back-button" @click="goBack">
            ← Retour à la carte
          </button>
        </div>

        <p v-if="message" class="feedback-message">{{ message }}</p>
      </form>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ProfileForm",
  setup() {
    const newPassword = ref("");
    const avatarUrl = ref("");
    const message = ref("");
    const router = useRouter();

    const API_URL_USERS = import.meta.env.VITE_API_URL_USERS;

    const updateProfile = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        message.value = "Vous devez être connecté.";
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentLogin = payload.sub;

        const body: Record<string, string> = {};
        if (newPassword.value) body.password = newPassword.value;
        if (avatarUrl.value) body.avatarUrl = avatarUrl.value;

        const res = await fetch(`${API_URL_USERS}/users/${currentLogin}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Origin: window.location.origin,
          },
          body: JSON.stringify({
            login: currentLogin,
            ...body,
          }),
        });

        if (!res.ok) throw new Error("Erreur lors de la mise à jour");

        const newToken = res.headers.get("Authorization");
        if (newToken?.startsWith("Bearer ")) {
          sessionStorage.setItem("token", newToken.replace("Bearer ", ""));
          router.push("/login");
        }

        message.value = "Profil mis à jour avec succès.";
      } catch (err: any) {
        message.value = err.message || "Erreur inconnue.";
      }
    };

    const goBack = () => {
      router.push({ name: "Map" });
    };

    return {
      newPassword,
      avatarUrl,
      message,
      updateProfile,
      goBack,
    };
  },
});
</script>

<style scoped>
.profile-page {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--main-bg);
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
}

.profile-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 1rem;
  color: var(--accent);
  font-size: 1.6rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--accent);
}

input {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-color);
  box-sizing: border-box;
}

input:focus {
  border-color: var(--accent);
  outline: none;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  flex: 1 1 48%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

button:hover {
  transform: translateY(-1px);
}

button[type="submit"] {
  background: var(--accent);
  color: white;
}

.back-button {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
}

.back-button:hover {
  background: var(--accent);
  color: white;
}

.feedback-message {
  margin-top: 1rem;
  color: var(--accent);
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
}

@media (max-width: 640px) {
  .profile-card {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.4rem;
  }

  input,
  button {
    font-size: 0.95rem;
  }
}
</style>
