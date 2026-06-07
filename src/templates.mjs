import { site } from "./site-data.mjs";

const baseUrl = `https://${site.domain}`;
const assetVersion = "20260607-filterfix";

export function renderPage(page, pages) {
  const canonicalPath = page.href || "/";
  const canonical = `${baseUrl}${canonicalPath}`;
  const heroPreload = page.id === "home" ? "\n  <link rel=\"preload\" href=\"/assets/img/pannonian-campus-hero.jpg\" as=\"image\">" : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${baseUrl}/assets/img/pannonian-campus-hero.jpg">
  <meta name="theme-color" content="#8f3a2f">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  ${heroPreload}
  <link rel="stylesheet" href="/assets/css/styles.css?v=${assetVersion}">
  <script type="module" src="/assets/js/app.js?v=${assetVersion}"></script>
</head>
<body data-page="${page.id}">
  <a class="skip-link" href="#main">Skip to main content</a>
  ${renderHeader(page)}
  <main id="main" tabindex="-1">
    ${page.body}
  </main>
  ${renderFooter(pages)}
</body>
</html>`;
}

function renderHeader(page) {
  const links = site.nav.map((item) => {
    const active = page.href === item.href ? " aria-current=\"page\"" : "";
    return `<a href="${item.href}" data-nav-link${active}>${item.label}</a>`;
  }).join("");

  return `<header class="site-header" data-site-header>
    <div class="container nav-shell">
      <a class="brand" href="/" aria-label="${site.name} home">
        <img src="/assets/img/pannonian-mark.svg" width="44" height="44" alt="" aria-hidden="true">
        <span>
          <strong>${site.name}</strong>
          <small>${site.domain}</small>
        </span>
      </a>
      <nav class="desktop-nav" aria-label="Primary navigation">
        <span class="nav-indicator" aria-hidden="true"></span>
        ${links}
      </nav>
      <button class="icon-button menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle data-ripple>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16"></path>
        </svg>
      </button>
    </div>
    <nav id="mobile-menu" class="mobile-nav" aria-label="Mobile navigation" hidden>
      <a href="/" data-nav-link${page.id === "home" ? " aria-current=\"page\"" : ""}>Home</a>
      ${links}
    </nav>
  </header>`;
}

function renderFooter(pages) {
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-about">
        <a class="footer-brand" href="/">
          <img src="/assets/img/pannonian-mark.svg" width="40" height="40" alt="" aria-hidden="true">
          <span>${site.name}</span>
        </a>
        <p>Scientia per campos, civitas per flumina.</p>
        <div class="social-links" aria-label="Pannonian University social media">
          ${renderSocialIcon("Facebook", "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4h-4V7a1 1 0 0 1 1-1h3V2Z")}
          ${renderSocialIcon("LinkedIn", "M6.5 8.5H3V21h3.5V8.5ZM4.8 3A2 2 0 1 0 4.8 7 2 2 0 0 0 4.8 3Zm6.2 5.5H7.6V21H11v-6.5c0-1.7.8-2.7 2.2-2.7 1.3 0 1.9.9 1.9 2.6V21h3.5v-7.1c0-3.8-2-5.7-4.7-5.7-1.7 0-2.5.9-2.9 1.6V8.5Z")}
          ${renderSocialIcon("Instagram", "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 2.2a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Zm5.1-2.7a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z")}
          ${renderSocialIcon("YouTube", "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10 15.2V8.9l5.7 3.2-5.7 3.1Z")}
          ${renderSocialIcon("X", "M17.6 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.2L5.1 21H2l7.3-8.4L1.7 3h6.4l4.4 5.6L17.6 3Zm-1.1 16.2h1.7L7.2 4.7H5.4l11.1 14.5Z")}
        </div>
      </div>
      <div>
        <h2>Admissions</h2>
        <nav aria-label="Footer admissions links">
          <a href="/admissions/">Undergraduate entry</a>
          <a href="/admissions/">Graduate entry</a>
          <a href="/admissions/">International applicants</a>
          <a href="/admissions/">Scholarships</a>
          <a href="mailto:${site.emails.admissions}">Ask admissions</a>
        </nav>
      </div>
      <div>
        <h2>Academics</h2>
        <nav aria-label="Footer academic links">
          <a href="/curriculum/">Course Catalog</a>
          <a href="/academics/">Faculties</a>
          <a href="/admissions/">Academic Calendar</a>
          <a href="/campus/">Library Commons</a>
          <a href="/campus/">Student support</a>
        </nav>
      </div>
      <div>
        <h2>Research &amp; Region</h2>
        <nav aria-label="Footer research links">
          <a href="/research/">Danube Water Futures</a>
          <a href="/research/">Climate-Smart Agriculture</a>
          <a href="/research/">Open Data Studio</a>
          <a href="/research/">Field Stations</a>
          <a href="/contact/">Partner with PU</a>
        </nav>
      </div>
      <div>
        <h2>Contact</h2>
        <p>${site.address}</p>
        <p>+381 21 555 0198</p>
        <p><a href="mailto:${site.emails.general}">${site.emails.general}</a></p>
        <p>Media: <a href="mailto:press@${site.domain}">press@${site.domain}</a></p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${site.name}</span>
      <nav aria-label="Footer legal links">
        <a href="/">Privacy Policy</a>
        <a href="/">Accessibility</a>
        <a href="/sitemap.xml">Sitemap</a>
      </nav>
    </div>
  </footer>`;
}

function renderSocialIcon(label, path) {
  return `<a href="/" aria-label="${label}">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="${path}"></path>
    </svg>
  </a>`;
}

export function renderNotFound(pages) {
  const page = {
    id: "not-found",
    href: "/404/",
    output: "404.html",
    title: "Page not found | Pannonian University",
    description: "The requested Pannonian University page could not be found.",
    body: `
      <section class="page-masthead">
        <div class="container">
          <p class="eyebrow">404</p>
          <h1>This page is not on the timetable.</h1>
          <p>Use the navigation above or return to the homepage.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/" data-ripple>Return home</a>
            <a class="button button-light" href="/contact/" data-ripple>Contact PU</a>
          </div>
        </div>
      </section>
    `
  };

  return renderPage(page, pages);
}

export function renderSitemap(pages) {
  const urls = pages.map((page) => {
    return `  <url><loc>${baseUrl}${page.href}</loc></url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
