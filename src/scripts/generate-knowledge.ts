/**
 * generate-knowledge.ts
 *
 * Reads all portfolio content from source files and generates
 * clean markdown knowledge files for embedding into Supabase.
 *
 * Sources:
 * 1. Content collections (projects, research, teaching, publications) — all locales
 * 2. CV data from i18n/cv files (en, pt)
 * 3. Homepage content from i18n/home files (en, pt)
 *
 * Run: npx tsx src/scripts/generate-knowledge.ts
 */

import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const CONTENT_DIR = path.join(process.cwd(), "src/content");
const BASE_URL = "https://daniellocatelli.com";

// ─── Helpers ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanMarkdownBody(body: string): string {
  // Remove image references, including multi-line alt text
  let cleaned = body.replace(/!\[[\s\S]*?\]\(.*?\)/g, "");
  // Remove code blocks (not useful for embeddings in this context)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

function parseJsonFrontmatter(content: string): {
  data: Record<string, any>;
  body: string;
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  try {
    const data = JSON.parse(match[1]);
    return { data, body: match[2] };
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

// ─── Content Collections ──────────────────────────────────────────────

function processContentCollections() {
  const collections = ["projects", "research", "teaching", "publications"];
  const locales = ["en", "pt"];
  let count = 0;

  for (const collection of collections) {
    for (const locale of locales) {
      const dir = path.join(CONTENT_DIR, collection, locale);
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

      for (const file of files) {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { data, body } = parseJsonFrontmatter(raw);

        if (!data.Name) continue;

        const slug = data.Slug || `${collection}/${file.replace(".md", "")}`;
        const isUnpublished = file.startsWith("_");
        const cleanSlug = slug.replace(/^_/, "");

        // Build URL
        const urlPrefix = locale === "en" ? "" : `/${locale}`;
        const url = isUnpublished
          ? `${BASE_URL}${urlPrefix}/full-cv`
          : `${BASE_URL}${urlPrefix}/${cleanSlug}`;

        // Build metadata section
        const metaParts: string[] = [];
        if (data.Description) metaParts.push(`Description: ${data.Description}`);
        if (data.Tags?.length) metaParts.push(`Tags: ${data.Tags.join(", ")}`);
        if (data.Category) metaParts.push(`Category: ${data.Category}`);
        if (data.Authors?.length) {
          const authors = data.Authors.map((a: any) =>
            typeof a === "string" ? a : a.name
          );
          metaParts.push(`Authors: ${authors.join(", ")}`);
        }
        if (data.Client) metaParts.push(`Client: ${data.Client}`);
        if (data.City?.length) {
          const cities = data.City.map((c: any) =>
            typeof c === "string" ? c : c.name
          );
          metaParts.push(`Location: ${cities.join(", ")}`);
        }
        if (data.Place) metaParts.push(`Place: ${data.Place}`);
        if (data.DateStart) metaParts.push(`Date: ${formatDate(data.DateStart)}${data.DateEnd ? ` – ${formatDate(data.DateEnd)}` : ""}`);
        if (data.Link) {
          const link = typeof data.Link === "string" ? data.Link : data.Link.Href;
          if (link) metaParts.push(`Link: ${link}`);
        }

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
        const filename = `${safeName}-${locale}.md`;
        writeKnowledge(filename, lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
        count++;
      }
    }
  }

  console.log(`Generated ${count} content collection knowledge files.`);
}

// ─── CV ───────────────────────────────────────────────────────────────
// Split CV into separate files per section for better vector search retrieval.
// A single 677-line CV file dilutes the embedding — "current work" gets lost
// when mixed with 50 other projects.

async function processCVData() {
  const locales = ["en", "pt"];

  let count = 0;

  for (const code of locales) {
    const modulePath = path.resolve(process.cwd(), "src/i18n/cv", `${code}.ts`);
    const fileUrl = new URL(`file:///${modulePath.replace(/\\/g, "/")}`);
    const mod = await import(fileUrl.href);
    const cv = mod.t;

    const urlPrefix = code === "en" ? "" : `/${code}`;
    const url = `${BASE_URL}${urlPrefix}/full-cv`;

    // Helper to write a CV section file
    function writeCVSection(section: string, content: string) {
      const filename = `cv-${slugify(section)}-${code}.md`;
      const lines = [
        `URL: ${url}`,
        "",
        `# Daniel Locatelli – ${section}`,
        "",
        content,
      ];
      writeKnowledge(filename, lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
      count++;
    }

    // 1. Summary & Skills (compact, keep together)
    const summaryLines: string[] = [
      `> ${cv.quote}`,
      "",
      `## ${cv.ui.summary}`,
      "",
      cv.summary,
      "",
      `## ${cv.ui.skills}`,
      "",
      `**${cv.ui.programming}:** ${cv.skillsProgramming.map((s: any) => s.title).join(", ")}`,
      `**${cv.ui.frameworks}:** ${cv.skillsFrameworks.map((s: any) => s.title).join(", ")}`,
      `**${cv.ui.databases}:** ${cv.skillsDatabases.map((s: any) => s.title).join(", ")}`,
      `**${cv.ui.designTools}:** ${cv.skillsDesign.map((s: any) => s.title).join(", ")}`,
      `**${cv.ui.specialization}:** ${cv.skillsSpecialized.join(", ")}`,
      `**${cv.ui.languages}:** ${cv.skillsLanguages.map((s: any) => `${s.title} (${s.level})`).join(", ")}`,
    ];
    writeCVSection(`${cv.ui.summary} & ${cv.ui.skills}`, summaryLines.join("\n"));

    // 2. Professional Experience
    const expLines: string[] = [];
    for (const exp of cv.experiences) {
      const period = exp.endDate
        ? `${formatDate(exp.startDate)} – ${formatDate(exp.endDate)}`
        : `${formatDate(exp.startDate)} – ${cv.ui.current}`;
      expLines.push(`### ${exp.title}`);
      expLines.push(`${exp.company} | ${exp.location}`);
      expLines.push(`${period}`);
      if (exp.titleNote) expLines.push(`(${exp.titleNote})`);
      if (exp.companyNote) expLines.push(`Note: ${exp.companyNote}`);
      expLines.push("");
      for (const item of exp.items) {
        expLines.push(`- ${item}`);
      }
      expLines.push("");
    }
    writeCVSection(cv.ui.professionalExperience, expLines.join("\n"));

    // 3. Education & Scholarships (related, keep together)
    const eduLines: string[] = [];
    for (const edu of cv.education) {
      const period = edu.endDate
        ? `${formatDate(edu.startDate)} – ${formatDate(edu.endDate)}`
        : formatDate(edu.startDate);
      eduLines.push(`### ${edu.title}`);
      eduLines.push(`${edu.institution} | ${edu.location}`);
      eduLines.push(`${period}`);
      if (edu.description) eduLines.push(`${edu.description}`);
      if (edu.supervisors?.length)
        eduLines.push(`Supervisors: ${edu.supervisors.join(", ")}`);
      if (edu.advisors?.length)
        eduLines.push(`Advisors: ${edu.advisors.join(", ")}`);
      eduLines.push("");
    }
    eduLines.push(`## ${cv.ui.scholarships}`, "");
    for (const s of cv.scholarships) {
      const period = s.endDate
        ? `${formatDate(s.startDate)} – ${formatDate(s.endDate)}`
        : formatDate(s.startDate);
      eduLines.push(`### ${s.title}`);
      eduLines.push(`${s.institution} | ${s.location}`);
      eduLines.push(`${period}`);
      if (s.description) eduLines.push(`${s.description}`);
      eduLines.push("");
    }
    writeCVSection(`${cv.ui.education} & ${cv.ui.scholarships}`, eduLines.join("\n"));

    // 4. Publications
    const pubLines: string[] = [];
    for (const pub of cv.publications) {
      pubLines.push(`### ${pub.title}`);
      pubLines.push(`${pub.publisher}${pub.location ? ` | ${pub.location}` : ""}`);
      pubLines.push(`${formatDate(pub.date)}`);
      pubLines.push(`Authors: ${pub.authors.join(", ")}`);
      if (pub.link) pubLines.push(`Link: ${pub.link}`);
      pubLines.push("");
    }
    writeCVSection(cv.ui.publications, pubLines.join("\n"));

    // 5. Certifications
    const certLines: string[] = [];
    for (const cert of cv.certifications) {
      certLines.push(`### ${cert.title}`);
      certLines.push(`${cert.issuer}`);
      certLines.push(`${formatDate(cert.date)}`);
      if (cert.link) certLines.push(`Link: ${cert.link}`);
      certLines.push("");
    }
    writeCVSection(cv.ui.certifications, certLines.join("\n"));

    // 6. Teaching Experience
    const teachLines: string[] = [];
    for (const eng of cv.engagements) {
      const period = eng.endDate
        ? `${formatDate(eng.startDate)} – ${formatDate(eng.endDate)}`
        : formatDate(eng.startDate);
      const typeLabel = cv.ui.engagementTypes[eng.type] || eng.type;
      teachLines.push(`### ${eng.title}`);
      teachLines.push(`${eng.organization}${eng.location ? ` | ${eng.location}` : ""}`);
      teachLines.push(`${period} | ${typeLabel}`);
      if (eng.description) teachLines.push(`${eng.description}`);
      if (eng.link) teachLines.push(`Link: ${eng.link}`);
      teachLines.push("");
    }
    writeCVSection(cv.ui.engagementFull, teachLines.join("\n"));

    // 7. Courses Attended
    const courseLines: string[] = [];
    for (const course of cv.coursesAttended) {
      const period = course.endDate
        ? `${formatDate(course.startDate)} – ${formatDate(course.endDate)}`
        : formatDate(course.startDate);
      courseLines.push(`### ${course.title}`);
      courseLines.push(`Instructor: ${course.instructor}`);
      if (course.organization)
        courseLines.push(`${course.organization}${course.location ? ` | ${course.location}` : ""}`);
      courseLines.push(`${period}`);
      if (course.description) courseLines.push(`${course.description}`);
      if (course.link) courseLines.push(`Link: ${course.link}`);
      courseLines.push("");
    }
    writeCVSection(cv.ui.coursesAttended, courseLines.join("\n"));

    // 8. Projects List
    const workLines: string[] = [];
    for (const work of cv.works) {
      const period = work.endDate
        ? `${formatDate(work.startDate)} – ${formatDate(work.endDate)}`
        : formatDate(work.startDate);
      workLines.push(`### ${work.title}`);
      workLines.push(`${work.company}${work.location ? ` | ${work.location}` : ""}`);
      workLines.push(`${period} | ${work.category}`);
      if (work.description) workLines.push(`${work.description}`);
      if (work.link) workLines.push(`Link: ${work.link}`);
      workLines.push("");
    }
    writeCVSection(cv.ui.projectsList, workLines.join("\n"));
  }

  console.log(`Generated ${count} CV knowledge files.`);
}

// ─── Homepage ─────────────────────────────────────────────────────────

function processHomepage() {
  // Homepage EN
  const enLines = [
    `URL: ${BASE_URL}`,
    "",
    "# Daniel Locatelli",
    "",
    "Welcome to my digital office. Here, you will find my work, research, and teachings on computational design, and software development for the AEC industry.",
    "",
    "## I'm Daniel Locatelli",
    "AEC Software Engineer",
    "",
    "I am a generalist. I develop plugins, web applications, and computational design solutions for architecture, engineering, and construction (AEC).",
    "",
    "## My Service Offerings",
    "",
    "### Plugin Development",
    "Bespoke tools to automate tasks, integrate specialized analyses, or extend a software capability. Expert in C# for Rhino/Grasshopper, Revit and AutoCAD.",
    "",
    "### Web Applications",
    "Web-based solutions for project management, collaborative tools, financial simulators and 3D visualization. Focused in React, Astro and PostgreSQL.",
    "",
    "### Computational Design",
    "Applying advanced computational design strategies to streamline and enhance AEC processes, improving efficiency in design, analysis, and documentation.",
    "",
    "### Data Visualization",
    "Creating dashboards to better understand, interpret, and act upon complex project data. From web-native dashboards to enterprise Power BI frameworks.",
    "",
    "### Digital Fabrication",
    "Creating Grasshopper scripts to automatically extract manufacturing data from complex, parametric 3D designs for digital fabrication.",
    "",
    "## Architect + Programmer",
    "",
    "With a background in architecture and a Master of Science from the ITECH program at the University of Stuttgart, coupled with ten years' experience that encompassed computational design at German engineering offices, I possess a deep understanding of AEC challenges.",
    "",
    "I don't just write code; I design and build software solutions that are tailored to the needs of architects, engineers, and construction professionals because I understand your world.",
    "",
    "## Portfolio Highlights",
    "",
    "### BuildSystems Funding Calculator",
    "BuildSystems GmbH. Web application with user-friendly forms and interactive charts for simulating funding scenarios for housing through the national German bank KfW. Tech: TypeScript, Angular, ng2-charts, Supabase, PostgreSQL, HTML, CSS.",
    "",
    "### BuildSystems Plugin for Grasshopper/Rhino3D",
    "BuildSystems GmbH. Grasshopper plugin that enables designers to perform critical feasibility and sustainability analyses directly within their design environment, promoting informed decision-making. Tech: C#, RhinoCommon, Grasshopper API, JSON.",
    "",
    "### Data Extraction for Digital Fabrication",
    "ArtEngineering GmbH. Support on the digital fabrication of Common Sky using Grasshopper and Sandbox Topology. Focused on geometry processing and automation of fabrication workflows. Tech: Scripting in Grasshopper/Rhino3D.",
    "",
    "## Recommendations",
    "",
    '> "Mr. Locatelli has always performed the tasks assigned to him to our complete satisfaction, meeting and, in many respects, exceeding our expectations." — Martin Bittmann, Founder, BuildSystems GmbH',
    "",
    '> "Mr. Locatelli\'s professional conduct was exemplary. He consistently displayed a combination of technical brilliance, strategic thinking, and interpersonal skill. His ability to integrate seamlessly into team dynamics while maintaining the highest standards of professional excellence made him an invaluable team member." — Herwig Bretis, Managing director, ArtEngineering GmbH',
    "",
    "## Contact",
    "Ready to elevate your AEC projects? Let's discuss how my expertise can transform your challenges into innovative software solutions.",
  ];
  writeKnowledge("homepage-en.md", enLines.join("\n").trim() + "\n");

  // Homepage PT — read PT file as text and extract strings
  const ptFilePath = path.resolve(process.cwd(), "src/i18n/home/pt.ts");
  if (fs.existsSync(ptFilePath)) {
    const ptLines = [
      `URL: ${BASE_URL}/pt`,
      "",
      "# Daniel Locatelli",
      "",
      "Bem-vindo ao meu escritório digital. Aqui, você vai encontrar meus projetos, pesquisas e aulas sobre design computacional e desenvolvimento de software para a indústria AEC.",
      "",
      "## Eu sou Daniel Locatelli",
      "Engenheiro de software AEC",
      "",
      "Eu sou generalista. Desenvolvo plugins, aplicações web e soluções de design computacional para arquitetura, engenharia e construção (AEC).",
      "",
      "## Meus Serviços",
      "",
      "### Desenvolvimento de Plugins",
      "Ferramentas sob medida para automatizar tarefas, integrar análises especializadas ou ampliar capacidades de softwares. Especialista em C# para Rhino/Grasshopper, Revit e AutoCAD.",
      "",
      "### Aplicações Web",
      "Soluções web para gestão de projetos, ferramentas colaborativas, simuladores financeiros e visualização 3D. Focado em React, Astro e PostgreSQL.",
      "",
      "### Design Computacional",
      "Aplicação de estratégias avançadas de design computacional para otimizar e aprimorar processos AEC, melhorando a eficiência no design, análise e documentação.",
      "",
      "### Visualização de Dados",
      "Criação de dashboards para melhor compreender, interpretar e agir sobre dados complexos de projetos. De dashboards nativos da web a frameworks Power BI empresariais.",
      "",
      "### Fabricação Digital",
      "Criação de scripts Grasshopper para extrair automaticamente dados de fabricação de designs 3D paramétricos complexos para fabricação digital.",
      "",
      "## Arquiteto + Programador",
      "",
      "Com formação em arquitetura e mestrado em Ciências pelo programa ITECH da Universidade de Stuttgart, além de dez anos de experiência que abrangeram design computacional em escritórios de engenharia alemães, possuo uma profunda compreensão dos desafios AEC.",
      "",
      "Não apenas escrevo código; projeto e construo soluções de software sob medida para as necessidades de arquitetos, engenheiros e profissionais da construção porque entendo seu mundo.",
      "",
      "## Contato",
      "Pronto para elevar seus projetos AEC? Vamos discutir como minha experiência pode transformar seus desafios em soluções de software inovadoras.",
    ];
    writeKnowledge("homepage-pt.md", ptLines.join("\n").trim() + "\n");
  }

  console.log("Generated 2 homepage knowledge files.");
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  // Clean knowledge directory
  if (fs.existsSync(KNOWLEDGE_DIR)) {
    const existing = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"));
    console.log(`Clearing ${existing.length} existing knowledge files...`);
    for (const f of existing) {
      fs.unlinkSync(path.join(KNOWLEDGE_DIR, f));
    }
  } else {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }

  // Generate knowledge from all sources
  processContentCollections();
  await processCVData();
  processHomepage();

  // Final count
  const total = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md")).length;
  console.log(`\nTotal knowledge files: ${total}`);
}

main().catch(console.error);
