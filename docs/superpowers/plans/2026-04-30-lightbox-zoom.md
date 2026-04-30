# Lightbox click-to-zoom — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors click the open lightbox image to toggle between fit-to-viewport and natural-size-with-pan, using the largest srcset variant the image already publishes.

**Architecture:** Extend the existing in-page lightbox (no library, no new files). Wrap the lightbox `<img>` in a scrollable div; toggle a `data-zoomed` attribute that swaps Tailwind classes between fit and natural-size. Pan via native scroll; on desktop, drag-to-pan listeners adjust `scrollLeft/scrollTop`. On open, parse the clicked image's `srcset` and assign the largest `w` URL to the lightbox image so phones zoom into the same 1600 px variant desktops do.

**Tech Stack:** Astro 6, Tailwind CSS 4, vanilla TS in `<script>` blocks, Playwright for the e2e smoke test.

**Spec:** `docs/superpowers/specs/2026-04-30-lightbox-zoom-design.md`

**Single file under change:** `src/pages/[...locale]/[...subpage].astro`

---

## File map

- **Modify** `src/pages/[...locale]/[...subpage].astro`
  - Markup at lines ~765–780: lightbox container.
  - Script at lines ~782–832: `setupLightbox()`.
- **Modify** `tests/e2e/subpages.spec.ts`
  - Add one Playwright smoke test alongside the two existing lightbox tests (~line 70).

No other files. No new dependencies.

---

## Task 1: Restructure lightbox markup

Wrap the lightbox image in a scroll container and centre it via flex. Drive the two modes with `data-zoomed`. The outer overlay and close button stay where they are.

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro:765-780`

- [ ] **Step 1: Replace the lightbox markup**

Old (lines 765–780):
```html
<div
  id="lightbox"
  class="fixed inset-0 z-50 hidden items-center justify-center bg-black/90 backdrop-blur-sm"
>
  <button
    id="lightbox-close"
    aria-label="Close lightbox"
    class="absolute top-4 right-4 z-10 cursor-pointer text-3xl text-white/70 transition hover:text-white"
    >&times;</button
  >
  <img
    id="lightbox-img"
    class="max-h-[90vh] max-w-[90vw] rounded object-contain"
    alt=""
  />
</div>
```

New:
```html
<div
  id="lightbox"
  data-zoomed="false"
  class="fixed inset-0 z-50 hidden items-center justify-center bg-black/90 backdrop-blur-sm"
>
  <button
    id="lightbox-close"
    aria-label="Close lightbox"
    class="absolute top-4 right-4 z-10 cursor-pointer text-3xl text-white/70 transition hover:text-white"
    >&times;</button
  >
  <div
    id="lightbox-scroll"
    class="flex max-h-[95vh] max-w-[95vw] items-center justify-center select-none data-[zoomed=true]:overflow-auto"
  >
    <img
      id="lightbox-img"
      draggable="false"
      class="rounded object-contain max-h-[90vh] max-w-[90vw] data-[zoomed=true]:max-h-none data-[zoomed=true]:max-w-none"
      alt=""
    />
  </div>
</div>
```

Notes:
- `data-zoomed` lives on the outer `#lightbox` *and* is mirrored to `#lightbox-img` so the Tailwind `data-[zoomed=true]:` variants on the image work without a JS class swap. The script sets it on both elements (Step 4 of Task 3).
- `select-none` on the scroll wrapper kills the text-cursor flash during a drag.
- `draggable="false"` on the image suppresses Chrome's HTML5 drag-preview ghost.
- `data-[zoomed=true]:overflow-auto` on `#lightbox-scroll` produces native scrollbars only in zoomed mode.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS (type-check + build succeed; no Tailwind class errors).

- [ ] **Step 3: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "refactor(lightbox): wrap image in scroll container for zoom"
```

---

## Task 2: Add srcset upgrade helper

Parse the clicked image's `srcset` and pick the URL with the largest `w` descriptor. Falls back to `currentSrc` then `src` for `.md` body images that have no srcset.

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro` — inside the `<script>` at line ~782, above `setupLightbox()`.

- [ ] **Step 1: Add the helper function**

Insert this function at the top of the same `<script>` block, immediately above `function setupLightbox() {`:

```ts
function pickLargestSrc(img: HTMLImageElement): string {
  const srcset = img.getAttribute("srcset");
  if (srcset) {
    let bestUrl = "";
    let bestWidth = 0;
    for (const entry of srcset.split(",")) {
      const parts = entry.trim().split(/\s+/);
      if (parts.length < 2) continue;
      const url = parts[0];
      const descriptor = parts[parts.length - 1];
      if (!descriptor.endsWith("w")) continue;
      const width = parseInt(descriptor.slice(0, -1), 10);
      if (Number.isFinite(width) && width > bestWidth) {
        bestWidth = width;
        bestUrl = url;
      }
    }
    if (bestUrl) return bestUrl;
  }
  return img.currentSrc || img.src;
}
```

- [ ] **Step 2: Wire it into the open handler**

Replace the existing block at lines ~800–808:

```ts
prose.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName !== "IMG") return;
  const img = target as HTMLImageElement;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");
});
```

with:

```ts
prose.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName !== "IMG") return;
  const img = target as HTMLImageElement;
  lightboxImg.src = pickLargestSrc(img);
  lightboxImg.alt = img.alt;
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");
});
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`
Open `/research/architecture-biomimicry-algorithm` (this page has body images on the responsive srcset path). Click any body image, then in DevTools Elements panel inspect `#lightbox-img` — its `src` should end with `-1600w.webp` (or the largest `w` in the srcset), not the variant the page chose for the inline image. On a mobile viewport, this should still resolve to the 1600 width.

- [ ] **Step 4: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "feat(lightbox): open with largest srcset variant"
```

---

## Task 3: Click-to-toggle zoom

Toggle between fit and natural-size on image click. Includes the no-op guard for images that aren't bigger than the fit box.

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro` — inside `setupLightbox()`.

- [ ] **Step 1: Acquire the scroll wrapper inside `setupLightbox()`**

Below this existing line:

```ts
const lightboxClose = document.getElementById("lightbox-close");
```

Add:

```ts
const scrollEl = document.getElementById("lightbox-scroll");
if (!scrollEl) return;
```

- [ ] **Step 2: Add the toggle helpers**

After the existing `closeLightbox` definition (around line 814), insert:

```ts
function isImageLargerThanFit(): boolean {
  const fitW = window.innerWidth * 0.9;
  const fitH = window.innerHeight * 0.9;
  return (
    lightboxImg!.naturalWidth > fitW || lightboxImg!.naturalHeight > fitH
  );
}

function setZoomed(zoomed: boolean) {
  lightbox!.dataset.zoomed = zoomed ? "true" : "false";
  lightboxImg!.dataset.zoomed = zoomed ? "true" : "false";
  if (!zoomed) {
    scrollEl!.scrollTo(0, 0);
  }
  lightboxImg!.style.cursor = zoomed ? "grab" : "zoom-in";
}
```

- [ ] **Step 3: Initialise cursor on open**

In the existing `prose.addEventListener("click", ...)` handler from Task 2, after assigning `src`/`alt` and *before* the two `classList` mutations, add:

```ts
setZoomed(false);
```

So the handler now reads:

```ts
prose.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName !== "IMG") return;
  const img = target as HTMLImageElement;
  lightboxImg.src = pickLargestSrc(img);
  lightboxImg.alt = img.alt;
  setZoomed(false);
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");
});
```

- [ ] **Step 4: Add the click-to-toggle handler on the image**

Below the existing `lightbox.addEventListener("click", ...)` backdrop handler, add:

```ts
lightboxImg.addEventListener("click", (e) => {
  e.stopPropagation(); // never reach the backdrop close handler
  if (lightbox!.dataset.dragging === "true") {
    lightbox!.dataset.dragging = "false";
    return;
  }
  const isZoomed = lightbox!.dataset.zoomed === "true";
  if (!isZoomed && !isImageLargerThanFit()) return;
  setZoomed(!isZoomed);
});
```

- [ ] **Step 5: Reset zoom on close**

Modify `closeLightbox` from:

```ts
function closeLightbox() {
  lightbox!.classList.add("hidden");
  lightbox!.classList.remove("flex");
  lightboxImg!.src = "";
}
```

to:

```ts
function closeLightbox() {
  setZoomed(false);
  lightbox!.classList.add("hidden");
  lightbox!.classList.remove("flex");
  lightboxImg!.src = "";
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`
On `/research/architecture-biomimicry-algorithm`, open a large body image. Click once → the image expands beyond the 90vw/90vh box and scrollbars appear on `#lightbox-scroll`. Click again → it returns to fit. Open a small image (look for one whose intrinsic size is < 90vw × 90vh on your viewport) — clicking does nothing. Esc → closes; reopening any image shows fit mode again.

- [ ] **Step 7: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "feat(lightbox): click image to toggle zoom"
```

---

## Task 4: Drag-to-pan

Mouse drag inside the scroll wrapper pans the scroll position. A 5 px threshold separates a drag from a click so a small jitter during a click doesn't suppress the toggle.

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro` — inside `setupLightbox()`.

- [ ] **Step 1: Add the drag handlers**

After the `lightboxImg.addEventListener("click", ...)` block from Task 3, append:

```ts
const DRAG_THRESHOLD = 5;
let dragStart: { x: number; y: number; scrollLeft: number; scrollTop: number } | null = null;

scrollEl.addEventListener("mousedown", (e) => {
  if (lightbox!.dataset.zoomed !== "true") return;
  if ((e.target as HTMLElement).id !== "lightbox-img") return;
  e.preventDefault(); // suppress text/image selection
  dragStart = {
    x: e.clientX,
    y: e.clientY,
    scrollLeft: scrollEl!.scrollLeft,
    scrollTop: scrollEl!.scrollTop,
  };
  lightbox!.dataset.dragging = "false";
});

window.addEventListener("mousemove", (e) => {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  if (
    lightbox!.dataset.dragging !== "true" &&
    Math.hypot(dx, dy) >= DRAG_THRESHOLD
  ) {
    lightbox!.dataset.dragging = "true";
    lightboxImg!.style.cursor = "grabbing";
  }
  if (lightbox!.dataset.dragging === "true") {
    scrollEl!.scrollLeft = dragStart.scrollLeft - dx;
    scrollEl!.scrollTop = dragStart.scrollTop - dy;
  }
});

window.addEventListener("mouseup", () => {
  if (!dragStart) return;
  dragStart = null;
  if (lightbox!.dataset.zoomed === "true") {
    lightboxImg!.style.cursor = "grab";
  }
  // dataset.dragging stays "true" until the matching click fires and consumes it.
});
```

Note: `mousemove`/`mouseup` listen on `window` so the drag continues even if the cursor leaves the image. The matching `click` on `#lightbox-img` (Task 3, Step 4) consumes the `dragging` flag so a real drag does not toggle zoom.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`. With a zoomed image, mousedown on the image and drag — the image should pan smoothly under the cursor; the cursor should change from `grab` to `grabbing` once you cross 5 px. Release — cursor returns to `grab`. The drag should not toggle the image back to fit. A pure click (no movement) on the zoomed image should still toggle to fit.

- [ ] **Step 3: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "feat(lightbox): drag to pan when zoomed"
```

---

## Task 5: Body scroll lock

Lock background page scroll while the lightbox is open. Restore on close.

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro` — inside `setupLightbox()`.

- [ ] **Step 1: Lock scroll on open**

In the `prose.addEventListener("click", ...)` handler, after `lightbox.classList.add("flex");`, append:

```ts
document.body.style.overflow = "hidden";
```

So the handler now reads:

```ts
prose.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName !== "IMG") return;
  const img = target as HTMLImageElement;
  lightboxImg.src = pickLargestSrc(img);
  lightboxImg.alt = img.alt;
  setZoomed(false);
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");
  document.body.style.overflow = "hidden";
});
```

- [ ] **Step 2: Restore scroll on close**

In `closeLightbox`, after `lightboxImg!.src = "";`, append:

```ts
document.body.style.overflow = "";
```

Final form:

```ts
function closeLightbox() {
  setZoomed(false);
  lightbox!.classList.add("hidden");
  lightbox!.classList.remove("flex");
  lightboxImg!.src = "";
  document.body.style.overflow = "";
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. Open the lightbox on a long page (e.g. `/research/architecture-biomimicry-algorithm`). Wheel/scroll over the backdrop or the lightbox image — the underlying page should not scroll. Close (Esc, ×, or backdrop click) — page scroll resumes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/[...locale]/[...subpage].astro
git commit -m "feat(lightbox): lock body scroll while open"
```

---

## Task 6: Playwright smoke test

Add one e2e test that opens the lightbox, clicks the image, and asserts `data-zoomed="true"`.

**Files:**
- Modify: `tests/e2e/subpages.spec.ts` — append a test inside the `Subpages` describe block, after the existing "lightbox closes on Escape" test (~line 69).

- [ ] **Step 1: Add the test**

Insert after the "lightbox closes on Escape" test:

```ts
test("lightbox image click toggles zoom", async ({ page }) => {
  await page.goto(`/${KNOWN_SUBPAGE.slug}`);
  const lightbox = page.locator("#lightbox");
  const lightboxImg = page.locator("#lightbox-img");

  await page.locator(".prose img").first().click();
  await expect(lightbox).not.toHaveClass(/hidden/);
  await expect(lightbox).toHaveAttribute("data-zoomed", "false");

  // Wait for the upgraded image to load so naturalWidth is available.
  await page.waitForFunction(() => {
    const img = document.getElementById("lightbox-img") as HTMLImageElement | null;
    return !!img && img.complete && img.naturalWidth > 0;
  });

  // Only large-enough images toggle to zoomed; KNOWN_SUBPAGE has full-bleed
  // body images that always exceed 90vw of the test viewport.
  await lightboxImg.click();
  await expect(lightbox).toHaveAttribute("data-zoomed", "true");

  await lightboxImg.click();
  await expect(lightbox).toHaveAttribute("data-zoomed", "false");
});
```

- [ ] **Step 2: Run the new test**

Run: `npx playwright test tests/e2e/subpages.spec.ts -g "lightbox image click toggles zoom"`
Expected: PASS.

If it fails because the test image is smaller than the fit box on the test viewport, switch the assertion to "data-zoomed remains false on small image" instead of asserting the toggle, and add a separate test against a known large image (e.g. a research page). Document the chosen behaviour in the test comment.

- [ ] **Step 3: Run the full subpages spec to confirm nothing regressed**

Run: `npx playwright test tests/e2e/subpages.spec.ts`
Expected: all tests PASS, including the existing "lightbox opens on image click" and "lightbox closes on Escape".

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/subpages.spec.ts
git commit -m "test(lightbox): smoke-test click-to-zoom toggle"
```

---

## Task 7: Final manual verification pass

Confirm the full feature end-to-end across desktop and mobile viewports.

- [ ] **Step 1: Desktop pass**

Run: `npm run dev`. In a desktop browser:

- Open a high-res image on `/research/architecture-biomimicry-algorithm`. Click → zooms beyond fit; scrollbars appear; cursor is `grab`.
- Drag inside the zoomed image → pans; cursor is `grabbing` while held; pan is smooth and tracks the cursor.
- Release the drag mid-image, then click without moving → returns to fit.
- Click again → zoom; press Esc → closes and resets to fit on next open.
- Open the same image again → starts in fit mode (state was reset).
- Wheel-scroll over the open lightbox → page beneath does not scroll.
- Open a small image (find one in any project page whose intrinsic size is comfortably under 90vw × 90vh on your viewport) → click is a no-op.
- × button and backdrop click both close cleanly.

- [ ] **Step 2: Mobile pass**

In Chrome DevTools, switch to a mobile viewport (e.g. iPhone 14, 390×844). Reload the same page.

- Open a large image → fits the viewport.
- Tap the image once → zooms; scrollbars or scroll affordance appears.
- Single-finger swipe → pans the zoomed image.
- Pinch-out → browser-native pinch-zoom magnifies further (handled by the OS, not our code).
- Tap again → returns to fit.
- Tap × or backdrop → closes.

- [ ] **Step 3: Build sanity check**

Run: `npm run build`
Expected: PASS — `astro check` clean, `astro build` clean.

- [ ] **Step 4: No further commit needed**

If the manual pass surfaces no issues, no extra commit. If you find anything, fix it as a focused commit on top.

---

## Self-review

**Spec coverage:**
- Interaction model (fit ↔ zoomed via click; backdrop/Esc/× close; touch via native scroll) → Task 1 (markup), Task 3 (toggle), Task 5 (close paths preserved).
- Source upgrade (largest srcset → currentSrc → src) → Task 2.
- Zoom mechanism (native scroll, not transform) → Task 1 (`overflow-auto` via data variant), Task 3 (drop `max-*` constraints via data variant).
- State (`data-zoomed`, `data-dragging`) → Task 1 (markup), Task 3 (`setZoomed`), Task 4 (`dragging`).
- Edge: image-not-larger-than-fit no-op → Task 3, Step 4 (`isImageLargerThanFit`).
- Edge: high-res still loading → handled by leaving the previous lightbox image visible during `src` swap (browser semantics). No explicit task needed.
- Edge: native HTML5 image drag → Task 1 (`draggable="false"` + `select-none`).
- Edge: body scroll lock → Task 5.
- Edge: backdrop vs. image click while zoomed → Task 3 Step 4 (`stopPropagation`).
- Testing → Task 6 (Playwright smoke) + Task 7 (manual).

No spec gaps.

**Type/identifier consistency:**
- `setZoomed(boolean)`, `isImageLargerThanFit()`, `pickLargestSrc(img)` — referenced consistently across tasks.
- `data-zoomed` is mirrored to both `#lightbox` and `#lightbox-img`; Task 1 sets the markup, Task 3 sets both in `setZoomed`. Tailwind variants `data-[zoomed=true]:*` apply on whichever element has the attribute.
- `#lightbox-scroll` introduced in Task 1 and consumed in Task 3 (Step 1) and Task 4.

**Placeholder scan:** None — every step has the actual code or actual command.
