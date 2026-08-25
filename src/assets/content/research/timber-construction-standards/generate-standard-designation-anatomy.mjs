// Generates src/assets/content/research/timber-construction-standards/standard-designation-anatomy.svg
// Run: node src/assets/content/research/timber-construction-standards/generate-standard-designation-anatomy.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, write, C, SANS } from "../../svg-kit.mjs";

const ID = "standards-cover";
const W = 1600;
const H = 900;
const b = [];

// The designation, one token per column, with a bracket and a label under each.
const tokens = [
  { text: "DIN", label: "national body" },
  { text: "EN", label: "European standard" },
  { text: "ISO", label: "international standard" },
  { text: "19650-1", label: "number and part" },
];
const widths = [280, 220, 280, 500];
const gap = 40;
const total = widths.reduce((a, w) => a + w, 0) + gap * (tokens.length - 1);
let x = (W - total) / 2;
const baseY = 460;
tokens.forEach((t, i) => {
  const w = widths[i];
  const cx = x + w / 2;
  b.push(`<text x="${cx}" y="${baseY}" text-anchor="middle" fill="${C.ink}" font-size="120" font-weight="700" font-family="${SANS}" letter-spacing="-0.02em">${t.text}</text>`);
  // bracket
  const by = baseY + 50;
  b.push(`<path d="M ${x + 8} ${by} v 18 h ${w - 16} v -18" fill="none" stroke="${C.muted}" stroke-width="2"/>`);
  b.push(`<line x1="${cx}" y1="${by + 18}" x2="${cx}" y2="${by + 40}" stroke="${C.muted}" stroke-width="2"/>`);
  b.push(`<text x="${cx}" y="${by + 78}" text-anchor="middle" fill="${C.ink}" font-size="24" font-weight="600" font-family="${SANS}">${t.label}</text>`);
  x += w + gap;
});

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "The designation DIN EN ISO 19650-1 broken into its parts: the national body, the European standard, the international standard, and the number and part",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "./standard-designation-anatomy.svg"), svg);
