// Generates src/assets/content/research/timber-construction-standards/timber-construction-standards-cover.svg
// Run: node src/assets/content/research/timber-construction-standards/generate-cover.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, chip, write, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "standards-cover";
const W = 1600;
const H = 900;
const b = [];

// The designation, one token per column, with a bracket and a label under each.
const tokens = [
  { text: "DIN", label: "national body", sub: "DE · CH: SN" },
  { text: "EN", label: "European standard", sub: "CEN · harmonised on EU mandate" },
  { text: "ISO", label: "international standard", sub: "ISO / IEC · Geneva" },
  { text: "19650-1", label: "number and part", sub: "information management with BIM" },
];
const widths = [280, 220, 280, 500];
const gap = 40;
const total = widths.reduce((a, w) => a + w, 0) + gap * (tokens.length - 1);
let x = (W - total) / 2;
const baseY = 400;
tokens.forEach((t, i) => {
  const w = widths[i];
  const cx = x + w / 2;
  b.push(`<text x="${cx}" y="${baseY}" text-anchor="middle" fill="${C.ink}" font-size="120" font-weight="700" font-family="${SANS}" letter-spacing="-0.02em">${t.text}</text>`);
  // bracket
  const by = baseY + 50;
  b.push(`<path d="M ${x + 8} ${by} v 18 h ${w - 16} v -18" fill="none" stroke="${C.muted}" stroke-width="2"/>`);
  b.push(`<line x1="${cx}" y1="${by + 18}" x2="${cx}" y2="${by + 40}" stroke="${C.muted}" stroke-width="2"/>`);
  b.push(`<text x="${cx}" y="${by + 78}" text-anchor="middle" fill="${C.ink}" font-size="24" font-weight="600" font-family="${SANS}">${t.label}</text>`);
  b.push(`<text x="${cx}" y="${by + 110}" text-anchor="middle" fill="${C.dim}" font-size="17" font-family="${SANS}">${t.sub}</text>`);
  x += w + gap;
});

// Eyebrow and footer chips
b.push(`<text x="${W / 2}" y="200" text-anchor="middle" fill="${C.dim}" font-size="20" font-family="${MONO}" letter-spacing="0.2em">HOW A STANDARD GETS ITS NAME</text>`);
const chips = ["ISO · GS1", "CEN · EN", "DIN · VDI · DIBt", "SNV · SIA · KBOB · VKF", "CPR 2024 · DPP"];
const cw = chips.map((c) => 28 + c.length * 10.5);
const ctotal = cw.reduce((a, w) => a + w, 0) + 14 * (chips.length - 1);
let cx0 = (W - ctotal) / 2;
chips.forEach((c, i) => {
  b.push(chip(cx0, 700, c));
  cx0 += cw[i] + 14;
});

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "The designation DIN EN ISO 19650-1 broken into its parts: the national body, the European standard, the international standard, and the number and part; below, the bodies covered by the review",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "./timber-construction-standards-cover.svg"), svg);
