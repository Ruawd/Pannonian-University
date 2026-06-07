import { setupPageTransitions } from "./transitions.js?v=20260607-cardmotion";
import { setupInteractions } from "./interactions.js?v=20260607-cardmotion";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
