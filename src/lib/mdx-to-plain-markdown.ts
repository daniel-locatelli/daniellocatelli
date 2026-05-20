import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkMdx from "remark-mdx";
import { visit, SKIP } from "unist-util-visit";
import type { Root } from "mdast";

function stripMdxNodes() {
  return (tree: Root) => {
    // Flow-level JSX and ESM nodes are removed entirely.
    const removeTypes = new Set([
      "mdxJsxFlowElement",
      "mdxFlowExpression",
      "mdxTextExpression",
      "mdxjsEsm",
    ]);
    // Inline JSX: replace the element with its own text children so that
    // e.g. <Tooltip>inline</Tooltip> leaves "inline" in the output.
    visit(tree, (node, index, parent) => {
      if (parent && typeof index === "number") {
        if (removeTypes.has(node.type)) {
          (parent.children as any[]).splice(index, 1);
          return [SKIP, index];
        }
        if (node.type === "mdxJsxTextElement") {
          const children = (node as any).children ?? [];
          (parent.children as any[]).splice(index, 1, ...children);
          return [SKIP, index];
        }
      }
    });
  };
}

export async function mdxToPlainMarkdown(input: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(stripMdxNodes)
    .use(remarkStringify, { bullet: "-", fences: true })
    .process(input);
  return String(file).replace(/\n{3,}/g, "\n\n");
}
