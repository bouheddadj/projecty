import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construction sûre du chemin, basé sur __dirname
const dataPath = path.join(__dirname, "..", "data", "gameData.json");

// Fonction pour lire le JSON en toute sécurité
export async function readData() {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    return raw.trim()
      ? JSON.parse(raw)
      : { players: [], vitrines: [], zrr: null, ttl: 60 };
  } catch (e) {
    console.error("Erreur lecture JSON :", e);
    return { players: [], vitrines: [], zrr: null, ttl: 60 };
  }
}

let writeQueue = Promise.resolve();

export async function writeData(data) {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Erreur écriture JSON :", e);
    }
  });
  return writeQueue;
}
