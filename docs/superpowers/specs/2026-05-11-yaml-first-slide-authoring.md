# YAML-first slide authoring for LLM co-creation

## Problem

Decks in `src/content/teaching/<locale>/<slug>/deck.mdx` currently support two authoring surfaces:

1. **YAML fences** — flat key/value blocks rewritten to `<Slide>` / `<TitleSlide>` / `<TextSlide>` JSX by the `presentation-slides` Vite plugin (`src/lib/vite-presentation-slides.ts`).
2. **JSX** — `<Slide>`, `<SlideImage>`, `<SlideVideo>`, `<SlideImageRow>`, plus arbitrary nested children for overlays and compositions.

The mix is intentional but has two gaps for LLM-driven authoring:

- **Coverage gap**: positioned `<SlideImage>` / `<SlideVideo>` calls and every `<SlideImageRow>` must currently be JSX. A multi-locale deck of ~100 slides ends up ~50% JSX, which is 3-5× the token count of the YAML equivalent. Whole-deck reasoning by an LLM is much harder when half the slides bloat the context.
- **Safety gap**: the YAML plugin emits unknown keys as JSX attributes verbatim, with no validation. An LLM typo (`widht: 50%`) produces a silent passthrough or an error two layers removed from the source. There is no fast standalone check; errors only surface during `astro check && astro build`.

## Goals

1. Every slide *shape* in the existing deck (single positioned image, single positioned video, image row, title, text, image+overlay text) is expressible as YAML.
2. The plugin validates YAML at build time with slide-scoped, "did you mean..." error messages.
3. A standalone `npm run check:decks` script runs the validator without spinning up Astro, completing in under one second on the full content tree.
4. A single authoring doc (`docs/slides/AUTHORING.md`) acts as the schema the LLM grounds on at session start.

## Non-goals

- Expressing overlays, gradients-on-image, or mixed text+image compositions as YAML. These stay in JSX as the deliberate escape hatch.
- Replacing the JSX surface. Both coexist; YAML is the default for new content, JSX is reserved for composition.
- JS expression interpolation in YAML values (no `${VIDEO_BASE}/media1.mp4`). Workaround: inline the literal path; one source of truth, easier for an LLM to grep.
- Auto-generation of the schema doc from TS types. Hand-maintained, reviewed in PRs. The doc is the LLM's contract, not a derived artifact.

## Design overview

Two YAML mechanisms, two distinct jobs:

| Mechanism | Purpose | Examples |
| --- | --- | --- |
| `type: <name>` (top-level field) | Selects the **whole slide component** | `type: title`, `type: text`, `type: image-row`, default `slide` |
| Nested child blocks (`slideImage:`, `slideVideo:`) | Describe **foreground children** inside a `type: slide` | Positioned image, positioned video |

Disambiguation for the `image:` field (preserves backwards compatibility with every existing YAML fence):

| YAML | Emitted JSX | Visual role |
| --- | --- | --- |
| `image: cover` (top-level) | `<Slide image={cover}>` | Background of the slide (full-bleed) |
| `slideImage: { src: cover }` (nested) | `<Slide><SlideImage src={cover} .../></Slide>` | Foreground (positioned content) |
| Both present | `<Slide image={bg}><SlideImage src={fg} .../></Slide>` | Background + foreground both rendered |

## Type tag reference

### `type: slide` (default)

Generic slide. Accepts optional background image, title/subtitle chrome, copyright, notes, and nested foreground children (`slideImage:` / `slideVideo:`).

```yaml
---
# type: slide                # default; can be omitted
title: string?
subtitle: string?
image: <binding|url>?        # background image
imageAlt: string?            # required if image is set
copyright: string | string[] | undefined
fit: "contain" | "cover"?    # background fit, defaults per component
notes: string?               # emitted as <SlideNotes>{notes}</SlideNotes> child
slideImage: { ... }?         # see nested-block spec below
slideVideo: { ... }?         # see nested-block spec below
---
```

### `type: title`

Title slide. Accepts no foreground children; `notes:` is rejected.

```yaml
---
type: title
title: string
subtitle: string?
author: string?
institution: string?
image: <binding|url>?
imageAlt: string?
---
```

### `type: text`

Text slide. Accepts no foreground children; `notes:` is rejected.

```yaml
---
type: text
text: string
subtext: string?
size: "sm" | "md" | "lg" | "xl"?
---
```

### `type: image-row` (new)

Grid of 2-4 images with optional shared title/subtitle/copyright. Replaces `<SlideImageRow>` JSX entirely.

```yaml
---
type: image-row
title: string?
subtitle: string?
darkText: boolean?
copyright: string | string[]?
gap: "none" | "sm" | "md" | "lg"?    # defaults to "sm"
fit: "cover" | "contain"?            # defaults to "contain"
images:
  - src: <binding|binding.src|url>   # required, binding-aware per item
    alt: string                       # required for a11y
  - src: ...
    alt: ...
---
```

Validation:
- `images:` is required and must be a non-empty array (component supports 2-4 columns; warn on 1, error on >4).
- Each item must have both `src` and `alt`. Missing `alt` is a hard error.
- `notes:`, `slideImage:`, `slideVideo:` are all rejected (component does not accept children).

Emits:

```jsx
<SlideImageRow
  title="..."
  subtitle="..."
  images={[
    { src: img24, alt: "..." },
    { src: img25, alt: "..." },
  ]}
/>
```

## Nested child blocks (inside `type: slide`)

### `slideImage:`

Single foreground image (or animated GIF) positioned inside the slide canvas. Maps 1:1 to `<SlideImage>` props.

```yaml
slideImage:
  src: <binding|binding.src|url>   # required; binding-aware
  alt: string                       # required for a11y
  width: string?                    # CSS length, e.g. "50%" (quoted), "320px"
  height: string?                   # CSS length
  align: Align?                     # "center" (default) | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  x: string?                        # CSS length, center-anchor override
  y: string?                        # CSS length, center-anchor override
  class: string?                    # extra Tailwind classes
```

### `slideVideo:`

Single foreground video positioned inside the slide canvas. Maps 1:1 to `<SlideVideo>` props.

```yaml
slideVideo:
  src: <url>                        # required; URL only (no binding — videos live under /public)
  type: string?                     # MIME, defaults to "video/mp4"
  poster: string?
  loop: boolean?                    # defaults true
  autoplay: boolean?                # defaults true
  muted: boolean?                   # defaults true
  controls: boolean?                # defaults false
  playsinline: boolean?             # defaults true
  preload: "none" | "metadata" | "auto"?
  fit: "contain" | "cover"?         # defaults "contain"
  blur: boolean?                    # defaults true when fit === "contain"
  width: string?
  height: string?
  align: Align?
  x: string?
  y: string?
  class: string?
```

### Multiple foreground children

Both `slideImage:` and `slideVideo:` may appear on the same slide; they emit as sibling children inside `<Slide>`. The plugin does **not** support multiple `slideImage:` entries on one slide — if a slide needs two foreground images, drop to JSX.

### Render order of children

Foreground children render in this order inside `<Slide>`:
1. `<SlideImage>` (if `slideImage:` set)
2. `<SlideVideo>` (if `slideVideo:` set)
3. `<SlideNotes>` (if `notes:` set)

This matches the convention in hand-written JSX (visible content before notes) and produces predictable z-stacking on top of any background `image:`.

## Plugin emission rules

Generalizes `src/lib/vite-presentation-slides.ts`:

1. Compute component name from `type` (`slide` → `Slide`, `title` → `TitleSlide`, `text` → `TextSlide`, `image-row` → `SlideImageRow`).
2. Extract reserved keys from the parsed object: `notes`, `slideImage`, `slideVideo`. The remaining keys become outer-component attributes via `emitAttr`.
3. Build children list (only relevant for `type: slide`):
   - `<SlideImage ... />` if `slideImage` set
   - `<SlideVideo ... />` if `slideVideo` set
   - `<SlideNotes>{notes}</SlideNotes>` if `notes` set
4. If children list non-empty, emit `<Slide ...>{children}</Slide>`; else self-closing.
5. Per-block binding fields (replace the module-level `BINDING_FIELDS` constant):

   ```ts
   const BINDING_FIELDS_BY_CONTEXT = {
     slide: new Set(["image"]),
     "title-slide": new Set(["image"]),
     "image-row-item": new Set(["src"]),
     "slide-image": new Set(["src"]),
     "slide-video": new Set([]),         // videos are URLs only
   };
   ```

6. Array-of-objects emission (new helper for `images:` in `image-row`):

   ```ts
   function emitImageItems(items: unknown[]): string {
     const parts = items.map(item => {
       const { src, alt } = item as Record<string, unknown>;
       const srcExpr = emitValue(src, BINDING_FIELDS_BY_CONTEXT["image-row-item"], "src");
       const altExpr = JSON.stringify(String(alt));
       return `{ src: ${srcExpr}, alt: ${altExpr} }`;
     });
     return `[${parts.join(", ")}]`;
   }
   ```

7. Unknown keys inside a nested block pass through to JSX attributes (forward-compatible with future component props). Unknown keys at the **top level** are an error — see validator.

## Validator design

Lives inside the same plugin module, exported as a pure function so the `check:decks` script can reuse it without invoking Vite.

```ts
export interface SlideValidationError {
  file: string;
  line: number;       // 1-indexed, position of the opening `---`
  message: string;
}

export function validateSlide(
  config: Record<string, unknown>,
  context: { file: string; line: number }
): SlideValidationError[];
```

### Rules

| Check | Behavior |
| --- | --- |
| Unknown top-level key | Error. Suggest closest valid key via Levenshtein distance ≤ 2 ("did you mean 'width'?"). |
| Unknown key in a nested block | Pass through (forward-compat). |
| Missing required field (e.g. `images:` for `type: image-row`, `src:` in `slideImage:`) | Error. |
| `imageAlt:` missing when `image:` is set | Error (a11y). |
| `alt:` missing in any `images[]` item | Error (a11y). |
| `notes:` set on `type: title` / `type: text` / `type: image-row` | Error (component doesn't accept children). |
| `slideImage:` or `slideVideo:` set on `type: title` / `type: text` / `type: image-row` | Error. |
| Number where string expected (`width: 50` instead of `width: "50%"`) | Error. Suggest quoting. |
| Invalid enum value (e.g. `align: middle`) | Error. List valid values. |
| `images:` array length 0 or >4 | Error. |
| `images:` array length 1 | Warning (component is designed for 2-4). |

### Error format

Always include the file, the slide's starting line, and an actionable message:

```
src/content/teaching/pt/computational-architecture-in-germany-uft/deck.mdx:161
  Slide (type: slide): unknown field 'widht'. Did you mean 'width'?
```

## `npm run check:decks` script

Standalone Node script at `scripts/check-decks.ts`. Glob all `src/content/**/deck.mdx`, run the YAML extraction + `validateSlide` pass, print errors, exit 1 on any error. Does **not** invoke Astro, MDX, or `astro check`; pure YAML + schema validation.

Target runtime: under one second on the full content tree.

`package.json` entry:

```json
{
  "scripts": {
    "check:decks": "tsx scripts/check-decks.ts"
  }
}
```

Optional follow-up (out of scope for v1): wire `check:decks` into a pre-commit hook or CI step. For v1, manual invocation between LLM authoring turns is sufficient.

## `docs/slides/AUTHORING.md` outline

The LLM-facing schema doc. Keep it under ~300 lines so it fits comfortably in a context window alongside actual deck content.

1. **One-paragraph mental model**: "Decks are MDX files. Each slide is either a YAML fence (preferred) or a `<Slide>` JSX block (escape hatch). Use YAML unless the slide needs overlays or composition."
2. **Type tag table** (replicates the table above).
3. **Field reference per type** (one section per type; field tables with type, required/optional, default, valid values).
4. **Disambiguation rule**: when to use top-level `image:` vs nested `slideImage:`.
5. **Six exemplar slides**: title slide, text slide, image+overlay text (JSX), positioned image (YAML), positioned video (YAML), image row (YAML). Each with source + brief explanation.
6. **When to drop to JSX**: bulleted list of composition cases. Cross-reference the existing `_demo/deck.mdx`.
7. **Common pitfalls**: quoting percentages, bare-identifier vs `.src` for GIFs, no template literals in YAML.

`CLAUDE.md` gets a one-line pointer to this doc under a new "Slide authoring" subsection, so an LLM session picks it up at start.

## Implementation order

Build in this order so each step is independently shippable:

1. **`docs/slides/AUTHORING.md`** — written against current behavior (no `slideImage:`/`slideVideo:`/`image-row` yet). Captures the existing surface and the disambiguation rule. Zero code risk.
2. **Validator + `check:decks` script** — validates only what exists today. Catches typos and unknown keys in current decks immediately. Zero behavior change for valid input.
3. **`type: image-row`** — array-of-objects emission. Migrate the three existing `<SlideImageRow>` calls in `pt/computational-architecture-in-germany-uft/deck.mdx` as the canary.
4. **`slideImage:` nested block** — migrate the two positioned `<SlideImage>` calls in the same deck.
5. **`slideVideo:` nested block** — migrate the three remaining positioned `<SlideVideo>` calls (now `<SlideImage>` after the recent GIF swap, so this step may have fewer real targets; verify before implementing).
6. **`AUTHORING.md` updates** — document the new shapes added in steps 3-5.

Each step ends with a passing `npm run check:decks` and `npm run build`.

## Migration

Zero forced migration. The plugin changes are purely additive — every existing YAML fence and every existing JSX slide keep emitting identical code. Authors migrate hot spots opportunistically. The three locales of `digital-futures-2026` and `computational-architecture-in-germany-uft` are the natural first candidates because they have the most positioned-asset slides.

Migration parity is verified by build + visual diff per deck. Visual diff for v1 is manual (open `astro dev`, scroll the deck before/after). Automated visual regression is out of scope.

## Out of scope (future work)

- **`slideImageRow:` as a nested block** (multiple rows on one slide). The current `<SlideImageRow>` replaces the entire `<Slide>`, so this would be a meaningful component change, not a plugin change.
- **Auto-generated schema from TS types**. The hand-maintained `AUTHORING.md` is the source of truth for v1.
- **Presenter-mode YAML hints** (per-slide timing, transitions). Outside the LLM-authoring scope.
- **Pre-commit / CI integration of `check:decks`**. Add when the validator has been used in anger for a deck or two.
