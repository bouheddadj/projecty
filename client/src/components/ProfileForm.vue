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

    // @ts-ignore
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
            login: currentLogin, // obligatoire côté Spring
            ...body,
          }),
        });

        if (!res.ok) throw new Error("Erreur lors de la mise à jour");

        const newToken = res.headers.get("Authorization");
        if (newToken && newToken.startsWith("Bearer ")) {
          localStorage.setItem("token", newToken.replace("Bearer ", ""));
          router.push("/login");
        }

        message.value = "Profil mis à jour avec succès.";
      } catch (err: any) {
        message.value = err.message || "Erreur inconnue.";
      }
    };

    return {
      newPassword,
      avatarUrl,
      message,
      updateProfile,
    };
  },
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  background: #f3f4f6;
}

.profile-card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  width: 360px;
  text-align: center;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
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
}

button:hover {
  background-color: #369b6e;
}

.message {
  margin-top: 1rem;
  color: #2f4f4f;
  font-weight: 500;
}
</style>
