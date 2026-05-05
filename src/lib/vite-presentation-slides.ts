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
//   - `type`: "slide" (default) | "title" | "text" — picks the component
//   - `notes`: emitted as <SlideNotes>{value}</SlideNotes> child of <Slide>
//   - `image`: a bare identifier (e.g. `atelier`) is emitted as a JSX
//      expression `image={atelier}`, referring to imports at the top of the
//      MDX file. Path-like values (starting with `/`, `./`, `http(s)://`,
//      `data:`, `blob:`) are emitted as string literals.
//   - All other fields are emitted as JSX attribute expressions wrapping
//     JSON-stringified values, so quote-escaping is handled uniformly.

const DECK_FILE_SUFFIX = "/deck.mdx";

const URL_PATTERN = /^(\/|\.\.?\/|https?:\/\/|data:|blob:)/;
const IDENTIFIER_PATTERN =
  /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;

// Fields whose string value is a JS binding name (resolved against the MDX's
// imports) rather than a literal string. URL-like values still emit as strings.
const BINDING_FIELDS = new Set(["image"]);

function emitAttr(key: string, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return ` ${key}={${value}}`;
  if (typeof value === "number") return ` ${key}={${value}}`;

  if (Array.isArray(value)) {
    const items = value.map((v) => JSON.stringify(v)).join(", ");
    return ` ${key}={[${items}]}`;
  }

  if (typeof value === "string") {
    if (BINDING_FIELDS.has(key) && !URL_PATTERN.test(value) && IDENTIFIER_PATTERN.test(value)) {
      return ` ${key}={${value}}`;
    }
    return ` ${key}={${JSON.stringify(value)}}`;
  }

  return "";
}

function buildSlideJsx(config: Record<string, unknown>): string {
  const type = (config.type as string | undefined) ?? "slide";
  const notes = config.notes as string | undefined;

  const componentName =
    type === "title" ? "TitleSlide" : type === "text" ? "TextSlide" : "Slide";

  const attrs = Object.entries(config)
    .filter(([k]) => k !== "type" && k !== "notes")
    .map(([k, v]) => emitAttr(k, v))
    .join("");

  if (notes && componentName === "Slide") {
    return `<Slide${attrs}>\n  <SlideNotes>{${JSON.stringify(notes)}}</SlideNotes>\n</Slide>`;
  }

  return `<${componentName}${attrs} />`;
}

export function presentationSlides(): Plugin {
  return {
    name: "presentation-slides",
    enforce: "pre",
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, "/");
      if (!normalizedId.endsWith(DECK_FILE_SUFFIX)) return null;

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
