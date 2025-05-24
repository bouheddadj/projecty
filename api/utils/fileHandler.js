import { readFile, writeFile } from "fs/promises";
import path from "path";

const dataPath = path.resolve("../api/data/gameData.json");

// Fonction pour lire le json (fichier qui stocke les données du jeux)
export async function readData() {
  try {
    const raw = await readFile(dataPath, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("Erreur lecture JSON :", e);
    return { players: [], vitrines: [], zrr: null, ttl: 60 }; // fallback safe
  }
}

export async function writeData(data) {
  await writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
}
