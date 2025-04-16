<template>
  <h2>Connexion</h2>

  <label for="login">Login :&nbsp;</label>
  <input type="text" name="login" id="login" v-model="username" />
  <br />
  <label for="password">Password :&nbsp;</label>
  <input type="password" name="password" id="password" v-model="password" />
  <br />
  <button @click="login">Send</button>

  <p v-if="message" style="color: red">{{ message }}</p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MyLogin',
  props: {
    message: String,
  },
  emits: ['loginEvent', 'loginError'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');

    const login = async () => {
      try {
        const response = await fetch('https://ton-api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          throw new Error('Identifiants incorrects');
        }

        const data = await response.json();

        if (data.token) {
          emit('loginEvent', data.token);
        } else {
          emit('loginError', 'Token manquant dans la réponse');
        }
      } catch (err: any) {
        emit('loginError', err.message || 'Erreur de connexion');
      }
    };

    return {
      username,
      password,
      login,
    };
  },
});
</script>

<style scoped>
input,
button {
  margin: 4px 0;
  padding: 6px;
  color: grey;
  border: 1px solid;
}
</style>

