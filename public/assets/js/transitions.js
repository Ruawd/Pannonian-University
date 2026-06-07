const parser = new DOMParser();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const directoryIndex = "index.html";
const cleanPagePaths = new Set(["/", "/academics/", "/curriculum/", "/admissions/", "/research/", "/campus/", "/contact/"]);
const legacyPagePaths = new Map([
  ["/index.html", "/"],
  ["/academics.html", "/academics/"],
  ["/curriculum.html", "/curriculum/"],
  ["/admissions.html", "/admissions/"],
  ["/research.html", "/research/"],
  ["/campus.html", "/campus/"],
  ["/contact.html", "/contact/"]
]);

export function setupPageTransitions() {
  document.addEventListener("click", handleLinkClick);
  window.addEventListener("popstate", () => navigate(new URL(window.location.href), { history: "replace" }));
}

async function handleLinkClick(event) {
  const link = event.target.closest("a[href]");
  if (!link || !shouldHandle(link, event)) return;

  event.preventDefault();
  await navigate(new URL(link.href));
}

async function navigate(url, options = {}) {
  try {
    const direction = getNavigationDirection(url);
    document.documentElement.dataset.navDirection = direction;
    const response = await fetch(url.href, { headers: { "X-PU-Navigation": "1" } });
    if (!response.ok) {
      window.location.href = url.href;
      return;
    }

    const nextDocument = parser.parseFromString(await response.text(), "text/html");
    const nextMain = nextDocument.querySelector("main");
    if (!nextMain) {
      window.location.href = url.href;
      return;
    }

    const swap = () => {
      document.title = nextDocument.title;
      syncMeta(nextDocument);
      document.body.dataset.page = nextDocument.body.dataset.page || "";
      document.querySelector("main").replaceWith(nextMain);
      updateActiveNavigation(url);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.dispatchEvent(new CustomEvent("pu:navigated", { detail: { url: url.href } }));
    };

    if (document.startViewTransition && !reducedMotion.matches) {
      await document.startViewTransition(swap).finished;
    } else {
      swap();
    }

    if (options.history !== "replace") {
      history.pushState({}, "", url.href);
    }

    window.setTimeout(() => {
      delete document.documentElement.dataset.navDirection;
    }, 420);
  } catch {
    delete document.documentElement.dataset.navDirection;
    window.location.href = url.href;
  }
}

function shouldHandle(link, event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;
  if (link.protocol === "mailto:" || link.protocol === "tel:") return false;

  const url = new URL(link.href);
  if (url.origin !== window.location.origin) return false;
  if (url.hash && stripHash(url.href) === stripHash(window.location.href)) return false;

  const pathname = normalizePath(url.pathname);
  return cleanPagePaths.has(pathname);
}

function stripHash(value) {
  const url = new URL(value);
  url.hash = "";
  return url.href;
}

function normalizePath(pathname) {
  if (legacyPagePaths.has(pathname)) return legacyPagePaths.get(pathname);
  if (pathname.endsWith(`/${directoryIndex}`)) return pathname.slice(0, -directoryIndex.length);
  if (cleanPagePaths.has(`${pathname}/`)) return `${pathname}/`;
  return pathname;
}

function updateActiveNavigation(url) {
  const activePath = normalizePath(url.pathname);

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    if (linkPath === activePath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function getNavigationDirection(url) {
  const order = ["/", "/academics/", "/curriculum/", "/admissions/", "/research/", "/campus/", "/contact/"];
  const current = normalizePath(window.location.pathname);
  const next = normalizePath(url.pathname);
  const currentIndex = order.indexOf(current);
  const nextIndex = order.indexOf(next);

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) return "neutral";
  return nextIndex > currentIndex ? "forward" : "back";
}

function syncMeta(nextDocument) {
  const selectors = [
    "meta[name='description']",
    "meta[property='og:title']",
    "meta[property='og:description']",
    "meta[property='og:url']",
    "link[rel='canonical']"
  ];

  for (const selector of selectors) {
    const current = document.head.querySelector(selector);
    const next = nextDocument.head.querySelector(selector);
    if (current && next) current.replaceWith(next);
  }
}
