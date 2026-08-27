import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractRefs,
  classifyRef,
  collectIds,
} from "../../src/lib/link-check/extract";

const ORIGIN = "https://daniellocatelli.com";

const PAGE = `<!doctype html><html><head>
<link rel="canonical" href="https://daniellocatelli.com/" />
<link rel="alternate" hreflang="pt" href="https://daniellocatelli.com/pt/" />
<link rel="stylesheet" href="/_astro/style.css" />
</head><body>
<a href="/projects">Projects</a>
<a href="mailto:contact@daniellocatelli.com">Mail</a>
<a href="https://buildsystems.de">External</a>
<h2 id="method">Method</h2>
</body></html>`;

test("extractRefs: picks up anchors, canonical and alternates only", () => {
  const refs = extractRefs(PAGE);
  assert.deepEqual(refs, [
    { kind: "canonical", href: "https://daniellocatelli.com/" },
    { kind: "alternate", href: "https://daniellocatelli.com/pt/" },
    { kind: "anchor", href: "/projects" },
    { kind: "anchor", href: "mailto:contact@daniellocatelli.com" },
    { kind: "anchor", href: "https://buildsystems.de" },
  ]);
});

test("extractRefs: ignores stylesheet links", () => {
  const hrefs = extractRefs(PAGE).map((r) => r.href);
  assert.equal(hrefs.includes("/_astro/style.css"), false);
});

test("classifyRef: root-relative anchor is internal", () => {
  const result = classifyRef({ kind: "anchor", href: "/projects/" }, ORIGIN);
  assert.deepEqual(result, {
    type: "internal",
    path: "/projects",
    fragment: null,
    absoluteSelfLink: false,
  });
});

test("classifyRef: fragment is split off the path", () => {
  const result = classifyRef(
    { kind: "anchor", href: "/research#method" },
    ORIGIN,
  );
  assert.deepEqual(result, {
    type: "internal",
    path: "/research",
    fragment: "method",
    absoluteSelfLink: false,
  });
});

test("classifyRef: mailto and tel are skipped", () => {
  assert.deepEqual(
    classifyRef({ kind: "anchor", href: "mailto:a@b.c" }, ORIGIN),
    {
      type: "skip",
    },
  );
  assert.deepEqual(
    classifyRef({ kind: "anchor", href: "tel:+41000" }, ORIGIN),
    {
      type: "skip",
    },
  );
});

test("classifyRef: empty and pure-fragment hrefs are skipped", () => {
  assert.deepEqual(classifyRef({ kind: "anchor", href: "" }, ORIGIN), {
    type: "skip",
  });
  assert.deepEqual(classifyRef({ kind: "anchor", href: "#top" }, ORIGIN), {
    type: "skip",
  });
});

test("classifyRef: off-origin http is external", () => {
  assert.deepEqual(
    classifyRef({ kind: "anchor", href: "https://buildsystems.de" }, ORIGIN),
    { type: "external" },
  );
});

test("classifyRef: an <a> to our own origin is internal and flagged", () => {
  const result = classifyRef(
    { kind: "anchor", href: "https://daniellocatelli.com/projects/" },
    ORIGIN,
  );
  assert.deepEqual(result, {
    type: "internal",
    path: "/projects",
    fragment: null,
    absoluteSelfLink: true,
  });
});

test("classifyRef: canonical and alternate to our origin are NOT flagged", () => {
  // Absolute self-origin URLs are correct for these tags by design.
  for (const kind of ["canonical", "alternate"] as const) {
    const result = classifyRef(
      { kind, href: "https://daniellocatelli.com/pt/" },
      ORIGIN,
    );
    assert.deepEqual(result, {
      type: "internal",
      path: "/pt",
      fragment: null,
      absoluteSelfLink: false,
    });
  }
});

test("collectIds: returns every element id on the page", () => {
  const ids = collectIds(PAGE);
  assert.ok(ids.has("method"));
  assert.equal(ids.has("nope"), false);
});
