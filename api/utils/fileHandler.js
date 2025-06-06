import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "gameData.json");

export async function readData() {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const data = raw.trim() ? JSON.parse(raw) : {};
    return {
      players: Array.isArray(data.players) ? data.players : [],
      vitrines: Array.isArray(data.vitrines) ? data.vitrines : [],
      zrr: data.zrr || null,
      ttl: typeof data.ttl === "number" ? data.ttl : 60,
    };
  } catch (e) {
    console.error("Erreur lecture JSON :", e);
  }
}

let writeQueue = Promise.resolve();

export async function writeData(data) {
  writeQueue = writeQueue.then(async () => {
    try {
      const finalData = {
        players: Array.isArray(data.players) ? data.players : [],
        vitrines: Array.isArray(data.vitrines) ? data.vitrines : [],
        zrr: data.zrr || null,
        ttl: typeof data.ttl === "number" ? data.ttl : 60,
      };
      await fs.writeFile(dataPath, JSON.stringify(finalData, null, 2), "utf-8");
    } catch (e) {
      console.error("Erreur écriture JSON :", e);
    }
  });
  return writeQueue;
}
