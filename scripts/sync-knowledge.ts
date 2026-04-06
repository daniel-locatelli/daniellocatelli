/**
 * Syncs local knowledge/*.md files to Supabase knowledge_entries table.
 * Deletes all existing entries and re-inserts everything with fresh embeddings.
 *
 * Usage:
 *   npx tsx scripts/sync-knowledge.ts          # dry-run (default)
 *   npx tsx scripts/sync-knowledge.ts --apply   # wipe + re-insert all entries
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// ── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  console.error("Set them in your .env or export them before running.");
  process.exit(1);
}

const dryRun = !process.argv.includes("--apply");
const knowledgeDir = join(import.meta.dirname!, "..", "knowledge");

// ── Helpers ──────────────────────────────────────────────────────────────────

interface KnowledgeEntry {
  title: string;
  url: string;
  content: string;
  locale: string;
  type: string;
}

function parseKnowledgeFile(filePath: string): KnowledgeEntry | null {
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n");

  // Line 1: URL: https://...
  const urlMatch = lines[0]?.match(/^URL:\s*(.+)$/);
  if (!urlMatch) {
    console.warn(`  ! Skipping ${filePath}: no URL on line 1`);
    return null;
  }
  const url = urlMatch[1].trim();

  // Line 3: # Title
  const titleMatch = lines[2]?.match(/^#\s+(.+)$/);
  if (!titleMatch) {
    console.warn(`  ! Skipping ${filePath}: no title on line 3`);
    return null;
  }
  const title = titleMatch[1].trim();

  // Locale from filename: *-en.md, *-pt.md, *-de.md
  const filename = filePath.split(/[\\/]/).pop()!;
  let locale = "en";
  if (filename.endsWith("-pt.md")) locale = "pt";
  else if (filename.endsWith("-de.md")) locale = "de";

  // Type from URL path
  const urlPath = new URL(url).pathname;
  let type = "page";
  if (urlPath.includes("/research/")) type = "research";
  else if (urlPath.includes("/projects/")) type = "project";
  else if (urlPath.includes("/publications/")) type = "publication";
  else if (urlPath.includes("/teaching/")) type = "teaching";
  else if (urlPath.includes("/full-cv") || urlPath.includes("/cv"))
    type = "cv";

  return { title, url, content: raw, locale, type };
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    });

    if (!res.ok) {
      console.error(`    Embedding failed: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    return data.embedding;
  } catch (err) {
    console.error(`    Embedding error:`, err);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    dryRun
      ? "DRY RUN - showing what would be synced (use --apply to write)\n"
      : "APPLYING - wiping DB and re-inserting all entries\n",
  );

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  // 1. Read and parse all knowledge files
  const files = readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
  const entries: KnowledgeEntry[] = [];

  for (const file of files) {
    const parsed = parseKnowledgeFile(join(knowledgeDir, file));
    if (parsed) entries.push(parsed);
  }

  console.log(`Parsed ${entries.length} entries from ${files.length} files\n`);

  // Group by type for summary
  const byType = new Map<string, number>();
  const byLocale = new Map<string, number>();
  for (const e of entries) {
    byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
    byLocale.set(e.locale, (byLocale.get(e.locale) ?? 0) + 1);
  }
  console.log("By type:", Object.fromEntries(byType));
  console.log("By locale:", Object.fromEntries(byLocale));
  console.log();

  if (dryRun) {
    for (const e of entries) {
      console.log(
        `  [${e.type}] [${e.locale}] "${e.title}" (${e.content.length} chars)`,
      );
    }
    console.log("\nDry run complete. Use --apply to write changes.");
    return;
  }

  // 2. Delete all existing entries
  console.log("Deleting all existing entries...");
  const { error: deleteError } = await supabase
    .from("knowledge_entries")
    .delete()
    .gte("created_at", "1970-01-01"); // match all rows

  if (deleteError) {
    console.error("Delete failed:", deleteError);
    process.exit(1);
  }
  console.log("Deleted.\n");

  // 3. Insert all entries with embeddings
  let success = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const progress = `[${i + 1}/${entries.length}]`;
    process.stdout.write(
      `${progress} "${entry.title}" [${entry.locale}]... `,
    );

    const embedding = await generateEmbedding(entry.content);
    if (!embedding) {
      console.log("FAILED (embedding)");
      failed++;
      continue;
    }

    const { error } = await supabase.from("knowledge_entries").insert({
      title: entry.title,
      url: entry.url,
      content: entry.content,
      type: entry.type,
      locale: entry.locale,
      embedding,
    });

    if (error) {
      console.log(`FAILED: ${error.message}`);
      failed++;
    } else {
      console.log("OK");
      success++;
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
