# Card Focus Ring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make keyboard focus visible on the project/research/teaching listing-grid cards and mirror the hover state while a card's link is focused.

**Architecture:** Pure Tailwind class changes in one Astro template. The card `<article>` gets a green ring via `has-[a:focus-visible]:` (unclipped by its own `overflow-hidden`), every `group-hover:` effect gets a `group-has-[a:focus-visible]:` twin, and the inner `<a>` drops its (clipped) UA outline. A Playwright e2e spec drives the keyboard and asserts computed styles.

**Tech Stack:** Astro 7, Tailwind CSS 4.2 (supports `has-[...]:`, `group-has-[...]:`, `ring-offset-*`), Playwright (`pnpm test:e2e`, chromium project, dev server on `http://localhost:4321` started by the Playwright `webServer` config).

**Spec:** `docs/superpowers/specs/2026-08-21-card-focus-ring-design.md`

## Global Constraints

- Only `src/pages/[...locale]/[...page].astro` changes in the card markup; no global CSS, no `motion-reduce:` guards, no changes to other card-like components.
- Use `green-400` for the accent (the `primary` palette does not exist in this project).
- Use `has-[a:focus-visible]:` / `group-has-[a:focus-visible]:`, not `focus-within`, so mouse focus never triggers the ring or hover twins.
- Tests must not rely on a fixed number of Tab presses and must not use `toBeVisible()` for opacity checks (Playwright treats `opacity: 0` as visible).
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Work happens in the worktree at `.claude/worktrees/card-focus-ring` on branch `worktree-card-focus-ring`. Run all commands from there.

---

### Task 1: Failing e2e spec for keyboard focus on listing cards

**Files:**
- Create: `tests/e2e/focus.spec.ts`

**Interfaces:**
- Consumes: the listing page `/projects`, whose cards are `main article > a` inside `[data-subpage-container]` (rendered by `src/pages/[...locale]/[...page].astro`).
- Produces: three tests that Task 2 makes pass. Nothing else depends on this file.

- [ ] **Step 1: Write the failing tests**

Create `tests/e2e/focus.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

/**
 * Keyboard focus on listing-grid cards (projects / research / teaching).
 * The card <article> wraps a full-size <a> with overflow-hidden, which clips
 * the UA focus outline, so the article must draw its own ring and mirror the
 * hover state while the link has keyboard focus.
 */

const CARD_LINK = "[data-subpage-container] article a";

/** Press Tab until a listing card link is focused. Bounded so a regression
 *  fails fast instead of hanging. */
async function tabToFirstCard(page: Page): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const onCard = await page.evaluate((sel) => {
      const el = document.activeElement;
      return el instanceof HTMLAnchorElement && el.matches(sel);
    }, CARD_LINK);
    if (onCard) return;
  }
  throw new Error("Tab never reached a listing card link");
}

test.describe("Keyboard focus on listing cards", () => {
  test("desktop: focused card shows a ring and reveals the title overlay", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");
    await expect(page.locator("[data-subpage-container]")).toBeVisible();

    await tabToFirstCard(page);

    const focusedLink = page.locator(`${CARD_LINK}:focus`);
    await expect(focusedLink).toHaveCount(1);
    const article = focusedLink.locator("xpath=ancestor::article[1]");

    // Ring is a box-shadow on the article itself (not clipped by overflow-hidden).
    await expect(article).not.toHaveCSS("box-shadow", "none");

    // Desktop hover overlay (hidden lg:flex, opacity-0 at rest) becomes opaque.
    const overlay = article.locator("div.lg\\:flex");
    await expect(overlay).toHaveCSS("opacity", "1");
  });

  test("mobile: focused card shows a ring and highlights the title", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects");
    await expect(page.locator("[data-subpage-container]")).toBeVisible();

    // On mobile the visible title is the one inside the lg:hidden text block;
    // the overlay h2 is display:none so its computed colour is irrelevant.
    const restingColor = await page
      .locator("[data-subpage-container] article div.lg\\:hidden h2")
      .first()
      .evaluate((el) => getComputedStyle(el).color);

    await tabToFirstCard(page);

    const focusedLink = page.locator(`${CARD_LINK}:focus`);
    await expect(focusedLink).toHaveCount(1);
    const article = focusedLink.locator("xpath=ancestor::article[1]");
    await expect(article).not.toHaveCSS("box-shadow", "none");

    const title = article.locator("div.lg\\:hidden h2");
    await expect
      .poll(async () => title.evaluate((el) => getComputedStyle(el).color))
      .not.toBe(restingColor);
  });

  test("mouse hover alone does not draw the focus ring", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");
    const article = page.locator("[data-subpage-container] article").first();
    await expect(article).toBeVisible();

    await article.hover();
    // hover:shadow-2xl is present but no ring colour: Tailwind's ring uses
    // the --tw-ring-color, which stays transparent/unset without focus.
    const ringColor = await article.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--tw-ring-color").trim(),
    );
    expect(ringColor).toBe("");
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run (from the worktree root):

```bash
pnpm test:e2e tests/e2e/focus.spec.ts
```

Expected: the first two tests FAIL (`box-shadow` is `none` on the article and/or the overlay opacity is `0` and the mobile colour never changes); the third test PASSES (no ring exists yet). If the dev server is not already running, Playwright starts it via the `webServer` config; the first run can take up to 60 s.

- [ ] **Step 3: Commit the failing spec**

```bash
git add tests/e2e/focus.spec.ts
git commit -m "test(e2e): keyboard focus ring and hover parity on listing cards

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Ring and hover-parity classes on the card markup

**Files:**
- Modify: `src/pages/[...locale]/[...page].astro:148-192` (the `<article>` / `<a>` card block)
- Test: `tests/e2e/focus.spec.ts` (from Task 1)

**Interfaces:**
- Consumes: nothing new.
- Produces: the card DOM that `tests/e2e/focus.spec.ts` asserts on (`article` box-shadow ring, overlay `div.lg:flex` opacity 1, mobile `div.lg:hidden h2` colour change).

- [ ] **Step 1: Update the `<article>` class (line 148)**

Before:

```astro
class="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 transition-all hover:shadow-2xl"
```

After:

```astro
class="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 transition-shadow hover:shadow-2xl has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-green-400 has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-black"
```

- [ ] **Step 2: Update the inner `<a>` class (line 152)**

Before:

```astro
class="flex h-full flex-col"
```

After:

```astro
class="flex h-full flex-col focus-visible:outline-none"
```

- [ ] **Step 3: Add focus twins to both cover image branches (lines 159 and 169)**

Both `<img ...>` (svg branch) and `<Image ...>` share the same class. Before:

```astro
class="object-cover transition-transform duration-500 group-hover:scale-110"
```

After (apply to both occurrences):

```astro
class="object-cover transition-transform duration-500 group-hover:scale-110 group-has-[a:focus-visible]:scale-110"
```

- [ ] **Step 4: Mobile gradient (line 178)**

Before:

```astro
<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40 lg:hidden" />
```

After:

```astro
<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40 group-has-[a:focus-visible]:opacity-40 lg:hidden" />
```

- [ ] **Step 5: Desktop overlay (line 180)**

Before:

```astro
<div class="absolute inset-0 hidden items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:flex">
```

After:

```astro
<div class="absolute inset-0 hidden items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100 lg:flex">
```

- [ ] **Step 6: Mobile title colour (line 191), replacing the dead `primary-400`**

Before:

```astro
class="group-hover:text-primary-400 text-xl font-bold text-white transition-colors"
```

After:

```astro
class="text-xl font-bold text-white transition-colors group-hover:text-green-400 group-has-[a:focus-visible]:text-green-400"
```

- [ ] **Step 7: Run the focus spec to verify it passes**

```bash
pnpm test:e2e tests/e2e/focus.spec.ts
```

Expected: 3 passed.

If the desktop overlay assertion fails because `div.lg\:flex` matches more than one element, tighten the locator in the test to `article.locator("div.lg\\:flex").first()`; there is exactly one per card.

- [ ] **Step 8: Run the related listing specs to guard against regressions**

```bash
pnpm test:e2e tests/e2e/tile-ordering.spec.ts tests/e2e/pages.spec.ts
```

Expected: all passed (these cover the same template).

- [ ] **Step 9: Format and type-check**

```bash
pnpm exec prettier --check "src/pages/[[]...locale[]]/[[]...page[]].astro" tests/e2e/focus.spec.ts
```

If Prettier reports differences, run the same command with `--write` and re-run Step 7. Then:

```bash
pnpm exec astro check
```

Expected: 0 errors (warnings that pre-exist are acceptable).

- [ ] **Step 10: Manual check**

With the dev server running (`pnpm dev`; Astro 7 runs it detached, `astro dev status` shows it), open `http://localhost:4321/projects` in a browser, press Tab until a card is focused and confirm: green ring with a black gap around the rounded card; image zooms; on desktop the dark overlay with the title appears; at a narrow width the title turns green. Repeat once on `/research` and `/teaching`. Click a card with the mouse and confirm no ring appears before navigation.

- [ ] **Step 11: Commit**

```bash
git add "src/pages/[...locale]/[...page].astro" tests/e2e/focus.spec.ts
git commit -m "fix(a11y): visible keyboard focus ring and hover parity on listing cards

The card <a> outline was clipped by the wrapping article's overflow-hidden,
so tabbing through projects/research/teaching gave no feedback. Draw a ring
on the article via has-[a:focus-visible] and mirror every group-hover effect
with a group-has-[a:focus-visible] twin. Also replaces the non-existent
text-primary-400 with text-green-400.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Backlog entries for follow-ups surfaced by the review

**Files:**
- Modify: `docs/BACKLOG.md` (append at end)

**Interfaces:** none.

- [ ] **Step 1: Append three entries**

A third entry about Playwright reusing whatever dev server owns port 4321 was added during execution.

Append to the end of `docs/BACKLOG.md` (keep the existing `## Title` / **Problem.** / **Sketch.** / **Trigger.** format):

```markdown
## Listing-grid keyboard tab order runs column-wise

**Problem.** `layoutColumns()` in `src/pages/[...locale]/[...page].astro` distributes cards into column wrapper `<div>`s with `wrappers[i % cols].appendChild(card)`. DOM order (and therefore Tab order) becomes 0,3,6,... then 1,4,7,... while the visual order is row-major. Since the cards now show a focus ring, the jump down column 1 before column 2 is noticeable for keyboard users.

**Sketch.** Keep cards in a single flat container in chronological DOM order and achieve the column placement with CSS (`grid-auto-flow: row` with one card per cell, or `order` / `grid-column` per card) instead of moving DOM nodes; update `tests/e2e/tile-ordering.spec.ts` to assert visual positions rather than wrapper membership.

**Trigger.** Next accessibility pass, or if a keyboard user reports the ordering.

## Focus twins for bordered link cards

**Problem.** The subpage prev/next navigation (`src/pages/[...locale]/[...subpage].astro`, the two `<a class="group ... hover:border-green-500">` links) and `src/components/LinkPreview.astro` (`hover:border-green-600 hover:bg-zinc-900`) change on hover only. Their UA focus outline is visible (the `<a>` itself is the overflow-hidden element), so focus is not invisible, but it does not match the hover look.

**Sketch.** Add `focus-visible:border-green-500` / `focus-visible:border-green-600 focus-visible:bg-zinc-900` twins and, if desired, `focus-visible:outline-none` once the border change is the indicator. Consider a global `:focus-visible` baseline (2 px green outline, 2 px offset) in `src/styles/global.css` for header nav links at the same time.

**Trigger.** Next accessibility pass.
```

- [ ] **Step 2: Commit**

```bash
git add docs/BACKLOG.md
git commit -m "docs(backlog): tab-order and focus-twin follow-ups from card focus review

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Full verification

**Files:** none modified.

- [ ] **Step 1: Run the whole e2e suite**

```bash
pnpm test:e2e
```

Expected: all tests pass. If an unrelated spec fails, re-run it alone once; if it still fails, check whether it also fails on `main` before treating it as caused by this change.

- [ ] **Step 2: Production build**

```bash
pnpm build
```

Expected: `astro check` reports 0 errors and the build completes.

- [ ] **Step 3: Confirm the branch is clean**

```bash
git status --short
git log --oneline main..HEAD
```

Expected: no uncommitted changes; four commits (spec, test, fix, backlog) on top of `main`.
