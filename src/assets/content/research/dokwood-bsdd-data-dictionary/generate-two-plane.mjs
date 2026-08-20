// Generates src/assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg (page cover)
// Run: node src/assets/content/research/dokwood-bsdd-data-dictionary/generate-two-plane.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, chip, arrow, note, write } from "../../svg-kit.mjs";

const ID = "bsdd-two-plane";
const W = 1600;
const H = 900;
const X0 = 80;
const CW = W - 2 * X0;
const b = [];

// Plane 1: bSDD (public)
const p1y = 80;
const p1h = 300;
b.push(frame(X0, p1y, CW, p1h, "PLANE 1 · bSDD hm/dokwood (public)"));
const colW = (CW - 48 - 2 * 60) / 3;
const cols = [X0 + 24, X0 + 24 + colW + 60, X0 + 24 + 2 * (colW + 60)];
const ty = p1y + 50;
b.push(tile(cols[0], ty, colW, 90, "Classes", "Buildup · Wall · Roof · Slab · Product"));
b.push(tile(cols[1], ty, colW, 90, "Properties", "129 properties in 17 groups (v0.13)"));
b.push(tile(cols[2], ty, colW, 90, "Generic data templates", "System Data Template · Product Data Template"));
b.push(arrow(ID, cols[1] + colW, ty + 45, cols[2] - 2, ty + 45, "compose", { labelDy: -12 }));
b.push(arrow(ID, cols[1] - 2, ty + 45, cols[0] + colW, ty + 45, "", { dashed: true }));
b.push(note(cols[0] + colW / 2, ty + 45 + 60 + 6, "", { anchor: "middle" }));
// ISO chips under each column
const chipRow = ty + 120;
b.push(chip(cols[0] + colW / 2 - 150, chipRow, "ISO 12006-3 · data model", { w: 300 }));
b.push(chip(cols[1] + colW / 2 - 150, chipRow, "ISO 23386 · properties", { w: 300 }));
b.push(chip(cols[2] + colW / 2 - 150, chipRow, "ISO 23387 · templates", { w: 300 }));
b.push(note(X0 + CW / 2, p1y + 215 + 10, "a template is bound to the class it describes (HasObjectType) · classes are anchored to IFC entities", { anchor: "middle" }));
b.push(note(X0 + CW / 2, p1y + 245 + 10, "versioned v0.1 to v0.13 · Excel authoring · bSDD JSON import model · published at identifier.buildingsmart.org/uri/hm/dokwood", { anchor: "middle", size: 14 }));

// Plane 2: DOKwood platform
const p2y = 470;
const p2h = 370;
b.push(frame(X0, p2y, CW, p2h, "PLANE 2 · DOKwood platform"));
const fw = (CW - 48 - 40) / 2;
const f1x = X0 + 24;
const f2x = f1x + fw + 40;
const fy = p2y + 50;
const fh = 160;
b.push(frame(f1x, fy, fw, fh, "TENANT DATA DICTIONARY"));
b.push(frame(f2x, fy, fw, fh, "PROJECT STORE"));
const half = (fw - 48 - 40) / 2;
const r = fy + 40;
b.push(tile(f1x + 24, r, half, 90, "Tenant SDT", "e.g. external wall, Schärholzbau"));
b.push(tile(f1x + 24 + half + 40, r, half, 90, "Requirement template", "Rw ≥ 56 dB"));
b.push(tile(f2x + 24, r, half, 90, "Requirement sheet", "Rw ≥ 58 dB"));
b.push(tile(f2x + 24 + half + 40, r, half, 90, "Data sheet", "Rw = 59 dB, declared", { accent: true }));
b.push(arrow(ID, f1x + 24 + half, r + 45, f1x + 24 + half + 38, r + 45, "tighten", { labelDy: -12 }));
b.push(arrow(ID, f1x + fw, r + 45, f2x + 22, r + 45, "tighten", { labelDy: -12 }));
b.push(arrow(ID, f2x + 24 + half, r + 45, f2x + 24 + half + 38, r + 45, "satisfy", { labelDy: -12 }));

// DPP below the data sheet
const dppX = f2x + 24 + half + 40;
const dppY = p2y + 260;
b.push(tile(dppX, dppY, half, 90, "Digital Product Passport", "JSON-LD · persistent identifier · data carrier", { accent: true }));
b.push(arrow(ID, dppX + half / 2, r + 90, dppX + half / 2, dppY - 2, "becomes", { labelDx: 60, labelDy: 4 }));
b.push(chip(f1x + 24, dppY + 28, "EU CPR 2024 / ESPR · DPP mandatory from about 2028", { w: 470 }));
b.push(note(f1x + 24 + 500, dppY + 50, "nesting rule: generic ⊇ requirement ⊇ value", { size: 15 }));

// specialise arrow from generic templates down to tenant SDT
b.push(arrow(ID, cols[2] + colW / 2, p1y + p1h, f1x + 24 + half / 2, r - 2, "specialise (IsChildOf)", { labelDx: 160, labelDy: -14 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Two planes: the public bSDD dictionary with classes, properties and generic data templates above, and the DOKwood platform below, where tenants specialise templates into requirement templates, projects fill requirement and data sheets, and the data sheet becomes the digital product passport",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "./iso-23387-two-plane.svg"), svg);
