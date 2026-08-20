// Generates public/assets/content/projects/dokwood/dokwood-bsdd.svg
// The two levels of data dictionaries in DOKwood: the public bSDD dictionary above, and the
// private dictionary of each tenant below, forked from it or started from a clean slate.
// Run: node src/assets/content/projects/dokwood/generate-bsdd.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, arrow, note, write, C, MONO } from "../../svg-kit.mjs";

const ID = "dokwood-bsdd";
const W = 1600;
const H = 800;
const X0 = 120;
const CW = W - 2 * X0;
const b = [];

// Row 1: the public dictionary
const r1y = 70;
const r1h = 170;
b.push(frame(X0, r1y, CW, r1h, "PUBLIC"));
b.push(tile(X0 + 32, r1y + 36, CW - 64, 84, "DOKwood dictionary · hm/dokwood", "generic, high-level vocabulary for timber buildups: classes · 129 properties · ISO 23387 data templates", { accent: true }));
b.push(note(X0 + CW / 2, r1y + 150, "anyone can read it and reference it", { anchor: "middle", size: 15 }));

// Row 2: the tenants inside the platform
const r2y = 360;
const r2h = 230;
b.push(frame(X0, r2y, CW, r2h, "PRIVATE"));
const gap = 40;
const tw = (CW - 64 - 2 * gap) / 3;
const tx = [X0 + 32, X0 + 32 + tw + gap, X0 + 32 + 2 * (tw + gap)];
const ty = r2y + 40;
const th = 100;
b.push(tile(tx[0], ty, tw, th, "Tenant A dictionary", "forked from hm/dokwood, then specialised"));
b.push(tile(tx[1], ty, tw, th, "Tenant B dictionary", "forked from hm/dokwood, then specialised"));
b.push(tile(tx[2], ty, tw, th, "Tenant C dictionary", "clean slate, its own vocabulary", { soft: true }));

// fork arrows: public dictionary -> tenants A and B
for (const i of [0, 1]) {
  const cx = tx[i] + tw / 2;
  b.push(arrow(ID, cx, r1y + r1h + 2, cx, ty - 2, "fork as base", { labelDx: 0, labelDy: 4 }));
}
// tenant C: no fork, optional reference only
{
  const cx = tx[2] + tw / 2;
  b.push(arrow(ID, cx, r1y + r1h + 2, cx, ty - 2, "may reference", { dashed: true, labelDx: 0, labelDy: 4 }));
}

// opened and interlinked: A <-> B
{
  const y = ty + th + 0;
  const x1 = tx[0] + tw - 40;
  const x2 = tx[1] + 40;
  const ly = y + 40;
  // a short bracket below A and B
  b.push(`<path d="M ${x1} ${y + 2} V ${ly} H ${x2} V ${y + 2}" fill="none" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="6 6"/>`);
  b.push(`<text x="${(x1 + x2) / 2}" y="${ly + 20}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}" letter-spacing="0.08em">optional: open and interlink</text>`);
}

// Row 3: the interfaces read through the dictionary layer
const r3y = r2y + r2h + 80;
const r3h = 120;
b.push(frame(X0, r3y, CW, r3h, "INTERFACES"));
b.push(tile(X0 + 32, r3y + 30, CW - 64, 64, "Revit add-in · Cadwork plugin · MCP server", "all read through the dictionary layer, which is what makes them interoperable", { soft: true }));
b.push(arrow(ID, X0 + CW / 2, r3y - 2, X0 + CW / 2, r2y + r2h + 2, "", {}));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Two levels of data dictionaries: the public hm/dokwood dictionary on bSDD above, and below it the private dictionary of each tenant, forked from the public one and specialised, or started from a clean slate; tenants can optionally open and interlink their dictionaries, and an interfaces box at the bottom: the Revit add-in, Cadwork plugin and MCP server all read through this dictionary layer",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/dokwood/dokwood-bsdd.svg"), svg);
