# Adopt astlide as a slide-component library; replace custom Slides system

## Context

The site currently has a hand-written presentation system: `src/layouts/Slides.astro` (HUD, keyboard nav, hash-based slide nav, overview mode, fullscreen) plus seven custom slide components (`Slide`, `TitleSlide`, `TextSlide`, `SlideNotes`, `SlideVideo`, `SlideColumns`, `SlideImage`) and a flat content collection at `src/content/presentations/{locale}/{slug}.mdx`. One real deck exists in this format: `digital-futures-2026` in en/pt/de (33 slides each), delivered as a Digital Futures 2026 talk on 2026-04-18.

[astlide](https://github.com/r-hashi01/astlide) is a young Astro-based slide framework (v0.1.2 published 2026-04-28, MIT) that ships a slide schema, slide components (`Slide`, `Fragment`, `Notes`, `Columns`, `ImageSide`, `TextPanel`, `CodeBlock`, `Math`, `YouTube`, `Tweet`), a theme system, presenter mode, and PDF/PNG export. We want to migrate to astlide for three reasons:

1. **Consolidation.** astlide is a more architecturally grounded version of what the site's custom slide system already does. Owning a custom slide framework long-term has a maintenance cost that this migration removes.
2. **LLM-authorability.** Future slides authored with LLM assistance benefit from a standard, documented format the LLMs can reference. A bespoke component API does not have public training data.
3. **First open-source contribution.** Adopting a young project hands the user a viable path to contribute upstream.

## Goals

1. Migrate `digital-futures-2026` (33 slides × 3 locales) from the custom system to astlide-rendered slides.
2. Get presenter mode (synced notes window with timer), PDF/PNG export, and fragment reveals working day-one.
3. Land on a public canonical URL of `/{locale}/{slug}/{N}` for each slide, deep-linkable per slide.
4. Use a single URL family (no separate "author-facing" URLs).
5. Apply a custom site-typography theme (`locatelli`) carrying Montserrat headings, Poppins italic quotes, dark zinc-950 backgrounds, and copyright credit positioning.
6. Delete the custom `Slides.astro`, slide components, and the old `presentations` collection once the migration validates.
7. Set up an OSS contribution roadmap with a low-friction first PR.

## Non-goals

- No deck-listing index page. The site already has parent teaching/projects/research entries that link to their decks.
- No multi-deck per parent (one teaching entry → one deck). Defer to a future spec if the need appears.
- No screen-reader-friendly slide-content reading mode.
- No print stylesheet for browser-print. PDF export is the workflow.
- No iframe-embed support.
- No use of astlide's Astro integration. We use astlide as a component library only.
- No vendoring or forking of astlide for our own consumption. Plain npm dep.

## Decision log

| Decision | Choice | Why |
|---|---|---|
| Public URL pattern | `/{locale}/{slug}/{N}` | Per-slide deep-linkable. Aligns with site's locale-prefixed routing. Matches astlide's slide-as-route convention with locale prefix. |
| Site URL contains `/presentation/` segment | No | Shorter URL; closer to astlide's `/{deck}/{slide}` shape; makes upstream `basePath` PR simpler. Trade-off: numeric URL paths constrain future nested sub-resources of the same parent to non-numeric first segments. |
| Hash navigation vs per-slide route | Per-slide route | Deep-linkable; each slide is independently shareable and cacheable. |
| Integration depth | Library only (Path 2) | Astlide hardcodes `/[deck]/[slide]` route injection. The user wants ONE uniform URL pattern, which forces us to own the routing. We use astlide's components and schema; we own the route, layout shell, presenter mode, and export script. |
| Content layout | `src/content/decks/{locale}/{slug}/NNN-name.mdx` | Locale first, mirroring the URL. Three-digit padding handles up to 999 slides. We own the content collection so the layout is free. |
| `_config.json` | Not used | Astlide's hardcoded path lookup expects a different layout. Deck metadata (title, date, etc.) inherits from the parent teaching/projects/research entry. |
| Migration sequence | English first (Phase 1), then pt + de (Phase 2) | English at full scale validates the framework against real slide diversity. pt/de are then a mostly mechanical translation pass. |
| Theme strategy | Custom `locatelli` theme as a CSS module | Site has a strong existing typography that should carry into slides. Theme is shippable as an upstream contribution example later. |
| First OSS PR target | Locatelli theme as a showcase example | Self-contained, no architectural debate, builds rapport. Bigger PRs (locale support, library-only docs) come later. |

## Design

### Architecture overview

```
                          ┌─────────────────────────────────────┐
                          │ @astlide/core (npm dep)              │
                          │ Used as a component library only.    │
                          │ Integration NOT registered.          │
                          │                                      │
                          │ We import:                           │
                          │   - components (Slide, Fragment,     │
                          │     Notes, Columns, ImageSide, ...)  │
                          │   - slideSchema (Zod)                │
                          │ We do NOT use:                       │
                          │   - integration's route injection    │
                          │   - DeckLayout (replaced by ours)    │
                          │   - injected vite defines            │
                          └────────────────┬────────────────────┘
                                           │
                ┌──────────────────────────┴──────────────────────────┐
                │                                                      │
                ▼                                                      ▼
   ┌──────────────────────────────┐                  ┌─────────────────────────────────┐
   │ Custom routes (one family)   │                  │ Custom theme + deck shell       │
   │                              │                  │                                 │
   │ /[...locale]/[slug]/[n]      │                  │ src/components/decks/           │
   │   .astro                     │                  │   DeckLayout.astro              │
   │   - main projector view      │                  │     (slim shell: head, hud,     │
   │                              │                  │      keyboard nav, fullscreen)  │
   │ /[...locale]/[slug]/[n]/     │                  │                                 │
   │   notes.astro                │                  │ src/styles/themes/              │
   │   - presenter window         │                  │   locatelli.css                 │
   │   - opened via popup, syncs  │                  │     [data-theme="locatelli"]    │
   │     via BroadcastChannel     │                  │                                 │
   └─────────┬────────────────────┘                  └─────────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │ Content collection (`decks`) │
   │                              │
   │ src/content/decks/           │
   │   en/                        │
   │     digital-futures-2026/    │
   │       001-cover.mdx          │
   │       002-intro.mdx ...      │
   │   pt/digital-futures-2026/   │
   │   de/digital-futures-2026/   │
   │                              │
   │ schema: slideSchema (from    │
   │   @astlide/core/schema)      │
   └──────────────────────────────┘

   ┌──────────────────────────────┐
   │ Custom export script         │
   │ scripts/export-deck.ts       │
   │   - tiny Playwright runner   │
   │   - visits each slide URL    │
   │   - assembles PDF or PNGs    │
   └──────────────────────────────┘
```

#### Components

1. **`@astlide/core` as a component library.** Plain npm dep; `astlide()` is NOT added to the integrations array in `astro.config.mts`. We import `<Slide>`, `<Fragment>`, `<Notes>`, `<Columns>`, `<ImageSide>`, `<TextPanel>`, `<CodeBlock>`, `<Math>`, `<YouTube>`, `<Tweet>`, and `slideSchema`.
2. **One route family.** `src/pages/[...locale]/[slug]/[n].astro` is the canonical projector view; `src/pages/[...locale]/[slug]/[n]/notes.astro` is the presenter notes view (popup window).
3. **Single content collection (`decks`).** Defined in `src/content.config.ts` with `slideSchema`. Loader path: `src/content/decks/`.
4. **Custom DeckLayout.** Replaces astlide's integration-coupled `DeckLayout.astro`. Slim shell using site's existing `BaseHead`, the same HUD pattern from `Slides.astro` (keyboard nav, fullscreen, slide indicator), and the theme `[data-theme="locatelli"]` attribute on `<body>`.
5. **Custom locatelli theme.** Plain CSS module at `src/styles/themes/locatelli.css`, imported by DeckLayout. Defines typography, color tokens, layout-class refinements (cover, image-full, quote, etc.), and copyright credit positioning.
6. **Custom presenter mode.** `[...locale]/[slug]/[n]/notes.astro` renders the same slide content in a notes-mode shell. Opened via `window.open()` from the main view. Synced via `BroadcastChannel('deck-{slug}-{locale}')` for slide-change events.
7. **Custom export script.** `scripts/export-deck.ts` takes `--locale en --slug digital-futures-2026 --format pdf`, navigates each slide URL via Playwright, takes screenshots, assembles PDF (`pdf-lib`) or saves PNGs.

### Content layout, frontmatter, schema

#### On-disk layout

```
src/content/decks/
├── en/
│   └── digital-futures-2026/
│       ├── 001-cover.mdx
│       ├── 002-atelier-marko-brajovic.mdx
│       ├── 003-biomimicry-overlay.mdx
│       └── ... (33 total)
├── pt/digital-futures-2026/
└── de/digital-futures-2026/
```

- Numbered prefix `NNN-` (three digits) keeps ordering stable when listed alphabetically. Handles up to 999 slides.
- Filename suffix (`-cover`, `-biomimicry-overlay`) is human-readable; not used by routing.
- `.mdx` only, since slides use components.

#### Content collection (`src/content.config.ts`)

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { slideSchema } from "@astlide/core/schema";

const decks = defineCollection({
  loader: glob({
    pattern: "**/[0-9][0-9][0-9]-*.mdx",
    base: "src/content/decks",
  }),
  schema: slideSchema,
});

export const collections = {
  // ... existing collections unchanged ...
  decks,
};
```

The default Astro slide ID is the relative path without the `.mdx` extension: e.g. `en/digital-futures-2026/001-cover`. No `generateId` transformation needed.

Routes parse `(locale, slug, slideNumber)` from the ID:

```ts
const match = slide.id.match(/^([^/]+)\/([^/]+)\/(\d{3})-/);
```

#### Slide frontmatter (astlide's `slideSchema`)

```yaml
---
slideLayout: cover               # cover | section | two-column |
                                 # image-full | image-left | image-right |
                                 # code | quote | statement | default
transition: fade                 # none | fade | slide-left |
                                 # slide-right | slide-up | zoom
title: "Between the Prompt and the Building"   # optional
background: "#0a0a0a"            # optional CSS background value
class: "text-light"              # optional CSS class
notes: "Speaker notes string"    # optional; or use <Notes> for rich content
hidden: false                    # default false
---
```

#### Deck-level metadata

The `decks` collection is per-slide. Deck-level metadata (title, date, event, language) inherits from the parent teaching/projects/research entry, found by `(locale, slug)` lookup. The DeckLayout reads from the parent for `<title>`, OG tags, and the in-deck cover header. Author defaults to the site config's author. Theme is hardcoded to `"locatelli"`.

A small helper at `src/lib/decks-helpers.ts`:

```ts
import { getCollection } from "astro:content";

const PARENT_COLLECTIONS = ["teaching", "projects", "research", "publications"] as const;

export async function findParentEntry(slug: string, locale: string) {
  for (const name of PARENT_COLLECTIONS) {
    const entries = await getCollection(name);
    const match = entries.find((e) => {
      const [entryLocale, entrySlug] = e.id.split("/");
      const cleanSlug = entrySlug.replace(/\.(md|mdx)$/, "");
      return entryLocale === locale && cleanSlug === slug;
    });
    if (match) return match;
  }
  return null;
}
```

### Route implementation

#### Route 1: main slide view (`src/pages/[...locale]/[slug]/[n].astro`)

```astro
---
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import DeckLayout from "@/components/decks/DeckLayout.astro";
import Slide from "@astlide/core/components/Slide.astro";
import Fragment from "@astlide/core/components/Fragment.astro";
import Notes from "@astlide/core/components/Notes.astro";
import Columns from "@astlide/core/components/Columns.astro";
import Left from "@astlide/core/components/Left.astro";
import Right from "@astlide/core/components/Right.astro";
import ImageSide from "@astlide/core/components/ImageSide.astro";
import TextPanel from "@astlide/core/components/TextPanel.astro";
import { siteConfig, SUPPORTED_LOCALES } from "@/config/site";
import { findParentEntry } from "@/lib/decks-helpers";

export async function getStaticPaths() {
  const slides = await getCollection("decks");

  // Group: { "en/digital-futures-2026": [slide, slide, ...] }
  const decksByKey = new Map<string, CollectionEntry<"decks">[]>();
  for (const slide of slides) {
    if (slide.data.hidden) continue;
    const match = slide.id.match(/^([^/]+)\/([^/]+)\/(\d{3})-/);
    if (!match) continue;
    const key = `${match[1]}/${match[2]}`;
    const arr = decksByKey.get(key) ?? [];
    arr.push(slide);
    decksByKey.set(key, arr);
  }

  const paths = [];
  for (const [key, deckSlides] of decksByKey) {
    const [locale, slug] = key.split("/");
    if (!SUPPORTED_LOCALES.includes(locale)) continue;

    deckSlides.sort((a, b) => a.id.localeCompare(b.id));
    const total = deckSlides.length;
    const isDefault = locale === siteConfig.defaultLocale;

    for (let i = 0; i < total; i++) {
      paths.push({
        params: {
          locale: isDefault ? undefined : locale,
          slug,
          n: String(i + 1),
        },
        props: {
          slide: deckSlides[i],
          slideIndex: i,
          total,
          locale,
          slug,
        },
      });
    }
  }

  return paths;
}

const { slide, slideIndex, total, locale, slug } = Astro.props;
const { Content } = await render(slide);

const parent = await findParentEntry(slug, locale);
const deckTitle = parent?.data.Name ?? slug;

const prevN = slideIndex > 0 ? slideIndex : null;
const nextN = slideIndex + 1 < total ? slideIndex + 2 : null;
const exitHref = parent
  ? `${locale === siteConfig.defaultLocale ? "" : `/${locale}`}/${slug}`
  : null;
---

<DeckLayout
  deckTitle={deckTitle}
  locale={locale}
  slug={slug}
  slideNumber={slideIndex + 1}
  total={total}
  prevN={prevN}
  nextN={nextN}
  exitHref={exitHref}
  notesHref={`${exitHref ?? `/${slug}`}/${slideIndex + 1}/notes`}
>
  <Slide
    layout={slide.data.slideLayout}
    transition={slide.data.transition}
    background={slide.data.background}
    class={slide.data.class}
    slideNumber={slideIndex + 1}
    totalSlides={total}
  >
    <Content components={{ Fragment, Notes, Columns, Left, Right, ImageSide, TextPanel }} />
  </Slide>
</DeckLayout>
```

#### Route 2: presenter notes view (`src/pages/[...locale]/[slug]/[n]/notes.astro`)

Mirrors Route 1's `getStaticPaths`. Uses a different layout (`NotesLayout`) showing slide thumbnail + speaker notes + timer + next-slide preview. JS:

```ts
const channel = new BroadcastChannel(`deck-${slug}-${locale}`);
channel.onmessage = (e) => {
  if (e.data.type === "slide" && e.data.n !== currentN) {
    window.location.href = `/.../${slug}/${e.data.n}/notes`;
  }
};
```

The main route's keyboard handler posts every slide change:

```ts
channel.postMessage({ type: "slide", n: nextSlide });
```

#### Routing collision check

- `/[...locale]/[slug]/[n]` — two specific named segments after locale.
- Existing `/[...locale]/[...subpage]` — one rest segment after locale.

Astro prefers more-specific routes, so `/en/digital-futures-2026/1` resolves to the new route, while `/en/digital-futures-2026` (no trailing segment) still resolves to the existing subpage handler. Verify with build before relying on it.

### Locatelli theme + DeckLayout

#### File structure

```
src/styles/themes/
└── locatelli.css

src/components/decks/
├── DeckLayout.astro
├── NotesLayout.astro
├── DeckHUD.astro
├── Credit.astro
└── SlideVideo.astro
```

#### Theme (`src/styles/themes/locatelli.css`)

```css
[data-theme="locatelli"] {
  --slide-bg: oklch(15% 0 0);
  --slide-fg: oklch(95% 0 0);
  --slide-accent: oklch(70% 0.15 30);     /* placeholder; tune in Phase 1 */
  --slide-overlay: oklch(0% 0 0 / 0.5);
  --font-heading: "Montserrat", system-ui, sans-serif;
  --font-quote: "Poppins", Georgia, serif;
  --font-body: "Poppins", system-ui, sans-serif;

  background: var(--slide-bg);
  color: var(--slide-fg);
  font-family: var(--font-body);
}

[data-theme="locatelli"] .slide h1,
[data-theme="locatelli"] .slide h2,
[data-theme="locatelli"] .slide h3 {
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

[data-theme="locatelli"] .slide blockquote {
  font-family: var(--font-quote);
  font-style: italic;
  font-weight: 300;
}

[data-theme="locatelli"] .slide[data-layout="cover"] {
  display: grid;
  place-items: center;
  text-align: center;
}

[data-theme="locatelli"] .slide[data-layout="image-full"] {
  position: relative;
}
[data-theme="locatelli"] .slide[data-layout="image-full"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--slide-overlay);
  z-index: 1;
  pointer-events: none;
}
[data-theme="locatelli"] .slide[data-layout="image-full"] > * {
  position: relative;
  z-index: 2;
}

[data-theme="locatelli"] .slide[data-layout="quote"] p {
  font-family: var(--font-quote);
  font-style: italic;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  text-align: center;
  max-width: 60ch;
  margin: 0 auto;
}

[data-theme="locatelli"] [data-credit] {
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  font-family: var(--font-heading);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
  z-index: 3;
}
```

#### DeckLayout shape

```astro
---
import BaseHead from "@/components/BaseHead.astro";
import DeckHUD from "@/components/decks/DeckHUD.astro";
import "@/styles/themes/locatelli.css";

interface Props {
  deckTitle: string;
  locale: string;
  slug: string;
  slideNumber: number;
  total: number;
  prevN: number | null;
  nextN: number | null;
  exitHref: string | null;
  notesHref: string;
}

const {
  deckTitle, locale, slug, slideNumber, total,
  prevN, nextN, exitHref, notesHref,
} = Astro.props;
---

<html lang={locale}>
  <head>
    <BaseHead
      title={`${deckTitle} – Slide ${slideNumber}`}
      description=""
      slug={`${slug}/${slideNumber}`}
    />
    <meta name="robots" content="index, follow" />
  </head>
  <body
    data-theme="locatelli"
    data-deck-slug={slug}
    data-deck-locale={locale}
    data-slide-number={slideNumber}
    data-total={total}
    class="m-0 h-svh w-screen overflow-hidden"
  >
    <main id="deck" class="relative h-svh w-screen">
      <slot />
    </main>

    <DeckHUD
      slideNumber={slideNumber}
      total={total}
      prevN={prevN}
      nextN={nextN}
      exitHref={exitHref}
      notesHref={notesHref}
      slug={slug}
      locale={locale}
    />
  </body>
</html>

<script>
  // Keyboard navigation = real URL navigation
  // BroadcastChannel sync to presenter window
  // Implementation lifted from existing Slides.astro, adapted from hash to URL nav
</script>
```

#### DeckHUD

Lifted directly from `src/layouts/Slides.astro` HUD region (lines 49-115). Two changes:
1. Prev/next buttons generate URLs instead of dispatching keyboard events.
2. Adds an "Open presenter mode" button that calls `window.open(notesHref, "presenter", "popup,width=1280,height=720")`.

### Phase 1: English deck migration

#### Mapping reference

| Old pattern (count) | Example | New `slideLayout` | Notes |
|---|---|---|---|
| `<TitleSlide>` (1) | Slide 1 | `cover` | Title + subtitle + author + cover image as MDX body |
| `<Slide image=... copyright=...>` no text body (~5) | Slides 2, 6, 11, 33 | `image-full` | Body: just `<Image>` and `<Credit>` |
| `<Slide title=... subtitle=... image=... copyright=...>` (~10) | Slides 3, 7, 19, 21, 23, 25–28 | `image-full` | Body: `<Image>` + `# title` + `## subtitle` + `<Credit>` |
| `<Slide>` with custom Tailwind text overlay (~5) | Slides 4, 9, 10, 12, 14 | `image-full` | Body: `<Image>` + custom MDX with absolute-positioned text |
| `<Slide>` with `<SlideVideo>` (~3) | Slides 5, 20, 30 | `image-full` (or `default`) | Body uses `<video>` directly or `<SlideVideo>` site component |
| `<Slide>` with quote (~1) | Slide 13 | `quote` | Body: `<Image>` for background + blockquote |
| `<Slide>` with progressive overlay (~4 interleaved) | Slides 9, 10, 12, 14 | `image-full` | Kept as separate slides; interleave breaks fragment fit |
| `<Slide>` with inline `<img>` for animated GIF (~1) | Slide 8 | `default` or `image-full` | Body: `<img src={gif.src} ...>` (raw, since GIF can't go through `<Image>`) |

#### Custom site components

1. **`Credit.astro`** (new, at `src/components/decks/Credit.astro`) — renders as `<span data-credit>{text}</span>` so the theme handles positioning/typography. The existing `src/components/Credit.astro` is unrelated and stays.
2. **`SlideVideo.astro`** — lift existing `src/components/slides/SlideVideo.astro` into `src/components/decks/SlideVideo.astro`, no functional change.

#### Asset handling

- Static images: `<Image>` from `astro:assets`, imports unchanged.
- Videos: in `public/presentations/...mp4` as today; rendered via `<SlideVideo>`.
- Animated GIFs: rendered with raw `<img src={gif.src}>` (Astro's `<Image>` does not optimize GIFs).

#### Iteration order

1. Migrate slides 1-3 first (cover + simple image-full + image+title). Validate route, theme, `<Image>` integration.
2. Migrate one of each special kind (slide 5 video, slide 9 overlay, slide 13 quote, slide 8 GIF).
3. Migrate the remaining ~25 slides in order.
4. Smoke test: full deck navigation, fullscreen, presenter mode, PDF export, keyboard nav, exit link.
5. Layout polish via theme CSS (preferred) or per-slide overrides (one-off).

#### Phase 1 acceptance criteria

- All 33 English slides render at `/digital-futures-2026/N` (default locale, no prefix).
- Keyboard nav (arrows, space, home, end) navigates URLs.
- Presenter mode opens a synced notes window.
- PDF export script produces a valid 33-page PDF.
- All `<Image>` imports work; no broken assets.
- Visual fidelity: each slide visibly matches or improves upon the original.
- Old custom `Slides.astro` and slide components NOT yet deleted.

### Phase 2: pt + de translation porting

#### Per-slide port pattern

For each `decks/en/digital-futures-2026/NNN-*.mdx`:
1. Copy file to `decks/pt/digital-futures-2026/NNN-*.mdx`.
2. Translate **only**:
   - `title` (frontmatter)
   - Markdown body text (headings, paragraphs, blockquote content)
   - `alt=` strings on `<Image>` and `<img>` tags
   - `<Notes>` body
   - `text=` on `<Credit>` if it has translatable description
3. Keep **identical**:
   - `slideLayout`, `transition`, `class`, `background`
   - All component imports
   - Image `src=`
   - All Tailwind classes
   - Component nesting
4. Repeat for `decks/de/...`.

#### Source of translations

The existing `src/content/presentations/{pt,de}/digital-futures-2026.mdx` files contain translated text already. They are the *string source* for Phase 2. The structural file format is replaced.

#### Sequence within Phase 2

Port pt first, validate, then de. Sequential, not parallel.

#### Phase 2 acceptance criteria

- 99 slide files total across en/pt/de.
- All URLs `/{locale}/digital-futures-2026/N` work for the three supported locales.
- Visual fidelity is consistent across locales.
- Speaker notes localized.
- PDF exports work for all three locales.
- Old `presentations` collection still untouched.

### Phase 3: Redirects + cleanup

#### Order of operations (each step its own commit)

1. **Add legacy redirects** in `astro.config.mts`:

```ts
redirects: {
  // ... existing ...
  "/presentations/digital-futures-2026":     "/digital-futures-2026/1",
  "/pt/presentations/digital-futures-2026":  "/pt/digital-futures-2026/1",
  "/de/presentations/digital-futures-2026":  "/de/digital-futures-2026/1",
},
```

2. **Update parent-page presentation link** in `src/pages/[...locale]/[...subpage].astro:88`:

```ts
// before
? `${deckBasePath}/presentations/${fileSlug}`
// after
? `${basePath}/${fileSlug}/1`
```

3. **Delete old route file:** `src/pages/[...locale]/presentations/[...deck].astro`.
4. **Delete old layout:** `src/layouts/Slides.astro`.
5. **Delete old slide components:**
   - `src/components/slides/Slide.astro`
   - `src/components/slides/SlideColumns.astro`
   - `src/components/slides/SlideImage.astro`
   - `src/components/slides/SlideNotes.astro`
   - `src/components/slides/TextSlide.astro`
   - `src/components/slides/TitleSlide.astro`
   - (`SlideVideo.astro` is lifted to `src/components/decks/`, not deleted.)
6. **Delete old `presentations` content files:** the three `digital-futures-2026.mdx` files in en/pt/de.
7. **Remove `presentations` from `content.config.ts`.**
8. **Verify the build:** `npm run build`, sitemap regeneration, redirect test, spot-check 5 slides, hit each old URL in production preview.

#### Knowledge pipeline follow-up

Run `/sync-knowledge` after Phase 3 per the project CLAUDE.md instructions. The HeroChat assistant's vector embeddings need to reflect the deletion of the old `presentations` collection and the new `decks` collection. The `generate-knowledge.ts` script may need a small adaptation. Document this as a follow-up; not blocking Phase 3 but should be done before declaring "done."

#### Phase 3 acceptance criteria

- All old URLs (3 locales × 1 deck = 3 URLs) redirect with 301.
- No dangling references to `presentations` collection, `Slides.astro`, or deleted slide components anywhere in `src/`.
- Build passes with no warnings.
- Knowledge pipeline regenerated.

### OSS contribution roadmap

This is loose and revisable. Detail in conversation; sketch here.

1. **Test the waters** (week 0). Open a low-stakes GitHub discussion asking the maintainer how they feel about library-only adoption.
2. **PR 1 (weeks 2-3): Locatelli theme** as an example showcase. Self-contained CSS module + small README snippet.
3. **PR 2 (weeks 4-6): Library-only adoption documentation** — README addition explaining how to use astlide without the integration.
4. **PR 3 (months 2-3, optional): Locale support in the integration** — for users who do want astlide's framework auto-wiring with multilingual decks. Discussion-issue first; only if PR 1/2 reveal alignment.
5. **PR 4 (months 4+, optional): `@astlide/components` package separation** — if the maintainer warms to library-only adoption.

Track in `docs/oss/astlide-contributions.md` with status of each PR.

## Open questions deferred to implementation

| Question | When to decide | Default |
|---|---|---|
| Theme accent color (the `--slide-accent` placeholder) | Phase 1 visual polish | Site's existing accent or a neutral choice |
| Use Astro `<ViewTransitions />` | After Phase 1 functional slides | Skip |
| Extend `slideSchema` with site-specific fields | When Phase 1 reveals friction | No extension |
| Whether deck slides should be indexed by search engines | Before Phase 3 cleanup | Yes (canonical URLs, sitemap inclusion) |
| Whether `<Notes>` content surfaces in HTML for SEO/screen-readers | During implementation | No; presenter-mode-only |
| Knowledge pipeline (`generate-knowledge.ts`) handling of `decks` collection | After Phase 3 | Skip indexing slides into RAG |

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Astlide is v0.1.2 — major API churn could break component imports | Medium | Pin a specific version (no `^`); only upgrade after testing in a branch. |
| Astlide components may have hidden integration coupling (vite defines) | Medium-low | Verify each component works standalone in Phase 1's first 3 slides. If coupled, substitute, vendor that one component, or reproduce its behavior. |
| Routing collision between `[...locale]/[slug]/[n]` and `[...locale]/[...subpage]` | Low | Astro's specificity rules favor named segments. Verify in Phase 1 first commit; smoke-test 3 URL shapes. |
| Hidden slides (`hidden: true` frontmatter) need explicit skip in `getStaticPaths` | Low | Filter is one line: `if (slide.data.hidden && import.meta.env.PROD) skip`. |
| Custom presenter mode is new, untested code | Medium | Build alongside slides in Phase 1; test with real second monitor before relying on for a talk. Old `Slides.astro` remains as fallback until pt/de migrations land. |
| Playwright setup adds dev dependency | Low | Popular tool; ~50MB install; only needed for export. Document if export becomes routine. |
| Knowledge pipeline needs adaptation for new collection | Low | One-time script update; not blocking. |
| Astlide maintainer becomes unresponsive / project stagnates | Low-medium | We use only ~10 components. Worst case: vendor those into `src/integrations/astlide-components/` (~500 lines of Astro components). Total cost of escape: a half-day. |
| Image optimization breaks in `image-full` layout | Low | Use Astro's `<Image>` directly in MDX (we control the body). Astlide's components don't intercept image rendering. |
| LLM-authored future slides drift from our conventions | Low | Document in `CLAUDE.md`: filename `NNN-slug.mdx`, frontmatter shape, where to place under `decks/{locale}/{slug}/`, how to declare the parent page. |

## Things this design intentionally does NOT solve

- Multi-deck per parent (one teaching entry → two decks). Defer until a real second-deck use case appears.
- A11y for slides (screen-reader-friendly slide-content reading mode). Astlide doesn't ship this; could be a later contribution.
- Print stylesheet for browser-print. PDF export script is the workflow.
- Embedding decks in iframes.

## Validation gates before declaring "done"

- All 99 slides render at their canonical URLs.
- Build passes with no warnings.
- Lighthouse accessibility score on slide 1 of each locale is unchanged or improved.
- Sitemap includes new URLs for all three locales.
- Old URLs (3 locales) redirect with 301 to new URLs.
- Presenter mode opens, syncs, and renders speaker notes for at least 5 slides per locale.
- PDF export produces a valid 33-page document for at least the English deck.
- Knowledge pipeline regenerated; HeroChat continues to answer questions about the talk.
- Old `Slides.astro`, slide components, route, and `presentations` collection deleted.

## Files touched (summary)

### New

- `src/content/decks/{en,pt,de}/digital-futures-2026/NNN-*.mdx` (99 slide files)
- `src/pages/[...locale]/[slug]/[n].astro`
- `src/pages/[...locale]/[slug]/[n]/notes.astro`
- `src/components/decks/DeckLayout.astro`
- `src/components/decks/NotesLayout.astro`
- `src/components/decks/DeckHUD.astro`
- `src/components/decks/Credit.astro` (new, deck-specific; renders `<span data-credit>{text}</span>` so the locatelli theme owns positioning. The existing `src/components/Credit.astro` stays in place — it is used elsewhere on the site and is a separate concern.)
- `src/components/decks/SlideVideo.astro` (lifted from `src/components/slides/`)
- `src/styles/themes/locatelli.css`
- `src/lib/decks-helpers.ts`
- `scripts/export-deck.ts`

### Modified

- `src/content.config.ts` (add `decks`, remove `presentations`)
- `src/pages/[...locale]/[...subpage].astro` (line 88: link to new URL pattern)
- `astro.config.mts` (legacy redirects)
- `package.json` (add `@astlide/core`, `playwright`, `pdf-lib` deps; add `export-deck` script)
- `CLAUDE.md` (note slide authoring convention, library-only adoption pattern)

### Deleted

- `src/pages/[...locale]/presentations/[...deck].astro`
- `src/layouts/Slides.astro`
- `src/components/slides/Slide.astro`
- `src/components/slides/SlideColumns.astro`
- `src/components/slides/SlideImage.astro`
- `src/components/slides/SlideNotes.astro`
- `src/components/slides/TextSlide.astro`
- `src/components/slides/TitleSlide.astro`
- `src/content/presentations/en/digital-futures-2026.mdx`
- `src/content/presentations/pt/digital-futures-2026.mdx`
- `src/content/presentations/de/digital-futures-2026.mdx`
