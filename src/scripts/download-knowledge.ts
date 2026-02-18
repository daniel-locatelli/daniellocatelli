import "dotenv/config";
import { t as cvEn } from "../i18n/cv/en";
import { t as cvPt } from "../i18n/cv/pt";

import fs from "node:fs";
import path from "node:path";
import {
  getAllDatabases,
  getDatabasePages,
  getAllBlocksByBlockId,
} from "../lib/notion/api";
import { NOTION_API_SECRET } from "../server-constants";
import type { Block, Page } from "../lib/notion-interfaces";

async function main() {
  if (!NOTION_API_SECRET) {
    console.error("NOTION_API_SECRET is not set");

    process.exit(1);
  }

  console.log("Fetching all databases...");
  const databases = await getAllDatabases();
  console.log(`Found ${databases.length} databases.`);

  const knowledgeDir = path.join(process.cwd(), "knowledge");
  if (!fs.existsSync(knowledgeDir)) {
    fs.mkdirSync(knowledgeDir);
  }

  console.log("Generating Full CV Markdowns (EN & PT)...");
  const cvMarkdownEn = generateCVMarkdown(cvEn);
  const cvMarkdownPt = generateCVMarkdown(cvPt);
  fs.writeFileSync(path.join(knowledgeDir, "full-cv-en.md"), cvMarkdownEn);
  fs.writeFileSync(path.join(knowledgeDir, "full-cv-pt.md"), cvMarkdownPt);
  console.log("CVs saved to knowledge/");

  for (const database of databases) {
    console.log(`Processing database: ${database.Title}`);
    try {
      const pages = await getDatabasePages(database.Id, database.Title);
      console.log(`  Found ${pages.length} pages in ${database.Title}`);

      for (const page of pages) {
        // Skip non-active or private pages if needed, but for now we take all
        if (page.Active === false) continue; // Example filter

        const pageName = page.Name || "Untitled";
        const safeName = pageName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const fileName = `${safeName}-${page.PageId}.md`;
        const filePath = path.join(knowledgeDir, fileName);

        console.log(`    Fetching blocks for page: ${pageName}`);
        const blocks = await getAllBlocksByBlockId(page.PageId);

        const markdown = blocksToMarkdown(blocks, page);

        fs.writeFileSync(filePath, markdown);
      }
    } catch (err) {
      console.error(`  Error processing database ${database.Title}:`, err);
    }
  }
}

function blocksToMarkdown(blocks: Block[], page: Page): string {
  let md = `# ${page.Name}\n\n`;

  // Add Metadata
  if (page.Description) md += `Description: ${page.Description}\n`;
  if (page.Tags && page.Tags.length > 0)
    md += `Tags: ${page.Tags.map((t) => t.name).join(", ")}\n`;
  md += `\n`;

  // Process blocks
  for (const block of blocks) {
    md += blockToMarkdown(block) + "\n";
  }

  return md;
}

function blockToMarkdown(block: Block): string {
  let content = "";
  switch (block.Type) {
    case "paragraph":
      content += richTextToMarkdown(block.Paragraph?.RichTexts);
      break;
    case "heading_1":
      content += `# ${richTextToMarkdown(block.Heading1?.RichTexts)}`;
      break;
    case "heading_2":
      content += `## ${richTextToMarkdown(block.Heading2?.RichTexts)}`;
      break;
    case "heading_3":
      content += `### ${richTextToMarkdown(block.Heading3?.RichTexts)}`;
      break;
    case "bulleted_list_item":
      content += `- ${richTextToMarkdown(block.BulletedListItem?.RichTexts)}`;
      if (block.BulletedListItem?.Children) {
        content +=
          "\n" +
          block.BulletedListItem.Children.map(
            (b) => "  " + blockToMarkdown(b),
          ).join("");
      }
      break;
    case "numbered_list_item":
      content += `1. ${richTextToMarkdown(block.NumberedListItem?.RichTexts)}`;
      if (block.NumberedListItem?.Children) {
        content +=
          "\n" +
          block.NumberedListItem.Children.map(
            (b) => "  " + blockToMarkdown(b),
          ).join("");
      }
      break;
    case "to_do":
      content += `- [${block.ToDo?.Checked ? "x" : " "}] ${richTextToMarkdown(block.ToDo?.RichTexts)}`;
      if (block.ToDo?.Children) {
        content +=
          "\n" +
          block.ToDo.Children.map((b) => "  " + blockToMarkdown(b)).join("");
      }
      break;
    case "code":
      content += `\`\`\`${block.Code?.Language}\n${richTextToMarkdown(block.Code?.RichTexts)}\n\`\`\``;
      break;
    case "quote":
      content += `> ${richTextToMarkdown(block.Quote?.RichTexts)}`;
      break;
    // Ignore images/video/embeds as requested
    default:
      break;
  }
  return content;
}

function richTextToMarkdown(richTexts: any[] | undefined): string {
  if (!richTexts) return "";
  return richTexts
    .map((rt) => {
      let text = rt.PlainText;
      if (rt.Annotation.Bold) text = `**${text}**`;
      if (rt.Annotation.Italic) text = `*${text}*`;
      if (rt.Annotation.Strikethrough) text = `~~${text}~~`;
      if (rt.Annotation.Code) text = `\`${text}\``;
      if (rt.Href) text = `[${text}](${rt.Href})`;
      return text;
    })
    .join("");
}

function generateCVMarkdown(cv: typeof import("../i18n/cv/en").t): string {
  let md = `# ${cv.meta.titleFull}\n\n`;
  md += `> ${cv.quote}\n\n`;

  md += `## ${cv.ui.summary}\n`;
  md += `${cv.summary}\n\n`;

  md += `## ${cv.ui.skills}\n`;
  md += `### ${cv.ui.programming}\n`;
  md +=
    cv.skillsProgramming.map((s) => `- ${s.title}: ${s.level}`).join("\n") +
    "\n\n";
  md += `### ${cv.ui.frameworks}\n`;
  md +=
    cv.skillsFrameworks.map((s) => `- ${s.title}: ${s.level}`).join("\n") +
    "\n\n";
  md += `### ${cv.ui.databases}\n`;
  md +=
    cv.skillsDatabases.map((s) => `- ${s.title}: ${s.level}`).join("\n") +
    "\n\n";

  md += `## ${cv.ui.professionalExperience}\n`;
  for (const exp of cv.experiences) {
    md += `### ${exp.title} at ${exp.company}\n`;
    md += `*${exp.startDate} - ${exp.endDate || cv.ui.current} | ${exp.location}*\n`;
    if (exp.items) {
      md += exp.items.map((i) => `- ${i}`).join("\n") + "\n";
    }
    md += "\n";
  }

  md += `## ${cv.ui.education}\n`;
  for (const edu of cv.education) {
    md += `### ${edu.title} at ${edu.institution}\n`;
    md += `*${edu.startDate} - ${edu.endDate || cv.ui.current} | ${edu.location}*\n`;
    if (edu.description) md += `${edu.description}\n`;
    md += "\n";
  }

  return md;
}

main().catch(console.error);
