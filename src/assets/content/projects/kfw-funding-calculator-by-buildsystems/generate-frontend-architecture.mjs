// Generates public/assets/content/projects/kfw-funding-calculator-by-buildsystems/frontend-architecture.svg
// Run: node src/assets/content/projects/kfw-funding-calculator-by-buildsystems/generate-frontend-architecture.mjs
// Redrawn from the original FigJam / Mermaid sketch of the Angular app (routes, five components, shared database).
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, arrow, elbow, write } from "../../svg-kit.mjs";

const ID = "kfw-frontend";
const W = 1600;
const H = 760;
const X0 = 70;
const CW = W - 2 * X0;
const b = [];

// Row 1: routes
const ry = 60;
const rh = 64;
b.push(tile(X0, ry, CW, rh, "Routes"));

// Row 2: five feature components
const fy = 200;
const gap = 20;
const cols = [
  { key: "N", label: "NEUBAU", w: 380 },
  { key: "S", label: "SANIERUNG", w: 380 },
  { key: "PO", label: "PORTFOLIO", w: 220 },
  { key: "PR", label: "PROFILE", w: 200 },
  { key: "SE", label: "SETTINGS", w: 200 },
];
let x = X0;
for (const c of cols) {
  c.x = x;
  c.cx = x + c.w / 2;
  x += c.w + gap;
}
const col = Object.fromEntries(cols.map((c) => [c.key, c]));

// Calculator component (Neubau, Sanierung): forms -> service -> output + save
const calcH = 394;
function calculator(c, formsLabel, saveSide) {
  const ix = c.x + 24;
  const iw = c.w - 48;
  b.push(frame(c.x, fy, c.w, calcH, c.label));
  b.push(tile(ix, fy + 40, iw, 52, formsLabel, null, { size: 18 }));
  b.push(arrow(ID, c.cx, fy + 94, c.cx, fy + 126));
  b.push(tile(ix, fy + 128, iw, 52, "Service", null, { size: 18 }));
  const oy = fy + 216;
  const ow = 212;
  const sw = 96;
  const ox = saveSide === "right" ? ix : ix + iw - ow;
  const sx = saveSide === "right" ? ix + iw - sw : ix;
  b.push(frame(ox, oy, ow, 154, "OUTPUT"));
  b.push(tile(ox + 24, oy + 34, ow - 48, 44, "Dashboard", null, { size: 16 }));
  b.push(tile(ox + 24, oy + 90, ow - 48, 44, "Charts", null, { size: 16 }));
  b.push(tile(sx, oy, sw, 52, "Save", null, { size: 18 }));
  b.push(arrow(ID, ox + ow - 48, fy + 182, ox + ow - 48, oy - 2));
  b.push(arrow(ID, sx + sw / 2, fy + 182, sx + sw / 2, oy - 2));
  return { saveCx: sx + sw / 2, saveBottom: oy + 52 };
}
const n = calculator(col.N, "Neubau forms", "right");
const s = calculator(col.S, "Sanierung forms", "left");

// Portfolio: two lists that load saved projects
const po = col.PO;
const poH = 204;
b.push(frame(po.x, fy, po.w, poH, po.label));
b.push(tile(po.x + 24, fy + 40, po.w - 48, 60, "Neubau list", "load project", { size: 16 }));
b.push(tile(po.x + 24, fy + 120, po.w - 48, 60, "Sanierung list", "load project", { size: 16 }));

// Profile and Settings: leaf actions
const leafH = 164;
for (const [key, a, bLabel] of [
  ["PR", "Change password", "Delete account"],
  ["SE", "Change theme", "Change language"],
]) {
  const c = col[key];
  b.push(frame(c.x, fy, c.w, leafH, c.label));
  b.push(tile(c.x + 24, fy + 40, c.w - 48, 44, a, null, { size: 16 }));
  b.push(tile(c.x + 24, fy + 96, c.w - 48, 44, bLabel, null, { size: 16 }));
}

// Routes -> each component (narrow frames: enter right of the frame label)
for (const c of cols) {
  const ax = c.w >= 300 ? c.cx : c.x + c.w - 40;
  b.push(arrow(ID, ax, ry + rh + 2, ax, fy - 2));
}

// Row 3: shared database, fed by both save actions, read by the portfolio
const dbW = 320;
const dbX = (n.saveCx + s.saveCx) / 2 - dbW / 2;
const dbY = 660;
const dbH = 64;
b.push(tile(dbX, dbY, dbW, dbH, "Database", null, { accent: true }));
b.push(arrow(ID, n.saveCx, n.saveBottom + 2, n.saveCx, dbY - 2, "save"));
b.push(arrow(ID, s.saveCx, s.saveBottom + 2, s.saveCx, dbY - 2, "save"));
b.push(elbow(ID, [[dbX + dbW + 2, dbY + dbH / 2], [po.cx, dbY + dbH / 2], [po.cx, fy + poH + 2]], "load", { labelAt: 1 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "Routes at the top fan out to five Angular components: the Neubau and Sanierung calculators, each with forms feeding a service that drives the output (dashboard and charts) and a save action; the Portfolio with a Neubau list and a Sanierung list; Profile (change password, delete account) and Settings (change theme, change language). Both save actions write to a shared database, from which the Portfolio loads saved projects.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/kfw-funding-calculator-by-buildsystems/frontend-architecture.svg"), svg);
