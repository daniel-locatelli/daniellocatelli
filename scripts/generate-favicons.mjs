/**
 * Generate all favicon PNG/ICO files from the source SVG.
 * Uses Sharp (already a project dependency) for SVG→PNG conversion,
 * and manually constructs the ICO file format (PNG-in-ICO).
 *
 * Usage: node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");
const svgPath = resolve(publicDir, "favicon.svg");

// Read the SVG and create a light-mode version (replace CSS variables with static values)
const svgContent = readFileSync(svgPath, "utf-8");

// For rasterization, replace CSS variables with static light-mode colors
// (PNGs can't do prefers-color-scheme, so use the light-mode default)
const staticSvg = svgContent
  .replace(/var\(--theme\)/g, "#000")
  .replace(/var\(--varn\)/g, "#ddd");

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

async function generatePngs() {
  const results = {};
  for (const { name, size } of sizes) {
    const buf = await sharp(Buffer.from(staticSvg), { density: 300 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    writeFileSync(resolve(publicDir, name), buf);
    results[size] = buf;
    console.log(`  ✓ ${name} (${size}x${size}) — ${buf.length} bytes`);
  }
  return results;
}

/**
 * Build a .ico file containing PNG-encoded images.
 * Modern ICO format simply wraps PNG data with a directory header.
 */
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  let dataOffset = headerSize + dirSize;

  // ICO header: reserved (2) + type (2) + count (2)
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: 1 = ICO
  header.writeUInt16LE(count, 4); // image count

  const dirEntries = [];
  const imageDataParts = [];

  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);  // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1);  // height (0 = 256)
    entry.writeUInt8(0, 2);                         // color palette
    entry.writeUInt8(0, 3);                         // reserved
    entry.writeUInt16LE(1, 4);                      // color planes
    entry.writeUInt16LE(32, 6);                     // bits per pixel
    entry.writeUInt32LE(buf.length, 8);             // image data size
    entry.writeUInt32LE(dataOffset, 12);            // offset to image data

    dirEntries.push(entry);
    imageDataParts.push(buf);
    dataOffset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageDataParts]);
}

async function main() {
  console.log("Generating favicons from SVG...\n");

  const pngResults = await generatePngs();

  // Build ICO with 16x16 and 32x32 layers
  const icoBuffer = buildIco([
    { size: 16, buf: pngResults[16] },
    { size: 32, buf: pngResults[32] },
  ]);
  writeFileSync(resolve(publicDir, "favicon.ico"), icoBuffer);
  console.log(`  ✓ favicon.ico (16+32) — ${icoBuffer.length} bytes`);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
