import { setupPageTransitions } from "./transitions.js?v=20260608-consolecards";
import { setupInteractions } from "./interactions.js?v=20260608-consolecards";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
