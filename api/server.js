import express from "express";
import dotenv from "dotenv";
import process from "process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import fetch from "node-fetch";
import https from "https";
import gameRouter from "./routes/gameRouter.js";
import adminRouter from "./routes/adminRouter.js";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const BASE_URL_USERS = process.env.BASE_URL_USERS;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function parseJwt(token) {
  const base64 = token.split(".")[1];
  return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
}

const isAuthenticated = async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    req.user = { id: "mock-user", species: "ADMIN" };
    return next();
  }

  const authHeader = req.headers["authorization"];
  const origin = req.headers["origin"] || "https://192.168.75.33";

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Token manquant" });
  }

  const token = authHeader.split(" ")[1];
  const url = `${BASE_URL_USERS}/authenticate?jwt=${token}&origin=${encodeURIComponent(
    origin
  )}`;

  try {
    console.log(`🔐 Authentification via : ${url}`);

    const response = await fetch(url, {
      method: "GET",
      //   agent: httpsAgent,
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: origin,
        Accept: "application/json",
      },
    });

    if (response.status === 204 || response.status === 200) {
      const payload = parseJwt(token);
      req.user = {
        id: payload.sub,
        species: payload.species,
      };
      return next();
    }

    return res.status(401).json({ error: "Unauthorized: Token rejeté" });
  } catch (err) {
    console.error("❌ Erreur dans isAuthenticated :", err.message);
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: err.message });
  }
};

const isAdmin = async (req, res, next) => {
  await isAuthenticated(req, res, () => {
    if (req.user?.species !== "ADMIN") {
      return res.status(403).json({ error: "Accès refusé : Admin uniquement" });
    }
    next();
  });
};

export function createServer() {
  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.sendFile("public/index.html", { root: __dirname });
  });

  app.get("/static", (req, res) => {
    res.sendFile("public/index.html", { root: __dirname });
  });

  app.use("/api/game", isAuthenticated, gameRouter);
  app.use("/api/admin", isAdmin, adminRouter);

  app.use((req, res) => {
    res.status(404).send("Sorry, can't find that!");
  });

  return app;
}

const app = createServer();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🌍 Environnement : ${process.env.NODE_ENV}`);
  console.log(`🔗 BASE_URL_USERS = ${BASE_URL_USERS}`);
});
