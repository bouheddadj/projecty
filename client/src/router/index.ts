import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import MyMapView from "../views/MyMapView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfilView from "../views/ProfilView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/map", name: "Map", component: MyMapView },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilView,
  },
];

const router = createRouter({
  // @ts-expect-error: BASE_URL type may not be recognized by TypeScript
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
