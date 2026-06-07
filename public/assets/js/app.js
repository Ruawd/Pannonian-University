import { setupPageTransitions } from "./transitions.js?v=20260607-pages2";
import { setupInteractions } from "./interactions.js?v=20260607-pages2";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
