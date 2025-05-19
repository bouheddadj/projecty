import "./css/style.css";

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm") as HTMLFormElement;
  const loginInput = document.getElementById("login") as HTMLInputElement;
  const passwordInput = document.getElementById("pass") as HTMLInputElement;

  const baseUrlUsers = process.env.BASE_URL_USERS;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = loginInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!login || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(`${baseUrlUsers}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) throw new Error("Échec de l'authentification");

      const token =
        response.headers.get("Authorization") || (await response.json())?.token;

      if (!token) throw new Error("Token introuvable");

      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.species !== "ADMIN") {
        alert("Accès refusé : vous n'êtes pas un administrateur");
        return;
      }

      console.log("✅ TOKEN:", token);
      localStorage.setItem("token", token);
      window.location.href = "admin.html";
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  });
});
