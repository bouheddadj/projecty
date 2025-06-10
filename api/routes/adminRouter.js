// adminRouter.js
//
// Routes API REST pour la gestion administrative du jeu (réservées à l'admin)
//
// Principales fonctionnalités :
// - POST   /setZRR           : Définit la ZRR (zone réglementée)
// - POST   /setTTL           : Définit le TTL global des vitrines
// - POST   /setSpecies       : Change le rôle d'un joueur (VOLEUR/POLICIER)
// - POST   /triggerShowcase  : Ajoute une vitrine à une position précise (TTL global)
// - POST   /randomShowcase   : Ajoute plusieurs vitrines aléatoirement dans la ZRR
// - GET    /ttl              : Récupère le TTL global des vitrines
// - POST   /showcase         : Ajoute une vitrine à une position précise (TTL custom possible)
// - DELETE /showcases        : Supprime toutes les vitrines
// - DELETE /players          : Supprime tous les joueurs
//
// Toutes les opérations modifient le fichier data/gameData.json via fileHandler.js
//
// Auteur : THIEBAUD Enzo

import express from "express";
import { readData, writeData } from "../utils/fileHandler.js";
import { v4 as uuidv4 } from "uuid";
import { getDistance } from "../utils/geo.js";

const adminRouter = express.Router();

adminRouter.post("/setZRR", async (req, res) => {
  try {
    const { point1, point2 } = req.body;
    if (!Array.isArray(point1) || !Array.isArray(point2)) {
      return res.status(400).json({
        error:
          "Format de ZRR invalide. Les deux points doivent être des tableaux de coordonnées.",
      });
    }
    const data = await readData();
    data.zrr = { point1, point2 };
    await writeData(data);
    res.json({ message: "ZRR définie avec succès." });
  } catch (err) {
    console.error("Erreur lors de la définition de la ZRR :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la définition de la ZRR." });
  }
});

adminRouter.post("/setTTL", async (req, res) => {
  try {
    const { ttl } = req.body;
    if (!ttl || typeof ttl !== "number" || ttl <= 0) {
      return res.status(400).json({
        error: "La valeur TTL doit être un nombre strictement positif.",
      });
    }
    const data = await readData();
    data.ttl = ttl;
    await writeData(data);
    res.json({ message: `TTL défini à ${ttl} secondes.` });
  } catch (err) {
    console.error("Erreur lors de la définition du TTL :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la définition du TTL." });
  }
});

adminRouter.post("/setSpecies", async (req, res) => {
  try {
    const { playerId, species } = req.body;
    if (!playerId || !["VOLEUR", "POLICIER"].includes(species)) {
      return res.status(400).json({
        error:
          "playerId ou espèce invalide. Espèces possibles : VOLEUR, POLICIER.",
      });
    }
    const data = await readData();
    data.players = data.players || [];
    const player = data.players.find((p) => p.id === playerId);
    if (player) {
      player.species = species;
    } else {
      data.players.push({ id: playerId, species });
    }
    await writeData(data);
    res.json({ message: `Rôle du joueur ${playerId} défini à ${species}.` });
  } catch (err) {
    console.error("Erreur lors du changement de rôle :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du changement de rôle du joueur." });
  }
});

adminRouter.post("/triggerShowcase", async (req, res) => {
  try {
    const { position } = req.body;
    if (!Array.isArray(position) || position.length !== 2) {
      return res.status(400).json({
        error:
          "Format de position invalide. La position doit être un tableau [lat, lng].",
      });
    }
    const data = await readData();
    data.vitrines = data.vitrines || [];
    const ttl = data.ttl || 60;
    const newShowcase = {
      id: uuidv4(),
      position,
      TTL: ttl,
    };
    data.vitrines.push(newShowcase);
    await writeData(data);
    res.json({
      message: "Vitrine ajoutée avec succès.",
      showcase: newShowcase,
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de la vitrine :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'ajout de la vitrine." });
  }
});

adminRouter.post("/randomShowcase", async (req, res) => {
  try {
    const { count } = req.body;
    const data = await readData();
    if (!data.zrr || !data.zrr.point1 || !data.zrr.point2) {
      return res.status(400).json({
        error:
          "La ZRR n'est pas définie. Impossible d'ajouter des vitrines aléatoires.",
      });
    }
    if (!count || typeof count !== "number" || count <= 0) {
      return res.status(400).json({
        error: 'Le paramètre "count" doit être un nombre strictement positif.',
      });
    }
    const { point1, point2 } = data.zrr;
    const ttl = data.ttl || 60;
    const latMin = Math.min(point1[0], point2[0]);
    const latMax = Math.max(point1[0], point2[0]);
    const lngMin = Math.min(point1[1], point2[1]);
    const lngMax = Math.max(point1[1], point2[1]);
    data.vitrines = data.vitrines || [];
    const addedShowcases = [];
    while (addedShowcases.length < count) {
      let attempts = 0;
      let valid = false;
      let candidate;
      while (!valid && attempts < 30) {
        const randomLat = Math.random() * (latMax - latMin) + latMin;
        const randomLng = Math.random() * (lngMax - lngMin) + lngMin;
        candidate = [randomLat, randomLng];
        valid = addedShowcases.every(
          (v) => getDistance(candidate, v.position) >= 3
        );
        attempts++;
      }
      if (valid) {
        const showcase = {
          id: uuidv4(),
          position: candidate,
          TTL: ttl,
        };
        data.vitrines.push(showcase);
        addedShowcases.push(showcase);
      } else {
        console.warn(
          `Impossible de placer une vitrine sans collision après 30 tentatives`
        );
        break;
      }
    }
    await writeData(data);
    res.status(201).json({
      message: `${addedShowcases.length} vitrine(s) ajoutée(s) dans la ZRR.`,
      vitrines: addedShowcases,
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de vitrines aléatoires :", err);
    res.status(500).json({
      error: "Erreur serveur lors de l'ajout de vitrines aléatoires.",
    });
  }
});

adminRouter.get("/ttl", async (req, res) => {
  try {
    const data = await readData();
    res.json({ ttl: data.ttl || 60 });
  } catch (err) {
    console.error("Erreur lors de la récupération du TTL :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération du TTL." });
  }
});

adminRouter.post("/showcase", async (req, res) => {
  try {
    const { position, TTL } = req.body;
    if (!position || !Array.isArray(position) || position.length !== 2) {
      return res.status(400).json({
        error:
          "Position invalide. La position doit être un tableau [lat, lng].",
      });
    }
    const data = await readData();
    data.vitrines = data.vitrines || [];
    data.vitrines.push({
      id: uuidv4(),
      position,
      TTL: TTL || data.ttl || 60,
    });
    await writeData(data);
    res.status(201).json({ message: "Vitrine ajoutée avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'ajout de la vitrine (admin) :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'ajout de la vitrine." });
  }
});

adminRouter.delete("/showcases", async (req, res) => {
  try {
    const data = await readData();
    const deletedCount = data.vitrines?.length || 0;
    data.vitrines = [];
    await writeData(data);
    res.status(200).json({
      message: "Toutes les vitrines ont été supprimées.",
      deletedCount,
    });
  } catch (err) {
    console.error("Erreur lors de la suppression des vitrines :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression des vitrines." });
  }
});

adminRouter.delete("/players", async (req, res) => {
  try {
    const data = await readData();
    const deletedCount = data.players?.length || 0;
    data.players = [];
    await writeData(data);
    res.status(200).json({
      message: "Tous les joueurs ont été supprimés.",
      deletedCount,
    });
  } catch (err) {
    console.error("Erreur lors de la suppression des joueurs :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression des joueurs." });
  }
});

export default adminRouter;
