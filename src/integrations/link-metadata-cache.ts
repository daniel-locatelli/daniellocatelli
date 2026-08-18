import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
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
// Favicons change more often than OG metadata; refresh them quarterly.
const FAVICON_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const FAVICON_INDEX = path.join(CACHE_DIR, "favicons", "index.json");
// Skip oversized candidates (e.g. animated GIF "favicons" on Wix sites) and
// fall through to the next one; a 16px icon should never be this large.
const FAVICON_MAX_BYTES = 200 * 1024;
const IMAGE_EXT_PATTERN = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
const FAVICON_MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/svg+xml": ".svg",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const scraper = metascraper([title(), description(), image()]);

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function readCached(
  key: string,
  logger: AstroIntegrationLogger,
): Promise<CachedLinkMetadata | null> {
  const file = path.join(CACHE_DIR, "metadata", `${key}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as CachedLinkMetadata;
    if (Date.now() - parsed.timestamp < TTL_MS) return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      logger.error(`failed to read ${file}: ${(err as Error).message}`);
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
  logger: AstroIntegrationLogger,
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    const buffer = new Uint8Array(await response.arrayBuffer());
    const ext = pickExt(imageUrl);
    const filename = `${key}${ext}`;
    const filePath = path.join(CACHE_DIR, "images", filename);
    await fs.writeFile(filePath, buffer);
    return filename;
  } catch (err) {
    logger.error(`image download failed for ${imageUrl}: ${(err as Error).message}`);
    return null;
  }
}

async function scrapeOne(
  href: string,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const key = generateLinkKey(href);
  const existing = await readCached(key, logger);
  if (existing) return;

  logger.info(`scraping ${href}`);
  try {
    const response = await fetch(href, {
      headers: { "user-agent": "Mozilla/5.0 (link-metadata-cache)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
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
      const local = await downloadImage(key, meta.image, logger);
      if (local) cached.localImagePath = local;
    }

    const metaPath = path.join(CACHE_DIR, "metadata", `${key}.json`);
    await fs.writeFile(metaPath, JSON.stringify(cached, null, 2));
  } catch (err) {
    logger.error(`scrape failed for ${href}: ${(err as Error).message}`);
  }
}

/**
 * Locate a site's favicon: prefer `<link rel="icon">`-style declarations in
 * the origin's HTML, fall back to `/favicon.ico`, and as a last resort ask
 * Google's favicon service. All of this happens at cache-refresh time on the
 * developer machine, so visitors never make third-party requests for icons.
 */
async function findFaviconCandidates(origin: string): Promise<string[]> {
  const candidates: string[] = [];
  try {
    const response = await fetch(origin, {
      headers: { "user-agent": "Mozilla/5.0 (link-metadata-cache)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) {
      const html = await response.text();
      const linkTags = html.match(/<link\s[^>]*>/gi) ?? [];
      const scored: { href: string; score: number }[] = [];
      for (const tag of linkTags) {
        const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
        if (!rel || !/\bicon\b/.test(rel) || rel.includes("mask-icon")) continue;
        const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
        if (!href) continue;
        const sizes = /sizes=["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
        const type = /type=["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
        let score = 0;
        if (rel.includes("apple-touch-icon")) score -= 2;
        if (/png/.test(type) || /\.png(\?|$)/i.test(href)) score += 2;
        if (/svg/.test(type) || /\.svg(\?|$)/i.test(href)) score += 1;
        if (/\b(32|48)x\1\b/.test(sizes)) score += 3;
        try {
          scored.push({ href: new URL(href, response.url).href, score });
        } catch {
          /* ignore malformed href */
        }
      }
      scored.sort((a, b) => b.score - a.score);
      candidates.push(...scored.map((c) => c.href));
    }
  } catch {
    /* fall through to defaults */
  }
  candidates.push(`${origin}/favicon.ico`);
  candidates.push(
    `https://www.google.com/s2/favicons?domain=${new URL(origin).hostname}&sz=32`,
  );
  return [...new Set(candidates)];
}

interface FaviconIndexEntry {
  file: string;
  source: string;
  timestamp: number;
}
type FaviconIndex = Record<string, FaviconIndexEntry>;

async function readFaviconIndex(): Promise<FaviconIndex> {
  try {
    return JSON.parse(await fs.readFile(FAVICON_INDEX, "utf-8")) as FaviconIndex;
  } catch {
    return {};
  }
}

async function cacheFavicon(
  hostname: string,
  index: FaviconIndex,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const existing = index[hostname];
  if (existing && Date.now() - existing.timestamp < FAVICON_TTL_MS) return;

  logger.info(`fetching favicon for ${hostname}`);
  for (const candidate of await findFaviconCandidates(`https://${hostname}`)) {
    try {
      const response = await fetch(candidate, {
        headers: { "user-agent": "Mozilla/5.0 (link-metadata-cache)" },
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) continue;
      const mime = (response.headers.get("content-type") ?? "")
        .split(";")[0]
        .trim()
        .toLowerCase();
      const ext = FAVICON_MIME_EXT[mime];
      if (!ext) continue;
      const buffer = new Uint8Array(await response.arrayBuffer());
      if (buffer.byteLength === 0 || buffer.byteLength > FAVICON_MAX_BYTES) continue;

      const file = `${hostname.replace(/[^a-z0-9.-]/gi, "_")}${ext}`;
      // Drop a stale file with a different extension so the folder stays clean.
      if (existing && existing.file !== file) {
        await fs.rm(path.join(CACHE_DIR, "favicons", existing.file), { force: true });
      }
      await fs.writeFile(path.join(CACHE_DIR, "favicons", file), buffer);
      index[hostname] = { file, source: candidate, timestamp: Date.now() };
      await fs.writeFile(FAVICON_INDEX, JSON.stringify(index, null, 2));
      return;
    } catch (err) {
      logger.warn(`favicon candidate ${candidate} failed: ${(err as Error).message}`);
    }
  }
  logger.warn(`no favicon found for ${hostname}`);
}

async function collectHrefs(logger: AstroIntegrationLogger): Promise<string[]> {
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
        logger.error(`failed to read ${file}: ${(err as Error).message}`);
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
        await ensureDir(path.join(CACHE_DIR, "favicons"));

        const hrefs = await collectHrefs(logger);
        logger.info(`found ${hrefs.length} unique OtherLinks URLs`);

        // Fire-and-forget per URL so dev-server startup is not blocked
        // by network round-trips. Each task catches its own errors.
        for (const href of hrefs) {
          scrapeOne(href, logger).catch((err) => {
            logger.error(`scrape pipeline error for ${href}: ${err.message}`);
          });
        }

        // Favicons are keyed per hostname and refreshed on a shorter TTL.
        // Run sequentially so concurrent writes to index.json cannot race.
        (async () => {
          const index = await readFaviconIndex();
          const hostnames = [...new Set(hrefs.map((h) => new URL(h).hostname))];
          for (const hostname of hostnames) {
            await cacheFavicon(hostname, index, logger).catch((err) => {
              logger.error(`favicon pipeline error for ${hostname}: ${err.message}`);
            });
          }
        })();
      },
    },
  };
}
