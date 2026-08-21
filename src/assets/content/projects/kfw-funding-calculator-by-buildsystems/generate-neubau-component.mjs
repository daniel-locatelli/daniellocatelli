// Generates public/assets/content/projects/kfw-funding-calculator-by-buildsystems/neubau-component.svg
// Run: node src/assets/content/projects/kfw-funding-calculator-by-buildsystems/generate-neubau-component.mjs
// Inside one calculator (Neubau): two forms feed one service, which drives two outputs and the save option.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, arrow, elbow, write } from "../../svg-kit.mjs";

const ID = "kfw-neubau";
const W = 1600;
const H = 650;
const b = [];

// Row 1: the component
const ncX = 400;
const ncW = 800;
const ncY = 60;
const ncH = 56;
b.push(tile(ncX, ncY, ncW, ncH, "Neubau Component"));

// Row 2: two forms, each a form component with its own service
const fy = 180;
const fh = 64;
const fw = 400;
const forms = [
  { cx: 500, label: "Projekt Form" },
  { cx: 1100, label: "Darlehen Form" },
];
for (const f of forms) {
  b.push(tile(f.cx - fw / 2, fy, fw, fh, f.label, "form component and form service"));
  b.push(arrow(ID, f.cx, ncY + ncH + 2, f.cx, fy - 2));
}

// Row 3: the Neubau service (focal)
const sy = 310;
const sh = 64;
b.push(tile(ncX, sy, ncW, sh, "Neubau Service", null, { accent: true }));
for (const f of forms) b.push(arrow(ID, f.cx, fy + fh + 2, f.cx, sy - 2));

// Row 4: two outputs and the save option
const oy = 450;
const oh = 136;
const ow = 600;
const outputs = [
  { x: 80, label: "OUTPUT PROJEKT", charts: "Gesamtkosten · Gesamtkosten/m² · Einheitskosten", exitX: 480 },
  { x: 920, label: "OUTPUT DARLEHEN", charts: "Annuitäten · Finanzierungskosten · Tilgung", exitX: 1120 },
];
for (const o of outputs) {
  const cx = o.x + ow / 2;
  b.push(frame(o.x, oy, ow, oh, o.label));
  b.push(tile(o.x + 24, oy + 40, 160, 72, "Dashboard", null, { size: 18 }));
  b.push(tile(o.x + 204, oy + 40, ow - 228, 72, "Charts", o.charts, { size: 18 }));
  b.push(elbow(ID, [[o.exitX, sy + sh + 2], [o.exitX, oy - 38], [cx, oy - 38], [cx, oy - 2]]));
}
const svW = 140;
const svX = 800 - svW / 2;
b.push(tile(svX, oy, svW, 56, "Save option", null, { size: 18 }));
b.push(arrow(ID, 800, sy + sh + 2, 800, oy - 2));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "The Neubau component opens two forms, Projekt and Darlehen, each a form component with its own service; both feed the Neubau service, which drives the Projekt output (dashboard plus Gesamtkosten, Gesamtkosten per m² and Einheitskosten charts), the Darlehen output (dashboard plus Annuitäten, Finanzierungskosten and Tilgung charts) and a save option.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/kfw-funding-calculator-by-buildsystems/neubau-component.svg"), svg);
