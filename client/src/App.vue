<template>
  <div class="app-root">
    <header class="app-header">
      <div class="header-inner">
        <h1 class="logo">🎨 Panique au Musée</h1>
        <nav v-if="showMenu" class="navbar">
          <RouterLink to="/login" class="nav-link">Connexion</RouterLink>
          <RouterLink to="/register" class="nav-link"
            >Créer un compte</RouterLink
          >
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="main-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
import { computed, onMounted } from "vue";

export default {
  name: "AppLayout",
  components: {
    RouterLink,
    RouterView,
  },
  setup() {
    const route = useRoute();
    const showMenu = computed(() =>
      ["/login", "/register"].includes(route.path),
    );

    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          console.log("Wake Lock activé");

          wakeLock.addEventListener("release", () => {
            console.log("Wake Lock libéré");
          });

          document.addEventListener("visibilitychange", async () => {
            if (wakeLock !== null && document.visibilityState === "visible") {
              wakeLock = await (navigator as any).wakeLock.request("screen");
              console.log("Wake Lock réactivé");
            }
          });
        } else {
          console.warn("Wake Lock API non supportée sur ce navigateur.");
        }
      } catch (err: any) {
        console.error(`${err.name}: ${err.message}`);
      }
    }

    onMounted(() => {
      requestWakeLock();
    });

    return { showMenu };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

:root {
  --main-bg: #f9f9f6;
  --header-bg: #ffffff;
  --accent: #4361ee;
  --accent-hover: #3a52cb;
  --text-color: #1a1a1a;
  --nav-bg: #e7ecf9;
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.05);
  --max-width: 1200px;
}

/* Root structure */
.app-root {
  background: var(--main-bg);
  color: var(--text-color);
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.5px;
  margin: 0;
}

/* Navigation */
.navbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  background: var(--nav-bg);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  color: var(--text-color);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-link:hover {
  background-color: var(--accent);
  color: #fff;
}

.router-link-exact-active {
  background-color: var(--accent-hover);
  color: #fff;
}

/* Main layout */
.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
}

.main-content {
  width: 100%;
  max-width: var(--max-width);
}

/* Mobile */
@media (max-width: 640px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .logo {
    font-size: 1.25rem;
  }

  .navbar {
    flex-direction: column;
    width: 100%;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }

  .app-main {
    padding: 1rem;
  }
}
</style>
