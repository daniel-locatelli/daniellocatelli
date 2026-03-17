#!/usr/bin/env node
/**
 * CV Content Migration Script
 * Generates Astro content collection markdown files from CV i18n TypeScript files.
 *
 * Usage: node scripts/generate-cv-content.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "src", "content");
const LOCALES = ["en", "pt", "de"];

// ========== HELPERS ==========

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

function escapeYaml(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str === "") return '""';
  const needsQuoting =
    /[:{}\[\],&*?|>!%@`#'"\n\\]/.test(str) ||
    str.startsWith(" ") ||
    str.endsWith(" ") ||
    str === "true" ||
    str === "false" ||
    str === "null" ||
    str === "yes" ||
    str === "no" ||
    /^\d/.test(str);
  if (needsQuoting) {
    return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return str;
}

function extractCity(location) {
  if (!location) return null;
  const parts = location.split(",");
  return parts[0].trim();
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function buildFrontmatter(fields) {
  let yaml = "---\n";
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        yaml += `${key}: []\n`;
      } else {
        yaml += `${key}:\n`;
        for (const item of value) {
          yaml += `  - ${escapeYaml(item)}\n`;
        }
      }
    } else if (typeof value === "object" && value !== null) {
      yaml += `${key}:\n`;
      for (const [k, v] of Object.entries(value)) {
        yaml += `  ${k}: ${escapeYaml(v)}\n`;
      }
    } else {
      yaml += `${key}: ${escapeYaml(value)}\n`;
    }
  }
  yaml += "---\n";
  return yaml;
}

function writeMd(filePath, fields, body = "") {
  ensureDir(dirname(filePath));
  const frontmatter = buildFrontmatter(fields);
  const content = body ? `${frontmatter}\n${body}\n` : frontmatter;
  writeFileSync(filePath, content, "utf-8");
}

// ========== PARSE CV DATA ==========

function parseCV(locale) {
  const filePath = join(ROOT, "src", "i18n", "cv", `${locale}.ts`);
  let content = readFileSync(filePath, "utf-8");
  content = content.replace(/^import type.*;\r?\n/m, "");
  content = content.replace(/^export const t:\s*I18nCV\s*=\s*/m, "return ");
  try {
    return new Function(content)();
  } catch (e) {
    console.error(`Error parsing ${locale}.ts:`, e.message);
    throw e;
  }
}

const data = {};
for (const locale of LOCALES) {
  data[locale] = parseCV(locale);
  console.log(
    `Parsed ${locale}.ts (${data[locale].experiences.length} experiences, ${data[locale].works.length} works)`
  );
}

// ========== SLUG GENERATORS ==========

function makeUniqueSlugs(entries, disambiguate) {
  const slugs = [];
  const counts = {};

  for (const entry of entries) {
    const base = slugify(entry.title);
    counts[base] = (counts[base] || 0) + 1;
  }

  const used = {};
  for (let i = 0; i < entries.length; i++) {
    const base = slugify(entries[i].title);
    let slug;
    if (counts[base] > 1) {
      const suffix = slugify(disambiguate(entries[i]));
      slug = `${base}-${suffix}`;
    } else {
      slug = base;
    }
    // Final dedup
    if (used[slug]) {
      let n = 2;
      while (used[`${slug}-${n}`]) n++;
      slug = `${slug}-${n}`;
    }
    used[slug] = true;
    slugs.push(slug);
  }

  return slugs;
}

// ========== SECTION PROCESSORS ==========

let totalFiles = 0;

function processExperiences() {
  const collection = "experiences";
  const enEntries = data.en.experiences;
  const slugs = makeUniqueSlugs(enEntries, (e) => e.company);

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].experiences;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.company,
        City: entry.location ? [extractCity(entry.location)] : [],
        Category: "Professional Experience",
      };

      if (entry.link) fields.Link = entry.link;

      let body = "";
      if (entry.companyNote) {
        body += `*${entry.companyNote}*\n\n`;
      }
      if (entry.titleNote) {
        body += `*${entry.titleNote}*\n\n`;
      }
      if (entry.items && entry.items.length > 0) {
        for (const item of entry.items) {
          body += `- ${item}\n`;
        }
      }

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields, body.trim());
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processEducation() {
  const collection = "education";
  const enEntries = data.en.education;
  const slugs = makeUniqueSlugs(enEntries, (e) => e.institution);

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].education;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        Description: entry.description,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.institution,
        City: entry.location ? [extractCity(entry.location)] : [],
      };

      if (entry.link) fields.Link = entry.link;

      const authors = [];
      if (entry.supervisors) authors.push(...entry.supervisors);
      if (entry.advisors) authors.push(...entry.advisors);
      if (authors.length > 0) fields.Authors = authors;

      let body = "";
      if (entry.supervisors && entry.supervisors.length > 0) {
        body += `**Supervisors:** ${entry.supervisors.join(", ")}\n\n`;
      }
      if (entry.advisors && entry.advisors.length > 0) {
        body += `**Advisors:** ${entry.advisors.join(", ")}\n\n`;
      }

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields, body.trim());
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processScholarships() {
  const collection = "scholarships";
  const enEntries = data.en.scholarships;
  const slugs = makeUniqueSlugs(enEntries, (e) => e.institution);

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].scholarships;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        Description: entry.description,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.institution,
        City: entry.location ? [extractCity(entry.location)] : [],
      };

      if (entry.link) fields.Link = entry.link;

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields);
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processCertifications() {
  const collection = "certifications";
  const enEntries = data.en.certifications;
  const slugs = makeUniqueSlugs(enEntries, (e) => e.issuer);

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].certifications;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        DateStart: entry.date,
        Organization: entry.issuer,
      };

      if (entry.link) fields.Link = entry.link;
      if (entry.description) fields.Description = entry.description;

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields);
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processEngagements() {
  const collection = "engagements";
  const enEntries = data.en.engagements;
  const slugs = makeUniqueSlugs(
    enEntries,
    (e) => `${e.organization}-${e.startDate}`
  );

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].engagements;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const enType = data.en.engagements[i].type;
      const typeLabel = enType.charAt(0).toUpperCase() + enType.slice(1);

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.organization,
        City: entry.location ? [extractCity(entry.location)] : [],
        Category: typeLabel,
      };

      if (entry.link) fields.Link = entry.link;
      if (entry.description) fields.Description = entry.description;

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields);
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processCoursesAttended() {
  const collection = "courses-attended";
  const enEntries = data.en.coursesAttended;
  const slugs = makeUniqueSlugs(
    enEntries,
    (e) => e.organization || e.startDate
  );

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].coursesAttended;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.organization,
        City: entry.location ? [extractCity(entry.location)] : [],
        Authors: entry.instructor ? [entry.instructor] : [],
      };

      if (entry.link) fields.Link = entry.link;
      if (entry.description) fields.Description = entry.description;

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields);
      totalFiles++;
    }
  }

  console.log(
    `  ✓ ${collection}: ${enEntries.length} entries × ${LOCALES.length} locales`
  );
}

function processWorks() {
  const collection = "works";
  const enEntries = data.en.works;
  const slugs = makeUniqueSlugs(enEntries, (e) => e.company || e.startDate);

  for (let i = 0; i < enEntries.length; i++) {
    for (const locale of LOCALES) {
      const entries = data[locale].works;
      if (i >= entries.length) continue;
      const entry = entries[i];
      const slug = slugs[i];

      const fields = {
        Name: entry.title,
        Slug: `${collection}/${slug}`,
        Description: entry.description,
        DateStart: entry.startDate,
        DateEnd: entry.endDate,
        Organization: entry.company,
        Category: entry.category,
      };

      if (entry.location) fields.City = [extractCity(entry.location)];
      if (entry.link) fields.Link = entry.link;

      const filePath = join(CONTENT_DIR, collection, locale, `${slug}.md`);
      writeMd(filePath, fields);
      totalFiles++;
    }
  }

  const deCt = Math.min(enEntries.length, data.de.works.length);
  const ptCt = Math.min(enEntries.length, data.pt.works.length);
  console.log(
    `  ✓ ${collection}: ${enEntries.length} en, ${ptCt} pt, ${deCt} de`
  );
}

// ========== MAIN ==========

console.log("\nGenerating CV content collections...\n");

processExperiences();
processEducation();
processScholarships();
processCertifications();
processEngagements();
processCoursesAttended();
processWorks();

console.log(`\nDone! Generated ${totalFiles} markdown files.`);
console.log("\nRemember to:");
console.log(
  "  1. Add new collections to src/content/config.ts"
);
console.log(
  "  2. Publications already exist in the 'publications' collection"
);
console.log("  3. Skills already exist in the 'skills' collection");
