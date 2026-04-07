# Row-first Tile Ordering on Listing Pages

**Status:** Approved design, pending implementation plan
**Scope:** `src/pages/[...locale]/[...page].astro`
**Date:** 2026-04-07

## Problem

The content listing pages rendered by `[...page].astro` (for `/projects`, `/research`, `/teaching`, etc.) tile their subpages with Tailwind's CSS multi-columns:

```html
<div class="columns-1 gap-8 sm:columns-2 lg:columns-3">
```

The subpages array is sorted newest-first by `DateStart`. CSS multi-columns fill column-by-column and balance by *height*, not by item count. With card heights varying (images have different aspect ratios), the balancing routinely pushes old items to the *top* of later columns: a 2018 entry can end up at the top of column 3 while newer entries sit buried mid-column 1. The result is visually incoherent, and the perceived reading order does not match the chronological order.

## Goal

On every breakpoint, the newest items should appear near the top row of the listing, with strictly decreasing recency as the eye moves down each column. Strict row-major ordering is not required; "approximately row-major" is the agreed target (decision B).

Mobile (single column) already renders correctly and must not regress.

## Non-goals

- No change to the sort logic, content collections, i18n routing, or image processing.
- No new dependencies, no JS framework.
- No attempt to solve the general CSS masonry problem or handle dynamic content insertion.

## Design

### Approach: explicit column divs via progressive enhancement

Render a flat, chronologically ordered list of cards on the server. On the client, a small script rebuilds the DOM into `N` explicit column wrapper divs and distributes cards round-robin based on the active breakpoint. Mobile skips the rebuild entirely.

Round-robin distribution of items `[0, 1, 2, ..., L-1]` into `N` buckets places card `i` into bucket `i % N`. For `L = 9` and `N = 3`:

- col 1: [0, 3, 6]
- col 2: [1, 4, 7]
- col 3: [2, 5, 8]

The top row is always `[0, 1, 2]`, the three newest items, by construction. Unlike CSS multi-columns, this is deterministic and does not depend on card heights.

### Why not CSS multi-columns with a reordered source array

Reordering the source array to a column-major interleave ([0,3,6,1,4,7,2,5,8]) improves the average case but is still subject to CSS height-balancing, which can push older items up into later columns when card heights are uneven. The exact bug class we are fixing, just less severe. Additionally, different breakpoints need different source orders, and pure CSS cannot reorder items across parent containers, so this option ends up needing client JS anyway.

### Why not server-side multi-variant rendering

Pre-rendering three DOM trees (mobile flat, tablet round-robin, desktop round-robin) gated by Tailwind visibility classes would be pure SSG with no client JS. Rejected because it triplicates the Astro `<Image>` markup on every listing page, adding tens of KB of HTML and tripling build-time image processing pressure, for a purely visual enhancement that degrades gracefully without JS.

### Why the JS cost is acceptable

The page already ships client JS:

- `<ClientRouter />` from `astro:transitions`, rendered via `BaseHead.astro:107`. Required for `astro:page-load` events and smooth navigation.
- The existing `setupCoverPreload` script at `[...page].astro:194-219`, roughly 25 lines, which preloads cover images on hover.

Adding a second progressive-enhancement script is idiomatic for this file. The new logic is approximately 30 lines, adding a negligible number of bytes post-minification.

## DOM structure

### Initial SSR render (mobile-correct)

```html
<div data-subpage-container class="flex flex-col gap-8">
  <article data-chron-index="0" class="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-2xl">
    ...
  </article>
  <article data-chron-index="1" class="...">...</article>
  <article data-chron-index="2" class="...">...</article>
  ...
</div>
```

- Single flex-column parent, spacing from `gap-8`.
- Each `<article>` carries `data-chron-index={i}` where `i` is the position in the chronologically sorted `sortedSubpagesWithImages` array.
- The previous `mb-8` and `break-inside-avoid-column` classes are removed from the article: spacing now comes from the parent's `gap-8`, and the multi-columns hint is no longer meaningful.

### Post-JS state on tablet (2 columns)

```html
<div data-subpage-container class="grid grid-cols-2 gap-8">
  <div class="flex flex-col gap-8">
    <article data-chron-index="0">...</article>
    <article data-chron-index="2">...</article>
    <article data-chron-index="4">...</article>
    ...
  </div>
  <div class="flex flex-col gap-8">
    <article data-chron-index="1">...</article>
    <article data-chron-index="3">...</article>
    ...
  </div>
</div>
```

### Post-JS state on desktop (3 columns)

Same pattern with `grid-cols-3` and three wrapper divs, cards distributed round-robin by `data-chron-index`.

### Container class table

| Column count | Container classes |
|---|---|
| 1 (default, `<640px`) | `flex flex-col gap-8` |
| 2 (`≥640px, <1024px`) | `grid grid-cols-2 gap-8` |
| 3 (`≥1024px`) | `grid grid-cols-3 gap-8` |

## Client script behavior

Added to the existing `<script>` block at `[...page].astro:194`, alongside `setupCoverPreload`.

### `layoutColumns` function

1. Find the container: `document.querySelector('[data-subpage-container]')`. If missing, no-op.
2. Determine column count from matchMedia:
   - `(min-width: 1024px)` matches → 3
   - else `(min-width: 640px)` matches → 2
   - else → 1
3. Collect all cards in chronological order: `container.querySelectorAll('[data-chron-index]')`, sorted ascending by the numeric `data-chron-index`. This query works whether cards are currently direct children of the container (first run) or nested inside wrapper divs (subsequent runs).
4. Rebuild the container:
   - Set `container.className` to the row in the class table above.
   - Clear the container with `container.replaceChildren()`. (Cards are still held by reference in the local `cards` array from step 3; only the old DOM parents are discarded.)
   - If `cols === 1`: append all cards directly to the container.
   - If `cols === 2 || cols === 3`: create `N` wrapper divs with class `flex flex-col gap-8`, append them to the container, and distribute cards via `cards.forEach((card, i) => wrappers[i % cols].appendChild(card))`.

Moving nodes via `appendChild` reparents them, preserving any attached event listeners (such as the `mouseenter` handlers from `setupCoverPreload`).

### Registration

- `document.addEventListener('astro:page-load', layoutColumns)` at script module init. Fires on initial page load and on every Astro view-transition navigation.
- `window.matchMedia('(min-width: 1024px)').addEventListener('change', layoutColumns)` at script module init.
- `window.matchMedia('(min-width: 640px)').addEventListener('change', layoutColumns)` at script module init.

The matchMedia listeners are registered once and persist across view transitions. Each invocation of `layoutColumns` freshly queries the container, so stale references are not a concern if the user navigates to a different page.

### Interaction with `setupCoverPreload`

Both handlers run on `astro:page-load`. The cover-preload listeners live on the `<a>` inside each card, not on the container or its wrappers, so reparenting cards preserves them. The two handlers are order-independent. No changes required to `setupCoverPreload`.

## Edge cases

- **Fewer cards than columns** (e.g., 2 cards at 3 cols): round-robin leaves the last wrapper empty. CSS grid still reserves the column width, and the cards stay left-aligned. Accepted as simplest behavior; this page's expected card counts are always well above the column count.
- **Zero cards:** the existing `sortedSubpagesWithImages.length > 0` branch at `[...page].astro:137` renders a "No items found" box instead of the container. The container is absent, so `layoutColumns` no-ops.
- **Astro view transitions:** `astro:page-load` fires after the new DOM is swapped in. `layoutColumns` queries the fresh container and operates on the new cards.
- **No-JS fallback:** the SSR output is a single flex column at every breakpoint. Looks like the mobile layout always. Not ideal for desktop users without JS, but strictly better than the current broken state.
- **Resize across a breakpoint:** the matchMedia change listeners fire and re-run `layoutColumns`. Idempotent.

## Files changed

Only `src/pages/[...locale]/[...page].astro`:

1. At the `<div>` around line 138: replace `columns-1 gap-8 sm:columns-2 lg:columns-3` with `flex flex-col gap-8`; add `data-subpage-container`.
2. At the `.map` around line 139: destructure the index as well (`.map((subpage, idx) =>`).
3. At the `<article>` around line 142: add `data-chron-index={idx}`; remove `mb-8` and `break-inside-avoid-column` from the class list.
4. In the `<script>` block at line 194: add the `layoutColumns` function, the two `matchMedia` change listeners, and the `astro:page-load` registration.

No changes to imports, sort logic, `<Image>` markup, i18n, or any other file.

## Acceptance criteria

- On a listing page (`/projects`, `/research`, `/teaching`) at desktop width (>=1024px), the three newest items occupy the top row of the grid (cards with `data-chron-index="0"`, `"1"`, `"2"` are the first element of each wrapper).
- At tablet width (640-1023px), the two newest items occupy the top row (`data-chron-index="0"` and `"1"`).
- At mobile width (<640px), items render in strict chronological order in a single column, matching the pre-change behavior.
- Resizing the browser across the 640px or 1024px breakpoints re-lays the grid without a full reload.
- Navigating between listing pages via Astro view transitions re-lays the new page's grid.
- Hovering a card still preloads its cover image (the existing `setupCoverPreload` behavior is unchanged).
- Running `npm run build` succeeds with no type-check errors.
