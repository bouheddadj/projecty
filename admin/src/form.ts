function initListeners(mymap: L.Map): void {
  console.log("TODO: add more event listeners...");

  bindFormListeners(mymap); // ← ajout ici

  document.getElementById("setZrrButton")?.addEventListener("click", () => {
    setZrr(mymap);
  });

  document.getElementById("sendZrrButton")?.addEventListener("click", () => {
    sendZrr();
  });

  document.getElementById("setTtlButton")?.addEventListener("click", () => {
    setTtl();
  });
}

// MàJ des inputs du formulaire
function updateLatValue(lat: number): void {
  const latInput = document.getElementById("lat") as HTMLInputElement | null;
  if (latInput) latInput.value = lat.toFixed(5);
}

function updateLonValue(lng: number): void {
  const lonInput = document.getElementById("lon") as HTMLInputElement | null;
  if (lonInput) lonInput.value = lng.toFixed(5);
}

function updateZoomValue(zoom: number): void {
  const zoomInput = document.getElementById("zoom") as HTMLInputElement | null;
  if (zoomInput) zoomInput.value = zoom.toString();
}

// 🔁 Lien entre les champs du formulaire et la carte
function bindFormListeners(mymap: L.Map): void {
  const latInput = document.getElementById("lat") as HTMLInputElement | null;
  const lonInput = document.getElementById("lon") as HTMLInputElement | null;
  const zoomInput = document.getElementById("zoom") as HTMLInputElement | null;

  if (!latInput || !lonInput || !zoomInput) return;

  // Clic sur la carte → met à jour les inputs
  mymap.on("click", (e) => {
    updateLatValue(e.latlng.lat);
    updateLonValue(e.latlng.lng);
  });

  // Zoom sur la carte → met à jour input zoom
  mymap.on("zoomend", () => {
    updateZoomValue(mymap.getZoom());
  });

  // Changement d'un champ → met à jour la carte
  const updateFromInputs = () => {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lonInput.value);
    const zoom = parseInt(zoomInput.value);

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
      updateMap(mymap, [lat, lng], zoom);
    }
  };

  latInput.addEventListener("change", updateFromInputs);
  lonInput.addEventListener("change", updateFromInputs);
  zoomInput.addEventListener("change", updateFromInputs);
}

// Déplacement de la carte
function updateMap(mymap: L.Map, latlng: [number, number], zoom: number): void {
  mymap.setView(latlng, zoom);
}

// ZRR
function setZrr(mymap: L.Map): void {
  const currentBounds = mymap.getBounds();

  const northWest = currentBounds.getNorthWest();
  const southEast = currentBounds.getSouthEast();

  (document.getElementById("lat1") as HTMLInputElement).value =
    northWest.lat.toFixed(5);
  (document.getElementById("lon1") as HTMLInputElement).value =
    northWest.lng.toFixed(5);
  (document.getElementById("lat2") as HTMLInputElement).value =
    southEast.lat.toFixed(5);
  (document.getElementById("lon2") as HTMLInputElement).value =
    southEast.lng.toFixed(5);
}

// Requêtes asynchrones
function sendZrr(): void {
  const lat1 = parseFloat(
    (document.getElementById("lat1") as HTMLInputElement).value,
  );
  const lon1 = parseFloat(
    (document.getElementById("lon1") as HTMLInputElement).value,
  );
  const lat2 = parseFloat(
    (document.getElementById("lat2") as HTMLInputElement).value,
  );
  const lon2 = parseFloat(
    (document.getElementById("lon2") as HTMLInputElement).value,
  );

  if ([lat1, lon1, lat2, lon2].some(isNaN)) {
    alert("Coordonnées invalides");
    return;
  }

  const point1: [number, number] = [lat1, lon1];
  const point2: [number, number] = [lat2, lon2];

  const token = localStorage.getItem("token");
  const baseUrlApi = process.env.BASE_URL_API;

  fetch(`${baseUrlApi}/admin/setZRR`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({ point1, point2 }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur lors de l'envoi de la ZRR");
      alert("ZRR enregistrée avec succès !");
    })
    .catch((err) => {
      console.error(err);
      alert("Échec de l'envoi de la ZRR");
    });
}

function setTtl(): void {
  const ttlInput = document.getElementById("ttl") as HTMLInputElement;
  const ttlValue = parseInt(ttlInput?.value);

  if (isNaN(ttlValue) || ttlValue <= 0) {
    alert("Veuillez entrer une valeur TTL valide.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token manquant. Veuillez vous reconnecter.");
    return;
  }

  fetch(`${process.env.BASE_URL_API}/admin/setTTL`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({ ttl: ttlValue }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Échec de l'envoi du TTL");
      return res.json();
    })
    .then((data) => {
      alert("TTL mis à jour avec succès !");
      console.log(data);
    })
    .catch((err) => {
      alert("Erreur lors de l'envoi du TTL : " + err.message);
    });
}

export { updateLatValue, updateLonValue, updateZoomValue, updateMap };

export default initListeners;
