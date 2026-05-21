import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";
import matter from "gray-matter";
import metascraper from "metascraper";
import title from "metascraper-title";
import description from "metascraper-description";
import image from "metascraper-image";
import { generateLinkKey } from "../lib/link-metadata-helpers";
import type { CachedLinkMetadata, OtherLinkEntry } from "../types/link-preview";

const CACHE_DIR = "src/assets/links-cache";
const TTL_MS = 3 * 365 * 24 * 60 * 60 * 1000; // 3 years
const IMAGE_EXT_PATTERN = /\.(jpe?g|png|webp|gif|svg|avif)$/i;

const scraper = metascraper([title(), description(), image()]);

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readCached(key: string): Promise<CachedLinkMetadata | null> {
  const file = path.join(CACHE_DIR, "metadata", `${key}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as CachedLinkMetadata;
    if (Date.now() - parsed.timestamp < TTL_MS) return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`link-metadata-cache: failed to read ${file}`, err);
    }
  }
  return null;
}

function pickExt(imageUrl: string): string {
  const cleaned = imageUrl.split("?")[0].split("#")[0];
  const match = cleaned.match(IMAGE_EXT_PATTERN);
  return match ? match[0].toLowerCase() : ".jpg";
}

async function downloadImage(
  key: string,
  imageUrl: string,
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const buffer = new Uint8Array(await response.arrayBuffer());
    const ext = pickExt(imageUrl);
    const filename = `${key}${ext}`;
    const filePath = path.join(CACHE_DIR, "images", filename);
    await fs.writeFile(filePath, buffer);
    return filename;
  } catch (err) {
    console.error(`link-metadata-cache: image download failed for ${imageUrl}`, err);
    return null;
  }
}

async function scrapeOne(
  href: string,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const key = generateLinkKey(href);
  const existing = await readCached(key);
  if (existing) return;

  logger.info(`scraping ${href}`);
  try {
    const response = await fetch(href, {
      headers: { "user-agent": "Mozilla/5.0 (link-metadata-cache)" },
      redirect: "follow",
    });
    if (!response.ok) {
      logger.warn(`scrape ${href} returned HTTP ${response.status}`);
      return;
    }
    const html = await response.text();
    const meta = await scraper({ html, url: href });

    const cached: CachedLinkMetadata = {
      url: href,
      title: meta.title || undefined,
      description: meta.description || undefined,
      image: meta.image || undefined,
      timestamp: Date.now(),
    };

    if (meta.image) {
      const local = await downloadImage(key, meta.image);
      if (local) cached.localImagePath = local;
    }

    const metaPath = path.join(CACHE_DIR, "metadata", `${key}.json`);
    await fs.writeFile(metaPath, JSON.stringify(cached, null, 2));
  } catch (err) {
    logger.error(`scrape failed for ${href}: ${(err as Error).message}`);
  }
}

async function collectHrefs(): Promise<string[]> {
  const files = await glob("src/content/**/*.{md,mdx}", { absolute: true });
  const set = new Set<string>();
  await Promise.all(
    files.map(async (file) => {
      try {
        const raw = await fs.readFile(file, "utf-8");
        const { data } = matter(raw);
        const links = (data as { OtherLinks?: OtherLinkEntry[] }).OtherLinks;
        if (!Array.isArray(links)) return;
        for (const link of links) {
          if (link && typeof link.Href === "string") set.add(link.Href);
        }
      } catch (err) {
        console.error(`link-metadata-cache: failed to read ${file}`, err);
      }
    }),
  );
  return [...set];
}

export default function linkMetadataCache(): AstroIntegration {
  return {
    name: "link-metadata-cache",
    hooks: {
      "astro:server:setup": async ({ logger }) => {
        await ensureDir(path.join(CACHE_DIR, "metadata"));
        await ensureDir(path.join(CACHE_DIR, "images"));

        const hrefs = await collectHrefs();
        logger.info(`found ${hrefs.length} unique OtherLinks URLs`);

        // Fire-and-forget per URL so dev-server startup is not blocked
        // by network round-trips. Each task catches its own errors.
        for (const href of hrefs) {
          scrapeOne(href, logger).catch((err) => {
            logger.error(`scrape pipeline error for ${href}: ${err.message}`);
          });
        }
      },
      "astro:config:setup": ({ command, logger }) => {
        // Skip the build path: production builds rely on the committed cache.
        if (command !== "dev") {
          logger.info("link-metadata-cache: skipped in non-dev mode");
        }
      },
    },
  };
}

// fileURLToPath kept around for future use in resolve-relative helpers.
void fileURLToPath;
