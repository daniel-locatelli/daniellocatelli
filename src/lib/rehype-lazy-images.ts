import type { Root } from "hast";
import { visit } from "unist-util-visit";

export function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        node.properties = node.properties || {};
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
    });
  };
}
