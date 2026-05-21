import type { AstroIntegration } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = "src/assets/links-cache";

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export default function linkMetadataCache(): AstroIntegration {
  return {
    name: "link-metadata-cache",
    hooks: {
      "astro:server:setup": async ({ logger }) => {
        await ensureDir(path.join(CACHE_DIR, "metadata"));
        await ensureDir(path.join(CACHE_DIR, "images"));
        logger.info("link-metadata-cache: ready (scrape disabled — Task 7 implements scraping)");
      },
    },
  };
}
