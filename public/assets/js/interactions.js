const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const assetVersion = "20260608-researchbento";

export function setupInteractions() {
  setupHeaderState();
  setupNavIndicator();
  setupMenu();
  setupRipples();
  setupSiteSearch();
  setupRevealObserver();
  setupCommandCenters();
  setupSystemsConsole();
  setupCohortShowcases();
  setupFacultyExplorers();
  setupAdmissionsSteppers();
  setupResearchMaps();
  setupCampusGuides();
  setupCurriculumFilters();
  setupSyllabusDrawer();

  document.addEventListener("pu:page-ready", setupRevealObserver);
  document.addEventListener("pu:navigated", () => {
    document.body.classList.remove("syllabus-open");
    updateNavIndicator();
    setupSiteSearch();
    setupRevealObserver();
    setupCommandCenters();
    setupSystemsConsole();
    setupCohortShowcases();
    setupFacultyExplorers();
    setupAdmissionsSteppers();
    setupResearchMaps();
    setupCampusGuides();
    setupCurriculumFilters();
    setupSyllabusDrawer();
    closeMenu();
  });
}

let searchIndexPromise = null;

function setupSiteSearch() {
  const shell = document.querySelector("[data-site-search]");
  if (!shell || shell.dataset.searchReady === "true") return;

  shell.dataset.searchReady = "true";
  const panel = shell.querySelector("[data-search-panel]");
  const input = shell.querySelector("[data-search-input]");
  const results = shell.querySelector("[data-search-results]");
  const openers = [...document.querySelectorAll("[data-search-open]")];
  const closers = [...shell.querySelectorAll("[data-search-close]")];
  let activeOpener = null;

  openers.forEach((opener) => {
    opener.addEventListener("click", () => openSearch(opener));
  });

  closers.forEach((closer) => {
    closer.addEventListener("click", closeSearch);
  });

  input?.addEventListener("input", debounce(() => {
    renderSearchResults(input.value, results);
  }, 80));

  shell.addEventListener("keydown", (event) => {
    if (shell.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === "Tab") {
      trapSearchFocus(event);
    }
  });

  shell.addEventListener("click", (event) => {
    if (event.target.closest(".site-search-result")) closeSearch();
  });

  async function openSearch(opener) {
    activeOpener = opener;
    shell.hidden = false;
    document.body.classList.add("search-open");

    await renderSearchResults(input?.value || "", results);
    requestAnimationFrame(() => {
      shell.classList.add("is-open");
      input?.focus({ preventScroll: true });
      input?.select();
    });
  }

  function closeSearch() {
    if (shell.hidden) return;

    shell.classList.remove("is-open");
    document.body.classList.remove("search-open");
    window.setTimeout(() => {
      shell.hidden = true;
      if (activeOpener?.isConnected) activeOpener.focus({ preventScroll: true });
      activeOpener = null;
    }, reducedMotion.matches ? 0 : 220);
  }

  function trapSearchFocus(event) {
    const focusable = [...panel.querySelectorAll("a[href], button:not([disabled]), input, [tabindex]:not([tabindex='-1'])")]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

async function getSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch(`/assets/search-index.json?v=${assetVersion}`, { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : [])
      .catch(() => []);
  }

  return searchIndexPromise;
}

async function renderSearchResults(query, results) {
  if (!results) return;

  const index = await getSearchIndex();
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = index
    .map((item) => ({ item, score: scoreSearchItem(item, terms) }))
    .filter(({ item, score }) => terms.length ? score > 0 : ["home", "Faculty", "Course", "University", "Notice"].includes(String(item.section)))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, terms.length ? 10 : 8);

  if (!matches.length) {
    results.innerHTML = `<p class="site-search-empty">No results found.</p>`;
    return;
  }

  results.innerHTML = matches.map(({ item }) => `
    <a class="site-search-result" href="${escapeAttribute(item.href)}">
      <span>${escapeHtml(item.section)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.description)}</p>
    </a>
  `).join("");
}

function scoreSearchItem(item, terms) {
  if (!terms.length) return item.section === "home" ? 30 : 10;

  const title = String(item.title || "").toLowerCase();
  const section = String(item.section || "").toLowerCase();
  const description = String(item.description || "").toLowerCase();
  const text = String(item.text || "").toLowerCase();

  return terms.reduce((score, term) => {
    if (title.includes(term)) score += 12;
    if (section.includes(term)) score += 6;
    if (description.includes(term)) score += 4;
    if (text.includes(term)) score += 1;
    return score;
  }, 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
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

function setupCommandCenters() {
  setupPanelSwitchers({
    rootSelector: "[data-command-center]:not([data-switcher-ready='true'])",
    triggerSelector: "[data-command-trigger]",
    panelSelector: "[data-command-panel]",
    getTriggerId: (trigger) => trigger.dataset.commandTrigger,
    getPanelId: (panel) => panel.dataset.commandPanel
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

function setupFacultyExplorers() {
  setupPanelSwitchers({
    rootSelector: "[data-faculty-explorer]:not([data-switcher-ready='true'])",
    triggerSelector: "[data-faculty-trigger]",
    panelSelector: "[data-faculty-panel]",
    getTriggerId: (trigger) => trigger.dataset.facultyTrigger,
    getPanelId: (panel) => panel.dataset.facultyPanel
  });
}

function setupAdmissionsSteppers() {
  setupPanelSwitchers({
    rootSelector: "[data-admissions-stepper]:not([data-switcher-ready='true'])",
    triggerSelector: "[data-admissions-trigger]",
    panelSelector: "[data-admissions-panel]",
    getTriggerId: (trigger) => trigger.dataset.admissionsTrigger,
    getPanelId: (panel) => panel.dataset.admissionsPanel
  });
}

function setupResearchMaps() {
  setupPanelSwitchers({
    rootSelector: "[data-research-map]:not([data-switcher-ready='true'])",
    triggerSelector: "[data-research-trigger]",
    panelSelector: "[data-research-panel]",
    getTriggerId: (trigger) => trigger.dataset.researchTrigger,
    getPanelId: (panel) => panel.dataset.researchPanel
  });
}

function setupCampusGuides() {
  setupPanelSwitchers({
    rootSelector: "[data-campus-guide]:not([data-switcher-ready='true'])",
    triggerSelector: "[data-campus-trigger]",
    panelSelector: "[data-campus-panel]",
    getTriggerId: (trigger) => trigger.dataset.campusTrigger,
    getPanelId: (panel) => panel.dataset.campusPanel
  });
}

function setupPanelSwitchers({ rootSelector, triggerSelector, panelSelector, getTriggerId, getPanelId }) {
  const roots = [...document.querySelectorAll(rootSelector)];

  roots.forEach((root) => {
    root.dataset.switcherReady = "true";
    const triggers = [...root.querySelectorAll(triggerSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => activate(getTriggerId(trigger)));
      trigger.addEventListener("keydown", (event) => handleRovingKeys(event, triggers, index));
    });

    const initial = triggers.find((trigger) => trigger.classList.contains("is-active")) || triggers[0];
    if (initial) activate(getTriggerId(initial), { skipFocus: true });

    function activate(id) {
      triggers.forEach((trigger) => {
        const active = getTriggerId(trigger) === id;
        trigger.classList.toggle("is-active", active);
        trigger.setAttribute("aria-selected", String(active));
      });

      panels.forEach((panel) => {
        const active = getPanelId(panel) === id;
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
  const groups = [...section.querySelectorAll(".filter-group")];
  const buttons = [...section.querySelectorAll("[data-filter-type]")];
  const cards = [...section.querySelectorAll("[data-course-card]")];
  const count = section.querySelector("[data-result-count]");
  const countShell = count?.closest(".result-count");
  const empty = section.querySelector("[data-course-empty]");
  const state = { domain: "all", level: "all" };
  const animationStates = new WeakMap();
  let countPulseTimer = 0;
  let flipFrame = 0;

  cards.forEach((card, index) => {
    card.style.setProperty("--course-delay", `${index * 24}ms`);
  });

  groups.forEach(setupFilterGroupIndicator);
  requestAnimationFrame(() => groups.forEach(updateFilterGroupIndicator));
  window.addEventListener("resize", debounce(() => {
    groups.forEach(updateFilterGroupIndicator);
  }, 120), { passive: true });

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

      updateFilterGroupIndicator(button.closest(".filter-group"));
      applyFilters({ animate: true });
    });
  });

  search?.addEventListener("input", debounce(() => applyFilters({ animate: true }), 90));
  applyFilters({ animate: false });

  function applyFilters({ animate }) {
    const query = (search?.value || "").trim().toLowerCase();
    const shouldAnimate = animate && !reducedMotion.matches;
    const firstRects = new Map();
    const matches = new Map();
    const visibleCards = [];
    let visibleCount = 0;

    if (flipFrame) {
      window.cancelAnimationFrame(flipFrame);
      flipFrame = 0;
    }

    if (shouldAnimate) {
      cards.forEach((card) => {
        if (!card.hidden) firstRects.set(card, card.getBoundingClientRect());
        clearCourseCardAnimation(card);
      });
    } else {
      cards.forEach(clearCourseCardAnimation);
    }

    cards.forEach((card) => {
      const domain = card.dataset.domain || "";
      const level = card.dataset.level || "";
      const searchable = (card.dataset.search || card.textContent || "").toLowerCase();
      const domainMatches = state.domain === "all" || domain === state.domain || domain === "all";
      const levelMatches = state.level === "all" || level === state.level;
      const queryMatches = !query || searchable.includes(query);
      const isVisible = domainMatches && levelMatches && queryMatches;

      if (isVisible) {
        visibleCards.push(card);
        visibleCount += 1;
      } else if (shouldAnimate && !card.hidden) {
        createCourseGhost(card, firstRects.get(card));
      }

      matches.set(card, isVisible);
    });

    cards.forEach((card) => {
      card.hidden = !matches.get(card);
    });

    if (shouldAnimate) {
      flipFrame = window.requestAnimationFrame(() => {
        flipFrame = 0;
        visibleCards.forEach((card, index) => {
          const firstRect = firstRects.get(card);
          const lastRect = card.getBoundingClientRect();
          card.style.setProperty("--course-delay", `${Math.min(index, 5) * 24}ms`);

          if (firstRect) {
            animateCourseMove(card, firstRect, lastRect);
          } else {
            animateCourseEnter(card);
          }
        });
      });
    }

    if (!shouldAnimate) {
      visibleCards.forEach((card, index) => {
        card.style.setProperty("--course-delay", `${Math.min(index, 5) * 24}ms`);
      });
    }

    if (count && count.textContent !== String(visibleCount)) {
      count.textContent = String(visibleCount);
      countShell?.classList.remove("is-updating");
      void countShell?.offsetWidth;
      countShell?.classList.add("is-updating");
      window.clearTimeout(countPulseTimer);
      countPulseTimer = window.setTimeout(() => countShell?.classList.remove("is-updating"), 220);
    }
    if (empty) empty.hidden = visibleCount > 0;
  }

  function clearCourseCardAnimation(card) {
    const state = animationStates.get(card);
    if (state) {
      window.clearTimeout(state.timer);
      state.animation?.cancel();
      animationStates.delete(card);
    }

    card.getAnimations().forEach((animation) => animation.cancel());
    card.classList.remove("is-entering", "is-moving");
    card.style.transform = "";
    card.style.opacity = "";
    card.style.willChange = "";
  }

  function animateCourseMove(card, firstRect, lastRect) {
    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      return;
    }

    card.classList.add("is-moving");
    card.style.willChange = "transform";

    const animation = card.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" }
      ],
      {
        duration: 360,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both"
      }
    );
    const state = { animation, timer: 0 };
    const finish = () => {
      if (animationStates.get(card) !== state) return;

      window.clearTimeout(state.timer);
      animation.cancel();
      card.classList.remove("is-moving");
      card.style.willChange = "";
      animationStates.delete(card);
    };

    state.timer = window.setTimeout(finish, 430);
    animationStates.set(card, state);
    animation.finished.catch(() => {}).finally(finish);
  }

  function animateCourseEnter(card) {
    card.classList.add("is-entering");
    card.style.willChange = "opacity, transform";

    const state = { animation: null, timer: 0 };
    const finish = () => {
      if (animationStates.get(card) !== state) return;

      window.clearTimeout(state.timer);
      card.classList.remove("is-entering");
      card.style.willChange = "";
      animationStates.delete(card);
    };

    state.timer = window.setTimeout(finish, 390);
    animationStates.set(card, state);
  }

  function createCourseGhost(card, rect) {
    if (!rect) return;

    const ghost = card.cloneNode(true);
    ghost.hidden = false;
    ghost.setAttribute("aria-hidden", "true");
    ghost.removeAttribute("data-course-card");
    ghost.inert = true;
    ghost.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });
    ghost.classList.remove("is-entering", "is-moving");
    ghost.classList.add("course-card-ghost");
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.append(ghost);

    window.requestAnimationFrame(() => {
      ghost.classList.add("is-leaving");
    });
    window.setTimeout(() => ghost.remove(), 230);
  }
}

function setupFilterGroupIndicator(group) {
  if (!group || group.querySelector(".filter-active-indicator")) return;

  const indicator = document.createElement("span");
  indicator.className = "filter-active-indicator";
  indicator.setAttribute("aria-hidden", "true");
  group.prepend(indicator);
  updateFilterGroupIndicator(group);
}

function updateFilterGroupIndicator(group) {
  if (!group) return;

  const indicator = group.querySelector(".filter-active-indicator");
  const activeButton = group.querySelector("[data-filter-type].is-active");
  if (!indicator || !activeButton) {
    group.classList.remove("has-filter-indicator");
    return;
  }

  const groupRect = group.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  group.style.setProperty("--filter-indicator-y", `${buttonRect.top - groupRect.top}px`);
  group.style.setProperty("--filter-indicator-height", `${buttonRect.height}px`);
  group.classList.add("has-filter-indicator");
}

function setupSyllabusDrawer() {
  const shell = document.querySelector("[data-syllabus-shell]");
  if (!shell || shell.dataset.drawerReady === "true") return;

  shell.dataset.drawerReady = "true";

  const drawer = shell.querySelector("[data-syllabus-drawer]");
  const scrollArea = shell.querySelector(".syllabus-scroll");
  const panels = [...shell.querySelectorAll("[data-syllabus-panel]")];
  const openers = [...document.querySelectorAll("[data-syllabus-open]")];
  const jumpers = [...shell.querySelectorAll("[data-syllabus-jump]")];
  const closers = [...shell.querySelectorAll("[data-syllabus-close]")];
  let activeOpener = null;
  let closeTimer = 0;

  openers.forEach((opener) => {
    opener.setAttribute("aria-expanded", "false");
    opener.addEventListener("click", () => {
      openSyllabus(opener.dataset.syllabusOpen, opener);
    });
  });

  closers.forEach((closer) => {
    closer.addEventListener("click", closeSyllabus);
  });

  jumpers.forEach((jumper) => {
    jumper.addEventListener("click", () => {
      openSyllabus(jumper.dataset.syllabusJump, activeOpener);
    });
  });

  shell.addEventListener("keydown", (event) => {
    if (shell.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeSyllabus();
      return;
    }

    if (event.key === "Tab") {
      trapDrawerFocus(event);
    }
  });

  function openSyllabus(id, opener) {
    const panel = panels.find((item) => item.dataset.syllabusPanel === id) || panels[0];
    if (!panel || !drawer) return;

    window.clearTimeout(closeTimer);
    activeOpener = opener;

    panels.forEach((item) => {
      const active = item === panel;
      item.hidden = !active;
      item.classList.toggle("is-active", active);
    });

    openers.forEach((item) => {
      item.setAttribute("aria-expanded", String(item === opener));
    });

    drawer.setAttribute("aria-labelledby", panel.querySelector("h2")?.id || "syllabus-drawer-title");
    shell.hidden = false;
    document.body.classList.add("syllabus-open");
    if (scrollArea) {
      scrollArea.scrollTop = 0;
      scrollArea.scrollLeft = 0;
    }

    requestAnimationFrame(() => {
      shell.classList.add("is-open");
      drawer.focus({ preventScroll: true });
    });
  }

  function closeSyllabus() {
    if (shell.hidden) return;

    shell.classList.remove("is-open");
    document.body.classList.remove("syllabus-open");
    openers.forEach((item) => item.setAttribute("aria-expanded", "false"));

    const finishClose = () => {
      shell.hidden = true;
      panels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove("is-active");
      });

      if (activeOpener?.isConnected) {
        activeOpener.focus({ preventScroll: true });
      }
      activeOpener = null;
    };

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(finishClose, reducedMotion.matches ? 0 : 280);
  }

  function trapDrawerFocus(event) {
    const focusable = [...drawer.querySelectorAll(
      "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
    )].filter((element) => !element.hidden && element.offsetParent !== null);

    if (!focusable.length) {
      event.preventDefault();
      drawer.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
