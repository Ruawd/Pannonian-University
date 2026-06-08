import { setupPageTransitions } from "./transitions.js?v=20260608-researchlayout";
import { setupInteractions } from "./interactions.js?v=20260608-researchlayout";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
