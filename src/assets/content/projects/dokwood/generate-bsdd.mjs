// Generates public/assets/content/projects/dokwood/dokwood-bsdd.svg
// A reduced view of the hm/dokwood dictionary for the project page; the full two-plane
// diagram lives on the bSDD research page.
// Run: node src/assets/content/projects/dokwood/generate-bsdd.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, chip, arrow, note, write } from "../../svg-kit.mjs";

const ID = "dokwood-bsdd";
const W = 1600;
const H = 560;
const X0 = 120;
const CW = W - 2 * X0;
const b = [];

// Row 1: the dictionary, three tiles
const r1y = 70;
const r1h = 200;
b.push(frame(X0, r1y, CW, r1h, "bSDD · hm/dokwood · v0.13 · public"));
const colW = (CW - 64 - 2 * 40) / 3;
const cols = [X0 + 32, X0 + 32 + colW + 40, X0 + 32 + 2 * (colW + 40)];
const ty = r1y + 40;
b.push(tile(cols[0], ty, colW, 90, "Classes", "Buildup · Wall · Roof · Slab · Product"));
b.push(tile(cols[1], ty, colW, 90, "Properties", "129 properties in 17 groups"));
b.push(tile(cols[2], ty, colW, 90, "Data templates", "ISO 23387 · one template per class"));
b.push(note(X0 + CW / 2, r1y + 168, "one shared vocabulary, read by the platform and by every interface", { anchor: "middle", size: 15 }));

// Row 2: how a buildup and its products use the templates
const r2y = 340;
const r2h = 150;
b.push(frame(X0, r2y, CW, r2h, "HOW A BUILDUP IS DESCRIBED"));
const tw = (CW - 64 - 160) / 2;
const sx = X0 + 32;
const px = sx + tw + 160;
const sy = r2y + 34;
b.push(tile(sx, sy, tw, 82, "Buildup = System Data Template", "the wall, roof or slab with its ordered layers", { accent: true }));
b.push(tile(px, sy, tw, 82, "Product = Product Data Template", "the board, stud, insulation or cladding in a layer", { accent: true }));
b.push(arrow(ID, sx + tw + 2, sy + 41, px - 2, sy + 41, "HasPart", { labelDy: -14 }));

// template row feeds the buildup row
b.push(arrow(ID, cols[2] + colW / 2, r1y + r1h + 2, cols[2] + colW / 2, r2y - 2, "instantiated as", { labelDx: 90, labelDy: 4 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "The hm/dokwood dictionary on bSDD with its classes, properties and ISO 23387 data templates, and below it a buildup as a System Data Template linked by HasPart to its products as Product Data Templates",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/dokwood/dokwood-bsdd.svg"), svg);
