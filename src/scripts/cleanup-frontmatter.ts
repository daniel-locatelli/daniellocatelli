import fs from "node:fs";
// import path from "node:path";
import { globSync } from "glob";

const CONTENT_DIR = "src/content";

// Fields to remove entirely
const FIELDS_TO_REMOVE = [
  "PageId",
  "ShortDescription",
  "ShortDescription_de",
  "ShortDescription_pt",
  "References",
  "DatabasesRef",
  "Locale",
  "Development",
  "Director",
  "Manager",
  "Team",
  "Apps",
  "Icon",
  "Disclosed",
  "Active",
  "LinkedIn",
  "Title",
  "Format",
  "Country",
  "Photo",
  "CoverAlt_de",
  "CoverAlt_pt",
  "Description_de",
  "Description_pt",
  "Name_de",
  "Name_pt",
  "Name_en",
];

function cleanupFrontmatter() {
  const files = globSync(`${CONTENT_DIR}/**/*.md`);
  console.log(`Found ${files.length} markdown files.`);

  for (const filePath of files) {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const match = rawContent.match(/^---\n([\s\S]+?)\n---/);

    if (!match) continue;

    const fmText = match[1].trim();
    let fm: any;

    if (fmText.startsWith("{")) {
      // Try to parse as JSON/JS object using eval (to handle trailing commas/unquoted keys)
      try {
        // biome-ignore lint/security/noDirectEval: <explanation>
        fm = eval(`(${fmText})`);
      } catch (e: any) {
        console.error(`Failed to parse JSON in ${filePath}:`, e.message);
        continue;
      }
    } else {
      // Try simple YAML-like parser
      fm = {};
      const lines = fmText.split("\n");
      for (const line of lines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim();
          let val: any = line.substring(colonIndex + 1).trim();

          // Basic cleanup for quoted strings
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
          }

          fm[key] = val;
        }
      }
    }

    if (!fm) continue;

    const newFm: any = {};

    // 1. Copy essential fields and simplify
    const Keys = Object.keys(fm);
    for (const key of Keys) {
      if (FIELDS_TO_REMOVE.includes(key)) continue;

      let val = fm[key];

      // Remove null or empty string values
      if (val === null || val === "") continue;

      // Simplify Cover
      if (key === "Cover" && typeof val === "object") {
        if (val.Url) {
          newFm[key] = val.Url;
        }
        continue;
      }

      // Simplify Arrays of Objects (Tags, Authors, City, etc.)
      if (
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === "object" &&
        val[0].name
      ) {
        newFm[key] = val.map((item: any) => item.name);
        continue;
      }

      // Simplify Language
      if (key === "Language" && Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === "object" && val[0].name) {
          newFm[key] = val[0].name;
        } else if (val.length > 0 && typeof val[0] === "string") {
          newFm[key] = val[0];
        }
        continue;
      }

      // Simplify Link
      if (key === "Link") {
        if (Array.isArray(val) && val.length > 0) {
          const firstLink = val[0];
          if (firstLink.PlainText && firstLink.Href) {
            newFm[key] = {
              Text: firstLink.PlainText,
              Href: firstLink.Href,
            };
          } else if (
            firstLink.Text &&
            firstLink.Text.Content &&
            firstLink.Href
          ) {
            newFm[key] = {
              Text: firstLink.Text.Content,
              Href: firstLink.Href,
            };
          } else if (firstLink.Text && firstLink.Href) {
            newFm[key] = {
              Text: firstLink.Text,
              Href: firstLink.Href,
            };
          } else {
            newFm[key] = firstLink; // Might already be { Text, Href }
          }
        } else {
          newFm[key] = val;
        }
        continue;
      }

      newFm[key] = val;
    }

    const newFrontmatterStr = JSON.stringify(newFm, null, 2);
    const newContent = rawContent.replace(match[1].trim(), newFrontmatterStr);

    fs.writeFileSync(filePath, newContent, "utf-8");
  }

  console.log("Cleanup complete.");
}

cleanupFrontmatter();
