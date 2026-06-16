# Spec: image entries in the sitemap

Status: proposed
Related: `src/lib/sitemap-lastmod.ts` (the `lastmod` work this mirrors), `astro.config.mts` (`@astrojs/sitemap` config), `src/lib/blog-helpers.ts` (`importCoverImage`), `src/components/BaseHead.astro` (og:image resolution).

## Goal

Add `<image:image>` entries to the sitemap so each content URL advertises its
cover image to crawlers. This helps Google Images / image-pack visibility, which
is relevant for an image-heavy portfolio. The `xmlns:image` namespace is already
declared in the generated sitemap but currently unused.

Target output per URL:

```xml
<url>
  <loc>https://daniellocatelli.com/projects/o3-pavilion.../</loc>
  <lastmod>2026-05-12T01:26:52.000Z</lastmod>
  <image:image>
    <image:loc>https://daniellocatelli.com/_astro/o3-cover.abc123.webp</image:loc>
  </image:image>
</url>
```

Note: `<image:caption>` and `<image:title>` are deprecated in the Google image
sitemap schema; `<image:loc>` is the only field worth emitting. Alt text lives in
the page HTML, not the sitemap.

## Scope

In scope:
- One image per URL: the page **cover** (`Cover` frontmatter), the same image
  already used for og:image and the hero. One strong image per page is the
  documented Google recommendation; we are not trying to list every inline body
  image.
- Content-entry pages across all three locales (projects, research, teaching,
  publications).

Out of scope (decide later if ever):
- Inline body images.
- Listing pages (`/projects/` etc.) and static pages (`/cv/` etc.) — they have no
  single canonical cover. They get `lastmod` but no image.
- Decks and skills — already excluded from the sitemap entirely.

## The hard part: resolving the final image URL

`lastmod` was easy because the source-file path is enough. Images are harder
because the value we must emit is the **post-build, content-hashed, optimized**
asset URL (e.g. `/_astro/o3-cover.abc123.webp`), not the source path
(`src/assets/content/projects/o3-pavilion/o3-cover.jpg`). That final URL only
exists after Astro's image pipeline runs.

There are two shapes of cover in this repo (see `importCoverImage` →
`importImage` in `src/lib/blog-helpers.ts`):
1. **Processed asset** — `Cover:` points into `src/assets/content/**`; resolved
   via `import.meta.glob` + Astro image optimization → hashed `/_astro/...` URL.
   This is the common case.
2. **Raw string path** — `Cover:` is an absolute `/assets/...` (public) URL,
   used as-is, no hashing.

The UFT pages use case 2 (`/assets/content/teaching/.../uft-cover.jpg`); most
projects use case 1.

### Candidate implementation strategies

**A. Precomputed map fed to `serialize` (mirrors `lastmod`).**
Build a `pathname -> imageURL` map and have `serializeLastmod`'s sibling attach
`img`. Problem: producing the hashed URL for case-1 covers requires Astro's
`getImage()`/asset graph, which is not available inside the plain `serialize`
function or in `astro.config` module scope. Would require running the image
pipeline ourselves. High effort, brittle.

**B. Post-process the built sitemap in an `astro:build:done` hook (recommended).**
By `astro:build:done`, every page's HTML is already written to `dist/client` and
each page already contains the final cover URL in its `og:image` meta tag
(`BaseHead.astro` sets `socialImageURL = new URL(coverImage, site)`, where
`coverImage` is the resolved hashed `.src`). Steps:
1. Read the sitemap files `@astrojs/sitemap` just wrote.
2. For each `<loc>`, map the URL to its `dist/client/<path>/index.html`.
3. Extract `<meta property="og:image" content="...">`.
4. Inject an `<image:image><image:loc>...</image:loc></image:image>` into that
   `<url>` block.

   Pros: reuses the already-correct resolved URL; no second image pipeline; works
   for both cover shapes uniformly; no coupling to content internals. Cons: a
   small amount of XML string manipulation and HTML scraping; depends on
   `og:image` staying the cover (it is, today).

**C. Custom sitemap, drop `@astrojs/sitemap`.** Full control, much more to own
(locales, filtering, lastmod, image). Rejected: disproportionate.

Recommendation: **Strategy B.** It keeps `@astrojs/sitemap` as the source of
truth for URLs/lastmod and layers images on top from data the build already
produced. The og:image is guaranteed to be the cover and already absolute.

## Implementation sketch (Strategy B)

New integration (or extend an existing `astro:build:done` hook):

```ts
// src/integrations/sitemap-images.ts (sketch)
export default function sitemapImages(): AstroIntegration {
  return {
    name: "sitemap-images",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        // dir = dist/client (the Astro output dir URL)
        // 1. for each sitemap-*.xml (NOT sitemap-index.xml):
        // 2.   for each <url><loc>HREF</loc>...:
        // 3.     htmlPath = locToHtmlPath(HREF)  // strip origin, append index.html
        // 4.     ogImage = extractOgImage(read(htmlPath))  // regex or cheap parse
        // 5.     if ogImage: splice <image:image><image:loc>ogImage</image:loc></image:image>
        //        before </url>
        // 6. write the file back
      },
    },
  };
}
```

Ordering: this integration must run AFTER `@astrojs/sitemap`. Astro runs
`astro:build:done` hooks in integration array order, so place `sitemapImages()`
**after** `sitemap(...)` in `astro.config.mts`.

Helpers needed:
- `locToHtmlPath(loc, distDir)`: `https://site/de/projects/x/` →
  `dist/client/de/projects/x/index.html`. Handle the root `/` → `index.html`.
- `extractOgImage(html)`: match `<meta property="og:image" content="([^"]+)">`.
  Return null if absent (then emit no image for that URL).

## Edge cases

- **No cover / no og:image** — emit no `<image:image>` for that URL. Valid.
- **External og:image** — if a cover is ever an off-site URL, Google requires the
  image host to be verified; acceptable to still emit, but note it. Today all
  covers are same-origin.
- **og:image is a social card, not the cover** — verify `BaseHead` uses the cover
  itself (it does today). If a dedicated OG card is introduced later, revisit
  (prefer the hero `<img>` src instead).
- **Trailing slash / locale root** — reuse the same normalization as
  `serializeLastmod` (ensure trailing slash; root is `/`).
- **Image dimensions/format** — Google no longer needs width/height in the
  sitemap; skip.

## Testing / acceptance

1. `npx astro build`, then assert `dist/client/sitemap-0.xml` contains
   `<image:image>` for a known project URL (e.g. O3 pavilion) and that the
   `<image:loc>` matches that page's `og:image`.
2. Assert URLs with no cover have no `<image:image>` and the XML still parses.
3. Assert listing/static pages have `lastmod` but no image.
4. Confirm count: `image:loc` count == number of content-entry URLs with a cover.
5. Validate the file (e.g. against the sitemap + image schema) to ensure no
   namespace/format breakage.

## Rollout

- Single commit: add `src/integrations/sitemap-images.ts`, wire it after
  `sitemap()` in `astro.config.mts`, plus a short build-output assertion.
- No redirects or content changes; purely additive to the sitemap.
- After deploy, optionally resubmit the sitemap in Google Search Console.

## Open questions for Daniel

1. One cover per page is the plan. Any page where you'd want multiple images
   listed (e.g. a gallery research entry)? Default: no.
2. OK to rely on `og:image == cover`? If you foresee a separate branded OG card,
   say so and we'll read the hero `<img>` instead.
