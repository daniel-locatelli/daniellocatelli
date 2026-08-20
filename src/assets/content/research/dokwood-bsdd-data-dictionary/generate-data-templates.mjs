// Generates public/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg
// Run: node src/assets/content/research/dokwood-bsdd-data-dictionary/generate-data-templates.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, arrow, note, write } from "../../svg-kit.mjs";

const ID = "bsdd-templates";
const W = 1600;
const H = 720;
const b = [];

// Left: composition chain (what a System Data Template contains)
const lx = 100;
const lw = 700;
b.push(frame(lx, 80, lw, 560, "COMPOSITION · ISO 23387 HasPart"));
const tw = 200;
const gap = (lw - 48 - 3 * tw) / 2;
const rowY = 140;
b.push(tile(lx + 24, rowY, tw, 72, "Wall", "IfcWall"));
b.push(tile(lx + 24 + tw + gap, rowY, tw, 72, "Roof", "IfcRoof"));
b.push(tile(lx + 24 + 2 * (tw + gap), rowY, tw, 72, "Slab", "IfcSlab"));
const cx = lx + lw / 2;
b.push(tile(cx - 160, 280, 320, 80, "Buildup", "System Data Template (SDT)", { accent: true }));
for (let i = 0; i < 3; i++) {
  const tx = lx + 24 + i * (tw + gap) + tw / 2;
  b.push(arrow(ID, tx, rowY + 72, cx + (i - 1) * 110, 278, i === 1 ? "is a" : "", { labelDx: 40, labelDy: 0 }));
}
b.push(tile(cx - 160, 420, 320, 72, "Layer", "layer data template, open question"));
b.push(arrow(ID, cx, 360, cx, 418, "HasPart", { labelDx: 70, labelDy: 4 }));
b.push(tile(cx - 160, 540, 320, 72, "Product", "Product Data Template (PDT)", { accent: true }));
b.push(arrow(ID, cx, 492, cx, 538, "HasPart", { labelDx: 70, labelDy: 4 }));

// Right: from template to sheet
const rx = 880;
const rw = 620;
b.push(frame(rx, 80, rw, 560, "FROM TEMPLATE TO SHEET"));
const bw = rw - 48;
const bx = rx + 24;
b.push(tile(bx, 140, bw, 80, "Data template", "which properties describe this object · no values"));
b.push(tile(bx, 290, bw, 80, "Requirement sheet", "required values · Rw ≥ 58 dB, REI 90, U ≤ 0.15"));
b.push(tile(bx, 440, bw, 80, "Data sheet", "declared or measured values · Rw = 59 dB", { accent: true }));
b.push(arrow(ID, rx + rw / 2, 220, rx + rw / 2, 288, "tighten", { labelDx: 60, labelDy: 4 }));
b.push(arrow(ID, rx + rw / 2, 370, rx + rw / 2, 438, "satisfy", { labelDx: 56, labelDy: 4 }));
b.push(note(rx + rw / 2, 570, "generic ⊇ requirement ⊇ value", { anchor: "middle" }));
b.push(note(rx + rw / 2, 600, "a fabricated buildup's data sheet is what the digital product passport carries", { anchor: "middle", size: 14 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Left: Wall, Roof and Slab are kinds of Buildup, a System Data Template composed of layers and products, where a product is a Product Data Template. Right: a data template lists properties, a requirement sheet tightens them to required values, and a data sheet satisfies them with declared values",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg"), svg);
