import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMarkdownTarget } from "../../src/lib/resolve-markdown-target";

test("resolveMarkdownTarget: returns null when Accept lacks text/markdown", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo", accept: "text/html" }),
    null,
  );
});

test("resolveMarkdownTarget: returns null when path already ends in .md", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo.md", accept: "text/markdown" }),
    null,
  );
});

test("resolveMarkdownTarget: returns .md path when Accept includes text/markdown", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo", accept: "text/markdown" }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: drops trailing slash", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo/", accept: "text/markdown" }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: handles complex Accept with q-values", () => {
  assert.equal(
    resolveMarkdownTarget({
      pathname: "/projects/foo",
      accept: "text/html;q=0.8,text/markdown;q=1.0,*/*;q=0.5",
    }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: skips known non-content paths", () => {
  for (const p of [
    "/api/foo",
    "/_image",
    "/sitemap-index.xml",
    "/robots.txt",
    "/.well-known/mcp.json",
    "/llms.txt",
    "/pt/llms.txt",
    "/de/llms.txt",
    "/manifest.webmanifest",
    "/favicon.ico",
  ]) {
    assert.equal(
      resolveMarkdownTarget({ pathname: p, accept: "text/markdown" }),
      null,
      `expected null for ${p}`,
    );
  }
});
