#!/usr/bin/env node
/**
 * Moves remaining works entries into the projects collection
 * with underscore prefix (draft/unpublished state).
 * Maps Organization → Authors for consistency with projects convention.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const WORKS_DIR = join(ROOT, "src", "content", "works");
const PROJECTS_DIR = join(ROOT, "src", "content", "projects");

const locales = ["en", "pt", "de"];
let moved = 0;

for (const locale of locales) {
  const srcDir = join(WORKS_DIR, locale);
  const destDir = join(PROJECTS_DIR, locale);

  let files;
  try {
    files = readdirSync(srcDir).filter((f) => f.endsWith(".md"));
  } catch {
    continue; // locale dir might not exist
  }

  mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    const srcPath = join(srcDir, file);
    let content = readFileSync(srcPath, "utf-8");

    // Map Organization → Authors (list syntax)
    content = content.replace(
      /^Organization: (.+)$/m,
      (_, org) => `Authors:\n  - ${org}`
    );

    // Write to projects with underscore prefix
    const destFile = file.startsWith("_") ? file : `_${file}`;
    const destPath = join(destDir, destFile);
    writeFileSync(destPath, content, "utf-8");

    // Remove from works
    unlinkSync(srcPath);
    moved++;
  }
}

console.log(`Moved ${moved} files from works/ to projects/ (with _ prefix)`);

// Clean up empty works directories
for (const locale of locales) {
  try {
    const dir = join(WORKS_DIR, locale);
    const remaining = readdirSync(dir);
    if (remaining.length === 0) {
      statSync(dir); // just verify it exists
      console.log(`works/${locale}/ is now empty`);
    }
  } catch {}
}
