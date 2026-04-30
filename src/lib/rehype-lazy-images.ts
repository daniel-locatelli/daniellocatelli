import type { Root } from "hast";
import { visit } from "unist-util-visit";

// First N body images render eager so the top of the page paints with content
// already in place. Subsequent images are tagged for an IntersectionObserver
// in [...subpage].astro that flips them to eager well before they enter the
// viewport, smoothing fast scroll/pan over long pages.
const EAGER_COUNT = 2;

export function rehypeLazyImages() {
  return (tree: Root) => {
    let imageIndex = 0;
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      node.properties = node.properties || {};
      node.properties.decoding = "async";
      if (imageIndex < EAGER_COUNT) {
        node.properties.loading = "eager";
      } else {
        node.properties.loading = "lazy";
        node.properties.dataPreload = "true";
      }
      imageIndex++;
    });
  };
}
