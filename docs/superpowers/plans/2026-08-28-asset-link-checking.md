# Asset Link Checking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the internal link checker so every URL the browser fetches to render a page (images, scripts, stylesheets, icons, manifests, preloads, media, posters, iframes) is validated against `dist/client`, not just `<a href>` and the canonical/hreflang tags.

**Architecture:** Widen the existing extraction pipeline rather than build a parallel one. `extract.ts` gains a table of selector/attribute/kind rows plus a `srcset` candidate parser and per-document de-duplication; `classifyRef` inverts one predicate so assets warn on absolute self-origin URLs; the checker script in `src/scripts/check-links-internal.ts` is otherwise unchanged, because asset refs flow through its existing classify → resolve → follow-redirects → report loop untouched.

**Tech Stack:** TypeScript (strict), `linkedom` for HTML parsing, `node:test` + `node:assert/strict` for unit tests, `tsx` as the runner, pnpm.

## Global Constraints

- Package manager is **pnpm**, never npm.
- TypeScript strict mode. No `any`.
- Unit tests run with `pnpm test:unit` (`tsx --test tests/unit/**/*.test.ts`).
- Existence checks only: never assert on asset content, MIME type or size.
- Off-origin assets stay lychee's job. Do not touch `lychee.toml`, `src/scripts/verify-dead-links.ts` or `.github/workflows/links.yml`.
- A missing internal asset is `severity: "error"` (gates the push), matching a missing page. An absolute self-origin URL is `severity: "warning"`.
- Do not change `normalizePath`, `buildTargetMap`, `followRedirects` or any fragment-checking logic. Commit `33e5400` already made fragment checks key off the served file's type.
- Spec of record: `docs/superpowers/specs/2026-08-28-asset-link-checking-design.md`.

## File Structure

| File | Responsibility | Change |
| --- | --- | --- |
| `src/lib/link-check/extract.ts` | Pull references out of built HTML and classify each one | Modify: widen `RefKind`, add `SOURCES` table, add `parseSrcset`, dedupe, invert `absoluteSelfLink` |
| `tests/unit/link-check-extract.test.ts` | Unit coverage for the above | Modify: rewrite 2 stale tests, add ~10 |
| `src/scripts/check-links-internal.ts` | Walk `dist/client`, resolve and report | Modify: one summary line gains a reference count |

No new files. `extract.ts` stays around 200 lines, which is in keeping with the other files in `src/lib/link-check/`.

---

### Task 1: `parseSrcset`

A `srcset` attribute is a comma-separated candidate list where each candidate is a URL optionally followed by a `2x` or `640w` descriptor. Commas are legal inside URLs (`data:image/png;base64,iVBOR...`), so splitting on `,` manufactures phantom URLs that then get reported as broken internal paths. The WHATWG algorithm avoids this by defining the URL as a run of non-whitespace characters.

**Files:**
- Modify: `src/lib/link-check/extract.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `export function parseSrcset(value: string): string[]` — returns candidate URLs in source order, descriptors stripped, empty candidates dropped.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/link-check-extract.test.ts`, and add `parseSrcset` to the existing import block at the top of the file:

```ts
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
  assert.deepEqual(parseSrcset("/a.png,/b.png 2x"), ["/a.png", "/b.png"]);
});

test("parseSrcset: empty and whitespace-only values yield nothing", () => {
  assert.deepEqual(parseSrcset(""), []);
  assert.deepEqual(parseSrcset("   ,  , "), []);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL. `parseSrcset` is not exported, so `tsx` reports it as not a function (`TypeError: (0 , parseSrcset) is not a function`).

- [ ] **Step 3: Implement `parseSrcset`**

Add to `src/lib/link-check/extract.ts`, immediately below the `SKIP_SCHEMES` constant:

```ts
/**
 * Split a srcset candidate list into its URLs, discarding `2x` / `640w`
 * descriptors.
 *
 * Follows the WHATWG candidate-parsing shape rather than splitting on commas:
 * a URL is a run of non-whitespace characters, so a `data:` URI containing
 * commas survives as one candidate instead of being torn into phantom paths.
 */
export function parseSrcset(value: string): string[] {
  const urls: string[] = [];
  let i = 0;

  while (i < value.length) {
    while (i < value.length && /[\s,]/.test(value[i])) i++;
    if (i >= value.length) break;

    const start = i;
    while (i < value.length && !/\s/.test(value[i])) i++;
    const token = value.slice(start, i);

    if (token.endsWith(",")) {
      // No descriptor: the comma terminated the candidate directly.
      const url = token.replace(/,+$/, "");
      if (url !== "") urls.push(url);
      continue;
    }

    if (token !== "") urls.push(token);

    // Skip the descriptor, which never contains a comma.
    while (i < value.length && value[i] !== ",") i++;
  }

  return urls;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS. All existing tests still pass; test count rises by 6.

- [ ] **Step 5: Commit**

```bash
git add src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git commit -m "feat(links): parse srcset candidate lists into urls"
```

---

### Task 2: Table-driven extraction of every loading reference

**Files:**
- Modify: `src/lib/link-check/extract.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**
- Consumes: `parseSrcset(value: string): string[]` from Task 1.
- Produces: widened `RefKind` union; `extractRefs(html: string): Ref[]` now returns asset refs, ordered by `SOURCES` table position, de-duplicated per document on `(kind, href)`.

Note on ordering: `extractRefs` returns refs grouped in `SOURCES` order (canonical, alternate, anchor, then assets), which is the same grouping the current implementation produces for its three kinds. The two existing `deepEqual` tests assert the old, narrower contract and are **rewritten**, not deleted.

- [ ] **Step 1: Rewrite the two stale tests and add the new ones**

In `tests/unit/link-check-extract.test.ts`, first extend the `PAGE` constant so it carries the asset markup:

```ts
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
```

Then **replace** the test named `extractRefs: picks up anchors, canonical and alternates only` with:

```ts
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
```

**Replace** the test named `extractRefs: ignores stylesheet links` with:

```ts
test("extractRefs: an asset url repeated in a document yields one ref", () => {
  // /_astro/hero.webp appears in both src and srcset above.
  const hero = extractRefs(PAGE).filter((r) => r.href === "/_astro/hero.webp");
  assert.equal(hero.length, 1);
});
```

Then append these:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL. The rewritten `extractRefs: picks up every reference the browser loads` fails its `deepEqual` because only the three original kinds are returned; the `rel` token, `imagesrcset` and dedupe tests fail likewise.

- [ ] **Step 3: Widen `RefKind` and make extraction table-driven**

In `src/lib/link-check/extract.ts`, replace the file's top doc comment and the `RefKind` type:

```ts
/**
 * Pull link references out of built HTML and decide what each one is.
 *
 * Two families are collected. Navigational references (`<a href>`, the
 * canonical link, hreflang alternates) tell us where a visitor can go, and
 * broken hreflang between the en, pt and de trees is invisible without them.
 * Loading references (images, scripts, stylesheets, icons, manifests,
 * preloads, media, posters, iframes) are what the browser fetches to render
 * the page; a 404 among them breaks the page silently.
 */

export type RefKind =
  | "anchor"
  | "canonical"
  | "alternate"
  | "img"
  | "script"
  | "stylesheet"
  | "icon"
  | "manifest"
  | "preload"
  | "media"
  | "poster"
  | "iframe";
```

Then replace the whole `extractRefs` function with the table and its driver:

```ts
interface Source {
  selector: string;
  attribute: string;
  kind: RefKind;
  /** The attribute holds a srcset candidate list, not a single URL. */
  list?: boolean;
}

/**
 * Ordered because `extractRefs` returns refs grouped by row, and the report
 * reads better with navigation before assets.
 *
 * `rel~=` matches one token of a space-separated rel list, which is what
 * `rel="shortcut icon"` needs. `apple-touch-icon` is a single token and so
 * needs its own selector rather than matching the icon one.
 *
 * `<source>` appears twice on purpose: inside `<picture>` it carries srcset
 * and is an image, inside `<video>`/`<audio>` it carries src and is media.
 * The attribute decides the kind, not the parent element.
 */
const SOURCES: Source[] = [
  { selector: "link[rel=canonical]", attribute: "href", kind: "canonical" },
  {
    selector: "link[rel=alternate][hreflang]",
    attribute: "href",
    kind: "alternate",
  },
  { selector: "a[href]", attribute: "href", kind: "anchor" },
  { selector: "img[src]", attribute: "src", kind: "img" },
  {
    selector: "img[srcset], source[srcset]",
    attribute: "srcset",
    kind: "img",
    list: true,
  },
  { selector: "script[src]", attribute: "src", kind: "script" },
  { selector: "link[rel~=stylesheet]", attribute: "href", kind: "stylesheet" },
  {
    selector: "link[rel~=icon], link[rel~=apple-touch-icon]",
    attribute: "href",
    kind: "icon",
  },
  { selector: "link[rel=manifest]", attribute: "href", kind: "manifest" },
  { selector: "link[rel=preload]", attribute: "href", kind: "preload" },
  {
    selector: "link[rel=preload][imagesrcset]",
    attribute: "imagesrcset",
    kind: "preload",
    list: true,
  },
  {
    selector: "video[src], audio[src], source[src]",
    attribute: "src",
    kind: "media",
  },
  { selector: "video[poster]", attribute: "poster", kind: "poster" },
  { selector: "iframe[src]", attribute: "src", kind: "iframe" },
];

export function extractRefs(html: string): Ref[] {
  const { document } = parseHTML(html);
  const refs: Ref[] = [];
  const seen = new Set<string>();

  const add = (kind: RefKind, href: string) => {
    if (href === "") return;
    // One missing asset should be one report line, not one per srcset slot.
    const key = `${kind} ${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ kind, href });
  };

  for (const source of SOURCES) {
    for (const el of document.querySelectorAll(source.selector)) {
      const value = el.getAttribute(source.attribute);
      if (value === null) continue;

      if (source.list) {
        for (const url of parseSrcset(value)) add(source.kind, url);
      } else {
        add(source.kind, value);
      }
    }
  }

  return refs;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS, all tests.

If `extractRefs: rel token matching does not confuse canonical with icon` fails, `linkedom` does not support `~=` attribute selectors. Fall back to selecting `link[rel]` once and matching tokens in TypeScript:
`const tokens = (el.getAttribute("rel") ?? "").toLowerCase().split(/\s+/)`, then branch on `tokens.includes("icon")`. Keep the table for every other row.

- [ ] **Step 5: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no errors. If `tsconfig.json` has no standalone check target, run `pnpm exec astro check` instead and expect 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git commit -m "feat(links): extract every loading reference, not just anchors"
```

---

### Task 3: Warn on absolute self-origin asset URLs

`<img src="https://daniellocatelli.com/img.png">` resolves in production but hardcodes the production origin into markup that should be origin-agnostic, so it breaks on preview and branch deploys. Anchors already earn a warning for this; assets should too. `canonical` and `alternate` stay exempt, because absolute is correct for them.

**Files:**
- Modify: `src/lib/link-check/extract.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**
- Consumes: widened `RefKind` from Task 2.
- Produces: no signature change. `classifyRef` returns `absoluteSelfLink: true` for every kind except `canonical` and `alternate`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/link-check-extract.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL on `classifyRef: an asset on our own origin is internal and flagged`, which reports `absoluteSelfLink: false` where `true` is expected. The other three should already pass, which is the point: they pin behaviour that must survive the change.

- [ ] **Step 3: Invert the predicate**

In `src/lib/link-check/extract.ts`, add below the `SKIP_SCHEMES` constant:

```ts
/**
 * Kinds for which an absolute self-origin URL is correct rather than a smell.
 * Search engines want a fully-qualified canonical and hreflang; everything
 * else should be root-relative so preview deploys resolve.
 */
const ABSOLUTE_OK: RefKind[] = ["canonical", "alternate"];
```

Then, inside `classifyRef`, replace this line:

```ts
    // Absolute self-origin URLs are correct for canonical and alternate tags,
    // so only an <a> earns the "should be relative" flag.
    absoluteSelfLink = ref.kind === "anchor";
```

with:

```ts
    absoluteSelfLink = !ABSOLUTE_OK.includes(ref.kind);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS, all tests, including the pre-existing `classifyRef: canonical and alternate to our origin are NOT flagged`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git commit -m "feat(links): flag absolute self-origin asset urls"
```

---

### Task 4: Report the sweep size, then run it against a real build

The checker loop needs no change: asset refs flow through `classifyRef`, the `targets` map, `followRedirects` and the `Problem` reporter exactly as anchors do, and print as `ERROR [img] /_astro/foo.webp`. The one gap is observability. Today the summary says how many pages were checked but not how many references, so a silent collapse in extraction (a selector that stops matching after a dependency bump) would look identical to a clean run.

This task also closes the loop the whole feature exists for: run it against a real build and fix whatever it finds, in this same PR, so the gate goes green rather than red-lighting `main`.

**Files:**
- Modify: `src/scripts/check-links-internal.ts` (the summary `console.log`, currently at the end of `main()`)

**Interfaces:**
- Consumes: `extractRefs` from Task 2, `classifyRef` from Task 3.
- Produces: nothing consumed by later tasks. This is the last task.

- [ ] **Step 1: Add the reference counter**

In `src/scripts/check-links-internal.ts`, immediately after `const problems: Problem[] = [];` add:

```ts
  let refCount = 0;
```

Inside the `for (const file of htmlFiles)` loop, immediately after the `try`/`catch` block that assigns `refs` (that is, on the line before `for (const ref of refs) {`), add:

```ts
    refCount += refs.length;
```

Then replace the summary log:

```ts
  console.log(
    `\nChecked ${htmlFiles.length} pages: ${errors.length} errors, ${warnings.length} warnings.`,
  );
```

with:

```ts
  console.log(
    `\nChecked ${refCount} references across ${htmlFiles.length} pages: ` +
      `${errors.length} errors, ${warnings.length} warnings.`,
  );
```

- [ ] **Step 2: Build the site**

Run: `pnpm build`
Expected: completes with 0 errors from `astro check`. This takes a few minutes.

- [ ] **Step 3: Run the checker against the real build**

Run: `pnpm check:links:internal`
Expected: the summary line now reports several thousand references rather than the few hundred implied by anchors alone. Before this change the same build reported `Checked 178 pages: 0 errors, 9 warnings.`

Read the output carefully. There are three possible outcomes, and they need different responses:

1. **0 errors.** The best case. Proceed to Step 4.
2. **Errors that are genuine.** An asset really is missing or misspelled. Fix the source (the component or content file that emits it), rebuild, re-run.
3. **Errors that are false positives.** Most likely causes, in order of likelihood: a selector matching markup that is not a real fetch (a templating artefact, a `<source>` inside a `<template>`); an Astro-emitted path that is served by a Worker route rather than a file in `dist/client`; or a `srcset` shape `parseSrcset` mishandles. Diagnose before suppressing. If a whole reference kind proves unusable, remove its row from `SOURCES` and record why in the spec's Scope section rather than leaving a silent gap.

Do not weaken the error severity to get to green.

- [ ] **Step 4: Verify the warning count**

The absolute self-origin change from Task 3 may add warnings beyond the 9 known anchor cases. Confirm each new one is a real absolute asset URL in the markup:

Run: `pnpm check:links:internal 2>&1 | grep 'should be root-relative'`
Expected: every line names a genuinely absolute `https://daniellocatelli.com/...` reference. Warnings do not gate the push, so these can be fixed in a follow-up, but they must be understood now, not assumed.

- [ ] **Step 5: Run the full unit suite once more**

Run: `pnpm test:unit`
Expected: PASS, all tests, 0 fail.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/check-links-internal.ts
git commit -m "feat(links): report reference count in the check summary"
```

If Step 3 required source fixes, commit those separately with their own descriptive message before this one.

---

## Done when

- `pnpm test:unit` passes with roughly 13 new tests in `link-check-extract`.
- `pnpm check:links:internal` reports 0 errors against a fresh `pnpm build`, with a reference count in the thousands.
- A deliberately broken asset is caught: temporarily rename a file under `dist/client/_astro/`, re-run the checker, confirm it reports `ERROR [img]` for it, then restore the file. This is the one manual check that proves the feature does what it was built for; do it before opening the PR.
