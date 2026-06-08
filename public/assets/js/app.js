import { setupPageTransitions } from "./transitions.js?v=20260608-infosearch";
import { setupInteractions } from "./interactions.js?v=20260608-infosearch";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
