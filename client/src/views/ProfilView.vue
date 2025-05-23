<!-- src/views/ProfileView.vue -->
<template>
  <div class="profile-page">
    <ProfileForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProfileForm from "../components/ProfileForm.vue";

export default defineComponent({
  name: "ProfileView",
  components: {
    ProfileForm,
  },
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background: #f3f4f6;
}
</style>
