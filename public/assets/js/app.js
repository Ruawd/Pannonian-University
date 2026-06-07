import { setupPageTransitions } from "./transitions.js?v=20260607-showcase";
import { setupInteractions } from "./interactions.js?v=20260607-showcase";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
