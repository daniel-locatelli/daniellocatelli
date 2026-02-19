import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface KnowledgeItem {
  url: string;
  content: string;
}

interface Entry {
  content: string;
  url?: string;
  title?: string;
  type: string;
  metadata: any;
  locale: string;
}

async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke("embed", {
      body: { input: text },
    });

    if (error) {
      console.error("Error invoking embed function:", error);
      return null;
    }

    return data.embedding;
  } catch (err) {
    console.error("Error fetching embedding:", err);
    return null;
  }
}

async function main() {
  console.log("Starting migration...");

  // Phase 1: Knowledge Pages
  const knowledgePath = path.resolve(process.cwd(), "src/lib/knowledge.json");
  const knowledgeData: KnowledgeItem[] = JSON.parse(
    fs.readFileSync(knowledgePath, "utf-8"),
  );

  console.log(`Found ${knowledgeData.length} items in knowledge.json`);

  for (const item of knowledgeData) {
    const locale = item.url.includes("/pt/") ? "pt" : "en";

    // Simple parsing for title and tags from content
    const titleMatch = item.content.match(/^# (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";

    const descriptionMatch = item.content.match(/Description: (.*)/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    const tagsMatch = item.content.match(/Tags: (.*)/);
    const tags = tagsMatch ? tagsMatch[1].split(",").map((t) => t.trim()) : [];

    const entry: Entry = {
      content: item.content,
      url: item.url,
      title: title,
      type: "page",
      metadata: { description, tags },
      locale: locale,
    };

    await insertEntry(entry);
  }

  // Phase 2: CV Items
  const cvFiles = [
    {
      file: "full-cv-en.md",
      locale: "en",
      url: "https://daniellocatelli.com/full-cv",
    },
    {
      file: "full-cv-pt.md",
      locale: "pt",
      url: "https://daniellocatelli.com/pt/full-cv",
    },
  ];

  for (const { file, locale, url } of cvFiles) {
    const filePath = path.join(process.cwd(), "knowledge", file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    console.log(`Processing local CV: ${file} (${locale})`);
    const content = fs.readFileSync(filePath, "utf-8");
    // Simple way to get HTML if the file contains it, or just use cheerio on the text?
    // Wait, the files we save in download-knowledge.ts are TEXT/MARKDOWN.
    // We need to parse the markdown or treat it as such.
    // However, our parseCVSections expects a cheerio object ($).
    // Let's modify parseCVSections to handle markdown or convert markdown to HTML first.

    // For now, since we want to reuse the cheerio logic, let's fetch from LOCALHOST if the server is running,
    // or just read the file and wrap it in a pseudo-HTML if it was saved as HTML.
    // Actually, download-knowledge.ts saves .text() content, which is NOT HTML.

    // DECISION: If we want to use the cheerio logic, we need HTML.
    // Let's fetch from localhost since we just started the server!
    const localUrl = `http://localhost:4322${locale === "en" ? "" : "/pt"}/full-cv`;
    console.log(`Fetching from local dev server: ${localUrl}`);
    const res = await fetch(localUrl);
    if (!res.ok) {
      console.error(`Failed to fetch from local server: ${localUrl}`);
      continue;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    await parseCVSections($, url, locale);
  }

  console.log("Migration finished!");
}

async function parseCVSections($: any, baseUrl: string, locale: string) {
  // We'll target sections by finding the headers
  const sections = [
    { title: "Professional Experience", type: "cv_work" },
    { title: "Experiência Profissional", type: "cv_work" },
    { title: "Education", type: "cv_edu" },
    { title: "Educação", type: "cv_edu" },
    { title: "Publications", type: "cv_pub" },
    { title: "Publicações", type: "cv_pub" },
    { title: "Teaching Experience", type: "cv_teaching" },
    { title: "Experiência Docente", type: "cv_teaching" },
    { title: "Projects List", type: "cv_project" },
    { title: "Lista de Projetos", type: "cv_project" },
    { title: "Certifications", type: "cv_cert" },
    { title: "Certificados", type: "cv_cert" },
    { title: "Courses Attended", type: "cv_course" },
    { title: "Cursos Frequentados", type: "cv_course" },
  ];

  for (const section of sections) {
    const header = $(`h2:contains("${section.title}")`);
    if (header.length === 0) continue;

    console.log(`Processing section: ${section.title} (${locale})`);

    if (section.type === "cv_pub") {
      // Publications
      header.nextUntil("h2").each((_: any, el: any) => {
        if ($(el).is("p") || $(el).is("div")) {
          const text = $(el).text().trim();
          if (text.length < 20) return;

          const links: string[] = [];
          $(el)
            .find("a")
            .each((_: any, a: any) => {
              const href = $(a).attr("href");
              if (href) links.push(href);
            });

          insertEntry({
            content: text,
            url: baseUrl,
            title: text.split("\n")[0].substring(0, 100),
            type: section.type,
            metadata: { links },
            locale: locale,
          });
        }
      });
    } else if (
      section.type === "cv_work" ||
      section.type === "cv_edu" ||
      section.type === "cv_project" ||
      section.type === "cv_cert" ||
      section.type === "cv_course"
    ) {
      // These sections often use H3 for items
      const nextH2 = header.nextAll("h2").first();
      const contentLimit = nextH2.length > 0 ? nextH2 : undefined;

      // Find all items in this section. We traverse siblings and look for h3s inside.
      header.nextUntil(contentLimit).each((_: any, el: any) => {
        const $el = $(el);
        // Find if this element is an h3 or contains an h3
        const h3 = $el.is("h3") ? $el : $el.find("h3").first();

        if (h3.length > 0) {
          const title = h3.text().trim();
          // For content, we take the text of the entire containing element if it was an <a> or similar
          // or just the next siblings if it was a standalone h3
          let itemContent = "";
          if ($el.is("h3")) {
            itemContent = $el
              .nextUntil("h3, h2")
              .map((_: any, next: any) => $(next).text().trim())
              .get()
              .join("\n");
          } else {
            // It was nested (e.g. <a><h3>Title</h3><h4>Sub</h4></a>)
            // Extract the whole text content of the container minus the title to avoid double counting?
            // Actually, just taking the whole text is often better for LLM context.
            itemContent = $el.text().replace(title, "").trim();
          }

          const combinedContent = `# ${title}\n${itemContent}`;
          const links: string[] = [];

          // If the element itself is an <a>, add its href
          if ($el.is("a") && $el.attr("href")) {
            links.push($el.attr("href")!);
          }

          // Also look for any links inside
          $el.find("a").each((_: any, a: any) => {
            const href = $(a).attr("href");
            if (href && !links.includes(href)) links.push(href);
          });

          insertEntry({
            content: combinedContent,
            url: baseUrl,
            title: title,
            type: section.type,
            metadata: { links },
            locale: locale,
          });
        }
      });
    } else {
      // Generic items for others
      header.nextUntil("h2").each((_: any, el: any) => {
        const text = $(el).text().trim();
        if (text.length < 10) return;

        const links: string[] = [];
        $(el)
          .find("a")
          .each((_: any, a: any) => {
            const href = $(a).attr("href");
            if (href) links.push(href);
          });

        insertEntry({
          content: text,
          url: baseUrl,
          type: section.type,
          metadata: { links },
          locale: locale,
        });
      });
    }
  }
}

async function insertEntry(entry: Entry) {
  console.log(
    `  Inserting: [${entry.type}] ${entry.title || entry.content.substring(0, 30)}...`,
  );

  // Clean content for embedding
  const cleanContent = entry.content.replace(/\r?\n|\r/g, " ").trim();
  const embedding = await getEmbedding(cleanContent);

  const { error } = await supabase
    .from("knowledge_entries")
    .insert([{ ...entry, embedding }]);

  if (error) {
    console.error("  Error inserting entry:", error);
  }
}

main().catch(console.error);
