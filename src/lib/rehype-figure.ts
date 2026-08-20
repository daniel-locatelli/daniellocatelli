import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import { figureCaption } from "./figure-caption";

/**
 * Rehype plugin that wraps <img> elements with alt text in
 * <figure> + <figcaption>, turning markdown image alt text
 * into visible captions. The markdown image title overrides the caption
 * (see figureCaption): a title of "-" suppresses it, any other title
 * replaces the alt as the visible text.
 */
export function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName !== "img" ||
        !node.properties?.alt ||
        !parent ||
        index === undefined
      )
        return;

      const alt = String(node.properties.alt);
      if (!alt) return;

      // Skip if already inside a <figure>
      if ((parent as Element).tagName === "figure") return;

      const title = node.properties.title == null ? null : String(node.properties.title);
      const caption = figureCaption(alt, title);
      // The title is a caption directive, not a tooltip.
      if (title != null) delete node.properties.title;
      if (!caption) return;

      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          node,
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["mt-2", "text-center", "text-sm", "text-zinc-400"] },
            children: [{ type: "text", value: caption }],
          },
        ],
      };

      // Replace the <img> (or its <p> wrapper) with the <figure>
      if ((parent as Element).tagName === "p" && parent.children.length === 1) {
        // Markdown wraps images in <p> — replace the whole <p>
        const grandparent = findParent(tree, parent as Element);
        if (grandparent) {
          const pIndex = grandparent.children.indexOf(parent as any);
          if (pIndex !== -1) {
            grandparent.children[pIndex] = figure as any;
          }
        }
      } else {
        parent.children[index] = figure as any;
      }
    });
  };
}

function findParent(tree: Root, target: Element): Element | Root | null {
  let result: Element | Root | null = null;
  visit(tree, "element", (node: Element) => {
    if (node.children?.includes(target as any)) {
      result = node;
    }
  });
  if (tree.children?.includes(target as any)) {
    result = tree;
  }
  return result;
}
