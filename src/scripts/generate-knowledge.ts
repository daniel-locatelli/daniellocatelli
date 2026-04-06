/**
 * generate-knowledge.ts
 *
 * Reads all portfolio content from source files and generates
 * clean markdown knowledge files for embedding into Supabase.
 *
 * Sources:
 * 1. Content collections (projects, research, teaching, publications) — all locales
 * 2. CV data from content collections (experiences, education, certifications,
 *    scholarships, courses-attended, skills)
 * 3. Homepage content from i18n/home files (en, pt)
 *
 * Run: npx tsx src/scripts/generate-knowledge.ts
 */

import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const CONTENT_DIR = path.join(process.cwd(), "src/content");
const BASE_URL = "https://daniellocatelli.com";
const LOCALES = ["en", "pt", "de"];

// ─── Helpers ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanMarkdownBody(body: string): string {
  // Remove MDX import statements
  let cleaned = body.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, "");
  // Remove MDX/JSX components (e.g., <YouTube id="..." />)
  cleaned = cleaned.replace(/<[A-Z]\w+[^>]*\/>/g, "");
  cleaned = cleaned.replace(/<[A-Z]\w+[^>]*>[\s\S]*?<\/[A-Z]\w+>/g, "");
  // Remove image references, including multi-line alt text
  cleaned = cleaned.replace(/!\[[\s\S]*?\]\(.*?\)/g, "");
  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

function parseFrontmatter(content: string): {
  data: Record<string, any>;
  body: string;
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  try {
    const data = YAML.parse(match[1]);
    return { data: data || {}, body: match[2] };
  } catch {
    return { data: {}, body: content };
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function writeKnowledge(filename: string, content: string): void {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  fs.writeFileSync(filePath, content, "utf-8");
}

function readContentFiles(
  collection: string,
  locale: string,
): { data: Record<string, any>; body: string; filename: string }[] {
  const dir = path.join(CONTENT_DIR, collection, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { data, body, filename: file };
    })
    .filter((entry) => entry.data.Name);
}

// ─── Content Collections ──────────────────────────────────────────────

function processContentCollections() {
  const collections = ["projects", "research", "teaching", "publications"];
  let count = 0;

  for (const collection of collections) {
    for (const locale of LOCALES) {
      const entries = readContentFiles(collection, locale);

      for (const { data, body, filename } of entries) {
        const baseFilename = filename.replace(/\.(md|mdx)$/, "");
        const isUnpublished = baseFilename.startsWith("_");

        // Build URL
        const urlPrefix = locale === "en" ? "" : `/${locale}`;
        const cleanSlug = baseFilename.replace(/^_/, "");
        const url = isUnpublished
          ? `${BASE_URL}${urlPrefix}/full-cv`
          : `${BASE_URL}${urlPrefix}/${collection}/${cleanSlug}`;

        // Build metadata section
        const metaParts: string[] = [];
        if (data.Description) metaParts.push(`Description: ${data.Description}`);
        if (data.Tags?.length) metaParts.push(`Tags: ${data.Tags.join(", ")}`);
        if (data.Category) metaParts.push(`Category: ${data.Category}`);
        if (data.Authors?.length) {
          const authors = data.Authors.map((a: any) =>
            typeof a === "string" ? a : a.name,
          );
          metaParts.push(`Authors: ${authors.join(", ")}`);
        }
        if (data.Director?.length) metaParts.push(`Director: ${data.Director.join(", ")}`);
        if (data.Team?.length) metaParts.push(`Team: ${data.Team.join(", ")}`);
        if (data.Client) metaParts.push(`Client: ${data.Client}`);
        if (data.Organization) metaParts.push(`Organization: ${data.Organization}`);
        if (data.City?.length) {
          const cities = data.City.map((c: any) =>
            typeof c === "string" ? c : c.name,
          );
          metaParts.push(`Location: ${cities.join(", ")}`);
        }
        if (data.Place) metaParts.push(`Place: ${data.Place}`);
        if (data.DateStart) {
          metaParts.push(
            `Date: ${formatDate(data.DateStart)}${data.DateEnd ? ` - ${formatDate(data.DateEnd)}` : ""}`,
          );
        }
        if (data.Link) {
          const link =
            typeof data.Link === "string"
              ? data.Link
              : data.Link.Href || data.Link.href;
          if (link) metaParts.push(`Link: ${link}`);
        }
        if (data.Event) metaParts.push(`Event: ${data.Event}`);
        if (data.Language) metaParts.push(`Language: ${data.Language}`);

        // Build content
        const cleanBody = cleanMarkdownBody(body);
        const lines = [
          `URL: ${url}`,
          "",
          `# ${data.Name}`,
          "",
          ...metaParts,
          "",
        ];

        if (cleanBody) {
          lines.push(cleanBody);
        }

        const safeName = slugify(data.Name);
        const knowledgeFilename = `${safeName}-${locale}.md`;
        writeKnowledge(
          knowledgeFilename,
          lines
            .join("\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim() + "\n",
        );
        count++;
      }
    }
  }

  console.log(`Generated ${count} content collection knowledge files.`);
}

// ─── CV Individual Entries ────────────────────────────────────────────
// Generates one knowledge file per CV entry (education, experiences, etc.)
// so vector search can match specific queries like "where did you study
// for university entrance?" without the answer being diluted in a large
// aggregated file.

function processCVIndividual() {
  const cvCollections = [
    "education",
    "experiences",
    "scholarships",
    "certifications",
    "courses-attended",
  ];
  let count = 0;

  for (const collection of cvCollections) {
    for (const locale of LOCALES) {
      const entries = readContentFiles(collection, locale);
      const urlPrefix = locale === "en" ? "" : `/${locale}`;
      const url = `${BASE_URL}${urlPrefix}/full-cv`;

      for (const { data, body } of entries) {
        const metaParts: string[] = [];
        if (data.Organization) metaParts.push(`Organization: ${data.Organization}`);
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");
        if (location) metaParts.push(`Location: ${location}`);
        if (data.Category) metaParts.push(`Category: ${data.Category}`);
        if (data.DateStart) {
          metaParts.push(
            `Date: ${formatDate(data.DateStart)}${data.DateEnd ? ` - ${formatDate(data.DateEnd)}` : ""}`,
          );
        }
        if (data.Description) metaParts.push(`Description: ${data.Description}`);
        if (data.Supervisors?.length)
          metaParts.push(`Supervisors: ${data.Supervisors.join(", ")}`);
        if (data.Advisors?.length)
          metaParts.push(`Advisors: ${data.Advisors.join(", ")}`);
        if (data.Authors?.length)
          metaParts.push(`Instructor: ${data.Authors.join(", ")}`);
        if (data.Link) {
          const link =
            typeof data.Link === "string"
              ? data.Link
              : data.Link.Href || data.Link.href;
          if (link) metaParts.push(`Link: ${link}`);
        }

        const cleanBody = cleanMarkdownBody(body);
        const lines = [`URL: ${url}`, "", `# ${data.Name}`, "", ...metaParts];
        if (cleanBody) {
          lines.push("", cleanBody);
        }

        const safeName = slugify(data.Name);
        const filename = `cv-entry-${safeName}-${locale}.md`;
        writeKnowledge(
          filename,
          lines
            .join("\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim() + "\n",
        );
        count++;
      }
    }
  }

  console.log(`Generated ${count} individual CV knowledge files.`);
}

// ─── CV Timeline ─────────────────────────────────────────────────────
// Generates a single flat chronological timeline of the entire CV.
// Always injected as core context so the AI has the full career backbone.

function processCVTimeline() {
  const collections: { name: string; label: string; labelPt: string; labelDe: string }[] = [
    { name: "experiences", label: "Work", labelPt: "Trabalho", labelDe: "Beruf" },
    { name: "education", label: "Education", labelPt: "Educação", labelDe: "Bildung" },
    { name: "scholarships", label: "Scholarship", labelPt: "Bolsa", labelDe: "Stipendium" },
    { name: "certifications", label: "Certification", labelPt: "Certificação", labelDe: "Zertifizierung" },
    { name: "courses-attended", label: "Course", labelPt: "Curso", labelDe: "Kurs" },
    { name: "teaching", label: "Teaching", labelPt: "Ensino", labelDe: "Lehre" },
  ];
  let count = 0;

  for (const locale of LOCALES) {
    const urlPrefix = locale === "en" ? "" : `/${locale}`;
    const url = `${BASE_URL}${urlPrefix}/full-cv`;

    // Collect all entries with parsed dates
    const allEntries: {
      sortDate: number;
      line: string;
    }[] = [];

    for (const col of collections) {
      const entries = readContentFiles(col.name, locale);
      const label = locale === "pt" ? col.labelPt : locale === "de" ? col.labelDe : col.label;

      for (const { data } of entries) {
        const start = data.DateStart || "";
        const end = data.DateEnd || "";
        const sortDate = new Date(start).getTime() || 0;

        // Build date range string
        let dateRange = formatDate(start);
        if (end) {
          dateRange += ` \u2013 ${formatDate(end)}`;
        } else if (col.name === "experiences" && !end) {
          dateRange += locale === "pt" ? " \u2013 Atual" : locale === "de" ? " \u2013 Aktuell" : " \u2013 Current";
        }

        // Build location
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");

        const org = data.Organization || data.Place || "";
        const parts = [
          dateRange,
          `[${label}]`,
          data.Name,
          org,
          location,
        ].filter(Boolean);

        allEntries.push({
          sortDate,
          line: parts.join(" | "),
        });
      }
    }

    // Sort by date descending (most recent first)
    allEntries.sort((a, b) => b.sortDate - a.sortDate);

    const title =
      locale === "pt"
        ? "Daniel Locatelli \u2013 Linha do Tempo"
        : locale === "de"
          ? "Daniel Locatelli \u2013 Zeitleiste"
          : "Daniel Locatelli \u2013 Timeline";

    const lines = [
      `URL: ${url}`,
      "",
      `# ${title}`,
      "",
      ...allEntries.map((e) => e.line),
    ];

    writeKnowledge(
      `cv-timeline-${locale}.md`,
      lines.join("\n").trim() + "\n",
    );
    count++;
  }

  console.log(`Generated ${count} CV timeline knowledge files.`);
}

// ─── CV Aggregates ───────────────────────────────────────────────────
// Reads individual content files from CV collections and generates
// aggregated knowledge files per section per locale.

function processCVFromContent() {
  let count = 0;

  for (const locale of LOCALES) {
    const urlPrefix = locale === "en" ? "" : `/${locale}`;
    const url = `${BASE_URL}${urlPrefix}/full-cv`;

    // Helper to write a CV section
    function writeCVSection(section: string, content: string) {
      const filename = `cv-${slugify(section)}-${locale}.md`;
      const lines = [`URL: ${url}`, "", `# Daniel Locatelli \u2013 ${section}`, "", content];
      writeKnowledge(
        filename,
        lines
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim() + "\n",
      );
      count++;
    }

    // 1. Professional Experience
    const experiences = readContentFiles("experiences", locale);
    if (experiences.length > 0) {
      // Sort by date descending
      experiences.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );

      const expLines: string[] = [];
      for (const { data, body } of experiences) {
        const period = data.DateEnd
          ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
          : `${formatDate(data.DateStart)} \u2013 Current`;
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");
        expLines.push(`### ${data.Name}`);
        expLines.push(
          `${data.Organization}${location ? ` | ${location}` : ""}`,
        );
        expLines.push(period);
        expLines.push("");
        if (body.trim()) {
          expLines.push(body.trim());
          expLines.push("");
        }
      }

      const sectionName =
        locale === "pt" ? "Experi\u00EAncia Profissional" : locale === "de" ? "Berufserfahrung" : "Professional Experience";
      writeCVSection(sectionName, expLines.join("\n"));
    }

    // 2. Education & Scholarships
    const education = readContentFiles("education", locale);
    const scholarships = readContentFiles("scholarships", locale);
    if (education.length > 0 || scholarships.length > 0) {
      const eduLines: string[] = [];

      education.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      for (const { data, body } of education) {
        const period = data.DateEnd
          ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
          : formatDate(data.DateStart);
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");
        eduLines.push(`### ${data.Name}`);
        eduLines.push(
          `${data.Organization}${location ? ` | ${location}` : ""}`,
        );
        eduLines.push(period);
        if (data.Description) eduLines.push(data.Description);
        if (data.Supervisors?.length)
          eduLines.push(`Supervisors: ${data.Supervisors.join(", ")}`);
        if (data.Advisors?.length)
          eduLines.push(`Advisors: ${data.Advisors.join(", ")}`);
        eduLines.push("");
        if (body.trim()) {
          eduLines.push(body.trim());
          eduLines.push("");
        }
      }

      if (scholarships.length > 0) {
        const scholarshipsLabel =
          locale === "pt" ? "Bolsas de estudo" : locale === "de" ? "Stipendien" : "Scholarships";
        eduLines.push(`## ${scholarshipsLabel}`, "");
        scholarships.sort(
          (a, b) =>
            new Date(b.data.DateStart).getTime() -
            new Date(a.data.DateStart).getTime(),
        );
        for (const { data } of scholarships) {
          const period = data.DateEnd
            ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
            : formatDate(data.DateStart);
          const location = [
            ...(data.City || []),
            data.Country || "",
          ]
            .filter(Boolean)
            .join(", ");
          eduLines.push(`### ${data.Name}`);
          eduLines.push(
            `${data.Organization}${location ? ` | ${location}` : ""}`,
          );
          eduLines.push(period);
          if (data.Description) eduLines.push(data.Description);
          eduLines.push("");
        }
      }

      const sectionName =
        locale === "pt"
          ? "Educa\u00E7\u00E3o & Bolsas de estudo"
          : locale === "de"
            ? "Bildung & Stipendien"
            : "Education & Scholarships";
      writeCVSection(sectionName, eduLines.join("\n"));
    }

    // 3. Certifications
    const certifications = readContentFiles("certifications", locale);
    if (certifications.length > 0) {
      certifications.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      const certLines: string[] = [];
      for (const { data } of certifications) {
        certLines.push(`### ${data.Name}`);
        certLines.push(data.Organization);
        certLines.push(formatDate(data.DateStart));
        if (data.Link) certLines.push(`Link: ${data.Link}`);
        certLines.push("");
      }
      const sectionName =
        locale === "pt" ? "Certificados" : locale === "de" ? "Zertifizierungen" : "Certifications";
      writeCVSection(sectionName, certLines.join("\n"));
    }

    // 4. Courses Attended
    const courses = readContentFiles("courses-attended", locale);
    if (courses.length > 0) {
      courses.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      const courseLines: string[] = [];
      for (const { data } of courses) {
        const period = data.DateEnd
          ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
          : formatDate(data.DateStart);
        courseLines.push(`### ${data.Name}`);
        if (data.Authors?.length)
          courseLines.push(`Instructor: ${data.Authors.join(", ")}`);
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");
        if (data.Organization)
          courseLines.push(
            `${data.Organization}${location ? ` | ${location}` : ""}`,
          );
        courseLines.push(period);
        if (data.Description) courseLines.push(data.Description);
        courseLines.push("");
      }
      const sectionName =
        locale === "pt" ? "Cursos frequentados" : locale === "de" ? "Besuchte Kurse" : "Courses Attended";
      writeCVSection(sectionName, courseLines.join("\n"));
    }

    // 5. Skills (Summary & Skills combined)
    const skills = readContentFiles("skills", locale);
    if (skills.length > 0) {
      const byCategory = new Map<string, string[]>();
      for (const { data } of skills) {
        const cat = data.Category || "Other";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(data.Name);
      }
      const skillLines: string[] = [];
      for (const [cat, names] of byCategory) {
        skillLines.push(`**${cat}:** ${names.join(", ")}`);
      }
      const sectionName =
        locale === "pt" ? "Resumo & Habilidades" : locale === "de" ? "Zusammenfassung & F\u00E4higkeiten" : "Summary & Skills";
      writeCVSection(sectionName, skillLines.join("\n"));
    }

    // 6. Teaching Experience (from teaching content collection)
    const teaching = readContentFiles("teaching", locale);
    if (teaching.length > 0) {
      teaching.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      const teachLines: string[] = [];
      for (const { data } of teaching) {
        const period = data.DateEnd
          ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
          : formatDate(data.DateStart);
        teachLines.push(`### ${data.Name}`);
        const location = [
          ...(data.City || []),
          data.Country || "",
        ]
          .filter(Boolean)
          .join(", ");
        if (data.Organization || data.Place)
          teachLines.push(
            `${data.Organization || data.Place}${location ? ` | ${location}` : ""}`,
          );
        teachLines.push(`${period}${data.Category ? ` | ${data.Category}` : ""}`);
        if (data.Description) teachLines.push(data.Description);
        teachLines.push("");
      }
      const sectionName =
        locale === "pt" ? "Experi\u00EAncia Docente" : locale === "de" ? "Lehrerfahrung" : "Teaching Experience";
      writeCVSection(sectionName, teachLines.join("\n"));
    }

    // 7. Publications list
    const pubs = readContentFiles("publications", locale);
    if (pubs.length > 0) {
      pubs.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      const pubLines: string[] = [];
      for (const { data } of pubs) {
        pubLines.push(`### ${data.Name}`);
        if (data.Authors?.length)
          pubLines.push(`Authors: ${data.Authors.join(", ")}`);
        if (data.Place) pubLines.push(data.Place);
        pubLines.push(formatDate(data.DateStart));
        pubLines.push("");
      }
      const sectionName =
        locale === "pt" ? "Publica\u00E7\u00F5es" : locale === "de" ? "Publikationen" : "Publications";
      writeCVSection(sectionName, pubLines.join("\n"));
    }

    // 8. Projects List (aggregate of all projects for CV)
    const projects = readContentFiles("projects", locale);
    if (projects.length > 0) {
      projects.sort(
        (a, b) =>
          new Date(b.data.DateStart).getTime() -
          new Date(a.data.DateStart).getTime(),
      );
      const projLines: string[] = [];
      for (const { data } of projects) {
        const period = data.DateEnd
          ? `${formatDate(data.DateStart)} \u2013 ${formatDate(data.DateEnd)}`
          : formatDate(data.DateStart);
        projLines.push(`### ${data.Name}`);
        if (data.Organization) projLines.push(data.Organization);
        projLines.push(`${period}${data.Category ? ` | ${data.Category}` : ""}`);
        if (data.Description) projLines.push(data.Description);
        projLines.push("");
      }
      const sectionName =
        locale === "pt" ? "Lista de Projetos" : locale === "de" ? "Projektliste" : "Projects List";
      writeCVSection(sectionName, projLines.join("\n"));
    }
  }

  console.log(`Generated ${count} CV knowledge files.`);
}

// ─── Homepage ─────────────────────────────────────────────────────────

function processHomepage() {
  const pages = ["en", "pt"];
  let count = 0;

  for (const locale of pages) {
    const entries = readContentFiles("pages", locale);
    const indexEntry = entries.find(
      (e) => e.filename === "index.md" || e.filename === "index.mdx",
    );

    if (indexEntry) {
      const urlPrefix = locale === "en" ? "" : `/${locale}`;
      const cleanBody = cleanMarkdownBody(indexEntry.body);
      const lines = [
        `URL: ${BASE_URL}${urlPrefix}`,
        "",
        "# Daniel Locatelli",
        "",
      ];
      if (indexEntry.data.Description) {
        lines.push(indexEntry.data.Description, "");
      }
      if (cleanBody) {
        lines.push(cleanBody);
      }
      writeKnowledge(
        `homepage-${locale}.md`,
        lines
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim() + "\n",
      );
      count++;
    }
  }

  console.log(`Generated ${count} homepage knowledge files.`);
}

// ─── Main ─────────────────────────────────────────────────────────────

function main() {
  // Clean knowledge directory
  if (fs.existsSync(KNOWLEDGE_DIR)) {
    const existing = fs
      .readdirSync(KNOWLEDGE_DIR)
      .filter((f) => f.endsWith(".md"));
    console.log(`Clearing ${existing.length} existing knowledge files...`);
    for (const f of existing) {
      fs.unlinkSync(path.join(KNOWLEDGE_DIR, f));
    }
  } else {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }

  // Generate knowledge from all sources
  processContentCollections();
  processCVIndividual();
  processCVTimeline();
  processCVFromContent();
  processHomepage();

  // Final count
  const total = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md")).length;
  console.log(`\nTotal knowledge files: ${total}`);
}

main();
