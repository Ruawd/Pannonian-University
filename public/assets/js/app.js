import { setupPageTransitions } from "./transitions.js?v=20260607-smoothfilters";
import { setupInteractions } from "./interactions.js?v=20260607-smoothfilters";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
