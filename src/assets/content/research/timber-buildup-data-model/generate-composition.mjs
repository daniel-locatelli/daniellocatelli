// Generates public/assets/content/research/timber-buildup-data-model/composition.svg
// Run: node src/assets/content/research/timber-buildup-data-model/generate-composition.mjs
// The cover's wall (dataholz awmohi02a-04) as data: a buildup has eight layers as parts; the
// stud zone, one layer, has parts in turn: timber stud, mineral wool, timber stud. The two
// studs are one product used twice, which is where a timber wall stops being a simple stack.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, arrow, write, note, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "bsdd-composition";
const W = 1600;
const H = 700;
const b = [];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function box(x, y, w, h, lines, { accent = false, soft = false, size = 17, sub } = {}) {
  const out = [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${soft ? C.boxSoft : C.box}" stroke="${accent ? C.accent : C.ink}" stroke-width="1.5"/>`,
  ];
  const lh = size + 4;
  const block = lines.length * lh + (sub ? 22 : 0);
  let ty = y + (h - block) / 2 + size - 2;
  for (const line of lines) {
    out.push(`<text x="${x + w / 2}" y="${ty}" text-anchor="middle" fill="${C.ink}" font-size="${size}" font-weight="600" font-family="${SANS}">${esc(line)}</text>`);
    ty += lh;
  }
  if (sub) out.push(`<text x="${x + w / 2}" y="${ty + 4}" text-anchor="middle" fill="${C.muted}" font-size="14" font-family="${SANS}">${esc(sub)}</text>`);
  return out.join("\n");
}
const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.muted}" stroke-width="1.5"/>`;
const label = (x, y, t) => {
  const lw = 16 + t.length * 8.5;
  return `<rect x="${x - lw / 2}" y="${y - 13}" width="${lw}" height="22" rx="4" fill="${C.bg}"/><text x="${x}" y="${y + 3}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}">${esc(t)}</text>`;
};

// Level 1: the buildup
const wallW = 440;
const wallX = (W - wallW) / 2;
const wallY = 30;
const wallH = 84;
b.push(box(wallX, wallY, wallW, wallH, ["External Wall"], { accent: true, size: 22, sub: "a buildup · dataholz awmohi02a-04" }));

// Level 2: eight layers, outside to inside
const LAYERS = [
  ["Larch", "cladding"],
  ["Battens"],
  ["Façade", "membrane"],
  ["Gypsum", "fibre board"],
  ["Stud zone"],
  ["Solid timber", "panel"],
  ["Service", "cavity"],
  ["Inner", "lining"],
];
const lw = 172;
const lgap = 18;
const lx0 = (W - (LAYERS.length * lw + (LAYERS.length - 1) * lgap)) / 2;
const ly = 210;
const lh = 80;
const busY = 168;
const cx = (i) => lx0 + i * (lw + lgap) + lw / 2;

b.push(line(W / 2, wallY + wallH, W / 2, busY));
b.push(line(cx(0), busY, cx(LAYERS.length - 1), busY));
LAYERS.forEach((l, i) => {
  b.push(arrow(ID, cx(i), busY, cx(i), ly - 4));
  b.push(box(lx0 + i * (lw + lgap), ly, lw, lh, l, { accent: i === 4, size: 16 }));
});
b.push(label(W / 2 + 70, (wallY + wallH + busY) / 2, "has part"));
b.push(note(lx0, ly + lh + 30, "outside", { color: C.faint, size: 14 }));
b.push(note(lx0 + LAYERS.length * (lw + lgap) - lgap, ly + lh + 30, "inside", { anchor: "end", color: C.faint, size: 14 }));

// Level 3: the stud zone's parts, in order along the wall
const sc = cx(4);
const slotW = 150;
const slotGap = 12;
const slotY = 370;
const slotH = 56;
const slotX = (i) => sc - (3 * slotW + 2 * slotGap) / 2 + i * (slotW + slotGap);
const SLOTS = ["timber stud", "mineral wool", "timber stud"];
b.push(arrow(ID, sc, ly + lh, sc, slotY - 26, "", {}));
b.push(label(sc + 70, (ly + lh + slotY - 26) / 2, "has part"));
b.push(
  `<rect x="${slotX(0) - 14}" y="${slotY - 22}" width="${3 * slotW + 2 * slotGap + 28}" height="${slotH + 36}" rx="12" fill="${C.frameFill}" stroke="${C.frameStroke}" stroke-width="1.5"/>`,
);
SLOTS.forEach((s, i) => {
  b.push(
    `<rect x="${slotX(i)}" y="${slotY}" width="${slotW}" height="${slotH}" rx="6" fill="${C.boxSoft}" stroke="${C.muted}" stroke-width="1.2"/>`,
  );
  b.push(`<text x="${slotX(i) + slotW / 2}" y="${slotY + slotH / 2 + 6}" text-anchor="middle" fill="${C.muted}" font-size="16" font-family="${MONO}">${esc(s)}</text>`);
});
b.push(note(slotX(0) - 34, slotY + 22, "the pattern, repeating", { anchor: "end", size: 15 }));
b.push(note(slotX(0) - 34, slotY + 44, "every 625 mm along the wall", { anchor: "end", size: 15 }));
b.push(note(cx(6), ly + lh + 30, "same pattern, not drawn", { anchor: "middle", color: C.faint, size: 14 }));

// Level 4: products. Mineral wool straight below the middle slot; one timber stud product
// below it, reached by both stud slots.
const mid = (i) => slotX(i) + slotW / 2;
const woolW = 190;
const woolY = 480;
const woolH = 64;
b.push(arrow(ID, mid(1), slotY + slotH, mid(1), woolY - 4));
b.push(box(mid(1) - woolW / 2, woolY, woolW, woolH, ["Mineral wool"], { size: 17, sub: "product" }));

const studY = 590;
const studH = 76;
const studX = mid(0) - 60;
const studW = mid(2) + 60 - studX;
b.push(arrow(ID, mid(0), slotY + slotH, mid(0), studY - 4));
b.push(arrow(ID, mid(2), slotY + slotH, mid(2), studY - 4));
b.push(box(studX, studY, studW, studH, ["Timber stud"], { accent: true, size: 17, sub: "one product, repeating along the layer" }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "The external wall from the cover as data. The wall, a buildup, has eight layers as parts, from outside to inside: larch cladding, battens, façade membrane, gypsum fibre board, stud zone, solid timber panel, service cavity and inner lining. The stud zone in turn has parts in a pattern that repeats every 625 mm along the wall: timber stud, mineral wool, timber stud. The mineral wool points to one product; both timber studs point to the same timber stud product. The service cavity follows the same pattern and is not drawn.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/research/timber-buildup-data-model/composition.svg"), svg);
