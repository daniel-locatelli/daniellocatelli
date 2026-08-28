import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractRefs,
  classifyRef,
  collectIds,
  parseSrcset,
} from "../../src/lib/link-check/extract";

const ORIGIN = "https://daniellocatelli.com";

const PAGE = `<!doctype html><html><head>
<link rel="canonical" href="https://daniellocatelli.com/" />
<link rel="alternate" hreflang="pt" href="https://daniellocatelli.com/pt/" />
<link rel="stylesheet" href="/_astro/style.css" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="preload" as="font" href="/fonts/montserrat.woff2" />
<script src="/_astro/hoisted.js"></script>
</head><body>
<a href="/projects">Projects</a>
<a href="mailto:contact@daniellocatelli.com">Mail</a>
<a href="https://buildsystems.de">External</a>
<img src="/_astro/hero.webp" srcset="/_astro/hero.webp 640w, /_astro/hero-2x.webp 1280w" alt="Hero" />
<picture><source srcset="/_astro/wide.webp 1280w" /></picture>
<video poster="/_astro/poster.jpg"><source src="/media/clip.mp4" /></video>
<iframe src="/embed/dome"></iframe>
<h2 id="method">Method</h2>
</body></html>`;

test("extractRefs: picks up every reference the browser loads", () => {
  const refs = extractRefs(PAGE);
  assert.deepEqual(refs, [
    { kind: "canonical", href: "https://daniellocatelli.com/" },
    { kind: "alternate", href: "https://daniellocatelli.com/pt/" },
    { kind: "anchor", href: "/projects" },
    { kind: "anchor", href: "mailto:contact@daniellocatelli.com" },
    { kind: "anchor", href: "https://buildsystems.de" },
    { kind: "img", href: "/_astro/hero.webp" },
    { kind: "img", href: "/_astro/hero-2x.webp" },
    { kind: "img", href: "/_astro/wide.webp" },
    { kind: "script", href: "/_astro/hoisted.js" },
    { kind: "stylesheet", href: "/_astro/style.css" },
    { kind: "icon", href: "/favicon.ico" },
    { kind: "icon", href: "/apple-touch-icon.png" },
    { kind: "manifest", href: "/manifest.webmanifest" },
    { kind: "preload", href: "/fonts/montserrat.woff2" },
    { kind: "media", href: "/media/clip.mp4" },
    { kind: "poster", href: "/_astro/poster.jpg" },
    { kind: "iframe", href: "/embed/dome" },
  ]);
});

test("extractRefs: an asset url repeated in a document yields one ref", () => {
  // /_astro/hero.webp appears in both src and srcset above.
  const hero = extractRefs(PAGE).filter((r) => r.href === "/_astro/hero.webp");
  assert.equal(hero.length, 1);
});

test("extractRefs: rel token matching does not confuse canonical with icon", () => {
  const html = `<link rel="canonical" href="/here" /><link rel="icon" href="/i.ico" />`;
  const refs = extractRefs(html);
  assert.deepEqual(refs, [
    { kind: "canonical", href: "/here" },
    { kind: "icon", href: "/i.ico" },
  ]);
});

test("extractRefs: preload imagesrcset candidates are collected", () => {
  const html = `<link rel="preload" as="image" imagesrcset="/a.webp 640w, /b.webp 1280w" />`;
  assert.deepEqual(extractRefs(html), [
    { kind: "preload", href: "/a.webp" },
    { kind: "preload", href: "/b.webp" },
  ]);
});

test("extractRefs: empty attribute values are dropped", () => {
  assert.deepEqual(extractRefs(`<img src="" srcset="" />`), []);
});

test("extractRefs: whitespace-only attribute values are dropped", () => {
  assert.deepEqual(extractRefs(`<img src="   " />`), []);
});

test("extractRefs: rel list separated by a tab, uppercase, still matches icon", () => {
  const html = `<link rel="SHORTCUT\tICON" href="/favicon.ico" />`;
  assert.deepEqual(extractRefs(html), [
    { kind: "icon", href: "/favicon.ico" },
  ]);
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

test("parseSrcset: single url with no descriptor", () => {
  assert.deepEqual(parseSrcset("/_astro/a.webp"), ["/_astro/a.webp"]);
});

test("parseSrcset: multiple candidates with width descriptors", () => {
  assert.deepEqual(
    parseSrcset("/_astro/a.webp 640w, /_astro/b.webp 1280w"),
    ["/_astro/a.webp", "/_astro/b.webp"],
  );
});

test("parseSrcset: density descriptors and irregular whitespace", () => {
  assert.deepEqual(
    parseSrcset("  /a.png 1x ,\n  /b.png   2x  "),
    ["/a.png", "/b.png"],
  );
});

test("parseSrcset: a url containing commas is one candidate", () => {
  // Commas are legal in URLs. A naive split(",") invents phantom paths here.
  assert.deepEqual(
    parseSrcset("data:image/png;base64,iVBORw0,AAA 1x, /b.png 2x"),
    ["data:image/png;base64,iVBORw0,AAA", "/b.png"],
  );
});

test("parseSrcset: candidate with a trailing comma and no descriptor", () => {
  assert.deepEqual(parseSrcset("/a.png, /b.png 2x"), ["/a.png", "/b.png"]);
});

test("parseSrcset: a comma inside a url does not split the candidate", () => {
  // WHATWG: the URL is the leading run of non-whitespace characters, so the
  // embedded comma belongs to the URL. A naive split(",") would invent /b.png.
  assert.deepEqual(parseSrcset("/a.png,/b.png 2x"), ["/a.png,/b.png"]);
});

test("parseSrcset: empty and whitespace-only values yield nothing", () => {
  assert.deepEqual(parseSrcset(""), []);
  assert.deepEqual(parseSrcset("   ,  , "), []);
});

test("classifyRef: an asset on our own origin is internal and flagged", () => {
  const result = classifyRef(
    { kind: "img", href: "https://daniellocatelli.com/_astro/a.webp" },
    ORIGIN,
  );
  assert.deepEqual(result, {
    type: "internal",
    path: "/_astro/a.webp",
    fragment: null,
    absoluteSelfLink: true,
  });
});

test("classifyRef: an off-origin asset is external", () => {
  const result = classifyRef(
    { kind: "script", href: "https://cdn.example.com/x.js" },
    ORIGIN,
  );
  assert.deepEqual(result, { type: "external" });
});

test("classifyRef: a data uri asset is skipped", () => {
  const result = classifyRef(
    { kind: "img", href: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" },
    ORIGIN,
  );
  assert.deepEqual(result, { type: "skip" });
});

test("classifyRef: an svg sprite fragment keeps path and fragment apart", () => {
  const result = classifyRef(
    { kind: "img", href: "/icons/sprite.svg#arrow" },
    ORIGIN,
  );
  assert.deepEqual(result, {
    type: "internal",
    path: "/icons/sprite.svg",
    fragment: "arrow",
    absoluteSelfLink: false,
  });
});
