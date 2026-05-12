# Slide authoring guide

Decks live at `src/content/teaching/<locale>/<slug>/deck.mdx`. Each slide is either a **YAML fence** (preferred for ~80% of slides) or a **JSX block** using the components in `src/components/slides/` (escape hatch for overlays and composition). Both surfaces coexist in the same file and produce the same runtime output.

Use YAML by default. Drop to JSX only when the slide needs overlays, multiple positioned children, or hand-crafted layouts.

## How the plugin works

`src/lib/vite-presentation-slides.ts` is a Vite `transform` plugin (enforced `pre`) that pre-processes `*/deck.mdx` files before MDX parses them. It walks every `---\n...\n---` fence in the file body, parses the YAML, and rewrites it to JSX:

- The **first** fence at the top of the file is the deck-level Astro frontmatter (`Name`, `Description`, `DateStart`, `Event`, `Language`). The plugin leaves it alone.
- Every **subsequent** fence is a slide. The plugin emits a self-closing JSX element (or with one child if `notes:` is set).
- If a fence fails to parse as YAML or yields a non-object, the plugin leaves it untouched. So invalid YAML degrades gracefully.

The plugin only transforms files matching `*/deck.mdx`. Other MDX files in the project are unaffected.

## File structure

Every `deck.mdx` follows this skeleton:

```mdx
---
Name: "Display name shown on the teaching page"
Description: "Short description for cards and search"
DateStart: "YYYY-MM-DD"
Event: Event name
Language: Português | English | Deutsch
---

import TitleSlide from "@/components/slides/TitleSlide.astro";
import Slide from "@/components/slides/Slide.astro";
import TextSlide from "@/components/slides/TextSlide.astro";
import SlideNotes from "@/components/slides/SlideNotes.astro";
import SlideImage from "@/components/slides/SlideImage.astro";
import SlideVideo from "@/components/slides/SlideVideo.astro";
import SlideImageRow from "@/components/slides/SlideImageRow.astro";
// Required-imports rule: the YAML plugin emits JSX that references whichever
// components your fences use. `type: title` needs `TitleSlide`; `type: text`
// needs `TextSlide`; `type: image-row` needs `SlideImageRow`; any `slide`
// fence emits `<Slide>` and (if `notes:` is set) `<SlideNotes>`; any
// `slideImage:` block needs `SlideImage`; any `slideVideo:` block needs
// `SlideVideo`. Keep the full set imported; an unused import is cheap, but
// a missing one makes MDX silently render the deck as an empty <main>.

import cover from "@/assets/content/teaching/<slug>/<image>.jpg";
// ...more asset imports

---
type: title
title: Deck title
subtitle: Optional subtitle
author: Daniel Locatelli
institution: Event / institution
---

---
title: Some slide
subtitle: Some subtitle
image: cover
imageAlt: Description for screen readers
---

<Slide>
  {/* JSX escape hatch for composed slides */}
</Slide>
```

A leading underscore on the slug folder (e.g. `src/content/teaching/en/_demo/`) excludes the deck from routing. Use this for fixtures or in-progress drafts.

## YAML slide types

### `type: slide` (default)

The general-purpose slide. Background image with title/subtitle/copyright chrome.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `type` | `"slide"` | no | `"slide"` | Can be omitted |
| `title` | string | no | | Top-left chrome |
| `subtitle` | string | no | | Top-left chrome, below title |
| `image` | binding or URL | no | | Background image; bare identifier resolves to a JS import binding |
| `imageAlt` | string | required if `image` set | | Screen-reader text |
| `imagePosition` | string | no | `"center"` | CSS `object-position` value |
| `darkText` | boolean | no | `false` | Use zinc-950 chrome text for light backgrounds |
| `copyright` | string or string[] | no | | Bottom-right credit |
| `fit` | `"cover"` or `"contain"` | no | `"cover"` | Background `object-fit` |
| `overlay` | string `"<color>/<alpha>"` | no | | Full-bleed darkening/lightening overlay at `z-5`. Color is `"black"` or `"white"`; alpha is 0-100. Example: `"black/50"`. Emitted as inline `rgba()` so Tailwind's content scanner is not involved. |
| `notes` | string | no | | Emitted as `<SlideNotes>` child |

`notes:` is supported on every slide type. `<SlideNotes>` renders as a `position: fixed` overlay, so it doesn't compete with the slide's centered content.

### `type: title`

Title/intro slide. Centered chrome over an optional background.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `type` | `"title"` | yes | | |
| `title` | string | yes | | Centered hero text |
| `subtitle` | string | no | | Centered, italic |
| `author` | string | no | | Below title block |
| `institution` | string | no | | Below author |
| `image` | binding or URL | no | | Background image |
| `imageAlt` | string | required if `image` set | | |
| `imagePosition` | string | no | `"center"` | |
| `darkText` | boolean | no | `false` | |
| `fit` | `"cover"` or `"contain"` | no | `"cover"` | |
| `notes` | string | no | | Emitted as `<SlideNotes>` overlay |

### `type: text`

Centered text-only slide. Used for chapter dividers and pull quotes.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `type` | `"text"` | yes | | |
| `text` | string | yes | | Main centered text |
| `subtext` | string | no | | Smaller secondary line |
| `size` | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | no | `"lg"` | Main text size |
| `case` | `"upper"` \| `"normal"` | no | `"normal"` | `"upper"` applies `text-transform: uppercase` and wider letter-spacing (calibrated for all-caps) |
| `notes` | string | no | | Emitted as `<SlideNotes>` overlay |

### `type: image-row`

Whole-slide grid of 2-4 images with optional shared title/subtitle/copyright. Replaces a `<SlideImageRow>` JSX call.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `type` | `"image-row"` | yes | | |
| `title` | string | no | | Top-left chrome |
| `subtitle` | string | no | | Top-left chrome, below title |
| `darkText` | boolean | no | `false` | Use zinc-950 chrome text for light backgrounds |
| `copyright` | string or string[] | no | | Bottom-right credit |
| `gap` | `"none"` \| `"sm"` \| `"md"` \| `"lg"` | no | `"sm"` | Spacing between images |
| `fit` | `"cover"` or `"contain"` | no | `"contain"` | Image `object-fit` |
| `images` | array | yes | | 2-4 items; each item is `{ src, alt }` |
| `notes` | string | no | | Emitted as `<SlideNotes>` overlay |

Each item in `images` accepts:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `src` | binding or URL | yes | Bare identifier resolves to a JS import binding; URL-shaped strings stay literal |
| `alt` | string | yes | Required for accessibility |
| `copyright` | string or string[] | no | Per-image credit, rendered as a frosted-pill at the cell's bottom-left corner (kept off the right side so it doesn't collide with the slide progress indicator). |

Example:

```yaml
---
type: image-row
title: Models ByNature
subtitle: Workshop, registros
images:
  - src: img24
    alt: Models ByNature workshop, registro 1
  - src: img25
    alt: Models ByNature workshop, registro 2
  - src: img26
    alt: Models ByNature workshop, registro 3
---
```

If you need 5 or more images, multiple rows, or per-image positioning, drop to JSX.

## Nested child blocks (inside `type: slide`)

A `type: slide` fence can carry a foreground image (`slideImage:`) and/or a foreground video (`slideVideo:`) as nested blocks. The plugin emits each nested block as a child of `<Slide>`. Combined with the top-level `image:` (background) and `notes:`, one fence can describe a slide with a background image, a positioned foreground asset, and presenter notes in a single declarative block.

### `slideImage:`

Single foreground image (or animated GIF) positioned inside the slide canvas. Maps 1:1 to `<SlideImage>` props.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `src` | binding or URL | yes | Bare identifier resolves to a JS import binding; URL-shaped strings stay literal. Use `gif.src` (the `.src` accessor) to preserve GIF animation by routing through the raw `<img>` path. |
| `alt` | string | yes | Required for accessibility |
| `width` | string | no | CSS length, e.g. `"50%"` (quoted), `"320px"`. Omit one of width/height to let the intrinsic aspect ratio drive the other. |
| `height` | string | no | CSS length |
| `align` | enum | no | `"center"` (default), `"top"`, `"bottom"`, `"left"`, `"right"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`. Ignored if `x` or `y` set. |
| `x` | string | no | CSS length, center-anchor override |
| `y` | string | no | CSS length, center-anchor override |
| `class` | string | no | Extra Tailwind classes |

Example:

```yaml
---
title: Pavilhão O3
subtitle: Form finding dos domos
slideImage:
  src: o3FormFinding.src
  alt: Animação do form finding com Kangaroo, forçando as células a serem planas
  width: "40%"
  y: "52%"
notes: Usamos o Grasshopper para o form finding dos domos.
---
```

`slideImage:` is only valid on `type: slide`. The validator rejects it on title/text/image-row slides.

Unknown fields inside the `slideImage` block pass through to JSX attributes (forward-compatible with future component props); TypeScript catches typos at build time via `astro check`.

### `slideVideo:`

Single foreground video positioned inside the slide canvas. Maps 1:1 to `<SlideVideo>` props. When no positioning props are supplied, fills the parent slide (full-bleed) — the same fallback as the JSX form.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `src` | URL string | yes | | Path to the video; not binding-aware (videos live under `/public`, not as JS imports). |
| `type` | string | no | `"video/mp4"` | MIME type |
| `poster` | string | no | | Poster image URL |
| `loop` | boolean | no | `true` | |
| `autoplay` | boolean | no | `true` | |
| `muted` | boolean | no | `true` | |
| `controls` | boolean | no | `false` | |
| `playsinline` | boolean | no | `true` | |
| `preload` | `"none"` \| `"metadata"` \| `"auto"` | no | `"auto"` | |
| `fit` | `"cover"` \| `"contain"` | no | `"contain"` | |
| `blur` | boolean | no | `true` if `fit: contain` else `false` | Scaled-up blurred clone to fill letterbox space |
| `width` | string | no | | CSS length; omit for full-bleed |
| `height` | string | no | | CSS length |
| `align` | enum | no | `"center"` | Same 9 values as `slideImage.align`; ignored if `x` or `y` set |
| `x` | string | no | | CSS length, center-anchor override |
| `y` | string | no | | CSS length, center-anchor override |
| `class` | string | no | | Extra Tailwind classes |

Examples:

```yaml
---
title: Models ByNature Workshop
subtitle: São Paulo, 2019
slideVideo:
  src: /presentations/digital-futures-2026/models-bynature-workshop-1.5x.mp4
---
```

```yaml
---
title: TFG FAUUSP
subtitle: Artigo IASS 2017
slideVideo:
  src: /presentations/computational-architecture-in-germany-uft/media9.mp4
  y: "55.43%"
  width: "100%"
  height: "50.03%"
  blur: false
---
```

`slideVideo:` is only valid on `type: slide`. The validator rejects it on title/text/image-row slides.

### `slideText:`

Foreground text overlay rendered on top of the background image (and overlay, if set). Used for centered titles, multi-line stacks, and quote+attribution patterns over an image. Maps 1:1 to `<SlideText>` props.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `text` | string | yes | | Main text. Use a `\|` or `\|+` block scalar for multi-line stacks; each line renders as its own `<p>` in a flex column with `gap` spacing. |
| `subtext` | string | no | | Smaller secondary line. Rendered as italic Poppins below the title (variant: title) or as bold uppercase Montserrat attribution (variant: quote). |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | no | `"md"` | Main text size tier. |
| `case` | `"upper" \| "normal"` | no | `"upper"` | Applies `text-transform: uppercase` + wider letter-spacing to the title variant. Quote variant ignores this (always normal case). |
| `variant` | `"title" \| "quote"` | no | `"title"` | `"title"` is bold Montserrat. `"quote"` is light italic Poppins, with a bold-uppercase attribution below if `subtext` is set. |
| `gap` | `"sm" \| "md" \| "lg" \| "xl"` | no | `"lg"` | Vertical gap between lines when `text` is multi-line. Maps to `gap-4/8/12/16`. |

Example (centered title over a dark-overlaid background):

```yaml
---
image: nasaBillIngalls
imageAlt: NASA / Bill Ingalls
overlay: black/50
slideText:
  text: Computação Material
  size: lg
---
```

Example (multi-line stack with arrows):

```yaml
---
image: nasaBillIngalls
imageAlt: NASA / Bill Ingalls
overlay: black/50
slideText:
  text: |
    Reproduzir Formas
    ↓
    Reproduzir Processos
    ↓
    Reproduzir Ecossistemas
---
```

Example (quote with attribution):

```yaml
---
image: bucky
imageAlt: Buckminster Fuller
overlay: black/60
slideText:
  text: |-
    "Don't fight forces, use them!"
  subtext: Buckminster Fuller
  variant: quote
---
```

`slideText:` is only valid on `type: slide`. For per-line opacity / build-reveal patterns within a stack, stay in JSX.

Both `slideImage:`, `slideVideo:`, and `slideText:` may appear on the same slide; they emit as sibling children inside `<Slide>` in this order: `<SlideImage>`, `<SlideVideo>`, `<SlideText>`, `<SlideNotes>` (when `notes:` is set). The `slideText:` block lives at `z-10`, above the optional `overlay:` (`z-5`) and the background image.

## Field value rules

### Bare identifier vs string

The plugin treats values differently based on the field and the value shape:

- The **`image:`** field is *binding-aware*. A bare identifier like `cover` or a dotted member access like `coverImage.src` is emitted as a JavaScript expression that references the corresponding `import` at the top of the file. URL-shaped strings (anything starting with `/`, `./`, `../`, `https://`, `http://`, `data:`, `blob:`) are emitted as string literals.
- **All other string fields** are emitted as JSON-stringified string literals. Bare identifiers in those fields would be emitted as `"identifier"`, not as a binding reference.
- Booleans and numbers emit as JSX expression values (`{true}`, `{42}`).

Practical implication: to use a GIF imported as `import gif from "@/assets/.../animation.gif"`, pass `image: gif.src` (the `.src` accessor returns the URL string and bypasses Astro's `<Image>` GIF processing). This preserves animation.

### Quoting CSS lengths

YAML parses `50%` as a string but parses `50` as a number. Always quote percentages and unit-bearing values:

```yaml
# good
width: "50%"
height: "320px"

# bad: parses as the number 50 and JSX emits width={50}
width: 50
```

### No JS expressions in YAML

YAML values are plain data. You cannot write `${VIDEO_BASE}/media1.mp4` in YAML; the template literal is JSX-only. Workaround: inline the full URL string.

## JSX components (escape hatch)

Reach for JSX when:

- The slide has **overlays** (dark gradients, semi-transparent layers over an image).
- The slide has **multiple positioned children** (two images side by side, or image + custom text).
- The slide has **custom typography or layout** that doesn't map to the title/subtitle chrome.
- The slide composes other slides (see `<Slide>` examples below).

When you drop to JSX, you use the same `<Slide>` / `<TitleSlide>` / `<TextSlide>` outer container plus optional children. The plugin leaves JSX blocks untouched, so JSX and YAML fences interleave freely in the same file.

### `<Slide>`

```tsx
interface Props {
  title?: string;
  subtitle?: string;
  image?: ImageMetadata | string;
  imageAlt?: string;
  imagePosition?: string;       // default "center"
  darkText?: boolean;           // default false
  copyright?: string | string[];
  fit?: "cover" | "contain";    // default "cover"
}
```

Accepts arbitrary children via `<slot />`. Children render above the background image but below the title/copyright chrome.

### `<SlideImage>`

Foreground image positioned inside a `<Slide>`. Accepts `ImageMetadata` or a string URL. Prefer the YAML `slideImage:` nested block for single positioned images; use the JSX form only when the slide composes multiple positioned children, mixes JSX overlays, or needs hand-crafted layout.

```tsx
type Align =
  | "center" | "top" | "bottom" | "left" | "right"
  | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Props {
  src: ImageMetadata | string;
  alt: string;
  height?: string;              // CSS length
  width?: string;               // CSS length
  align?: Align;                // default "center"; ignored if x or y set
  x?: string;                   // center anchor, CSS length
  y?: string;                   // center anchor, CSS length
  class?: string;
}
```

If `src` is a string, renders a raw `<img>` (preserves GIF animation). If `src` is `ImageMetadata`, renders Astro's `<Image>` (optimized, but lossy for GIFs; use `gif.src` to opt into the raw path).

### `<SlideVideo>`

Foreground video positioned inside a `<Slide>`. Same positioning API as `<SlideImage>`. Prefer the YAML `slideVideo:` nested block for single videos; use the JSX form only when the slide composes multiple positioned children, mixes JSX overlays, or needs a template-literal `src` (YAML can't express template literals — inline the full path instead, or stay in JSX).

```tsx
interface Props {
  src: string;
  type?: string;                              // default "video/mp4"
  poster?: string;
  loop?: boolean;                             // default true
  autoplay?: boolean;                         // default true
  muted?: boolean;                            // default true
  controls?: boolean;                         // default false
  playsinline?: boolean;                      // default true
  preload?: "none" | "metadata" | "auto";     // default "auto"
  fit?: "contain" | "cover";                  // default "contain"
  blur?: boolean;                             // default true when fit === "contain"
  height?: string;
  width?: string;
  align?: Align;
  x?: string;
  y?: string;
  class?: string;
}
```

When no positioning props are supplied, fills the parent slide (full-bleed). Otherwise positions the video bounding box like `<SlideImage>`.

### `<SlideImageRow>`

Whole-slide grid of 2-4 images. Replaces `<Slide>` entirely; not nested inside it. Prefer the `type: image-row` YAML form; use the JSX directly only when YAML can't express what you need (5+ images, multiple rows in one slide, mixed per-image classes).

```tsx
interface ImageItem {
  src: ImageMetadata | string;
  alt?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  images: ImageItem[];          // required, 2-4 items
  darkText?: boolean;
  copyright?: string | string[];
  gap?: "none" | "sm" | "md" | "lg";   // default "sm"
  fit?: "cover" | "contain";           // default "contain"
}
```

### `<SlideNotes>`

Presenter notes shown when notes mode is toggled. Usually you set `notes:` in the YAML fence rather than writing this component directly. Use the JSX form only when notes are alongside other children in a JSX-authored slide.

## Disambiguation: background vs foreground image

| Author intent | YAML | JSX equivalent |
| --- | --- | --- |
| Full-bleed background image with title chrome | `image: cover` (top-level) | `<Slide image={cover} imageAlt="...">` |
| Foreground positioned image inside the slide | `slideImage: { src: cover, alt: ..., width: "50%" }` (nested) | `<Slide><SlideImage src={cover} alt="..." width="50%" /></Slide>` |
| Foreground video inside the slide | `slideVideo: { src: /v.mp4 }` (nested) | `<Slide><SlideVideo src="/v.mp4" /></Slide>` |
| Background + foreground in the same slide | top-level `image: bg` + nested `slideImage: { ... }` or `slideVideo: { ... }` | `<Slide image={bg} imageAlt="..."><SlideImage .../></Slide>` |

A future plugin extension may add a nested `slideImage:` / `slideVideo:` block to express foreground children in YAML. Until that ships, foreground content lives in JSX.

## Six exemplar slides

### 1. Title slide (YAML)

```yaml
---
type: title
title: Arquitetura Computacional na Alemanha
subtitle: Estado da arte e principais tecnologias
author: Daniel Locatelli
institution: SEMANAU 2023, Universidade Federal do Tocantins
---
```

### 2. Image with title and copyright (YAML)

```yaml
---
title: Pavilhão O3
subtitle: Atelier Marko Brajovic, Expo Revestir 2017
image: o3PavilionCenografia
imageAlt: Vista frontal do Pavilhão O3
copyright: Gui Morelli
fit: contain
---
```

### 3. Text divider (YAML)

```yaml
---
type: text
text: Design Computacional
size: lg
---
```

### 4. Image with dark overlay and centered headline (JSX)

```mdx
<Slide image={bucky} imageAlt="Buckminster Fuller" copyright="AP Photo" fit="contain">
  <div class="absolute inset-0 z-5 bg-black/60" />
  <div class="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center text-white">
    <p class="max-w-4xl text-xl leading-relaxed font-light italic sm:text-3xl" style="font-family: 'Poppins', sans-serif;">
      "Don't fight forces, use them!"
    </p>
    <p class="mt-6 text-base font-bold tracking-wider uppercase sm:text-lg" style="font-family: 'Montserrat', sans-serif;">
      Buckminster Fuller
    </p>
  </div>
</Slide>
```

### 5. Positioned foreground image (YAML)

```yaml
---
title: Pavilhão O3
subtitle: Form finding dos domos
slideImage:
  src: o3FormFinding.src
  alt: Animação do form finding com Kangaroo
  width: "40%"
  y: "52%"
notes: Usamos o Grasshopper para o form finding dos domos.
---
```

`o3FormFinding.src` (the `.src` accessor) passes the GIF as a raw URL string, which routes through `SlideImage`'s raw `<img>` path and preserves animation. A bare `src: o3FormFinding` would emit `<SlideImage src={o3FormFinding} />`, which goes through Astro's `<Image>` and loses GIF animation.

### 6. Image row (YAML)

```yaml
---
type: image-row
title: Models ByNature
subtitle: Workshop, registros
images:
  - src: img24
    alt: Models ByNature workshop, registro 1
  - src: img25
    alt: Models ByNature workshop, registro 2
  - src: img26
    alt: Models ByNature workshop, registro 3
---
```

## Asset organization

- **Images and GIFs**: under `src/assets/content/...`. Import at the top of `deck.mdx`. Astro processes these (except when accessed via `.src`).
- **Videos**: under `public/presentations/<deck-slug>/` (or similar) and referenced by URL path. Videos are not bundled by Astro; they're served as static assets from the Cloudflare Worker.

Asset paths under `src/assets/content/teaching/<slug>/` are conventional but not enforced; cross-deck reuse (e.g. importing a project asset into a teaching deck) is fine.

## Common pitfalls

- **Unquoted percentages parse as numbers.** Write `width: "50%"`, not `width: 50%` and definitely not `width: 50`.
- **Colons in prose values trigger nested-mapping errors.** YAML reads `notes: A: B` as `notes` having a sub-key `A`. Quote any string value that contains `': '` (a colon followed by a space): `notes: "A: B"`. The validator catches this at `npm run check:decks`.
- **Missing component imports = silent empty deck.** If a deck uses `slideVideo:` but doesn't `import SlideVideo`, MDX fails to resolve the component and renders an empty `<main>` with no error. Keep all six slide-component imports present even if you think you're not using one; it's the cheapest insurance against this failure mode.
- **GIFs through `<Image>` lose animation.** Use `gif.src` (string URL) instead of passing the import binding directly.
- **Template literals don't work in YAML.** Inline the full path string, or stay in JSX.
- **Forgetting `imageAlt:` when `image:` is set** breaks accessibility. Always include alt text.
- **Em dashes (`—`) in slide text content** are forbidden by project convention (see `CLAUDE.md`). Use commas, colons, or parentheses instead.

## Related references

- **Plugin source**: `src/lib/vite-presentation-slides.ts`
- **Component sources**: `src/components/slides/*.astro`
- **Demo deck**: `src/content/teaching/en/_demo/deck.mdx` (side-by-side YAML and JSX examples)
- **Validator**: `npm run check:decks` runs the YAML schema validator. Errors are slide-scoped (file:line) with "did you mean..." hints. Runs in under a second on the full content tree.
- **Spec**: Full design rationale and implementation plan for the YAML-first authoring system in `docs/superpowers/specs/2026-05-11-yaml-first-slide-authoring.md`.
