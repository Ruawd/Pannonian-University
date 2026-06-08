import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const imageDir = new URL("../public/assets/img/", import.meta.url);
const images = [
  { file: "academic-studio.jpg", widths: [640, 1120, 1672] },
  { file: "library-commons.jpg", widths: [640, 1120, 1672] },
  { file: "pannonian-campus-hero.jpg", widths: [640, 1120, 1672] },
  { file: "research-data-studio.jpg", widths: [640, 1120, 1672] },
  { file: "research-fieldwork.jpg", widths: [640, 1120, 1672] },
  { file: "huang-yu-fei-portrait.jpg", widths: [360, 720, 960] }
];

await mkdir(imageDir, { recursive: true });

let generated = 0;

for (const { file, widths } of images) {
  const source = new URL(file, imageDir);
  const sourcePath = fileURLToPath(source);
  const stem = file.replace(/\.jpg$/i, "");

  for (const width of widths) {
    const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
    await pipeline.clone().webp({ quality: 76 }).toFile(fileURLToPath(new URL(`${stem}-${width}.webp`, imageDir)));
    await pipeline.clone().avif({ quality: 50 }).toFile(fileURLToPath(new URL(`${stem}-${width}.avif`, imageDir)));
    generated += 2;
  }
}

console.log(`Generated ${generated} responsive image variants.`);
