// Generates public/assets/content/research/agent-skills/agent-skills-diagram.svg
// Run: node src/assets/content/research/agent-skills/generate-diagram.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, sans-serif";
const W = 1600;
const MARGIN_X = 120;
const TOP = 120;
const SUB_W = 352; // one tile column
const SUB_GAP = 24;
const BOX_PAD = 24;
const BOX_GAP = 32;
const TILE_H = 48;
const TILE_GAP = 12;
const HEAD_H = 48; // space for box label
const GROUP_LABEL_H = 30;
const BUS_GAP = 56; // distance from boxes' right edge to the bus line

// Tiles: "name" or ["name", private]
const rows = [
  [
    {
      label: "MINE",
      groups: [
        { label: "AEC", tiles: ["creating-revit-plugin", "creating-grasshopper-plugin", "using-cordyceps", "working-with-btlx"] },
        { label: "QUALITY", tiles: ["optimizing-web-performance", "auditing-website-quality", "auditing-agent-readiness", ["pre-pr-ritual", true]] },
        { label: "PERSONAL", tiles: [["system", true], ["backup-system", true], ["phd", true], ["searching-librarian", true]] },
      ],
    },
  ],
  [
    {
      label: "MATT POCOCK",
      groups: [
        { tiles: ["grill-me", "grill-with-docs", "handoff"] },
        { tiles: ["teach", "codebase-design", "domain-modeling"] },
      ],
    },
    {
      label: "COMMUNITY",
      groups: [{ tiles: ["diagram-design", "superpowers", "frontend-design"] }],
    },
  ],
];

const boxWidth = (box) => BOX_PAD * 2 + box.groups.length * SUB_W + (box.groups.length - 1) * SUB_GAP;
const boxHeight = (box) => {
  const n = Math.max(...box.groups.map((g) => g.tiles.length));
  const hasLabels = box.groups.some((g) => g.label);
  return HEAD_H + (hasLabels ? GROUP_LABEL_H : 0) + n * (TILE_H + TILE_GAP) - TILE_GAP + BOX_PAD;
};

const contentW = Math.max(...rows.map((r) => r.reduce((s, b) => s + boxWidth(b), 0) + (r.length - 1) * BOX_GAP));
const x0 = (W - contentW - BUS_GAP) / 2;
const busX = x0 + contentW + BUS_GAP;

const out = [];
const push = (s) => out.push(s);

let y = TOP;
const boxesDrawn = [];
for (const row of rows) {
  let x = x0;
  const rowH = Math.max(...row.map(boxHeight));
  for (const box of row) {
    // A row with a single box stretches to the full content width.
    const bw = row.length === 1 ? contentW : boxWidth(box);
    const bh = rowH;
    push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="16" fill="rgba(244,244,245,0.02)" stroke="rgba(244,244,245,0.10)" stroke-width="1.5"/>`);
    const labelW = 24 + box.label.length * 13;
    push(`<rect x="${x + 16}" y="${y + 8}" width="${labelW}" height="28" rx="4" fill="#000000"/>`);
    push(`<text x="${x + 28}" y="${y + 28}" fill="#71717a" font-size="18" font-family="${MONO}" letter-spacing="0.16em">${box.label}</text>`);
    const hasLabels = box.groups.some((g) => g.label);
    box.groups.forEach((g, gi) => {
      const gx = x + BOX_PAD + gi * (SUB_W + SUB_GAP);
      let ty = y + HEAD_H;
      if (hasLabels) {
        if (g.label) {
          push(`<text x="${gx + 4}" y="${ty + 18}" fill="#52525b" font-size="13" font-family="${MONO}" letter-spacing="0.18em">${g.label}</text>`);
          push(`<line x1="${gx + 4 + g.label.length * 11 + 12}" y1="${ty + 13}" x2="${gx + SUB_W}" y2="${ty + 13}" stroke="rgba(244,244,245,0.10)" stroke-width="1"/>`);
        }
        ty += GROUP_LABEL_H;
      }
      for (const t of g.tiles) {
        const [name, priv] = Array.isArray(t) ? t : [t, false];
        const stroke = priv ? `stroke="#71717a" stroke-dasharray="6 5"` : `stroke="#f4f4f5"`;
        push(`<rect x="${gx}" y="${ty}" width="${SUB_W}" height="${TILE_H}" rx="10" fill="#18181b" ${stroke} stroke-width="1.5"/>`);
        push(`<text x="${gx + 20}" y="${ty + 31}" fill="${priv ? "#d4d4d8" : "#f4f4f5"}" font-size="19" font-weight="600" font-family="${SANS}">${name}</text>`);
        push(`<text x="${gx + SUB_W - 16}" y="${ty + 30}" fill="#71717a" font-size="13" font-family="${MONO}" text-anchor="end">${priv ? "private" : "SKILL.md"}</text>`);
        ty += TILE_H + TILE_GAP;
      }
    });
    boxesDrawn.push({ x, y, w: bw, h: bh });
    x += bw + BOX_GAP;
  }
  y += rowH + BOX_GAP;
}

// Agent bar below the stack; bus on the right collects every box into it.
const agentY = y + 48;
const agentH = 88;
const agentW = contentW;
push(`<rect x="${x0}" y="${agentY}" width="${agentW}" height="${agentH}" rx="12" fill="rgba(34,197,94,0.10)" stroke="#22c55e" stroke-width="2"/>`);
push(`<text x="${x0 + agentW / 2}" y="${agentY + 40}" fill="#f4f4f5" font-size="30" font-weight="600" font-family="${SANS}" text-anchor="middle">Coding agent</text>`);
push(`<text x="${x0 + agentW / 2}" y="${agentY + 68}" fill="#a1a1aa" font-size="17" font-family="${MONO}" text-anchor="middle">skills loaded on demand, by task</text>`);

// Last-row boxes sit right above the agent: straight arrows down.
// Earlier rows would cross them, so they route via a bus on the right.
const lastRowY = Math.max(...boxesDrawn.map((b) => b.y));
const lastRow = boxesDrawn.filter((b) => b.y === lastRowY);
const upper = boxesDrawn.filter((b) => b.y !== lastRowY);
for (const b of lastRow) {
  const cx = b.x + b.w / 2;
  push(`<line x1="${cx}" y1="${b.y + b.h}" x2="${cx}" y2="${agentY}" stroke="#a1a1aa" stroke-width="2" marker-end="url(#skills-cover-arrow)"/>`);
}
if (upper.length) {
  const busTop = Math.min(...upper.map((b) => b.y + b.h / 2));
  const busBottom = agentY + agentH / 2;
  push(`<line x1="${busX}" y1="${busTop}" x2="${busX}" y2="${busBottom}" stroke="#a1a1aa" stroke-width="2"/>`);
  for (const b of upper) {
    const cy = b.y + b.h / 2;
    push(`<line x1="${b.x + b.w}" y1="${cy}" x2="${busX}" y2="${cy}" stroke="#a1a1aa" stroke-width="2"/>`);
  }
  push(`<line x1="${busX}" y1="${busBottom}" x2="${x0 + agentW + 8}" y2="${busBottom}" stroke="#a1a1aa" stroke-width="2" marker-end="url(#skills-cover-arrow)"/>`);
}

const H = agentY + agentH + TOP;
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="skills-cover-title"><title id="skills-cover-title">Agent skills I use: my own (AEC, quality, personal), Matt Pocock's, and community skills feeding one coding agent</title>`,
  `<defs><marker id="skills-cover-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a1a1aa"/></marker></defs>`,
  `<rect width="100%" height="100%" fill="#000000"/>`,
  ...out,
  `</svg>`,
].join("\n") + "\n";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../../../../../public/assets/content/research/agent-skills/agent-skills-diagram.svg");
writeFileSync(target, svg);
console.log("wrote", target);
