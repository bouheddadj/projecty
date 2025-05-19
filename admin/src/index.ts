import "./css/style.css";
import map from "./map";
import form from "./form";
import { loadResources } from "./map";

const mymap = map();
const myform = form(mymap);

// Charger les ressources immédiatement
loadResources(mymap);

// Mettre à jour toutes les 5 secondes
setInterval(() => {
  loadResources(mymap);
}, 5000);
