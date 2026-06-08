import { setupPageTransitions } from "./transitions.js?v=20260608-liuportrait";
import { setupInteractions } from "./interactions.js?v=20260608-liuportrait";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
