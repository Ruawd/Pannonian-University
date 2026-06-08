import { setupPageTransitions } from "./transitions.js?v=20260608-luodean";
import { setupInteractions } from "./interactions.js?v=20260608-luodean";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
