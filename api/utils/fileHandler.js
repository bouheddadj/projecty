const fs = require("fs/promises");
const path = require("path");

// Construction sûre du chemin, basé sur __dirname
const dataPath = path.join(__dirname, "..", "data", "gameData.json");

// Fonction pour lire le JSON en toute sécurité
async function readData() {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");

    // parse sécurisé (évite le cas où le fichier est vide)
    return raw.trim()
      ? JSON.parse(raw)
      : { players: [], vitrines: [], zrr: null, ttl: 60 };
  } catch (e) {
    console.error("Erreur lecture JSON :", e);
    return { players: [], vitrines: [], zrr: null, ttl: 60 }; // fallback safe
  }
}

// Fonction pour écrire dans le fichier
async function writeData(data) {
  try {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Erreur écriture JSON :", e);
  }
}

module.exports = {
  readData,
  writeData,
};
