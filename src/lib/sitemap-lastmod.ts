import { execSync } from "node:child_process";
import { SUPPORTED_LOCALES, siteConfig } from "../config/site";

/**
 * Per-URL `lastmod` for the sitemap, derived from git commit history.
 *
 * `@astrojs/sitemap` emits bare `<loc>` entries by default. `lastmod` is the
 * only sitemap freshness signal Google actually consumes, so we map each
 * generated URL back to the source file that produces it and stamp it with that
 * file's last-commit date (`%cI`, committer date, ISO 8601).
 *
 * Robustness: the whole thing is best-effort. If git is unavailable or history
 * is shallow (e.g. a CI clone without full history), `buildLastmodMap()` returns
 * an empty map and `serializeLastmod` simply leaves `lastmod` off, which is a
 * valid sitemap. It never throws into the build.
 */

const DEFAULT_LOCALE = siteConfig.defaultLocale;

/** URL prefix for a locale: "" for the default, "/<locale>" otherwise. */
function localePrefix(locale: string): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

function isLocale(value: string): boolean {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Map a content source file to the sitemap pathname it produces, or null if it
 * should not appear (drafts, skills, decks, unknown shapes).
 *
 * Handles both `<collection>/<locale>/<slug>.{md,mdx}` and the
 * `<collection>/<locale>/<slug>/index.md` directory form.
 */
export function contentFileToPathname(file: string): string | null {
  const match = file.match(
    /^src\/content\/([^/]+)\/([^/]+)\/(.+)\.(?:md|mdx)$/,
  );
  if (!match) return null;
  const [, collection, locale, rest] = match;

  if (!isLocale(locale)) return null;
  // Mirror the sitemap filter + route exclusions.
  if (collection === "skills") return null;

  const parts = rest.split("/");
  const last = parts[parts.length - 1];
  if (last === "deck") return null; // /deck/ viewers are excluded from sitemap

  const slug = last === "index" ? parts.slice(0, -1).join("/") : rest;
  if (!slug) return null;
  // Draft entries (leading underscore on the file slug) are not routed.
  if (slug.split("/").pop()!.startsWith("_")) return null;

  return `${localePrefix(locale)}/${collection}/${slug}/`;
}

/** Static `src/pages/[...locale]/<name>.astro` files that ship in every locale. */
const STATIC_PAGES: Record<string, string> = {
  "index.astro": "/",
  "cv.astro": "/cv/",
  "full-cv.astro": "/full-cv/",
  "phd-cv.astro": "/phd-cv/",
  "impressum.astro": "/impressum/",
  "privacy-policy.astro": "/privacy-policy/",
  "terms-and-conditions.astro": "/terms-and-conditions/",
};

/** Collections that render an index listing page (`/<collection>/`). */
const LISTING_COLLECTIONS = ["projects", "research", "teaching"] as const;

/**
 * `source file -> ISO date` of each file's newest commit, from a single
 * `git log` pass. Cached for the process lifetime. Empty when git is
 * unavailable or the clone is shallow.
 */
let fileDateCache: Map<string, string> | null = null;
export function buildFileDateMap(): Map<string, string> {
  if (fileDateCache) return fileDateCache;
  const fileDate = new Map<string, string>();
  fileDateCache = fileDate;

  let log: string;
  try {
    log = execSync("git log --date-order --format=%cI --name-only", {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return fileDate; // git unavailable / shallow clone: degrade to no dates
  }

  // First (newest) date seen for each source file.
  let currentDate = "";
  for (const line of log.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      currentDate = trimmed;
      continue;
    }
    if (!fileDate.has(trimmed)) fileDate.set(trimmed, currentDate);
  }
  return fileDate;
}

/**
 * ISO date of the newest commit touching `file` (repo-relative, forward
 * slashes, e.g. `src/content/projects/en/portfolio-website.md`), or undefined
 * when unknown. Absolute paths are accepted and made repo-relative.
 */
export function getFileLastModified(file: string): string | undefined {
  const normalized = file.replace(/\\/g, "/");
  const idx = normalized.indexOf("/src/");
  const rel = normalized.startsWith("src/")
    ? normalized
    : idx >= 0
      ? normalized.slice(idx + 1)
      : normalized;
  return buildFileDateMap().get(rel);
}

/**
 * Build a `pathname -> ISO date` map from git history. Newest commit wins per
 * file.
 */
export function buildLastmodMap(): Map<string, string> {
  const map = new Map<string, string>();
  const fileDate = buildFileDateMap();

  // Track newest entry date per collection for listing pages.
  const collectionMax = new Map<string, string>();

  for (const [file, date] of fileDate) {
    // Content entries.
    const pathname = contentFileToPathname(file);
    if (pathname) {
      if (!map.has(pathname) || date > map.get(pathname)!) {
        map.set(pathname, date);
      }
      const collection = file.split("/")[2];
      if (!collectionMax.has(collection) || date > collectionMax.get(collection)!) {
        collectionMax.set(collection, date);
      }
      continue;
    }

    // Static localized pages (one source file -> one URL per locale).
    const staticMatch = file.match(/^src\/pages\/\[\.\.\.locale\]\/([^/]+)$/);
    if (staticMatch && STATIC_PAGES[staticMatch[1]]) {
      const barePath = STATIC_PAGES[staticMatch[1]];
      for (const locale of SUPPORTED_LOCALES) {
        const key =
          barePath === "/"
            ? `${localePrefix(locale)}/` || "/"
            : `${localePrefix(locale)}${barePath}`;
        if (!map.has(key) || date > map.get(key)!) map.set(key, date);
      }
    }
  }

  // Listing pages: newest entry in the collection.
  for (const collection of LISTING_COLLECTIONS) {
    const date = collectionMax.get(collection);
    if (!date) continue;
    for (const locale of SUPPORTED_LOCALES) {
      map.set(`${localePrefix(locale)}/${collection}/`, date);
    }
  }

  return map;
}

let cached: Map<string, string> | null = null;

/**
 * `serialize` hook for `@astrojs/sitemap`. Adds `lastmod` when the URL maps to a
 * known source file; otherwise returns the item unchanged.
 */
export function serializeLastmod<T extends { url: string; lastmod?: string }>(
  item: T,
): T {
  if (!cached) cached = buildLastmodMap();
  let pathname: string;
  try {
    pathname = new URL(item.url).pathname;
  } catch {
    return item;
  }
  if (!pathname.endsWith("/")) pathname += "/";
  const lastmod = cached.get(pathname);
  return lastmod ? { ...item, lastmod } : item;
}
