export function setupInteractions() {
  setupHeaderState();
  setupNavIndicator();
  setupMenu();
  setupRipples();
  setupRevealObserver();
  setupCurriculumFilters();

  document.addEventListener("pu:page-ready", setupRevealObserver);
  document.addEventListener("pu:navigated", () => {
    updateNavIndicator();
    setupRevealObserver();
    setupCurriculumFilters();
    closeMenu();
  });
}

function setupHeaderState() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 6);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupNavIndicator() {
  const nav = document.querySelector(".desktop-nav");
  if (!nav || nav.dataset.indicatorReady === "true") return;

  nav.dataset.indicatorReady = "true";
  const links = [...nav.querySelectorAll("[data-nav-link]")];
  let hoverLink = null;
  let focusLink = null;
  let pendingLink = null;
  let pendingUntil = 0;
  let frame = 0;

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => {
      hoverLink = link;
      scheduleMove();
    });
    link.addEventListener("focus", () => {
      focusLink = link;
      scheduleMove();
    });
    link.addEventListener("click", () => {
      pendingLink = link;
      pendingUntil = performance.now() + 1400;
      hoverLink = null;
      focusLink = null;
      scheduleMove();
    });
  });

  nav.addEventListener("pointerleave", () => {
    hoverLink = null;
    scheduleMove();
  });
  nav.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!nav.contains(document.activeElement)) {
        focusLink = null;
        scheduleMove();
      }
    }, 0);
  });
  window.addEventListener("resize", debounce(scheduleMove, 120), { passive: true });
  document.addEventListener("pu:navigated", () => {
    pendingLink = null;
    pendingUntil = 0;
    hoverLink = null;
    focusLink = null;
    scheduleMove();
  });

  requestAnimationFrame(scheduleMove);

  function scheduleMove() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const target = getNavTarget(hoverLink, focusLink, pendingLink, pendingUntil);
      if (target) {
        moveNavIndicator(target);
      } else {
        nav.classList.remove("has-indicator");
      }
    });
  }
}

function updateNavIndicator() {
  const target = getNavTarget(null, null, null, 0);
  if (target) {
    moveNavIndicator(target);
  } else {
    document.querySelector(".desktop-nav")?.classList.remove("has-indicator");
  }
}

function getNavTarget(hoverLink, focusLink, pendingLink, pendingUntil) {
  if (hoverLink?.isConnected) return hoverLink;
  if (focusLink?.isConnected) return focusLink;
  if (pendingLink?.isConnected && performance.now() < pendingUntil) return pendingLink;
  return document.querySelector(".desktop-nav [data-nav-link][aria-current='page']");
}

function moveNavIndicator(link) {
  const nav = link.closest(".desktop-nav");
  if (!nav) return;

  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  nav.style.setProperty("--nav-indicator-width", `${linkRect.width}px`);
  nav.style.setProperty("--nav-indicator-height", `${linkRect.height}px`);
  nav.style.setProperty("--nav-indicator-x", `${linkRect.left - navRect.left}px`);
  nav.style.setProperty("--nav-indicator-y", `${linkRect.top - navRect.top}px`);
  nav.classList.add("has-indicator");
}

function debounce(callback, delay) {
  let timer = 0;

  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, delay);
  };
}

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("#mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    menu.hidden = expanded;
    document.body.classList.toggle("menu-open", !expanded);
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function closeMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("#mobile-menu");
  if (!toggle || !menu) return;

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  menu.hidden = true;
  document.body.classList.remove("menu-open");
}

function setupRipples() {
  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest("[data-ripple]");
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple-spot";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    target.append(ripple);

    window.setTimeout(() => ripple.remove(), 620);
  });
}

function setupRevealObserver() {
  const elements = [...document.querySelectorAll("[data-reveal]:not(.is-visible)")];
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.16 });

  elements.forEach((element) => observer.observe(element));
}

function setupCurriculumFilters() {
  const section = document.querySelector(".curriculum-section");
  if (!section || section.dataset.filtersReady === "true") return;

  section.dataset.filtersReady = "true";

  const search = section.querySelector("[data-course-search]");
  const buttons = [...section.querySelectorAll("[data-filter-type]")];
  const cards = [...section.querySelectorAll("[data-course-card]")];
  const count = section.querySelector("[data-result-count]");
  const empty = section.querySelector("[data-course-empty]");
  const state = { domain: "all", level: "all" };

  buttons.forEach((button) => {
    const active = button.classList.contains("is-active");
    button.setAttribute("aria-pressed", String(active));

    button.addEventListener("click", () => {
      const type = button.dataset.filterType;
      state[type] = button.dataset.filterValue || "all";

      buttons
        .filter((item) => item.dataset.filterType === type)
        .forEach((item) => {
          const isActive = item.dataset.filterValue === state[type];
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });

      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);
  applyFilters();

  function applyFilters() {
    const query = (search?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const domain = card.dataset.domain || "";
      const level = card.dataset.level || "";
      const searchable = (card.dataset.search || card.textContent || "").toLowerCase();
      const domainMatches = state.domain === "all" || domain === state.domain || domain === "all";
      const levelMatches = state.level === "all" || level === state.level;
      const queryMatches = !query || searchable.includes(query);
      const isVisible = domainMatches && levelMatches && queryMatches;

      card.hidden = !isVisible;
      visibleCount += isVisible ? 1 : 0;
    });

    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount > 0;
  }
}
