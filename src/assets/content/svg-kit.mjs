// Tiny shared helpers for hand-built diagram SVGs in the site's dark zinc style.
// Used by the generate-*.mjs scripts next to the content assets.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const SANS = "ui-sans-serif, system-ui, sans-serif";
export const C = {
  bg: "#000000",
  box: "#18181b",
  boxSoft: "#09090b",
  ink: "#f4f4f5",
  muted: "#a1a1aa",
  dim: "#71717a",
  faint: "#52525b",
  frameFill: "rgba(244,244,245,0.02)",
  frameStroke: "rgba(244,244,245,0.10)",
  accent: "#34d399",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function svgDoc({ w, h, title, id, body }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${esc(title)}</title>`,
    `<defs><marker id="${id}-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${C.muted}"/></marker></defs>`,
    `<rect width="100%" height="100%" fill="${C.bg}"/>`,
    ...body,
    `</svg>`,
  ].join("\n");
}

/** Rounded group frame with a small mono label in the top-left corner. */
export function frame(x, y, w, h, label) {
  const out = [`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.frameFill}" stroke="${C.frameStroke}" stroke-width="1.5"/>`];
  if (label) {
    const lw = 24 + label.length * 12.5;
    out.push(`<rect x="${x + 16}" y="${y - 14}" width="${lw}" height="28" rx="4" fill="${C.bg}"/>`);
    out.push(`<text x="${x + 28}" y="${y + 6}" fill="${C.dim}" font-size="17" font-family="${MONO}" letter-spacing="0.16em">${esc(label)}</text>`);
  }
  return out.join("\n");
}

/** Solid tile with a title and optional second line. `accent` draws the border in the accent colour. */
export function tile(x, y, w, h, title, sub, { accent = false, soft = false } = {}) {
  const out = [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${soft ? C.boxSoft : C.box}" stroke="${accent ? C.accent : C.ink}" stroke-width="1.5"/>`,
  ];
  const cx = x + w / 2;
  if (sub) {
    out.push(`<text x="${cx}" y="${y + h / 2 - 6}" text-anchor="middle" fill="${C.ink}" font-size="20" font-weight="600" font-family="${SANS}">${esc(title)}</text>`);
    out.push(`<text x="${cx}" y="${y + h / 2 + 20}" text-anchor="middle" fill="${C.muted}" font-size="15" font-family="${SANS}">${esc(sub)}</text>`);
  } else {
    out.push(`<text x="${cx}" y="${y + h / 2 + 7}" text-anchor="middle" fill="${C.ink}" font-size="20" font-weight="600" font-family="${SANS}">${esc(title)}</text>`);
  }
  return out.join("\n");
}

/** Small pill used for lists of standards or chips. */
export function chip(x, y, label, { w } = {}) {
  const width = w ?? 28 + label.length * 10.5;
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="34" rx="17" fill="${C.boxSoft}" stroke="${C.frameStroke}" stroke-width="1.5"/>`,
    `<text x="${x + width / 2}" y="${y + 22}" text-anchor="middle" fill="${C.muted}" font-size="16" font-family="${MONO}">${esc(label)}</text>`,
  ].join("\n");
}

/** Straight arrow with optional label at its midpoint. `dashed` for weaker relations. */
export function arrow(id, x1, y1, x2, y2, label, { dashed = false, labelDx = 0, labelDy = -8 } = {}) {
  const out = [
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.muted}" stroke-width="1.5" ${dashed ? 'stroke-dasharray="6 6"' : ""} marker-end="url(#${id}-arrow)"/>`,
  ];
  if (label) {
    const mx = (x1 + x2) / 2 + labelDx;
    const my = (y1 + y2) / 2 + labelDy;
    const lw = 16 + label.length * 8.5;
    out.push(`<rect x="${mx - lw / 2}" y="${my - 13}" width="${lw}" height="22" rx="4" fill="${C.bg}"/>`);
    out.push(`<text x="${mx}" y="${my + 3}" text-anchor="middle" fill="${C.dim}" font-size="14" font-family="${MONO}">${esc(label)}</text>`);
  }
  return out.join("\n");
}

export function note(x, y, text, { anchor = "start", size = 15, color = C.dim } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="${SANS}">${esc(text)}</text>`;
}

export function write(path, svg) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
  console.log(`wrote ${path}`);
}
