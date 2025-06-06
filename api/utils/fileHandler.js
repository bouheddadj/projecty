import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "data", "gameData.json");

let writeQueue = Promise.resolve();

export async function readData() {
  try {
    await writeQueue;

    const raw = await fs.readFile(dataPath, "utf-8");

    if (!raw.trim()) {
      return defaultGameData();
    }

    return JSON.parse(raw);
  } catch (e) {
    console.error("Erreur lecture JSON :", e);
    return defaultGameData();
  }
}

export async function writeData(data) {
  writeQueue = writeQueue.then(async () => {
    try {
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(dataPath, json, "utf-8");
    } catch (e) {
      console.error("Erreur écriture JSON :", e);
    }
  });

  return writeQueue;
}

function defaultGameData() {
  return {
    players: [],
    vitrines: [],
    zrr: null,
    ttl: 60,
  };
}
