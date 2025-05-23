import express from "express";
import { readData, writeData } from "../utils/fileHandler.js";
import { v4 as uuidv4 } from "uuid";
import { getDistance } from "../utils/geo.js";

const adminRouter = express.Router();

adminRouter.post("/setZRR", async (req, res) => {
  const { point1, point2 } = req.body;

  if (!Array.isArray(point1) || !Array.isArray(point2)) {
    return res.status(400).json({ error: "Invalid ZRR format" });
  }

  const data = await readData();
  data.zrr = { point1, point2 };

  await writeData(data);
  res.json({ message: "ZRR defined successfully" });
});

adminRouter.post("/setTTL", async (req, res) => {
  const { ttl } = req.body;

  if (!ttl || typeof ttl !== "number" || ttl <= 0) {
    return res.status(400).json({ error: "Invalid TTL value" });
  }

  const data = await readData();
  data.ttl = ttl;

  await writeData(data);
  res.json({ message: `TTL set to ${ttl} seconds` });
});

adminRouter.post("/setSpecies", async (req, res) => {
  const { playerId, species } = req.body;

  if (!playerId || !["VOLEUR", "POLICIER"].includes(species)) {
    return res.status(400).json({ error: "Invalid playerId or species" });
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
  res.json({ message: `Player ${playerId} set to species ${species}` });
});

adminRouter.post("/triggerShowcase", async (req, res) => {
  const { position } = req.body;

  if (!Array.isArray(position) || position.length !== 2) {
    return res.status(400).json({ error: "Invalid position format" });
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

  res.json({ message: "Showcase triggered", showcase: newShowcase });
});

adminRouter.post("/randomShowcase", async (req, res) => {
  const { count } = req.body;
  const data = await readData();

  if (!data.zrr || !data.zrr.point1 || !data.zrr.point2) {
    return res.status(400).json({ error: "ZRR not defined" });
  }

  if (!count || typeof count !== "number" || count <= 0) {
    return res
      .status(400)
      .json({ error: 'Invalid or missing "count" parameter' });
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

      // Vérifie la distance avec vitrines déjà ajoutées dans cette série
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
    message: `${addedShowcases.length} vitrines ajoutées dans la ZRR`,
    vitrines: addedShowcases,
  });
});

export default adminRouter;
