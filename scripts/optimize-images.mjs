import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const imageDir = new URL("../public/assets/img/", import.meta.url);
const images = [
  "academic-studio.jpg",
  "library-commons.jpg",
  "pannonian-campus-hero.jpg",
  "research-data-studio.jpg",
  "research-fieldwork.jpg"
];
const widths = [640, 1120, 1672];

await mkdir(imageDir, { recursive: true });

for (const image of images) {
  const source = new URL(image, imageDir);
  const sourcePath = fileURLToPath(source);
  const stem = image.replace(/\.jpg$/i, "");

  for (const width of widths) {
    const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
    await pipeline.clone().webp({ quality: 76 }).toFile(fileURLToPath(new URL(`${stem}-${width}.webp`, imageDir)));
    await pipeline.clone().avif({ quality: 50 }).toFile(fileURLToPath(new URL(`${stem}-${width}.avif`, imageDir)));
  }
}

console.log(`Generated ${images.length * widths.length * 2} responsive image variants.`);
