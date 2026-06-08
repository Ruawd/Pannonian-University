import { setupPageTransitions } from "./transitions.js?v=20260608-cohortlock";
import { setupInteractions } from "./interactions.js?v=20260608-cohortlock";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
