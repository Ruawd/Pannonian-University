import { setupPageTransitions } from "./transitions.js?v=20260607-cleanurls";
import { setupInteractions } from "./interactions.js?v=20260607-cleanurls";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
