const express = require("express");
const jwtDecode = require("jwt-decode");

// // Direct implementation of JWT decoder to avoid package issues
// function decodeJWT(token) {
//   try {
//     const parts = token.split(".");
//     if (parts.length !== 3) {
//       throw new Error("JWT must have 3 parts");
//     }

//     const base64Url = parts[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = Buffer.from(base64, "base64").toString("utf8");

//     console.log("Decoded payload:", jsonPayload);
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error("Error decoding JWT:", error.message);
//     throw error;
//   }
// }

const app = express();
const PORT = process.env.PORT || 3000;

const DEFAULT_ORIGIN = "http://localhost";

app.get("/", (req, res) => {
  const authHeader = req.headers["authorization"];
  const origin = req.headers["origin"] || DEFAULT_ORIGIN;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }
  console.log(`Authorization: ${authHeader}`);
  console.log(`Origin: ${origin}`);

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwtDecode.jwtDecode(token);

    if (!decodedToken) {
      return res.status(403).json({ error: "Token invalide" });
    }

    if (decodedToken.origin && decodedToken.origin !== origin) {
      return res.status(403).json({ error: "Origine non autorisée" });
    }

    // Utiliser sub comme user_id si user_id n'existe pas
    const userId =
      decodedToken.user_id ||
      decodedToken.sub ||
      decodedToken.name ||
      "Utilisateur";

    // Envoyer une seule réponse
    return res.status(200).send(`Bonjour ${userId}`);
  } catch (error) {
    console.error("Erreur de décodage du token:", error);
    res.status(403).json({ error: "Erreur lors de la validation du token" });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
