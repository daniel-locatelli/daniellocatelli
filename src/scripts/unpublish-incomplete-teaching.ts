import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

const TEACHING_DIR = "src/content/teaching";

function unpublishIncomplete() {
  const files = globSync(`${TEACHING_DIR}/**/*.md`);
  console.log(`Auditing ${files.length} teaching items...`);

  let count = 0;
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
        // biome-ignore lint/security/noDirectEval: parsing frontmatter
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

    const hasCover =
      fm.Cover && fm.Cover !== "" && fm.Cover !== "null" && fm.Cover !== '""';
    const hasContent = bodyText.length > 15; // Increased threshold to catch "Check Date"

    // If it has NEITHER, definitely unpublish.
    // If it has NO cover AND NO substantial content (like GraphisoftX2023), unpublish.
    if (!hasCover && !hasContent) {
      const dir = path.dirname(filePath);
      const newPath = path.join(dir, `_${fileName}`);

      console.log(`Unpublishing: ${filePath}`);
      fs.renameSync(filePath, newPath);
      count++;
    }
  }

  console.log(`Unpublished ${count} more incomplete items.`);
}

unpublishIncomplete();
