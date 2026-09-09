#!/usr/bin/env node
/**
 * Rasterise an SVG cover into the `-social.png` twin that og:image needs.
 *
 * Social platforms (WhatsApp, Facebook, LinkedIn, X) ignore an SVG og:image
 * and show no preview card at all, so any content entry whose `Cover:` is an
 * SVG needs a raster sibling next to it, named `<cover>-social.png`. The page
 * routes pick it up automatically (see importSocialImage in blog-helpers).
 *
 * Usage:
 *   node scripts/generate-social-image.mjs src/assets/content/<...>/cover.svg
 */
import { basename } from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 675; // 16:9, matching the og:image:width/height we advertise

const input = process.argv[2];
if (!input || !input.toLowerCase().endsWith(".svg")) {
  console.error("Usage: node scripts/generate-social-image.mjs <cover.svg>");
  process.exit(1);
}

const output = input.replace(/\.svg$/i, "-social.png");

// Render well above the target size first: thin strokes in a large viewBox
// disappear when rasterised straight to 1200px wide.
const oversampled = await sharp(input, { limitInputPixels: false, density: 600 })
  .resize({ width: WIDTH * 4 })
  .png()
  .toBuffer();

await sharp(oversampled)
  .resize(WIDTH, HEIGHT, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(`${basename(output)} written (${WIDTH}x${HEIGHT})`);
