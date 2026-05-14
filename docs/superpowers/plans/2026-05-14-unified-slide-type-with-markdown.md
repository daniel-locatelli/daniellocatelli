# Unified Slide Type with Markdown Text — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the four slide types (`slide`, `title`, `text`, `image-row`) into a single `slide` type with markdown-rendered text, removing artificial limitations (e.g., "text slides cannot have backgrounds", "image-row cannot have foreground text") and unifying typography across all text contexts.

**Architecture:** A small markdown-to-HTML helper (`marked`) renders the constrained subset of markdown allowed in slide text. A new `SlideMarkdown` component renders that HTML with project-consistent typography (h1 = hero, h2 = subhead, p = body, blockquote = quote). The validator and YAML transformer in `vite-presentation-slides.ts` are extended in additive steps so old and new field shapes coexist; existing decks migrate slide-by-slide; deprecated types and components (TitleSlide, TextSlide, SlideImageRow) are removed only after all decks are migrated.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS 4, `marked` (new dependency), `tsx --test` (Node built-in test runner), Vite plugin transform.

---

## File Structure

**New files:**
- `src/lib/slide-markdown.ts` — markdown→HTML helper using `marked` configured with the constrained subset (headings ≤ h3, paragraphs, em/strong, blockquote, ul/ol, line breaks). Exposes one function: `renderSlideMarkdown(input: string): string`.
- `src/components/slides/SlideMarkdown.astro` — renders markdown with project typography. Accepts `text: string` and optional `align: 'center' | 'top' | 'bottom'`, `darkText: boolean`. Uses `set:html` with output from `renderSlideMarkdown`.
- `tests/unit/slide-markdown.test.ts` — unit tests for `renderSlideMarkdown`.
- `tests/unit/vite-presentation-slides.test.ts` — unit tests for the validator + binding/transform pipeline (extracted to allow Phase 1 changes to be test-driven).

**Modified files:**
- `src/lib/vite-presentation-slides.ts` — additive validator + transformer changes per phase: Phase 1 accepts `text:` (markdown) on `type: slide`; Phase 3 accepts `images:` (array) on `type: slide`; Phase 5 removes `type: text|title|image-row` and the `subtext`/`size`/`case`/`variant` fields.
- `src/components/slides/Slide.astro` — accept and render `text:` (markdown) and `images:` (grid bg).
- `src/components/slides/SlideText.astro` — internally route to `SlideMarkdown` so foreground positioned text uses the same typography pipeline as full-slide text.
- `docs/slides/AUTHORING.md` — documentation rewritten incrementally per phase.

**Deleted (Phase 5, after all decks migrated):**
- `src/components/slides/TitleSlide.astro`
- `src/components/slides/TextSlide.astro`
- `src/components/slides/SlideImageRow.astro`

**Migrated (Phase 2 + Phase 4):**
- `src/content/teaching/de/digital-futures-2026/deck.mdx`
- `src/content/teaching/en/digital-futures-2026/deck.mdx`
- `src/content/teaching/pt/digital-futures-2026/deck.mdx`
- `src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx`
- (any other deck.mdx files using the deprecated types — discovered via `git grep -l "type: title\|type: text\|type: image-row"`)

---

## Phase 1: Markdown text rendering on `type: slide`

Goal: `type: slide` accepts a top-level `text:` field that renders markdown with consistent typography. No existing decks change yet. Old slide types continue to work unchanged.

### Task 1: Install `marked` and add a typed markdown helper

**Files:**
- Modify: `package.json` (add `marked` to dependencies)
- Create: `src/lib/slide-markdown.ts`

- [ ] **Step 1: Install marked**

Run: `npm install marked`

Expected: `marked` appears in `package.json` dependencies; `package-lock.json` updates.

- [ ] **Step 2: Create the helper file**

Create `src/lib/slide-markdown.ts`:

```ts
import { marked, type MarkedOptions } from "marked";

// Slide markdown is a constrained subset of CommonMark:
//   - Headings h1, h2, h3 (deeper levels collapse to h3)
//   - Paragraphs
//   - Emphasis: *em*, **strong**
//   - Blockquotes
//   - Unordered and ordered lists
//   - Hard line breaks via two-space-newline or backslash-newline
// Not supported: raw HTML, tables, code blocks, links, images.
// Authors needing images/videos use the slideImage:/slideVideo: blocks.

const OPTIONS: MarkedOptions = {
  gfm: false,
  breaks: false,
  pedantic: false,
};

const renderer = new marked.Renderer();

// Strip heading levels deeper than 3 down to h3 so authors cannot escape
// the typographic scale by writing #### or below.
renderer.heading = ({ tokens, depth }) => {
  const level = Math.min(depth, 3);
  const text = renderer.parser.parseInline(tokens);
  return `<h${level}>${text}</h${level}>`;
};

// Block raw HTML — slide text is content, not markup. Authors who need
// custom layout drop to a JSX block in the deck.
renderer.html = () => "";

// Block links + images — they have no place in slide chrome text. Images
// go through slideImage; "links" within slide prose are an antipattern.
renderer.link = ({ tokens }) => renderer.parser.parseInline(tokens);
renderer.image = () => "";
renderer.code = () => "";
renderer.codespan = () => "";
renderer.table = () => "";

marked.use({ renderer });

export function renderSlideMarkdown(input: string): string {
  if (!input) return "";
  // Strip exactly one trailing newline (YAML's default `|` chomp leaves
  // exactly one) so authors don't get a phantom empty paragraph.
  const trimmed = input.endsWith("\n") ? input.slice(0, -1) : input;
  return marked.parse(trimmed, OPTIONS) as string;
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/slide-markdown.ts`

Expected: no errors. (If tsc complains about the `marked` types, ensure `@types/marked` is not needed — modern `marked` ships its own types.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/slide-markdown.ts
git commit -m "feat(slides): add slide-markdown helper for constrained-subset rendering"
```

### Task 2: Test the markdown helper

**Files:**
- Create: `tests/unit/slide-markdown.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/slide-markdown.test.ts`:

```ts
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { renderSlideMarkdown } from "../../src/lib/slide-markdown.ts";

describe("renderSlideMarkdown", () => {
  test("renders h1 from a single hash heading", () => {
    const out = renderSlideMarkdown("# Modelagem Associativa");
    assert.match(out, /^<h1>Modelagem Associativa<\/h1>/);
  });

  test("renders h2 from two hashes", () => {
    const out = renderSlideMarkdown("## Subhead");
    assert.match(out, /^<h2>Subhead<\/h2>/);
  });

  test("collapses h4+ down to h3", () => {
    const out = renderSlideMarkdown("#### Deep");
    assert.match(out, /<h3>Deep<\/h3>/);
  });

  test("renders body paragraphs", () => {
    const out = renderSlideMarkdown("Plain body text.");
    assert.match(out, /<p>Plain body text\.<\/p>/);
  });

  test("renders blockquote", () => {
    const out = renderSlideMarkdown("> A quote");
    assert.match(out, /<blockquote>[\s\S]*<p>A quote<\/p>[\s\S]*<\/blockquote>/);
  });

  test("renders strong and em", () => {
    const out = renderSlideMarkdown("This is **bold** and *italic*.");
    assert.match(out, /<strong>bold<\/strong>/);
    assert.match(out, /<em>italic<\/em>/);
  });

  test("strips raw HTML", () => {
    const out = renderSlideMarkdown("Hello <script>alert(1)</script> world");
    assert.doesNotMatch(out, /<script>/);
  });

  test("strips links (renders link text only)", () => {
    const out = renderSlideMarkdown("[click](http://example.com)");
    assert.match(out, /click/);
    assert.doesNotMatch(out, /<a /);
  });

  test("strips images entirely", () => {
    const out = renderSlideMarkdown("![alt](/img.png)");
    assert.doesNotMatch(out, /<img/);
  });

  test("strips code blocks", () => {
    const out = renderSlideMarkdown("```\nconst x = 1;\n```");
    assert.doesNotMatch(out, /<pre>|<code>/);
  });

  test("returns empty string for empty input", () => {
    assert.equal(renderSlideMarkdown(""), "");
  });

  test("does not produce trailing empty paragraph from single trailing newline", () => {
    const out = renderSlideMarkdown("Body text.\n");
    // Exactly one <p>, no trailing empty <p></p>
    const matches = out.match(/<p>/g) ?? [];
    assert.equal(matches.length, 1);
  });

  test("renders multi-block content in order", () => {
    const out = renderSlideMarkdown("# Title\n\nBody.\n\n> Quote.");
    const titleIdx = out.indexOf("<h1>");
    const bodyIdx = out.indexOf("<p>Body");
    const quoteIdx = out.indexOf("<blockquote");
    assert.ok(titleIdx >= 0 && bodyIdx > titleIdx && quoteIdx > bodyIdx);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail in the predicted way**

Run: `npm run test:unit -- tests/unit/slide-markdown.test.ts`

Expected: tests RUN (don't error from setup) and PASS — Task 1 already implemented the helper. If any test fails, fix the helper before continuing.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/slide-markdown.test.ts
git commit -m "test(slides): cover slide-markdown constrained subset"
```

### Task 3: Create the SlideMarkdown component

**Files:**
- Create: `src/components/slides/SlideMarkdown.astro`

- [ ] **Step 1: Create the component**

Create `src/components/slides/SlideMarkdown.astro`:

```astro
---
import { renderSlideMarkdown } from "@/lib/slide-markdown";

interface Props {
  text: string;
  // Vertical alignment within the slide. Default 'center' matches the
  // current TextSlide hero behavior.
  align?: "center" | "top" | "bottom";
  darkText?: boolean;
}

const { text, align = "center", darkText = false } = Astro.props;

const html = renderSlideMarkdown(text);

const justify =
  align === "top" ? "justify-start pt-16" :
  align === "bottom" ? "justify-end pb-16" :
  "justify-center";

const textColor = darkText ? "text-zinc-950" : "text-white";
---

<div
  class:list={[
    "absolute inset-0 z-10 flex flex-col items-center px-8 text-center",
    justify,
    textColor,
    "slide-md",
  ]}
>
  <div class="max-w-5xl" set:html={html} />
</div>

<style is:global>
  /* Project-consistent typography for slide markdown. Sizes mirror the
     existing TextSlide scale so visual continuity is preserved during the
     migration. Authors get heading hierarchy via markdown structure;
     visual scale is never authored, always derived from semantic level. */
  .slide-md h1 {
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-wrap: balance;
    font-size: clamp(2.5rem, 7vw, 6rem);
    margin: 0 0 1.5rem 0;
  }

  .slide-md h2 {
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
    line-height: 1.15;
    text-wrap: balance;
    font-size: clamp(1.75rem, 4.5vw, 3.5rem);
    margin: 0 0 1rem 0;
  }

  .slide-md h3 {
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
    line-height: 1.2;
    text-wrap: balance;
    font-size: clamp(1.25rem, 3vw, 2.25rem);
    margin: 0 0 0.75rem 0;
  }

  .slide-md p {
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    line-height: 1.5;
    text-wrap: pretty;
    font-size: clamp(1rem, 1.8vw, 1.5rem);
    margin: 0 0 1rem 0;
  }

  .slide-md blockquote {
    font-family: "Poppins", sans-serif;
    font-style: italic;
    font-weight: 300;
    line-height: 1.4;
    opacity: 0.85;
    border-left: 3px solid currentColor;
    padding-left: 1rem;
    margin: 0 0 1rem 0;
    text-align: left;
    font-size: clamp(1.125rem, 2vw, 1.75rem);
  }

  .slide-md ul,
  .slide-md ol {
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    text-align: left;
    margin: 0 auto 1rem auto;
    max-width: 40em;
  }

  .slide-md > div > *:last-child {
    margin-bottom: 0;
  }
</style>
```

- [ ] **Step 2: Verify it builds**

Run: `npm run check:decks`

Expected: still passes (no decks reference SlideMarkdown yet, so this is a smoke test that the file compiles via Astro's type checker on the next dev/build).

- [ ] **Step 3: Commit**

```bash
git add src/components/slides/SlideMarkdown.astro
git commit -m "feat(slides): SlideMarkdown component with consistent typography"
```

### Task 4: Extract validator tests for the YAML plugin

**Files:**
- Create: `tests/unit/vite-presentation-slides.test.ts`

Validator changes are about to land; pin current behavior with tests so regressions are caught.

- [ ] **Step 1: Write tests pinning current behavior**

Create `tests/unit/vite-presentation-slides.test.ts`:

```ts
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { validateSlide } from "../../src/lib/vite-presentation-slides.ts";

const ctx = { file: "deck.mdx", line: 1 };

describe("validateSlide — current behavior (pre-refactor)", () => {
  test("type: slide accepts no fields (all optional)", () => {
    const errors = validateSlide({}, ctx);
    assert.deepEqual(errors, []);
  });

  test("type: title requires title field", () => {
    const errors = validateSlide({ type: "title" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'title'")));
  });

  test("type: text requires text field", () => {
    const errors = validateSlide({ type: "text" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'text'")));
  });

  test("type: image-row requires images field", () => {
    const errors = validateSlide({ type: "image-row" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("missing required field 'images'")));
  });

  test("unknown field on type: slide is rejected", () => {
    const errors = validateSlide({ type: "slide", banana: "yellow" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("unknown field 'banana'")));
  });

  test("type: text rejects image field (current behavior)", () => {
    const errors = validateSlide(
      { type: "text", text: "Hi", image: "foo" },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("unknown field 'image'")));
  });

  test("overlay format must be color/0-100", () => {
    const errors = validateSlide({ overlay: "purple/50" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("overlay")));
  });
});
```

- [ ] **Step 2: Run tests; confirm all pass**

Run: `npm run test:unit -- tests/unit/vite-presentation-slides.test.ts`

Expected: all 7 tests PASS — they describe the validator as it currently is.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/vite-presentation-slides.test.ts
git commit -m "test(slides): pin current validator behavior before refactor"
```

### Task 5: Add `text:` field to `type: slide` in the validator

**Files:**
- Modify: `src/lib/vite-presentation-slides.ts:71-86` (KNOWN_FIELDS["slide"])
- Modify: `src/lib/vite-presentation-slides.ts:142-152` (STRING_FIELDS_BY_TYPE["slide"])
- Modify: `tests/unit/vite-presentation-slides.test.ts` (add test)

- [ ] **Step 1: Write failing test for new behavior**

Append to `tests/unit/vite-presentation-slides.test.ts`:

```ts
describe("validateSlide — markdown text on type: slide", () => {
  test("accepts text: markdown string on type: slide", () => {
    const errors = validateSlide(
      { type: "slide", text: "# Heading\n\nBody." },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects non-string text", () => {
    const errors = validateSlide(
      { type: "slide", text: 42 as unknown as string },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("'text'")));
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npm run test:unit -- tests/unit/vite-presentation-slides.test.ts`

Expected: the new "accepts text: markdown" test FAILS with "unknown field 'text'".

- [ ] **Step 3: Add `text` to KNOWN_FIELDS["slide"] and STRING_FIELDS_BY_TYPE["slide"]**

In `src/lib/vite-presentation-slides.ts`, edit the `slide:` entries so they include `"text"`:

```ts
// KNOWN_FIELDS, slide entry — add "text"
slide: new Set([
  "type",
  "title",
  "subtitle",
  "image",
  "imageAlt",
  "imagePosition",
  "darkText",
  "copyright",
  "fit",
  "overlay",
  "notes",
  "slideImage",
  "slideVideo",
  "slideText",
  "text", // NEW: top-level markdown body
]),
```

```ts
// STRING_FIELDS_BY_TYPE, slide entry — add "text"
slide: [
  "title",
  "subtitle",
  "image",
  "imageAlt",
  "imagePosition",
  "fit",
  "overlay",
  "notes",
  "text", // NEW
],
```

- [ ] **Step 4: Run tests; verify all pass**

Run: `npm run test:unit`

Expected: all tests PASS, including the new ones.

- [ ] **Step 5: Run deck validator to confirm no regressions**

Run: `npm run check:decks`

Expected: `OK: 182 slides across 5 decks validated`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/vite-presentation-slides.ts tests/unit/vite-presentation-slides.test.ts
git commit -m "feat(slides): accept text: markdown field on type: slide"
```

### Task 6: Render `text:` in the YAML→JSX transformer

**Files:**
- Modify: `src/lib/vite-presentation-slides.ts:1025-1075` (`buildSlideJsx` and `specialFields`)

The transformer currently emits child JSX for `slideImage`, `slideVideo`, `slideText`, `notes`, and `overlay`. Add `text` to that list — it emits a `<SlideMarkdown text={...} />` child.

- [ ] **Step 1: Write a transform-output test**

Append to `tests/unit/vite-presentation-slides.test.ts`:

```ts
import { extractSlidesFromMdx } from "../../src/lib/vite-presentation-slides.ts";

describe("YAML→JSX transform — text field", () => {
  test("text: emits <SlideMarkdown> child of <Slide>", () => {
    // Direct unit test of the transform requires exporting buildSlideJsx,
    // which is currently private. Until we export it, this test asserts
    // via extractSlidesFromMdx + the Vite plugin's transform contract:
    // the YAML field exists; rendering is verified end-to-end by the deck
    // validator + manual visual review in Phase 2.
    const mdx = `---
Name: x
---

---
type: slide
text: |
  # Hello
---
`;
    const { slides, parseErrors } = extractSlidesFromMdx(mdx, "deck.mdx");
    assert.deepEqual(parseErrors, []);
    assert.equal(slides.length, 1);
    assert.equal(slides[0].config.type, "slide");
    assert.match(String(slides[0].config.text), /^# Hello/);
  });
});
```

- [ ] **Step 2: Run; should pass (extractor already handles arbitrary fields)**

Run: `npm run test:unit -- tests/unit/vite-presentation-slides.test.ts`

Expected: PASS. The extractor doesn't filter by type; it just returns the parsed YAML.

- [ ] **Step 3: Add `text` to specialFields and emit a <SlideMarkdown> child**

In `src/lib/vite-presentation-slides.ts`, modify `buildSlideJsx`:

```ts
// In buildSlideJsx, after specialFields is built:
specialFields.add("text"); // text always emitted as a child component

// Then in the children block, after the slideText handling, add:
if (componentName === "Slide" && typeof config.text === "string" && config.text.length > 0) {
  children.push(`<SlideMarkdown text={${JSON.stringify(config.text)}} />`);
}
```

(Be sure `text` is also removed from the generic `attrs` loop. Adding it to `specialFields` via `specialFields.add("text")` does that.)

- [ ] **Step 4: Update the AUTHORING.md "Required-imports rule" comment**

Edit `docs/slides/AUTHORING.md` to add `SlideMarkdown` to the imports comment near line 37–43:

```mdx
import SlideMarkdown from "@/components/slides/SlideMarkdown.astro";
```

And add a sentence to the rule: "any `text:` field on a slide needs `SlideMarkdown`."

- [ ] **Step 5: Run deck validator to confirm no regressions**

Run: `npm run check:decks`

Expected: `OK: 182 slides across 5 decks validated`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/vite-presentation-slides.ts docs/slides/AUTHORING.md tests/unit/vite-presentation-slides.test.ts
git commit -m "feat(slides): emit <SlideMarkdown> child for text: field"
```

### Task 7: Manually verify a single demo slide renders

**Files:**
- Modify (temporary): `src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx` (add one demo slide, revert later)

- [ ] **Step 1: Add `SlideMarkdown` to the deck imports**

In `src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx`, add to the imports near the top:

```mdx
import SlideMarkdown from "@/components/slides/SlideMarkdown.astro";
```

- [ ] **Step 2: Add one new demo slide using the new shape**

Append a new fence at the end of the file (before any deck-trailing content):

```yaml
---
type: slide
image: spumellariaHaeckel
imageAlt: Detalhe da prancha Spumellaria de Ernst Haeckel, Kunstformen der Natur
overlay: black/70
fit: contain
text: |
  # Modelagem Associativa

  Demo body paragraph.

  > Demo quote line.
---
```

- [ ] **Step 3: Visual check**

Start the dev server (`npm run dev` if not running) and navigate to the deck URL. Confirm:
1. The demo slide renders with the Spumellaria background and dark overlay.
2. "Modelagem Associativa" displays as a large hero heading.
3. "Demo body paragraph." displays as smaller body text.
4. "Demo quote line." displays as italic blockquote.
5. Foreground text sits above the overlay (z-stacking from earlier fixes still works).

- [ ] **Step 4: Revert the demo slide**

Remove the demo fence from the deck. Keep the `SlideMarkdown` import (it'll be reused in Phase 2).

- [ ] **Step 5: Commit the import addition**

```bash
git add src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx
git commit -m "chore(deck): import SlideMarkdown ahead of phase-2 migration"
```

(Phase 1 ship-point: `type: slide` with `text:` markdown works end-to-end. Old types still work unchanged. No deck content has changed yet.)

---

## Phase 2: Migrate `type: text` and `type: title` slides

Goal: every `type: text` and `type: title` slide in the repo becomes `type: slide` with markdown text. The deprecated types remain valid until Phase 5.

### Task 8: Inventory the slides to migrate

**Files:**
- (read-only) all `src/content/**/deck.mdx`

- [ ] **Step 1: Generate the inventory**

Run:

```bash
cd C:/repos/daniellocatelli && grep -rn "^type: title\|^type: text" src/content --include="deck.mdx" | tee /tmp/slides-to-migrate.txt
```

Expected: a list of file:line locations. Count expected: roughly 5 decks × 1–2 title slides + several text slides each.

- [ ] **Step 2: Note the count for the migration commits**

Eyeball the count and group by deck. Each deck will be one commit in this phase to keep diffs reviewable.

### Task 9: Migrate `type: title` slides — UFT (PT) deck

**Files:**
- Modify: `src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx`

- [ ] **Step 1: Convert each `type: title` slide**

For each `type: title` block, rewrite as `type: slide` + `text:` markdown. Example transformation:

```yaml
# BEFORE
---
type: title
title: Arquitetura Computacional na Alemanha
author: Daniel Nunes Locatelli
image: spumellariaHaeckel
imageAlt: Detalhe da prancha Spumellaria de Ernst Haeckel, Kunstformen der Natur
overlay: black/70
fit: contain
---

# AFTER
---
type: slide
image: spumellariaHaeckel
imageAlt: Detalhe da prancha Spumellaria de Ernst Haeckel, Kunstformen der Natur
overlay: black/70
fit: contain
text: |
  # Arquitetura Computacional na Alemanha

  Daniel Nunes Locatelli
---
```

Notes:
- `author` and `institution` become a body paragraph (or multiple paragraphs) under the h1.
- `subtitle` (if present on a `type: title` slide) becomes a markdown body paragraph or h2 below the h1.
- Keep all background fields (`image`, `imageAlt`, `overlay`, `fit`, `imagePosition`, `darkText`) unchanged.

- [ ] **Step 2: Validate**

Run: `npm run check:decks`

Expected: passes.

- [ ] **Step 3: Visual check**

Reload the deck in the browser. Confirm each migrated title slide renders identically to the previous `type: title` rendering (modulo the new typography from `SlideMarkdown`, which should match TextSlide's scale).

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx
git commit -m "refactor(deck): migrate UFT PT title slides to type: slide + text"
```

### Task 10: Migrate `type: text` slides — UFT (PT) deck

**Files:**
- Modify: `src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx`

- [ ] **Step 1: Convert each `type: text` slide**

Example transformation:

```yaml
# BEFORE
---
type: text
text: |+
  Modelagem Associativa
  
  
size: sm
---

# AFTER
---
type: slide
text: |
  # Modelagem Associativa
---
```

Notes:
- The `|+` chomp + trailing blanks (used as visual spacing) goes away. SlideMarkdown's typography sets margins via CSS.
- The first non-empty line becomes an `# h1` heading.
- If the slide had `subtext:`, render it as a body paragraph or `## h2` per visual intent.
- If the slide had `case: upper`, drop it — h1 in SlideMarkdown is uppercase by stylesheet.
- If the slide had `size: sm` (smaller text), use `## h2` instead of `# h1`.

- [ ] **Step 2: Validate**

Run: `npm run check:decks`

Expected: passes.

- [ ] **Step 3: Visual check**

Reload the deck. Each migrated text slide should look ≈ identical (or better — chapter breaks now sit on a black background by default; if the author wanted an image background that was previously impossible, this is the moment to add one).

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx
git commit -m "refactor(deck): migrate UFT PT text slides to type: slide + markdown"
```

### Task 11: Migrate the remaining decks — `type: title` and `type: text`

**Files:**
- Modify: `src/content/teaching/de/digital-futures-2026/deck.mdx`
- Modify: `src/content/teaching/en/digital-futures-2026/deck.mdx`
- Modify: `src/content/teaching/pt/digital-futures-2026/deck.mdx`
- Modify (any other decks discovered in Task 8)

- [ ] **Step 1: Repeat Tasks 9–10 for each deck**

For each deck file:
1. Add the `SlideMarkdown` import if missing.
2. Convert `type: title` slides per the Task 9 pattern.
3. Convert `type: text` slides per the Task 10 pattern.
4. Run `npm run check:decks` after each file.
5. Visually verify the deck.

- [ ] **Step 2: Commit per deck**

One commit per deck file:

```bash
git add src/content/teaching/de/digital-futures-2026/deck.mdx
git commit -m "refactor(deck): migrate Digital Futures DE title+text slides"

git add src/content/teaching/en/digital-futures-2026/deck.mdx
git commit -m "refactor(deck): migrate Digital Futures EN title+text slides"

git add src/content/teaching/pt/digital-futures-2026/deck.mdx
git commit -m "refactor(deck): migrate Digital Futures PT title+text slides"
```

- [ ] **Step 3: Confirm zero remaining `type: title` and `type: text` fences**

Run:

```bash
grep -rn "^type: title\|^type: text" src/content --include="deck.mdx"
```

Expected: no output. (If any remain, return to the per-deck task.)

(Phase 2 ship-point: zero `type: title` or `type: text` slides remain. Components TitleSlide.astro and TextSlide.astro still exist but are unreferenced.)

---

## Phase 3: Image-grid layout on `type: slide`

Goal: `type: slide` accepts an `images:` array (current `image-row` semantics) as the background layout. Foreground composition (text, slideImage, slideVideo, slideText) works the same as on regular slides.

### Task 12: Validator support for `images:` on `type: slide`

**Files:**
- Modify: `src/lib/vite-presentation-slides.ts:71-86` (KNOWN_FIELDS["slide"])
- Modify: `src/lib/vite-presentation-slides.ts:113-126` (KNOWN_FIELDS["image-row"])
- Modify: `src/lib/vite-presentation-slides.ts:592-662` (image-row validation block)
- Modify: `tests/unit/vite-presentation-slides.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `tests/unit/vite-presentation-slides.test.ts`:

```ts
describe("validateSlide — images: array on type: slide", () => {
  test("accepts images array on type: slide", () => {
    const errors = validateSlide(
      {
        type: "slide",
        images: [
          { src: "imgA", alt: "A" },
          { src: "imgB", alt: "B" },
        ],
      },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("accepts images array combined with text and overlay", () => {
    const errors = validateSlide(
      {
        type: "slide",
        images: [{ src: "a", alt: "A" }, { src: "b", alt: "B" }],
        overlay: "black/40",
        text: "## Caption",
      },
      ctx,
    );
    assert.deepEqual(errors, []);
  });

  test("rejects empty images array", () => {
    const errors = validateSlide(
      { type: "slide", images: [] },
      ctx,
    );
    assert.ok(errors.some((e) => e.message.includes("at least one")));
  });
});
```

- [ ] **Step 2: Run; verify failures**

Run: `npm run test:unit -- tests/unit/vite-presentation-slides.test.ts`

Expected: the three new tests FAIL.

- [ ] **Step 3: Add `images` and `gap` to `KNOWN_FIELDS["slide"]`**

```ts
slide: new Set([
  "type", "title", "subtitle", "image", "imageAlt", "imagePosition",
  "darkText", "copyright", "fit", "overlay", "notes",
  "slideImage", "slideVideo", "slideText", "text",
  "images", "gap", // NEW: image-grid background
]),
```

- [ ] **Step 4: Generalize the image-row validation block**

The current image-row validation (lines ~592–662) is gated by `type === "image-row"`. Extract the inner array-validation logic into a helper `validateImagesArray(value, push)` and call it from BOTH `type === "slide"` (when `images` is set) and `type === "image-row"`. The helper handles: array shape, length 1–4, per-item `src`/`alt`/`copyright`, and the `allowedImageKeys` typo check.

- [ ] **Step 5: Run tests; verify all pass**

Run: `npm run test:unit && npm run check:decks`

Expected: all unit tests pass; `OK: 182 slides`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/vite-presentation-slides.ts tests/unit/vite-presentation-slides.test.ts
git commit -m "feat(slides): accept images: grid on type: slide"
```

### Task 13: Render `images:` grid in `Slide.astro`

**Files:**
- Modify: `src/components/slides/Slide.astro`

- [ ] **Step 1: Add `images:` and `gap:` props**

Edit `src/components/slides/Slide.astro` to accept the new props. Render the grid as the background when `images` is set; render the single-image background otherwise. Reuse the cell wrapper + `Credit` pill pattern from `SlideImageRow.astro` for per-cell copyrights.

Code (key additions):

```astro
---
import { Image } from "astro:assets";
import { type CreditLine } from "@/components/Credit.astro";
import Credit from "@/components/Credit.astro";
import SlideChrome from "./SlideChrome.astro";

interface ImageItem {
  src: ImageMetadata | string;
  alt?: string;
  copyright?: CreditLine | CreditLine[];
}

interface Props {
  title?: string;
  subtitle?: string;
  image?: ImageMetadata | string;
  images?: ImageItem[];
  imageAlt?: string;
  imagePosition?: string;
  darkText?: boolean;
  copyright?: CreditLine | CreditLine[];
  fit?: "cover" | "contain";
  gap?: "none" | "sm" | "md" | "lg";
}

const {
  title, subtitle, image, images, imageAlt = "", imagePosition = "center",
  darkText = false, copyright, fit = "cover", gap = "sm",
} = Astro.props;

const fitClass = fit === "contain" ? "object-contain" : "object-cover";
const gapClass = gap === "none" ? "gap-0" : gap === "lg" ? "gap-6" : gap === "md" ? "gap-4" : "gap-1";
const gridColsClass = images && images.length >= 4 ? "grid-cols-4"
  : images && images.length === 3 ? "grid-cols-3" : "grid-cols-2";

const isStringImage = typeof image === "string";
---

<section data-slide class="slide relative h-svh w-full overflow-hidden bg-black text-zinc-100">
  {/* Background: single image OR grid OR neither (black bg) */}
  {image && !images && (isStringImage ? (
    <img src={image as string} alt={imageAlt} loading="eager" decoding="async"
      class={`absolute inset-0 h-full w-full ${fitClass}`}
      style={`object-position: ${imagePosition};`} />
  ) : (
    <Image src={image as ImageMetadata} alt={imageAlt} loading="eager" decoding="async"
      class={`absolute inset-0 h-full w-full ${fitClass}`}
      style={`object-position: ${imagePosition};`} />
  ))}

  {images && (
    <div class={`absolute inset-0 grid ${gridColsClass} ${gapClass} p-2`}>
      {images.map((img) => (
        <div class="relative h-full w-full overflow-hidden">
          {typeof img.src === "string" ? (
            <img src={img.src as string} alt={img.alt ?? ""} loading="eager" decoding="async"
              class={`absolute inset-0 h-full w-full ${fitClass}`} />
          ) : (
            <Image src={img.src as ImageMetadata} alt={img.alt ?? ""} loading="eager" decoding="async"
              class={`absolute inset-0 h-full w-full ${fitClass}`} />
          )}
          {img.copyright && <Credit credit={img.copyright} class="bottom-2 left-2" />}
        </div>
      ))}
    </div>
  )}

  <SlideChrome title={title} subtitle={subtitle} darkText={darkText} copyright={copyright} />
  <slot />
</section>
```

- [ ] **Step 2: Update YAML transformer to emit images array**

In `src/lib/vite-presentation-slides.ts`, the existing `emitImagesArray` and `extraAttrs` logic is currently gated by `componentName === "SlideImageRow"`. Extend it so when `componentName === "Slide"` AND `config.images` is set, the same emission applies. Drop `images` from the generic `attrs` loop by adding `"images"` to `specialFields` for `Slide` too:

```ts
if (componentName === "Slide" && Array.isArray(config.images)) {
  specialFields.add("images");
  extraAttrs += ` images={${emitImagesArray(config.images)}}`;
}
```

- [ ] **Step 3: Run validator + visual smoke test**

Run: `npm run check:decks`

Expected: passes.

Add a temporary demo fence to the UFT PT deck:

```yaml
---
type: slide
images:
  - src: spumellariaHaeckel
    alt: Spumellaria
  - src: spumellariaHaeckel
    alt: Spumellaria 2
overlay: black/50
text: |
  ## Demo grid + text overlay
---
```

Verify: 2-column grid background, dark overlay, text overlay on top. Then revert the demo fence.

- [ ] **Step 4: Commit**

```bash
git add src/components/slides/Slide.astro src/lib/vite-presentation-slides.ts
git commit -m "feat(slides): images: grid background on type: slide"
```

---

## Phase 4: Migrate `type: image-row` slides

Goal: every `type: image-row` slide becomes `type: slide` with `images:` array. The `SlideImageRow.astro` component remains until Phase 5.

### Task 14: Migrate `type: image-row` slides

**Files:**
- Modify: any `deck.mdx` files containing `type: image-row` (discover via `grep -rn "^type: image-row" src/content --include="deck.mdx"`)

- [ ] **Step 1: Inventory**

Run:

```bash
grep -rn "^type: image-row" src/content --include="deck.mdx"
```

- [ ] **Step 2: Convert each slide**

```yaml
# BEFORE
---
type: image-row
title: Studies
images:
  - src: a
    alt: A
  - src: b
    alt: B
gap: md
fit: contain
---

# AFTER (identical except for the type)
---
type: slide
title: Studies
images:
  - src: a
    alt: A
  - src: b
    alt: B
gap: md
fit: contain
---
```

- [ ] **Step 3: Validate and commit per deck**

Same pattern as Tasks 9–11.

- [ ] **Step 4: Confirm zero remaining `type: image-row` fences**

Run: `grep -rn "^type: image-row" src/content --include="deck.mdx"`

Expected: no output.

(Phase 4 ship-point: zero deck content references the deprecated types. Components TitleSlide, TextSlide, SlideImageRow exist but are dead code.)

---

## Phase 5: Remove deprecated types and components

### Task 15: Remove deprecated type validation

**Files:**
- Modify: `src/lib/vite-presentation-slides.ts` (multiple locations)
- Modify: `tests/unit/vite-presentation-slides.test.ts`

- [ ] **Step 1: Update tests to reflect the new world**

Edit `tests/unit/vite-presentation-slides.test.ts`. Update the "current behavior" tests:
- Remove the tests that assert `type: title`/`type: text`/`type: image-row` requirements.
- Add tests asserting these now ERROR with "Unknown slide type".
- Add a test asserting `subtext`, `size`, `case`, `variant` are no longer accepted (they were only valid on the removed types).

```ts
describe("validateSlide — deprecated types removed", () => {
  test("type: title is no longer accepted", () => {
    const errors = validateSlide({ type: "title", title: "x" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("Unknown slide type 'title'")));
  });

  test("type: text is no longer accepted", () => {
    const errors = validateSlide({ type: "text", text: "x" }, ctx);
    assert.ok(errors.some((e) => e.message.includes("Unknown slide type 'text'")));
  });

  test("type: image-row is no longer accepted", () => {
    const errors = validateSlide({ type: "image-row", images: [{ src: "a", alt: "A" }] }, ctx);
    assert.ok(errors.some((e) => e.message.includes("Unknown slide type 'image-row'")));
  });
});
```

- [ ] **Step 2: Run; verify failures**

Run: `npm run test:unit -- tests/unit/vite-presentation-slides.test.ts`

Expected: the three new tests FAIL (the types are still accepted).

- [ ] **Step 3: Remove deprecated types from validator**

In `src/lib/vite-presentation-slides.ts`:
- `SLIDE_TYPES`: remove `"title"`, `"text"`, `"image-row"`. Result: `["slide"]`. Consider whether `type:` field is still needed at all — if `slide` is the only type, the field becomes redundant. Recommendation: keep it as a no-op default for backwards compatibility in author muscle memory; the validator can warn but not error if `type: slide` is provided.
- `KNOWN_FIELDS`: keep only the `slide` entry.
- `REQUIRED_FIELDS`: keep only the `slide` entry (which has no required fields).
- `STRING_FIELDS_BY_TYPE` and `BOOLEAN_FIELDS_BY_TYPE`: keep only the `slide` entries.
- Remove the `"slideImage" / "slideVideo" rejection` checks tied to the removed types.
- Remove the `overlay` `type !== "slide" && type !== "title"` check (it's now always allowed).
- Remove the `slideImage`/`slideVideo`/`slideText` "only on type: slide" checks (still true, but `slide` is the only type left).
- Remove the `image-row`-specific images validation branch (Phase 3 already moved its core to `validateImagesArray`).

- [ ] **Step 4: Update transformer to emit `<Slide>` always**

In `src/lib/vite-presentation-slides.ts` `buildSlideJsx`:
- Remove the `componentName` switch.
- Always emit `<Slide>` (with whatever children apply).
- Drop the `emitOverlayJsx` for-`Slide` branch — `<Slide>` itself can render overlay from a top-level prop now (move overlay rendering into `Slide.astro` as a prop, mirroring the way `TitleSlide` already does it). This consolidates overlay logic in one place.

- [ ] **Step 5: Move overlay handling into `Slide.astro`**

Edit `src/components/slides/Slide.astro` to accept an `overlay?: string` prop and render the dimming layer at z-5 (mirroring the current `emitOverlayJsx` output). Remove the JSX-child overlay emission from the YAML plugin once this lands.

- [ ] **Step 6: Run all tests + deck validator**

Run: `npm run test:unit && npm run check:decks`

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/vite-presentation-slides.ts src/components/slides/Slide.astro tests/unit/vite-presentation-slides.test.ts
git commit -m "refactor(slides): remove deprecated types; unify on type: slide"
```

### Task 16: Delete deprecated components

**Files:**
- Delete: `src/components/slides/TitleSlide.astro`
- Delete: `src/components/slides/TextSlide.astro`
- Delete: `src/components/slides/SlideImageRow.astro`

- [ ] **Step 1: Confirm no deck imports them**

Run:

```bash
grep -rn "TitleSlide\|TextSlide\|SlideImageRow" src/content
```

Expected: no output.

- [ ] **Step 2: Remove the files**

```bash
git rm src/components/slides/TitleSlide.astro
git rm src/components/slides/TextSlide.astro
git rm src/components/slides/SlideImageRow.astro
```

- [ ] **Step 3: Search for stale imports in non-content code**

Run:

```bash
grep -rn "TitleSlide\|TextSlide\|SlideImageRow" src docs
```

Expected: only matches in `docs/slides/AUTHORING.md` (about to be rewritten in Task 17).

- [ ] **Step 4: Run build to confirm nothing references the deleted files**

Run: `npm run build`

Expected: completes without missing-import errors.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/slides/
git commit -m "chore(slides): delete deprecated TitleSlide, TextSlide, SlideImageRow"
```

### Task 17: Rewrite the authoring docs

**Files:**
- Modify: `docs/slides/AUTHORING.md`

- [ ] **Step 1: Rewrite for the unified model**

Replace the multi-type section with a single section on `type: slide` (or just the unified field set, since `type:` is now optional/no-op). Document:
- Background options: `image:`, `images:` (array for grid), `video:` (if added later), or none (black).
- Overlay: `overlay: "color/alpha"`.
- Chrome: `title:`, `subtitle:`, `copyright:`.
- Primary text: `text:` accepts the constrained markdown subset (h1, h2, h3, p, em/strong, blockquote, lists). Show example.
- Foreground composition: `slideImage:`, `slideVideo:`, `slideText:` for additional positioned content.
- Notes: `notes:`.
- Migration note: link to the git history for examples of the previous multi-type model.

- [ ] **Step 2: Verify links and examples**

Run: `npm run check:decks`

Expected: passes (the doc rewrite shouldn't affect the validator, but a final check confirms nothing broke).

- [ ] **Step 3: Commit**

```bash
git add docs/slides/AUTHORING.md
git commit -m "docs(slides): rewrite AUTHORING for the unified slide type"
```

### Task 18: Final verification + memory update

**Files:**
- (read-only) all decks
- Update auto-memory: `C:\Users\dan\.claude\projects\C--repos-daniellocatelli\memory\project_deck_authoring_pattern.md`

- [ ] **Step 1: Full validation pass**

Run: `npm run check:decks && npm run test:unit && npm run build`

Expected: all green.

- [ ] **Step 2: Update auto-memory entry for the deck pattern**

The existing memory `project_deck_authoring_pattern.md` describes the old multi-type pattern. Update it to reflect the unified `type: slide` model with markdown text. Keep the file path and slug; refresh the body. Update `MEMORY.md` only if the description changes meaningfully.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: complete migration to unified slide type"
```

(Phase 5 ship-point: one slide type, markdown-rendered text, image-grid background as an option, three deprecated components gone, docs updated, memory refreshed.)

---

## Self-Review

**Spec coverage:**
- Markdown text rendering: Tasks 1–3 (helper, tests, component).
- `type: slide` accepts text: markdown: Tasks 5–6.
- `type: text`/`type: title` migration: Tasks 9–11.
- Image-row → `images:` on slide: Tasks 12–13.
- `type: image-row` migration: Task 14.
- Removal of deprecated types/components: Tasks 15–16.
- Docs rewrite: Task 17.

**Placeholders scan:** No "TBD"/"add appropriate"/"similar to". One area flagged for the executor: Task 9's example covers `author`/`subtitle` mapping; if migration uncovers a `type: title` slide with a field combination not in that example, the executor exercises judgment using the same principles (h1 = main title, body paragraphs = subordinate text). This is intentional — pre-enumerating every per-deck variation would bloat the plan.

**Type consistency:** `renderSlideMarkdown(input: string): string` (Task 1), used as `set:html={html}` in `SlideMarkdown.astro` (Task 3). The `SlideMarkdown` component takes `text: string` (Task 3), emitted by the YAML plugin as `<SlideMarkdown text={JSON.stringify(text)} />` (Task 6). `validateImagesArray` is referenced in Tasks 12 and 15 — Task 12 creates it (Step 4), Task 15 reuses it after removing the image-row branch.

**Phase boundaries are real ship points:**
- Phase 1: capability added; no decks change. Safe to merge alone.
- Phase 2: deck content migrated to new shape; deprecated types still work. Safe to merge alone.
- Phase 3: another capability added; no decks change. Safe to merge alone.
- Phase 4: image-row decks migrated. Safe to merge alone.
- Phase 5: dead code removed. Requires Phases 2 and 4 complete.

---

## Open questions for the user before execution

1. **`type:` field future**: After Phase 5, should `type:` be removed entirely (no field at all), kept as a no-op default (`type: slide` accepted but useless), or kept as a forward-looking discriminator for future layout variants (e.g., a future `type: split-screen`)? The plan currently keeps it as no-op default — easy to change if you want it gone.
2. **Markdown library**: `marked` is small and proven. Alternative is the `unified`/`remark` ecosystem (already partly installed via `remark-gfm`). Trade-off: `marked` is one dep with a simple API; `unified` is more deps but consistent with the rest of the project's markdown tooling. Plan chose `marked` for simplicity.
3. **Visual identity divergence during Phase 2**: Some currently-`type: title` slides have decorative defaults (the auto-gradient overlay if no explicit `overlay:` is set). The new `text:` rendering does not auto-add a gradient. The plan migrates by explicitly setting `overlay: black/N` per slide. If you'd rather the new system auto-add a gradient when an h1 sits on a background image, flag it — Task 3's CSS or Task 13's `Slide.astro` can carry that default.
