import { test } from "node:test";
import assert from "node:assert/strict";
import { remarkImageToAstroImage } from "../../src/lib/remark-image-to-astro-image";

/**
 * Images nested inside JSX components (<Figure>, <ImageRow>) are not wrapped
 * in a <figure> by the plugin; the component builds the caption itself from
 * the rendered <img>. The plugin must therefore hand the caption directive
 * over as a data attribute, since the markdown title is otherwise lost.
 */

function treeWithImageInsideJsx(title: string | null) {
  const image: any = {
    type: "image",
    url: "./photo.jpg",
    alt: "Alt text",
    title,
  };
  const paragraph: any = { type: "paragraph", children: [image] };
  const jsx: any = {
    type: "mdxJsxFlowElement",
    name: "Figure",
    attributes: [],
    children: [paragraph],
  };
  const tree: any = { type: "root", children: [jsx] };
  return { tree, paragraph };
}

function run(title: string | null) {
  const { tree, paragraph } = treeWithImageInsideJsx(title);
  remarkImageToAstroImage()(tree, { path: "page.mdx" } as any);
  const imageJsx = paragraph.children[0];
  assert.equal(imageJsx.name, "Image");
  const attr = imageJsx.attributes.find((a: any) => a.name === "data-caption");
  return attr ? attr.value : undefined;
}

test("nested image with a title carries the title as data-caption", () => {
  assert.equal(run("Visible caption"), "Visible caption");
});

test('nested image with title "-" carries an empty data-caption', () => {
  assert.equal(run("-"), "");
});

test("nested image without a title carries no data-caption", () => {
  assert.equal(run(null), undefined);
});
