# Astlide adoption — Phase 1 (English deck migration) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the English `digital-futures-2026` deck (33 slides) from the custom `Slides.astro` system onto astlide-as-component-library with custom routing at `/{locale}/{slug}/{N}`, the locatelli theme, presenter mode, and a PDF export script. The old `presentations` collection and old slide layout/components remain intact in this phase as a fallback.

**Architecture:** Install `@astlide/core` as a regular npm dep but skip its Astro integration. Use astlide's components (`<Slide>`, `<Fragment>`, `<Notes>`, ...) directly in slide MDX files. Own the route, layout shell, presenter notes, BroadcastChannel sync, and PDF export script ourselves. Theme is a plain CSS module applied via `[data-theme="locatelli"]`.

**Tech Stack:** Astro 6, TypeScript strict, Tailwind CSS 4, MDX, `@astlide/core` (slide components + slide schema), Playwright (already in deps; reused for export), `pdf-lib` (new dep, for PDF assembly).

**Spec:** `docs/superpowers/specs/2026-05-01-astlide-adoption-design.md`

**Phases 2 (pt + de translation) and 3 (cleanup) are separate plans authored after Phase 1 lands.**

---

## File map

### New files

| Path | Responsibility |
|---|---|
| `src/content/decks/en/digital-futures-2026/001-cover.mdx` to `033-*.mdx` | 33 English slide MDX files with astlide frontmatter + body |
| `src/pages/[...locale]/[slug]/[n].astro` | Main projector view route |
| `src/pages/[...locale]/[slug]/[n]/notes.astro` | Presenter notes popup view route |
| `src/components/decks/DeckLayout.astro` | Slim shell wrapping each slide (head, HUD, theme, keyboard nav, BroadcastChannel) |
| `src/components/decks/NotesLayout.astro` | Presenter notes window shell (notes panel, timer, BroadcastChannel listener) |
| `src/components/decks/DeckHUD.astro` | Exit / fullscreen / help / progress / open-presenter UI (lifted from old `Slides.astro`) |
| `src/components/decks/Credit.astro` | Renders `<span data-credit>{text}</span>` for theme-styled corner credits |
| `src/components/decks/SlideVideo.astro` | Lifted from `src/components/slides/SlideVideo.astro`, no functional change |
| `src/styles/themes/locatelli.css` | The locatelli theme: typography, colors, layout-class refinements |
| `src/lib/decks-helpers.ts` | `findParentEntry(slug, locale)` cross-collection lookup |
| `scripts/export-deck.ts` | Playwright + pdf-lib runner that assembles a deck PDF |

### Modified files

| Path | Change |
|---|---|
| `src/content.config.ts` | Add `decks` collection using astlide's `slideSchema` |
| `package.json` | Add `@astlide/core` and `pdf-lib` deps; add `export-deck` script |
| `CLAUDE.md` | Document the slide authoring convention (deferred to last task) |

### NOT touched in Phase 1

- `src/layouts/Slides.astro` — old layout stays as fallback
- `src/components/slides/*.astro` (except `SlideVideo` which is *lifted*, not deleted) — old slide components stay
- `src/pages/[...locale]/presentations/[...deck].astro` — old route stays
- `src/content/presentations/{en,pt,de}/digital-futures-2026.mdx` — old content stays
- `src/content/presentations/` collection definition — stays in `content.config.ts`
- `src/pages/[...locale]/[...subpage].astro` — its existing "View presentation" link still points at the old URL; updated in Phase 3
- pt and de slide content — Phase 2

---

## Tasks

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `@astlide/core` pinned to a specific version**

```bash
npm install @astlide/core@0.1.2 --save-exact
```

Verify the dep is added to `dependencies` (not `devDependencies`). The `--save-exact` flag pins without `^` so future churn doesn't break us silently.

- [ ] **Step 2: Install `pdf-lib` as a dev dependency**

```bash
npm install --save-dev pdf-lib
```

- [ ] **Step 3: Add the export script to `package.json`**

In the `scripts` section, add:

```json
"export-deck": "tsx scripts/export-deck.ts"
```

The exact placement (alphabetical or grouped with related scripts) follows the file's existing convention.

- [ ] **Step 4: Verify install**

```bash
npm run build
```

Expected: build passes with no warnings about missing modules. (Astlide is not registered as integration yet, so it just sits in `node_modules`.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add @astlide/core@0.1.2 and pdf-lib for deck migration"
```

---

### Task 2: Define `decks` content collection

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add the `decks` collection above the `collections` export**

Insert after the existing `contentCollection` helper definition, before the `collections` export:

```ts
import { glob } from "astro/loaders";
import { slideSchema } from "@astlide/core/schema";

const decks = defineCollection({
  loader: glob({
    pattern: "**/[0-9][0-9][0-9]-*.mdx",
    base: "src/content/decks",
  }),
  schema: slideSchema,
});
```

- [ ] **Step 2: Add `decks` to the `collections` export**

```ts
export const collections = {
  // ... all existing entries unchanged ...
  presentations: contentCollection("./src/content/presentations"),
  decks,
};
```

- [ ] **Step 3: Create the empty `src/content/decks/` folder with a placeholder**

The collection's loader fails if the base folder doesn't exist. Create it with a `.gitkeep` so we can commit a non-empty folder.

```bash
mkdir -p src/content/decks/en/digital-futures-2026
touch src/content/decks/.gitkeep
```

- [ ] **Step 4: Verify the build still passes**

```bash
npm run build
```

Expected: build passes. The `decks` collection is empty (no MDX files match the pattern yet), which is allowed.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/decks/.gitkeep
git commit -m "feat(decks): define decks content collection with astlide slide schema"
```

---

### Task 3: Write `findParentEntry` helper

**Files:**
- Create: `src/lib/decks-helpers.ts`

- [ ] **Step 1: Create the helper file**

```ts
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

const PARENT_COLLECTIONS = [
  "teaching",
  "projects",
  "research",
  "publications",
] as const;

type ParentCollection = (typeof PARENT_COLLECTIONS)[number];
type ParentEntry = CollectionEntry<ParentCollection>;

/**
 * Look up a deck's parent page (teaching/project/research/publication entry)
 * by matching the slug and locale derived from the deck's folder structure.
 * Returns null if no parent is found; the caller should fall back to a default.
 */
export async function findParentEntry(
  slug: string,
  locale: string,
): Promise<ParentEntry | null> {
  for (const name of PARENT_COLLECTIONS) {
    const entries = (await getCollection(name)) as ParentEntry[];
    const match = entries.find((e) => {
      const parts = e.id.split("/");
      if (parts.length < 2) return false;
      const entryLocale = parts[0];
      const entrySlug = parts[1].replace(/\.(md|mdx)$/, "");
      return entryLocale === locale && entrySlug === slug;
    });
    if (match) return match;
  }
  return null;
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

Expected: build passes; the helper is unused but importable.

- [ ] **Step 3: Commit**

```bash
git add src/lib/decks-helpers.ts
git commit -m "feat(decks): add findParentEntry helper for locale+slug lookup"
```

---

### Task 4: Create the locatelli theme CSS

**Files:**
- Create: `src/styles/themes/locatelli.css`

- [ ] **Step 1: Write the theme**

```css
[data-theme="locatelli"] {
  /* Tokens */
  --slide-bg: oklch(15% 0 0);
  --slide-fg: oklch(95% 0 0);
  --slide-accent: oklch(70% 0.15 30);
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
  overflow: hidden;
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

- [ ] **Step 2: Commit**

```bash
git add src/styles/themes/locatelli.css
git commit -m "feat(decks): add locatelli theme CSS module"
```

---

### Task 5: Create deck-specific Credit component

**Files:**
- Create: `src/components/decks/Credit.astro`

- [ ] **Step 1: Write the Credit component**

```astro
---
interface Props {
  text: string | string[];
}

const { text } = Astro.props;
const lines = Array.isArray(text) ? text : [text];
---

<span data-credit>
  {lines.map((line, i) => (
    <>
      {i > 0 && <br />}
      {line}
    </>
  ))}
</span>
```

The component supports both single-string credits and arrays (matching the existing `<Slide copyright={["..."]}>` usage in the old deck for slide 11).

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/decks/Credit.astro
git commit -m "feat(decks): add Credit component (themed corner attribution)"
```

---

### Task 6: Lift SlideVideo into decks folder

**Files:**
- Read: `src/components/slides/SlideVideo.astro`
- Create: `src/components/decks/SlideVideo.astro`

- [ ] **Step 1: Read the existing SlideVideo**

```bash
cat src/components/slides/SlideVideo.astro
```

- [ ] **Step 2: Create the deck-side copy with no functional change**

Copy `src/components/slides/SlideVideo.astro` to `src/components/decks/SlideVideo.astro`. If the existing file has internal references (imports, helpers) that don't apply in the new location, fix the path; otherwise leave it identical.

- [ ] **Step 3: Verify type-check passes**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/decks/SlideVideo.astro
git commit -m "feat(decks): lift SlideVideo into components/decks for deck use"
```

---

### Task 7: Write DeckHUD component

**Files:**
- Read: `src/layouts/Slides.astro` (lines 49-115 for the HUD region)
- Create: `src/components/decks/DeckHUD.astro`

- [ ] **Step 1: Write the HUD component**

```astro
---
interface Props {
  slideNumber: number;
  total: number;
  prevN: number | null;
  nextN: number | null;
  exitHref: string | null;
  notesHref: string;
  slug: string;
  locale: string;
}

const {
  slideNumber, total, prevN, nextN, exitHref, notesHref, slug, locale,
} = Astro.props;

const localePrefix = locale === "en" ? "" : `/${locale}`;
const prevHref = prevN ? `${localePrefix}/${slug}/${prevN}` : null;
const nextHref = nextN ? `${localePrefix}/${slug}/${nextN}` : null;
---

<div
  id="deck-hud"
  class="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-3 transition-opacity duration-300"
>
  <div class="pointer-events-auto flex items-center gap-2">
    {exitHref && (
      <a
        href={exitHref}
        aria-label="Exit presentation"
        class="rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-zinc-800 hover:text-zinc-100"
      >
        ← Exit
      </a>
    )}
  </div>
  <div class="pointer-events-auto flex items-center gap-2">
    <button
      id="deck-presenter"
      data-notes-href={notesHref}
      aria-label="Open presenter notes window"
      class="rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-zinc-800 hover:text-zinc-100"
      type="button"
    >
      Presenter
    </button>
    <button
      id="deck-help"
      aria-label="Show keyboard shortcuts"
      class="rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-zinc-800 hover:text-zinc-100"
      type="button"
    >
      ?
    </button>
    <button
      id="deck-fullscreen"
      aria-label="Toggle fullscreen"
      class="rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur transition hover:bg-zinc-800 hover:text-zinc-100"
      type="button"
    >
      ⛶
    </button>
  </div>
</div>

<div
  id="deck-progress"
  data-prev-href={prevHref}
  data-next-href={nextHref}
  class="pointer-events-none fixed right-6 bottom-6 z-30 text-xs font-normal tracking-widest text-white tabular-nums uppercase sm:text-sm"
  style="font-family: 'Montserrat', sans-serif;"
>
  <span>{slideNumber}</span><span class="mx-1">/</span><span>{total}</span>
</div>

<dialog
  id="deck-help-dialog"
  class="max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 backdrop:bg-black/70"
>
  <h3 class="font-title mb-4 text-xl">Keyboard shortcuts</h3>
  <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
    <dt class="font-mono text-zinc-400">→ / Space / PgDn</dt><dd>Next slide</dd>
    <dt class="font-mono text-zinc-400">← / PgUp</dt><dd>Previous slide</dd>
    <dt class="font-mono text-zinc-400">Home / End</dt><dd>First / last slide</dd>
    <dt class="font-mono text-zinc-400">F</dt><dd>Toggle fullscreen</dd>
    <dt class="font-mono text-zinc-400">P</dt><dd>Open presenter mode</dd>
    <dt class="font-mono text-zinc-400">?</dt><dd>This help</dd>
    <dt class="font-mono text-zinc-400">Esc</dt><dd>Exit fullscreen / close help</dd>
  </dl>
  <form method="dialog" class="mt-6 text-right">
    <button class="rounded bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-700" type="submit">
      Close
    </button>
  </form>
</dialog>
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/decks/DeckHUD.astro
git commit -m "feat(decks): add DeckHUD (exit/presenter/help/fullscreen/progress)"
```

---

### Task 8: Write DeckLayout

**Files:**
- Create: `src/components/decks/DeckLayout.astro`

- [ ] **Step 1: Write the layout shell**

```astro
---
import BaseHead from "@/components/BaseHead.astro";
import DeckHUD from "@/components/decks/DeckHUD.astro";
import "@/styles/themes/locatelli.css";

interface Props {
  deckTitle: string;
  description?: string;
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
  deckTitle,
  description = "",
  locale,
  slug,
  slideNumber,
  total,
  prevN,
  nextN,
  exitHref,
  notesHref,
} = Astro.props;
---

<html lang={locale}>
  <head>
    <BaseHead
      title={`${deckTitle} – Slide ${slideNumber}`}
      description={description}
      slug={`${slug}/${slideNumber}`}
      viewTransition={false}
    />
  </head>
  <body
    data-theme="locatelli"
    data-deck-slug={slug}
    data-deck-locale={locale}
    data-slide-number={slideNumber}
    data-total={total}
    class="m-0 h-svh w-screen overflow-hidden bg-zinc-950 p-0 text-zinc-100"
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

<style is:global>
  html,
  body {
    height: 100%;
    overflow: hidden;
  }

  /* Neutralise the site-wide body constraints for deck pages */
  body:has(#deck) {
    max-width: none !important;
    width: 100vw !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  body.deck-hud-hidden #deck-hud,
  body.deck-hud-hidden #deck-progress {
    opacity: 0;
  }

  .slide {
    display: block;
    user-select: none;
    -webkit-user-select: none;
    outline: none;
    height: 100svh;
    width: 100vw;
  }

  .slide img {
    max-width: 100%;
    height: auto;
  }

  .slide figure {
    margin: 0;
  }
</style>

<script>
  function initDeck() {
    const body = document.body;
    const slug = body.dataset.deckSlug ?? "";
    const locale = body.dataset.deckLocale ?? "en";
    const slideNumber = parseInt(body.dataset.slideNumber ?? "1", 10);
    const total = parseInt(body.dataset.total ?? "1", 10);
    const progress = document.getElementById("deck-progress");
    const prevHref = progress?.dataset.prevHref ?? null;
    const nextHref = progress?.dataset.nextHref ?? null;
    const presenterBtn = document.getElementById("deck-presenter");
    const notesHref = presenterBtn?.dataset.notesHref ?? null;

    let hudTimer: ReturnType<typeof setTimeout> | null = null;

    const showHud = () => {
      body.classList.remove("deck-hud-hidden");
      if (hudTimer) clearTimeout(hudTimer);
      hudTimer = setTimeout(() => body.classList.add("deck-hud-hidden"), 3000);
    };

    const navigate = (href: string | null) => {
      if (href) window.location.href = href;
    };

    const next = () => navigate(nextHref);
    const prev = () => navigate(prevHref);

    document.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          if (slideNumber !== 1) {
            window.location.href = `${locale === "en" ? "" : "/" + locale}/${slug}/1`;
          }
          break;
        case "End":
          e.preventDefault();
          if (slideNumber !== total) {
            window.location.href = `${locale === "en" ? "" : "/" + locale}/${slug}/${total}`;
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
        case "P":
          e.preventDefault();
          openPresenter();
          break;
        case "?":
          e.preventDefault();
          (
            document.getElementById("deck-help-dialog") as HTMLDialogElement | null
          )?.showModal();
          break;
      }
    });

    document.addEventListener("mousemove", showHud);

    document.getElementById("deck-fullscreen")?.addEventListener("click", toggleFullscreen);
    document.getElementById("deck-help")?.addEventListener("click", () => {
      (
        document.getElementById("deck-help-dialog") as HTMLDialogElement | null
      )?.showModal();
    });
    presenterBtn?.addEventListener("click", openPresenter);

    // Click left 25% = prev, rest = next; ignore HUD/dialogs/links
    document.getElementById("deck")?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("#deck-hud") ||
        target.closest("#deck-help-dialog") ||
        target.closest("a, button")
      ) {
        return;
      }
      if (e.clientX < window.innerWidth * 0.25) prev();
      else next();
    });

    // BroadcastChannel sync to presenter window
    const channel = new BroadcastChannel(`deck-${slug}-${locale}`);
    channel.postMessage({ type: "slide", n: slideNumber });
    channel.onmessage = (e) => {
      if (e.data?.type === "slide" && typeof e.data.n === "number" && e.data.n !== slideNumber) {
        const target = `${locale === "en" ? "" : "/" + locale}/${slug}/${e.data.n}`;
        window.location.href = target;
      }
    };

    showHud();

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function openPresenter() {
      if (!notesHref) return;
      window.open(notesHref, "deck-presenter", "popup,width=1280,height=720");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDeck);
  } else {
    initDeck();
  }
</script>
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

Expected: build passes; layout file is type-correct but unused yet.

- [ ] **Step 3: Commit**

```bash
git add src/components/decks/DeckLayout.astro
git commit -m "feat(decks): add DeckLayout shell with theme + URL nav + BroadcastChannel"
```

---

### Task 9: Write the main slide route

**Files:**
- Create: `src/pages/[...locale]/[slug]/[n].astro`

- [ ] **Step 1: Write the route**

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
import { findParentEntry } from "src/lib/decks-helpers";

export async function getStaticPaths() {
  const slides = await getCollection("decks");

  // Group by deck-key = "{locale}/{slug}"
  const decksByKey = new Map<string, CollectionEntry<"decks">[]>();
  for (const slide of slides) {
    if (slide.data.hidden && import.meta.env.PROD) continue;
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

interface Props {
  slide: CollectionEntry<"decks">;
  slideIndex: number;
  total: number;
  locale: string;
  slug: string;
}

const { slide, slideIndex, total, locale, slug } = Astro.props as Props;
const { Content } = await render(slide);

const parent = await findParentEntry(slug, locale);
const deckTitle = parent?.data.Name ?? slug;
const description = parent?.data.Description ?? "";

const slideNumber = slideIndex + 1;
const prevN = slideIndex > 0 ? slideIndex : null;
const nextN = slideIndex + 1 < total ? slideIndex + 2 : null;

const localePrefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
const exitHref = parent ? `${localePrefix}/${slug}` : null;
const notesHref = `${localePrefix}/${slug}/${slideNumber}/notes`;
---

<DeckLayout
  deckTitle={deckTitle}
  description={description}
  locale={locale}
  slug={slug}
  slideNumber={slideNumber}
  total={total}
  prevN={prevN}
  nextN={nextN}
  exitHref={exitHref}
  notesHref={notesHref}
>
  <Slide
    layout={slide.data.slideLayout}
    transition={slide.data.transition}
    background={slide.data.background}
    class={slide.data.class}
    slideNumber={slideNumber}
    totalSlides={total}
  >
    <Content components={{ Fragment, Notes, Columns, Left, Right, ImageSide, TextPanel }} />
  </Slide>
</DeckLayout>
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

Expected: build passes. The route renders no static paths yet (no slide files exist), but the file itself is valid.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[...locale]/[slug]/[n].astro"
git commit -m "feat(decks): add /{locale}/{slug}/{n} main slide route"
```

---

### Task 10: Write NotesLayout for presenter window

**Files:**
- Create: `src/components/decks/NotesLayout.astro`

- [ ] **Step 1: Write the notes shell**

```astro
---
import BaseHead from "@/components/BaseHead.astro";
import "@/styles/themes/locatelli.css";

interface Props {
  deckTitle: string;
  locale: string;
  slug: string;
  slideNumber: number;
  total: number;
  notes: string | null;
  hasRichNotes: boolean;
  nextSlideTitle: string | null;
}

const {
  deckTitle, locale, slug, slideNumber, total,
  notes, hasRichNotes, nextSlideTitle,
} = Astro.props;
---

<html lang={locale}>
  <head>
    <BaseHead
      title={`${deckTitle} – Notes ${slideNumber}/${total}`}
      description=""
      slug={`${slug}/${slideNumber}/notes`}
      viewTransition={false}
    />
    <meta name="robots" content="noindex, nofollow" />
  </head>
  <body
    data-theme="locatelli"
    data-deck-slug={slug}
    data-deck-locale={locale}
    data-slide-number={slideNumber}
    data-total={total}
    class="grid h-svh grid-rows-[auto_1fr_auto] gap-4 bg-zinc-900 p-6 text-zinc-100"
  >
    <header class="flex items-baseline justify-between border-b border-zinc-800 pb-3">
      <h1 class="text-lg font-bold tracking-wide uppercase" style="font-family: 'Montserrat', sans-serif;">
        {deckTitle} – Presenter
      </h1>
      <div id="presenter-timer" class="font-mono text-xl tabular-nums">00:00</div>
    </header>

    <main class="grid grid-cols-[1fr_2fr] gap-6 overflow-hidden">
      <aside class="overflow-hidden rounded border border-zinc-800 bg-zinc-950 p-4">
        <h2 class="mb-2 text-sm tracking-wider uppercase opacity-60">Slide {slideNumber} / {total}</h2>
        {nextSlideTitle && (
          <p class="text-sm opacity-80">Next: {nextSlideTitle}</p>
        )}
      </aside>

      <article class="overflow-y-auto rounded border border-zinc-800 bg-zinc-950 p-6">
        <h2 class="mb-4 text-sm tracking-wider uppercase opacity-60">Speaker notes</h2>
        {hasRichNotes ? (
          <div class="prose prose-invert max-w-none"><slot /></div>
        ) : notes ? (
          <p class="text-base leading-relaxed">{notes}</p>
        ) : (
          <p class="text-sm opacity-50 italic">No notes for this slide.</p>
        )}
      </article>
    </main>

    <footer class="text-xs tracking-widest uppercase opacity-50">
      Synced via BroadcastChannel · Press F11 for fullscreen
    </footer>

    <script>
      const body = document.body;
      const slug = body.dataset.deckSlug ?? "";
      const locale = body.dataset.deckLocale ?? "en";
      const slideNumber = parseInt(body.dataset.slideNumber ?? "1", 10);

      // Listen for slide changes from the projector window
      const channel = new BroadcastChannel(`deck-${slug}-${locale}`);
      channel.onmessage = (e) => {
        if (e.data?.type === "slide" && typeof e.data.n === "number" && e.data.n !== slideNumber) {
          const target = `${locale === "en" ? "" : "/" + locale}/${slug}/${e.data.n}/notes`;
          window.location.href = target;
        }
      };

      // Timer: counts up from page load
      const timerEl = document.getElementById("presenter-timer");
      const start = Date.now();
      setInterval(() => {
        if (!timerEl) return;
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const ss = String(elapsed % 60).padStart(2, "0");
        timerEl.textContent = `${mm}:${ss}`;
      }, 1000);
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/decks/NotesLayout.astro
git commit -m "feat(decks): add NotesLayout (presenter window with notes + timer)"
```

---

### Task 11: Write the presenter notes route

**Files:**
- Create: `src/pages/[...locale]/[slug]/[n]/notes.astro`

- [ ] **Step 1: Write the notes route**

```astro
---
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import NotesLayout from "@/components/decks/NotesLayout.astro";
import Notes from "@astlide/core/components/Notes.astro";
import Fragment from "@astlide/core/components/Fragment.astro";
import { siteConfig, SUPPORTED_LOCALES } from "@/config/site";
import { findParentEntry } from "src/lib/decks-helpers";

export async function getStaticPaths() {
  const slides = await getCollection("decks");

  const decksByKey = new Map<string, CollectionEntry<"decks">[]>();
  for (const slide of slides) {
    if (slide.data.hidden && import.meta.env.PROD) continue;
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
          nextSlide: deckSlides[i + 1] ?? null,
        },
      });
    }
  }

  return paths;
}

interface Props {
  slide: CollectionEntry<"decks">;
  slideIndex: number;
  total: number;
  locale: string;
  slug: string;
  nextSlide: CollectionEntry<"decks"> | null;
}

const { slide, slideIndex, total, locale, slug, nextSlide } = Astro.props as Props;
const { Content } = await render(slide);

const parent = await findParentEntry(slug, locale);
const deckTitle = parent?.data.Name ?? slug;

const slideNumber = slideIndex + 1;
const notesString = slide.data.notes ?? null;
const hasRichNotes = !!notesString || true; // body may contain <Notes>; layout handles fallback
const nextSlideTitle = nextSlide?.data.title ?? null;
---

<NotesLayout
  deckTitle={deckTitle}
  locale={locale}
  slug={slug}
  slideNumber={slideNumber}
  total={total}
  notes={notesString}
  hasRichNotes={hasRichNotes}
  nextSlideTitle={nextSlideTitle}
>
  <Content components={{ Notes, Fragment }} />
</NotesLayout>
```

- [ ] **Step 2: Verify type-check passes**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[...locale]/[slug]/[n]/notes.astro"
git commit -m "feat(decks): add /{locale}/{slug}/{n}/notes presenter route"
```

---

### Task 12: Migrate slide 1 (cover) — first end-to-end validation

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/001-cover.mdx`

- [ ] **Step 1: Create the cover slide file**

```mdx
---
slideLayout: cover
title: "Between the Prompt and the Building"
notes: "Hello everyone. Today I want to share notes on what lies between AI-generated images and built work."
---

import { Image } from "astro:assets";
import cover from "@/assets/content/teaching/digital-futures-2026/digital-futures-2026-cover.jpg";

<Image src={cover} alt="Composite of five portfolio projects by Daniel Locatelli" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
  <h1 class="text-3xl text-white sm:text-5xl lg:text-6xl">Between the Prompt and the Building</h1>
  <p class="text-lg text-white/80 sm:text-xl lg:text-2xl">Notes from a Brazilian architect trained and working in Germany</p>
  <p class="mt-8 text-sm tracking-widest uppercase text-white/60 sm:text-base">Daniel Locatelli · Munich University of Applied Sciences</p>
</div>
```

- [ ] **Step 2: Run dev server in background and visit the URL**

```bash
npm run dev
```

Open `http://localhost:4321/digital-futures-2026/1` (default English locale, no prefix).

- [ ] **Step 3: Verify renders correctly**

Expected:
- Cover image fills the slide as background.
- Title, subtitle, and author/institution text render centered with locatelli theme typography.
- HUD shows "← Exit" linking to `/digital-futures-2026` (which still routes to the existing teaching page).
- Slide indicator shows `1 / 1`.
- Pressing `?` opens the help dialog.
- Pressing `f` toggles fullscreen.
- No console errors.

- [ ] **Step 4: Verify build also passes**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/001-cover.mdx
git commit -m "feat(decks): migrate slide 1 (cover) to new system"
```

---

### Task 13: Migrate slides 2 and 3 — validate image-full + image+title patterns

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/002-architecture-lenses.mdx`
- Create: `src/content/decks/en/digital-futures-2026/003-atelier-marko-brajovic.mdx`

- [ ] **Step 1: Create slide 2 (image-only with credit)**

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import architectureLenses from "@/assets/content/presentations/digital-futures-2026/architecture-lenses.png";
import Credit from "@/components/decks/Credit.astro";

<Image src={architectureLenses} alt="Architecture lenses" class="absolute inset-0 h-full w-full object-cover" />

<Credit text="Gemini" />
```

- [ ] **Step 2: Create slide 3 (image + title + subtitle + speaker notes)**

```mdx
---
slideLayout: image-full
title: "Atelier Marko Brajovic"
---

import { Image } from "astro:assets";
import atelier from "@/assets/content/teaching/tensegrity-workshop/tensegrity-workshop_atelier-marko-brajovic-01.jpeg";
import Notes from "@astlide/core/components/Notes.astro";

<Image src={atelier} alt="Atelier Marko Brajovic in 2019" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full flex-col justify-end p-12">
  <h1 class="text-white">Atelier Marko Brajovic</h1>
  <h2 class="text-white/80">São Paulo, 2015 - 2019</h2>
</div>

<Notes>
I have always been interested in the connection between nature and architecture. That is what led me to Atelier Marko Brajovic in São Paulo, in 2016.
</Notes>
```

- [ ] **Step 3: Verify both slides render**

In dev server, visit:
- `http://localhost:4321/digital-futures-2026/2` — verify image-full with credit at corner.
- `http://localhost:4321/digital-futures-2026/3` — verify image with title overlay (theme should style headings as uppercase Montserrat).

Verify keyboard navigation: from slide 1, press → twice; should land on slide 3. Slide indicator shows `3 / 3`.

- [ ] **Step 4: Open the presenter window from slide 3**

Click "Presenter" button in HUD or press `P`. A new window opens at `/digital-futures-2026/3/notes`. Confirm the speaker notes text appears. Pressing → in the projector window should navigate the notes window forward (BroadcastChannel sync).

- [ ] **Step 5: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/002-architecture-lenses.mdx src/content/decks/en/digital-futures-2026/003-atelier-marko-brajovic.mdx
git commit -m "feat(decks): migrate slides 2-3, validate image-full + presenter sync"
```

---

### Task 14: Migrate slides 4–8 — overlay text, video, image+title, GIF

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/004-biomimicry-overlay.mdx`
- Create: `src/content/decks/en/digital-futures-2026/005-models-bynature.mdx`
- Create: `src/content/decks/en/digital-futures-2026/006-giraffes.mdx`
- Create: `src/content/decks/en/digital-futures-2026/007-o3-pavilion.mdx`
- Create: `src/content/decks/en/digital-futures-2026/008-o3-form-finding.mdx`

- [ ] **Step 1: Slide 4 — image with full-bleed text overlay**

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import atelier from "@/assets/content/teaching/tensegrity-workshop/tensegrity-workshop_atelier-marko-brajovic-01.jpeg";

<Image src={atelier} alt="Atelier Marko Brajovic in 2019" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full items-center justify-center">
  <h2 class="text-4xl text-white sm:text-6xl lg:text-7xl">Biomimicry</h2>
</div>
```

- [ ] **Step 2: Slide 5 — video**

```mdx
---
slideLayout: image-full
title: "Models ByNature Workshop"
---

import SlideVideo from "@/components/decks/SlideVideo.astro";

<div class="absolute inset-0 z-10 flex h-full flex-col">
  <SlideVideo src="/presentations/models-bynature-workshop-1.5x.mp4" />
  <div class="absolute bottom-12 left-12 z-20">
    <h1 class="text-white">Models ByNature Workshop</h1>
    <h2 class="text-white/80">São Paulo, 2019</h2>
  </div>
</div>
```

- [ ] **Step 3: Slide 6 — image with credit**

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import giraffes from "@/assets/content/presentations/digital-futures-2026/giraffes_upscayl-standard-4x.png";
import Credit from "@/components/decks/Credit.astro";

<Image src={giraffes} alt="Giraffes" class="absolute inset-0 h-full w-full object-cover" />

<Credit text="Luca Galuzzi" />
```

- [ ] **Step 4: Slide 7 — image + title + subtitle + credit + notes**

```mdx
---
slideLayout: image-full
title: "O3 Pavilion"
---

import { Image } from "astro:assets";
import o3 from "@/assets/content/projects/o3-pavilion-by-atelier-marko-brajovic-for-docol/o3-pavilion-by-atelier-marko-brajovic-for-docol-cover.jpg";
import Credit from "@/components/decks/Credit.astro";
import Notes from "@astlide/core/components/Notes.astro";

<Image src={o3} alt="Front view photo of the O3 Pavilion." class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full flex-col justify-end p-12">
  <h1 class="text-white">O3 Pavilion</h1>
  <h2 class="text-white/80">Atelier Marko Brajovic for Docol, Expo Revestir 2017</h2>
</div>

<Credit text="Gui Morelli" />

<Notes>
At the studio, I worked on projects like the O3 Pavilion and learned Grasshopper, a computational design environment that let me program geometry.
</Notes>
```

- [ ] **Step 5: Slide 8 — GIF inline (raw `<img>`, not Astro `<Image>`)**

```mdx
---
slideLayout: default
title: "O3 Pavilion"
---

import o3FormFinding from "@/assets/content/projects/o3-pavilion-by-atelier-marko-brajovic-for-docol/animacao-da-descoberta-de-forma-kangaroo-forcando-celulas-a-serem-planas-busca.gif";

<div class="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-zinc-950">
  <img src={o3FormFinding.src} alt="Form-finding animation of the O3 Pavilion with Kangaroo" width="528" height="264" style="image-rendering: auto;" />
  <div class="text-center">
    <h1 class="text-white">O3 Pavilion</h1>
    <h2 class="text-white/80">Form finding with Kangaroo Physics</h2>
  </div>
</div>
```

- [ ] **Step 6: Verify all five slides render**

Visit each URL (slides 4 through 8) in dev server. Verify:
- Slide 4: "Biomimicry" centered over Atelier image with dim overlay (theme adds the overlay automatically).
- Slide 5: Video plays inline with title in corner.
- Slide 6: Giraffes with "Luca Galuzzi" credit in bottom-right.
- Slide 7: O3 Pavilion image with title/subtitle in lower-left + "Gui Morelli" credit.
- Slide 8: GIF animates centered with title underneath, dark zinc background.

- [ ] **Step 7: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/00{4,5,6,7,8}-*.mdx
git commit -m "feat(decks): migrate slides 4-8 (overlay, video, image+title, GIF)"
```

---

### Task 15: Migrate slides 9–14 — biomimicry sequence (interleaved)

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/009-biomimicry-all.mdx`
- Create: `src/content/decks/en/digital-futures-2026/010-biomimicry-forms.mdx`
- Create: `src/content/decks/en/digital-futures-2026/011-haeckel.mdx`
- Create: `src/content/decks/en/digital-futures-2026/012-biomimicry-forms-processes.mdx`
- Create: `src/content/decks/en/digital-futures-2026/013-gaudi-quote.mdx`
- Create: `src/content/decks/en/digital-futures-2026/014-biomimicry-all-2.mdx`

The four biomimicry slides (9, 10, 12, 14) repeat the same NASA Earth image with progressively-revealed text. Slide 11 is Haeckel/Detroit images. Slide 13 is the Gaudí quote. Source: `src/content/presentations/en/digital-futures-2026.mdx` lines 100–166.

- [ ] **Step 1: Slide 9 — Reproduce Forms / Processes / Ecosystems (all visible)**

```mdx
---
slideLayout: image-full
title: "Biomimicry"
---

import { Image } from "astro:assets";
import nasaBill from "@/assets/content/presentations/digital-futures-2026/NASABill_Ingalls.webp";
import Credit from "@/components/decks/Credit.astro";

<Image src={nasaBill} alt="NASA/Bill Ingalls" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full items-center justify-center">
  <div class="flex flex-col items-center gap-12 text-white" style="font-family: 'Montserrat', sans-serif;">
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Forms</p>
    <p class="text-xl sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Processes</p>
    <p class="text-xl sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Ecosystems</p>
  </div>
</div>

<Credit text="NASA/Bill Ingalls" />
```

- [ ] **Step 2: Slide 10 — Reproduce Forms (others 25% opacity)**

Same as slide 9, but `opacity-25` added to the `<p>` elements after "Reproduce Forms".

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import nasaBill from "@/assets/content/presentations/digital-futures-2026/NASABill_Ingalls.webp";
import Credit from "@/components/decks/Credit.astro";

<Image src={nasaBill} alt="NASA/Bill Ingalls" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full items-center justify-center">
  <div class="flex flex-col items-center gap-12 text-white" style="font-family: 'Montserrat', sans-serif;">
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Forms</p>
    <p class="text-xl opacity-25 sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide opacity-25 sm:text-4xl lg:text-5xl">Reproduce Processes</p>
    <p class="text-xl opacity-25 sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide opacity-25 sm:text-4xl lg:text-5xl">Reproduce Ecosystems</p>
  </div>
</div>

<Credit text="NASA/Bill Ingalls" />
```

- [ ] **Step 3: Slide 11 — Haeckel + Detroit composite with multi-line credit**

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import haeckelDetroit from "@/assets/content/presentations/digital-futures-2026/haeckel-detroit-composite.jpg";
import Credit from "@/components/decks/Credit.astro";

<Image src={haeckelDetroit} alt="Ernst Haeckel and Detroit Publishing Company" class="absolute inset-0 h-full w-full object-cover" />

<Credit text={[
  "Ernst Haeckel: Diatoms in Art Forms in Nature 1899 - 1904",
  "Detroit Publishing Company: Porte Monumentale at the 1900 World's Fair",
]} />
```

- [ ] **Step 4: Slide 12 — Forms + Processes (Ecosystems 25%)**

Same structure as slide 10 but only "Reproduce Ecosystems" and its preceding arrow are `opacity-25`.

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import nasaBill from "@/assets/content/presentations/digital-futures-2026/NASABill_Ingalls.webp";
import Credit from "@/components/decks/Credit.astro";

<Image src={nasaBill} alt="NASA/Bill Ingalls" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full items-center justify-center">
  <div class="flex flex-col items-center gap-12 text-white" style="font-family: 'Montserrat', sans-serif;">
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Forms</p>
    <p class="text-xl sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">Reproduce Processes</p>
    <p class="text-xl opacity-25 sm:text-3xl lg:text-4xl">↓</p>
    <p class="text-2xl font-bold uppercase tracking-wide opacity-25 sm:text-4xl lg:text-5xl">Reproduce Ecosystems</p>
  </div>
</div>

<Credit text="NASA/Bill Ingalls" />
```

- [ ] **Step 5: Slide 13 — Gaudí quote (uses `quote` layout)**

```mdx
---
slideLayout: image-full
---

import { Image } from "astro:assets";
import gaudi from "@/assets/content/presentations/digital-futures-2026/Antoni-Gaudí_Canaan.jpeg";
import Credit from "@/components/decks/Credit.astro";

<Image src={gaudi} alt="Antoni Gaudí in Canaan" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center text-white">
  <p class="max-w-4xl text-xl leading-relaxed font-light italic text-balance sm:text-3xl lg:text-4xl" style="font-family: 'Poppins', sans-serif;">"When an invention is not in harmony with natural laws it is not viable."</p>
  <p class="mt-6 text-base font-bold tracking-wider uppercase sm:text-lg lg:text-xl" style="font-family: 'Montserrat', sans-serif;">Antoni Gaudí</p>
</div>

<Credit text="Canaan" />
```

(Note: this stays as `image-full` rather than the theme's `quote` layout because the quote is overlaid on the Gaudí image, not centered on a plain background.)

- [ ] **Step 6: Slide 14 — same as slide 9 (all visible)**

Same content as 009-biomimicry-all.mdx; copy verbatim into 014-biomimicry-all-2.mdx, no changes.

- [ ] **Step 7: Verify slides 9–14 in browser**

Visit each. Verify the progressive-opacity effect on slides 10 and 12 reads correctly (one or two rows full visibility, others muted). Verify slide 13's quote is legible against the Gaudí image with the dim overlay.

- [ ] **Step 8: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/{009,010,011,012,013,014}-*.mdx
git commit -m "feat(decks): migrate slides 9-14 (biomimicry sequence + Haeckel + Gaudí)"
```

---

### Task 16: Migrate slides 15–22 (master's, thesis, ITECH-related)

**Source:** `src/content/presentations/en/digital-futures-2026.mdx` lines 168–204. These are mostly image+title patterns; follow Task 14 Step 4 (slide 7) as the template.

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/015-masters-itech.mdx` through `022-common-sky-construction.mdx`

- [ ] **Step 1: Migrate slides 15-18 (Master's at ITECH, Goethe, Building Across Scales x2)**

For each slide, follow the template pattern from Task 14 Step 4. Map each old `<Slide title=... subtitle=... image=... copyright=...>` to:

```mdx
---
slideLayout: image-full
title: "<title>"
---

import { Image } from "astro:assets";
import img from "<imageImportPath>";
import Credit from "@/components/decks/Credit.astro";

<Image src={img} alt="<imageAlt>" class="absolute inset-0 h-full w-full object-cover" />

<div class="relative z-10 flex h-full flex-col justify-end p-12">
  <h1 class="text-white"><title></h1>
  <h2 class="text-white/80"><subtitle></h2>
</div>

<Credit text="<copyright>" />
```

For slides whose old version had no `image` prop and used custom `<img>` for an inline diagram (e.g., slide 15 "Master's at ITECH" uses `codesignDiagram`, slide 16 "Goethe" uses `urpflanze`), use `slideLayout: default` with the diagram in a centered container, like slide 8.

For slide 17 (Building Across Scales) and 18 (material-robotic diagram), follow the standard image-full template.

- [ ] **Step 2: Migrate slides 19-22 (Radom, Common Sky, Common Sky Construction)**

Standard image-full template (or video for slide 20). Source frontmatter and image imports from the old MDX.

- [ ] **Step 3: Verify each slide renders**

Visit `http://localhost:4321/digital-futures-2026/{15..22}`. Verify visual fidelity slide-by-slide.

- [ ] **Step 4: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/0{15,16,17,18,19,20,21,22}-*.mdx
git commit -m "feat(decks): migrate slides 15-22 (master's, thesis, Radom, Common Sky)"
```

---

### Task 17: Migrate slides 23–28 (Canyon, Breathing Earth Sphere)

**Source:** old MDX lines 206–217. All standard image+title patterns or image-only.

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/023-canyon.mdx` through `028-buildsystems-kfw.mdx`

- [ ] **Step 1: Migrate slides 23-26 (Canyon x2, Breathing Earth Sphere x2)**

Standard image-full + title/subtitle pattern (Task 14 Step 4 template). Wait, slides 27-28 are about BuildSystems, not Canyon — let me re-check. Source lines 207-222 in the old MDX:

- 23: Canyon
- 24: Canyon (steel sheet bending)
- 25: Breathing Earth Sphere
- 26: Breathing Earth Sphere (Docho Island)
- 27: BuildSystems Grasshopper plugin
- 28: BuildSystems KfW funding calculator

Use the standard image-full template for each. Image imports come from the old MDX.

- [ ] **Step 2: Verify each slide renders**

Visit `http://localhost:4321/digital-futures-2026/{23..28}` in dev server.

- [ ] **Step 3: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/0{23,24,25,26,27,28}-*.mdx
git commit -m "feat(decks): migrate slides 23-28 (Canyon, Breathing Earth, BuildSystems intro)"
```

---

### Task 18: Migrate slides 29–33 (BuildSystems, DOKwood, AI Harness)

**Source:** old MDX lines 224–251.

**Files:**
- Create: `src/content/decks/en/digital-futures-2026/029-buildsystems-ontology.mdx` through `033-ai-harness.mdx`

- [ ] **Step 1: Migrate slide 29 (BuildSystems ontology — image with title)**

Standard image-full + title template.

- [ ] **Step 2: Migrate slide 30 (DOKwood — video with title)**

Follow slide 5 video pattern.

- [ ] **Step 3: Migrate slide 31 (Buildup) and 32 (DOKwood) — inline images, default layout**

Follow slide 8 GIF pattern but with regular images (Astro `<Image>` works for these since they're not GIFs):

```mdx
---
slideLayout: default
---

import { Image } from "astro:assets";
import img from "<path>";

<div class="absolute inset-0 flex items-center justify-center">
  <Image src={img} alt="<alt>" class="max-h-full w-auto" />
</div>
```

- [ ] **Step 4: Migrate slide 33 (AI Harness — image with credit)**

Standard image-full pattern with `<Credit text="Gemini" />`.

- [ ] **Step 5: Verify each slide renders**

Visit `http://localhost:4321/digital-futures-2026/{29..33}`.

- [ ] **Step 6: Commit**

```bash
git add src/content/decks/en/digital-futures-2026/0{29,30,31,32,33}-*.mdx
git commit -m "feat(decks): migrate slides 29-33 (BuildSystems ontology, DOKwood, AI Harness)"
```

---

### Task 19: Smoke test full English deck

**Files:** none modified (testing only)

- [ ] **Step 1: Build production**

```bash
npm run build
```

Expected: build passes; output reports 33 deck slide pages + 33 notes pages = 66 generated routes for the deck (plus all existing site pages).

- [ ] **Step 2: Run preview**

```bash
npm run preview
```

- [ ] **Step 3: Navigate full deck**

Open `http://localhost:4321/digital-futures-2026/1`. Press `→` 32 times. Verify:
- Each slide URL increments correctly.
- Each slide renders as expected.
- Slide indicator (`N / 33`) updates.
- HUD remains responsive.

Press `←` 32 times back to slide 1.

Press `End` — should jump to slide 33. Press `Home` — should return to slide 1.

- [ ] **Step 4: Test presenter mode end-to-end**

From slide 5, click "Presenter" or press `P`. A new window opens at `/digital-futures-2026/5/notes`.
- Verify the timer increments.
- Verify the notes content matches the slide's `<Notes>` body or `notes` frontmatter (slide 5 may not have notes; check that the empty-state UI appears).
- In the projector window, press `→`. The notes window should follow to `/digital-futures-2026/6/notes`.

- [ ] **Step 5: Verify exit link**

From any slide, click "← Exit". Should navigate to `/digital-futures-2026` (the parent teaching entry's existing page). Verify the parent page loads correctly.

- [ ] **Step 6: Verify routing collision check**

Open `/digital-futures-2026` directly — should resolve to the parent teaching entry, NOT 404, NOT the deck. The `[...subpage]` route handles single-segment slugs; the `[slug]/[n]` route only matches two-segment URLs.

- [ ] **Step 7: Commit (no changes; tag the smoke-test pass with a commit-empty marker if desired)**

If everything passes, no commit needed. If a slide needs a fix, address it now and commit per slide.

---

### Task 20: Build the PDF export script

**Files:**
- Create: `scripts/export-deck.ts`

- [ ] **Step 1: Write the export script**

```ts
#!/usr/bin/env tsx
import { chromium } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

interface Args {
  locale: string;
  slug: string;
  format: "pdf" | "png";
  baseUrl: string;
  outDir: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const get = (flag: string, def?: string): string => {
    const idx = args.indexOf(flag);
    if (idx < 0) {
      if (def !== undefined) return def;
      throw new Error(`Missing required arg: ${flag}`);
    }
    return args[idx + 1];
  };
  const format = get("--format", "pdf") as "pdf" | "png";
  if (format !== "pdf" && format !== "png") {
    throw new Error(`--format must be "pdf" or "png"`);
  }
  return {
    locale: get("--locale"),
    slug: get("--slug"),
    format,
    baseUrl: get("--base", "http://localhost:4321"),
    outDir: get("--out", "exports"),
  };
}

async function getTotalSlides(
  page: import("@playwright/test").Page,
  baseUrl: string,
  locale: string,
  slug: string,
): Promise<number> {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const url = `${baseUrl}${localePrefix}/${slug}/1`;
  await page.goto(url, { waitUntil: "networkidle" });
  const total = await page.evaluate(() => {
    const el = document.body;
    const v = el.getAttribute("data-total");
    return v ? parseInt(v, 10) : 0;
  });
  if (!total || total < 1) {
    throw new Error(`Could not read data-total from ${url}`);
  }
  return total;
}

async function captureSlide(
  page: import("@playwright/test").Page,
  baseUrl: string,
  locale: string,
  slug: string,
  n: number,
): Promise<Buffer> {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const url = `${baseUrl}${localePrefix}/${slug}/${n}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.classList.add("deck-hud-hidden");
  });
  await page.waitForTimeout(400);
  return page.screenshot({ type: "png", fullPage: false });
}

async function main() {
  const args = parseArgs();
  await fs.mkdir(args.outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const total = await getTotalSlides(page, args.baseUrl, args.locale, args.slug);
  console.log(`Exporting ${args.slug} (${args.locale}): ${total} slides`);

  const buffers: Buffer[] = [];
  for (let n = 1; n <= total; n++) {
    process.stdout.write(`  slide ${n}/${total}...`);
    const buf = await captureSlide(page, args.baseUrl, args.locale, args.slug, n);
    buffers.push(buf);
    if (args.format === "png") {
      const file = path.join(args.outDir, `${args.slug}-${args.locale}-${String(n).padStart(3, "0")}.png`);
      await fs.writeFile(file, buf);
    }
    console.log(" done");
  }

  if (args.format === "pdf") {
    const pdf = await PDFDocument.create();
    for (const buf of buffers) {
      const png = await pdf.embedPng(buf);
      const page = pdf.addPage([png.width, png.height]);
      page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });
    }
    const bytes = await pdf.save();
    const out = path.join(args.outDir, `${args.slug}-${args.locale}.pdf`);
    await fs.writeFile(out, bytes);
    console.log(`Wrote ${out} (${(bytes.length / 1024).toFixed(0)} KB)`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify the script type-checks**

```bash
npx tsc --noEmit scripts/export-deck.ts
```

Expected: no type errors. (If the project doesn't have `tsc` configured for stand-alone scripts, run `npm run build` and verify scripts are not picked up by the build.)

- [ ] **Step 3: Run the script against the dev server**

In one terminal, start dev server:

```bash
npm run dev
```

In another terminal:

```bash
npm run export-deck -- --locale en --slug digital-futures-2026 --format pdf --out exports
```

Expected: console prints "Exporting digital-futures-2026 (en): 33 slides", then 33 lines of "slide N/33... done", then "Wrote exports/digital-futures-2026-en.pdf (XXX KB)".

- [ ] **Step 4: Verify the PDF**

Open `exports/digital-futures-2026-en.pdf`. Verify:
- It has 33 pages.
- Each page renders the corresponding slide at high resolution.
- Visual fidelity matches the browser view.

- [ ] **Step 5: Commit**

```bash
git add scripts/export-deck.ts
git commit -m "feat(decks): add Playwright + pdf-lib PDF export script"
```

---

### Task 21: Document the slide authoring convention in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append a new section to CLAUDE.md**

Insert this section after "AI Chat Knowledge Pipeline" (or in an appropriate place that follows the file's existing structure). Use a fenced markdown block with four backticks since the body itself contains a fenced YAML block:

````markdown
## Slide deck authoring (astlide library-only)

Slide decks live in `src/content/decks/{locale}/{slug}/NNN-name.mdx`, where:
- `{locale}` is `en`, `pt`, or `de`.
- `{slug}` matches the parent teaching/projects/research/publications entry's slug.
- `NNN` is a three-digit zero-padded slide number (`001`, `017`, `123`, ...).
- `name` is a human-readable hyphenated description.

Each slide is one MDX file with astlide frontmatter:

```yaml
---
slideLayout: cover | section | two-column | image-full | image-left | image-right | code | quote | statement | default
transition: none | fade | slide-left | slide-right | slide-up | zoom
title: "Optional slide title"
notes: "Optional speaker notes string; or use <Notes> in body for rich content"
hidden: false
---
```

Body imports come from `astro:assets` (`<Image>`) for static images, or use raw `<img>` for animated GIFs. Component imports come from `@astlide/core/components/...` (Slide, Fragment, Notes, Columns, etc.) and `@/components/decks/...` for site-specific components (Credit, SlideVideo).

Astlide is used as a component library only; we do NOT register `astlide()` as an Astro integration. The slide route at `src/pages/[...locale]/[slug]/[n].astro` and the presenter notes route at `src/pages/[...locale]/[slug]/[n]/notes.astro` are site-owned. Theme is the `locatelli` theme at `src/styles/themes/locatelli.css`.

Public canonical slide URL: `/{locale}/{slug}/{N}`.

Multilingual rule applies (CLAUDE.md "Multilingual content edits"): when editing a slide in one locale, update the corresponding files in pt and de. Translatable: `title`, body markdown text, `alt=` strings, `<Notes>` body. Sync verbatim: `slideLayout`, `transition`, image `src=`, all Tailwind classes.

PDF export: `npm run export-deck -- --locale en --slug <slug> --format pdf --out exports` (requires dev server running).
````

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): document slide deck authoring convention (astlide)"
```

---

## Phase 1 acceptance check

After Task 21, verify:

- [ ] All 33 English slide files exist at `src/content/decks/en/digital-futures-2026/NNN-*.mdx`.
- [ ] `npm run build` passes with no warnings.
- [ ] `/digital-futures-2026/N` renders for N ∈ [1, 33] in default locale.
- [ ] Keyboard navigation (`→`, `←`, `Home`, `End`, `Space`, `PgUp`, `PgDn`) works.
- [ ] `?` opens help dialog; `F` toggles fullscreen; `P` opens presenter window.
- [ ] Presenter window syncs slide changes from projector window via BroadcastChannel.
- [ ] PDF export script produces a valid 33-page PDF.
- [ ] Old `/presentations/digital-futures-2026` URL still works (old system intact).
- [ ] No console errors on any slide.

If all check, Phase 1 is shippable. The next plan is Phase 2 (pt + de translation).

---

## Self-review notes

After writing this plan, check it against the spec at `docs/superpowers/specs/2026-05-01-astlide-adoption-design.md`:

**Spec coverage** — every Phase 1 deliverable in the spec is mapped to a task:
- Architecture overview → Tasks 1, 2, 8, 9
- Content layout + frontmatter + schema → Tasks 2, 12-18
- Route implementation → Tasks 9, 11
- Locatelli theme + DeckLayout → Tasks 4, 7, 8, 10
- Phase 1 migration (33 slides) → Tasks 12-18
- Smoke test → Task 19
- Export script → Task 20
- CLAUDE.md updates → Task 21

**Placeholder scan** — reread for "TODO", "TBD", "implement later", "similar to". None found except deferred items explicitly flagged in the spec's Open Questions table (theme accent color, view transitions, etc.) which are *intentionally* deferred to implementation polish.

**Type/name consistency** — `slideSchema`, `findParentEntry`, `decks`, `BroadcastChannel('deck-{slug}-{locale}')`, `data-theme="locatelli"`, `[data-credit]` selector, file pattern `[0-9][0-9][0-9]-*.mdx` are all used consistently.
