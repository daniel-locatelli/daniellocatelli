import { test } from "node:test";
import assert from "node:assert/strict";
import { mdxToPlainMarkdown } from "../../src/lib/mdx-to-plain-markdown";

test("strips inline JSX components but keeps surrounding markdown", async () => {
  const input = `# Title

Some paragraph.

<Slide image="foo.jpg" />

Another paragraph with <Tooltip text="hi">inline</Tooltip> text.
`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Title"));
  assert.ok(out.includes("Some paragraph."));
  assert.ok(out.includes("Another paragraph"));
  assert.ok(!out.includes("<Slide"));
  assert.ok(!out.includes("<Tooltip"));
  assert.ok(out.includes("inline"));
});

test("strips nested multi-line JSX blocks", async () => {
  const input = `# Deck

<Slide title="One">
  <SlideMarkdown text="hello" />
</Slide>

Paragraph after.
`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Deck"));
  assert.ok(out.includes("Paragraph after."));
  assert.ok(!out.includes("<Slide"));
  assert.ok(!out.includes("<SlideMarkdown"));
});

test("returns empty string for body that is only JSX", async () => {
  const input = `<Slide image="foo.jpg" />\n<Slide image="bar.jpg" />\n`;
  const out = await mdxToPlainMarkdown(input);
  assert.equal(out.trim(), "");
});

test("preserves import statements as stripped (no leak)", async () => {
  const input = `import Foo from "@/components/Foo";\n\n# Title\n\nText.`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Title"));
  assert.ok(out.includes("Text."));
  assert.ok(!out.includes("import Foo"));
});
