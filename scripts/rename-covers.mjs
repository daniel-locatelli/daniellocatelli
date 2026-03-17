#!/usr/bin/env node
/**
 * Renames cover-cover.* files to {slug}-cover.* based on parent directory name.
 * Updates all Cover: references in markdown files.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Step 1: Find all cover-cover.* files and build rename map
function findCoverFiles(dir) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      results.push(...findCoverFiles(full));
    } else if (f.startsWith("cover-cover")) {
      results.push(full);
    }
  }
  return results;
}

const assetsDir = join(ROOT, "src", "assets", "content");
const coverFiles = findCoverFiles(assetsDir);

const renameMap = new Map(); // old relative path → new relative path

for (const oldPath of coverFiles) {
  const dir = dirname(oldPath);
  const ext = extname(oldPath);
  const parentDir = basename(dir);

  // For top-level covers like /projects/cover-cover.jpg, use the collection name
  const slug = parentDir;
  const newFileName = `${slug}-cover${ext}`;
  const newPath = join(dir, newFileName);

  // Relative paths as used in frontmatter: /assets/content/...
  const oldRel = oldPath.replace(join(ROOT, "src"), "").replace(/\\/g, "/");
  const newRel = newPath.replace(join(ROOT, "src"), "").replace(/\\/g, "/");

  renameMap.set(oldRel, newRel);

  // Rename the actual file
  if (existsSync(oldPath) && oldPath !== newPath) {
    renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldRel} → ${newRel}`);
  }
}

// Step 2: Update all markdown files
function findMdFiles(dir) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...findMdFiles(full));
    else if (f.endsWith(".md")) results.push(full);
  }
  return results;
}

const contentDir = join(ROOT, "src", "content");
const mdFiles = findMdFiles(contentDir);
let updatedFiles = 0;

for (const mdFile of mdFiles) {
  let content = readFileSync(mdFile, "utf-8");
  let changed = false;

  for (const [oldRel, newRel] of renameMap) {
    // Match both quoted and unquoted Cover references
    if (content.includes(oldRel)) {
      content = content.replaceAll(oldRel, newRel);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(mdFile, content, "utf-8");
    updatedFiles++;
  }
}

console.log(`\nRenamed ${renameMap.size} cover files`);
console.log(`Updated ${updatedFiles} markdown files`);
