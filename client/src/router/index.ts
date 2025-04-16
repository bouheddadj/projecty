import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import MyMapView from '../views/MyMapView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/map', name: 'Map', component: MyMapView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

