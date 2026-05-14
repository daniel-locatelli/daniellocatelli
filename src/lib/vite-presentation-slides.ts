import type { Plugin } from "vite";
import { parse as parseYaml } from "yaml";

// Pre-processes deck .mdx files (any file named `deck.mdx` under
// src/content/) so simple slides can be authored as YAML frontmatter blocks
// instead of full <Slide> JSX. A block of the form
//
//   ---
//   title: Atelier Marko Brajovic
//   subtitle: São Paulo, 2015 - 2019
//   image: atelier
//   notes: I have always been interested...
//   ---
//
// is rewritten to a self-closing JSX element with the matching props, before
// MDX parses the file. Existing <Slide>...</Slide> JSX is passed through
// untouched, so both syntaxes coexist and slides can be migrated incrementally.
//
// The first frontmatter block at the top of the file is the deck-level
// frontmatter (Astro content collection metadata) and is left alone.
//
// Field semantics:
//   - `type`: "slide" (the only valid value; may be omitted, defaults to "slide")
//   - `notes`: emitted as <SlideNotes>{value}</SlideNotes> child of <Slide>
//   - `image`: a bare identifier (e.g. `atelier`) is emitted as a JSX
//      expression `image={atelier}`, referring to imports at the top of the
//      MDX file. Path-like values (starting with `/`, `./`, `http(s)://`,
//      `data:`, `blob:`) are emitted as string literals.
//   - All other fields are emitted as JSX attribute expressions wrapping
//     JSON-stringified values, so quote-escaping is handled uniformly.
//
// In addition to the transform, this module exports a pure `validateSlide`
// function and an `extractSlidesFromMdx` helper. Both are reused by the
// standalone `scripts/check-decks.ts` script so authors get fast feedback
// without invoking Astro. See docs/slides/AUTHORING.md for the schema.

const DECK_FILE_SUFFIX = "/deck.mdx";

const URL_PATTERN = /^(\/|\.\.?\/|https?:\/\/|data:|blob:)/;
const IDENTIFIER_PATTERN =
  /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;

// Fields whose string value is a JS binding name (resolved against the MDX's
// imports) rather than a literal string. URL-like values still emit as strings.
const BINDING_FIELDS = new Set(["image"]);

// --- Validator -------------------------------------------------------------

export interface SlideValidationError {
  file: string;
  line: number;
  message: string;
}

export interface ExtractedSlide {
  config: Record<string, unknown>;
  line: number;
  file: string;
}

type SlideType = "slide";

const SLIDE_TYPES: readonly SlideType[] = ["slide"] as const;

const KNOWN_FIELDS: Record<SlideType, ReadonlySet<string>> = {
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
    "text",
    "images",
    "gap",
  ]),
};

const REQUIRED_FIELDS: Record<SlideType, readonly string[]> = {
  slide: [],
};

const ENUM_VALUES: Record<string, readonly string[]> = {
  size: ["sm", "md", "lg", "xl"],
  fit: ["cover", "contain"],
  gap: ["none", "sm", "md", "lg"],
  case: ["upper", "normal"],
};

const STRING_FIELDS_BY_TYPE: Record<SlideType, readonly string[]> = {
  slide: [
    "title",
    "subtitle",
    "image",
    "imageAlt",
    "imagePosition",
    "fit",
    "overlay",
    "notes",
    "text",
    "gap",
  ],
};

const BOOLEAN_FIELDS_BY_TYPE: Record<SlideType, readonly string[]> = {
  slide: ["darkText"],
};

// --- Nested child blocks ---------------------------------------------------
// Field sets are informational; per spec, unknown keys inside a nested block
// pass through to JSX attributes (and TypeScript catches typos at build time).
// The validator still checks the documented fields for required-ness and
// type, which gives faster feedback for the common props.

// Shared across slideImage and slideVideo (both maps to the Align union
// type defined identically in their components).
const ALIGN_VALUES: readonly string[] = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const SLIDE_IMAGE_STRING_FIELDS: readonly string[] = [
  "src",
  "alt",
  "width",
  "height",
  "x",
  "y",
  "align",
  "class",
];

const SLIDE_IMAGE_BINDING_FIELDS: ReadonlySet<string> = new Set(["src"]);

const SLIDE_VIDEO_STRING_FIELDS: readonly string[] = [
  "src",
  "type",
  "poster",
  "preload",
  "fit",
  "width",
  "height",
  "x",
  "y",
  "align",
  "class",
];

const SLIDE_VIDEO_BOOLEAN_FIELDS: readonly string[] = [
  "loop",
  "autoplay",
  "muted",
  "controls",
  "playsinline",
  "blur",
];

// Videos are always URL strings (served from /public), never JS bindings.
const SLIDE_VIDEO_BINDING_FIELDS: ReadonlySet<string> = new Set();

const SLIDE_VIDEO_PRELOAD_VALUES: readonly string[] = [
  "none",
  "metadata",
  "auto",
];

const SLIDE_TEXT_STRING_FIELDS: readonly string[] = [
  "text",
  "subtext",
  "size",
  "case",
  "variant",
  "gap",
];

const SLIDE_TEXT_SIZE_VALUES: readonly string[] = ["sm", "md", "lg", "xl"];
const SLIDE_TEXT_CASE_VALUES: readonly string[] = ["upper", "normal"];
const SLIDE_TEXT_VARIANT_VALUES: readonly string[] = ["title", "quote"];
const SLIDE_TEXT_GAP_VALUES: readonly string[] = ["sm", "md", "lg", "xl"];

// text/subtext are plain strings; no JS bindings.
const SLIDE_TEXT_BINDING_FIELDS: ReadonlySet<string> = new Set();

const SLIDE_VIDEO_FIT_VALUES: readonly string[] = ["cover", "contain"];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function suggest(
  unknownValue: string,
  candidates: Iterable<string>,
  maxDistance = 2,
): string | undefined {
  let best: string | undefined;
  let bestDist = Infinity;
  const target = unknownValue.toLowerCase();
  for (const candidate of candidates) {
    const d = levenshtein(target, candidate.toLowerCase());
    if (d < bestDist && d <= maxDistance) {
      bestDist = d;
      best = candidate;
    }
  }
  return best;
}

// A credit/copyright line is either a plain string or a `{ name, href }` link
// object. Mirrors the `CreditLine` union exported from src/components/Credit.astro.
// Used by both the top-level `copyright` field and the
// per-image `images[].copyright` field.
function isCreditLine(value: unknown): boolean {
  if (typeof value === "string") return true;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.name === "string" && typeof obj.href === "string";
}

function isValidCopyright(value: unknown): boolean {
  if (isCreditLine(value)) return true;
  return Array.isArray(value) && value.every(isCreditLine);
}

function validateSlideImageBlock(
  block: unknown,
  push: (message: string) => void,
): void {
  if (!block || typeof block !== "object" || Array.isArray(block)) {
    push(
      `slideImage: must be an object with 'src' and 'alt' fields, got ${Array.isArray(block) ? "array" : typeof block}.`,
    );
    return;
  }
  const obj = block as Record<string, unknown>;

  if (obj.src === undefined || obj.src === null || obj.src === "") {
    push(`slideImage: missing required field 'src'.`);
  } else if (typeof obj.src !== "string") {
    push(
      `slideImage.src must be a string (binding identifier or URL), got ${typeof obj.src}.`,
    );
  }

  if (obj.alt === undefined || obj.alt === null || obj.alt === "") {
    push(`slideImage: missing 'alt'. Required for accessibility.`);
  } else if (typeof obj.alt !== "string") {
    push(`slideImage.alt must be a string, got ${typeof obj.alt}.`);
  }

  // Type-check the known optional fields (skip src and alt; already handled).
  for (const field of SLIDE_IMAGE_STRING_FIELDS) {
    if (field === "src" || field === "alt") continue;
    const value = obj[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      push(
        `slideImage.${field} must be a string, got ${typeof value}. Hint: quote percentages and numeric-looking values, e.g. width: "50%".`,
      );
    }
  }

  // align: enum check
  if (typeof obj.align === "string" && !ALIGN_VALUES.includes(obj.align)) {
    const suggestion = suggest(obj.align, ALIGN_VALUES);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    push(
      `slideImage.align: invalid value '${obj.align}'. Valid: ${ALIGN_VALUES.join(", ")}.${hint}`,
    );
  }
}

function validateSlideVideoBlock(
  block: unknown,
  push: (message: string) => void,
): void {
  if (!block || typeof block !== "object" || Array.isArray(block)) {
    push(
      `slideVideo: must be an object with a 'src' field, got ${Array.isArray(block) ? "array" : typeof block}.`,
    );
    return;
  }
  const obj = block as Record<string, unknown>;

  // Required: src (always a URL string, never a JS binding).
  if (obj.src === undefined || obj.src === null || obj.src === "") {
    push(`slideVideo: missing required field 'src'.`);
  } else if (typeof obj.src !== "string") {
    push(
      `slideVideo.src must be a string (URL), got ${typeof obj.src}.`,
    );
  }

  // Type-check the known string fields (skip src; handled above).
  for (const field of SLIDE_VIDEO_STRING_FIELDS) {
    if (field === "src") continue;
    const value = obj[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      push(
        `slideVideo.${field} must be a string, got ${typeof value}. Hint: quote percentages and numeric-looking values, e.g. width: "50%".`,
      );
    }
  }

  // Type-check the known boolean fields.
  for (const field of SLIDE_VIDEO_BOOLEAN_FIELDS) {
    const value = obj[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "boolean") {
      push(
        `slideVideo.${field} must be a boolean (true/false), got ${typeof value}.`,
      );
    }
  }

  // Enum checks
  if (typeof obj.align === "string" && !ALIGN_VALUES.includes(obj.align)) {
    const suggestion = suggest(obj.align, ALIGN_VALUES);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    push(
      `slideVideo.align: invalid value '${obj.align}'. Valid: ${ALIGN_VALUES.join(", ")}.${hint}`,
    );
  }
  if (
    typeof obj.fit === "string" &&
    !SLIDE_VIDEO_FIT_VALUES.includes(obj.fit)
  ) {
    const suggestion = suggest(obj.fit, SLIDE_VIDEO_FIT_VALUES);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    push(
      `slideVideo.fit: invalid value '${obj.fit}'. Valid: ${SLIDE_VIDEO_FIT_VALUES.join(", ")}.${hint}`,
    );
  }
  if (
    typeof obj.preload === "string" &&
    !SLIDE_VIDEO_PRELOAD_VALUES.includes(obj.preload)
  ) {
    const suggestion = suggest(obj.preload, SLIDE_VIDEO_PRELOAD_VALUES);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    push(
      `slideVideo.preload: invalid value '${obj.preload}'. Valid: ${SLIDE_VIDEO_PRELOAD_VALUES.join(", ")}.${hint}`,
    );
  }
}

function validateSlideTextBlock(
  block: unknown,
  push: (message: string) => void,
): void {
  if (!block || typeof block !== "object" || Array.isArray(block)) {
    push(
      `slideText: must be an object with a 'text' field, got ${Array.isArray(block) ? "array" : typeof block}.`,
    );
    return;
  }
  const obj = block as Record<string, unknown>;

  if (obj.text === undefined || obj.text === null || obj.text === "") {
    push(`slideText: missing required field 'text'.`);
  } else if (typeof obj.text !== "string") {
    push(`slideText.text must be a string, got ${typeof obj.text}.`);
  }

  for (const field of SLIDE_TEXT_STRING_FIELDS) {
    if (field === "text") continue;
    const value = obj[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      push(`slideText.${field} must be a string, got ${typeof value}.`);
    }
  }

  const enumCheck = (
    field: string,
    values: readonly string[],
  ): void => {
    const value = obj[field];
    if (typeof value === "string" && !values.includes(value)) {
      const suggestion = suggest(value, values);
      const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
      push(
        `slideText.${field}: invalid value '${value}'. Valid: ${values.join(", ")}.${hint}`,
      );
    }
  };
  enumCheck("size", SLIDE_TEXT_SIZE_VALUES);
  enumCheck("case", SLIDE_TEXT_CASE_VALUES);
  enumCheck("variant", SLIDE_TEXT_VARIANT_VALUES);
  enumCheck("gap", SLIDE_TEXT_GAP_VALUES);
}

function validateImagesArray(
  images: unknown,
  push: (message: string) => void,
  contextLabel: string,
): void {
  if (!Array.isArray(images)) {
    push(
      `${contextLabel}: 'images' must be an array, got ${typeof images}.`,
    );
    return;
  }
  if (images.length === 0) {
    push(`${contextLabel}: 'images' must contain at least one item.`);
    return;
  }
  if (images.length > 4) {
    push(
      `${contextLabel}: 'images' has ${images.length} items; at most 4 are supported (2-4 columns recommended).`,
    );
  }
  images.forEach((item, idx) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      push(
        `${contextLabel}: images[${idx}] must be an object with 'src' and 'alt' fields.`,
      );
      return;
    }
    const obj = item as Record<string, unknown>;
    if (
      obj.src === undefined ||
      obj.src === null ||
      obj.src === ""
    ) {
      push(
        `${contextLabel}: images[${idx}] is missing required field 'src'.`,
      );
    } else if (typeof obj.src !== "string") {
      push(
        `${contextLabel}: images[${idx}].src must be a string (binding identifier or URL), got ${typeof obj.src}.`,
      );
    }
    if (
      obj.alt === undefined ||
      obj.alt === null ||
      obj.alt === ""
    ) {
      push(
        `${contextLabel}: images[${idx}] is missing 'alt'. Required for accessibility.`,
      );
    } else if (typeof obj.alt !== "string") {
      push(
        `${contextLabel}: images[${idx}].alt must be a string, got ${typeof obj.alt}.`,
      );
    }
    if (obj.copyright !== undefined && obj.copyright !== null) {
      if (!isValidCopyright(obj.copyright)) {
        push(
          `${contextLabel}: images[${idx}].copyright must be a string, a { name, href } object, or an array of those.`,
        );
      }
    }
    const allowedImageKeys = ["src", "alt", "copyright"];
    for (const key of Object.keys(obj)) {
      if (!allowedImageKeys.includes(key)) {
        const suggestion = suggest(key, allowedImageKeys);
        const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
        push(
          `${contextLabel}: images[${idx}] has unknown field '${key}'. Allowed: ${allowedImageKeys.join(", ")}.${hint}`,
        );
      }
    }
  });
}

export function validateSlide(
  config: Record<string, unknown>,
  ctx: { file: string; line: number },
): SlideValidationError[] {
  const errors: SlideValidationError[] = [];
  const push = (message: string) =>
    errors.push({ file: ctx.file, line: ctx.line, message });

  const rawType = config.type;
  if (rawType !== undefined && typeof rawType !== "string") {
    push(`'type' must be a string, got ${typeof rawType}.`);
    return errors;
  }

  const typeStr = (rawType as string | undefined) ?? "slide";
  if (!SLIDE_TYPES.includes(typeStr as SlideType)) {
    const suggestion = suggest(typeStr, SLIDE_TYPES);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    push(
      `Unknown slide type '${typeStr}'. Valid: ${SLIDE_TYPES.join(", ")}.${hint}`,
    );
    return errors;
  }
  const type = typeStr as SlideType;

  // Unknown fields
  const known = KNOWN_FIELDS[type];
  for (const key of Object.keys(config)) {
    if (!known.has(key)) {
      const suggestion = suggest(key, known);
      const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
      push(`Slide (type: ${type}): unknown field '${key}'.${hint}`);
    }
  }

  // Required fields
  for (const field of REQUIRED_FIELDS[type]) {
    const value = config[field];
    if (value === undefined || value === null || value === "") {
      push(`Slide (type: ${type}): missing required field '${field}'.`);
    }
  }

  // imageAlt required if image is set
  if (
    config.image !== undefined &&
    (config.imageAlt === undefined || config.imageAlt === "")
  ) {
    push(
      `Slide (type: ${type}): 'image' is set but 'imageAlt' is missing. Required for accessibility.`,
    );
  }

  // slideImage: nested block validation
  if (config.slideImage !== undefined) {
    validateSlideImageBlock(config.slideImage, push);
  }

  // overlay: format check
  if (config.overlay !== undefined) {
    if (typeof config.overlay !== "string") {
      push(
        `Slide: 'overlay' must be a string in "color/alpha" form (e.g. "black/50"), got ${typeof config.overlay}.`,
      );
    } else if (!/^(black|white)\/(?:100|\d{1,2})$/.test(config.overlay)) {
      push(
        `Slide: 'overlay' must be "<color>/<alpha>" where color is "black" or "white" and alpha is 0-100 (e.g. "black/50"), got "${config.overlay}".`,
      );
    }
  }

  // slideVideo: nested block validation
  if (config.slideVideo !== undefined) {
    validateSlideVideoBlock(config.slideVideo, push);
  }

  // slideText: nested block validation
  if (config.slideText !== undefined) {
    validateSlideTextBlock(config.slideText, push);
  }

  // images: optional array validation
  if (config.images !== undefined) {
    validateImagesArray(
      config.images,
      push,
      `Slide (type: ${type})`,
    );
  }

  // Enum value validation (size, fit)
  for (const field of Object.keys(ENUM_VALUES)) {
    const value = config[field];
    if (value === undefined) continue;
    if (!known.has(field)) continue; // skip fields not valid for this slide type
    const valid = ENUM_VALUES[field];
    if (typeof value !== "string" || !valid.includes(value)) {
      const suggestion =
        typeof value === "string" ? suggest(value, valid) : undefined;
      const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
      push(
        `Slide (type: ${type}): invalid '${field}' value '${String(value)}'. Valid: ${valid.join(", ")}.${hint}`,
      );
    }
  }

  // String type checks
  for (const field of STRING_FIELDS_BY_TYPE[type]) {
    const value = config[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      push(
        `Slide (type: ${type}): field '${field}' must be a string, got ${typeof value}. Hint: quote percentages and numeric-looking values, e.g. width: "50%".`,
      );
    }
  }

  // copyright: a CreditLine, or an array of them. A CreditLine is either a
  // plain string or a `{ name, href }` link object.
  if (
    config.copyright !== undefined &&
    !isValidCopyright(config.copyright)
  ) {
    push(
      `Slide (type: ${type}): 'copyright' must be a string, a { name, href } object, or an array of those.`,
    );
  }

  // Boolean type checks
  for (const field of BOOLEAN_FIELDS_BY_TYPE[type]) {
    const value = config[field];
    if (value !== undefined && typeof value !== "boolean") {
      push(
        `Slide (type: ${type}): field '${field}' must be a boolean (true/false), got ${typeof value}.`,
      );
    }
  }

  return errors;
}

// --- Imports & binding resolution ------------------------------------------

// Parses ES module import statements at the top of a deck.mdx body and
// returns the set of identifiers they introduce into scope. Used to catch
// YAML slide blocks that reference a binding (e.g. `image: img83`) which is
// no longer imported, before the broken `image={img83}` JSX reaches MDX and
// renders a silent empty page.
//
// Recognises default, named (with `as` aliases), namespace, and combined
// `default, { named }` forms. The decks today use only default imports,
// but supporting the full ESM surface keeps the check honest.
export function extractImports(code: string): Set<string> {
  const imports = new Set<string>();
  const re = /^\s*import\s+([^"';]+?)\s+from\s+["'][^"']+["']/gm;
  for (const match of code.matchAll(re)) {
    const clause = match[1];
    const parts = clause.match(/\{[^}]*\}|\*\s+as\s+\w+|\w+/g) ?? [];
    for (const part of parts) {
      if (part.startsWith("{")) {
        for (const seg of part.slice(1, -1).split(",")) {
          const trimmed = seg.trim();
          if (!trimmed) continue;
          const aliasMatch = trimmed.match(/\s+as\s+(\w+)$/);
          imports.add(aliasMatch ? aliasMatch[1] : trimmed);
        }
      } else if (part.startsWith("*")) {
        const ns = part.match(/\*\s+as\s+(\w+)/);
        if (ns) imports.add(ns[1]);
      } else {
        imports.add(part);
      }
    }
  }
  return imports;
}

export function validateBindings(
  slides: readonly ExtractedSlide[],
  imports: ReadonlySet<string>,
): SlideValidationError[] {
  const errors: SlideValidationError[] = [];

  const checkBinding = (
    value: unknown,
    fieldPath: string,
    ctx: { file: string; line: number },
  ): void => {
    if (typeof value !== "string" || value === "") return;
    if (URL_PATTERN.test(value)) return;
    if (!IDENTIFIER_PATTERN.test(value)) return;
    const root = value.split(".")[0];
    if (imports.has(root)) return;
    const suggestion = suggest(root, imports);
    const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
    errors.push({
      file: ctx.file,
      line: ctx.line,
      message: `Slide: '${fieldPath}' references binding '${root}' which is not imported in this deck.${hint} Add an import at the top of the file, or use a URL path starting with '/'.`,
    });
  };

  for (const slide of slides) {
    const { config, line, file } = slide;
    const ctx = { file, line };

    checkBinding(config.image, "image", ctx);

    if (
      config.slideImage &&
      typeof config.slideImage === "object" &&
      !Array.isArray(config.slideImage)
    ) {
      const si = config.slideImage as Record<string, unknown>;
      checkBinding(si.src, "slideImage.src", ctx);
    }

    if (Array.isArray(config.images)) {
      config.images.forEach((item, idx) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          checkBinding(
            (item as Record<string, unknown>).src,
            `images[${idx}].src`,
            ctx,
          );
        }
      });
    }
  }

  return errors;
}

// --- Extraction ------------------------------------------------------------

export interface ExtractionResult {
  slides: ExtractedSlide[];
  parseErrors: SlideValidationError[];
}

export function extractSlidesFromMdx(
  code: string,
  file: string,
): ExtractionResult {
  const frontmatterMatch = code.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  const frontmatter = frontmatterMatch?.[0] ?? "";
  const body = code.slice(frontmatter.length);

  const slides: ExtractedSlide[] = [];
  const parseErrors: SlideValidationError[] = [];
  const regex = /(?:^|\n)---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/g;

  for (const match of body.matchAll(regex)) {
    const yamlContent = match[1];

    const startsWithNewline = match[0].startsWith("\n");
    const fenceOffset = (match.index ?? 0) + (startsWithNewline ? 1 : 0);
    const absoluteOffset = frontmatter.length + fenceOffset;
    // 1-indexed line number of the opening `---`
    const line = code.slice(0, absoluteOffset).split("\n").length;

    let parsed: unknown;
    try {
      parsed = parseYaml(yamlContent);
    } catch (e) {
      // Parse failure inside a YAML fence is a build error. Silent skip
      // (the prior behavior) caused the plugin to leave `---...---` in the
      // body, which then confused MDX and rendered the deck empty without
      // any diagnostic. Surface as a validation error.
      const message = (e as Error).message.split("\n")[0];
      parseErrors.push({
        file,
        line,
        message: `YAML parse error: ${message}. Hint: quote prose values that contain ': ' (a colon followed by a space) so YAML doesn't read them as nested mappings.`,
      });
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      parseErrors.push({
        file,
        line,
        message: `Fence content is not a YAML object (got ${parsed === null || parsed === undefined ? "empty fence" : Array.isArray(parsed) ? "array" : typeof parsed}). Slide fences must be a mapping with at least one field.`,
      });
      continue;
    }

    slides.push({
      config: parsed as Record<string, unknown>,
      line,
      file,
    });
  }

  return { slides, parseErrors };
}

export function formatValidationErrors(
  errors: readonly SlideValidationError[],
): string {
  return errors
    .map((e) => `  ${e.file}:${e.line}\n    ${e.message}`)
    .join("\n\n");
}

// --- Emission --------------------------------------------------------------

// Emits a string value as either a bare JS expression (when it looks like an
// identifier or member access) or a string literal otherwise. Used for
// binding-aware fields and inside the per-image `images[].src` items.
function emitBindingOrString(value: string): string {
  if (!URL_PATTERN.test(value) && IDENTIFIER_PATTERN.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

function emitAttr(
  key: string,
  value: unknown,
  bindingFields: ReadonlySet<string> = BINDING_FIELDS,
): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return ` ${key}={${value}}`;
  if (typeof value === "number") return ` ${key}={${value}}`;

  if (Array.isArray(value)) {
    const items = value.map((v) => JSON.stringify(v)).join(", ");
    return ` ${key}={[${items}]}`;
  }

  if (typeof value === "string") {
    if (bindingFields.has(key)) {
      return ` ${key}={${emitBindingOrString(value)}}`;
    }
    return ` ${key}={${JSON.stringify(value)}}`;
  }

  // Plain object: emits as a JS object literal. Used by `copyright` link
  // form `{ name, href }`. JSON.stringify produces valid JS object-literal
  // syntax (quoted keys are accepted in JSX expressions).
  if (typeof value === "object") {
    return ` ${key}={${JSON.stringify(value)}}`;
  }

  return "";
}

// Emits a <SlideImage /> child from a slideImage YAML block. Uses
// SLIDE_IMAGE_BINDING_FIELDS so the per-item src resolves to a JS binding
// when it looks like an identifier (bare name or dotted member access).
function emitSlideImageJsx(block: Record<string, unknown>): string {
  const attrs = Object.entries(block)
    .map(([k, v]) => emitAttr(k, v, SLIDE_IMAGE_BINDING_FIELDS))
    .join("");
  return `<SlideImage${attrs} />`;
}

// Emits a <SlideVideo /> child from a slideVideo YAML block. Uses an empty
// binding-fields set so src is always emitted as a string literal: video
// files live under /public, not as JS imports.
function emitSlideVideoJsx(block: Record<string, unknown>): string {
  const attrs = Object.entries(block)
    .map(([k, v]) => emitAttr(k, v, SLIDE_VIDEO_BINDING_FIELDS))
    .join("");
  return `<SlideVideo${attrs} />`;
}

// Emits a <SlideText /> child from a slideText YAML block. All fields are
// plain strings (no JS bindings).
function emitSlideTextJsx(block: Record<string, unknown>): string {
  const attrs = Object.entries(block)
    .map(([k, v]) => emitAttr(k, v, SLIDE_TEXT_BINDING_FIELDS))
    .join("");
  return `<SlideText${attrs} />`;
}

// Emits the `images` array prop. Each item resolves `src`
// as a binding-or-string and `alt` as a JSON-quoted string literal. Items
// that don't match the expected shape are emitted as best-effort; the
// validator should have rejected malformed input upstream.
function emitImagesArray(items: readonly unknown[]): string {
  const parts: string[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const obj = item as Record<string, unknown>;
    const src = obj.src;
    const alt = obj.alt;
    if (typeof src !== "string") continue;
    const srcExpr = emitBindingOrString(src);
    const altExpr = JSON.stringify(typeof alt === "string" ? alt : "");
    const fragments = [`src: ${srcExpr}`, `alt: ${altExpr}`];
    // Per-image copyright accepts the same shape as the top-level field:
    // a string, a `{ name, href }` link object, or an array mixing both.
    // JSON.stringify covers all three (objects emit as valid JS literals).
    if (obj.copyright !== undefined && isValidCopyright(obj.copyright)) {
      fragments.push(`copyright: ${JSON.stringify(obj.copyright)}`);
    }
    parts.push(`{ ${fragments.join(", ")} }`);
  }
  return `[${parts.join(", ")}]`;
}

function buildSlideJsx(config: Record<string, unknown>): string {
  const notes = config.notes as string | undefined;
  const slideImage =
    config.slideImage && typeof config.slideImage === "object" && !Array.isArray(config.slideImage)
      ? (config.slideImage as Record<string, unknown>)
      : undefined;
  const slideVideo =
    config.slideVideo && typeof config.slideVideo === "object" && !Array.isArray(config.slideVideo)
      ? (config.slideVideo as Record<string, unknown>)
      : undefined;
  const slideText =
    config.slideText && typeof config.slideText === "object" && !Array.isArray(config.slideText)
      ? (config.slideText as Record<string, unknown>)
      : undefined;

  const componentName = "Slide";

  // Fields with bespoke emission live outside the generic emitAttr loop.
  // `overlay` flows through as a regular prop (Slide.astro renders the overlay
  // div internally from the prop). `images` and `text` are handled specially
  // below (images via emitImagesArray; text as a <SlideMarkdown> child).
  const specialFields = new Set<string>([
    "type",
    "notes",
    "slideImage",
    "slideVideo",
    "slideText",
    "images",
    "text",
  ]);

  const attrs = Object.entries(config)
    .filter(([k]) => !specialFields.has(k))
    .map(([k, v]) => emitAttr(k, v))
    .join("");

  let extraAttrs = "";
  if (Array.isArray(config.images)) {
    extraAttrs = ` images={${emitImagesArray(config.images)}}`;
  }

  // Children. slideImage/slideVideo/slideText/text are emitted as children;
  // overlay is now a prop on <Slide> (rendered internally by Slide.astro).
  // Render order: SlideImage, SlideVideo, SlideText (z-10), SlideMarkdown,
  // SlideNotes — slideText last among visible content so it sits over any
  // foreground image/video.
  const children: string[] = [];
  if (slideImage) {
    children.push(emitSlideImageJsx(slideImage));
  }
  if (slideVideo) {
    children.push(emitSlideVideoJsx(slideVideo));
  }
  if (slideText) {
    children.push(emitSlideTextJsx(slideText));
  }
  if (typeof config.text === "string" && config.text.length > 0) {
    children.push(`<SlideMarkdown text={${JSON.stringify(config.text)}} />`);
  }
  if (notes) {
    children.push(`<SlideNotes>{${JSON.stringify(notes)}}</SlideNotes>`);
  }

  if (children.length > 0) {
    const indented = children.map((c) => `  ${c}`).join("\n");
    return `<${componentName}${attrs}${extraAttrs}>\n${indented}\n</${componentName}>`;
  }

  return `<${componentName}${attrs}${extraAttrs} />`;
}

// --- Plugin ----------------------------------------------------------------

export function presentationSlides(): Plugin {
  return {
    name: "presentation-slides",
    enforce: "pre",
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, "/");
      if (!normalizedId.endsWith(DECK_FILE_SUFFIX)) return null;

      // Validate first (one parse pass), then emit (second parse pass).
      // YAML parsing is cheap; the duplication keeps the two responsibilities
      // separated and makes the validator reusable from the standalone script.
      const { slides, parseErrors } = extractSlidesFromMdx(
        code,
        normalizedId,
      );
      const imports = extractImports(code);
      const errors = [
        ...parseErrors,
        ...slides.flatMap((s) =>
          validateSlide(s.config, { file: s.file, line: s.line }),
        ),
        ...validateBindings(slides, imports),
      ];
      if (errors.length > 0) {
        const formatted = formatValidationErrors(errors);
        throw new Error(
          `Slide validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n\n${formatted}\n`,
        );
      }

      // Skip the deck-level frontmatter at the top of the file.
      const frontmatterMatch = code.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
      const frontmatter = frontmatterMatch?.[0] ?? "";
      const body = code.slice(frontmatter.length);

      let didTransform = false;
      const transformed = body.replace(
        /(?:^|\n)---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/g,
        (match, yamlContent: string) => {
          let parsed: unknown;
          try {
            parsed = parseYaml(yamlContent);
          } catch {
            return match;
          }
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return match;
          }

          didTransform = true;
          const leading = match.startsWith("\n") ? "\n" : "";
          return leading + buildSlideJsx(parsed as Record<string, unknown>);
        },
      );

      if (!didTransform) return null;

      return { code: frontmatter + transformed, map: null };
    },
  };
}
