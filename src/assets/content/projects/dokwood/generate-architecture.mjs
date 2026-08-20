// Generates public/assets/content/projects/dokwood/dokwood-architecture.svg
// Run: node src/assets/content/projects/dokwood/generate-architecture.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, chip, arrow, note, write, C, MONO } from "../../svg-kit.mjs";

const ID = "dokwood-arch";
const W = 1600;
const H = 980;
const X0 = 120;
const CW = W - 2 * X0; // content width
const b = [];

// Row 1: interfaces
const r1y = 90;
const r1h = 150;
b.push(frame(X0, r1y, CW, r1h, "INTERFACES"));
const ifW = (CW - 2 * 32 - 2 * 40) / 3;
const ifX = [X0 + 32, X0 + 32 + ifW + 40, X0 + 32 + 2 * (ifW + 40)];
b.push(tile(ifX[0], r1y + 34, ifW, 82, "Revit add-in", "C# / .NET 8 · buildups as System Family Types"));
b.push(tile(ifX[1], r1y + 34, ifW, 82, "Cadwork plugin", "Python · material sync and part tagging"));
b.push(tile(ifX[2], r1y + 34, ifW, 82, "MCP server", "proposal · thin adapter for AI clients"));
b.push(note(ifX[0] + ifW / 2, r1y + 138, "partner: Gumpp & Maier", { anchor: "middle", size: 14 }));
b.push(note(ifX[1] + ifW / 2, r1y + 138, "partner: Schärholzbau", { anchor: "middle", size: 14 }));
b.push(note(ifX[2] + ifW / 2, r1y + 138, "clients: Claude, Cursor, n8n ...", { anchor: "middle", size: 14 }));

// Row 2: platform
const r2y = 330;
const r2h = 170;
b.push(frame(X0, r2y, CW, r2h, "PLATFORM"));
b.push(tile(X0 + 32, r2y + 34, CW - 64, 82, "DOKwood platform", "buildups · layers · products · projects · certificates · git-style versioning · GraphQL API", { accent: true }));
b.push(note(X0 + CW / 2, r2y + 148, "SaaS for the documentation of multilayer timber buildups, German and Swiss markets", { anchor: "middle", size: 14 }));

// arrows interfaces <-> platform
for (let i = 0; i < 3; i++) {
  const cx = ifX[i] + ifW / 2;
  b.push(arrow(ID, cx - 14, r2y + 34, cx - 14, r1y + r1h + 2, i === 2 ? "read" : "import", { labelDx: -48, labelDy: 4 }));
  b.push(arrow(ID, cx + 14, r1y + r1h - 2, cx + 14, r2y + 32, i === 2 ? "" : "verify, sync", { dashed: true, labelDx: 62, labelDy: 4 }));
}

// Row 3: vocabulary
const r3y = 590;
const r3h = 150;
b.push(frame(X0, r3y, CW, r3h, "VOCABULARY"));
b.push(tile(X0 + 32, r3y + 34, CW - 64, 82, "bSDD dictionary hm/dokwood", "classes · properties · groups of properties · System and Product Data Templates (ISO 23387) · v0.1 to v0.13"));
b.push(arrow(ID, X0 + CW / 2, r3y - 2, X0 + CW / 2, r2y + r2h + 2, "describes every buildup and product", { labelDy: 4 }));

// Row 4: standards
const r4y = 830;
const r4h = 96;
b.push(frame(X0, r4y, CW, r4h, "STANDARDS"));
const chips = ["ISO 12006-3", "ISO 23386", "ISO 23387", "IFC (ISO 16739)", "EN · DIN · SIA · KBOB", "CPR 2024 · DPP", "GS1"];
let cx = X0 + 32;
for (const c of chips) {
  b.push(chip(cx, r4y + 31, c));
  cx += 28 + c.length * 10.5 + 14;
}
b.push(arrow(ID, X0 + CW / 2, r4y - 2, X0 + CW / 2, r3y + r3h + 2, "reviewed in WP 1.2, encoded in the dictionary", { labelDy: 4 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "DOKwood architecture: standards at the base, the bSDD vocabulary above them, the DOKwood platform in the middle, and the Revit, Cadwork and MCP interfaces on top",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/dokwood/dokwood-architecture.svg"), svg);
