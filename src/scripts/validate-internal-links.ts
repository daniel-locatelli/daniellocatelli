/**
 * Validates that internal links in content frontmatter point to existing content entries.
 *
 * Scans all content collections for Link fields starting with "/" and verifies:
 * 1. The target content file exists (in the en/ directory as canonical source)
 * 2. The target entry is not underscore-prefixed (excluded from collection, no page generated)
 *
 * Usage: npx tsx src/scripts/validate-internal-links.ts
 */

import { readdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = join(import.meta.dirname, "..", "content");
const PUBLIC_DIR = join(import.meta.dirname, "..", "..", "public");
const COLLECTIONS = [
  "certifications",
  "courses-attended",
  "education",
  "experiences",
  "projects",
  "publications",
  "research",
  "scholarships",
  "skills",
  "teaching",
];

interface ContentLink {
  file: string;
  link: string;
  line: number;
}

interface ValidationError {
  file: string;
  link: string;
  line: number;
  reason: string;
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getMarkdownFiles(fullPath)));
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
  return files;
}

function extractFrontmatterLinks(
  content: string,
  filePath: string,
): ContentLink[] {
  const links: ContentLink[] = [];
  const lines = content.split("\n");

  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      }
      break; // End of frontmatter
    }

    if (!inFrontmatter) continue;

    // Match Link fields with internal paths
    const linkMatch = lines[i].match(
      /^\s*(?:Link|Href):\s*"?(\/[^"\s]+)"?\s*$/,
    );
    if (linkMatch) {
      links.push({
        file: filePath,
        link: linkMatch[1],
        line: i + 1,
      });
    }
  }

  return links;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkEntryExists(link: string): Promise<string | null> {
  const parts = link.replace(/^\//, "").split("/");
  if (parts.length < 2) {
    return `Invalid internal link format: expected /{collection}/{slug}`;
  }

  const [collection, ...slugParts] = parts;
  const slug = slugParts.join("/");

  // If it's not a known collection, check if it exists as a static file in public/
  if (!COLLECTIONS.includes(collection)) {
    const staticPath = join(PUBLIC_DIR, link.replace(/^\//, ""));
    if (await fileExists(staticPath)) {
      return null; // Valid static file
    }
    return `No static file at "public${link}" and no collection named "${collection}"`;
  }

  const collectionDir = join(CONTENT_DIR, collection, "en");
  const possibleFiles = [`${slug}.md`, `${slug}.mdx`];

  for (const filename of possibleFiles) {
    // Underscore-prefixed files are excluded from Astro content collections
    if (filename.startsWith("_")) {
      return `Target entry "${collection}/en/${filename}" is underscore-prefixed (no page generated)`;
    }

    const filePath = join(collectionDir, filename);
    try {
      await readFile(filePath, "utf-8");
      return null; // File exists and is active
    } catch {
      // File doesn't exist, try next
    }
  }

  return `No content file found for "${collection}/en/${slug}.md"`;
}

async function main() {
  const allLinks: ContentLink[] = [];
  const errors: ValidationError[] = [];

  // Collect all internal links from content files
  for (const collection of COLLECTIONS) {
    const collectionDir = join(CONTENT_DIR, collection);
    const files = await getMarkdownFiles(collectionDir);

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const links = extractFrontmatterLinks(content, file);
      allLinks.push(...links);
    }
  }

  console.log(`Found ${allLinks.length} internal link(s) in content files.\n`);

  // Validate each link
  for (const { file, link, line } of allLinks) {
    const error = await checkEntryExists(link);
    if (error) {
      errors.push({ file, link, line, reason: error });
    }
  }

  if (errors.length === 0) {
    console.log("All internal links are valid.");
    process.exit(0);
  }

  console.error(`Found ${errors.length} broken internal link(s):\n`);
  for (const { file, link, line, reason } of errors) {
    const relFile = file.replace(CONTENT_DIR, "src/content");
    console.error(`  ${relFile}:${line}`);
    console.error(`    Link: ${link}`);
    console.error(`    Error: ${reason}\n`);
  }

  process.exit(1);
}

main();
