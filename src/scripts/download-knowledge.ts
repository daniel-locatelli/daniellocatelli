import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import {
  getAllDatabases,
  getDatabasePages,
  getAllBlocksByBlockId,
} from "../lib/notion/api";
import { NOTION_API_SECRET } from "../server-constants";
import type { Block, Page } from "../lib/notion-interfaces";
import { siteConfig } from "../site.config";
import * as cheerio from "cheerio";

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

  try {
    const cvMarkdownEn = await fetchCVMarkdown("en");
    fs.writeFileSync(path.join(knowledgeDir, "full-cv-en.md"), cvMarkdownEn);
    console.log("Saved full-cv-en.md");

    const cvMarkdownPt = await fetchCVMarkdown("pt");
    fs.writeFileSync(path.join(knowledgeDir, "full-cv-pt.md"), cvMarkdownPt);
    console.log("Saved full-cv-pt.md");
  } catch (error) {
    console.error("Error fetching CVs:", error);
  }

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

async function fetchCVMarkdown(locale: string): Promise<string> {
  const baseUrl = process.env.WEBSITE_URL || siteConfig.website;
  let url = `${baseUrl}${locale === siteConfig.defaultLocale ? "" : "/" + locale}/full-cv`;

  // Specific override if needed, but siteConfig logic should hold.
  // User reported issues with previous generation, so fetching live is safer.

  console.log(`Fetching CV from ${url}...`);
  let res = await fetch(url);

  if (!res.ok && locale === "en") {
    // Fallback strategies for EN if default fails (e.g. maybe it IS at /en/full-cv)
    const altUrl = `${siteConfig.website}/en/full-cv`;
    console.log(`Failed (${res.status}). Trying ${altUrl}...`);
    const res2 = await fetch(altUrl);
    if (res2.ok) {
      url = altUrl;
      res = res2;
    } else {
      throw new Error(`Failed to fetch CV from ${url} and ${altUrl}`);
    }
  } else if (!res.ok) {
    throw new Error(
      `Failed to fetch CV from ${url}: ${res.status} ${res.statusText}`,
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Clean up
  $("nav").remove();
  $("footer").remove();
  $("header").remove();
  $("script").remove();
  $("style").remove();
  $("[class*='nav']").remove();
  $("[class*='menu']").remove();

  // Try to find main content
  let contentHtml = $("main").html();
  if (!contentHtml) {
    console.warn("No <main> tag found, using body content.");
    contentHtml = $("body").html() || "";
  }

  // Extract plain text instead of Markdown
  const text = $(contentHtml).text() || "";

  // Clean up whitespace: remove only multiple spaces, keep newlines for structure
  const cleanText = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");

  // Return with URL prefix for exclude/combine script
  return `URL: ${url}\n\n${cleanText}`;
}

function blocksToMarkdown(blocks: Block[], page: Page): string {
  const isDefaultLocale =
    page.Locale === siteConfig.defaultLocale || !page.Locale;
  const url = `${siteConfig.website}${isDefaultLocale ? "" : "/" + page.Locale}/${page.Slug}`;

  let md = `URL: ${url}\n\n`;
  md += `# ${page.Name}\n\n`;

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

main().catch(console.error);
