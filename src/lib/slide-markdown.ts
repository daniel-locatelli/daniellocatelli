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

export function renderSlideMarkdown(input: string): string {
  if (!input) return "";
  // Strip exactly one trailing newline (YAML's default `|` chomp leaves
  // exactly one) so authors don't get a phantom empty paragraph.
  const trimmed = input.endsWith("\n") ? input.slice(0, -1) : input;
  return slideMarked.parse(trimmed, { ...OPTIONS, async: false });
}
