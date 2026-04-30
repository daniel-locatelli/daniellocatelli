import type { Root, Image as MdImage } from "mdast";
import type { VFile } from "vfile";
import { Parser } from "acorn";
import { visitParents } from "unist-util-visit-parents";

// Markdown body images get auto-converted to WebP by Astro's content
// collection pipeline, but at *original* dimensions and a single resolution.
// On long pages with 60+ images this still ships 8-15 MB to phones. This
// plugin rewrites markdown image nodes into Astro's <Image> JSX with explicit
// widths/sizes so the build emits a srcset and the browser picks a smaller
// derivative on narrow viewports.
//
// Top-level images with alt text also get wrapped in a <figure>+<figcaption>
// pair to preserve the visible caption that rehype-figure used to emit.
// rehype-figure cannot do this anymore because the inner element is now an
// Image JSX node, not a hast <img>, by the time rehype runs.
//
// Only runs on .mdx (which supports JSX). Plain .md files keep current
// behaviour because they cannot host JSX nodes.

const WIDTHS = [400, 800, 1200, 1600];
const SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px";
const FIGCAPTION_CLASS = "mt-2 text-center text-sm text-zinc-400";

function parseModule(value: string): any {
  return Parser.parse(value, {
    sourceType: "module",
    ecmaVersion: "latest",
  });
}

function expressionEstree(value: string): any {
  const program: any = Parser.parse(`(${value})`, {
    sourceType: "module",
    ecmaVersion: "latest",
  });
  return {
    type: "Program",
    sourceType: "module",
    body: [
      {
        type: "ExpressionStatement",
        expression: program.body[0].expression,
      },
    ],
  };
}

function jsxExpr(name: string, expr: string) {
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: expr,
      data: { estree: expressionEstree(expr) },
    },
  };
}

function jsxStr(name: string, value: string) {
  return { type: "mdxJsxAttribute", name, value };
}

function buildImage(importName: string, alt: string): any {
  return {
    type: "mdxJsxTextElement",
    name: "Image",
    attributes: [
      jsxExpr("src", importName),
      jsxStr("alt", alt),
      jsxExpr("widths", JSON.stringify(WIDTHS)),
      jsxStr("sizes", SIZES),
      jsxStr("loading", "lazy"),
      jsxStr("decoding", "async"),
    ],
    children: [],
  };
}

function buildFigure(image: any, caption: string): any {
  return {
    type: "mdxJsxFlowElement",
    name: "figure",
    attributes: [],
    children: [
      image,
      {
        type: "mdxJsxFlowElement",
        name: "figcaption",
        attributes: [jsxStr("class", FIGCAPTION_CLASS)],
        children: [{ type: "text", value: caption }],
      },
    ],
  };
}

export function remarkImageToAstroImage() {
  return (tree: Root, file: VFile) => {
    if (!file.path?.endsWith(".mdx")) return;

    let counter = 0;
    let hasAstroImageImport = false;
    const imports: any[] = [];

    visitParents(tree, "mdxjsEsm", (node: any) => {
      if (
        typeof node.value === "string" &&
        /import\s+(\{[^}]*\bImage\b[^}]*\}|Image)\s+from\s+['"]astro:assets['"]/.test(
          node.value,
        )
      ) {
        hasAstroImageImport = true;
      }
    });

    visitParents(tree, "image", (node: MdImage, ancestors: any[]) => {
      const url = node.url;
      if (!url) return;
      if (/^https?:\/\//.test(url)) return;
      if (url.startsWith("/")) return;

      const parent = ancestors[ancestors.length - 1];
      if (!parent || !Array.isArray(parent.children)) return;
      const index = parent.children.indexOf(node);
      if (index === -1) return;

      const insideJsx = ancestors.some(
        (a: any) =>
          a.type === "mdxJsxFlowElement" || a.type === "mdxJsxTextElement",
      );

      const importName = `__remarkImg${counter++}`;
      const importSource = `import ${importName} from ${JSON.stringify(url)};`;
      imports.push({
        type: "mdxjsEsm",
        value: importSource,
        data: { estree: parseModule(importSource) },
      });

      const imageJsx = buildImage(importName, node.alt || "");

      const grandparent =
        ancestors.length >= 2 ? ancestors[ancestors.length - 2] : null;
      const shouldWrap =
        !insideJsx &&
        !!node.alt &&
        parent.type === "paragraph" &&
        parent.children.length === 1 &&
        grandparent &&
        Array.isArray(grandparent.children);

      if (shouldWrap) {
        const figure = buildFigure(imageJsx, node.alt || "");
        const pIndex = grandparent.children.indexOf(parent);
        if (pIndex !== -1) {
          grandparent.children[pIndex] = figure;
          return;
        }
      }
      parent.children[index] = imageJsx;
    });

    if (counter === 0) return;

    const head: any[] = [];
    if (!hasAstroImageImport) {
      const value = `import { Image } from 'astro:assets';`;
      head.push({
        type: "mdxjsEsm",
        value,
        data: { estree: parseModule(value) },
      });
    }
    head.push(...imports);
    tree.children.unshift(...head);
  };
}
