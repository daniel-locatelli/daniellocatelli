// Generates public/assets/content/research/dokwood-bsdd-data-dictionary/template-to-sheet.svg
// A 2x PNG export (template-to-sheet.png) lives next to it, rendered from the SVG with playwright (@playwright/test, viewport 1600x600, deviceScaleFactor 2).
// Run: node src/assets/content/research/dokwood-bsdd-data-dictionary/generate-template-to-sheet.mjs
// Three document cards with the same properties: the data template (no values), the
// requirement sheet (required values) and the data sheet (declared or measured values).
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, arrow, write, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "bsdd-template-to-sheet";
const W = 1600;
const H = 600;
const b = [];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PROPS = [
  ["Sound reduction index", "Rw", "dB"],
  ["Fire resistance", "REI", "min"],
  ["Thermal transmittance", "U", "W/(m²·K)"],
  ["Thickness", "d", "mm"],
  ["Timber species", "", ""],
];

const COLS = [
  {
    title: "Data template",
    sub: "which properties · no values",
    who: "company dictionary",
    values: ["", "", "", "", ""],
    style: "blank",
  },
  {
    title: "Requirement sheet",
    sub: "required values",
    who: "project, before fabrication",
    values: ["≥ 56", "≥ 90", "≤ 0.15", "≤ 400", "spruce or fir"],
    style: "req",
  },
  {
    title: "Data sheet",
    sub: "declared or measured values",
    who: "project, fabricated buildup → DPP",
    values: ["59", "90", "0.14", "392", "spruce"],
    style: "val",
    accent: true,
  },
];

const cardW = 400;
const gap = 130;
const totalW = 3 * cardW + 2 * gap;
const x0 = (W - totalW) / 2;
const cardY = 80;
const headH = 96;
const rowH = 62;
const cardH = headH + PROPS.length * rowH + 24;

// Card "paper": a sheet with a folded corner
function card(x, y, w, h, col) {
  const stroke = col.accent ? C.accent : C.ink;
  const fold = 22;
  const out = [];
  out.push(
    `<path d="M${x + 10} ${y} H${x + w - fold} L${x + w} ${y + fold} V${y + h - 10} a10 10 0 0 1 -10 10 H${x + 10} a10 10 0 0 1 -10 -10 V${y + 10} a10 10 0 0 1 10 -10 Z" fill="${C.box}" stroke="${stroke}" stroke-width="1.5"/>`,
  );
  out.push(`<path d="M${x + w - fold} ${y} V${y + fold} H${x + w}" fill="${C.boxSoft}" stroke="${stroke}" stroke-width="1.5"/>`);
  // header
  out.push(`<text x="${x + 28}" y="${y + 40}" fill="${C.ink}" font-size="24" font-weight="600" font-family="${SANS}">${esc(col.title)}</text>`);
  out.push(`<text x="${x + 28}" y="${y + 66}" fill="${C.muted}" font-size="15" font-family="${SANS}">${esc(col.sub)}</text>`);
  out.push(`<line x1="${x + 20}" y1="${y + headH - 6}" x2="${x + w - 20}" y2="${y + headH - 6}" stroke="${C.frameStroke}" stroke-width="1.5"/>`);
  // rows
  PROPS.forEach(([name, sym, unit], i) => {
    const ry = y + headH + i * rowH;
    const mid = ry + rowH / 2;
    if (i > 0) out.push(`<line x1="${x + 20}" y1="${ry}" x2="${x + w - 20}" y2="${ry}" stroke="${C.frameStroke}" stroke-width="1"/>`);
    out.push(`<text x="${x + 28}" y="${mid - 4}" fill="${C.ink}" font-size="16" font-family="${SANS}">${esc(name)}</text>`);
    const meta = [sym, unit].filter(Boolean).join(" · ");
    if (meta) out.push(`<text x="${x + 28}" y="${mid + 16}" fill="${C.dim}" font-size="13" font-family="${MONO}">${esc(meta)}</text>`);
    const v = col.values[i];
    const vx = x + w - 28;
    if (col.style === "blank") {
      out.push(`<rect x="${vx - 96}" y="${mid - 12}" width="96" height="24" rx="4" fill="${C.boxSoft}" stroke="${C.frameStroke}" stroke-width="1" stroke-dasharray="4 4"/>`);
    } else {
      const color = col.style === "val" ? C.accent : C.ink;
      out.push(`<text x="${vx}" y="${mid + 6}" text-anchor="end" fill="${color}" font-size="18" font-weight="600" font-family="${MONO}">${esc(v)}</text>`);
    }
  });
  // footer: who fills it
  out.push(`<text x="${x + w / 2}" y="${y + h + 30}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}">${esc(col.who)}</text>`);
  return out.join("\n");
}

COLS.forEach((col, i) => {
  const x = x0 + i * (cardW + gap);
  b.push(card(x, cardY, cardW, cardH, col));
});

// arrows between cards, at mid height of the rows block
const ay = cardY + headH + (PROPS.length * rowH) / 2;
for (let i = 0; i < 2; i++) {
  const x1 = x0 + i * (cardW + gap) + cardW + 10;
  const x2 = x1 + gap - 22;
  b.push(arrow(ID, x1, ay, x2, ay, i === 0 ? "tighten" : "satisfy", { labelDy: -14 }));
}


const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Three sheets listing the same five properties: a data template with empty value fields, a requirement sheet with required values such as Rw at least 56 dB and REI at least 90, and a data sheet with declared values such as Rw 59 dB and REI 90; arrows labelled tighten and satisfy connect them",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/research/dokwood-bsdd-data-dictionary/template-to-sheet.svg"), svg);
