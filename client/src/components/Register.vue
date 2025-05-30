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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap");

.register-page {
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

.register-card {
  background: #161616;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(227, 199, 123, 0.1);
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

input,
select {
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

input:focus,
select:focus {
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

.message {
  margin-top: 1rem;
  color: #e3c77b;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 600px) {
  .register-page {
    padding: 1rem;
  }

  .register-card {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 1.5rem;
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
