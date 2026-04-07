# Row-first Tile Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS multi-columns layout on `[...page].astro` listing pages with a progressive-enhancement approach that renders a flat list server-side and redistributes cards round-robin into N explicit wrapper columns via client JS, so the newest items always appear in the top row at every breakpoint.

**Architecture:** SSR emits a flat `flex flex-col gap-8` container of `<article>` cards in chronological order (mobile-correct). A new `layoutColumns` function inside the existing `<script>` block reads `matchMedia` to determine the column count (1/2/3), rebuilds the container into `grid grid-cols-N` with `N` `flex flex-col` wrapper divs, and distributes cards round-robin by a `data-chron-index` attribute. The function runs on `astro:page-load` and on matchMedia change events, so it re-lays on initial load, Astro view transitions, and window resizes across breakpoints. Mobile requires no JS intervention and remains server-identical.

**Tech Stack:** Astro 5, Tailwind CSS 4, vanilla TypeScript (no new deps), Playwright for E2E verification.

**Spec:** `docs/superpowers/specs/2026-04-07-tile-row-first-ordering-design.md`

---

## File Structure

- **Modified:** `src/pages/[...locale]/[...page].astro` — template classes and data attributes + client script extension. Single file, already focused on this responsibility.
- **Created:** `tests/e2e/tile-ordering.spec.ts` — Playwright verification of the layout at three breakpoints and on resize.

No other files touched.

---

## Task 1: Failing Playwright tests for tile ordering

**Files:**
- Create: `tests/e2e/tile-ordering.spec.ts`

- [ ] **Step 1: Write the failing test file**

Create `tests/e2e/tile-ordering.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Tile ordering on listing pages", () => {
  test("desktop viewport places newest items in top row (3 cols)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/grid-cols-3/);

    const wrappers = container.locator("> div");
    await expect(wrappers).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const firstCard = wrappers.nth(i).locator("article").first();
      await expect(firstCard).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("tablet viewport places newest items in top row (2 cols)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/grid-cols-2/);

    const wrappers = container.locator("> div");
    await expect(wrappers).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const firstCard = wrappers.nth(i).locator("article").first();
      await expect(firstCard).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("mobile viewport keeps flat chronological order (1 col)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/flex-col/);
    await expect(container).not.toHaveClass(/grid-cols/);

    const articles = container.locator("> article");
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("resizing desktop → mobile re-lays without reload", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toHaveClass(/grid-cols-3/);

    await page.setViewportSize({ width: 400, height: 800 });
    await expect(container).toHaveClass(/flex-col/);
    await expect(container).not.toHaveClass(/grid-cols/);
  });

  test("resizing mobile → desktop re-lays without reload", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toHaveClass(/flex-col/);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(container).toHaveClass(/grid-cols-3/);
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
npx playwright test tests/e2e/tile-ordering.spec.ts
```

Expected: all 5 tests FAIL. The first three fail because `[data-subpage-container]` does not exist yet (the current container has no such attribute). The two resize tests fail for the same reason.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/e2e/tile-ordering.spec.ts
git commit -m "test: add failing tile ordering tests for listing pages"
```

---

## Task 2: Update SSR template (flat list + data attributes)

**Files:**
- Modify: `src/pages/[...locale]/[...page].astro:138-142`

This task changes the server render only. After it, mobile tests pass but desktop/tablet still fail because no client script reorders yet.

- [ ] **Step 1: Update the container and article markup**

In `src/pages/[...locale]/[...page].astro`, replace the block starting at line 138:

**Before (current):**

```astro
        sortedSubpagesWithImages.length > 0 ? (
          <div class="columns-1 gap-8 sm:columns-2 lg:columns-3">
            {sortedSubpagesWithImages.map((subpage) => {
              const { image } = subpage;
              return (
                <article class="group relative mb-8 flex break-inside-avoid-column flex-col overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-2xl">
```

**After:**

```astro
        sortedSubpagesWithImages.length > 0 ? (
          <div data-subpage-container class="flex flex-col gap-8">
            {sortedSubpagesWithImages.map((subpage, idx) => {
              const { image } = subpage;
              return (
                <article
                  data-chron-index={idx}
                  class="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-2xl"
                >
```

Specifically:

1. Container `<div>`: replace `columns-1 gap-8 sm:columns-2 lg:columns-3` with `flex flex-col gap-8`. Add `data-subpage-container` attribute.
2. `.map` callback: add `idx` as the second parameter.
3. `<article>`: add `data-chron-index={idx}`. Remove `mb-8 ` and `break-inside-avoid-column ` from the class list (spacing now comes from the parent's `gap-8`, and the multi-columns hint is no longer meaningful).

- [ ] **Step 2: Run type check and build**

Run:

```bash
npm run build
```

Expected: `astro check` reports 0 errors, 0 warnings. Build completes successfully. If `astro check` reports an error on `data-chron-index={idx}`, cast to string: `data-chron-index={String(idx)}`.

- [ ] **Step 3: Run the mobile tile-ordering test**

Run:

```bash
npx playwright test tests/e2e/tile-ordering.spec.ts -g "mobile viewport"
```

Expected: PASS. The container is now `[data-subpage-container]`, has class `flex flex-col gap-8`, and its direct children are `<article>` elements in chronological order with `data-chron-index="0"`, `"1"`, `"2"`, etc.

- [ ] **Step 4: Run the desktop tile-ordering test to confirm it still fails**

Run:

```bash
npx playwright test tests/e2e/tile-ordering.spec.ts -g "desktop viewport"
```

Expected: FAIL. The assertion `toHaveClass(/grid-cols-3/)` times out because no client script rebuilds the container yet. This is the expected intermediate state.

- [ ] **Step 5: Run the existing pages.spec.ts to confirm no regressions**

Run:

```bash
npx playwright test tests/e2e/pages.spec.ts
```

Expected: all existing tests PASS. Those tests query `main article` and check card counts and hrefs, none of which depend on the removed `mb-8`/`break-inside-avoid-column` classes or the old container classes.

- [ ] **Step 6: Commit the template change**

```bash
git add "src/pages/[...locale]/[...page].astro"
git commit -m "refactor: render listing pages as flat chronological list"
```

---

## Task 3: Add client-side layoutColumns script

**Files:**
- Modify: `src/pages/[...locale]/[...page].astro:194-219` (extend existing `<script>` block)

- [ ] **Step 1: Extend the `<script>` block with `layoutColumns` logic**

In `src/pages/[...locale]/[...page].astro`, replace the existing `<script>` block (currently lines 194-219) with:

```astro
<script>
  function setupCoverPreload() {
    const links =
      document.querySelectorAll<HTMLAnchorElement>("a[data-cover-src]");
    const preloaded = new Set<string>();

    for (const link of links) {
      link.addEventListener(
        "mouseenter",
        () => {
          const src = link.dataset.coverSrc;
          if (!src || preloaded.has(src)) return;
          preloaded.add(src);
          const preloadLink = document.createElement("link");
          preloadLink.rel = "preload";
          preloadLink.as = "image";
          preloadLink.href = src;
          document.head.appendChild(preloadLink);
        },
        { once: true },
      );
    }
  }

  function getColumnCount(): 1 | 2 | 3 {
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  }

  function layoutColumns() {
    const container = document.querySelector<HTMLElement>(
      "[data-subpage-container]",
    );
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-chron-index]"),
    ).sort(
      (a, b) =>
        Number(a.dataset.chronIndex) - Number(b.dataset.chronIndex),
    );

    const cols = getColumnCount();

    container.replaceChildren();

    if (cols === 1) {
      container.className = "flex flex-col gap-8";
      for (const card of cards) container.appendChild(card);
      return;
    }

    container.className = `grid gap-8 ${cols === 2 ? "grid-cols-2" : "grid-cols-3"}`;
    const wrappers: HTMLElement[] = [];
    for (let i = 0; i < cols; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col gap-8";
      container.appendChild(wrapper);
      wrappers.push(wrapper);
    }
    cards.forEach((card, i) => wrappers[i % cols].appendChild(card));
  }

  const mqDesktop = window.matchMedia("(min-width: 1024px)");
  const mqTablet = window.matchMedia("(min-width: 640px)");
  mqDesktop.addEventListener("change", layoutColumns);
  mqTablet.addEventListener("change", layoutColumns);

  document.addEventListener("astro:page-load", setupCoverPreload);
  document.addEventListener("astro:page-load", layoutColumns);
</script>
```

Specifically added:

1. A `getColumnCount()` helper that reads the two matchMedia queries and returns 1, 2, or 3.
2. A `layoutColumns()` function that queries `[data-subpage-container]`, collects and sorts cards by `data-chron-index`, clears the container, applies the correct class, and rebuilds either as a flat flex column or as a grid of N wrapper divs with round-robin distribution.
3. Two module-level `matchMedia` `change` listeners that call `layoutColumns` when the user resizes across a breakpoint.
4. An additional `astro:page-load` registration for `layoutColumns`, alongside the existing `setupCoverPreload` registration.

The original `setupCoverPreload` function is unchanged.

- [ ] **Step 2: Run type check and build**

Run:

```bash
npm run build
```

Expected: 0 errors, 0 warnings. Build succeeds.

- [ ] **Step 3: Run all tile-ordering tests**

Run:

```bash
npx playwright test tests/e2e/tile-ordering.spec.ts
```

Expected: all 5 tests PASS.
- Desktop test: container has `grid-cols-3`, three wrappers each starting with `data-chron-index` 0/1/2.
- Tablet test: container has `grid-cols-2`, two wrappers each starting with 0/1.
- Mobile test: container has `flex-col`, direct children are articles 0..N-1 in order.
- Resize desktop → mobile: class changes from `grid-cols-3` to `flex-col`.
- Resize mobile → desktop: class changes from `flex-col` to `grid-cols-3`.

- [ ] **Step 4: Run the existing pages.spec.ts to confirm no regressions**

Run:

```bash
npx playwright test tests/e2e/pages.spec.ts
```

Expected: all existing tests PASS.

- [ ] **Step 5: Run the full E2E suite**

Run:

```bash
npm run test:e2e
```

Expected: all tests PASS across `errors.spec.ts`, `homepage.spec.ts`, `locale.spec.ts`, `navigation.spec.ts`, `pages.spec.ts`, `seo.spec.ts`, `subpages.spec.ts`, and the new `tile-ordering.spec.ts`.

- [ ] **Step 6: Commit the client script**

```bash
git add "src/pages/[...locale]/[...page].astro"
git commit -m "feat: redistribute listing tiles round-robin for row-first order"
```

---

## Verification summary

After all three tasks:

- `npm run build` — 0 errors, 0 warnings
- `npm run test:e2e` — all tests pass
- Manual check (optional but recommended): `npm run dev`, open `http://localhost:4321/projects` in Chrome, resize the window across 640px and 1024px, verify the top row always contains the newest items. Use DevTools to confirm the `data-subpage-container` div has `grid grid-cols-3 gap-8` at desktop, `grid grid-cols-2 gap-8` at tablet, and `flex flex-col gap-8` at mobile, with `data-chron-index` values matching the round-robin pattern.

## Acceptance criteria (from spec)

- [x] Covered by Task 1 tests: newest items occupy the top row at desktop (`data-chron-index="0"`, `"1"`, `"2"` are first in each wrapper).
- [x] Covered by Task 1 tests: newest items occupy the top row at tablet (`data-chron-index="0"` and `"1"`).
- [x] Covered by Task 1 tests: mobile renders in strict chronological order in a single column.
- [x] Covered by Task 1 resize tests: breakpoint crossings re-lay without reload.
- [x] Covered by manual check + existing `pages.spec.ts` regression: Astro view transitions still work (`astro:page-load` handler re-runs).
- [x] Unchanged: hovering a card still preloads its cover (setupCoverPreload is untouched).
- [x] Covered by Task 2/3 step "Run type check and build": `npm run build` succeeds.
