import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
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

async function insertEntry(entry: Entry) {
  console.log(`Inserting: [${entry.type}] ${entry.title}...`);

  // Clean content for embedding
  const cleanContent = entry.content.replace(/\r?\n|\r/g, " ").trim();
  const embedding = await getEmbedding(cleanContent);

  if (!embedding) {
    console.error("Failed to get embedding for entry:", entry.title);
    return;
  }

  const { error } = await supabase
    .from("knowledge_entries")
    .insert([{ ...entry, embedding }]);

  if (error) {
    console.error("Error inserting entry:", error);
  } else {
    console.log("Success!");
  }
}

async function main() {
  const entries: Entry[] = [
    {
      title: "Portfolio Website",
      content:
        "# Portfolio Website\nDeveloped this portfolio website using Astro, Three.js, Notion API, Supabase, and Claude.",
      url: "https://daniellocatelli.com/full-cv",
      type: "cv_project",
      locale: "en",
      metadata: { links: ["https://daniellocatelli.com"] },
    },
    {
      title: "Website Portfólio",
      content:
        "# Website Portfólio\nDesenvolvimento deste website portfólio utilizando Astro, Three.js, Notion API, Supabase e Claude.",
      url: "https://daniellocatelli.com/pt/full-cv",
      type: "cv_project",
      locale: "pt",
      metadata: { links: ["https://daniellocatelli.com"] },
    },
  ];

  for (const entry of entries) {
    await insertEntry(entry);
  }
}

main().catch(console.error);
