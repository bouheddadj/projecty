// gameRouter.js
//
// Routes API REST pour la gestion du jeu (ressources, joueurs, vitrines, ZRR)
//
// Principales fonctionnalités :
// - POST   /join                : Ajoute un joueur au jeu (hors admin)
// - DELETE /leave               : Retire un joueur du jeu (hors admin)
// - PUT    /profile/login       : Change le login d'un joueur
// - GET    /resources           : Liste joueurs et vitrines visibles
// - PUT    /resources/:id/position : Met à jour la position d'un joueur
// - POST   /resources/:resourceId  : Interaction (capture, vol, fermeture) avec une ressource (joueur ou vitrine)
// - PUT    /resources/:id       : Met à jour le TTL d'une vitrine
// - DELETE /resources/:id       : Supprime une vitrine
// - GET    /zrr                 : Récupère la ZRR (zone réglementée)
//
// Les opérations sont sécurisées par le rôle (VOLEUR, POLICIER, ADMIN) et la distance (5m max pour interactions physiques).
//
// Données persistées dans data/gameData.json via fileHandler.js
//
// Auteur : THIEBAUD Enzo

import express from "express";
import { readData, writeData } from "../utils/fileHandler.js";

const gameRouter = express.Router();

gameRouter.post("/join", async (req, res) => {
  try {
    const { id, species } = req.user;
    if (species === "ADMIN") {
      return res
        .status(403)
        .json({
          error: "Les administrateurs ne peuvent pas rejoindre le jeu.",
        });
    }
    const data = await readData();
    data.players = data.players || [];
    const alreadyExists = data.players.find((p) => p.id === id);
    if (alreadyExists) {
      return res
        .status(200)
        .json({ message: "Joueur déjà présent dans le jeu." });
    }
    const defaultPosition = [45.782, 4.8656];
    data.players.push({ id, species, position: defaultPosition });
    await writeData(data);
    res.status(201).json({ message: "Joueur ajouté au jeu." });
  } catch (err) {
    console.error("Erreur lors de l'ajout du joueur :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'ajout du joueur." });
  }
});

gameRouter.delete("/leave", async (req, res) => {
  try {
    const { id, species } = req.user;
    if (species === "ADMIN") {
      return res
        .status(403)
        .json({
          error:
            "Les administrateurs ne peuvent pas quitter le jeu (ils ne sont pas dedans).",
        });
    }
    const data = await readData();
    data.players = data.players || [];
    const initialCount = data.players.length;
    data.players = data.players.filter((p) => p.id !== id);
    const removed = data.players.length !== initialCount;
    await writeData(data);
    return res
      .status(removed ? 204 : 404)
      .json(
        removed
          ? { message: "Joueur supprimé du jeu." }
          : { error: "Joueur non trouvé." }
      );
  } catch (err) {
    console.error("Erreur lors de la suppression du joueur :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du joueur." });
  }
});

gameRouter.put("/profile/login", async (req, res) => {
  try {
    const { id: oldId, species } = req.user;
    const { newLogin } = req.body;
    if (!newLogin || typeof newLogin !== "string") {
      return res.status(400).json({ error: "Nouveau login invalide." });
    }
    if (species === "ADMIN") {
      return res
        .status(403)
        .json({
          error:
            "Les administrateurs ne peuvent pas modifier leur identifiant ici.",
        });
    }
    const data = await readData();
    data.players = data.players || [];
    const playerIndex = data.players.findIndex((p) => p.id === oldId);
    if (playerIndex === -1) {
      return res.status(404).json({ error: "Joueur non trouvé." });
    }
    if (data.players.some((p) => p.id === newLogin)) {
      return res.status(409).json({ error: "Ce login est déjà utilisé." });
    }
    data.players[playerIndex].id = newLogin;
    await writeData(data);
    return res.status(200).json({ message: "Login mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur lors du changement de login :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du changement de login." });
  }
});

gameRouter.get("/resources", async (req, res) => {
  try {
    const data = await readData();
    const userSpecies = req.user.species;
    const players = (data.players || []).filter(
      (p) =>
        p.position && (userSpecies === "ADMIN" || p.species === userSpecies)
    );
    const vitrines = data.vitrines;
    res.json([...players, ...vitrines]);
  } catch (err) {
    console.error("Erreur lors de la récupération des ressources :", err);
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la récupération des ressources.",
      });
  }
});

gameRouter.put("/resources/:id/position", async (req, res) => {
  try {
    const { position } = req.body;
    if (!Array.isArray(position) || position.length !== 2) {
      return res
        .status(400)
        .json({
          error:
            "Format de position invalide. La position doit être un tableau [lat, lng].",
        });
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
    res.status(204).send();
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la position :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour de la position." });
  }
});

gameRouter.post("/resources/:resourceId", async (req, res) => {
  try {
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
      return res
        .status(404)
        .json({ error: "Ressource ou joueur introuvable." });
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
        .json({ error: "Trop loin de la cible (5 mètres max)." });
    }
    switch (operationType) {
      case "capture thief":
        if (userSpecies !== "POLICIER" || target.species !== "VOLEUR") {
          return res
            .status(400)
            .json({ error: "Tentative de capture invalide." });
        }
        target.captured = true;
        source.terminated = (source.terminated || 0) + 1;
        break;
      case "steal showcase content":
        if (userSpecies !== "VOLEUR" || !target.TTL) {
          return res.status(400).json({ error: "Tentative de vol invalide." });
        }
        target.TTL = Math.max(0, target.TTL - 1);
        source.showcases = (source.showcases || 0) + 1;
        break;
      case "close showcase":
        if (userSpecies !== "POLICIER" || !target.TTL) {
          return res
            .status(400)
            .json({ error: "Tentative de fermeture invalide." });
        }
        target.TTL = 0;
        source.showcases = (source.showcases || 0) + 1;
        break;
      default:
        return res.status(400).json({ error: "Type d'opération invalide." });
    }
    await writeData(data);
    res.status(204).send();
  } catch (err) {
    console.error("Erreur lors de l'interaction avec la ressource :", err);
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de l'interaction avec la ressource.",
      });
  }
});

gameRouter.get("/zrr", async (req, res) => {
  try {
    const data = await readData();
    if (!data.zrr) return res.status(404).json({ error: "ZRR non définie." });
    res.json([data.zrr.point1, data.zrr.point2]);
  } catch (err) {
    console.error("Erreur lors de la récupération de la ZRR :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de la ZRR." });
  }
});

gameRouter.put("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TTL } = req.body;
    const data = await readData();
    data.vitrines = Array.isArray(data.vitrines) ? data.vitrines : [];
    if (TTL !== undefined) {
      const vitrine = (data.vitrines || []).find((v) => v.id === id);
      if (vitrine) {
        vitrine.TTL = TTL;
        data.vitrines = data.vitrines.filter((v) => v.TTL > 0);
        await writeData(data);
        return res.status(200).json({ message: "TTL mis à jour." });
      }
      return res.status(404).json({ error: "Vitrine non trouvée." });
    }
    return res.status(400).json({ error: "Aucune donnée à mettre à jour." });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la vitrine :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour de la vitrine." });
  }
});

gameRouter.delete("/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID de vitrine requis." });
    }
    const data = await readData();
    data.vitrines = Array.isArray(data.vitrines) ? data.vitrines : [];
    const index = data.vitrines.findIndex((v) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Vitrine non trouvée." });
    }
    data.vitrines.splice(index, 1);
    await writeData(data);
    return res.status(204).send();
  } catch (err) {
    console.error("Erreur lors de la suppression de la vitrine :", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression de la vitrine." });
  }
});

export default gameRouter;
