import { setupPageTransitions } from "./transitions.js?v=20260608-chenportrait";
import { setupInteractions } from "./interactions.js?v=20260608-chenportrait";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
