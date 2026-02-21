import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

const TEACHING_DIR = "src/content/teaching";

function auditTeaching() {
  const files = globSync(`${TEACHING_DIR}/**/*.md`);
  console.log(`Auditing ${files.length} teaching items...`);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    if (fileName.startsWith("_")) continue;

    const rawContent = fs.readFileSync(filePath, "utf-8");
    const parts = rawContent.split("---");
    if (parts.length < 3) continue;

    const fmText = parts[1].trim();
    const bodyText = parts.slice(2).join("---").trim();

    let fm: any;
    try {
      if (fmText.startsWith("{")) {
        fm = eval(`(${fmText})`);
      } else {
        fm = {};
        for (const line of fmText.split("\n")) {
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            fm[line.substring(0, colonIndex).trim()] = line
              .substring(colonIndex + 1)
              .trim();
          }
        }
      }
    } catch (e) {
      continue;
    }

    const hasCover = fm.Cover && fm.Cover !== "" && fm.Cover !== "null";
    const hasContent = bodyText.length > 5;

    if (!hasCover) {
      console.log(`[MISSING COVER]: ${filePath}`);
    }
    if (!hasContent) {
      console.log(`[MISSING CONTENT]: ${filePath}`);
    }
  }
}

auditTeaching();
