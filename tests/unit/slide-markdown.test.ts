import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { renderSlideMarkdown } from "../../src/lib/slide-markdown.ts";

describe("renderSlideMarkdown", () => {
  test("renders h1 from a single hash heading", () => {
    const out = renderSlideMarkdown("# Modelagem Associativa");
    assert.match(out, /^<h1>Modelagem Associativa<\/h1>/);
  });

  test("renders h2 from two hashes", () => {
    const out = renderSlideMarkdown("## Subhead");
    assert.match(out, /^<h2>Subhead<\/h2>/);
  });

  test("collapses h4+ down to h3", () => {
    const out = renderSlideMarkdown("#### Deep");
    assert.match(out, /<h3>Deep<\/h3>/);
  });

  test("renders h3 from three hashes", () => {
    const out = renderSlideMarkdown("### Tertiary");
    assert.match(out, /^<h3>Tertiary<\/h3>/);
  });

  test("renders body paragraphs", () => {
    const out = renderSlideMarkdown("Plain body text.");
    assert.match(out, /<p>Plain body text\.<\/p>/);
  });

  test("renders blockquote", () => {
    const out = renderSlideMarkdown("> A quote");
    assert.match(out, /<blockquote>[\s\S]*<p>A quote<\/p>[\s\S]*<\/blockquote>/);
  });

  test("renders strong and em", () => {
    const out = renderSlideMarkdown("This is **bold** and *italic*.");
    assert.match(out, /<strong>bold<\/strong>/);
    assert.match(out, /<em>italic<\/em>/);
  });

  test("renders unordered list items", () => {
    const out = renderSlideMarkdown("- Alpha\n- Beta");
    assert.match(out, /<ul>/);
    assert.match(out, /<li>Alpha<\/li>/);
  });

  test("renders ordered list items", () => {
    const out = renderSlideMarkdown("1. First\n2. Second");
    assert.match(out, /<ol>/);
    assert.match(out, /<li>First<\/li>/);
  });

  test("strips raw HTML", () => {
    const out = renderSlideMarkdown("Hello <script>alert(1)</script> world");
    assert.doesNotMatch(out, /<script>/);
  });

  test("strips links (renders link text only)", () => {
    const out = renderSlideMarkdown("[click](http://example.com)");
    assert.match(out, /click/);
    assert.doesNotMatch(out, /<a /);
  });

  test("strips images entirely", () => {
    const out = renderSlideMarkdown("![alt](/img.png)");
    assert.doesNotMatch(out, /<img/);
  });

  test("strips code blocks", () => {
    const out = renderSlideMarkdown("```\nconst x = 1;\n```");
    assert.doesNotMatch(out, /<pre>|<code>/);
  });

  test("strips inline code (codespan)", () => {
    const out = renderSlideMarkdown("Use `const` here.");
    assert.doesNotMatch(out, /<code>/);
  });

  test("returns empty string for empty input", () => {
    assert.equal(renderSlideMarkdown(""), "");
  });

  test("does not produce trailing empty paragraph from single trailing newline", () => {
    const out = renderSlideMarkdown("Body text.\n");
    // Exactly one <p>, no trailing empty <p></p>
    const matches = out.match(/<p>/g) ?? [];
    assert.equal(matches.length, 1);
  });

  test("renders multi-block content in order", () => {
    const out = renderSlideMarkdown("# Title\n\nBody.\n\n> Quote.");
    const titleIdx = out.indexOf("<h1>");
    const bodyIdx = out.indexOf("<p>Body");
    const quoteIdx = out.indexOf("<blockquote");
    assert.ok(titleIdx >= 0 && bodyIdx > titleIdx && quoteIdx > bodyIdx);
  });
});
