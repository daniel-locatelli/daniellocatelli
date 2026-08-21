// Generates public/assets/content/projects/kfw-funding-calculator-by-buildsystems/deployment.svg
// Run: node src/assets/content/projects/kfw-funding-calculator-by-buildsystems/generate-deployment.mjs
// Git push from VS Code to GitHub; each branch deploys to its own Cloudflare Pages environment.
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { svgDoc, frame, tile, chip, arrow, write } from "../../svg-kit.mjs";

const ID = "kfw-deploy";
const W = 1600;
const H = 330;
const b = [];

const fy = 70;
const fh = 200;
const rows = [140, 212]; // row centre lines: production, development
const tw = 252;
const th = 44;

// VS Code: the Angular app, one tile spanning both rows
const vsX = 60;
const vsW = 220;
b.push(frame(vsX, fy, vsW, fh, "VS CODE"));
const ngX = vsX + 24;
const ngW = vsW - 48;
b.push(tile(ngX, 104, ngW, 144, "Angular", "app source"));

// GitHub: two branches
const ghX = 380;
const ghW = 300;
b.push(frame(ghX, fy, ghW, fh, "GITHUB"));
const branches = ["main branch", "development branch"];
branches.forEach((t, i) => b.push(tile(ghX + 24, rows[i] - th / 2, tw, th, t, null, { size: 17 })));

// Cloudflare: one Pages environment per branch
const cfX = 780;
const cfW = 300;
b.push(frame(cfX, fy, cfW, fh, "CLOUDFLARE"));
const envs = ["Pages production", "Pages development"];
envs.forEach((t, i) => b.push(tile(cfX + 24, rows[i] - th / 2, tw, th, t, null, { size: 17 })));

// Deployed URLs
const urlX = 1180;
const urls = ["https://app.buildsystems.de", "https://branchname.pages.dev"];
urls.forEach((u, i) => b.push(chip(urlX, rows[i] - 17, u)));

// Flow: push -> build -> serve
rows.forEach((y) => {
  b.push(arrow(ID, ngX + ngW + 2, y, ghX + 24 - 2, y, "push"));
  b.push(arrow(ID, ghX + 24 + tw + 2, y, cfX + 24 - 2, y));
  b.push(arrow(ID, cfX + 24 + tw + 2, y, urlX - 2, y));
});

const svg = svgDoc({
  w: W,
  h: H,
  id: ID,
  title:
    "From VS Code, the Angular app is pushed to GitHub: the main branch deploys to Cloudflare Pages production at app.buildsystems.de, and the development branch deploys to Cloudflare Pages development at branchname.pages.dev.",
  body: b,
});
write(resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../public/assets/content/projects/kfw-funding-calculator-by-buildsystems/deployment.svg"), svg);
