import { setupPageTransitions } from "./transitions.js?v=20260607-filterfix";
import { setupInteractions } from "./interactions.js?v=20260607-filterfix";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
