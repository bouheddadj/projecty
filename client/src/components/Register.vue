<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Créer un compte</h1>
      <p class="intro">Rejoins l'aventure au musée !</p>

      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input
          v-model="username"
          id="username"
          type="text"
          placeholder="Votre identifiant"
        />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          v-model="password"
          id="password"
          type="password"
          placeholder="Votre mot de passe"
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

      <button @click="register">S'inscrire</button>
      <p v-if="message" class="message">{{ message }}</p>
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

    // @ts-ignore
    const API_URL = import.meta.env.VITE_API_URL_USERS;

    const defaultAvatars: Record<string, string> = {
      VOLEUR:
        "https://www.google.com/imgres?q=voleur%20avatar&imgurl=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F1126%2F1126954.png&imgrefurl=https%3A%2F%2Fwww.flaticon.com%2Ffr%2Ficone-gratuite%2Fvoleur_1126954&docid=cPUPAxVBBrdtAM&tbnid=MwN6mPWQli4rJM&vet=12ahUKEwj50tqtvbmNAxU1SKQEHWsrAr0QM3oECGsQAA..i&w=512&h=512&hcb=2&itg=1&ved=2ahUKEwj50tqtvbmNAxU1SKQEHWsrAr0QM3oECGsQAA",
      POLICIER:
        "https://www.google.com/imgres?q=police%20avatar&imgurl=https%3A%2F%2Fimg.freepik.com%2Fvecteurs-premium%2Ficone-avatar-policier-illustration-plate-icone-vecteur-avatar-policier-isolee-fond-blanc_98396-42919.jpg&imgrefurl=https%3A%2F%2Ffr.freepik.com%2Fvecteurs-premium%2Ficone-avatar-policier-illustration-plate-icone-vecteur-avatar-policier-isolee-fond-blanc_74127171.htm&docid=Ct5paQvi0iW7cM&tbnid=mGVEw6cW_ZKHIM&vet=12ahUKEwiphaSPvbmNAxXBe6QEHYs2BqwQM3oECG4QAA..i&w=626&h=625&hcb=2&ved=2ahUKEwiphaSPvbmNAxXBe6QEHYs2BqwQM3oECG4QAA",
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
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: #f3f4f6;
  padding: 2rem;
}

.register-card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #444;
}

input,
select {
  width: 100%;
  padding: 0.65rem;
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

.message {
  margin-top: 1rem;
  color: #333;
  font-weight: 500;
}
</style>
