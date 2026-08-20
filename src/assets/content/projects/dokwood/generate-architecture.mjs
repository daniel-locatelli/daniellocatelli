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

// Row 3: vocabulary (left) with a free corridor on the right for the domain standards
const r3y = 590;
const r3h = 150;
const vocW = 820;
b.push(frame(X0, r3y, vocW, r3h, "VOCABULARY"));
b.push(tile(X0 + 32, r3y + 34, vocW - 64, 82, "bSDD dictionary hm/dokwood", "classes · properties · System and Product Data Templates (ISO 23387) · v0.1 to v0.13"));
const vocCx = X0 + vocW / 2;
b.push(arrow(ID, vocCx, r3y - 2, vocCx, r2y + r2h + 2, "describes every buildup (SDT) and product (PDT)", { labelDy: 4 }));

// Row 4: standards, two groups
const r4y = 830;
const r4h = 96;
b.push(frame(X0, r4y, CW, r4h, "STANDARDS · WP 1.2"));
const chipW = (c) => 28 + c.length * 10.5;
const chipRow = (x0, labels) => {
  let x = x0;
  for (const c of labels) {
    b.push(chip(x, r4y + 31, c));
    x += chipW(c) + 14;
  }
  return x - 14;
};
const dictChips = ["ISO 12006-3", "ISO 23386", "ISO 23387", "IFC (ISO 16739)"];
const domainChips = ["EN · DIN · SIA · KBOB", "CPR 2024 · DPP", "GS1"];
const dictX0 = X0 + 32;
const dictX1 = chipRow(dictX0, dictChips);
const domainW = domainChips.reduce((a, c) => a + chipW(c), 0) + 14 * (domainChips.length - 1);
const domainX0 = X0 + CW - 32 - domainW;
const domainX1 = chipRow(domainX0, domainChips);
const dictCx = (dictX0 + dictX1) / 2;
const domainCx = (domainX0 + domainX1) / 2;
b.push(note(dictCx, r4y + 86, "dictionary framework", { anchor: "middle", size: 14 }));
b.push(note(domainCx, r4y + 86, "domain rules and regulation", { anchor: "middle", size: 14 }));
// dictionary standards structure the vocabulary
b.push(arrow(ID, dictCx, r4y - 2, dictCx, r3y + r3h + 2, "structure the dictionary", { labelDy: 4 }));
// domain standards feed the platform directly: values, rules and calculations for buildups and products
b.push(arrow(ID, domainCx, r4y - 2, domainCx, r2y + r2h + 2, "rules, values and calculations for buildups and products", { labelDy: 4 }));

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title: "DOKwood architecture: standards at the base, split into the dictionary framework that structures the bSDD vocabulary and the domain standards that feed the DOKwood platform directly; the platform in the middle, and the Revit, Cadwork and MCP interfaces on top",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/dokwood/dokwood-architecture.svg"), svg);
