// Generates public/assets/content/research/agent-skills/agent-skills-diagram.svg
// Run: node src/assets/content/research/agent-skills/generate-diagram.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "ui-sans-serif, system-ui, sans-serif";
const W = 1600;
const COL_W = 400;
const COL_GAP = 32;
const COL_Y = 220;
const TILE_H = 48;
const TILE_GAP = 12;
const GROUP_LABEL_H = 30;
const PAD_TOP = 48;
const PAD_BOTTOM = 12;

// Each column: label + groups (group label optional). Tiles: [name, private?]
const columns = [
  {
    label: "MINE",
    groups: [
      { label: "AEC", tiles: ["creating-revit-plugin", "creating-grasshopper-plugin", "using-cordyceps"] },
      { label: "WEB", tiles: ["optimizing-web-performance", "auditing-website-quality", "auditing-agent-readiness"] },
      { label: "PERSONAL", tiles: [["system", true], ["phd", true], ["pre-pr-ritual", true]] },
    ],
  },
  {
    label: "MATT POCOCK",
    groups: [{ tiles: ["grill-me", "grill-with-docs", "handoff", "teach", "codebase-design", "domain-modeling"] }],
  },
  {
    label: "COMMUNITY",
    groups: [{ tiles: ["diagram-design", "superpowers", "frontend-design"] }],
  },
];

function columnHeight(col) {
  let h = PAD_TOP;
  for (const g of col.groups) {
    if (g.label) h += GROUP_LABEL_H;
    h += g.tiles.length * (TILE_H + TILE_GAP);
  }
  return h - TILE_GAP + PAD_BOTTOM + 12;
}

const colH = Math.max(...columns.map(columnHeight));
const totalW = columns.length * COL_W + (columns.length - 1) * COL_GAP;
const x0 = (W - totalW) / 2;
const agentY = COL_Y + colH + 64;
const H = agentY + 88 + 140;

const out = [];
out.push(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="skills-cover-title"><title id="skills-cover-title">Agent skills I use: my own (AEC, web, personal), Matt Pocock's, and community skills feeding one coding agent</title>`,
  `<defs><marker id="skills-cover-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a1a1aa"/></marker></defs>`,
  `<rect width="100%" height="100%" fill="#000000"/>`,
);

columns.forEach((col, ci) => {
  const x = x0 + ci * (COL_W + COL_GAP);
  const cx = x + COL_W / 2;
  out.push(`<line x1="${cx}" y1="${COL_Y + colH}" x2="${cx}" y2="${agentY}" stroke="#a1a1aa" stroke-width="2" marker-end="url(#skills-cover-arrow)"/>`);
  out.push(`<rect x="${x}" y="${COL_Y}" width="${COL_W}" height="${colH}" rx="16" fill="rgba(244,244,245,0.02)" stroke="rgba(244,244,245,0.10)" stroke-width="1.5"/>`);
  const labelW = 24 + col.label.length * 13;
  out.push(`<rect x="${x + 16}" y="${COL_Y + 8}" width="${labelW}" height="28" rx="4" fill="#000000"/>`);
  out.push(`<text x="${x + 28}" y="${COL_Y + 28}" fill="#71717a" font-size="18" font-family="${MONO}" letter-spacing="0.16em">${col.label}</text>`);

  let y = COL_Y + PAD_TOP;
  for (const g of col.groups) {
    if (g.label) {
      out.push(`<text x="${x + 28}" y="${y + 18}" fill="#52525b" font-size="13" font-family="${MONO}" letter-spacing="0.18em">${g.label}</text>`);
      out.push(`<line x1="${x + 28 + g.label.length * 11 + 12}" y1="${y + 13}" x2="${x + COL_W - 24}" y2="${y + 13}" stroke="rgba(244,244,245,0.10)" stroke-width="1"/>`);
      y += GROUP_LABEL_H;
    }
    for (const t of g.tiles) {
      const [name, priv] = Array.isArray(t) ? t : [t, false];
      const stroke = priv ? `stroke="#71717a" stroke-dasharray="6 5"` : `stroke="#f4f4f5"`;
      out.push(`<rect x="${x + 24}" y="${y}" width="${COL_W - 48}" height="${TILE_H}" rx="10" fill="#18181b" ${stroke} stroke-width="1.5"/>`);
      out.push(`<text x="${x + 44}" y="${y + 31}" fill="${priv ? "#d4d4d8" : "#f4f4f5"}" font-size="19" font-weight="600" font-family="${SANS}">${name}</text>`);
      out.push(`<text x="${x + COL_W - 40}" y="${y + 30}" fill="#71717a" font-size="13" font-family="${MONO}" text-anchor="end">${priv ? "private" : "SKILL.md"}</text>`);
      y += TILE_H + TILE_GAP;
    }
  }
});

out.push(`<rect x="${x0}" y="${agentY}" width="${totalW}" height="88" rx="12" fill="rgba(34,197,94,0.10)" stroke="#22c55e" stroke-width="2"/>`);
out.push(`<text x="${W / 2}" y="${agentY + 40}" fill="#f4f4f5" font-size="30" font-weight="600" font-family="${SANS}" text-anchor="middle">Coding agent</text>`);
out.push(`<text x="${W / 2}" y="${agentY + 68}" fill="#a1a1aa" font-size="17" font-family="${MONO}" text-anchor="middle">skills loaded on demand, by task</text>`);
out.push(`</svg>`);

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../../../../../public/assets/content/research/agent-skills/agent-skills-diagram.svg");
writeFileSync(target, out.join("\n") + "\n");
console.log("wrote", target);
