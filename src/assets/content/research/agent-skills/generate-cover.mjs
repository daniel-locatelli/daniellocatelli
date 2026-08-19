// Generates the agent-skills cover SVGs. Run from the repo root:
//   node src/assets/content/research/agent-skills/generate-cover.mjs
// Icons: Claude Code glyph from Simple Icons (CC0), graduation cap from
// @iconify-json/mdi ("school"). Output is written next to this file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const mdi = require("@iconify-json/mdi/icons.json");

const GREEN = "#4ade80"; // site green-400
const BG_CENTER = "#102a1a";
const BG_EDGE = "#0c0f0d"; // lifted off pure black so the cover reads as a card on the page
const W = 1600, H = 1000, CX = 800, CY = 500;
const ICON = 150; // icon box size in px
const STROKE = ICON * 16 / 256; // Phosphor "regular" line weight at this size
const GAP = 170; // space between each icon and the plus
const BLUR = 10, GLOW_ALPHA = 0.6;

// simple-icons "claudecode" path (24x24 grid)
const CLAUDE_CODE = "M21 10.5h3v3h-3v3h-1.5v3H18v-3h-1.5v3H15v-3H9v3H7.5v-3H6v3H4.5v-3H3v-3H0v-3h3v-6h18Zm-15 0h1.5v-3H6Zm10.5 0H18v-3h-1.5z";
const CAP = mdi.icons.school.body.match(/d="([^"]+)"/)[1]; // 24x24 grid

const defs = `<defs>
<filter id="glow" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="${BLUR}" result="b"/><feComponentTransfer in="b" result="bf"><feFuncA type="linear" slope="${GLOW_ALPHA}"/></feComponentTransfer><feMerge><feMergeNode in="bf"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="bg" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="${BG_CENTER}"/><stop offset="1" stop-color="${BG_EDGE}"/></radialGradient>
</defs>`;

const wrap = (title, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t"><title id="t">${title}</title>
${defs}
<rect width="100%" height="100%" fill="url(#bg)"/>
<g filter="url(#glow)">
${body}
</g>
</svg>
`;

const glyph = (d, x, y, size, extra = "") =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="${GREEN}"${extra}><path d="${d}"/></g>`;

// Variant 1: side by side, "agent + skill"
{
  const L = ICON * 0.15; // plus half arm length
  const body = [
    glyph(CLAUDE_CODE, CX - GAP - ICON, CY - ICON / 2, ICON),
    `<path d="M${CX - L} ${CY}H${CX + L}M${CX} ${CY - L}V${CY + L}" stroke="${GREEN}" stroke-width="${STROKE}" stroke-linecap="round" fill="none"/>`,
    glyph(CAP, CX + GAP, CY - ICON / 2, ICON),
  ].join("\n");
  writeFileSync(join(here, "agent-skills-cover-side-by-side.svg"),
    wrap("The Claude Code icon next to a graduation-cap icon: an agent plus a skill", body));
}

// Variant 2: the Claude Code glyph wearing the cap
{
  const S = 300; // glyph size
  const u = S / 24; // one glyph grid unit
  // Claude Code glyph geometry on its 24 grid: head spans x 3..21, top edge
  // y=4.5, eyes y 7.5..10.5, feet bottom y=19.5. MDI "school" on its 24 grid:
  // mortarboard rhombus x 1..21 (centre 11, tassel to 23), top y=3, body
  // bottom V (5,17.18)-(12,21)-(19,17.18).
  // Board ~1.42x head width; brim V tip lands just above the eyes; rhombus
  // centred on the head. Only the brim gets a dark line; the rest merges.
  const capS = (18 * 1.42 / 20) * S;
  const k = capS / 24;
  // vertical centring of the combined silhouette (cap top .. glyph feet)
  const capTopRel = 7 * u - 21 * k + 3 * k; // relative to glyph y
  const total = 19.5 * u - capTopRel;
  const x = CX - S / 2, y = CY - total / 2 - capTopRel;
  const capX = x + 12 * u - 12.2 * k; // rhombus centre nudged left (tassel side is heavier)
  const capY = y + 7 * u - 21 * k;
  const brim = `<path d="M${capX + 5 * k} ${capY + 17.18 * k}L${capX + 12 * k} ${capY + 21 * k}L${capX + 19 * k} ${capY + 17.18 * k}" stroke="${BG_EDGE}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const body = [
    glyph(CLAUDE_CODE, x, y, S),
    glyph(CAP, capX, capY, capS),
    brim,
  ].join("\n");
  writeFileSync(join(here, "agent-skills-cover-wearing-cap.svg"),
    wrap("The Claude Code icon wearing a graduation cap: an agent with a skill", body));
}
