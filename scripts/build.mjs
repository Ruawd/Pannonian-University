import { mkdir, rm, writeFile } from "node:fs/promises";
import { pages } from "../src/site-data.mjs";
import { renderNotFound, renderPage, renderSitemap } from "../src/templates.mjs";

const outDir = new URL("../public/", import.meta.url);

await mkdir(outDir, { recursive: true });

for (const legacyFile of ["academics.html", "admissions.html", "campus.html", "contact.html", "curriculum.html", "research.html"]) {
  await rm(new URL(legacyFile, outDir), { force: true });
}

for (const page of pages) {
  const outputUrl = new URL(page.output, outDir);
  await mkdir(new URL("./", outputUrl), { recursive: true });
  await writeFile(outputUrl, renderPage(page, pages), "utf8");
}

await writeFile(new URL("404.html", outDir), renderNotFound(pages), "utf8");
await writeFile(new URL("sitemap.xml", outDir), renderSitemap(pages), "utf8");
await writeFile(new URL("robots.txt", outDir), "User-agent: *\nAllow: /\nSitemap: https://pu.edu.rs/sitemap.xml\n", "utf8");
await writeFile(
  new URL("_headers", outDir),
  `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`,
  "utf8"
);

console.log(`Built ${pages.length + 1} HTML pages into public/`);
