import { setupPageTransitions } from "./transitions.js?v=20260608-completeux";
import { setupInteractions } from "./interactions.js?v=20260608-completeux";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
