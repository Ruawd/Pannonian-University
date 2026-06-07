import { setupPageTransitions } from "./transitions.js?v=20260607-syllabusdrawer";
import { setupInteractions } from "./interactions.js?v=20260607-syllabusdrawer";

setupInteractions();
setupPageTransitions();

document.dispatchEvent(new CustomEvent("pu:page-ready"));
