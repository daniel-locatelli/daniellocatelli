# Lightbox click-to-zoom design

**Date:** 2026-04-30
**Status:** Approved
**Scope:** `src/pages/[...locale]/[...subpage].astro`

## Problem

Body images in subpages open in a lightbox that fits them to `max-h-[90vh] max-w-[90vw] object-contain`. When the loaded image variant has more pixels than the fit box can show, those extra pixels are unreachable from inside the lightbox. The current workaround is right-click → "Open image in new tab", which loses the lightbox UX.

## Goal

Let visitors zoom from "fit" to "natural size" of a high-resolution variant, and pan around the image, without leaving the lightbox.

## Non-goals

- Multi-image navigation (prev/next).
- Continuous wheel-zoom with zoom-around-cursor.
- Pinch-zoom beyond what the browser provides natively in a scroll container.
- Loading the unprocessed source asset from `src/assets/`.

## Interaction model

| State | Cursor | On click of image | On drag of image |
| ----- | ------ | ----------------- | ---------------- |
| Fit | `zoom-in` | Toggle to Zoomed (if image is larger than fit box; otherwise no-op) | n/a |
| Zoomed | `grab` / `grabbing` while dragging | Toggle back to Fit (only if click was not a drag) | Pan via scroll position |

Closing the lightbox (× button, backdrop click, Esc) works in both states and resets to Fit on next open. Touch users get native scroll/pinch inside the scroll container.

## Source upgrade

When a clicked `.prose img` triggers the lightbox:

1. Read the image's `srcset` attribute. Parse entries (`url Nw, url Mw, ...`).
2. Pick the URL with the largest `w` descriptor; fall back to `currentSrc`, then `src`.
3. Assign that URL to `lightboxImg.src`.

This guarantees the same zoom ceiling on a phone (where the page selected the 400 px variant) as on a desktop (where it picked 1600 px). No image-pipeline changes; we only consume the srcset variants the build already emits in `src/lib/remark-image-to-astro-image.ts` (`WIDTHS = [400, 800, 1200, 1600]`).

## Zoom mechanism

Native scrolling inside a wrapper, not CSS `transform: scale()`:

- **Fit mode:** wrapper is a flex centerer; image has `max-h-[90vh] max-w-[90vw] object-contain` (today's classes).
- **Zoomed mode:** wrapper becomes `overflow: auto` with a fixed footprint (`max-h-[95vh] max-w-[95vw]`); image drops the `max-*` constraints and renders at its natural size.

Why scroll over transform: the browser handles touch pinch, two-finger pan, momentum, and scrollbar accessibility for free. A `scale()` implementation would have to reimplement all of it.

Drag-to-pan for mouse: on `mousedown`, capture initial cursor + `scrollLeft/scrollTop`; on `mousemove`, set `scrollLeft/scrollTop` by the negative delta; on `mouseup`, release. A 5 px movement threshold separates drag from click so a small jitter during a click doesn't suppress the toggle.

## State

Two attributes on the lightbox element, no globals:

- `data-zoomed="true|false"` — drives Tailwind variants and cursor.
- `data-dragging="true|false"` — set on the first `mousemove` that exceeds the drag threshold; consumed and reset on the matching `click` to suppress toggle. Cleared on `mouseup` regardless.

## Edge cases

- **Image not larger than fit box.** On click, compare the image's natural pixels against the fit-mode box (`window.innerWidth * 0.9` and `window.innerHeight * 0.9`, matching `max-w-[90vw] max-h-[90vh]`). If `naturalWidth <= fitW && naturalHeight <= fitH`, early return — zooming would not reveal more pixels. Using `naturalWidth/Height` directly avoids the trap that `img.clientWidth` of an `object-contain` image equals the box, not the painted area.
- **High-res variant still loading.** Keep the previously-shown lightbox image visible during the swap; assign `lightboxImg.src` and let the browser update on `load` (avoids a blank flash). The same URL is cached after first open.
- **Native HTML5 image drag.** Set `draggable="false"` on the image and `user-select: none` on the wrapper to suppress Chrome's drag-preview ghost.
- **Background page scroll bleed.** On open, set `document.body.style.overflow = "hidden"`; on close, restore. Currently wheeling on the backdrop scrolls the page underneath.
- **Lightbox close while zoomed.** `closeLightbox()` resets `data-zoomed`, clears scroll position, and restores body overflow. Next open starts in Fit.
- **Backdrop click vs. image click while zoomed.** Backdrop click closes (today's behavior, unchanged). Only clicks on the image toggle zoom.

## Scope of changes

Everything in `src/pages/[...locale]/[...subpage].astro`:

- **Markup (lines 765–780):** wrap `#lightbox-img` in a scroll container; add Tailwind classes keyed off `data-zoomed`; add `draggable="false"` on the image; add `user-select: none` to the wrapper.
- **Script (lines 782–832):** extend `setupLightbox()`:
  - `pickLargestSrcsetUrl(img)` helper.
  - On `.prose` image click: open as today, but assign the upgraded URL.
  - On lightbox-image click: toggle `data-zoomed` (with the no-op guard and the drag-suppression check).
  - `mousedown/mousemove/mouseup` on the wrapper: drag-to-pan with the 5 px threshold.
  - On open: body scroll lock. On close: restore + reset `data-zoomed` + reset scroll position.

No new files, no new dependencies, no changes to the image pipeline, no changes to content.

## Testing

Manual verification — desktop and mobile viewport in Chrome DevTools:

- High-res image (`/research/architecture-biomimicry-algorithm` has large diagrams): open → click image → zoomed and panable; click again → fit; Esc → close.
- Small image: click is a no-op, cursor stays `zoom-in`.
- While open, scroll wheel over the backdrop does not scroll the page.
- Esc, ×, and backdrop click all close cleanly and reset state.
- Touch viewport: pan/pinch work via native scroll.

No automated test added. The existing `tests/e2e/subpages.spec.ts` covers smoke-level page loads; modal interaction tests aren't currently the team's pattern. A Playwright smoke test (open → zoom → assert `data-zoomed`) can be added if desired.

## Out of scope, deferred

- Wheel-to-zoom around cursor.
- Multiple zoom levels.
- Loading unprocessed originals from `src/assets/`.
- Multi-image lightbox navigation.
