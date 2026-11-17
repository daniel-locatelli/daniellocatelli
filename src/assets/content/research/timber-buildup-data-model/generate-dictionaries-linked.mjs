// Generates public/assets/content/research/timber-buildup-data-model/dictionaries-linked.svg
// Run: node src/assets/content/research/timber-buildup-data-model/generate-dictionaries-linked.mjs
// Two data dictionaries side by side, each with its own entries for the European and the
// German fire resistance class. Within a dictionary the two stay apart; across dictionaries
// each entry links to its twin with "is equal to". Addresses and relations are the live
// bSDD records of hm/dokwood 0.13 and ETIM 10.1.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, arrow, write, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "bsdd-dictionaries-linked";
const W = 1600;
const H = 540;
const b = [];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const DICTS = [
  {
    title: "This article's dictionary",
    sub: "hm/dokwood · timber buildups",
    entries: [
      ["Fire Resistance EN 13501-2", ".../hm/dokwood/0.13/prop/FireResistanceEN13501-2", "REI 90"],
      ["Fire Resistance DIN 4102-2", ".../hm/dokwood/0.13/prop/FireResistanceDIN4102-2", "F90"],
    ],
    accent: true,
  },
  {
    title: "ETIM",
    sub: "manufacturers and wholesalers · products",
    entries: [
      ["Fire resistance class according to EN 13501-2", ".../etim/etim/10.1/prop/EF025876", ""],
      ["Fire resistance class according to DIN 4102-2", ".../etim/etim/10.1/prop/EFDE0021", ""],
    ],
  },
];

const frameW = 620;
const gap = 200;
const x0 = (W - 2 * frameW - gap) / 2;
const frameY = 30;
const frameH = 470;
const entryX = 30;
const entryW = frameW - 2 * entryX;
const entryH = 112;
const entryYs = [frameY + 120, frameY + 300];

DICTS.forEach((d, i) => {
  const x = x0 + i * (frameW + gap);
  b.push(
    `<rect x="${x}" y="${frameY}" width="${frameW}" height="${frameH}" rx="16" fill="${C.frameFill}" stroke="${d.accent ? C.accent : C.frameStroke}" stroke-width="1.5"/>`,
  );
  b.push(`<text x="${x + 30}" y="${frameY + 50}" fill="${C.ink}" font-size="24" font-weight="600" font-family="${SANS}">${esc(d.title)}</text>`);
  b.push(`<text x="${x + 30}" y="${frameY + 78}" fill="${C.muted}" font-size="15" font-family="${MONO}">${esc(d.sub)}</text>`);
  d.entries.forEach(([name, addr, example], j) => {
    const ex = x + entryX;
    const ey = entryYs[j];
    b.push(`<rect x="${ex}" y="${ey}" width="${entryW}" height="${entryH}" rx="10" fill="${C.box}" stroke="${C.ink}" stroke-width="1.5"/>`);
    b.push(`<text x="${ex + 22}" y="${ey + 42}" fill="${C.ink}" font-size="19" font-weight="600" font-family="${SANS}">${esc(name)}</text>`);
    b.push(`<text x="${ex + 22}" y="${ey + 78}" fill="${C.dim}" font-size="14" font-family="${MONO}">${esc(addr)}</text>`);
    if (example) {
      b.push(`<text x="${ex + entryW - 22}" y="${ey + 42}" text-anchor="end" fill="${C.accent}" font-size="20" font-weight="600" font-family="${MONO}">${esc(example)}</text>`);
    }
  });
  if (i === 0) {
    const my = (entryYs[0] + entryH + entryYs[1]) / 2 + 6;
    b.push(`<text x="${x + frameW / 2}" y="${my}" text-anchor="middle" fill="${C.dim}" font-size="15" font-family="${SANS}">kept apart: the two fire tests differ</text>`);
  }
});

// "is equal to" links between the twin entries
entryYs.forEach((ey) => {
  const y = ey + entryH / 2;
  const x1 = x0 + entryX + entryW + 8;
  const x2 = x0 + frameW + gap + entryX - 10;
  b.push(arrow(ID, x1, y, x2, y, "is equal to", { labelDy: -14 }));
});

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "Two data dictionaries side by side. This article's dictionary, hm/dokwood, has one entry for the European fire resistance class EN 13501-2, with the example value REI 90, and a separate entry for the German class DIN 4102-2, with the example value F90; the two are kept apart because the fire tests differ. The ETIM dictionary, used by manufacturers and wholesalers, has its own entries for the same two classes. Each entry has its own web address, and an arrow labelled is equal to links each hm/dokwood entry to its ETIM twin.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/research/timber-buildup-data-model/dictionaries-linked.svg"), svg);
