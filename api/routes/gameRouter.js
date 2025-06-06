import express from "express";
import { readData, writeData } from "../utils/fileHandler.js";

const gameRouter = express.Router();

gameRouter.post("/join", async (req, res) => {
  const { id, species } = req.user;

  if (species === "ADMIN") {
    return res
      .status(403)
      .json({ error: "Les administrateurs ne peuvent pas rejoindre le jeu" });
  }

  const data = await readData();
  data.players = data.players || [];

  const alreadyExists = data.players.find((p) => p.id === id);

  if (alreadyExists) {
    return res.status(200).json({ message: "Joueur déjà présent dans le jeu" });
  }

  const defaultPosition = [45.782, 4.8656]; // par exemple

  data.players.push({
    id,
    species,
    position: defaultPosition,
  });

  await writeData(data);

  res.status(201).json({ message: "Joueur ajouté au jeu" });
});

gameRouter.delete("/leave", async (req, res) => {
  const { id, species } = req.user;

  if (species === "ADMIN") {
    return res.status(403).json({
      error:
        "Les administrateurs ne peuvent pas quitter le jeu (ils ne sont pas dedans)",
    });
  }

  const data = await readData();
  data.players = data.players || [];

  const initialCount = data.players.length;
  data.players = data.players.filter((p) => p.id !== id);

  const removed = data.players.length !== initialCount;

  await writeData(data);

  return res.status(removed ? 204 : 404).send(); // 204 si supprimé, 404 sinon
});

gameRouter.put("/profile/login", async (req, res) => {
  const { id: oldId, species } = req.user;
  const { newLogin } = req.body;

  if (!newLogin || typeof newLogin !== "string") {
    return res.status(400).json({ error: "Nouveau login invalide" });
  }

  if (species === "ADMIN") {
    return res.status(403).json({
      error: "Les administrateurs ne peuvent pas modifier leur identifiant ici",
    });
  }

  const data = await readData();
  data.players = data.players || [];

  const playerIndex = data.players.findIndex((p) => p.id === oldId);

  if (playerIndex === -1) {
    return res.status(404).json({ error: "Joueur non trouvé" });
  }

  // Vérifie que le nouveau login n’est pas déjà utilisé
  if (data.players.some((p) => p.id === newLogin)) {
    return res.status(409).json({ error: "Ce login est déjà utilisé" });
  }

  // Met à jour l'identifiant du joueur
  data.players[playerIndex].id = newLogin;

  await writeData(data);
  return res.status(200).json({ message: "Login mis à jour avec succès" });
});

// Nettoyage automatique des vitrines expirées à chaque requête de ressources
// (côté API, suppression des vitrines dont TTL <= 0)
gameRouter.get("/resources", async (req, res) => {
  const data = await readData();
  const userSpecies = req.user.species;

  // Mise à jour du TTL des vitrines (décrémentation en temps réel)
  const now = Date.now();
  if (!data._lastTtlUpdate) data._lastTtlUpdate = now;
  const elapsed = (now - data._lastTtlUpdate) / 1000;
  if (elapsed > 0) {
    (data.vitrines || []).forEach((v) => {
      if (v.TTL && v.TTL > 0) v.TTL = Math.max(0, v.TTL - elapsed);
    });
    data._lastTtlUpdate = now;
    // Nettoyage des vitrines expirées
    data.vitrines = (data.vitrines || []).filter((v) => v.TTL > 0);
    await writeData(data);
  }

  const players = (data.players || []).filter(
    (p) => p.position && (userSpecies === "ADMIN" || p.species === userSpecies)
  );
  const vitrines = data.vitrines;

  res.json([...players, ...vitrines]);
});

gameRouter.put("/resources/:id/position", async (req, res) => {
  const { position } = req.body;

  if (!Array.isArray(position) || position.length !== 2) {
    return res.status(400).json({ error: "Invalid position format" });
  }

  const data = await readData();
  data.players = data.players || [];

  const playerId = req.user.id;
  const species = req.user.species;

  let player = data.players.find((p) => p.id === playerId);

  if (!player) {
    player = { id: playerId, species, position };
    data.players.push(player);
  } else {
    player.position = position;
  }

  await writeData(data);
  res.status(204).send(); // conforme à Swagger
});

gameRouter.post("/resources/:resourceId", async (req, res) => {
  const { resourceId } = req.params;
  const { operationType } = req.body;

  const userId = req.user.id;
  const userSpecies = req.user.species;

  const data = await readData();

  const source = data.players.find((p) => p.id === userId);
  const target =
    data.players.find((p) => p.id === resourceId) ||
    data.vitrines?.find((v) => v.id === resourceId);

  if (!source || !source.position || !target || !target.position) {
    return res.status(404).json({ error: "Resource or player not found" });
  }

  const DEGREE_TO_METER = 111139;

  const distanceMeters =
    Math.sqrt(
      Math.pow(source.position[0] - target.position[0], 2) +
        Math.pow(source.position[1] - target.position[1], 2)
    ) * DEGREE_TO_METER;

  if (distanceMeters > 5) {
    return res
      .status(403)
      .json({ error: "Trop loin de la cible (5 mètres max)" });
  }

  switch (operationType) {
    case "capture thief":
      if (userSpecies !== "POLICIER" || target.species !== "VOLEUR") {
        return res.status(400).json({ error: "Invalid capture attempt" });
      }
      target.captured = true;
      source.terminated = (source.terminated || 0) + 1;
      break;

    case "steal showcase content":
      if (userSpecies !== "VOLEUR" || !target.TTL) {
        return res.status(400).json({ error: "Invalid steal attempt" });
      }
      target.TTL = Math.max(0, target.TTL - 1);
      source.showcases = (source.showcases || 0) + 1;
      break;

    case "close showcase":
      if (userSpecies !== "POLICIER" || !target.TTL) {
        return res.status(400).json({ error: "Invalid close attempt" });
      }
      target.TTL = 0;
      source.showcases = (source.showcases || 0) + 1;
      break;

    default:
      return res.status(400).json({ error: "Invalid operationType" });
  }

  await writeData(data);
  res.status(204).send();
});

gameRouter.get("/zrr", async (req, res) => {
  const data = await readData();
  if (!data.zrr) return res.status(404).json({ error: "ZRR not defined" });
  res.json([data.zrr.point1, data.zrr.point2]);
});

gameRouter.put("/resources/:id", async (req, res) => {
  const { id } = req.params;
  const { TTL } = req.body;
  const data = await readData();
  data.vitrines = Array.isArray(data.vitrines) ? data.vitrines : [];

  if (TTL !== undefined) {
    // Met à jour le TTL
    const vitrine = (data.vitrines || []).find((v) => v.id === id);
    if (vitrine) {
      vitrine.TTL = TTL;
      data.vitrines = data.vitrines.filter((v) => v.TTL > 0);
      await writeData(data);
      return res.status(200).json({ message: "TTL mis à jour" });
    }
    return res.status(404).json({ error: "Vitrine non trouvée" });
  }
  return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
});

gameRouter.delete("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID de vitrine requis." });
    }

    const data = await readData();
    data.vitrines = Array.isArray(data.vitrines) ? data.vitrines : [];

    const index = vitrines.findIndex((v) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Vitrine non trouvée." });
    }

    data.vitrines.splice(index, 1);
    await writeData(data);

    return res.status(204).send(); // suppression OK, pas de contenu
  } catch (err) {
    console.error("Erreur lors de la suppression de la vitrine :", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression." });
  }
});

export default gameRouter;
