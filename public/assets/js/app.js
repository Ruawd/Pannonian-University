import { setupPageTransitions } from "./transitions.js?v=20260607-flipfilter";
import { setupInteractions } from "./interactions.js?v=20260607-flipfilter";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
