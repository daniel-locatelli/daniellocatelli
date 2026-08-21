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
  // Normalize CRLF → LF so YAML parser doesn't choke on Windows-authored
  // files. Without this, quoted strings containing characters like `–`
  // (U+2013) on CRLF lines silently fail with "Unexpected scalar at node
  // end" and the entire entry is dropped from the knowledge index.
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: normalized };

  try {
    const data = YAML.parse(match[1]);
    return { data: data || {}, body: match[2] };
  } catch (err) {
    // Loud failure: a parse error means an entry will silently disappear
    // from the knowledge index. Surfacing it lets us notice and fix the
    // underlying frontmatter rather than discovering a missing entry weeks
    // later via a chat-quality regression.
    console.warn(
      `  ! YAML parse failed (entry will be skipped): ${(err as Error).message.split("\n")[0]}`,
    );
    return { data: {}, body: normalized };
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

  const sources: { file: string; filename: string }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      // Folder entries: teaching/<locale>/<slug>/index.md(x) next to deck.mdx.
      // Expose them under "<slug>.md" so downstream slug/URL logic is unchanged.
      const idx = ["index.md", "index.mdx"]
        .map((f) => path.join(full, f))
        .find((f) => fs.existsSync(f));
      if (idx) sources.push({ file: idx, filename: `${name}.md` });
    } else if (name.endsWith(".md") || name.endsWith(".mdx")) {
      sources.push({ file: full, filename: name });
    }
  }

  return sources
    .map(({ file, filename }) => {
      const raw = fs.readFileSync(file, "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { data, body, filename };
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
        if (data.Presentation) metaParts.push(`Presentation: ${data.Presentation}`);
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

        // Use the source filename (with collection prefix) instead of
        // slugify(data.Name). Translated names can collide when two
        // collections happen to share a translation: e.g. PT/DE both
        // translate "Biomimicry" and "Biomimetics" to the same word, so
        // a research entry and an unpublished talk would write to the
        // same knowledge file and the talk would silently overwrite the
        // research. Source filenames are unique per (collection × locale)
        // so this is collision-proof.
        const knowledgeFilename = `${collection}-${cleanSlug}-${locale}.md`;
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

      for (const { data, body, filename } of entries) {
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

        // Same anti-collision pattern as processContentCollections:
        // use the source filename (with collection prefix) instead of
        // slugify(data.Name). Otherwise an entry like "CS50's Introduction
        // to Computer Science" living in both certifications/ and
        // courses-attended/ collides into a single knowledge file, and
        // counts diverge across locales when only some locales have both
        // copies.
        const baseFilename = filename.replace(/\.(md|mdx)$/, "");
        const cleanSlug = baseFilename.replace(/^_/, "");
        const knowledgeFilename = `cv-entry-${collection}-${cleanSlug}-${locale}.md`;
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
  let count = 0;

  for (const locale of LOCALES) {
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

// ─── FAQ Synthesis ───────────────────────────────────────────────────
// Generates natural-language FAQ knowledge files that bridge the semantic
// gap between user questions and structured content data.

function processFAQ() {
  let count = 0;

  for (const locale of LOCALES) {
    const urlPrefix = locale === "en" ? "" : `/${locale}`;
    const cvUrl = `${BASE_URL}${urlPrefix}/full-cv`;
    const homeUrl = `${BASE_URL}${urlPrefix}`;

    // Load all collections needed across FAQs
    const experiences = readContentFiles("experiences", locale);

    // Fallback: if the current-job file (research-associate.md) failed YAML
    // parsing (e.g. URL with special chars), read it with regex and inject a
    // synthetic entry so every FAQ that uses `experiences` sees the current job.
    if (!experiences.some((e) => !e.data.DateEnd)) {
      const fallbackFile = path.join(CONTENT_DIR, "experiences", locale, "research-associate.md");
      if (fs.existsSync(fallbackFile)) {
        const raw = fs.readFileSync(fallbackFile, "utf-8");
        const nameMatch = raw.match(/^Name:\s*(.+)$/m);
        const dateMatch = raw.match(/^DateStart:\s*"?([^"\n]+)"?$/m);
        const orgMatch = raw.match(/^Organization:\s*(.+)$/m);
        const countryMatch = raw.match(/^Country:\s*"?([^"\n]+)"?$/m);
        const cityMatch = raw.match(/^\s+-\s+(.+)$/m);
        if (nameMatch) {
          experiences.push({
            data: {
              Name: nameMatch[1].trim(),
              DateStart: dateMatch?.[1]?.trim() || "",
              Organization: orgMatch?.[1]?.trim() || "",
              Country: countryMatch?.[1]?.trim() || "",
              City: cityMatch ? [cityMatch[1].trim()] : [],
            },
            body: "",
            filename: "research-associate.md",
          });
        }
      }
    }

    experiences.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    const education = readContentFiles("education", locale);
    education.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    const scholarships = readContentFiles("scholarships", locale);
    scholarships.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    const skills = readContentFiles("skills", locale);
    const publications = readContentFiles("publications", locale);
    publications.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    const teaching = readContentFiles("teaching", locale);
    teaching.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    // ── FAQ 1: Current Employment Status ──
    {
      const currentJob = experiences.find((e) => !e.data.DateEnd);

      if (currentJob) {
        const d = currentJob.data;
        const city = (d.City || []).join(", ");
        const content = [
          `URL: ${cvUrl}`,
          "",
          `# Current Employment Status`,
          "",
          `Daniel Locatelli is currently employed as ${d.Name} at ${d.Organization} in ${city}, ${d.Country}, starting ${formatDate(d.DateStart)}. He is actively working in this role.`,
          "",
          `Yes, Daniel is working right now. His current position is ${d.Name} at ${d.Organization}.`,
        ];
        writeKnowledge(
          `faq-current-status-${locale}.md`,
          content.join("\n").trim() + "\n",
        );
        count++;
      }
    }

    // ── FAQ 2: Professional Overview ──
    {
      const firstJobDate = experiences.length > 0
        ? new Date(experiences[experiences.length - 1].data.DateStart)
        : new Date();
      const yearsExperience = new Date().getFullYear() - firstJobDate.getFullYear();

      const recent5 = experiences.slice(0, 5);
      const positionLines = recent5.map((e) => {
        const d = e.data;
        const end = d.DateEnd ? formatDate(d.DateEnd) : (locale === "pt" ? "Atual" : locale === "de" ? "Aktuell" : "Current");
        return `- ${d.Name} at ${d.Organization} (${formatDate(d.DateStart)} to ${end})`;
      });

      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Professional Overview`,
        "",
        `Daniel Locatelli is a software engineer and computational designer with over ${yearsExperience} years of experience in the AEC (Architecture, Engineering, and Construction) industry. He combines expertise in software development, computational design, and digital fabrication.`,
        "",
        `Recent positions:`,
        ...positionLines,
      ];
      writeKnowledge(
        `faq-professional-overview-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 3: Educational Background ──
    {
      // Filter out dropped/trancado/abgebrochen, high school, and preparatory entries
      const dropPatterns = ["dropped", "trancado", "abgebrochen"];
      const excludePatterns = ["high school", "ensino médio", "gymnasial", "preparatory", "pré-vestibular", "vorbereitungskurs", "intensive english", "programa intensivo", "intensives englisch"];
      const filteredEdu = education.filter((e) => {
        const nameLower = e.data.Name.toLowerCase();
        const hasDropped = dropPatterns.some((p) => nameLower.includes(p));
        const isExcluded = excludePatterns.some((p) => nameLower.includes(p));
        return !hasDropped && !isExcluded;
      });

      const degreeLines = filteredEdu.map((e) => {
        const d = e.data;
        const location = [...(d.City || []), d.Country || ""].filter(Boolean).join(", ");
        return `- ${d.Name} at ${d.Organization}, ${location} (${formatDate(d.DateStart)} to ${formatDate(d.DateEnd)})`;
      });

      const scholarshipLines = scholarships.map((e) => {
        const d = e.data;
        return `- ${d.Name} from ${d.Organization} (${formatDate(d.DateStart)} to ${formatDate(d.DateEnd)})`;
      });

      const highest = filteredEdu.find((e) =>
        e.data.Name.toLowerCase().includes("master") || e.data.Name.toLowerCase().includes("mestrado"),
      );
      const highestDegree = highest ? highest.data.Name : filteredEdu[0]?.data.Name || "";

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Educational Background`,
        "",
        `Daniel Locatelli's highest degree is a ${highestDegree}. His academic background includes:`,
        "",
        ...degreeLines,
        "",
        `Scholarships received:`,
        ...scholarshipLines,
      ];
      writeKnowledge(
        `faq-education-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 4: Technical Skills ──
    {
      const byCategory = new Map<string, string[]>();
      for (const { data } of skills) {
        const cat = data.Category || "Other";
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        const entry = data.Level ? `${data.Name} (${data.Level})` : data.Name;
        byCategory.get(cat)!.push(entry);
      }

      const skillLines: string[] = [];
      for (const [cat, names] of byCategory) {
        skillLines.push(`**${cat}:** ${names.join(", ")}`);
      }

      // Extract specific categories for explicit listing
      const programmingLangs = skills
        .filter((s) => s.data.Category === "Programming")
        .map((s) => s.data.Name);
      const frameworks = skills
        .filter((s) => s.data.Category === "Framework")
        .map((s) => s.data.Name);
      const designTools = skills
        .filter((s) => s.data.Category === "Design tool")
        .map((s) => s.data.Name);

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Technical Skills`,
        "",
        `Daniel Locatelli's technical skills grouped by category:`,
        "",
        ...skillLines,
        "",
        `Programming languages: ${programmingLangs.join(", ")}.`,
        `Frameworks: ${frameworks.join(", ")}.`,
        `Design tools: ${designTools.join(", ")}.`,
      ];
      writeKnowledge(
        `faq-skills-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 5: Languages Spoken ──
    {
      const langSkills = skills.filter((s) => s.data.Category === "Language");
      const langLines = langSkills.map((s) => `- ${s.data.Name}: ${s.data.Level}`);

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Languages Spoken`,
        "",
        `Daniel Locatelli speaks the following languages:`,
        "",
        ...langLines,
        "",
        `He also has basic knowledge of Italian and Spanish.`,
      ];
      writeKnowledge(
        `faq-languages-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 6: Location and Contact ──
    {
      const currentJob = experiences.find((e) => !e.data.DateEnd);
      const city = currentJob ? (currentJob.data.City || []).join(", ") : "Munich";
      const country = currentJob ? currentJob.data.Country : "Germany";

      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Location and Contact`,
        "",
        `Daniel Locatelli is currently based in ${city}, ${country}.`,
        "",
        `Contact information:`,
        `- Email: contact@daniellocatelli.com`,
        `- Website: https://daniellocatelli.com`,
      ];
      writeKnowledge(
        `faq-contact-location-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 7: Research and Publications ──
    {
      const pubCount = publications.length;
      const recent5 = publications.slice(0, 5);
      const pubLines = recent5.map((p) => {
        const d = p.data;
        const authors = d.Authors?.length
          ? d.Authors.map((a: any) => (typeof a === "string" ? a : a.name)).join(", ")
          : "";
        return `- "${d.Name}"${authors ? ` by ${authors}` : ""} (${formatDate(d.DateStart)})`;
      });

      // Find both undergraduate (bachelor's) and master's theses. Each
      // education entry stores a `Thesis:` slug pointing into the research
      // collection, so we can pull the full thesis Name + Description from
      // there for richer retrieval context.
      const research = readContentFiles("research", locale);
      const bachelorEdu = education.find((e) =>
        /\b(bachelor|bacharel|bachelorabschluss)\b/i.test(e.data.Name) &&
        !/\b(dropped|trancado|abgebrochen)\b/i.test(e.data.Name),
      );
      const masterEdu = education.find((e) =>
        /\b(master|mestrado|magister)\b/i.test(e.data.Name),
      );
      const findThesisResearch = (slug: string | undefined) =>
        slug
          ? research.find(
              (r) => r.filename.replace(/\.(md|mdx)$/, "") === slug,
            )
          : undefined;
      const bachelorThesis = findThesisResearch(bachelorEdu?.data.Thesis);
      const masterThesis = findThesisResearch(masterEdu?.data.Thesis);

      // Locale-specific synonym block makes "graduation thesis", "TFG",
      // "Bachelorarbeit", "Masterarbeit", "Tese de graduação", etc. all
      // embed near this entry so vector search finds it regardless of
      // the visitor's phrasing.
      const synonyms =
        locale === "pt"
          ? [
              "Sinônimos: tese de graduação, trabalho de conclusão de curso, TCC,",
              "TFG, Trabalho Final de Graduação, monografia de bacharelado,",
              "tese de bacharelado, tese de mestrado, dissertação, M.Sc. thesis.",
            ]
          : locale === "de"
            ? [
              "Synonyme: Bachelorarbeit, Abschlussarbeit, Diplomarbeit, Bachelor-Thesis,",
              "Masterarbeit, M.Sc.-Arbeit, Master-Thesis.",
            ]
            : [
              "Synonyms: graduation thesis, undergraduate thesis, bachelor's thesis,",
              "final-year project, capstone project, TFG, B.Arch. thesis, master's thesis,",
              "M.Sc. thesis.",
            ];

      const thesisLines: string[] = [];
      if (bachelorThesis) {
        const d = bachelorThesis.data;
        const url = `${BASE_URL}${urlPrefix}/research/${bachelorThesis.filename.replace(/\.(md|mdx)$/, "")}`;
        thesisLines.push(
          `**Graduation thesis (undergraduate / bachelor's thesis / TFG)**: "${d.Name}"`,
          d.Description ? `${d.Description}` : "",
          `Read more: ${url}`,
          "",
        );
      }
      if (masterThesis) {
        const d = masterThesis.data;
        const url = `${BASE_URL}${urlPrefix}/research/${masterThesis.filename.replace(/\.(md|mdx)$/, "")}`;
        thesisLines.push(
          `**Master's thesis (M.Sc. thesis)**: "${d.Name}"`,
          d.Description ? `${d.Description}` : "",
          `Read more: ${url}`,
          "",
        );
      } else if (masterEdu?.data.Description) {
        // Fallback if Thesis slug doesn't resolve
        thesisLines.push(
          `**Master's thesis**: ${masterEdu.data.Description}`,
          "",
        );
      }

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Theses, Research and Publications`,
        "",
        ...synonyms,
        "",
        ...thesisLines,
        `Daniel Locatelli has ${pubCount} publications.`,
        "",
        `Recent publications:`,
        ...pubLines,
      ];
      writeKnowledge(
        `faq-research-publications-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 8: Teaching Experience ──
    {
      const teachCount = teaching.length;
      const recent5 = teaching.slice(0, 5);
      const teachLines = recent5.map((t) => {
        const d = t.data;
        const venue = d.Organization || d.Place || "";
        return `- ${d.Name}${venue ? ` at ${venue}` : ""} (${formatDate(d.DateStart)})`;
      });

      // Collect unique countries
      const countries = new Set<string>();
      for (const t of teaching) {
        if (t.data.Country) countries.add(t.data.Country);
      }

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Teaching Experience`,
        "",
        `Daniel Locatelli has ${teachCount} teaching entries, including lectures, workshops, and presentations. He has taught in: ${[...countries].join(", ")}.`,
        "",
        `Recent teaching activities:`,
        ...teachLines,
      ];
      writeKnowledge(
        `faq-teaching-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 9: Work Experience History ──
    {
      const totalPositions = experiences.length;

      // Group by country
      const byCountry = new Map<string, string[]>();
      for (const { data } of experiences) {
        const country = data.Country || "Unknown";
        if (!byCountry.has(country)) byCountry.set(country, []);
        byCountry.get(country)!.push(data.Name);
      }

      const countryLines: string[] = [];
      for (const [country, positions] of byCountry) {
        countryLines.push(`- ${country}: ${positions.length} position(s) (${positions.join(", ")})`);
      }

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Work Experience History`,
        "",
        `Daniel Locatelli has held ${totalPositions} professional positions across multiple countries.`,
        "",
        `Positions by country:`,
        ...countryLines,
      ];
      writeKnowledge(
        `faq-work-experience-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }

    // ── FAQ 10: Personal Background ──
    {
      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Personal Background`,
        "",
        `Daniel Locatelli is Brazilian, originally from Vilhena, Rondonia, Brazil. He moved to Germany in 2019 to pursue his Master's degree at the University of Stuttgart. He is currently based in Munich, Germany.`,
      ];
      writeKnowledge(
        `faq-background-${locale}.md`,
        content.join("\n").trim() + "\n",
      );
      count++;
    }
  }

  console.log(`Generated ${count} FAQ knowledge files.`);
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
  processFAQ();

  // Final count
  const total = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md")).length;
  console.log(`\nTotal knowledge files: ${total}`);
}

main();
