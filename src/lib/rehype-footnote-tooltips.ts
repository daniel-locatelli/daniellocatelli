import { visit } from "unist-util-visit";
import type { Root, Element, ElementContent } from "hast";

/**
 * Rehype plugin that augments markdown footnotes with hover tooltips.
 *
 * After remark-gfm produces the standard footnote markup
 * (`<sup><a data-footnote-ref href="#user-content-fn-N">N</a></sup>` inline,
 * and a `<section data-footnotes>...<li id="user-content-fn-N">` block),
 * this plugin:
 *   1. Builds a map from each footnote `<li>` id to its content (with the
 *      back-reference `↩` link stripped).
 *   2. Appends a sibling `<span class="footnote-tooltip">` inside each
 *      inline `<sup>`, containing the matching footnote content.
 *
 * The tooltip is then revealed purely via CSS on hover/focus of the
 * adjacent `.footnote-ref` link — no client-side JS required.
 */
export function rehypeFootnoteTooltips() {
  return (tree: Root) => {
    const footnoteContent = collectFootnoteContent(tree);
    if (footnoteContent.size === 0) return;

    replaceBackrefArrows(tree);

    visit(tree, "element", (sup: Element, supIndex, supParent) => {
      if (sup.tagName !== "sup") return;

      const ref = sup.children.find(
        (c): c is Element =>
          c.type === "element" &&
          c.tagName === "a" &&
          c.properties?.dataFootnoteRef !== undefined,
      );
      if (!ref) return;

      const href = ref.properties?.href;
      if (typeof href !== "string" || !href.startsWith("#")) return;

      const content = footnoteContent.get(href.slice(1));
      if (!content) return;

      // Glue the pill to its preceding word: a U+2060 WORD JOINER between the
      // citation phrase and the <sup> removes the line-break opportunity that
      // browsers otherwise create after closing punctuation (e.g. ")"),
      // preventing the marker from orphaning onto a new line by itself.
      if (supParent && typeof supIndex === "number" && supIndex > 0) {
        const prev = supParent.children[supIndex - 1];
        if (prev.type === "text") {
          prev.value += "⁠";
        }
      }

      ref.properties = { ...ref.properties, className: mergeClass(ref.properties?.className, "footnote-ref") };

      sup.children.push({
        type: "element",
        tagName: "span",
        properties: {
          className: ["footnote-tooltip"],
          role: "tooltip",
          // Promote the tooltip into the browser top layer so it escapes the
          // overflow-x-hidden / max-width clipping of any ancestor container.
          popover: "manual",
        },
        children: flattenBlockElements(content),
      });
    });
  };
}

function collectFootnoteContent(tree: Root): Map<string, ElementContent[]> {
  const map = new Map<string, ElementContent[]>();
  visit(tree, "element", (section: Element) => {
    if (section.tagName !== "section") return;
    if (section.properties?.dataFootnotes === undefined) return;

    visit(section, "element", (li: Element) => {
      if (li.tagName !== "li") return;
      const id = li.properties?.id;
      if (typeof id !== "string") return;
      map.set(id, stripBackrefs(li.children));
    });
  });
  return map;
}

function stripBackrefs(children: ElementContent[]): ElementContent[] {
  const result: ElementContent[] = [];
  for (const child of children) {
    if (child.type === "element") {
      if (child.tagName === "a" && child.properties?.dataFootnoteBackref !== undefined) {
        continue;
      }
      result.push({
        ...child,
        children: stripBackrefs(child.children),
      });
    } else {
      result.push(child);
    }
  }
  return result;
}

/**
 * Tooltip is rendered inside a `<sup>` (inline phrasing context). Block
 * elements like `<p>` would be auto-closed out of the `<sup>` by the HTML
 * parser, hoisting their content out of the tooltip. We therefore flatten
 * any `<p>` (the default wrapper remark generates for footnote bodies) into
 * its children, separating multiple paragraphs with `<br>`.
 */
function flattenBlockElements(children: ElementContent[]): ElementContent[] {
  const out: ElementContent[] = [];
  let lastWasParagraph = false;
  for (const child of children) {
    const isParagraph =
      child.type === "element" && (child as Element).tagName === "p";
    if (isParagraph) {
      if (lastWasParagraph) {
        out.push({ type: "element", tagName: "br", properties: {}, children: [] });
      }
      out.push(...flattenBlockElements((child as Element).children));
      lastWasParagraph = true;
    } else {
      out.push(child);
      lastWasParagraph = false;
    }
  }
  return out;
}

// remark-gfm renders the back-reference link with U+21A9 LEFTWARDS ARROW
// WITH HOOK, which many fonts auto-promote to emoji. Append U+FE0E (the
// text variation selector) so renderers pick the text glyph instead.
// Codepoints are written as escapes so the source file stays readable in
// editors that swap the bare codepoint for an emoji glyph.
const BACKREF_ARROW = "\u21A9";
const TEXT_VS = "\uFE0E";
const BACKREF_ARROW_TEXT = BACKREF_ARROW + TEXT_VS;
const UNANNOTATED_ARROW = new RegExp(`${BACKREF_ARROW}(?!${TEXT_VS})`, "g");

function replaceBackrefArrows(tree: Root) {
  visit(tree, "element", (section: Element) => {
    if (section.tagName !== "section") return;
    if (section.properties?.dataFootnotes === undefined) return;

    visit(section, "element", (a: Element) => {
      if (a.tagName !== "a") return;
      if (a.properties?.dataFootnoteBackref === undefined) return;
      for (const child of a.children) {
        if (child.type === "text") {
          child.value = child.value.replace(UNANNOTATED_ARROW, BACKREF_ARROW_TEXT);
        }
      }
    });
  });
}

function mergeClass(existing: unknown, addition: string): (string | number)[] {
  if (Array.isArray(existing)) {
    return existing.includes(addition) ? (existing as (string | number)[]) : [...(existing as (string | number)[]), addition];
  }
  if (typeof existing === "string") {
    const parts = existing.split(/\s+/).filter(Boolean);
    return parts.includes(addition) ? parts : [...parts, addition];
  }
  return [addition];
}
