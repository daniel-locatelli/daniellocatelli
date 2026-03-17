#!/usr/bin/env node
/**
 * Captures the BuildSystems CSS animation frame-by-frame using CDP
 * animation control. No timing issues — each frame is captured at
 * the exact animation timestamp.
 */

import puppeteer from "puppeteer";
import { mkdirSync, rmSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = join(__dirname, "..", "tmp_frames");
const HTML_FILE = join(__dirname, "buildsystems-animation.html");
const OUTPUT = join(
  __dirname,
  "..",
  "src",
  "assets",
  "content",
  "projects",
  "buildsystems-website",
  "buildsystems-website-loading-animation.mp4"
);

const WIDTH = 1440;
const HEIGHT = 900;
const FPS = 60;
const DURATION_S = 5.5; // animation-delay(0.5s) + animation-time(4.3s) + buffer
const TOTAL_FRAMES = FPS * DURATION_S;

async function main() {
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Create CDP session for animation control
  const client = await page.createCDPSession();

  // Disable animations initially so nothing plays while loading
  await client.send("Animation.enable");
  await client.send("Animation.setPlaybackRate", { playbackRate: 0 });

  console.log(`Loading ${HTML_FILE}...`);
  await page.goto(`file://${HTML_FILE}`, { waitUntil: "networkidle0" });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  console.log("Fonts loaded.");

  // Now step through time frame by frame
  const frameDurationMs = 1000 / FPS;
  console.log(
    `Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION_S}s)...`
  );

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const timeMs = i * frameDurationMs;

    // Advance all document animations to this exact time
    await page.evaluate((t) => {
      document.getAnimations().forEach((anim) => {
        anim.currentTime = t;
      });
    }, timeMs);

    // Force a paint
    await page.evaluate(() => new Promise(requestAnimationFrame));

    const framePath = join(
      FRAMES_DIR,
      `frame-${String(i).padStart(4, "0")}.png`
    );
    await page.screenshot({ path: framePath });

    if (i % 60 === 0) {
      console.log(
        `  Frame ${i}/${TOTAL_FRAMES} (t=${(timeMs / 1000).toFixed(2)}s)`
      );
    }
  }

  console.log("Closing browser...");
  await browser.close();

  console.log("Stitching frames with ffmpeg...");
  try {
    execSync(
      `ffmpeg -y -framerate ${FPS} -i "${join(FRAMES_DIR, "frame-%04d.png")}" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${OUTPUT}"`,
      { stdio: "inherit" }
    );
    console.log(`\nSaved to: ${OUTPUT}`);
  } catch (e) {
    console.error("ffmpeg failed:", e.message);
  }

  rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log("Done!");
}

main().catch(console.error);
