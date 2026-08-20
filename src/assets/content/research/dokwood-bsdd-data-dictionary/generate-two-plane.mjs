// Generates src/assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg (page cover)
// Run: node src/assets/content/research/dokwood-bsdd-data-dictionary/generate-two-plane.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, chip, arrow, write } from "../../svg-kit.mjs";

const ID = "bsdd-two-plane";
const W = 1600;
const H = 860;
const X0 = 80;
const CW = W - 2 * X0;
const b = [];

// Plane 1: bSDD (public). Data Templates sit in the left column, directly above
// the company template in Plane 2, so the "specialise" arrow runs straight down.
const p1y = 80;
const p1h = 240;
b.push(frame(X0, p1y, CW, p1h, "Public DOKwood bSDD"));
const colW = (CW - 48 - 2 * 60) / 3;
const cols = [X0 + 24, X0 + 24 + colW + 60, X0 + 24 + 2 * (colW + 60)];
const ty = p1y + 50;
b.push(tile(cols[0], ty, colW, 90, "Data Templates", "System Data Template · Product Data Template"));
b.push(tile(cols[1], ty, colW, 90, "Properties", "129 properties in 17 groups (v0.13)"));
b.push(tile(cols[2], ty, colW, 90, "Classes", "Buildup · Wall · Roof · Slab · Product"));
b.push(arrow(ID, cols[1] - 2, ty + 45, cols[0] + colW, ty + 45, "compose", { labelDy: -12 }));
b.push(arrow(ID, cols[1] + colW, ty + 45, cols[2] - 2, ty + 45, "", { dashed: true }));
// ISO chips under each column
const chipRow = ty + 120;
b.push(chip(cols[0] + colW / 2 - 150, chipRow, "ISO 23387 · templates", { w: 300 }));
b.push(chip(cols[1] + colW / 2 - 150, chipRow, "ISO 23386 · properties", { w: 300 }));
b.push(chip(cols[2] + colW / 2 - 150, chipRow, "ISO 12006-3 · data model", { w: 300 }));

// Plane 2: DOKwood platform
const p2y = 400;
const p2h = 400;
// specialise arrow from Data Templates straight down to the company template.
// Drawn before the Plane 2 frames so their title chips sit on top of the line;
// the label lives in the gap between the planes.
const sx = X0 + 24 + 24 + ((CW - 48 - 40) / 2 - 48 - 40) / 2 - 30; // near the right edge of the Company template tile, clear of the frame titles
const sy1 = p1y + p1h;
const sy2 = p2y + 50 + 40 - 2; // top of the company template tile
b.push(arrow(ID, sx, sy1, sx, sy2, "specialise (IsChildOf)", { labelDx: 0, labelDy: (p1y + p1h + p2y) / 2 - (sy1 + sy2) / 2 }));
b.push(frame(X0, p2y, CW, p2h, "DOKwood platform"));
const fw = (CW - 48 - 40) / 2;
const f1x = X0 + 24;
const f2x = f1x + fw + 40;
const fy = p2y + 50;
const fh = 160;
b.push(frame(f1x, fy, fw, fh, "COMPANY DICTIONARY"));
b.push(frame(f2x, fy, fw, fh, "PROJECT STORE"));
const half = (fw - 48 - 40) / 2;
const r = fy + 40;
b.push(tile(f1x + 24, r, half, 90, "Company template", "e.g. Schärholzbau external wall"));
b.push(tile(f1x + 24 + half + 40, r, half, 90, "Requirement template", "Rw ≥ 56 dB"));
b.push(tile(f2x + 24, r, half, 90, "Requirement sheet", "Rw ≥ 58 dB"));
b.push(tile(f2x + 24 + half + 40, r, half, 90, "Data sheet", "Rw = 59 dB, declared", { accent: true }));
b.push(arrow(ID, f1x + 24 + half, r + 45, f1x + 24 + half + 38, r + 45, "tighten", { labelDy: -12 }));
b.push(arrow(ID, f1x + 24 + 2 * half + 40, r + 45, f2x + 22, r + 45, "tighten", { labelDy: -12 })); // Requirement template → Requirement sheet
b.push(arrow(ID, f2x + 24 + half, r + 45, f2x + 24 + half + 38, r + 45, "satisfy", { labelDy: -12 }));

// DPP band: full-width strip below both frames; the data sheet feeds it
const dppX = f1x;
const dppW = f2x + fw - f1x;
const dppY = p2y + 280;
b.push(tile(dppX, dppY, dppW, 90, "Digital Product Passport", "JSON-LD · persistent identifier · data carrier  |  EU CPR 2024 / ESPR, mandatory from about 2028", { accent: true }));
const dsx = f2x + 24 + half + 40 + half / 2; // centre of the Data sheet tile
b.push(arrow(ID, dsx, r + 90, dsx, dppY - 2, "feeds", { labelDx: 50, labelDy: 4 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Two planes: the public bSDD dictionary with data templates, properties and classes above, and the DOKwood platform below, where each company specialises templates into requirement templates, projects fill requirement and data sheets, and the data sheet feeds the digital product passport",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "./iso-23387-two-plane.svg"), svg);
