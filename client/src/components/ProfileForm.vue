<template>
  <div class="profile-page">
    <div class="profile-card">
      <h2>Modifier mon profil</h2>

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

      <button @click="updateProfile">Mettre à jour</button>
      <button class="back-button" @click="goBack">← Retour à la carte</button>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
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
      const token = localStorage.getItem("token");
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
          localStorage.setItem("token", newToken.replace("Bearer ", ""));
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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap");

.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b0b0b;
  padding: 2rem;
  font-family: "Playfair Display", serif;
  color: #f0f0f0;
  box-sizing: border-box;
}

.profile-card {
  background: #161616;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(227, 199, 123, 0.12);
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid #333;
}

h2 {
  margin-bottom: 1rem;
  color: #e3c77b;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  margin-top: 0.5rem;
}

button:hover {
  background-color: #cfb45e;
  transform: translateY(-1px);
}

.back-button {
  background-color: transparent;
  color: #e3c77b;
  border: 1px solid #e3c77b;
}

.back-button:hover {
  background-color: #e3c77b;
  color: #0b0b0b;
}

.message {
  margin-top: 1rem;
  color: #e3c77b;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Responsive design */
@media (max-width: 600px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-card {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  input,
  button {
    font-size: 0.95rem;
  }
}
</style>
