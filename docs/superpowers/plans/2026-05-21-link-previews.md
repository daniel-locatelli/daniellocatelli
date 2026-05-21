# OtherLinks Rich Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `OtherLinks` rendering at the bottom of subpages with rich preview cards (title, description, favicon, hostname, OG image) backed by a dev-time scrape cache committed to git.

**Architecture:** A dev-only Astro integration runs in `astro:server:setup`, walks `src/content/**/*.{md,mdx}` for `OtherLinks` entries, and scrapes new URLs in the background using `metascraper`. Results are written to `src/assets/links-cache/{metadata,images}/`. A `LinkPreview.astro` component resolves cached entries via module-level `import.meta.glob` and merges them with author-provided frontmatter overrides (frontmatter wins, cache fills gaps).

**Tech Stack:** Astro 6, TypeScript strict, Cloudflare Workers (Static Assets) adapter, Tailwind 4, `metascraper`, `linkedom`, `gray-matter`, `fast-glob`, Node SHA-256 for cache keys, `astro:assets` for image optimization.

**Spec:** `docs/superpowers/specs/2026-05-21-link-previews-design.md`

**Out of scope:** The `References` field (PaperReferences in metadata table) is untouched. Multi-locale scraping per URL is not implemented. No "preview unavailable" fallback stub.

---

## Task 1: Add `generateLinkKey` helper with tests

**Files:**
- Create: `src/lib/link-metadata-helpers.ts`
- Create: `tests/unit/link-metadata-helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/link-metadata-helpers.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateLinkKey } from "../../src/lib/link-metadata-helpers";

test("generateLinkKey: hostname prefix + 8-char sha", () => {
  const key = generateLinkKey("https://art-engineering.net/en/projekt/canyon/");
  // hostname stub + dash + 8 hex chars
  assert.match(key, /^art-engineering-net-[0-9a-f]{8}$/);
});

test("generateLinkKey: strips www.", () => {
  const key = generateLinkKey("https://www.example.com/foo");
  assert.match(key, /^example-com-[0-9a-f]{8}$/);
});

test("generateLinkKey: replaces dots in hostname", () => {
  const key = generateLinkKey("https://docs.astro.build/en/");
  assert.match(key, /^docs-astro-build-[0-9a-f]{8}$/);
});

test("generateLinkKey: deterministic for the same URL", () => {
  const a = generateLinkKey("https://example.com/x?a=1");
  const b = generateLinkKey("https://example.com/x?a=1");
  assert.equal(a, b);
});

test("generateLinkKey: differs for distinct URLs that would collide under the old scheme", () => {
  // Under archcompute's dots-to-hyphens scheme, "a.b.com" and "a-b.com" collide.
  const a = generateLinkKey("https://a.b.com/");
  const b = generateLinkKey("https://a-b.com/");
  assert.notEqual(a, b);
});

test("generateLinkKey: produces filenames under 80 chars even for deep URLs", () => {
  const key = generateLinkKey(
    "https://very-long-hostname.example.com/" +
      "really/deep/path/with/many/segments?utm_source=foo&utm_medium=bar"
  );
  assert.ok(key.length < 80);
});

test("generateLinkKey: throws on invalid URL", () => {
  assert.throws(() => generateLinkKey("not a url"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/unit/link-metadata-helpers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the helper**

Create `src/lib/link-metadata-helpers.ts`:

```ts
import { createHash } from "node:crypto";

/**
 * Generate a stable, collision-safe filesystem key for a URL.
 * Format: <hostname-with-dots-replaced>-<8-char-sha256>
 *
 * The hostname prefix keeps `ls src/assets/links-cache/metadata/` readable.
 * The hash suffix guarantees uniqueness even when distinct URLs would
 * otherwise collide under a naive character-substitution scheme
 * (e.g. `a.b.com` vs `a-b.com`).
 */
export function generateLinkKey(href: string): string {
  const url = new URL(href);
  const hostStub = url.hostname.replace(/^www\./, "").replace(/\./g, "-").toLowerCase();
  const hash = createHash("sha256").update(href).digest("hex").slice(0, 8);
  return `${hostStub}-${hash}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/unit/link-metadata-helpers.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/link-metadata-helpers.ts tests/unit/link-metadata-helpers.test.ts
git commit -m "feat(links): add generateLinkKey helper for link cache filenames"
```

---

## Task 2: Add shared link-preview types

**Files:**
- Create: `src/types/link-preview.ts`

- [ ] **Step 1: Write the type module**

Create `src/types/link-preview.ts`:

```ts
/**
 * Cached metadata scraped from a remote URL referenced in `OtherLinks`.
 * Written to `src/assets/links-cache/metadata/<key>.json` by the
 * `link-metadata-cache` integration; consumed by `LinkPreview.astro`.
 */
export interface CachedLinkMetadata {
  /** The original URL — the `<key>` is sha-derived, so this is the human-readable identifier. */
  url: string;
  title?: string;
  description?: string;
  /** Remote URL of the scraped OG image, before download. */
  image?: string;
  /** Filename inside `src/assets/links-cache/images/`, if download succeeded. */
  localImagePath?: string;
  /** Epoch ms; entries older than the TTL are re-scraped. */
  timestamp: number;
}

/** A single entry in the `OtherLinks` frontmatter array (after Zod validation). */
export interface OtherLinkEntry {
  Href: string;
  Text?: string;
  Description?: string;
  Image?: string;
  HideMedia?: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx astro check --minimumSeverity error`
Expected: 0 errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add src/types/link-preview.ts
git commit -m "feat(links): add CachedLinkMetadata and OtherLinkEntry types"
```

---

## Task 3: Extend the `OtherLinks` schema

**Files:**
- Modify: `src/content.config.ts:193-201`

- [ ] **Step 1: Replace the existing OtherLinks block**

In `src/content.config.ts`, find:

```ts
  OtherLinks: z
    .array(
      z.object({
        Text: z.string(),
        Href: z.string(),
        Description: z.string().optional(),
      }),
    )
    .optional(),
```

Replace with:

```ts
  OtherLinks: z
    .array(
      z.object({
        Href: z.string().url(),
        Text: z.string().optional(),
        Description: z.string().optional(),
        Image: z.string().optional(),
        HideMedia: z.boolean().optional(),
      }),
    )
    .optional(),
```

- [ ] **Step 2: Verify all existing content still validates**

Run: `npx astro check`
Expected: 0 schema errors. All 26 existing `OtherLinks` usages continue to validate because they already supply `Text` and `Href`.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(links): extend OtherLinks schema with optional Image and HideMedia"
```

---

## Task 4: Install scraping dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + dev dependencies**

These are integration-only (dev-time scraping), so they go under `devDependencies`. Run:

```bash
npm install --save-dev metascraper metascraper-title metascraper-description metascraper-image linkedom gray-matter fast-glob
```

- [ ] **Step 2: Verify install**

Run: `npm ls metascraper linkedom gray-matter fast-glob --depth=0`
Expected: each lists a resolved version, no "missing" or "unmet" warnings.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add metascraper, linkedom, gray-matter, fast-glob for link cache"
```

---

## Task 5: Create the cache directory structure

**Files:**
- Create: `src/assets/links-cache/metadata/.gitkeep`
- Create: `src/assets/links-cache/images/.gitkeep`

- [ ] **Step 1: Create both directories with a .gitkeep**

```bash
mkdir -p src/assets/links-cache/metadata src/assets/links-cache/images
type nul > src/assets/links-cache/metadata/.gitkeep
type nul > src/assets/links-cache/images/.gitkeep
```

(On PowerShell, use `New-Item -ItemType File -Path src/assets/links-cache/metadata/.gitkeep` and `... images/.gitkeep`.)

- [ ] **Step 2: Confirm the dirs are tracked**

Run: `git status`
Expected: two new `.gitkeep` files listed under untracked.

- [ ] **Step 3: Commit**

```bash
git add src/assets/links-cache/metadata/.gitkeep src/assets/links-cache/images/.gitkeep
git commit -m "feat(links): scaffold src/assets/links-cache/ directory layout"
```

---

## Task 6: Scaffold the integration (config only, no scraping yet)

This task wires the integration into `astro.config.mts` so dev still starts cleanly. Scraping logic comes in Task 7. Splitting reduces blast radius if something is mis-imported.

**Files:**
- Create: `src/integrations/link-metadata-cache.ts`
- Modify: `astro.config.mts`

- [ ] **Step 1: Create the integration scaffold**

Create `src/integrations/link-metadata-cache.ts`:

```ts
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
```

- [ ] **Step 2: Register the integration**

In `astro.config.mts`, add the import alongside the other integration imports:

```ts
import linkMetadataCache from "./src/integrations/link-metadata-cache";
```

Then update the integrations array (currently line 45):

```ts
integrations: [sitemap(), icon(), react(), mdx(), linkMetadataCache()],
```

- [ ] **Step 3: Start the dev server and confirm the integration runs**

Run: `npm run dev` (Ctrl-C after the startup log appears, no need to keep it running).
Expected: a line `[link-metadata-cache] link-metadata-cache: ready (scrape disabled — Task 7 implements scraping)` appears during startup. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/integrations/link-metadata-cache.ts astro.config.mts
git commit -m "feat(links): scaffold link-metadata-cache integration"
```

---

## Task 7: Implement the scrape pipeline inside the integration

**Files:**
- Modify: `src/integrations/link-metadata-cache.ts`

- [ ] **Step 1: Replace the integration with the full implementation**

Open `src/integrations/link-metadata-cache.ts` and replace its entire contents with:

```ts
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
```

- [ ] **Step 2: Start dev and watch the integration run**

Run: `npm run dev`. Wait ~10-30 seconds for the background scrapes to complete (output will show `scraping <url>` lines for any URL not yet cached). Ctrl-C when the log goes quiet.

- [ ] **Step 3: Confirm cache files were created**

```bash
ls src/assets/links-cache/metadata | head -5
ls src/assets/links-cache/images | head -5
```

Expected: multiple `.json` files in `metadata/`, multiple image files in `images/`. Each JSON should have a `url`, `title`, optionally `description`, optionally `image` + `localImagePath`, and a `timestamp`.

- [ ] **Step 4: Sanity-check one entry by hand**

```bash
cat src/assets/links-cache/metadata/$(ls src/assets/links-cache/metadata | grep -v gitkeep | head -1)
```

Expected: valid JSON, no obviously broken fields.

- [ ] **Step 5: Commit**

```bash
git add src/integrations/link-metadata-cache.ts
git commit -m "feat(links): scrape OtherLinks URLs and cache metadata + images"
```

Note: cache JSON and images themselves get committed in Task 11 after we know rendering works end-to-end. If you also want to commit them here for safety, that's fine — they're idempotent.

---

## Task 8: Create the glob cache module

**Files:**
- Create: `src/components/link-preview-cache.ts`

- [ ] **Step 1: Write the cache module**

Create `src/components/link-preview-cache.ts`:

```ts
import type { CachedLinkMetadata } from "@/types/link-preview";

/**
 * Module-level lazy loaders for cache files. `import.meta.glob` is statically
 * resolved at build time, so these records are built once and the per-render
 * cost in `LinkPreview.astro` is an O(1) map lookup + one dynamic import per hit.
 *
 * Paths must be project-root-relative (leading `/src/...`), per Vite/Astro rules.
 */
export const metadataCache = import.meta.glob<{ default: CachedLinkMetadata }>(
  "/src/assets/links-cache/metadata/*.json",
  { eager: false },
);

export const imageCache = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/links-cache/images/*.{jpeg,jpg,png,webp,gif,svg,avif}",
  { eager: false },
);

let userAssetsCache:
  | Record<string, () => Promise<{ default: ImageMetadata }>>
  | null = null;

/**
 * Lazily-initialized glob over user-provided assets, for manual `Image:`
 * overrides in `OtherLinks` frontmatter. Built only on first access so the
 * heavier glob doesn't run for every page.
 */
export function getUserAssets() {
  if (!userAssetsCache) {
    userAssetsCache = import.meta.glob<{ default: ImageMetadata }>(
      "/src/assets/**/*.{jpeg,jpg,png,webp,gif,svg,avif}",
      { eager: false },
    );
  }
  return userAssetsCache;
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: no errors. `ImageMetadata` is a global type provided by Astro.

- [ ] **Step 3: Commit**

```bash
git add src/components/link-preview-cache.ts
git commit -m "feat(links): add module-level glob cache for link previews"
```

---

## Task 9: Create the `LinkPreview` component

**Files:**
- Create: `src/components/LinkPreview.astro`

- [ ] **Step 1: Write the component**

Create `src/components/LinkPreview.astro`:

```astro
---
import { Image } from "astro:assets";
import { generateLinkKey } from "@/lib/link-metadata-helpers";
import {
  metadataCache,
  imageCache,
  getUserAssets,
} from "@/components/link-preview-cache";
import type {
  CachedLinkMetadata,
  OtherLinkEntry,
} from "@/types/link-preview";

interface Props {
  link: OtherLinkEntry;
}

const { link } = Astro.props;

let cached: CachedLinkMetadata | null = null;
let resolvedImage: ImageMetadata | null = null;

const key = generateLinkKey(link.Href);
const metaPath = `/src/assets/links-cache/metadata/${key}.json`;
const metaLoader = metadataCache[metaPath];
if (metaLoader) {
  const mod = await metaLoader();
  cached = mod.default;
}

// Cached image (only if no manual override)
if (!link.Image && cached?.localImagePath) {
  const imgPath = `/src/assets/links-cache/images/${cached.localImagePath}`;
  const imgLoader = imageCache[imgPath];
  if (imgLoader) {
    const mod = await imgLoader();
    resolvedImage = mod.default;
  }
}

// Manual `Image:` override (frontmatter wins)
if (link.Image) {
  const assets = getUserAssets();
  let candidatePath = link.Image;
  if (!candidatePath.startsWith("/src/")) {
    candidatePath = candidatePath.startsWith("/")
      ? `/src${candidatePath}`
      : `/src/${candidatePath}`;
  }
  let loader = assets[candidatePath];
  if (!loader) {
    const filename = candidatePath.split("/").pop() ?? "";
    const match = Object.keys(assets).find((k) => k.endsWith(filename));
    if (match) loader = assets[match];
  }
  if (loader) {
    const mod = await loader();
    resolvedImage = mod.default;
  }
}

const hostname = new URL(link.Href).hostname;
const title = link.Text ?? cached?.title ?? hostname;
const description = link.Description ?? cached?.description ?? null;
const showImage = !link.HideMedia && resolvedImage !== null;
const faviconSrc = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
---

<a
  href={link.Href}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex overflow-hidden rounded-lg border border-zinc-700 bg-transparent transition hover:border-green-600 hover:bg-zinc-900"
>
  <div class="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
    <span class="font-body text-sm font-medium text-green-500 truncate">
      {title}
    </span>
    {description && (
      <span class="text-xs text-zinc-400 line-clamp-2">{description}</span>
    )}
    <span class="mt-1 flex items-center gap-2 text-xs text-zinc-500">
      <img
        src={faviconSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width="16"
        height="16"
        class="inline-block h-4 w-4 shrink-0"
      />
      <span class="truncate">{hostname}</span>
    </span>
  </div>
  {showImage && resolvedImage && (
    <div class="relative w-44 shrink-0">
      <Image
        src={resolvedImage}
        alt={title}
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )}
</a>
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: no errors. If the `OtherLinkEntry` type fails to match what Astro infers from the Zod schema, adjust either the type or the destructure — but the field names and optionality are deliberately aligned with the schema in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/components/LinkPreview.astro
git commit -m "feat(links): add LinkPreview card component"
```

---

## Task 10: Wire `LinkPreview` into the subpage template

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro` (lines 624-655, and the import block at the top)

- [ ] **Step 1: Add the import**

At the top of the file, in the existing import block (find the other `@/components/...` imports near the top of the frontmatter script), add:

```ts
import LinkPreview from "@/components/LinkPreview.astro";
```

- [ ] **Step 2: Replace the inline rendering block**

Find lines 624-655 (the `subpage.data.OtherLinks && ...` block) and replace with:

```astro
{
  subpage.data.OtherLinks && subpage.data.OtherLinks.length > 0 && (
    <div class="mt-8">
      <h2 class="font-title mb-4 text-xl text-zinc-100">{t.otherLinks}</h2>
      <div class="flex flex-col gap-3">
        {subpage.data.OtherLinks.map((link) => (
          <LinkPreview link={link} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and visually verify**

Run: `npm run dev`. In a browser, open three representative pages (English locale):

- `http://localhost:4321/projects/canyon-by-artengineering-for-katharina-grosse/` — has 4 `OtherLinks`, all external.
- `http://localhost:4321/research/itke-research-assistant-for-coreless-filament-winding/` — uses `OtherLinks` in research.
- `http://localhost:4321/projects/o3-pavilion-by-atelier-marko-brajovic-for-docol/` — verifies projects rendering.

Expected on each:
- A "Other Links" heading.
- One card per link, each showing title, hostname, favicon, and (where the OG scrape succeeded) an image on the right side.
- Hover state changes border to green and background to dark.

- [ ] **Step 4: Type-check the full project**

Run: `npm run build` (Ctrl-C as soon as `astro check` finishes; we don't need a full Cloudflare bundle here).
Expected: `astro check` reports 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "feat(links): render OtherLinks via LinkPreview cards"
```

---

## Task 11: Commit the cache files

**Files:**
- Add: `src/assets/links-cache/metadata/*.json`
- Add: `src/assets/links-cache/images/*`

- [ ] **Step 1: Stage the cache**

```bash
git add src/assets/links-cache/metadata src/assets/links-cache/images
git status
```

Expected: a number of new JSON and image files staged.

- [ ] **Step 2: Spot-check one JSON before committing**

Pick any one of the new JSON files and confirm it has plausible fields (a real `title`, real `description`, and a `url` matching one of the `Href` values in `src/content/`).

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(links): commit initial link metadata + image cache"
```

This makes the production Cloudflare build self-sufficient (no network access at build time).

---

## Task 12: Verify production build

**Files:** none modified.

- [ ] **Step 1: Run the full build**

Run: `npm run build`
Expected: `astro check && astro build` both succeed. The compiled-image pipeline processes the cache images alongside other site assets.

- [ ] **Step 2: Preview the built site**

Run: `npm run preview`. Open one of the same pages from Task 10, Step 3 in the browser.
Expected: rendering matches the dev-server output. Cards still show images.

- [ ] **Step 3: Verify the dev integration is a no-op for build**

Skim the build log: there should be no `link-metadata-cache: scraping ...` lines (the integration's scrape pipeline runs only in `astro:server:setup`, which doesn't fire during `astro build`).

- [ ] **Step 4: No commit needed** — this task is verification only.

---

## Self-Review Notes

**Spec coverage map** (each section → task):

| Spec section | Implementation |
|---|---|
| Schema change | Task 3 |
| Cache layout (key format) | Task 1 (helper) + Task 5 (dirs) |
| Astro integration (server:setup, fire-and-forget) | Task 6 (scaffold) + Task 7 (scraping) |
| Manual frontmatter parsing rationale | Task 7 step 1, inline |
| Component glob cache (module-level) | Task 8 |
| Component (frontmatter wins) | Task 9 |
| Page template integration | Task 10 |
| Production safety (committed cache) | Task 11 + Task 12 |
| Fallback (no broken stub) | Task 9 (title falls back to hostname; image column hides when none resolved) |

**Out-of-scope verification:**
- `References` field: not touched in any task; only `OtherLinks` schema edited in Task 3.
- The metadata-table rendering at `subpage.astro:604-621` (the `References` row) is not in any task's modify list.

**Type consistency:** `OtherLinkEntry` (Task 2) field names match the Zod schema (Task 3). `CachedLinkMetadata` shape is identical across writer (Task 7) and reader (Tasks 8, 9). `generateLinkKey` signature identical across helper (Task 1), integration (Task 7), and component (Task 9).

**Commit hygiene:** every task ends with a commit. Each commit produces a working `astro check` state (no half-finished states in history).
