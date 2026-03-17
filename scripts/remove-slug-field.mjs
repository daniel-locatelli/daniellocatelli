#!/usr/bin/env node
/**
 * Removes the "Slug" field from all markdown frontmatter in src/content/.
 * Handles both JSON frontmatter and YAML frontmatter formats.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function walkDir(dir) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...walkDir(full));
    else if (f.endsWith(".md")) results.push(full);
  }
  return results;
}

const contentDir = join(ROOT, "src", "content");
const files = walkDir(contentDir);

let modified = 0;

for (const filePath of files) {
  const content = readFileSync(filePath, "utf-8");

  // Detect JSON frontmatter: ---\n{ ... }\n---
  const jsonMatch = content.match(/^---\s*\n(\{[\s\S]*?\})\s*\n---/);

  let newContent;

  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1]);
      if ("Slug" in json) {
        delete json.Slug;
        const jsonStr = JSON.stringify(json, null, 2);
        newContent = content.replace(jsonMatch[0], `---\n${jsonStr}\n---`);
      }
    } catch {
      // Fall through to YAML handling
    }
  }

  if (!newContent) {
    // YAML frontmatter: remove Slug line
    const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      const frontmatter = yamlMatch[1];
      const slugLineRegex = /^Slug:.*\n?/m;
      if (slugLineRegex.test(frontmatter)) {
        const newFrontmatter = frontmatter.replace(slugLineRegex, "");
        newContent = content.replace(
          yamlMatch[0],
          `---\n${newFrontmatter}---`
        );
      }
    }
  }

  if (newContent && newContent !== content) {
    writeFileSync(filePath, newContent, "utf-8");
    modified++;
  }
}

console.log(`Done! Removed Slug from ${modified} of ${files.length} files.`);
