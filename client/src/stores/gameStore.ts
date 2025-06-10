import { defineStore } from "pinia";

export const useGameStore = defineStore("game", {
  state: () => ({
    currentUser: {
      login: "",
      species: "",
      score: 0,
      position: [0, 0] as [number, number],
    },
    players: [] as any[],
    showcases: [] as any[],
    zrr: [] as [number, number][],
    lastUpdate: Date.now(),
  }),

  getters: {
    vitrinesAvecInfos(state) {
      return state.showcases.map((v) => {
        const ttl = Math.max(0, v.TTL - (Date.now() - state.lastUpdate) / 1000);
        const distance =
          Math.sqrt(
            Math.pow(state.currentUser.position[0] - v.position[0], 2) +
              Math.pow(state.currentUser.position[1] - v.position[1], 2),
          ) * 111139;
        return { ...v, ttl, distance };
      });
    },
    speciesLabel: (state) =>
      state.currentUser.species === "VOLEUR" ? "Acolyte" : "Policier",
  },

  actions: {
    setCurrentUser(user: { login: string; species: string; score?: number }) {
      this.currentUser.login = user.login;
      this.currentUser.species = user.species;
      this.currentUser.score = user.score ?? 0;
    },

    setUserPosition(pos: [number, number]) {
      this.currentUser.position = pos;
    },

    setZrr(bounds: [number, number][]) {
      this.zrr = bounds;
    },

    setResources(resources: any[]) {
      this.players = resources.filter(
        (r) =>
          r.species === this.currentUser.species &&
          r.id !== this.currentUser.login,
      );
      this.showcases = resources.filter((r) => r.TTL !== undefined);
      this.lastUpdate = Date.now();
    },

    async decrementShowcasesTTL() {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      for (const v of this.showcases) {
        if (v.TTL > 0) {
          v.TTL = Math.max(0, v.TTL - 1);
          await fetch(
            `${import.meta.env.VITE_API_URL_GAME}/game/resources/${v.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ TTL: v.TTL }),
            },
          );
        }
      }

      this.showcases = this.showcases.filter((v) => v.TTL > 0);
    },

    clearGame() {
      this.players = [];
      this.showcases = [];
      this.zrr = [];
    },

    async deleteShowcase(id: string) {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL_GAME}/game/resources/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.status === 204) {
          this.showcases = this.showcases.filter((v) => v.id !== id);
        }
      } catch (err) {
        console.error("Erreur suppression vitrine :", err);
      }
    },

    async interactWithShowcase(id: string, token: string) {
      const type =
        this.currentUser.species === "VOLEUR"
          ? "steal showcase content"
          : "close showcase";

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL_GAME}/game/resources/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ operationType: type }),
          },
        );

        if (res.status === 204) {
          this.showcases = this.showcases.filter((v) => v.id !== id);
          if ("vibrate" in navigator) {
            if (this.currentUser.species === "VOLEUR") {
              navigator.vibrate(100);
            } else if (this.currentUser.species === "POLICIER") {
              navigator.vibrate([100, 50, 100]);
            }
          }
          await this.deleteShowcase(id).then(() => {
            this.currentUser.score += 1;
          });
          return;
        }

        const err = await res.json();

        if (err.error.includes("Too far")) {
          return "Vous êtes trop loin de la vitrine (max. 5 mètres).";
        } else if (err.error.includes("Invalid")) {
          return "Action non autorisée pour votre rôle.";
        } else if (err.error.includes("not found")) {
          return "Vitrine introuvable ou déjà traitée.";
        } else {
          return "Échec de l'action : " + err.error;
        }
      } catch {
        return "Erreur réseau : impossible de contacter le serveur.";
      }
    },

    async updateServerPosition() {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(
          `${import.meta.env.VITE_API_URL_GAME}/game/resources/${this.currentUser.login}/position`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ position: this.currentUser.position }),
          },
        );
      } catch (err) {
        console.error("Erreur envoi position :", err);
      }
    },
  },
});
