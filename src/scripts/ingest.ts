import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX_NAME = "daniel-portfolio";

async function main() {
  if (!ACCOUNT_ID || !API_TOKEN) {
    console.error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env",
    );
    process.exit(1);
  }

  const knowledgeDir = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));

  console.log(`Processing ${files.length} files...`);

  for (const file of files) {
    console.log(`  Processing ${file}...`);
    const content = fs.readFileSync(path.join(knowledgeDir, file), "utf-8");
    const chunks = chunkMarkdown(content);

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      await upsertToVectorize(file, chunk, embedding);
    }
  }

  console.log("Ingestion complete!");
}

function chunkMarkdown(content: string): string[] {
  // Simple chunking by headers
  const chunks = content.split(/\n(?=#{1,3} )/);
  return chunks.filter((c) => c.trim().length > 0);
}

async function getEmbedding(text: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`;
  const response = await axios.post(
    url,
    { text },
    { headers: { Authorization: `Bearer ${API_TOKEN}` } },
  );
  return response.data.result.data[0];
}

async function upsertToVectorize(file: string, text: string, values: number[]) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v1/indexes/${INDEX_NAME}/upsert`;
  const id = `${file}-${Buffer.from(text.substring(0, 50)).toString("hex")}-${Math.random().toString(36).substring(7)}`;

  await axios.post(
    url,
    {
      vectors: [
        {
          id,
          values,
          metadata: { text, source: file },
        },
      ],
    },
    { headers: { Authorization: `Bearer ${API_TOKEN}` } },
  );
}

main().catch(console.error);
