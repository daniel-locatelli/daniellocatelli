# Rich `OtherLinks` Cards with Cached Metadata

**Status:** Draft
**Date:** 2026-05-21
**Owner:** Daniel Locatelli

## Problem

Content collections expose an `OtherLinks` array at the bottom of each page, currently rendered as a stack of bare `<a>` elements showing only the author-provided text plus the raw URL. Visually flat, no preview of the destination, and the user can not tell at a glance whether a link points to a portfolio site, a Wikipedia article, a tweet, or a PDF.

The `archcompute` project (Starlight-based) solves the same problem for its `references` and `tools` frontmatter: at dev time, an Astro integration scrapes each URL with `metascraper`, downloads the Open Graph image into `src/assets/metadata-cache/`, and renders the result through a `LinkPreview.astro` card with title, description, hostname, favicon, and OG image. The cache files are committed to git, so production builds work offline.

This spec adapts that pattern to `daniellocatelli`. It enhances the existing `OtherLinks` field in place rather than introducing a new field, leaves the unrelated `References` (PaperReferences) field untouched, and respects the Cloudflare Static-Assets deployment model.

## Scope

In scope:

- Schema extension for `OtherLinks` in `src/content.config.ts`.
- Build-time metadata + image cache in `src/assets/links-cache/` (committed to git).
- Astro integration that scrapes URLs in dev mode (`astro:config:setup`).
- Reusable `LinkPreview.astro` component.
- Replace the existing inline rendering in `src/pages/[...locale]/[...subpage].astro` (lines 624-655) with the new component.
- Apply to every collection that uses `pageSchema` (projects, research, teaching, publications, skills, experiences, education, scholarships, certifications, courses-attended, pages). Since the rendering is centralized in the subpage template, this is automatic.

Out of scope:

- The `References` field (used as PaperReferences in the metadata table row, lines 604-621 of `subpage.astro`). Untouched.
- Automatic re-scrape on a schedule. 3-year TTL is sufficient for this kind of content.
- Multi-locale variants of scraped metadata. The URL itself is the cache key, so locale-specific URLs (e.g. `pt.wikipedia.org` vs. `en.wikipedia.org`) get their own cache entries naturally.
- Non-image media (videos, PDFs). Cards fall back to text-only when no OG image is available.
- A "Preview unavailable" stub like archcompute. When metadata is missing, the card renders text-only in the same shape, rather than displaying an obviously-broken fallback.

## Schema change

`src/content.config.ts` currently defines:

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

New shape:

```ts
OtherLinks: z
  .array(
    z.object({
      Href: z.string().url(),
      Text: z.string().optional(),         // scrape backfills when absent
      Description: z.string().optional(),
      Image: z.string().optional(),        // /src/... or relative under src/assets/
      HideMedia: z.boolean().optional(),   // suppress the thumbnail column
    }),
  )
  .optional(),
```

All 26 existing files keep validating since they already provide `Text`, `Href`, and (sometimes) `Description`. Making `Text` optional is the only relaxation; new fields are additive.

**Why a single object rather than a parallel `OtherLinksRich` field:** keeping one source of truth means the rendering path branches on the *presence* of cached metadata, not on which schema version produced the entry. Authors do not have to choose between two shapes; they just write what they have, and the cache fills the rest.

## Cache layout

```
src/assets/links-cache/
  metadata/<key>.json     ← { url, title, description, image, localImagePath, timestamp }
  images/<key>.<ext>      ← downloaded OG image
```

The `<key>` is produced by a `generateLinkKey(href)` helper:

- Take the hostname, strip `www.`, lowercase, replace dots with `-`.
- Append `-` and the first 8 hex chars of `sha256(href)`.

Example: `https://art-engineering.net/en/projekt/canyon/` becomes `art-engineering-net-3f1c9a2b.json`.

**Rationale:** The character-substitution scheme used in archcompute (replace `.`, `/`, `?` with `-` and `_`) has two failure modes:

- **Collisions.** `a.b.com` and `a-b.com` both produce `a-b-com` after `. → -`. Equally, `foo/bar` and `foo_bar` collide after `/ → _`. Curated portfolio links make this unlikely, but the cache is a long-lived artifact and the bug would silently overwrite one URL's metadata with another's.
- **Length blow-up.** Deep paths with query strings can exceed 255 chars on Windows/NTFS, which would cascade into git checkout failures on contributors' machines.

A short SHA-256 prefix avoids both. The readable hostname stub keeps `ls metadata/` grep-friendly when debugging; the full URL also lives in the JSON body (`url` field).

Cache files live under `src/assets/` (not `public/`) so that `astro:assets` and the Cloudflare `imageService: { build: "compile" }` pipeline can pick them up via `import.meta.glob` as `ImageMetadata` objects. This buys responsive sizing and modern-format conversion for free.

`CachedMetadata` shape:

```ts
type CachedMetadata = {
  url: string;
  title?: string;
  description?: string;
  image?: string;             // original remote URL
  localImagePath?: string;    // filename inside images/, if download succeeded
  timestamp: number;          // ms epoch
};
```

## Astro integration

New file: `src/integrations/link-metadata-cache.ts`.

Lifecycle: runs in `astro:server:setup`, skipped when `command !== "dev"` (so production builds and `astro check` never hit the network).

**Why `astro:server:setup` rather than `astro:config:setup`:** the config-setup hook fires before Vite is initialized and is intended for configuring integrations (injecting middleware, registering route handlers). Doing heavy I/O there — walking the filesystem and issuing `fetch` calls — blocks dev-server startup time. `astro:server:setup` fires after Vite is set up but before requests arrive, which is the correct home for "do work on dev-server start." It also receives a logger and the dev-server reference.

Steps inside the hook:

1. Ensure `src/assets/links-cache/{metadata,images}/` exist.
2. Walk `src/content/**/*.{md,mdx}` with `fast-glob`.
3. Parse only the frontmatter of each file with `gray-matter` (lightweight — does not parse the markdown body).
4. Collect all unique `Href` values from every `OtherLinks` array.
5. For each unique `Href`, **kick off the scrape without awaiting** (fire-and-forget per URL, with a per-task `.catch()` that logs failures). This means dev-server startup does not wait for network round trips; the cache populates in the background as the server spins up. New cards appear after a page reload.
   - Compute `<key>` and check `metadata/<key>.json`.
   - If present and `Date.now() - timestamp < 3 years`, skip.
   - Otherwise, `fetch(href)`, run `metascraper` with `title`, `description`, `image` modules, write JSON.
   - If the scrape returned an image URL, download it (best-effort, log on failure) and record `localImagePath`.

The integration logs each cache miss so the user can see progress on first run after adding new links.

**Why parse frontmatter manually instead of using Astro's content layer:** at integration-hook time the content collection layer is not yet usable from inside an integration. `getCollection()` is a runtime API meant for `.astro` pages. `gray-matter` only parses the YAML header (not the markdown body), so the cost is negligible — sub-second across the full `src/content/` tree. Trading that for hooking into Astro's internal data store would introduce build-graph timing fragility for no measurable gain.

New devDependencies:

- `metascraper`
- `metascraper-title`
- `metascraper-description`
- `metascraper-image`
- `linkedom` (HTML parsing fallback, matching archcompute)
- `gray-matter`
- `fast-glob`

Wired into `astro.config.mts`:

```ts
import linkMetadataCache from "./src/integrations/link-metadata-cache";

integrations: [sitemap(), icon(), react(), mdx(), linkMetadataCache()],
```

## Component

New file: `src/components/LinkPreview.astro`. Props:

```ts
interface Props {
  link: {
    Href: string;
    Text?: string;
    Description?: string;
    Image?: string;
    HideMedia?: boolean;
  };
}
```

**Glob resolution lives in a sibling module**, not inside the component script. New file: `src/components/link-preview-cache.ts`:

```ts
export const metadataCache = import.meta.glob<{
  default: import("@/types").CachedLinkMetadata;
}>("/src/assets/links-cache/metadata/*.json", { eager: false });

export const imageCache = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/links-cache/images/*.{jpeg,jpg,png,webp,gif,svg,avif}",
  { eager: false },
);

let userAssetsCache: Record<string, () => Promise<{ default: ImageMetadata }>> | null = null;
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

**Why this matters:** `import.meta.glob` is statically resolved at build time. Each call adds a record of lazy loaders to the bundle. Calling it inside a `.astro` component script means the work happens once per component invocation. Putting the globs at module top of a shared cache module means they're built once at compile time and the runtime cost per `<LinkPreview>` render is O(1) record lookup. The `getUserAssets()` lazy initializer keeps the expensive `src/assets/**` glob out of the bundle when no card has a manual `Image` override. The `<{ default: ImageMetadata }>` type parameter lets `astro:assets`'s `<Image>` accept the resolved value with no casts.

Resolution order at render time:

1. Compute `<key>` from `link.Href` using `generateLinkKey`.
2. Look up `metadataCache["/src/assets/links-cache/metadata/<key>.json"]`; if found, await the loader.
3. If `metadata.localImagePath` is set, look up `imageCache["/src/assets/links-cache/images/<localImagePath>"]` and await it.
4. If `link.Image` is provided, override the cached image: try exact match in `getUserAssets()`, otherwise fall back to filename match.
5. Merge: frontmatter wins, cache fills gaps.

Final values:

- `title` = `link.Text ?? metadata.title ?? hostname`
- `description` = `link.Description ?? metadata.description ?? null`
- `imageMetadata` = `link.Image ?? metadata.localImagePath ?? null`
- `hostname` = `new URL(link.Href).hostname`

Rendered card layout (Tailwind, matching the site's dark theme):

```
┌──────────────────────────────────────────────────┬─────────────┐
│ Title (truncate)                                 │             │
│ Description (line-clamp-2)                       │   image     │
│ [favicon] hostname                               │  (cover)    │
└──────────────────────────────────────────────────┴─────────────┘
```

Styling:

- Container: `flex overflow-hidden rounded-lg border border-zinc-700 transition hover:border-green-600 hover:bg-zinc-900`.
- Text column: `flex-1 p-4 min-w-0` (the `min-w-0` lets the title truncate properly inside a flex child).
- Title: `font-body text-sm font-medium text-green-500 truncate`.
- Description: `text-xs text-zinc-400 line-clamp-2 mt-1`.
- Footer row: `flex items-center gap-2 mt-2 text-xs text-zinc-500`.
- Image column: `relative w-44 shrink-0` with the `<Image>` set to `absolute inset-0 h-full w-full object-cover`. Hidden when `link.HideMedia` is true or no image resolved.

Image rendering uses `import { Image } from "astro:assets"` so the Cloudflare adapter compiles transforms at build time. Favicon uses a plain `<img loading="lazy" src="https://www.google.com/s2/favicons?domain=…&sz=32">` to avoid bundling another local asset.

When `HideMedia` is true or no image resolves, the image column simply disappears (the text column expands to fill).

## Page-template integration

In `src/pages/[...locale]/[...subpage].astro`, replace the existing inline rendering (lines 624-655):

```astro
import LinkPreview from "@/components/LinkPreview.astro";
...
{
  subpage.data.OtherLinks && subpage.data.OtherLinks.length > 0 && (
    <div class="mt-8">
      <h2 class="font-title mb-4 text-xl text-zinc-100">{t.otherLinks}</h2>
      <div class="flex flex-col gap-3">
        {subpage.data.OtherLinks.map((link) => <LinkPreview link={link} />)}
      </div>
    </div>
  )
}
```

The existing translation key `t.otherLinks` is reused. No new i18n strings are required.

## Fallback behavior

The component must never break a page render. Order of degradation:

1. Cache hit + frontmatter overrides → full card with image.
2. Cache hit, no image → card without image column.
3. Cache miss but `link.Text` set → text-only card with hostname footer.
4. Cache miss, no `link.Text` → use hostname as title; show description if author set one.

There is no "Preview unavailable" stub; every state produces a card with consistent shape so the page never shows visible scraper failures.

## Production-build safety

Three independent layers protect the Cloudflare deployment:

1. Cache files are committed to git, so production builds find what they need on disk.
2. The integration runs only in dev (`command === "dev"` check in `astro:config:setup`), so a build that never saw the cache populated will not try to hit the network during deploy.
3. The component degrades gracefully when cache lookups return nothing.

This means: if someone adds a link and forgets to run `npm run dev` before pushing, the production card simply renders as a text-only fallback. No 500s, no broken images. The author can then run dev locally, commit the new cache files, and the next deploy gets the richer rendering.

## Workflow note

To populate the cache after editing `OtherLinks` in any content file:

```
npm run dev
```

Wait for the integration's log lines (`Caching metadata for <url>...`) to settle, then commit the new files under `src/assets/links-cache/`. The dev server can be stopped afterwards.

If desired later, a `npm run sync-links` script can be added that runs only the integration's scrape step without launching the full dev server. Not in scope for this iteration.

## File-level summary

New files:

- `src/lib/link-metadata-helpers.ts` — `generateLinkKey(url)` helper (hostname + SHA-256 prefix).
- `src/integrations/link-metadata-cache.ts` — Astro integration (runs in `astro:server:setup`, dev-only).
- `src/components/LinkPreview.astro` — Card component.
- `src/components/link-preview-cache.ts` — Module-level `import.meta.glob` caches consumed by `LinkPreview.astro`.
- `src/types/link-preview.ts` — Shared `CachedLinkMetadata` type used by integration and component.
- `src/assets/links-cache/metadata/.gitkeep`.
- `src/assets/links-cache/images/.gitkeep`.

Modified files:

- `src/content.config.ts` — extend `OtherLinks` schema.
- `astro.config.mts` — register `linkMetadataCache()` integration.
- `src/pages/[...locale]/[...subpage].astro` — swap inline rendering for `<LinkPreview>`.
- `package.json` — add devDependencies.

Untouched (verified):

- `src/content.config.ts`'s `References` field.
- The metadata-table rendering of `References` in `subpage.astro` (lines 604-621).

## Validation

Once implemented:

- `npm run build` succeeds with `astro check` clean.
- A few representative pages render correctly: `projects/en/canyon-by-artengineering-for-katharina-grosse` (4 links, mixed sources), `research/en/itke-research-assistant-for-coreless-filament-winding` (small number of links).
- Cards display title, description, favicon, hostname, and image where available.
- Removing one of `Text` / `Description` / `Image` from frontmatter on a test entry still yields a populated card (scrape fills gaps).
- Setting `HideMedia: true` removes the image column without breaking layout.
- Deleting the cache dir and running `npm run dev` re-populates it correctly; cards then re-render with images.
- A deliberately broken `Href` (returns 404 or non-HTML) produces a text-only fallback card with no console-blocking errors.
