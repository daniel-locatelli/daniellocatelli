// Generates public/assets/content/projects/dokwood/dokwood-mcp.svg
// Run: node src/assets/content/projects/dokwood/generate-mcp.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, arrow, note, write, C, MONO, SANS } from "../../svg-kit.mjs";

const ID = "dokwood-mcp";
const W = 1600;
const H = 600;
const b = [];

// Three columns: AI clients (left), the MCP server (centre), the DOKwood platform (right)
const colW = 360; // side columns
const midW = 560; // centre column
const gap = 100;
const X0 = (W - (2 * colW + midW + 2 * gap)) / 2;
const xL = X0;
const xC = X0 + colW + gap;
const xR = xC + midW + gap;
const fy = 70;
const tileH = 96;
const tileGap = 24;
const ty0 = fy + 44;
const fh = 44 + 3 * tileH + 2 * tileGap + 32;

b.push(frame(xL, fy, colW, fh, "AI CLIENTS · MCP HOSTS"));
b.push(frame(xR, fy, colW, fh, "DOKWOOD PLATFORM"));

const clients = [
  ["Chat interfaces", "Claude Desktop, ChatGPT"],
  ["IDEs and code editors", "Claude Code, Cursor, VS Code"],
  ["Agents and automation", "Codex, n8n, custom agents"],
];
const platform = [
  ["Products and data sheets", "search, compare, certificates"],
  ["Buildups and catalogue", "layers, versions, tenant catalogue"],
  ["Projects, calculations, bSDD", "requirements, U-values, dictionary"],
];
const tw = colW - 64;
const tileY = (i) => ty0 + i * (tileH + tileGap);
clients.forEach(([t, s], i) => b.push(tile(xL + 32, tileY(i), tw, tileH, t, s)));
platform.forEach(([t, s], i) => b.push(tile(xR + 32, tileY(i), tw, tileH, t, s)));

// Centre: the MCP server, one tile spanning the three rows, accent border
const cy0 = tileY(0);
const ch = tileY(2) + tileH - cy0;
b.push(`<rect x="${xC}" y="${cy0}" width="${midW}" height="${ch}" rx="10" fill="${C.box}" stroke="${C.accent}" stroke-width="1.5"/>`);
const ccx = xC + midW / 2;
b.push(`<text x="${ccx}" y="${cy0 + 74}" text-anchor="middle" fill="${C.ink}" font-size="28" font-weight="700" font-family="${SANS}">DOKwood MCP server</text>`);
b.push(`<text x="${ccx}" y="${cy0 + 104}" text-anchor="middle" fill="${C.muted}" font-size="16" font-family="${SANS}">proposal · thin, stateless adapter</text>`);
const rows = [
  ["tools", "search_products · get_buildup · compare_buildups · search_bsdd"],
  ["resources", "dokwood://products/{id} · buildups/{id} · catalog/{tenant}"],
  ["prompts", "compare buildups by U-value · certificate gap analysis"],
  ["auth", "OAuth2 / JWT · tenant rules of a human user · read-only first"],
];
rows.forEach(([k, v], i) => {
  const y = cy0 + 150 + i * 44;
  b.push(`<text x="${xC + 28}" y="${y}" fill="${C.accent}" font-size="14" font-family="${MONO}" letter-spacing="0.12em">${k.toUpperCase()}</text>`);
  b.push(`<text x="${xC + 28}" y="${y + 20}" fill="${C.muted}" font-size="13" font-family="${MONO}">${v}</text>`);
});

// Arrows: bidirectional between clients and server (MCP), server and platform (GraphQL)
const midY = cy0 + ch / 2;
b.push(arrow(ID, xL + colW + 2, midY - 10, xC - 2, midY - 10, "MCP", { labelDy: -16 }));
b.push(arrow(ID, xC - 2, midY + 10, xL + colW + 2, midY + 10, "", { dashed: true }));
b.push(arrow(ID, xC + midW + 2, midY - 10, xR - 2, midY - 10, "GraphQL", { labelDy: -16 }));
b.push(arrow(ID, xR - 2, midY + 10, xC + midW + 2, midY + 10, "", { dashed: true }));

b.push(note(W / 2, H - 48, "MCP over stdio or HTTP on the client side, authenticated GraphQL with tenant context on the platform side: one interface for every MCP-aware tool instead of one ERP connector per partner", { anchor: "middle", size: 15 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "Three columns: AI clients (chat interfaces, IDEs, agents) on the left, the proposed DOKwood MCP server in the centre with its tools, resources, prompts and auth bridge, and the DOKwood platform's GraphQL API on the right with products, buildups, projects and bSDD; two-way arrows labelled MCP and GraphQL connect them",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/dokwood/dokwood-mcp.svg"), svg);
