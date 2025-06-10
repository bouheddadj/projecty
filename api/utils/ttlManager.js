import { readData, writeData } from "./fileHandler.js";

export function startTTLLoop(intervalMs = 1000) {
  setInterval(async () => {
    try {
      const data = await readData();

      const now = Date.now();
      const last =
        typeof data._lastTtlUpdate === "number"
          ? data._lastTtlUpdate
          : now - intervalMs;

      const elapsed = (now - last) / 1000;
      if (elapsed <= 0) return;

      let changed = false;

      for (const vitrine of data.vitrines || []) {
        if (vitrine.TTL > 0) {
          const oldTTL = vitrine.TTL;
          vitrine.TTL = Math.max(0, vitrine.TTL - elapsed);
          if (vitrine.TTL !== oldTTL) {
            changed = true;
          }
        }
      }

      const before = data.vitrines.length;
      data.vitrines = data.vitrines.filter((v) => v.TTL > 0);
      const after = data.vitrines.length;
      if (before !== after) {
        changed = true;
      }

      data._lastTtlUpdate = now;

      if (changed) {
        await writeData(data);
      }
    } catch (err) {
      console.error("Erreur boucle TTL :", err);
    }
  }, intervalMs);
}
