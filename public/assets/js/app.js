import { setupPageTransitions } from "./transitions.js?v=20260607-explorers";
import { setupInteractions } from "./interactions.js?v=20260607-explorers";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
