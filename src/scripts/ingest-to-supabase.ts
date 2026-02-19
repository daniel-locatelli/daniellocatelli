import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const EMBED_ENDPOINT = `${SUPABASE_URL}/functions/v1/embed`;
const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");

async function ingest() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} files to ingest.`);

  for (const file of files) {
    const rawContent = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf-8");
    let url = "";
    let content = rawContent;

    const urlMatch = content.match(/^URL: (.*)(\r?\n|\r)/);
    if (urlMatch) {
      url = urlMatch[1].trim();
      content = content.replace(urlMatch[0], "");
    }

    // Basic chunking (by paragraph or max 1000 chars)
    const chunks = content.split(/\n\n+/).filter((c) => c.trim().length > 0);

    for (const chunk of chunks) {
      if (chunk.length > 2000) {
        // Further split if too large
        const subChunks = chunk.match(/.{1,2000}/g) || [];
        for (const sc of subChunks) {
          await processChunk(sc, url);
        }
      } else {
        await processChunk(chunk, url);
      }
    }
  }
}

async function processChunk(content: string, url: string) {
  console.log(`Procesing chunk: ${content.substring(0, 50)}...`);

  try {
    const response = await fetch(EMBED_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ input: content }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Embedding failed: ${err}`);
      return;
    }

    const { embedding } = await response.json();

    // Insert into Supabase - We'll use our anon key since we granted insert permissions
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        content,
        url,
        embedding,
      }),
    });

    if (!insertResponse.ok) {
      const err = await insertResponse.text();
      console.error(`Insert failed: ${err}`);
    }
  } catch (err) {
    console.error(`Error processing chunk: ${err}`);
  }
}

ingest().catch(console.error);
