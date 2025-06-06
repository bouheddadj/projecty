import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "screenshots/preview1.png",
      ],
      manifest: {
        name: "Panique au Musée",
        short_name: "Panique",
        description: "Un jeu entre voleurs et policiers dans un musée",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4a90e2",
        orientation: "portrait",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/preview1.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/preview-narrow.png",
            sizes: "540x960",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      workbox: {
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/login/,
          /^\/register/,
          /^\/map/,
          /^\/admin/,
          /^\/profile/,
          /^\/assets/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.js$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "js-cache",
            },
          },
          {
            urlPattern: /^https:\/\/.*\.css$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "css-cache",
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semaine
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
