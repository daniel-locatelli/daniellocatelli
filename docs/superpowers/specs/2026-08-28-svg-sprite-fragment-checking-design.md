# Same-page fragment checking: design

Extends the internal link checker to resolve bare `#fragment` references
against the ids of the page that emits them, closing the last silent-breakage
class the asset work left open.

Follows on from `2026-08-28-asset-link-checking-design.md`, which widened the
checker from anchors to everything the browser loads.

## Problem

The widened checker validates 15446 references per sweep. `<use href="#icon">`
is not among them. The current build emits 1346 of these, every one an icon.

`classifyRef` returns `{ type: "skip" }` for any href beginning with `#`. That
is defensible for a document anchor, whose failure at least leaves the visitor
on a readable page. It is wrong for `<use>`: a `<use>` pointing at a symbol
that is not in the page's inline sprite renders as nothing at all. No console
error, no fallback glyph, just a hole where an icon should be. It is the
hardest breakage on the site to notice by eye, and it is the one thing the
asset work was built to catch that it does not catch.

The same skip also hides 612 distinct document anchors: 135 `#content`
skip-links, and the rest footnote pairs (`#fn-vasey-2020`,
`#fnref-wagner-tim-2020`) on the research and project pages. A footnote
backlink whose target id was renamed is a dead click in the middle of a
citation. It rots as quietly as the icon does.

A survey of the current build confirms every one of these resolves today
(0 unresolved `<use>` targets, 0 unresolved anchors across 178 pages). This
change is regression protection, not a bug fix. It lands green.

### The counter cannot see a row collapse

`check-links-internal.ts` reports one aggregate `refCount`. When a `SOURCES`
row stops matching, because a dependency bump changed what Astro emits, the
total dips by an amount indistinguishable from ordinary content churn. Two
rows match nothing in the current build already, `video[poster]` and
`link[rel=preload][imagesrcset]`, so a row at zero is not hypothetical.

Counting per `RefKind` does not fix this. `preload` spans two rows and `img`
spans two rows, so the `imagesrcset` row dying stays invisible behind its
live sibling. Detecting the collapse requires counting per row.

## Scope

In scope: bare `#fragment` references from `<use>` and `<a>`, resolved
against the ids of the emitting page; per-row match counts in the summary;
four selector rows for markup Astro could plausibly begin emitting.

Out of scope:

- **`xlink:href`**, the legacy `<use>` form. Zero occurrences; astro-icon
  emits plain `href`, as does every current SVG toolchain. Colon-escaped
  attribute selectors are not worth the linkedom compatibility risk for a
  form nothing in the pipeline produces.
- **External sprites** (`<use href="/sprite.svg#icon">`). These already fall
  through to the normal internal path, so the _file_ is resolved against the
  target map. The symbol inside a non-HTML target is not checked, consistent
  with how `document.pdf#page=2` is already treated: a fragment belongs to
  the target format once the target is not HTML. Zero occurrences today.
- **Fragment percent-decoding.** Cross-page fragments are already matched
  against raw ids without decoding. Same-page fragments follow that, so the
  two paths cannot drift.
- **Duplicate ids.** An id appearing twice on a page is invalid HTML but
  resolves fine; the checker asks only whether at least one exists.

## Key decisions

### One same-page path, two reference kinds

`classifyRef` gains a third variant:

```ts
| { type: "same-page"; fragment: string }
```

`<use href="#x">` and `<a href="#x">` both take it. Giving `<use>` a
fragment-only kind of its own and leaving anchors skipped would be the
smaller diff, but it would build a second, parallel resolution path for a
question the first one already answers: is there an element with this id on
this page. One mechanism, both kinds, no divergence later.

`href="#"` and `href="#top"` stay skipped. HTML defines both as "top of
document" with no matching id required, so flagging them would be a false
positive on correct markup.

Resolution reuses the runner's existing `idsFor` cache, keyed by file. The
emitting page is almost always already in that cache, so the added work is a
map lookup per reference, not a parse.

### Missing id is an error, not a warning

Same reasoning as a missing asset. The id is either in the emitted HTML or it
is not; there is no network, no host, and no flakiness to absorb. It fails
the push gate.

### Counts per selector row, keyed by an explicit label

`Source` gains a required `label: string` rather than the row being keyed on
its selector string. The label is stable output a human reads in the summary,
so it should not shift when a selector is edited for an unrelated reason.

`extractRefs` changes signature to return `{ refs, counts }`. `counts` tallies
**raw attribute matches per row, before dedupe**. Pre-dedupe is the detail
that carries the weight: the dedupe key is `kind + href`, so a row whose
references are all absorbed by an earlier row would tally zero while being
perfectly alive, which is precisely the false negative the counter exists to
prevent. It also keeps the honest distinction visible, 1346 `<use>` emitted
against 867 distinct.

Rows at zero are reported on a trailing line and never fail the run. Several
rows are speculative by design; a speculative row matching nothing is the
expected state, not a defect.

### Four rows for markup that does not exist yet

`link[rel=modulepreload]`, `object[data]`, `embed[src]` and SVG `image[href]`
were recorded as deliberate exclusions in the asset-checking spec on the
grounds that all four are zero-occurrence. `modulepreload` is the one that
could arrive without anyone deciding to add it: a bundler change in Astro
would start emitting chunk hrefs that `script[src]` does not cover, and they
would ship unchecked. The other three are the same shape and cost one table
row each.

Per-row counting is what makes adding them safe. Without it, four permanently
zero rows would be four pieces of code no one can tell are dead.

## Design

### `src/lib/link-check/extract.ts`

`RefKind` gains `"use"`, `"modulepreload"` and `"embed"`. SVG `image[href]`
reuses `"img"`, because it is an image and the report reads better without a
near-duplicate label.

`Source` gains `label: string`, filled in for all existing rows.

`SOURCES` gains five rows:

| label                     | selector                  | attribute | kind            |
| ------------------------- | ------------------------- | --------- | --------------- |
| `use[href]`               | `use[href]`               | `href`    | `use`           |
| `link[rel=modulepreload]` | `link[rel=modulepreload]` | `href`    | `modulepreload` |
| `object[data]`            | `object[data]`            | `data`    | `embed`         |
| `embed[src]`              | `embed[src]`              | `src`     | `embed`         |
| `image[href]`             | `image[href]`             | `href`    | `img`           |

`extractRefs` returns `{ refs: Ref[]; counts: Map<string, number> }`. Every
row is seeded at zero so a row matching nothing is reported rather than
missing from the map.

`classifyRef` handles a leading `#` before the scheme checks: `#` and `#top`
(case-insensitive) return `skip`; anything else returns
`{ type: "same-page", fragment }`.

### `src/scripts/check-links-internal.ts`

Handles `result.type === "same-page"` by resolving the fragment against
`idsFor(file)`, the emitting file. A miss is an error reading `no element
with id "x" on this page`.

Accumulates per-row counts across all pages into one map. The summary prints
the existing totals line, then the row table sorted by count descending, then
`N selector rows matched nothing.` when any row is at zero.

### Tests

`tests/unit/link-check-extract.test.ts` covers, at minimum:

- `<use href="#icon">` extracts as kind `use`
- `<use href="/sprite.svg#icon">` classifies as `internal` with a path, not
  as `same-page`
- `#` and `#top` classify as `skip`, `#Top` too
- `<a href="#fn-1">` classifies as `same-page` with fragment `fn-1`
- `counts` is pre-dedupe: a page with the same `<use href>` twice reports 2
- every `SOURCES` row appears in `counts`, including rows matching nothing
- `xlink:href` is not extracted, pinning the documented exclusion

A runner-level test asserts a page whose `<use>` names an absent symbol
produces an error, and that the same markup with the symbol present does not.

## Verification

`pnpm build` then the checker, expecting zero errors and a total near 16313
(15446 today plus 867 distinct `<use>` references; the 612 same-page anchors
are already counted in the total, they were extracted and then skipped).

The row table should show `link[rel=preload][imagesrcset]`, `video[poster]`
and the four new rows at zero, and every other row non-zero.
