import { setupPageTransitions } from "./transitions.js?v=20260608-researchbento";
import { setupInteractions } from "./interactions.js?v=20260608-researchbento";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
