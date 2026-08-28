# Same-Page Fragment Checking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve bare `#fragment` references from `<use>` and `<a>` against the ids of the page that emits them, and count selector matches per `SOURCES` row so a row that stops matching becomes visible.

**Architecture:** `classifyRef` gains a third result variant, `{ type: "same-page"; fragment }`, which the runner resolves against its existing `idsFor` cache keyed by the emitting file. `extractRefs` changes signature to return `{ refs, counts }`, where `counts` tallies raw attribute matches per row before dedupe. The runner gains a `--dist` flag so the red case can be tested against a fixture directory rather than only the real build.

**Tech Stack:** TypeScript (strict), `linkedom` for HTML parsing, `node:test` + `node:assert/strict` run through `tsx`, Prettier.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-28-svg-sprite-fragment-checking-design.md`. Read it before Task 1.
- Package manager is **pnpm**, never npm.
- Unit tests run with `pnpm test:unit` (`tsx --test tests/unit/**/*.test.ts`). Tests use `node:test`, not vitest.
- TypeScript strict mode. No `any`, no non-null assertions where a default will do.
- Run `pnpm exec prettier --write <files>` on every file touched, before every commit.
- No em dashes in any prose, including code comments and commit messages. Use commas, colons, semicolons, or parentheses.
- Comments explain _why_, matching the density and voice already in `src/lib/link-check/extract.ts`. Do not add narrating comments.
- The full checker is `pnpm check:links` (builds first) or `pnpm check:links:internal` against an existing `dist/client`. A `dist/client` already exists in the working tree, so `check:links:internal` can be run directly.
- **Baseline for the real build, measured 2026-08-28:** `pnpm check:links:internal`
  reports `Checked 15446 references across 178 pages: 0 errors, 9 warnings.`
  Those 9 warnings are pre-existing `[anchor] https://daniellocatelli.com`
  absolute-self-origin links, unrelated to this work. Do not chase them, and
  do not treat them as a regression. Fixture runs in
  `tests/unit/link-check-runner.test.ts` have no such links and correctly
  expect 0 warnings.
- Every task ends green. `pnpm test:unit` must pass before each commit.

---

### Task 1: Per-row match counts

Give every `SOURCES` row a stable label and return raw per-row match counts alongside the refs. Behaviour of the checker is unchanged; this is the plumbing the later tasks report through.

**Files:**

- Modify: `src/lib/link-check/extract.ts`
- Modify: `src/scripts/check-links-internal.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
  - `interface Source { label: string; selector: string; attribute: string; kind: RefKind; list?: boolean }`
  - `export interface ExtractResult { refs: Ref[]; counts: Map<string, number> }`
  - `export function extractRefs(html: string): ExtractResult`

- [ ] **Step 1: Update the existing tests to the new signature**

Eight tests currently call `extractRefs(...)` and compare against a `Ref[]`. In `tests/unit/link-check-extract.test.ts`, append `.refs` to every one of them. The affected call sites, with the replacement:

```ts
// test "picks up every reference the browser loads"
const refs = extractRefs(PAGE).refs;

// test "an asset url repeated in a document yields one ref"
const hero = extractRefs(PAGE).refs.filter((r) => r.href === "/_astro/hero.webp");

// test "rel token matching does not confuse canonical with icon"
const refs = extractRefs(html).refs;

// test "preload imagesrcset candidates are collected"
assert.deepEqual(extractRefs(html).refs, [

// test "empty attribute values are dropped"
assert.deepEqual(extractRefs(`<img src="" srcset="" />`).refs, []);

// test "whitespace-only attribute values are dropped"
assert.deepEqual(extractRefs(`<img src="   " />`).refs, []);

// test "rel list separated by a tab, uppercase, still matches icon"
assert.deepEqual(extractRefs(html).refs, [
```

- [ ] **Step 2: Add the two new count tests**

Append to `tests/unit/link-check-extract.test.ts`:

```ts
test("extractRefs: counts are per row and pre-dedupe", () => {
  // Both <img src> values dedupe to one ref, but the row matched twice.
  // Counting post-dedupe would let a live row read as dead.
  const html = `<img src="/a.webp" /><img src="/a.webp" />`;
  const { refs, counts } = extractRefs(html);
  assert.equal(refs.length, 1);
  assert.equal(counts.get("img[src]"), 2);
});

test("extractRefs: every source row appears in counts, including empty ones", () => {
  const { counts } = extractRefs(`<p>nothing here</p>`);
  // A row missing from the map is indistinguishable from a row at zero,
  // which is the collapse this counter exists to surface.
  assert.ok(counts.size > 0);
  for (const n of counts.values()) assert.equal(n, 0);
  assert.equal(counts.get("video[poster]"), 0);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL. The `.refs` tests fail with `undefined is not iterable` or a deepEqual mismatch, and the two new tests fail with `counts is undefined`.

- [ ] **Step 4: Add `label` to `Source` and to every existing row**

In `src/lib/link-check/extract.ts`, replace the `Source` interface:

```ts
interface Source {
  /**
   * Stable name for this row in the summary. Kept separate from `selector`
   * so editing a selector for an unrelated reason does not silently rename
   * a line of output a human reads.
   */
  label: string;
  selector: string;
  attribute: string;
  kind: RefKind;
  /** The attribute holds a srcset candidate list, not a single URL. */
  list?: boolean;
}
```

Then add a `label` to each of the fourteen existing entries in `SOURCES`, keeping their current order:

```ts
const SOURCES: Source[] = [
  {
    label: "link[rel=canonical]",
    selector: "link[rel=canonical]",
    attribute: "href",
    kind: "canonical",
  },
  {
    label: "link[rel=alternate][hreflang]",
    selector: "link[rel=alternate][hreflang]",
    attribute: "href",
    kind: "alternate",
  },
  { label: "a[href]", selector: "a[href]", attribute: "href", kind: "anchor" },
  { label: "img[src]", selector: "img[src]", attribute: "src", kind: "img" },
  {
    label: "img/source[srcset]",
    selector: "img[srcset], source[srcset]",
    attribute: "srcset",
    kind: "img",
    list: true,
  },
  {
    label: "script[src]",
    selector: "script[src]",
    attribute: "src",
    kind: "script",
  },
  {
    label: "link[rel=stylesheet]",
    selector: "link[rel~=stylesheet]",
    attribute: "href",
    kind: "stylesheet",
  },
  {
    label: "link[rel=icon]",
    selector: "link[rel~=icon], link[rel~=apple-touch-icon]",
    attribute: "href",
    kind: "icon",
  },
  {
    label: "link[rel=manifest]",
    selector: "link[rel=manifest]",
    attribute: "href",
    kind: "manifest",
  },
  {
    label: "link[rel=preload]",
    selector: "link[rel=preload]",
    attribute: "href",
    kind: "preload",
  },
  {
    label: "link[rel=preload][imagesrcset]",
    selector: "link[rel=preload][imagesrcset]",
    attribute: "imagesrcset",
    kind: "preload",
    list: true,
  },
  {
    label: "video/audio/source[src]",
    selector: "video[src], audio[src], source[src]",
    attribute: "src",
    kind: "media",
  },
  {
    label: "video[poster]",
    selector: "video[poster]",
    attribute: "poster",
    kind: "poster",
  },
  {
    label: "iframe[src]",
    selector: "iframe[src]",
    attribute: "src",
    kind: "iframe",
  },
];
```

- [ ] **Step 5: Change `extractRefs` to return refs and counts**

Replace the whole `extractRefs` function in `src/lib/link-check/extract.ts`:

```ts
export interface ExtractResult {
  refs: Ref[];
  /**
   * Raw matches per source row, counted before dedupe. Post-dedupe counts
   * would let a row whose references are all absorbed by an earlier row
   * read as zero while being perfectly alive, which is exactly the false
   * negative this tally exists to prevent.
   */
  counts: Map<string, number>;
}

export function extractRefs(html: string): ExtractResult {
  const { document } = parseHTML(html);
  const refs: Ref[] = [];
  const seen = new Set<string>();
  // Seeded so a row that matches nothing is reported at zero rather than
  // going missing from the map.
  const counts = new Map<string, number>(SOURCES.map((s) => [s.label, 0]));

  const add = (kind: RefKind, href: string) => {
    if (href.trim() === "") return;
    // One missing asset should be one report line, not one per srcset slot.
    const key = `${kind} ${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ kind, href });
  };

  const tally = (label: string, n: number) => {
    counts.set(label, (counts.get(label) ?? 0) + n);
  };

  for (const source of SOURCES) {
    for (const el of document.querySelectorAll(source.selector)) {
      const value = el.getAttribute(source.attribute);
      if (value === null) continue;

      if (source.list) {
        const urls = parseSrcset(value);
        tally(source.label, urls.length);
        for (const url of urls) add(source.kind, url);
      } else {
        // An empty attribute is a matched element but not a reference, so
        // it must not prop up the count of a row that is otherwise dead.
        if (value.trim() !== "") tally(source.label, 1);
        add(source.kind, value);
      }
    }
  }

  return { refs, counts };
}
```

- [ ] **Step 6: Adapt the runner to the new signature**

In `src/scripts/check-links-internal.ts`, the extraction block currently declares `refs` with a `ReturnType<typeof extractRefs>` annotation, which now resolves to the wrong type. Replace:

```ts
    let refs: ReturnType<typeof extractRefs>;
    try {
      const html = await readFile(join(DIST, file), "utf8");
      refs = extractRefs(html);
    } catch (error) {
```

with:

```ts
    let refs: Ref[];
    try {
      const html = await readFile(join(DIST, file), "utf8");
      refs = extractRefs(html).refs;
    } catch (error) {
```

and add `Ref` to the type import at the top of the file:

```ts
import {
  classifyRef,
  collectIds,
  extractRefs,
  type Ref,
} from "../lib/link-check/extract";
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS, all tests in `link-check-extract.test.ts` green.

- [ ] **Step 8: Verify the checker still behaves identically**

Run: `pnpm check:links:internal`
Expected: `0 errors, 9 warnings` and the same reference total as before the change (15446).

- [ ] **Step 9: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/extract.ts src/scripts/check-links-internal.ts tests/unit/link-check-extract.test.ts
git add src/lib/link-check/extract.ts src/scripts/check-links-internal.ts tests/unit/link-check-extract.test.ts
git commit -m "refactor(links): count selector matches per source row"
```

---

### Task 2: Five new selector rows

Add `use[href]` and the four rows the asset spec had excluded for being zero-occurrence. Per-row counting from Task 1 is what makes a permanently zero row visible rather than silently dead code.

**Files:**

- Modify: `src/lib/link-check/extract.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**

- Consumes: `Source.label`, `ExtractResult` from Task 1.
- Produces: `RefKind` extended with `"use" | "modulepreload" | "embed"`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/link-check-extract.test.ts`:

```ts
test("extractRefs: svg sprite use references are collected", () => {
  const html = `<svg><use href="#ai:mdi:github"></use></svg>`;
  assert.deepEqual(extractRefs(html).refs, [
    { kind: "use", href: "#ai:mdi:github" },
  ]);
});

test("extractRefs: xlink:href on use is not collected", () => {
  // Pins a documented exclusion. astro-icon emits plain href; nothing in
  // the pipeline produces the legacy form, so the checker does not chase it.
  const html = `<svg><use xlink:href="#legacy"></use></svg>`;
  assert.deepEqual(extractRefs(html).refs, []);
});

test("extractRefs: the four speculative rows are collected", () => {
  const html = `<link rel="modulepreload" href="/_astro/chunk.js" />
<object data="/doc.pdf"></object>
<embed src="/movie.swf" />
<svg><image href="/raster.png" /></svg>`;
  assert.deepEqual(extractRefs(html).refs, [
    { kind: "img", href: "/raster.png" },
    { kind: "modulepreload", href: "/_astro/chunk.js" },
    { kind: "embed", href: "/doc.pdf" },
    { kind: "embed", href: "/movie.swf" },
  ]);
});
```

Note the expected order in the last test follows `SOURCES` order, with `image[href]` sitting beside the other image rows.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL, the three new tests return `[]` or a differently ordered array.

- [ ] **Step 3: Extend `RefKind`**

In `src/lib/link-check/extract.ts`, add three members to the union:

```ts
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
  | "modulepreload"
  | "media"
  | "poster"
  | "iframe"
  | "embed"
  | "use";
```

- [ ] **Step 4: Add the five rows**

In `SOURCES`, insert the SVG `image` row directly after the `img/source[srcset]` row:

```ts
  {
    label: "image[href]",
    selector: "image[href]",
    attribute: "href",
    kind: "img",
  },
```

Then append the remaining four rows at the end of the array, after `iframe[src]`:

```ts
  {
    label: "link[rel=modulepreload]",
    selector: "link[rel=modulepreload]",
    attribute: "href",
    kind: "modulepreload",
  },
  {
    label: "object[data]",
    selector: "object[data]",
    attribute: "data",
    kind: "embed",
  },
  { label: "embed[src]", selector: "embed[src]", attribute: "src", kind: "embed" },
  { label: "use[href]", selector: "use[href]", attribute: "href", kind: "use" },
```

Extend the comment block above `SOURCES` with the reason the zero-occurrence rows are present:

```
 * The last four rows match nothing in the current build. They are here
 * because `modulepreload` is the one Astro could begin emitting on its own
 * after a bundler change, and its chunk hrefs are not covered by
 * `script[src]`; the other three cost a row each. Per-row counts report a
 * row sitting at zero, so a speculative row cannot rot into dead code
 * nobody can identify.
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS.

- [ ] **Step 6: Verify against the real build**

Run: `pnpm check:links:internal`
Expected: still `0 errors, 9 warnings`. The reference total rises from 15446 to roughly 16313, because 867 distinct `<use>` references are now extracted. They are still classified as `skip` at this point, so nothing new is validated yet.

- [ ] **Step 7: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git add src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git commit -m "feat(links): collect use[href] and four speculative asset rows"
```

---

### Task 3: A `--dist` flag and a runner test harness

The runner hardcodes `dist/client` and calls `process.exit`, so no test can exercise it. Without a seam, the same-page check in Task 4 could only ever be verified green against the real build, and a checker that never fires is the exact failure this project exists to prevent.

**Files:**

- Modify: `src/scripts/check-links-internal.ts`
- Create: `tests/unit/link-check-runner.test.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: `runChecker(distDir: string): Promise<{ code: number; stdout: string }>`, a helper local to `tests/unit/link-check-runner.test.ts` that Task 4 reuses.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/link-check-runner.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "scripts",
  "check-links-internal.ts",
);

/** Run the real checker against a fixture directory. */
function runChecker(
  distDir: string,
): Promise<{ code: number; stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["exec", "tsx", SCRIPT, "--dist", distDir], {
      shell: process.platform === "win32",
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stdout += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 0, stdout }));
  });
}

/** Build a throwaway dist/client containing the given files. */
async function fixture(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "link-check-"));
  for (const [name, content] of Object.entries(files)) {
    const full = join(dir, name);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
  }
  return { dir, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

test("runner: a clean fixture exits zero", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="/about/">About</a>
</body></html>`,
    "about/index.html": `<!doctype html><html><body><p>About</p></body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 0, stdout);
    assert.match(stdout, /0 errors, 0 warnings/);
  } finally {
    await cleanup();
  }
});

test("runner: a link to a missing page exits non-zero", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="/nowhere/">Nowhere</a>
</body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 1, stdout);
    assert.match(stdout, /no page or asset at \/nowhere/);
  } finally {
    await cleanup();
  }
});
```

Task 4 and Task 5 append further tests to this same file, so `runChecker`
and `fixture` stay local. Do not export them.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec tsx --test tests/unit/link-check-runner.test.ts`
Expected: FAIL. The checker ignores `--dist`, reads the real `dist/client`, and the assertions about the fixture do not hold.

- [ ] **Step 3: Add `--dist` to the runner**

In `src/scripts/check-links-internal.ts`, replace the module-level `DIST` constant:

```ts
const DIST = join(import.meta.dirname, "..", "..", "dist", "client");
```

with a resolver, since argv is read inside `main`:

```ts
const DEFAULT_DIST = join(import.meta.dirname, "..", "..", "dist", "client");

/**
 * `--dist` lets the checker run against a fixture tree rather than only the
 * real build, which is what makes its failure modes testable.
 */
function resolveDist(argv: string[]): string {
  const index = argv.indexOf("--dist");
  if (index === -1) return DEFAULT_DIST;
  const value = argv[index + 1];
  if (value === undefined) throw new Error("--dist requires a path");
  return resolve(value);
}
```

Add `resolve` to the `node:path` import:

```ts
import { join, relative, resolve, sep } from "node:path";
```

- [ ] **Step 4: Thread the resolved path through `main`**

At the top of `main`, immediately after the `--json` parsing, add:

```ts
const DIST = resolveDist(process.argv);
```

Every existing `join(DIST, ...)` inside `main` now reads the local binding rather than the module constant, so no other call site changes. Confirm the three uses are all inside `main`: the `_redirects` read, the `idsFor` read, and the per-file `readFile`. The `walk(DIST)` and `relative(DIST, f)` calls are inside `main` too.

Update the usage comment at the top of the file:

```
 * Usage:
 *   pnpm exec tsx src/scripts/check-links-internal.ts [--dist dir] [--json report.json]
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec tsx --test tests/unit/link-check-runner.test.ts`
Expected: PASS, both tests green.

- [ ] **Step 6: Confirm the default path is unchanged**

Run: `pnpm check:links:internal`
Expected: unchanged output, still `0 errors, 9 warnings` against the real build.

- [ ] **Step 7: Format and commit**

```bash
pnpm exec prettier --write src/scripts/check-links-internal.ts tests/unit/link-check-runner.test.ts
git add src/scripts/check-links-internal.ts tests/unit/link-check-runner.test.ts
git commit -m "test(links): add --dist flag so the checker's failures are testable"
```

---

### Task 4: Same-page fragment resolution

The behaviour change. Bare `#fragment` hrefs stop being skipped and resolve against the ids of the page that emits them.

**Files:**

- Modify: `src/lib/link-check/extract.ts`
- Modify: `src/scripts/check-links-internal.ts`
- Test: `tests/unit/link-check-extract.test.ts`
- Test: `tests/unit/link-check-runner.test.ts`

**Interfaces:**

- Consumes: `RefKind` `"use"` from Task 2; `runChecker` and `fixture` from Task 3.
- Produces: `Classified` extended with `{ type: "same-page"; fragment: string }`.

- [ ] **Step 1: Write the failing unit tests**

Append to `tests/unit/link-check-extract.test.ts`:

```ts
test("classifyRef: a bare fragment resolves against the emitting page", () => {
  assert.deepEqual(classifyRef({ kind: "use", href: "#icon" }, ORIGIN), {
    type: "same-page",
    fragment: "icon",
  });
  assert.deepEqual(classifyRef({ kind: "anchor", href: "#fn-1" }, ORIGIN), {
    type: "same-page",
    fragment: "fn-1",
  });
});

test("classifyRef: # and #top need no matching id", () => {
  // HTML defines both as "top of document", so demanding an id here would
  // flag correct markup.
  for (const href of ["#", "#top", "#Top", "#TOP"]) {
    assert.deepEqual(classifyRef({ kind: "anchor", href }, ORIGIN), {
      type: "skip",
    });
  }
});

test("classifyRef: an external sprite use keeps its path", () => {
  // A fragment inside a non-HTML target belongs to that format, so only the
  // file itself is resolved. Same treatment as document.pdf#page=2.
  assert.deepEqual(
    classifyRef({ kind: "use", href: "/icons/sprite.svg#arrow" }, ORIGIN),
    {
      type: "internal",
      path: "/icons/sprite.svg",
      fragment: "arrow",
      absoluteSelfLink: false,
    },
  );
});
```

The existing test `"classifyRef: empty and pure-fragment hrefs are skipped"` asserts `#top` is skipped and stays correct as written. Leave it alone.

- [ ] **Step 2: Write the failing runner tests**

Append to `tests/unit/link-check-runner.test.ts`:

```ts
const SPRITE_PAGE = (symbolId: string) => `<!doctype html><html><body>
<svg><symbol id="${symbolId}"><path d="M0 0" /></symbol></svg>
<svg><use href="#ai:mdi:github"></use></svg>
</body></html>`;

test("runner: a use pointing at a present symbol is accepted", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": SPRITE_PAGE("ai:mdi:github"),
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 0, stdout);
  } finally {
    await cleanup();
  }
});

test("runner: a use pointing at an absent symbol is an error", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": SPRITE_PAGE("ai:mdi:gitlab"),
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 1, stdout);
    assert.match(stdout, /no element with id "ai:mdi:github" on this page/);
  } finally {
    await cleanup();
  }
});

test("runner: a footnote anchor with no target is an error", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="#fn-missing">1</a>
<p id="fn-present">A footnote.</p>
</body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 1, stdout);
    assert.match(stdout, /no element with id "fn-missing" on this page/);
  } finally {
    await cleanup();
  }
});
```

- [ ] **Step 3: Run both test files to verify they fail**

Run: `pnpm test:unit`
Expected: FAIL. The `classifyRef` tests report `{ type: "skip" }` where `same-page` is expected, and the three runner tests exit 0 where 1 is expected.

- [ ] **Step 4: Add the `same-page` variant to `classifyRef`**

In `src/lib/link-check/extract.ts`, extend the `Classified` union:

```ts
export type Classified =
  | { type: "skip" }
  | { type: "external" }
  | { type: "same-page"; fragment: string }
  | {
      type: "internal";
      path: string;
      fragment: string | null;
      absoluteSelfLink: boolean;
    };
```

Then replace the first two lines of the function body:

```ts
if (href === "" || href.startsWith("#")) return { type: "skip" };
```

with:

```ts
if (href === "") return { type: "skip" };

if (href.startsWith("#")) {
  const fragment = href.slice(1);
  // HTML defines "#" and "#top" as the top of the document, with no
  // matching id required, so demanding one would flag correct markup.
  if (fragment === "" || fragment.toLowerCase() === "top") {
    return { type: "skip" };
  }
  return { type: "same-page", fragment };
}
```

Fragments are matched against raw ids without percent-decoding, which is
what the cross-page path already does. Do not add decoding to one side only.

- [ ] **Step 5: Resolve same-page fragments in the runner**

In `src/scripts/check-links-internal.ts`, inside the `for (const ref of refs)` loop, replace:

```ts
const result = classifyRef(ref, ORIGIN);
if (result.type !== "internal") continue;
```

with:

```ts
const result = classifyRef(ref, ORIGIN);

if (result.type === "same-page") {
  // A <use> naming an absent symbol renders nothing at all, with no
  // console error and no fallback, so it has to be caught here.
  const ids = await idsFor(file);
  if (!ids.has(result.fragment)) {
    problems.push({
      file,
      href: ref.href,
      kind: ref.kind,
      reason: `no element with id "${result.fragment}" on this page`,
      severity: "error",
    });
  }
  continue;
}

if (result.type !== "internal") continue;
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS, all tests in both files green.

- [ ] **Step 7: Verify against the real build**

Run: `pnpm check:links:internal`
Expected: `0 errors, 9 warnings`. Every `<use>` and every same-page anchor in the current build resolves, so this must stay green. If it does not, the failures are real and must be reported rather than worked around.

- [ ] **Step 8: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/extract.ts src/scripts/check-links-internal.ts tests/unit/link-check-extract.test.ts tests/unit/link-check-runner.test.ts
git add src/lib/link-check/extract.ts src/scripts/check-links-internal.ts tests/unit/link-check-extract.test.ts tests/unit/link-check-runner.test.ts
git commit -m "feat(links): resolve same-page fragments against the emitting page"
```

---

### Task 5: Per-row summary table

Report the counts Task 1 collects, so a row that stops matching is visible instead of hiding inside one aggregate number.

**Files:**

- Modify: `src/scripts/check-links-internal.ts`
- Test: `tests/unit/link-check-runner.test.ts`

**Interfaces:**

- Consumes: `ExtractResult.counts` from Task 1; `runChecker` and `fixture` from Task 3.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/link-check-runner.test.ts`:

```ts
test("runner: the summary reports matches per selector row", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="/about/">About</a>
<a href="/about/">About again</a>
</body></html>`,
    "about/index.html": `<!doctype html><html><body><p>About</p></body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 0, stdout);
    // Two matches, one deduped reference: the row count is pre-dedupe.
    assert.match(stdout, /a\[href\]\s+2/);
    assert.match(stdout, /video\[poster\]\s+0/);
    assert.match(stdout, /selector rows matched nothing/);
  } finally {
    await cleanup();
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec tsx --test tests/unit/link-check-runner.test.ts`
Expected: FAIL, the summary prints only the aggregate line and none of the three patterns match.

- [ ] **Step 3: Accumulate counts across pages**

In `src/scripts/check-links-internal.ts`, the extraction block currently discards `counts`. Replace:

```ts
    let refs: Ref[];
    try {
      const html = await readFile(join(DIST, file), "utf8");
      refs = extractRefs(html).refs;
    } catch (error) {
```

with:

```ts
    let refs: Ref[];
    try {
      const html = await readFile(join(DIST, file), "utf8");
      const extracted = extractRefs(html);
      refs = extracted.refs;
      for (const [label, n] of extracted.counts) {
        rowCounts.set(label, (rowCounts.get(label) ?? 0) + n);
      }
    } catch (error) {
```

and declare the accumulator beside `refCount`:

```ts
const problems: Problem[] = [];
const rowCounts = new Map<string, number>();
let refCount = 0;
```

- [ ] **Step 4: Print the table**

Replace the existing summary `console.log` call:

```ts
console.log(
  `\nChecked ${refCount} references across ${htmlFiles.length} pages: ` +
    `${errors.length} errors, ${warnings.length} warnings.`,
);
```

with:

```ts
console.log(
  `\nChecked ${refCount} distinct references across ${htmlFiles.length} ` +
    `pages: ${errors.length} errors, ${warnings.length} warnings.`,
);

const rows = [...rowCounts].sort(
  (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
);
const width = Math.max(...rows.map(([label]) => label.length));

console.log("\nSelector row matches (before dedupe):");
for (const [label, n] of rows) {
  console.log(`  ${label.padEnd(width)}  ${String(n).padStart(6)}`);
}

// A row at zero is expected for the speculative rows and never fails the
// run. It is called out so a row that dies after a dependency bump is
// noticed rather than absorbed into the total.
const dead = rows.filter(([, n]) => n === 0).map(([label]) => label);
if (dead.length > 0) {
  console.log(
    `\n${dead.length} selector rows matched nothing: ${dead.join(", ")}`,
  );
}
```

- [ ] **Step 5: Include the counts in the JSON report**

Replace:

```ts
await writeFile(jsonPath, JSON.stringify({ problems }, null, 2), "utf8");
```

with:

```ts
await writeFile(
  jsonPath,
  JSON.stringify(
    { problems, rowCounts: Object.fromEntries(rowCounts) },
    null,
    2,
  ),
  "utf8",
);
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm test:unit`
Expected: PASS, every test in both link-check test files green.

- [ ] **Step 7: Verify the table against the real build**

Run: `pnpm check:links:internal`
Expected: `0 errors, 9 warnings`, roughly 16313 distinct references, and a table in which `link[rel=preload][imagesrcset]`, `video[poster]`, `link[rel=modulepreload]`, `object[data]`, `embed[src]` and `image[href]` sit at zero while every other row is non-zero. `use[href]` should read 1346.

- [ ] **Step 8: Format and commit**

```bash
pnpm exec prettier --write src/scripts/check-links-internal.ts tests/unit/link-check-runner.test.ts
git add src/scripts/check-links-internal.ts tests/unit/link-check-runner.test.ts
git commit -m "feat(links): report selector matches per row in the summary"
```

---

### Task 6: Update the site self-description and close out

`CLAUDE.md` requires the site's own project page to stay an accurate account
of how the site is built after any meaningful change to the website. All
three locales carry one bullet describing link checking, at line 113, and it
does not mention fragments.

**Files:**

- Modify: `src/content/projects/en/portfolio-website.md:113`
- Modify: `src/content/projects/pt/portfolio-website.md:113`
- Modify: `src/content/projects/de/portfolio-website.md:113`

These three files already carry unrelated uncommitted edits from before this
work began. Leave those edits in place, and do not revert them.

`Updated: "2026-08-28"` is already set in the frontmatter of all three and
matches today, so it does not need bumping.

- [ ] **Step 1: Replace the English bullet**

Replace line 113 of `src/content/projects/en/portfolio-website.md`:

```markdown
- **No broken links.** Every link on the site, to its own pages, to the files each page loads, and to the icons and footnotes each page points at inside itself, is checked against the finished build, so nothing broken gets deployed. Links to other sites are swept once a week and reported, since those break on their own schedule.
```

- [ ] **Step 2: Replace the Portuguese bullet**

Replace line 113 of `src/content/projects/pt/portfolio-website.md`:

```markdown
- **Sem links quebrados.** Todos os links do site, para suas próprias páginas, para os arquivos que cada página carrega e para os ícones e notas de rodapé que cada página aponta dentro de si mesma, são verificados contra o build final, de modo que nada quebrado vai para o ar. Links para outros sites são varridos uma vez por semana e reportados, já que esses quebram no seu próprio ritmo.
```

- [ ] **Step 3: Replace the German bullet**

Replace line 113 of `src/content/projects/de/portfolio-website.md`. The file
uses ß rather than the Swiss ss, so keep `Fußnoten`:

```markdown
- **Keine toten Links.** Jeder Link der Website, auf ihre eigenen Seiten, auf die Dateien, die jede Seite lädt, und auf die Symbole und Fußnoten, auf die jede Seite in sich selbst verweist, wird gegen den fertigen Build geprüft, sodass nichts Kaputtes online geht. Links auf andere Websites werden einmal pro Woche überprüft und gemeldet, denn die brechen nach ihrem eigenen Rhythmus.
```

- [ ] **Step 4: Verify no em dashes were introduced**

Run: `grep -n "—" src/content/projects/en/portfolio-website.md src/content/projects/pt/portfolio-website.md src/content/projects/de/portfolio-website.md`
Expected: no output. Content files must not contain em dashes.

- [ ] **Step 5: Commit the content change**

```bash
pnpm exec prettier --write src/content/projects/en/portfolio-website.md src/content/projects/pt/portfolio-website.md src/content/projects/de/portfolio-website.md
git add src/content/projects/en/portfolio-website.md src/content/projects/pt/portfolio-website.md src/content/projects/de/portfolio-website.md
git commit -m "docs(content): note fragment checking in the site self-description"
```

- [ ] **Step 6: Run the full gate**

```bash
pnpm build && pnpm check:links:internal && pnpm test:unit
```

Expected: build succeeds, checker reports `0 errors, 9 warnings`, all unit
tests pass.

- [ ] **Step 7: Report back, do not act unilaterally**

Report to the user, and wait rather than acting:

1. `src/content/` changed, so ask whether to run `/sync-knowledge`.
2. The thought `2026-08-28_svg-sprite-use-href-symbols-are-never-checked`
   in the thoughts store on the Mac mini is ready to move to `status: done`.
   Name which of its three items landed: the `<use>` check, the per-row
   counts, and all four previously excluded selector rows. Do not edit the
   thought store directly.

---

## Verification Summary

| Spec requirement                                | Task                  |
| ----------------------------------------------- | --------------------- |
| `same-page` classification variant              | 4                     |
| `<use href="#x">` resolved against page ids     | 4                     |
| `<a href="#x">` resolved against page ids       | 4                     |
| `#` and `#top` stay skipped                     | 4                     |
| Missing id is an error, not a warning           | 4                     |
| `Source.label` added                            | 1                     |
| `extractRefs` returns `{ refs, counts }`        | 1                     |
| Counts are pre-dedupe                           | 1                     |
| Every row present in counts, including zeros    | 1                     |
| Row table plus zero-row line in the summary     | 5                     |
| `link[rel=modulepreload]` row                   | 2                     |
| `object[data]` and `embed[src]` rows            | 2                     |
| SVG `image[href]` row                           | 2                     |
| `xlink:href` exclusion pinned by a test         | 2                     |
| External sprite keeps path, fragment unchecked  | 4                     |
| Runner-level red case for an absent symbol      | 3 (harness), 4 (case) |
| Site self-description kept accurate (CLAUDE.md) | 6                     |
