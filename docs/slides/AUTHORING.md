# Slide authoring guide

Decks live at `src/content/<collection>/<locale>/<slug>/deck.mdx`. Each slide is either a **YAML fence** (preferred for ~80% of slides) or a **JSX block** using the components in `src/components/slides/` (escape hatch for complex composition). Both surfaces coexist in the same file and produce the same runtime output.

Use YAML by default. Drop to JSX only when the slide needs multiple positioned children, custom layouts, or anything YAML cannot express.

Every YAML fence is a slide; there is no longer a separate `title`, `text`, or `image-row` type. The discriminator `type:` field was removed once the variants collapsed into one. For historical context, see `docs/superpowers/plans/2026-05-14-unified-slide-type-with-markdown.md`.

## How the plugin works

`src/lib/vite-presentation-slides.ts` is a Vite `transform` plugin (enforced `pre`) that pre-processes `*/deck.mdx` files before MDX parses them. It walks every `---\n...\n---` fence in the file body, parses the YAML, and rewrites it to a `<Slide>` JSX element:

- The **first** fence at the top of the file is the deck-level Astro frontmatter (`Name`, `Description`, `DateStart`, `Event`, `Language`). The plugin leaves it alone.
- Every **subsequent** fence is a slide. The plugin always emits `<Slide>` (with appropriate props and children).
- If a fence fails to parse as YAML or yields a non-object, the plugin leaves it untouched. Invalid YAML degrades gracefully.

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

import Slide from "@/components/slides/Slide.astro";
import SlideMarkdown from "@/components/slides/SlideMarkdown.astro";
import SlideNotes from "@/components/slides/SlideNotes.astro";
import SlideImage from "@/components/slides/SlideImage.astro";
import SlideVideo from "@/components/slides/SlideVideo.astro";
import SlideText from "@/components/slides/SlideText.astro";
// Required-imports rule: the YAML plugin emits JSX that references whichever
// components your fences use. Any fence emits `<Slide>`; `text:` fields emit
// `<SlideMarkdown>`; `notes:` fields emit `<SlideNotes>`; `slideImage:` blocks
// emit `<SlideImage>`; `slideVideo:` blocks emit `<SlideVideo>`; `slideText:`
// blocks emit `<SlideText>`. Keep all imports present; an unused import is
// cheap, but a missing one makes MDX silently render an empty <main>.

import cover from "@/assets/content/teaching/<slug>/<image>.jpg";
// ...more asset imports

---
title: Deck title
subtitle: Optional subtitle
image: cover
imageAlt: Description for screen readers
---

---
text: |
  # Big Headline

  A paragraph of body text beneath it.
---

<Slide>
  {/* JSX escape hatch for composed slides */}
</Slide>
```

A leading underscore on the slug folder (e.g. `src/content/teaching/en/_demo/`) excludes the deck from routing. Use this for fixtures or in-progress drafts.

## Authoring a slide

The full field set:

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `title` | string | no | | Top-left chrome pill |
| `subtitle` | string | no | | Top-left chrome pill, below title |
| `image` | binding or URL | no | | Background image; bare identifier resolves to a JS import binding |
| `imageAlt` | string | required if `image` set | | Screen-reader text |
| `imagePosition` | string | no | `"center"` | CSS `object-position` value |
| `darkText` | boolean | no | `false` | Use zinc-950 chrome text on light backgrounds |
| `copyright` | credit line or credit line[] | no | | Bottom-left credit. See [credit lines](#credit-lines). |
| `fit` | `"cover"` or `"contain"` | no | `"cover"` | Background `object-fit` |
| `overlay` | `"<color>/<alpha>"` | no | | Full-bleed dimming layer at z-5. Color is `black` or `white`; alpha is 0-100. Example: `black/50`. |
| `images` | array | no | | 2-4 image items; renders as a grid. See [image grids](#image-grid-backgrounds). |
| `gap` | `"none"` \| `"sm"` \| `"md"` \| `"lg"` | no | `"sm"` | Spacing between images in a grid |
| `text` | markdown string | no | | Centered primary text via `SlideMarkdown`. See [the text field](#the-text-field-markdown-subset). |
| `slideImage` | object | no | | Foreground positioned image. See [foreground composition](#foreground-composition). |
| `slideVideo` | object | no | | Foreground positioned video. |
| `slideText` | object | no | | Foreground text overlay. |
| `notes` | string | no | | Emitted as `<SlideNotes>` child. Shown in notes mode. |

`notes:` renders as a `position: fixed` overlay and does not compete with the slide's centered content.

When `image:` and `images:` are both present, `images:` wins and `image:` is ignored.

## The `text:` field: markdown subset

The `text:` field accepts a markdown string (use a YAML block scalar `|` for multi-line content). It renders centered in the slide via `SlideMarkdown` at z-10, above any `overlay:`.

**Supported elements:**

| Syntax | Renders as |
| --- | --- |
| `# Heading` | h1: large uppercase Montserrat hero |
| `## Heading` | h2: medium Montserrat |
| `### Heading` | h3: smaller Montserrat |
| `A paragraph` | body text, Poppins light |
| `> A quotation` | blockquote, left-border, italic |
| `**bold**` | strong |
| `*italic*` | emphasis |
| `- item` | unordered list, left-aligned |
| `1. item` | ordered list, left-aligned |

**Not supported** (stripped by the renderer): raw HTML, links, images, code blocks, tables, horizontal rules. Note that `---` conflicts with YAML fence syntax anyway, so horizontal rules cannot be used inside `text:` blocks.

### Blank lines and visual slots

Two authoring idioms produce visible vertical space:

**Whitespace-only lines as slots.** A line containing only whitespace (typed as `   ` in the source) is an explicit visual slot. Each slot inherits the heading prefix of the preceding content block, so an empty slot after a `## Heading` renders as an empty h2 of the same height as the heading itself. This is the idiom for progressive-reveal sequences where every line must occupy the same vertical position across slides:

```yaml
---
text: |
  ## Modelagem Associativa
  
   
  
   
---
```

```yaml
---
text: |
  ## Modelagem Associativa
  
  ## Design Paramétrico
  
   
---
```

Both slides above are exactly the same total height (three h2-tall rows). Lines align perfectly between them, so flipping between slides reveals each new line "in place" without the column shifting.

**Multiple blank lines for breathing room.** A run of two or more truly-empty lines (no whitespace in them) is treated as one block separator plus one spacer per additional blank. Use this when you just want a paragraph or two of extra space, without caring about exact alignment.

```yaml
---
text: |
  ## Heading


  Body paragraph with extra breathing room above it.
---
```

**Trailing blanks usually survive default `|`.** If your last "line" is a whitespace-only slot (i.e., you typed `   ` on the last line), `|` preserves it because the parser sees content on that line. Only pure trailing empty lines need `|+` (keep chomping) — and even then, the same effect is usually clearer to author as explicit slot lines.

### Examples

Text-only chapter divider:

```yaml
---
text: |
  # Design Computacional
---
```

Headline over a dark-overlaid background:

```yaml
---
image: bucky
imageAlt: Buckminster Fuller
overlay: black/60
text: |
  # Don't fight forces, use them!
---
```

Multi-element text slide:

```yaml
---
text: |
  ## Reproduzir Formas

  Reproduzir Processos

  Reproduzir Ecossistemas
---
```

Quote with context:

```yaml
---
image: bucky
imageAlt: Buckminster Fuller
overlay: black/60
copyright: AP Photo
text: |
  > "Don't fight forces, use them!"

  Buckminster Fuller
---
```

## Image grid backgrounds

Use `images:` instead of `image:` when you want a whole-slide grid of 2-4 images. The `image:` field is for single full-bleed backgrounds; `images:` splits the slide into equal-width cells.

```yaml
---
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

Each item in `images:` accepts:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `src` | binding or URL | yes | Bare identifier resolves to a JS import binding |
| `alt` | string | yes | Required for accessibility |
| `copyright` | credit line or credit line[] | no | Per-image credit, frosted pill at the cell's bottom-left corner |

Grid controls (set at the fence level, not per-image):

- `fit:` defaults to `"cover"` (fills each cell). Use `"contain"` to letterbox.
- `gap:` defaults to `"sm"`. Options: `"none"`, `"sm"`, `"md"`, `"lg"`.

For 5 or more images, multiple rows, or per-image `object-position`, drop to JSX.

## Foreground composition

A slide fence can carry `slideImage:`, `slideVideo:`, and `slideText:` as nested blocks. These render above the background and above any `overlay:`. Combined with `image:` (or `images:`) and `notes:`, one fence can describe a full composition.

The plugin emits nested blocks as children of `<Slide>` in this order: `<SlideImage>`, `<SlideVideo>`, `<SlideText>`, `<SlideNotes>`.

### `slideImage:`

A foreground image (or animated GIF) positioned inside the slide canvas. Maps 1:1 to `<SlideImage>` props.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `src` | binding or URL | yes | Use `gif.src` (the `.src` accessor) to preserve GIF animation |
| `alt` | string | yes | Required for accessibility |
| `width` | string | no | CSS length, e.g. `"50%"` or `"320px"` |
| `height` | string | no | CSS length |
| `align` | enum | no | `"center"` (default), `"top"`, `"bottom"`, `"left"`, `"right"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`. Ignored if `x` or `y` set. |
| `x` | string | no | CSS length, center-anchor horizontal override |
| `y` | string | no | CSS length, center-anchor vertical override |
| `class` | string | no | Extra Tailwind classes |

Example (GIF animation, vertically offset):

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

`o3FormFinding.src` (the `.src` accessor) passes the GIF as a raw URL string and preserves animation. A bare `src: o3FormFinding` would go through Astro's `<Image>` optimizer and lose the animation.

### `slideVideo:`

A foreground video positioned inside the slide canvas. Maps 1:1 to `<SlideVideo>` props. When no positioning props are supplied, fills the parent slide (full-bleed).

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `src` | URL string | yes | | Path to the video; not binding-aware (videos live under `/public`, not as JS imports) |
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

Example (full-bleed):

```yaml
---
title: Models ByNature Workshop
subtitle: São Paulo, 2019
slideVideo:
  src: /presentations/digital-futures-2026/models-bynature-workshop-1.5x.mp4
---
```

Example (positioned):

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

### `slideText:`

A foreground text overlay rendered above the background image and above any `overlay:`. Used for centered headlines, multi-line stacks, and quote-with-attribution patterns. Maps 1:1 to `<SlideText>` props.

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `text` | string | yes | | Main text. Use `\|` for multi-line stacks; each line renders as its own `<p>`. |
| `subtext` | string | no | | Smaller secondary line (italic for title variant; bold uppercase attribution for quote variant). |
| `size` | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | no | `"md"` | Main text size tier. |
| `case` | `"upper"` \| `"normal"` | no | `"upper"` | Uppercase + wider letter-spacing for the title variant. |
| `variant` | `"title"` \| `"quote"` | no | `"title"` | `"title"` is bold Montserrat. `"quote"` is light italic Poppins. |
| `gap` | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | no | `"lg"` | Vertical gap between lines in a multi-line stack. |

Example (centered title):

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

**Note:** `slideText:` and `text:` serve similar purposes but are distinct. `text:` uses the structured markdown renderer (`SlideMarkdown`); `slideText:` uses the legacy `<SlideText>` component with its own size/case/variant API. Prefer `text:` for new slides; `slideText:` remains for patterns not yet expressible in the markdown subset (per-line opacity, custom variant styling, etc.).

## Credit lines

The `copyright` field (on the slide, and on each item inside `images:`) accepts:

- A **plain string**: `copyright: Gui Morelli` renders as `© Gui Morelli`.
- A **link object** `{ name, href }`: renders the name as an external link. The `©` prefix is auto-prepended unless `name` already starts with `©` or `(c)`.
- An **array** mixing both forms: each item becomes its own line in the frosted-pill stack.

Link form in YAML:

```yaml
image: crownShyness
imageAlt: Timidez das copas em árvores Wana-Kwali
copyright:
  name: SAM EN CIMES
  href: "https://elaguyane.wordpress.com/2013/12/04/description-architecturale-wana-kwali/"
```

Quote the URL so YAML does not try to parse `://` as nested mapping syntax.

Multiple lines, mixed forms:

```yaml
copyright:
  - name: SAM EN CIMES
    href: "https://elaguyane.wordpress.com/2013/12/04/description-architecturale-wana-kwali/"
  - Photo retouched by Daniel Locatelli
```

## Field value rules

### Bare identifier vs string

- The **`image:`** field is binding-aware. A bare identifier like `cover` or a dotted member access like `coverImage.src` is emitted as a JavaScript expression referencing the matching `import`. URL-shaped strings (starting with `/`, `./`, `../`, `https://`, `http://`, `data:`, `blob:`) are emitted as string literals.
- The **`src:`** inside `slideImage:` is also binding-aware (same rules).
- **All other string fields** are emitted as JSON-stringified literals. Bare identifiers there emit as `"identifier"`, not as a binding reference.
- Booleans and numbers emit as JSX expression values (`{true}`, `{42}`).

### Quoting CSS lengths

YAML parses `50%` as a string but parses `50` as a number. Always quote percentages and unit-bearing values:

```yaml
# good
width: "50%"
height: "320px"

# bad: parses as the number 50; JSX emits width={50}
width: 50
```

### No JS expressions in YAML

YAML values are plain data. You cannot write `${VIDEO_BASE}/media1.mp4` in YAML; template literals are JSX-only. Workaround: inline the full URL string.

## JSX escape hatch

Reach for JSX when:

- The slide has **multiple positioned children** (two images side by side, image plus custom text).
- The slide has **custom typography or layout** that does not map to any supported field.
- The slide needs a **template-literal `src`** in a video (YAML can't express template literals).

When you drop to JSX, use `<Slide>` as the outer container plus child components. The plugin leaves JSX blocks untouched, so JSX and YAML fences interleave freely in the same file.

### `<Slide>`

```tsx
interface Props {
  title?: string;
  subtitle?: string;
  image?: ImageMetadata | string;
  images?: { src: ImageMetadata | string; alt?: string; copyright?: CreditLine | CreditLine[] }[];
  imageAlt?: string;
  imagePosition?: string;       // default "center"
  darkText?: boolean;           // default false
  copyright?: CreditLine | CreditLine[];
  fit?: "cover" | "contain";    // default "cover"
  gap?: "none" | "sm" | "md" | "lg"; // default "sm"
  overlay?: string;             // "<color>/<alpha>", e.g. "black/50"
}
```

Accepts arbitrary children via `<slot />`. Children render above the background image but below the title/copyright chrome.

### `<SlideImage>`

Foreground image positioned inside a `<Slide>`. Accepts `ImageMetadata` or a string URL. Prefer the YAML `slideImage:` nested block for single positioned images; use the JSX form when the slide composes multiple positioned children or needs hand-crafted layout.

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

Foreground video positioned inside a `<Slide>`. Same positioning API as `<SlideImage>`. Prefer the YAML `slideVideo:` nested block for single videos; use the JSX form only when the slide composes multiple positioned children or needs a template-literal `src`.

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

### `<SlideNotes>`

Presenter notes shown when notes mode is toggled. Usually set `notes:` in the YAML fence rather than writing this component directly. Use the JSX form only when notes appear alongside other children in a JSX-authored slide.

## Disambiguation: background vs foreground image

| Author intent | YAML | JSX equivalent |
| --- | --- | --- |
| Full-bleed background image with title chrome | `image: cover` (top-level) | `<Slide image={cover} imageAlt="...">` |
| Whole-slide image grid | `images:` array (top-level) | `<Slide images={[...]} />` |
| Foreground positioned image | `slideImage: { src: cover, alt: ..., width: "50%" }` | `<Slide><SlideImage src={cover} alt="..." width="50%" /></Slide>` |
| Foreground video | `slideVideo: { src: /v.mp4 }` | `<Slide><SlideVideo src="/v.mp4" /></Slide>` |
| Background + foreground in one slide | top-level `image: bg` + nested `slideImage:` or `slideVideo:` | `<Slide image={bg} imageAlt="..."><SlideImage .../></Slide>` |

## Exemplar slides

### Title / intro slide

```yaml
---
title: Arquitetura Computacional na Alemanha
subtitle: Estado da arte e principais tecnologias
image: cover
imageAlt: Vista aérea
copyright: Daniel Locatelli
---
```

### Text-only chapter divider

```yaml
---
text: |
  # Design Computacional
---
```

### Image with chrome

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

### Dark overlay with centered headline

```yaml
---
image: bucky
imageAlt: Buckminster Fuller
overlay: black/60
copyright: AP Photo
fit: contain
text: |
  > "Don't fight forces, use them!"

  Buckminster Fuller
---
```

### Positioned GIF foreground

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

### Image grid

```yaml
---
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

### JSX escape hatch (two positioned children)

```mdx
<Slide image={bg} imageAlt="Background" overlay="black/50">
  <SlideImage src={diagramLeft} alt="Left diagram" width="45%" align="left" />
  <SlideImage src={diagramRight} alt="Right diagram" width="45%" align="right" />
</Slide>
```

## Asset organization

- **Images and GIFs**: under `src/assets/content/...`. Import at the top of `deck.mdx`. Astro processes these (except when accessed via `.src`).
- **Videos**: under `public/presentations/<deck-slug>/` (or similar) and referenced by URL path. Videos are not bundled by Astro; they are served as static assets from the Cloudflare Worker.

Asset paths under `src/assets/content/teaching/<slug>/` are conventional but not enforced; cross-deck reuse (importing a project asset into a teaching deck) is fine.

## Common pitfalls

- **Unquoted percentages parse as numbers.** Write `width: "50%"`, not `width: 50%` and definitely not `width: 50`.
- **Colons in prose values trigger nested-mapping errors.** YAML reads `notes: A: B` as `notes` having a sub-key `A`. Quote any string that contains `: ` (colon followed by space): `notes: "A: B"`. The validator catches this at `npm run check:decks`.
- **Missing component imports = silent empty deck.** If a deck uses `slideVideo:` but does not `import SlideVideo`, MDX fails to resolve the component and renders an empty `<main>` with no error. Keep all slide-component imports present; an unused import is cheap.
- **GIFs through `<Image>` lose animation.** Use `gif.src` (string URL) instead of passing the import binding directly.
- **Template literals do not work in YAML.** Inline the full path string, or stay in JSX.
- **Forgetting `imageAlt:` when `image:` is set** breaks accessibility. Always include alt text.
- **Em dashes (`—`) in slide text content** are forbidden by project convention (see `CLAUDE.md`). Use commas, colons, or parentheses instead.
- **`text:` and `images:` can coexist.** `text:` renders centered markdown above any background; `images:` is the background. You can have a grid background with a centered text label on top.

## Validation

```bash
npm run check:decks
```

Runs the YAML schema validator over every `deck.mdx` in the content tree. Errors are slide-scoped (file:line) with "did you mean..." hints for unknown fields. Runs in under a second on the full tree.

## Related references

- **Plugin source**: `src/lib/vite-presentation-slides.ts`
- **Component sources**: `src/components/slides/*.astro`
- **Demo deck**: `src/content/teaching/en/_demo/deck.mdx` (side-by-side YAML and JSX examples)
- **Migration plan**: `docs/superpowers/plans/2026-05-14-unified-slide-type-with-markdown.md`
- **Original spec**: `docs/superpowers/specs/2026-05-11-yaml-first-slide-authoring.md`
