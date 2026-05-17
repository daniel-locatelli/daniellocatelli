import { Marked, type MarkedOptions } from "marked";

// Slide markdown is a constrained subset of CommonMark:
//   - Headings h1, h2, h3 (deeper levels collapse to h3)
//   - Paragraphs
//   - Emphasis: *em*, **strong**
//   - Blockquotes
//   - Unordered and ordered lists
//   - Hard line breaks via two-space-newline or backslash-newline
// Not supported: raw HTML, tables, code blocks, links, images, horizontal rules.
// Authors needing images/videos use the slideImage:/slideVideo: blocks.

// Isolated Marked instance — `marked.use()` on the global singleton would
// mutate any other consumer of the marked module in the same process.
const slideMarked = new Marked();

const OPTIONS: MarkedOptions = {
  gfm: false,
  breaks: false,
};

const renderer = new slideMarked.Renderer();

// Strip heading levels deeper than 3 down to h3 so authors cannot escape
// the typographic scale by writing #### or below.
// Use `this.parser` (not `renderer.parser`) because marked wraps these methods
// with apply(r, ...) where r is the defaults renderer — `this.parser` is the
// live Parser instance, while `renderer.parser` is never set on our standalone object.
renderer.heading = function ({ tokens, depth }) {
  const level = Math.min(depth, 3);
  const text = this.parser.parseInline(tokens);
  return `<h${level}>${text}</h${level}>`;
};

// Block raw HTML — slide text is content, not markup. Authors who need
// custom layout drop to a JSX block in the deck.
renderer.html = () => "";

// Block links + images — they have no place in slide chrome text. Images
// go through slideImage; "links" within slide prose are an antipattern.
renderer.link = function ({ tokens }) {
  return this.parser.parseInline(tokens);
};
renderer.image = () => "";
renderer.code = () => "";
renderer.codespan = () => "";
renderer.table = () => "";
renderer.hr = () => "";
// del (~~strikethrough~~) is a GFM-only token and unreachable with gfm: false.
// Kept as a safety net if gfm is ever re-enabled elsewhere.
renderer.del = () => "";

slideMarked.use({ renderer });

// U+200B (zero-width space) for spacer content. Two constraints:
//   (a) Must not count as a CommonMark blank-line character, so the line
//       survives block-level parsing as content rather than a separator.
//   (b) Must survive marked's heading tokenizer, which trims captured
//       content with JS .trim(). That strips Unicode `Zs` whitespace
//       (including U+00A0) but leaves U+200B alone because ZWSP is `Cf`
//       (format), not whitespace.
// The browser builds a line box around any inline content regardless of
// glyph width, so a ZWSP-only paragraph or heading still occupies one full
// line-height row. Visually invisible.
const SPACER_CHAR = "​";

// Detect a heading prefix on a content line. Returns the `## `, `### ` form
// so we can prepend it to a spacer line; marked then renders the spacer at
// the same height as adjacent headings. Caps at depth 3 because the renderer
// collapses deeper headings to h3 anyway.
function headingPrefix(line: string): string {
  const m = line.match(/^(#{1,6})\s/);
  if (!m) return "";
  const depth = Math.min(m[1].length, 3);
  return "#".repeat(depth) + " ";
}

// Expand blank/whitespace runs in `text:` into spacer paragraphs. Two
// authoring idioms are supported:
//
//   1. A whitespace-only line (e.g. "   ") is an explicit visual slot.
//      Each one becomes a spacer. This is the idiom for progressive-reveal
//      sequences where every line must occupy the same vertical position
//      across slides.
//
//   2. A run of N>=2 truly-empty lines with no whitespace slot in it is
//      treated as one block separator plus (N-1) spacers. Lets authors add
//      quick breathing room without typing explicit slot lines.
//
// Each spacer inherits the heading prefix of the preceding content block,
// so spacers between/after headings render as same-height empty headings.
// Documented in docs/slides/AUTHORING.md.
function expandBlankLineSpacers(input: string): string {
  const lines = input.split("\n");
  // A literal block always ends with one terminator newline; split() turns
  // that into a trailing empty element that isn't an authored blank. Drop it
  // so remaining empty trailing elements are real author-written blanks.
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const out: string[] = [];
  let lastPrefix = "";

  const pushSpacer = () => {
    out.push(lastPrefix + SPACER_CHAR);
    out.push("");
  };

  // Whitespace-only lines win: if any are present in a run, the slot count
  // equals the whitespace-line count (the surrounding empties are just
  // separators between them). Otherwise the run is pure-empty; treat extra
  // blanks as spacers (N-1 in the middle, N at a leading/trailing edge).
  const slotCount = (
    ws: number,
    blanks: number,
    isEdge: boolean,
  ): number => {
    if (ws > 0) return ws;
    return isEdge ? blanks : Math.max(0, blanks - 1);
  };

  let i = 0;

  let leadingWs = 0;
  let leadingBlanks = 0;
  while (i < lines.length && lines[i].trim() === "") {
    if (lines[i] === "") leadingBlanks++;
    else leadingWs++;
    i++;
  }
  for (let k = 0; k < slotCount(leadingWs, leadingBlanks, true); k++) {
    pushSpacer();
  }

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() !== "") {
      out.push(lines[i]);
      lastPrefix = headingPrefix(lines[i]);
      i++;
    }
    let ws = 0;
    let blanks = 0;
    while (i < lines.length && lines[i].trim() === "") {
      if (lines[i] === "") blanks++;
      else ws++;
      i++;
    }
    if (ws + blanks === 0) continue;

    const isTrailing = i >= lines.length;
    const slots = slotCount(ws, blanks, isTrailing);

    out.push("");
    for (let k = 0; k < slots; k++) pushSpacer();
  }

  return out.join("\n");
}

export function renderSlideMarkdown(input: string): string {
  if (!input) return "";
  return slideMarked.parse(expandBlankLineSpacers(input), {
    ...OPTIONS,
    async: false,
  });
}
