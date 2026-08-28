# Asset link checking: design

Extends the internal link checker to validate the URLs a browser fetches to
render a page, not just the URLs a visitor clicks.

Follows on from `2026-08-27-broken-link-ci-design.md`, which built the
pipeline this reuses.

## Problem

`src/lib/link-check/extract.ts` collects three reference kinds: `<a href>`,
the canonical link, and hreflang alternates. Nothing else. A broken `<img
src>`, a missing `<script src>`, a stylesheet that failed to emit, a favicon
pointing at a renamed file: all of them ship silently. The push gate is green
and the page is visibly broken.

Of the gaps found while building the link CI, this is the only one where a
real breakage is swallowed rather than reported.

The built site is not short of these references. A survey of `dist/client`
(178 pages) counts 1649 `srcset` attributes, 1068 `link rel=icon`, 178 each
of `preload`, `stylesheet` and `manifest`, 16 `poster`, plus every `img src`
and `script src`. None of it is checked.

## Scope

In scope: every URL an internal page emits that the browser fetches to
render that page, resolved against `dist/client` by the existing internal
checker.

Out of scope:

- Off-origin assets (fonts, CDN scripts). These classify as `external` and
  are already lychee's job; lychee crawls `src` attributes today.
- Asset *content*. The check is existence only. Whether a file is a valid
  image, non-empty, or the right MIME type is not asked.
- CSS-referenced assets (`url()` inside stylesheets). The checker parses
  HTML, not CSS. If a background image rots, this will not catch it.
- `<a href>` behaviour, which is unchanged.
- `link[rel=modulepreload]`, `object[data]`, `embed[src]`, and SVG `<image
  href>`. All are zero occurrences in the current build, so there is nothing
  to validate today. `modulepreload` is the one worth watching: Astro does
  not emit it now, but a bundler change could start it, and it would then
  ship unchecked until someone widens the selector table.
- Paths served by the Worker rather than by a file in `dist/client`. Routes
  with `prerender = false` (`src/pages/404.astro`, `src/pages/api/*.ts`)
  never land in `dist/client`; they are matched at request time by the
  Worker, so the checker cannot resolve them against the target map without
  producing a false error. `check-links-internal.ts` exempts paths that match
  a listed `DYNAMIC_ROUTES` entry exactly or sit underneath it as a path
  segment (currently `/api` and `/404`) before they are reported, rather than
  treating a Worker-only route as a broken link.

## Key decisions

### Everything that loads, not just img and script

The original note named `img` and `script`. The selector table is the same
shape for every reference kind, so the marginal cost of the remaining kinds
is a longer table, while the marginal benefit is real: `srcset` alone is the
largest reference population in the build, and a missing stylesheet or
manifest is as broken as a missing script.

### Missing asset is an error, on the same gate as a missing page

A missing asset is exactly as deterministic as a missing page: the file
either exists in `dist/client` or it does not. There is no flakiness to
absorb and no host to be polite to.

Warning-only was rejected because the report then scrolls past in CI and the
breakage still ships, which is the failure mode this work exists to close.

Mitigation against a surprise backlog red-lighting `main`: run the checker
locally before merging and fix whatever it surfaces in the same PR.

### Absolute self-origin asset URLs warn, like anchors

`<img src="https://daniellocatelli.com/img.png">` resolves in production but
hardcodes the production origin into markup that should be origin-agnostic,
which breaks on preview and branch deploys. It gets the existing
"should be root-relative" warning.

`canonical` and `alternate` stay exempt, because absolute is correct for
them.

### Widen the existing pipeline rather than build a parallel one

Every asset reference needs precisely the treatment an anchor already gets:
classify, skip external and `data:`, resolve against the target map, fall
through `_redirects`, report with a kind label. That is `classifyRef` plus
the checker's existing loop, unchanged.

A parallel `extractAssets()` with its own loop was rejected: it duplicates
classification, redirect-following and reporting, and produces two report
shapes to merge. A fully generic attribute crawler was rejected too: it
invents kinds that cannot be named in a report, and sweeps in attributes
such as `<form action>` that mean nothing here.

## Components

### `src/lib/link-check/extract.ts`

The only file with substantial new logic.

`RefKind` widens from `"anchor" | "canonical" | "alternate"` to include
`"img" | "script" | "stylesheet" | "icon" | "manifest" | "preload" |
"media" | "poster" | "iframe"`.

Extraction becomes table-driven:

| selector | attribute | kind |
| --- | --- | --- |
| `a[href]` | `href` | `anchor` |
| `link[rel=canonical]` | `href` | `canonical` |
| `link[rel=alternate][hreflang]` | `href` | `alternate` |
| `img[src]` | `src` | `img` |
| `img[srcset]`, `source[srcset]` | `srcset` | `img` |
| `script[src]` | `src` | `script` |
| `link[rel~=stylesheet]` | `href` | `stylesheet` |
| `link[rel~=icon]`, `link[rel~=apple-touch-icon]` | `href` | `icon` |
| `link[rel=manifest]` | `href` | `manifest` |
| `link[rel=preload]` | `href`, `imagesrcset` | `preload` |
| `video[src]`, `audio[src]`, `source[src]` | `src` | `media` |
| `video[poster]` | `poster` | `poster` |
| `iframe[src]` | `src` | `iframe` |

`<source>` appears in the table twice on purpose: inside `<picture>` it
carries `srcset` and is an image, while inside `<video>` or `<audio>` it
carries `src` and is media. The attribute, not the parent, decides the kind.

`rel~=` is load-bearing for `rel="shortcut icon"`, where the icon token sits
alongside another word in the same attribute and only token matching finds
it. It does not, however, make one selector cover `apple-touch-icon` too:
`rel~=icon` matches a token that is exactly `icon`, and `apple-touch-icon` is
a single token that is never equal to `icon`, hyphens and all, so `rel~=icon`
alone never matches it. That is why the icon rule is two selector arms,
`link[rel~=icon], link[rel~=apple-touch-icon]`, not one; do not simplify it
down to the first arm on the assumption that token matching already covers
the second. A `rel=canonical` element still cannot also match either arm,
since `canonical` is neither token.

Two new pieces:

**`parseSrcset(value): string[]`** splits a candidate list into URLs,
discarding the `2x` and `640w` descriptors. Commas are legal inside URLs, so
it scans candidates rather than splitting naively on `,`: take the leading
run of non-whitespace characters as the URL, then advance past the optional
descriptor to the separating comma. `data:` URIs need no parser special case
because they fall out through the existing `SKIP_SCHEMES` gate downstream.

**Per-document de-duplication.** The same `/_astro/hero.abc123.webp` appears
dozens of times across one page's `srcset` attributes. `extractRefs` emits
each `(kind, href)` pair at most once per document, so one missing image
produces one report line rather than forty.

`classifyRef` changes by one predicate. The `absoluteSelfLink` flag reads
`ref.kind === "anchor"` today; it becomes membership outside
`{canonical, alternate}`.

### `src/scripts/check-links-internal.ts`

Near-untouched. The loop already classifies, resolves, follows redirects and
reports with a `[kind]` label, so asset kinds flow through and print as
`ERROR [img] /_astro/foo.webp`. The `no page or asset at X` message already
says "asset" and needs no change.

One addition: the summary line gains a reference count
(`Checked 178 pages, N references: ...`) so the sweep's size is visible and a
silent collapse in extraction is noticeable.

Fragments need no special case. The `buildTargetMap` work committed in
`33e5400` gates fragment checking on the served file being HTML, so
`sprite.svg#icon` resolves the path and leaves the fragment to the target
format.

### Unchanged

`lychee.toml`, `src/scripts/verify-dead-links.ts` and
`.github/workflows/links.yml` all stay as they are.

## Error handling

- A malformed `srcset` (empty candidate, descriptor without a URL) yields no
  URL for that candidate and is skipped silently. It is a markup smell, not
  a broken link, and this checker is not a validator.
- An attribute present but empty is skipped, as empty `href` is today.
- Percent-encoding, duplicate slashes and query strings are handled by
  `normalizePath`, unchanged.
- Assets that resolve through `_redirects` are accepted, as page links are.

## Testing

Unit tests in `tests/unit/link-check-extract.test.ts`:

- Each row of the selector table is extracted with the right kind.
- `rel="shortcut icon"` and `rel="apple-touch-icon"` match `icon`;
  `rel=canonical` does not.
- `parseSrcset` handles descriptors, multiple candidates, a URL containing a
  comma, and a single URL with no descriptor.
- A repeated asset URL within one document yields one ref.
- An absolute self-origin `img src` is internal and flagged; an off-origin
  one is external.
- A `data:` URI in `src` is skipped.

Two existing tests encode the old, narrower contract and are rewritten
rather than deleted:
`extractRefs: picks up anchors, canonical and alternates only` and
`extractRefs: ignores stylesheet links`.

End to end: `pnpm check:links:internal` against a real build must report 0
errors before the change lands, with any genuine findings fixed in the same
PR.

## Risks

- **A backlog of real findings blocks `main`.** Likely the first run surfaces
  something. Handled by running locally before merging, not by weakening the
  gate.
- **Runtime.** Reference count rises steeply, but resolution is a `Map`
  lookup against an already-built target map, and de-duplication cuts the
  `srcset` population hard. No new I/O: ids are only read for HTML fragment
  targets, which assets are not.
- **`iframe[src]` and `media[src]` may have no instances today.** They cost
  one table row each and cover a future addition rather than a current one.
