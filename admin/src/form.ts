function initListeners(mymap: L.Map): void {
  console.log("TODO: add more event listeners...");

  document.getElementById("setZrrButton")?.addEventListener("click", () => {
    setZrr(null);
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
  if (latInput) latInput.value = lat.toString();
}

function updateLonValue(lng: number): void {
  const lonInput = document.getElementById("lon") as HTMLInputElement | null;
  if (lonInput) lonInput.value = lng.toString();
}

function updateZoomValue(zoom: number): void {
  const zoomInput = document.getElementById("zoom") as HTMLInputElement | null;
  if (zoomInput) zoomInput.value = zoom.toString();
}

function setZrr(bounds: L.LatLngBounds | null): void {
  console.log("TODO: update input values...");
}

// Requêtes asynchrones
function sendZrr(): void {
  console.log("TODO: send fetch request...");
}

function setTtl(): void {
  console.log("TODO: send fetch request...");
}

// 🔧 Correction : ajout de updateMap ici
function updateMap(mymap: L.Map, latlng: [number, number], zoom: number): void {
  mymap.setView(latlng, zoom);
}

export { updateLatValue, updateLonValue, updateZoomValue, updateMap };
export default initListeners;

