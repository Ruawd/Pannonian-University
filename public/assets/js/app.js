import { setupPageTransitions } from "./transitions.js?v=20260608-huangportrait";
import { setupInteractions } from "./interactions.js?v=20260608-huangportrait";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
