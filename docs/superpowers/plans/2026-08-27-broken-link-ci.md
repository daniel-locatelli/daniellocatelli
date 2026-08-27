# Broken Link CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect broken internal links on every push to `main`, and broken external links weekly, without false-positive noise from bot-protected hosts.

**Architecture:** Internal links are checked offline against the built `dist/client/` tree by a custom TypeScript script that understands Astro's `_redirects` map and URL fragments. External links are discovered by lychee, which only nominates suspects; every nomination then passes through a verification ladder (browser-UA HEAD, then GET, then an origin-root probe) that separates genuinely dead pages from bot-walled hosts. Only confirmed-dead URLs reach a single long-lived GitHub issue.

**Tech Stack:** TypeScript run through `tsx`, `linkedom` for HTML parsing (both already dependencies), `node:test` for unit tests, lychee via `lycheeverse/lychee-action@v2`, GitHub Actions, `gh` CLI for issue management.

**Spec:** `docs/superpowers/specs/2026-08-27-broken-link-ci-design.md`

## Global Constraints

- Node 24; pnpm 11.17.0 pinned via `packageManager` in `package.json`. Never invoke `npm`.
- All new runtime code is TypeScript under `src/lib/link-check/` and `src/scripts/`, matching the existing `src/scripts/` conventions.
- Unit tests use `node:test` and `node:assert/strict`, live in `tests/unit/`, and are run by `pnpm test:unit` (`tsx --test tests/unit/**/*.test.ts`).
- No new runtime dependencies. `linkedom` (0.18.12) is already a devDependency; use it. Do not add a fetch library; use the global `fetch`.
- Prettier formats the repo (`.prettierrc`). Run `pnpm exec prettier --write` on any file you create.
- The site origin is `https://daniellocatelli.com`, available as `CUSTOM_DOMAIN` from `src/config/server.ts`.
- The existing `src/scripts/validate-internal-links.ts` and the `validate:links` script must be left untouched.
- Text in this repo avoids em dashes. Use commas, colons or parentheses in any prose or report output you write.
- Browser user agent string, used verbatim wherever a browser-like request is made:
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`

## Ground Truth (measured 2026-08-27, do not re-derive)

- `dist/client/` holds 178 `.html` files, all as `<path>/index.html`. `dist/client/index.html` is `/`; `dist/client/projects/index.html` is `/projects`.
- Internal `<a href>` values in built HTML are root-relative with **no** trailing slash: `/`, `/projects`, `/pt`, `/de`, `/projects/kfw-funding-calculator-by-buildsystems`.
- `<link rel="canonical">` and `<link rel="alternate" hreflang>` are **absolute** `https://daniellocatelli.com/...` **with** trailing slash. This is correct and must never be warned about. Only an `<a href>` pointing at the site's own origin gets the "should be relative" warning.
- `dist/client/_redirects` has 132 lines, whitespace-column aligned, exactly 3 fields per line: from, to, status. Both `/foo/` and `/foo` variants are emitted. Targets may be internal (`/research/timber-buildup-data-model`) or external (`https://archcompute.com/en/strategies`).
- Verified network behaviour, used as named test cases:
  - `https://www.food4rhino.com/en/app/dloft`: HEAD 403, browser-UA GET 403, origin root `https://www.food4rhino.com/` browser-UA GET 200. Expected verdict: `confirmed-broken`.
  - `https://doi.org/10.1016/j.autcon.2021.103571`: HEAD 302, browser-UA GET 200. Expected verdict: `alive`.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/link-check/paths.ts` | Pure path logic: normalize a URL path, build the valid-target set from file paths, parse and resolve `_redirects`. |
| `src/lib/link-check/extract.ts` | Pure HTML logic: pull references out of a document, classify each as skip / external / internal. |
| `src/lib/link-check/verify.ts` | Pure ladder logic: given an injectable probe function, return a verdict for one URL. |
| `src/scripts/check-links-internal.ts` | CLI. Walks `dist/client/`, wires paths + extract together, prints a report, exits 1 on failure. |
| `src/scripts/verify-dead-links.ts` | CLI. Reads lychee JSON, runs the real probe through the ladder, writes a markdown report. |
| `lychee.toml` | lychee configuration. |
| `.lycheeignore` | Non-target URL patterns. |
| `.github/workflows/links.yml` | Both CI jobs. |
| `tests/unit/link-check-paths.test.ts` | Tests for `paths.ts`. |
| `tests/unit/link-check-extract.test.ts` | Tests for `extract.ts`. |
| `tests/unit/link-check-verify.test.ts` | Tests for `verify.ts`. |

---

### Task 1: Path and redirect core

**Files:**
- Create: `src/lib/link-check/paths.ts`
- Test: `tests/unit/link-check-paths.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface RedirectRule { from: string; to: string; status: number }`
  - `function normalizePath(input: string): string`
  - `function fileToUrlPath(relFile: string): string`
  - `function buildTargetSet(relFiles: string[]): Set<string>`
  - `function parseRedirects(text: string): RedirectRule[]`
  - `function buildRedirectMap(rules: RedirectRule[]): Map<string, RedirectRule>`
  - `function followRedirects(path: string, redirects: Map<string, RedirectRule>, maxHops?: number): { path: string | null; external: boolean; looped: boolean }`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/link-check-paths.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizePath,
  fileToUrlPath,
  buildTargetSet,
  parseRedirects,
  buildRedirectMap,
  followRedirects,
} from "../../src/lib/link-check/paths";

test("normalizePath: strips trailing slash except at root", () => {
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath("/projects/"), "/projects");
  assert.equal(normalizePath("/projects"), "/projects");
  assert.equal(normalizePath("/de/cv/"), "/de/cv");
});

test("normalizePath: strips query and collapses duplicate slashes", () => {
  assert.equal(normalizePath("/projects?utm=x"), "/projects");
  assert.equal(normalizePath("//projects//foo/"), "/projects/foo");
});

test("normalizePath: decodes percent-encoding", () => {
  assert.equal(normalizePath("/projects/a%20b"), "/projects/a b");
});

test("normalizePath: leaves a bare fragment-free relative value alone", () => {
  assert.equal(normalizePath("/foo.pdf"), "/foo.pdf");
});

test("fileToUrlPath: index.html files become directory paths", () => {
  assert.equal(fileToUrlPath("index.html"), "/");
  assert.equal(fileToUrlPath("projects/index.html"), "/projects");
  assert.equal(fileToUrlPath("de/cv/index.html"), "/de/cv");
});

test("fileToUrlPath: non-html assets keep their filename", () => {
  assert.equal(fileToUrlPath("documents/cv.pdf"), "/documents/cv.pdf");
  assert.equal(fileToUrlPath("favicon.ico"), "/favicon.ico");
});

test("fileToUrlPath: normalizes windows separators", () => {
  assert.equal(fileToUrlPath("de\\cv\\index.html"), "/de/cv");
});

test("buildTargetSet: contains every emitted path", () => {
  const set = buildTargetSet([
    "index.html",
    "projects/index.html",
    "documents/cv.pdf",
  ]);
  assert.ok(set.has("/"));
  assert.ok(set.has("/projects"));
  assert.ok(set.has("/documents/cv.pdf"));
  assert.equal(set.has("/missing"), false);
});

test("parseRedirects: parses the three-column astro format", () => {
  const text = [
    "/strategies/                    https://archcompute.com/en/strategies    301",
    "/research/old/                  /research/new                            301",
    "",
    "# a comment line",
  ].join("\n");
  const rules = parseRedirects(text);
  assert.equal(rules.length, 2);
  assert.deepEqual(rules[0], {
    from: "/strategies",
    to: "https://archcompute.com/en/strategies",
    status: 301,
  });
  assert.deepEqual(rules[1], {
    from: "/research/old",
    to: "/research/new",
    status: 301,
  });
});

test("parseRedirects: ignores malformed lines", () => {
  const rules = parseRedirects("/only-two-fields   /target\ngarbage\n");
  assert.equal(rules.length, 0);
});

test("buildRedirectMap: keys by normalized from-path", () => {
  const map = buildRedirectMap(
    parseRedirects("/research/old/   /research/new   301"),
  );
  assert.equal(map.get("/research/old")?.to, "/research/new");
  assert.equal(map.has("/research/old/"), false);
});

test("followRedirects: a path with no rule is returned unchanged", () => {
  const map = buildRedirectMap([]);
  assert.deepEqual(followRedirects("/projects", map), {
    path: "/projects",
    external: false,
    looped: false,
  });
});

test("followRedirects: resolves the real dokwood rename in one hop", () => {
  const map = buildRedirectMap(
    parseRedirects(
      "/research/dokwood-bsdd-data-dictionary/   /research/timber-buildup-data-model   301",
    ),
  );
  assert.deepEqual(followRedirects("/research/dokwood-bsdd-data-dictionary", map), {
    path: "/research/timber-buildup-data-model",
    external: false,
    looped: false,
  });
});

test("followRedirects: an off-site target is reported as external", () => {
  const map = buildRedirectMap(
    parseRedirects("/strategies/   https://archcompute.com/en/strategies   301"),
  );
  assert.deepEqual(followRedirects("/strategies", map), {
    path: null,
    external: true,
    looped: false,
  });
});

test("followRedirects: a two-hop chain resolves to its final target", () => {
  const map = buildRedirectMap(
    parseRedirects(["/a   /b   301", "/b   /c   301"].join("\n")),
  );
  assert.equal(followRedirects("/a", map).path, "/c");
});

test("followRedirects: a cycle is reported as looped, not an infinite loop", () => {
  const map = buildRedirectMap(
    parseRedirects(["/a   /b   301", "/b   /a   301"].join("\n")),
  );
  const result = followRedirects("/a", map);
  assert.equal(result.looped, true);
  assert.equal(result.path, null);
});

test("followRedirects: a chain longer than maxHops is reported as looped", () => {
  const map = buildRedirectMap(
    parseRedirects(["/a   /b   301", "/b   /c   301", "/c   /d   301"].join("\n")),
  );
  assert.equal(followRedirects("/a", map, 2).looped, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/unit/link-check-paths.test.ts`
Expected: FAIL, cannot find module `../../src/lib/link-check/paths`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/link-check/paths.ts`:

```ts
/**
 * Pure path helpers for the internal link checker.
 *
 * The built site emits every page as `<path>/index.html`, while links in the
 * markup are root-relative without a trailing slash. These helpers reconcile
 * the two, and parse the `_redirects` map Astro writes into dist/client so
 * that links to renamed slugs are not reported as broken.
 */

export interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

/**
 * Reduce a URL path to the canonical form used as a target-set key:
 * no query, no duplicate slashes, no trailing slash (except root), decoded.
 */
export function normalizePath(input: string): string {
  let path = input.split("?")[0];

  try {
    path = decodeURIComponent(path);
  } catch {
    // Malformed percent-encoding: keep the raw value so it fails loudly
    // as a missing target rather than throwing here.
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path === "" ? "/" : path;
}

/** Convert a dist-relative file path into the URL path that serves it. */
export function fileToUrlPath(relFile: string): string {
  const posix = relFile.replace(/\\/g, "/");
  const withoutIndex = posix.endsWith("/index.html")
    ? posix.slice(0, -"/index.html".length)
    : posix === "index.html"
      ? ""
      : posix;

  return normalizePath("/" + withoutIndex);
}

/** Build the set of every URL path the built site can serve. */
export function buildTargetSet(relFiles: string[]): Set<string> {
  return new Set(relFiles.map(fileToUrlPath));
}

/**
 * Parse `dist/client/_redirects`. Astro writes whitespace-aligned columns:
 * `<from>  <to>  <status>`. Blank lines and `#` comments are skipped, as are
 * lines that do not have exactly three fields.
 */
export function parseRedirects(text: string): RedirectRule[] {
  const rules: RedirectRule[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;

    const fields = line.split(/\s+/);
    if (fields.length !== 3) continue;

    const [from, to, statusText] = fields;
    const status = Number.parseInt(statusText, 10);
    if (!Number.isFinite(status)) continue;

    rules.push({ from: normalizePath(from), to, status });
  }

  return rules;
}

/** Index rules by their normalized source path. */
export function buildRedirectMap(
  rules: RedirectRule[],
): Map<string, RedirectRule> {
  const map = new Map<string, RedirectRule>();
  for (const rule of rules) {
    if (!map.has(rule.from)) map.set(rule.from, rule);
  }
  return map;
}

/**
 * Resolve a path through the redirect map, following at most `maxHops` hops.
 *
 * Returns the final internal path, or a null path when the chain leaves the
 * site (`external`, which lychee will cover) or cycles (`looped`, which is a
 * genuine configuration bug worth reporting).
 */
export function followRedirects(
  path: string,
  redirects: Map<string, RedirectRule>,
  maxHops = 3,
): { path: string | null; external: boolean; looped: boolean } {
  const seen = new Set<string>([path]);
  let current = path;

  for (let hop = 0; hop < maxHops; hop++) {
    const rule = redirects.get(current);
    if (!rule) return { path: current, external: false, looped: false };

    if (/^https?:\/\//i.test(rule.to)) {
      return { path: null, external: true, looped: false };
    }

    current = normalizePath(rule.to);
    if (seen.has(current)) {
      return { path: null, external: false, looped: true };
    }
    seen.add(current);
  }

  return { path: null, external: false, looped: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/unit/link-check-paths.test.ts`
Expected: PASS, 16 tests, 0 failures.

- [ ] **Step 5: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/paths.ts tests/unit/link-check-paths.test.ts
git add src/lib/link-check/paths.ts tests/unit/link-check-paths.test.ts
git commit -m "feat(links): path normalization and _redirects parsing"
```

---

### Task 2: Reference extraction and classification

**Files:**
- Create: `src/lib/link-check/extract.ts`
- Test: `tests/unit/link-check-extract.test.ts`

**Interfaces:**
- Consumes: `normalizePath` from `src/lib/link-check/paths`.
- Produces:
  - `type RefKind = "anchor" | "canonical" | "alternate"`
  - `interface Ref { kind: RefKind; href: string }`
  - `type Classified = { type: "skip" } | { type: "external" } | { type: "internal"; path: string; fragment: string | null; absoluteSelfLink: boolean }`
  - `function extractRefs(html: string): Ref[]`
  - `function classifyRef(ref: Ref, siteOrigin: string): Classified`
  - `function collectIds(html: string): Set<string>`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/link-check-extract.test.ts`:

```ts
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
  const result = classifyRef({ kind: "anchor", href: "/research#method" }, ORIGIN);
  assert.deepEqual(result, {
    type: "internal",
    path: "/research",
    fragment: "method",
    absoluteSelfLink: false,
  });
});

test("classifyRef: mailto and tel are skipped", () => {
  assert.deepEqual(classifyRef({ kind: "anchor", href: "mailto:a@b.c" }, ORIGIN), {
    type: "skip",
  });
  assert.deepEqual(classifyRef({ kind: "anchor", href: "tel:+41000" }, ORIGIN), {
    type: "skip",
  });
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/unit/link-check-extract.test.ts`
Expected: FAIL, cannot find module `../../src/lib/link-check/extract`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/link-check/extract.ts`:

```ts
/**
 * Pull link references out of built HTML and decide what each one is.
 *
 * Only three reference kinds matter for internal link checking: `<a href>`,
 * the canonical link, and hreflang alternates. Broken hreflang between the
 * en, pt and de trees is invisible without the last of those.
 */

import { parseHTML } from "linkedom";
import { normalizePath } from "./paths";

export type RefKind = "anchor" | "canonical" | "alternate";

export interface Ref {
  kind: RefKind;
  href: string;
}

export type Classified =
  | { type: "skip" }
  | { type: "external" }
  | {
      type: "internal";
      path: string;
      fragment: string | null;
      absoluteSelfLink: boolean;
    };

const SKIP_SCHEMES = ["mailto:", "tel:", "javascript:", "data:"];

export function extractRefs(html: string): Ref[] {
  const { document } = parseHTML(html);
  const refs: Ref[] = [];

  const canonical = document.querySelector("link[rel=canonical]");
  const canonicalHref = canonical?.getAttribute("href");
  if (canonicalHref) refs.push({ kind: "canonical", href: canonicalHref });

  for (const el of document.querySelectorAll(
    "link[rel=alternate][hreflang]",
  )) {
    const href = el.getAttribute("href");
    if (href) refs.push({ kind: "alternate", href });
  }

  for (const el of document.querySelectorAll("a[href]")) {
    const href = el.getAttribute("href");
    if (href !== null) refs.push({ kind: "anchor", href });
  }

  return refs;
}

export function classifyRef(ref: Ref, siteOrigin: string): Classified {
  const href = ref.href.trim();

  if (href === "" || href.startsWith("#")) return { type: "skip" };
  if (SKIP_SCHEMES.some((scheme) => href.toLowerCase().startsWith(scheme))) {
    return { type: "skip" };
  }

  let pathAndFragment = href;
  let absoluteSelfLink = false;

  if (/^https?:\/\//i.test(href) || href.startsWith("//")) {
    let url: URL;
    try {
      url = new URL(href, siteOrigin);
    } catch {
      return { type: "skip" };
    }

    if (url.origin !== new URL(siteOrigin).origin) return { type: "external" };

    // Absolute self-origin URLs are correct for canonical and alternate tags,
    // so only an <a> earns the "should be relative" flag.
    absoluteSelfLink = ref.kind === "anchor";
    pathAndFragment = url.pathname + url.hash;
  }

  const hashIndex = pathAndFragment.indexOf("#");
  const rawPath =
    hashIndex === -1 ? pathAndFragment : pathAndFragment.slice(0, hashIndex);
  const fragment =
    hashIndex === -1 ? null : pathAndFragment.slice(hashIndex + 1) || null;

  return {
    type: "internal",
    path: normalizePath(rawPath),
    fragment,
    absoluteSelfLink,
  };
}

export function collectIds(html: string): Set<string> {
  const { document } = parseHTML(html);
  const ids = new Set<string>();
  for (const el of document.querySelectorAll("[id]")) {
    const id = el.getAttribute("id");
    if (id) ids.add(id);
  }
  return ids;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/unit/link-check-extract.test.ts`
Expected: PASS, 10 tests, 0 failures.

- [ ] **Step 5: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git add src/lib/link-check/extract.ts tests/unit/link-check-extract.test.ts
git commit -m "feat(links): extract and classify references from built HTML"
```

---

### Task 3: Internal link checker CLI

**Files:**
- Create: `src/scripts/check-links-internal.ts`
- Modify: `package.json` (scripts block, currently lines 7 to 17)

**Interfaces:**
- Consumes: everything produced by Tasks 1 and 2.
- Produces: the `pnpm check:links:internal` command, exit code 1 on failure, `--json <path>` output.

- [ ] **Step 1: Write the implementation**

Create `src/scripts/check-links-internal.ts`:

```ts
/**
 * Validates every internal link in the built site.
 *
 * Reads dist/client, resolves each internal reference against the set of
 * emitted pages and assets, falls back to the _redirects map for renamed
 * slugs, and verifies #fragments against the target document's ids.
 *
 * Usage:
 *   pnpm exec tsx src/scripts/check-links-internal.ts [--json report.json]
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import {
  buildRedirectMap,
  buildTargetSet,
  followRedirects,
  parseRedirects,
} from "../lib/link-check/paths";
import {
  classifyRef,
  collectIds,
  extractRefs,
} from "../lib/link-check/extract";

const DIST = join(import.meta.dirname, "..", "..", "dist", "client");
const ORIGIN = "https://daniellocatelli.com";

interface Problem {
  file: string;
  href: string;
  kind: string;
  reason: string;
  severity: "error" | "warning";
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  const jsonFlagIndex = process.argv.indexOf("--json");
  const jsonPath =
    jsonFlagIndex === -1 ? null : process.argv[jsonFlagIndex + 1];

  const allFiles = await walk(DIST);
  const relFiles = allFiles.map((f) => relative(DIST, f).split(sep).join("/"));
  const targets = buildTargetSet(relFiles);

  const redirectsFile = relFiles.includes("_redirects")
    ? await readFile(join(DIST, "_redirects"), "utf8")
    : "";
  const redirects = buildRedirectMap(parseRedirects(redirectsFile));

  const htmlFiles = relFiles.filter((f) => f.endsWith(".html"));
  const idCache = new Map<string, Set<string>>();

  async function idsFor(urlPath: string): Promise<Set<string>> {
    const cached = idCache.get(urlPath);
    if (cached) return cached;

    const rel =
      urlPath === "/" ? "index.html" : `${urlPath.slice(1)}/index.html`;
    let ids = new Set<string>();
    try {
      ids = collectIds(await readFile(join(DIST, rel), "utf8"));
    } catch {
      // Target is not an HTML page (an asset, say). No ids to offer.
    }
    idCache.set(urlPath, ids);
    return ids;
  }

  const problems: Problem[] = [];

  for (const file of htmlFiles) {
    const html = await readFile(join(DIST, file), "utf8");

    for (const ref of extractRefs(html)) {
      const result = classifyRef(ref, ORIGIN);
      if (result.type !== "internal") continue;

      if (result.absoluteSelfLink) {
        problems.push({
          file,
          href: ref.href,
          kind: ref.kind,
          reason: "absolute link to our own origin, should be root-relative",
          severity: "warning",
        });
      }

      let resolved = result.path;

      if (!targets.has(resolved)) {
        const hop = followRedirects(resolved, redirects);

        if (hop.looped) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: "redirect chain loops or exceeds 3 hops",
            severity: "error",
          });
          continue;
        }

        if (hop.external) continue; // redirects off-site, lychee's problem

        if (hop.path === null || !targets.has(hop.path)) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: `no page or asset at ${resolved}`,
            severity: "error",
          });
          continue;
        }

        resolved = hop.path;
      }

      if (result.fragment) {
        const ids = await idsFor(resolved);
        if (!ids.has(result.fragment)) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: `no element with id "${result.fragment}" on ${resolved}`,
            severity: "error",
          });
        }
      }
    }
  }

  const errors = problems.filter((p) => p.severity === "error");
  const warnings = problems.filter((p) => p.severity === "warning");

  const byFile = new Map<string, Problem[]>();
  for (const p of problems) {
    const list = byFile.get(p.file) ?? [];
    list.push(p);
    byFile.set(p.file, list);
  }

  for (const [file, list] of [...byFile].sort()) {
    console.log(`\n${file}`);
    for (const p of list) {
      const label = p.severity === "error" ? "ERROR" : "warn ";
      console.log(`  ${label} [${p.kind}] ${p.href}\n         ${p.reason}`);
    }
  }

  console.log(
    `\nChecked ${htmlFiles.length} pages: ${errors.length} errors, ${warnings.length} warnings.`,
  );

  if (jsonPath) {
    await writeFile(jsonPath, JSON.stringify({ problems }, null, 2), "utf8");
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Add the package.json scripts**

In `package.json`, inside the `"scripts"` block, add these three entries directly after the existing `"validate:links"` line:

```json
    "check:links:internal": "tsx src/scripts/check-links-internal.ts",
    "check:links:external": "lychee --config lychee.toml 'dist/client/**/*.html'",
    "check:links": "pnpm build && pnpm check:links:internal",
```

Leave `"validate:links"` itself unchanged.

- [ ] **Step 3: Run against the real built site**

```bash
pnpm build
pnpm check:links:internal
```

Expected: a report ending in a line like `Checked 178 pages: 0 errors, N warnings.` If there are errors, they are real findings; record them but do NOT fix content in this task, since the spec puts content repair out of scope. If an error is instead a checker bug (for example a legitimate asset reported missing), fix the checker and re-run.

- [ ] **Step 4: Verify the exit code contract**

```bash
pnpm check:links:internal > /dev/null; echo "exit=$?"
```

Expected: `exit=0` when there are no errors, `exit=1` when there are.

- [ ] **Step 5: Format and commit**

```bash
pnpm exec prettier --write src/scripts/check-links-internal.ts package.json
git add src/scripts/check-links-internal.ts package.json
git commit -m "feat(links): internal link checker over built output"
```

---

### Task 4: The verification ladder

**Files:**
- Create: `src/lib/link-check/verify.ts`
- Test: `tests/unit/link-check-verify.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `const BROWSER_UA: string`
  - `type Verdict = "alive" | "confirmed-broken" | "unverifiable"`
  - `interface ProbeResult { status: number | null; finalUrl: string | null; error?: string }`
  - `type Probe = (url: string, method: "HEAD" | "GET") => Promise<ProbeResult>`
  - `interface Outcome { url: string; verdict: Verdict; status: number | null; finalUrl: string | null; reason: string }`
  - `function verifyUrl(url: string, probe: Probe): Promise<Outcome>`
  - `function createProbe(timeoutMs?: number): Probe`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/link-check-verify.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyUrl, type Probe, type ProbeResult } from "../../src/lib/link-check/verify";

/** Build a probe that answers from a lookup table keyed by "METHOD url". */
function fakeProbe(table: Record<string, ProbeResult>): Probe {
  return async (url, method) => {
    const hit = table[`${method} ${url}`];
    if (hit) return hit;
    return { status: null, finalUrl: null, error: "no stub" };
  };
}

const ok = (url: string): ProbeResult => ({ status: 200, finalUrl: url });

test("alive when HEAD succeeds", async () => {
  const probe = fakeProbe({ "HEAD https://example.com/a": ok("https://example.com/a") });
  const out = await verifyUrl("https://example.com/a", probe);
  assert.equal(out.verdict, "alive");
  assert.equal(out.status, 200);
});

test("doi.org shape: HEAD redirects, GET succeeds, so alive", async () => {
  const url = "https://doi.org/10.1016/j.autcon.2021.103571";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 302, finalUrl: url },
    [`GET ${url}`]: { status: 200, finalUrl: "https://linkinghub.elsevier.com/x" },
  });
  const out = await verifyUrl(url, probe);
  // A 3xx is a success status, so the ladder stops at HEAD.
  assert.equal(out.verdict, "alive");
});

test("food4rhino shape: page 403 but origin root 200, so confirmed broken", async () => {
  const url = "https://www.food4rhino.com/en/app/dloft";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://www.food4rhino.com/": ok("https://www.food4rhino.com/en"),
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
  assert.equal(out.status, 403);
  assert.match(out.reason, /origin root/);
});

test("bot-walled host: page and root both refuse, so unverifiable", async () => {
  const url = "https://walled.example/page";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 403, finalUrl: url },
    [`GET ${url}`]: { status: 403, finalUrl: url },
    "GET https://walled.example/": { status: 403, finalUrl: null },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
});

test("404 is confirmed broken without probing the root", async () => {
  const url = "https://example.com/gone";
  let rootProbed = false;
  const probe: Probe = async (target, method) => {
    if (target === "https://example.com/") rootProbed = true;
    if (method === "HEAD") return { status: 404, finalUrl: target };
    return { status: 404, finalUrl: target };
  };
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
  assert.equal(rootProbed, false);
});

test("410 is confirmed broken", async () => {
  const url = "https://example.com/removed";
  const probe = fakeProbe({
    [`HEAD ${url}`]: { status: 410, finalUrl: url },
    [`GET ${url}`]: { status: 410, finalUrl: url },
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "confirmed-broken");
});

test("network error on both page and root is unverifiable, never throws", async () => {
  const url = "https://down.example/page";
  const probe: Probe = async () => ({
    status: null,
    finalUrl: null,
    error: "ENOTFOUND",
  });
  const out = await verifyUrl(url, probe);
  assert.equal(out.verdict, "unverifiable");
  assert.match(out.reason, /ENOTFOUND|unreachable/);
});

test("a malformed url is unverifiable rather than a crash", async () => {
  const probe = fakeProbe({});
  const out = await verifyUrl("not a url", probe);
  assert.equal(out.verdict, "unverifiable");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/unit/link-check-verify.test.ts`
Expected: FAIL, cannot find module `../../src/lib/link-check/verify`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/link-check/verify.ts`:

```ts
/**
 * The verification ladder.
 *
 * lychee only nominates suspects. Bot-protected hosts refuse CI runners even
 * when their pages are perfectly healthy: food4rhino.com answers 403 to a
 * default-UA HEAD on its own homepage. Reporting that as a dead link is a
 * false positive that erodes trust in the whole pipeline.
 *
 * So each nominated URL is retested with a browser user agent, and when it
 * still fails we probe the origin root. A live root beside a dead page means
 * the page is genuinely gone; a dead root means the host is refusing us and
 * the result is unknowable from CI.
 */

export const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type Verdict = "alive" | "confirmed-broken" | "unverifiable";

export interface ProbeResult {
  status: number | null;
  finalUrl: string | null;
  error?: string;
}

export type Probe = (
  url: string,
  method: "HEAD" | "GET",
) => Promise<ProbeResult>;

export interface Outcome {
  url: string;
  verdict: Verdict;
  status: number | null;
  finalUrl: string | null;
  reason: string;
}

/** Any 2xx or 3xx counts as reachable. */
function isSuccess(status: number | null): boolean {
  return status !== null && status >= 200 && status < 400;
}

function isGone(status: number | null): boolean {
  return status === 404 || status === 410;
}

export async function verifyUrl(url: string, probe: Probe): Promise<Outcome> {
  let origin: string;
  try {
    origin = new URL(url).origin + "/";
  } catch {
    return {
      url,
      verdict: "unverifiable",
      status: null,
      finalUrl: null,
      reason: "malformed URL",
    };
  }

  // Rung 1: HEAD with a browser user agent.
  const head = await probe(url, "HEAD");
  if (isSuccess(head.status)) {
    return {
      url,
      verdict: "alive",
      status: head.status,
      finalUrl: head.finalUrl,
      reason: "HEAD succeeded",
    };
  }

  // Rung 2: many hosts reject HEAD outright, so retry as GET.
  const get = await probe(url, "GET");
  if (isSuccess(get.status)) {
    return {
      url,
      verdict: "alive",
      status: get.status,
      finalUrl: get.finalUrl,
      reason: "GET succeeded after HEAD failed",
    };
  }

  if (isGone(get.status) || isGone(head.status)) {
    const status = isGone(get.status) ? get.status : head.status;
    return {
      url,
      verdict: "confirmed-broken",
      status,
      finalUrl: get.finalUrl,
      reason: `server returned ${status}`,
    };
  }

  // Rung 3: is the host refusing us, or is this page really gone?
  const root = await probe(origin, "GET");
  if (isSuccess(root.status)) {
    return {
      url,
      verdict: "confirmed-broken",
      status: get.status,
      finalUrl: get.finalUrl,
      reason: `page returned ${get.status ?? get.error ?? "no response"} while origin root answered ${root.status}`,
    };
  }

  const detail = get.error ?? root.error ?? "unreachable";
  return {
    url,
    verdict: "unverifiable",
    status: get.status,
    finalUrl: get.finalUrl,
    reason: `page returned ${get.status ?? detail} and origin root also failed (${root.status ?? detail}), host is likely bot-walled or down`,
  };
}

/** The real network probe: browser UA, redirects followed, bounded timeout. */
export function createProbe(timeoutMs = 25_000): Probe {
  return async (url, method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": BROWSER_UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      return { status: response.status, finalUrl: response.url || url };
    } catch (error) {
      const message =
        error instanceof Error ? error.name + ": " + error.message : "unknown";
      return { status: null, finalUrl: null, error: message };
    } finally {
      clearTimeout(timer);
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/unit/link-check-verify.test.ts`
Expected: PASS, 8 tests, 0 failures.

- [ ] **Step 5: Sanity-check the ladder against the live network**

```bash
pnpm exec tsx -e "
import { verifyUrl, createProbe } from './src/lib/link-check/verify';
const probe = createProbe();
for (const u of ['https://www.food4rhino.com/en/app/dloft','https://doi.org/10.1016/j.autcon.2021.103571','https://art-engineering.net/']) {
  console.log(JSON.stringify(await verifyUrl(u, probe)));
}
"
```

Expected: the food4rhino URL reports `confirmed-broken`, the other two report `alive`. If food4rhino reports `unverifiable`, the origin-root probe is being blocked too; record that and continue, since the ladder is behaving correctly by refusing to guess.

- [ ] **Step 6: Format and commit**

```bash
pnpm exec prettier --write src/lib/link-check/verify.ts tests/unit/link-check-verify.test.ts
git add src/lib/link-check/verify.ts tests/unit/link-check-verify.test.ts
git commit -m "feat(links): verification ladder separating dead pages from bot-walled hosts"
```

---

### Task 5: lychee configuration and the report generator

**Files:**
- Create: `lychee.toml`
- Create: `.lycheeignore`
- Create: `src/scripts/verify-dead-links.ts`

**Interfaces:**
- Consumes: `verifyUrl`, `createProbe`, `Outcome` from `src/lib/link-check/verify`.
- Produces: `link-report.md` on disk, plus a `LINKS_CONFIRMED_BROKEN=<n>` line appended to `$GITHUB_OUTPUT` when that variable is set.

- [ ] **Step 1: Create the lychee config**

Create `lychee.toml`:

```toml
# Configuration for lychee, the external link checker.
#
# lychee only NOMINATES suspects here. Everything it reports as failing is
# re-tested by src/scripts/verify-dead-links.ts before anything is filed,
# because bot-protected hosts refuse CI runners even when healthy.

# Be patient and polite: these hosts are mostly small university and studio
# sites, and hammering them is both rude and counterproductive.
max_concurrency = 8
timeout = 25
max_retries = 3
retry_wait_time = 4

# Present as a browser. A default UA gets 403 from Cloudflare-fronted hosts.
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# 2xx plus the redirect codes. Redirect chains are followed by lychee itself.
accept = ["200", "206", "301", "302", "303", "307", "308"]

# Cache responses so a weekly run does not re-hit every host from scratch.
cache = true
max_cache_age = "2d"

# Internal links are the internal checker's job; it understands _redirects.
exclude = ["^https?://(www\\.)?daniellocatelli\\.com"]
exclude_mail = true

# Private and loopback addresses can never resolve from CI.
exclude_private = true
exclude_loopback = true
```

- [ ] **Step 2: Create the ignore file**

Create `.lycheeignore`:

```
# URLs that are not real targets. Deliberately minimal.
#
# Do NOT add genuinely dead links here to make the run green. The pipeline is
# report-only by design: a red external report is the deliverable, not a
# failure. Entries here are for placeholders and examples only.
^https?://example\.(com|org|net)
^https?://localhost
^https?://your-domain
```

- [ ] **Step 3: Write the report generator**

Create `src/scripts/verify-dead-links.ts`:

```ts
/**
 * Turns lychee's JSON output into a trustworthy markdown report.
 *
 * lychee nominates; this script convicts. Every URL lychee marked as failing
 * is retested through the verification ladder, so bot-walled hosts land in an
 * "unverifiable" section instead of being reported as broken.
 *
 * Usage:
 *   pnpm exec tsx src/scripts/verify-dead-links.ts <lychee.json> <report.md>
 */

import { appendFile, readFile, writeFile } from "node:fs/promises";
import {
  createProbe,
  verifyUrl,
  type Outcome,
} from "../lib/link-check/verify";

const CONCURRENCY = 4;
const PER_HOST_DELAY_MS = 500;

interface LycheeEntry {
  url: string;
  status?: { text?: string; code?: number };
}

/** lychee writes `fail_map` as { sourceFile: [ { url, status }, ... ] }. */
function collectFailures(json: unknown): Map<string, Set<string>> {
  const sources = new Map<string, Set<string>>();
  const failMap =
    (json as { fail_map?: Record<string, LycheeEntry[]> })?.fail_map ?? {};

  for (const [source, entries] of Object.entries(failMap)) {
    for (const entry of entries) {
      if (!entry?.url) continue;
      const set = sources.get(entry.url) ?? new Set<string>();
      set.add(source);
      sources.set(entry.url, set);
    }
  }

  return sources;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runPool(urls: string[]): Promise<Outcome[]> {
  const probe = createProbe();
  const results: Outcome[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      results.push(await verifyUrl(url, probe));
      // Space out requests so we do not trip the rate limiting we are trying
      // to distinguish from real breakage.
      await sleep(PER_HOST_DELAY_MS);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker),
  );

  return results;
}

function renderSection(
  title: string,
  outcomes: Outcome[],
  sources: Map<string, Set<string>>,
): string {
  if (outcomes.length === 0) return "";

  const lines = [`## ${title}`, ""];
  for (const o of outcomes.sort((a, b) => a.url.localeCompare(b.url))) {
    lines.push(`- ${o.url}`);
    lines.push(`  - ${o.reason}`);
    if (o.finalUrl && o.finalUrl !== o.url) {
      lines.push(`  - resolved to: ${o.finalUrl}`);
    }
    const files = [...(sources.get(o.url) ?? [])].sort();
    if (files.length > 0) {
      lines.push(`  - linked from: ${files.join(", ")}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error(
      "usage: tsx src/scripts/verify-dead-links.ts <lychee.json> <report.md>",
    );
    process.exit(2);
  }

  const sources = collectFailures(
    JSON.parse(await readFile(inputPath, "utf8")),
  );
  const urls = [...sources.keys()];

  console.log(`lychee nominated ${urls.length} URLs; verifying each one.`);
  const outcomes = await runPool(urls);

  const broken = outcomes.filter((o) => o.verdict === "confirmed-broken");
  const unknown = outcomes.filter((o) => o.verdict === "unverifiable");
  const alive = outcomes.filter((o) => o.verdict === "alive");

  const body = [
    `Verified ${urls.length} URLs nominated by lychee.`,
    "",
    `- ${broken.length} confirmed broken`,
    `- ${unknown.length} unverifiable (bot-walled or host down)`,
    `- ${alive.length} false alarms, alive on retest`,
    "",
    renderSection("Confirmed broken", broken, sources),
    renderSection(
      "Unverifiable, needs a manual look",
      unknown,
      sources,
    ),
    "These hosts refused the checker on both the page and their own homepage,",
    "so CI cannot tell a dead page from a blocked request. Open them in a",
    "browser to decide.",
    "",
  ].join("\n");

  await writeFile(outputPath, body, "utf8");
  console.log(body);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `LINKS_CONFIRMED_BROKEN=${broken.length}\n`,
      "utf8",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 4: Verify the report generator against a fixture**

```bash
cat > /tmp/lychee-fixture.json <<'JSON'
{"fail_map":{"dist/client/projects/canyon/index.html":[{"url":"https://www.food4rhino.com/en/app/dloft","status":{"code":403}}]}}
JSON
pnpm exec tsx src/scripts/verify-dead-links.ts /tmp/lychee-fixture.json /tmp/report.md
```

Expected: output reports 1 confirmed broken, and `/tmp/report.md` contains a `## Confirmed broken` section listing the D.Loft URL with the source file.

- [ ] **Step 5: Format and commit**

```bash
pnpm exec prettier --write src/scripts/verify-dead-links.ts
git add lychee.toml .lycheeignore src/scripts/verify-dead-links.ts
git commit -m "feat(links): lychee config and verified external link report"
```

---

### Task 6: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/links.yml`

**Interfaces:**
- Consumes: `pnpm check:links:internal` (Task 3), `lychee.toml` (Task 5), `src/scripts/verify-dead-links.ts` (Task 5) and its `LINKS_CONFIRMED_BROKEN` output.
- Produces: two CI jobs and one GitHub issue labelled `broken-links`.

- [ ] **Step 1: Create the label the external job needs**

```bash
gh label create broken-links --description "Automated external link rot report" --color D93F0B
```

Expected: the label is created, or `gh` reports it already exists. Either is fine.

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/links.yml`:

```yaml
name: Links

on:
  push:
    branches: [main]
  schedule:
    # Mondays at 06:00 UTC.
    - cron: "0 6 * * 1"
  workflow_dispatch:

concurrency:
  group: links-${{ github.ref }}
  cancel-in-progress: true

jobs:
  internal:
    name: Internal links
    # Internal breakage is deterministic and always real, so this gates pushes.
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - name: Check internal links
        run: pnpm check:links:internal --json internal-links.json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: internal-links-report
          path: internal-links.json
          if-no-files-found: ignore

  external:
    name: External links
    # Never fails the run. External rot is reported, not enforced.
    if: github.event_name != 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - name: Restore lychee cache
        uses: actions/cache@v4
        with:
          path: .lycheecache
          key: lychee-${{ github.run_id }}
          restore-keys: lychee-

      - name: Nominate broken external links
        uses: lycheeverse/lychee-action@v2
        with:
          args: --config lychee.toml --no-progress 'dist/client/**/*.html'
          format: json
          output: lychee-out.json
          fail: false

      - name: Verify nominations
        id: verify
        run: pnpm exec tsx src/scripts/verify-dead-links.ts lychee-out.json link-report.md

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: external-links-report
          path: link-report.md

      - name: File, update or close the report issue
        env:
          GH_TOKEN: ${{ github.token }}
          BROKEN: ${{ steps.verify.outputs.LINKS_CONFIRMED_BROKEN }}
        run: |
          set -euo pipefail
          TITLE="Broken external links"
          EXISTING=$(gh issue list --label broken-links --state open \
            --json number --jq '.[0].number // empty')

          if [ "${BROKEN:-0}" -eq 0 ]; then
            if [ -n "$EXISTING" ]; then
              gh issue comment "$EXISTING" \
                --body "All previously reported links now resolve. Closing."
              gh issue close "$EXISTING"
              echo "Closed issue #$EXISTING."
            else
              echo "No confirmed broken links, and no open issue. Nothing to do."
            fi
            exit 0
          fi

          {
            echo "Automated report from the weekly link check."
            echo "Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            echo
            cat link-report.md
          } > issue-body.md

          if [ -n "$EXISTING" ]; then
            gh issue edit "$EXISTING" --body-file issue-body.md
            echo "Updated issue #$EXISTING."
          else
            gh issue create --title "$TITLE" --label broken-links \
              --body-file issue-body.md
          fi
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/links.yml
git commit -m "ci: internal link gate on push, weekly verified external link report"
git push
```

- [ ] **Step 4: Confirm the internal job ran on the push**

```bash
gh run list --workflow links.yml --limit 3
```

Expected: a run triggered by `push` with the `internal` job. `gh run watch` until it completes; it should be green if Task 3 finished clean.

- [ ] **Step 5: Trigger the external job manually and read the result**

```bash
gh workflow run links.yml
gh run watch
```

Expected: the `external` job completes green regardless of findings, and either creates an issue titled "Broken external links" or reports that there was nothing to file. Check with:

```bash
gh issue list --label broken-links
```

- [ ] **Step 6: Report findings to the user**

Summarize the confirmed-broken and unverifiable lists from the issue. Per the spec, do NOT edit any content to repair links; that is a separate pass the user will scope.

---

## Verification

Run the whole suite once at the end:

```bash
pnpm test:unit
pnpm build
pnpm check:links:internal
```

Expected: all unit tests pass (34 new tests across the three new files: 16 for `paths`, 10 for `extract`, 8 for `verify`), the build succeeds, and the internal checker reports its page count with 0 errors.
