#!/usr/bin/env node
/**
 * Converts JSON frontmatter in markdown files to YAML list syntax.
 * Empty arrays are dropped entirely.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else if (f.endsWith(".md")) results.push(full);
  }
  return results;
}

function yamlValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str === "") return '""';
  // Check if quoting needed
  if (
    /[:{}\[\],&*?|>!%@`#'"\n\\]/.test(str) ||
    str.startsWith(" ") ||
    str.endsWith(" ") ||
    str === "true" ||
    str === "false" ||
    str === "null" ||
    str === "yes" ||
    str === "no" ||
    /^\d/.test(str)
  ) {
    return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return str;
}

function objectToYaml(data) {
  let yaml = "";
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue; // Drop empty arrays
      if (typeof value[0] === "object" && value[0] !== null) {
        // Object items
        yaml += `${key}:\n`;
        for (const item of value) {
          const entries = Object.entries(item);
          yaml += `  - ${entries[0][0]}: ${yamlValue(entries[0][1])}\n`;
          for (let i = 1; i < entries.length; i++) {
            yaml += `    ${entries[i][0]}: ${yamlValue(entries[i][1])}\n`;
          }
        }
      } else {
        // String items
        yaml += `${key}:\n`;
        for (const item of value) {
          yaml += `  - ${yamlValue(item)}\n`;
        }
      }
    } else if (typeof value === "object" && value !== null) {
      yaml += `${key}:\n`;
      for (const [k, v] of Object.entries(value)) {
        yaml += `  ${k}: ${yamlValue(v)}\n`;
      }
    } else if (typeof value === "boolean") {
      yaml += `${key}: ${value}\n`;
    } else {
      yaml += `${key}: ${yamlValue(value)}\n`;
    }
  }
  return yaml;
}

const files = walk("src/content");
let converted = 0;

for (const f of files) {
  const content = readFileSync(f, "utf-8");

  // Only process files with JSON frontmatter
  const jsonMatch = content.match(/^---\s*\r?\n(\{[\s\S]*?\})\s*\r?\n---/);
  if (!jsonMatch) continue;

  try {
    const data = JSON.parse(jsonMatch[1]);
    const yaml = objectToYaml(data);
    const body = content.slice(jsonMatch[0].length);
    const newContent = "---\n" + yaml + "---" + body;

    if (newContent !== content) {
      writeFileSync(f, newContent, "utf-8");
      converted++;
    }
  } catch (e) {
    console.error(`Error parsing ${f}: ${e.message}`);
  }
}

console.log(`Converted ${converted} files from JSON to YAML frontmatter`);
