const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function setupInteractions() {
  setupHeaderState();
  setupNavIndicator();
  setupMenu();
  setupRipples();
  setupRevealObserver();
  setupSystemsConsole();
  setupCohortShowcases();
  setupCurriculumFilters();

  document.addEventListener("pu:page-ready", setupRevealObserver);
  document.addEventListener("pu:navigated", () => {
    updateNavIndicator();
    setupRevealObserver();
    setupSystemsConsole();
    setupCohortShowcases();
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

function setupSystemsConsole() {
  const consoles = [...document.querySelectorAll("[data-systems-console]:not([data-console-ready='true'])")];

  consoles.forEach((consoleElement) => {
    consoleElement.dataset.consoleReady = "true";
    const triggers = [...consoleElement.querySelectorAll("[data-console-trigger]")];
    const panels = [...consoleElement.querySelectorAll("[data-console-panel]")];

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => activate(trigger.dataset.consoleTrigger));
      trigger.addEventListener("keydown", (event) => handleRovingKeys(event, triggers, index));
    });

    function activate(id) {
      triggers.forEach((trigger) => {
        const active = trigger.dataset.consoleTrigger === id;
        trigger.classList.toggle("is-active", active);
        trigger.setAttribute("aria-selected", String(active));
      });

      panels.forEach((panel) => {
        const active = panel.dataset.consolePanel === id;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    }
  });
}

function setupCohortShowcases() {
  const showcases = [...document.querySelectorAll("[data-cohort-showcase]:not([data-cohort-ready='true'])")];

  showcases.forEach((showcase) => {
    showcase.dataset.cohortReady = "true";
    const triggers = [...showcase.querySelectorAll("[data-cohort-trigger]")];
    const panels = [...showcase.querySelectorAll("[data-cohort-detail]")];

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => activate(trigger.dataset.cohortTrigger));
      trigger.addEventListener("keydown", (event) => handleRovingKeys(event, triggers, index));
    });

    function activate(id) {
      triggers.forEach((trigger) => {
        const active = trigger.dataset.cohortTrigger === id;
        trigger.classList.toggle("is-active", active);
        trigger.setAttribute("aria-selected", String(active));
      });

      panels.forEach((panel) => {
        const active = panel.dataset.cohortDetail === id;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    }
  });
}

function handleRovingKeys(event, items, index) {
  const nextKeys = ["ArrowRight", "ArrowDown"];
  const previousKeys = ["ArrowLeft", "ArrowUp"];
  if (!nextKeys.includes(event.key) && !previousKeys.includes(event.key)) return;

  event.preventDefault();
  const direction = nextKeys.includes(event.key) ? 1 : -1;
  const nextIndex = (index + direction + items.length) % items.length;
  items[nextIndex].focus();
  items[nextIndex].click();
}

function setupCurriculumFilters() {
  const section = document.querySelector(".curriculum-section");
  if (!section || section.dataset.filtersReady === "true") return;

  section.dataset.filtersReady = "true";

  const search = section.querySelector("[data-course-search]");
  const buttons = [...section.querySelectorAll("[data-filter-type]")];
  const cards = [...section.querySelectorAll("[data-course-card]")];
  const count = section.querySelector("[data-result-count]");
  const countShell = count?.closest(".result-count");
  const empty = section.querySelector("[data-course-empty]");
  const state = { domain: "all", level: "all" };
  const hideTimers = new WeakMap();
  let countPulseTimer = 0;

  cards.forEach((card, index) => {
    card.style.setProperty("--course-delay", `${index * 45}ms`);
  });

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

      applyFilters({ animate: true });
    });
  });

  search?.addEventListener("input", debounce(() => applyFilters({ animate: true }), 90));
  applyFilters({ animate: false });

  function applyFilters({ animate }) {
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

      if (isVisible) {
        revealCourseCard(card, visibleCount, animate);
        visibleCount += 1;
      } else {
        hideCourseCard(card, animate);
      }
    });

    if (count && count.textContent !== String(visibleCount)) {
      count.textContent = String(visibleCount);
      countShell?.classList.remove("is-updating");
      void countShell?.offsetWidth;
      countShell?.classList.add("is-updating");
      window.clearTimeout(countPulseTimer);
      countPulseTimer = window.setTimeout(() => countShell?.classList.remove("is-updating"), 260);
    }
    if (empty) empty.hidden = visibleCount > 0;
  }

  function revealCourseCard(card, visibleIndex, animate) {
    const timer = hideTimers.get(card);
    if (timer) {
      window.clearTimeout(timer);
      hideTimers.delete(card);
    }

    card.style.setProperty("--course-delay", `${Math.min(visibleIndex, 5) * 46}ms`);
    card.classList.remove("is-exiting");

    if (card.hidden) {
      card.hidden = false;
      if (animate && !reducedMotion.matches) {
        card.classList.add("is-entering");
        window.setTimeout(() => card.classList.remove("is-entering"), 760);
      }
    }
  }

  function hideCourseCard(card, animate) {
    const timer = hideTimers.get(card);
    if (timer) window.clearTimeout(timer);

    card.classList.remove("is-entering");

    if (card.hidden) return;
    if (!animate || reducedMotion.matches) {
      card.hidden = true;
      card.classList.remove("is-exiting");
      return;
    }

    card.classList.add("is-exiting");
    const hideTimer = window.setTimeout(() => {
      card.hidden = true;
      card.classList.remove("is-exiting");
      hideTimers.delete(card);
    }, 220);
    hideTimers.set(card, hideTimer);
  }
}
