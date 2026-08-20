// Generates public/assets/content/research/dokwood-bsdd-data-dictionary/data-sheet-to-dpp.svg
// A 2x PNG export (data-sheet-to-dpp.png) lives next to it, rendered from the SVG with playwright (@playwright/test, viewport 1600x640, deviceScaleFactor 2).
// Run: node src/assets/content/research/dokwood-bsdd-data-dictionary/generate-data-sheet-to-dpp.mjs
// The filled data sheet of a fabricated buildup feeds the digital product passport,
// which wraps those values with an identifier, a document trail, a lifecycle state and a data carrier.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, arrow, write, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "bsdd-data-sheet-to-dpp";
const W = 1600;
const H = 640;
const b = [];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PROPS = [
  ["Sound reduction index", "Rw · dB", "59"],
  ["Fire resistance", "REI · min", "90"],
  ["Thermal transmittance", "U · W/(m²·K)", "0.14"],
  ["Thickness", "d · mm", "392"],
  ["Timber species", "", "spruce"],
];

const DPP = [
  ["Identifier", "urn:dokwood:buildup:aw-01@v0.13", "persistent, resolves to this sheet"],
  ["Property values", "Rw 59 dB → bsdd …/dokwood/0.13/prop/SoundReductionIndex", "every value with its version-pinned bSDD URI"],
  ["Documents", "certificates · datasheets · EPDs", "attached through the Document class"],
  ["Lifecycle", "as-designed → as-built", "the sheet carries its state"],
  ["Data carrier", "QR / RFID on the fabricated item", "scan the wall, get the passport"],
  ["Format", "JSON-LD", "as CIRPASS-2 recommends"],
];

const headH = 96;
const rowH = 62;
const fold = 22;

function paper(x, y, w, h, stroke) {
  return [
    `<path d="M${x + 10} ${y} H${x + w - fold} L${x + w} ${y + fold} V${y + h - 10} a10 10 0 0 1 -10 10 H${x + 10} a10 10 0 0 1 -10 -10 V${y + 10} a10 10 0 0 1 10 -10 Z" fill="${C.box}" stroke="${stroke}" stroke-width="1.5"/>`,
    `<path d="M${x + w - fold} ${y} V${y + fold} H${x + w}" fill="${C.boxSoft}" stroke="${stroke}" stroke-width="1.5"/>`,
  ].join("\n");
}

function header(x, y, w, title, sub) {
  return [
    `<text x="${x + 28}" y="${y + 40}" fill="${C.ink}" font-size="24" font-weight="600" font-family="${SANS}">${esc(title)}</text>`,
    `<text x="${x + 28}" y="${y + 66}" fill="${C.muted}" font-size="15" font-family="${SANS}">${esc(sub)}</text>`,
    `<line x1="${x + 20}" y1="${y + headH - 6}" x2="${x + w - 20}" y2="${y + headH - 6}" stroke="${C.frameStroke}" stroke-width="1.5"/>`,
  ].join("\n");
}

function rule(x, y, w) {
  return `<line x1="${x + 20}" y1="${y}" x2="${x + w - 20}" y2="${y}" stroke="${C.frameStroke}" stroke-width="1"/>`;
}

// Left: the filled data sheet
const dsW = 400;
const dsH = headH + PROPS.length * rowH + 24;
// Right: the passport
const dppW = 820;
const dppH = headH + DPP.length * rowH + 24;
const gap = 140;
const x0 = (W - (dsW + gap + dppW)) / 2;
const dppX = x0 + dsW + gap;
const dppY = (H - dppH) / 2 - 10;
const dsY = dppY + (dppH - dsH) / 2;

// data sheet card
b.push(paper(x0, dsY, dsW, dsH, C.accent));
b.push(header(x0, dsY, dsW, "Data sheet", "declared or measured values"));
PROPS.forEach(([name, meta, v], i) => {
  const ry = dsY + headH + i * rowH;
  const mid = ry + rowH / 2;
  if (i > 0) b.push(rule(x0, ry, dsW));
  b.push(`<text x="${x0 + 28}" y="${mid - 4}" fill="${C.ink}" font-size="16" font-family="${SANS}">${esc(name)}</text>`);
  if (meta) b.push(`<text x="${x0 + 28}" y="${mid + 16}" fill="${C.dim}" font-size="13" font-family="${MONO}">${esc(meta)}</text>`);
  b.push(`<text x="${x0 + dsW - 28}" y="${mid + 6}" text-anchor="end" fill="${C.accent}" font-size="18" font-weight="600" font-family="${MONO}">${esc(v)}</text>`);
});
b.push(`<text x="${x0 + dsW / 2}" y="${dsY + dsH + 30}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}">fabricated buildup · one sheet per instance</text>`);

// passport card
b.push(paper(dppX, dppY, dppW, dppH, C.accent));
b.push(header(dppX, dppY, dppW, "Digital Product Passport", "EU CPR 2024 / ESPR · mandatory for construction products from about 2028"));
DPP.forEach(([label, value, hint], i) => {
  const ry = dppY + headH + i * rowH;
  const mid = ry + rowH / 2;
  if (i > 0) b.push(rule(dppX, ry, dppW));
  b.push(`<text x="${dppX + 28}" y="${mid + 6}" fill="${C.ink}" font-size="16" font-family="${SANS}">${esc(label)}</text>`);
  b.push(`<text x="${dppX + 200}" y="${mid - 4}" fill="${C.accent}" font-size="15" font-weight="600" font-family="${MONO}">${esc(value)}</text>`);
  b.push(`<text x="${dppX + 200}" y="${mid + 16}" fill="${C.dim}" font-size="13" font-family="${SANS}">${esc(hint)}</text>`);
});
// a small QR-like glyph next to the data carrier row
{
  const i = DPP.findIndex(([l]) => l === "Data carrier");
  const mid = dppY + headH + i * rowH + rowH / 2;
  const rows = [
    "111111101011",
    "100000100110",
    "101110101001",
    "101110110101",
    "101110100011",
    "100000101100",
    "111111101010",
    "000000001101",
    "110101110011",
    "011010100110",
    "100101011101",
    "001110110010",
  ];
  const n = rows.length, cell = 4;
  const qx = dppX + dppW - 28 - n * cell, qy = mid - (n * cell) / 2;
  rows.forEach((row, y) => {
    row.split("").forEach((c, x) => {
      if (c === "1") b.push(`<rect x="${qx + x * cell}" y="${qy + y * cell}" width="${cell}" height="${cell}" fill="${C.muted}"/>`);
    });
  });
}
b.push(`<text x="${dppX + dppW / 2}" y="${dppY + dppH + 30}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}">the sheet, wrapped so anyone can find, trust and read it</text>`);

// feeds arrow at the data sheet's mid height
const ay = dsY + headH + (PROPS.length * rowH) / 2;
b.push(arrow(ID, x0 + dsW + 10, ay, dppX - 12, ay, "feeds", { labelDy: -14 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "A filled data sheet of a fabricated buildup, with values such as Rw 59 dB and REI 90, feeds a digital product passport card listing what the passport adds around those values: a persistent identifier, property values with version-pinned bSDD URIs, a document trail of certificates, datasheets and EPDs, a lifecycle state from as-designed to as-built, a data carrier on the fabricated item, and a JSON-LD format",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/research/dokwood-bsdd-data-dictionary/data-sheet-to-dpp.svg"), svg);
