# Mobile Slide Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock slides to 16:9 aspect ratio with letterbox bars when viewport aspect ratio is at most 1:1 (portrait or square), so portrait phones no longer cover-crop landscape images. Desktop laptops, ultrawide monitors, and rotated-landscape phones are unaffected.

**Architecture:** Single CSS media query added to the existing `<style is:global>` block in `src/layouts/Slides.astro`. The existing `body.deck-overview .slide` rule is extended with explicit overrides so overview mode behavior stays identical to today even on portrait phones. No JS, no slide-component edits, no content edits.

**Tech Stack:** CSS (`@media (max-aspect-ratio: ...)`, `aspect-ratio`, `max-width`, `max-height`), Astro layout component.

**Reference:** `docs/superpowers/specs/2026-05-04-mobile-slide-layout-design.md`

---

## File Structure

| File | Change |
| --- | --- |
| `src/layouts/Slides.astro` | Modify: extend `<style is:global>` block — add new `@media (max-aspect-ratio: 1/1)` rule and add five property overrides to the existing `body.deck-overview .slide` rule |

No files created. No tests added (CSS-only change with no testable JS surface; verification is via build for syntax and manual browser emulation for layout — see Task 2).

---

## Task 1: Add the locked-aspect media query and overview-mode override

**Files:**
- Modify: `src/layouts/Slides.astro:200-210` (existing `body.deck-overview .slide` rule, add five property overrides)
- Modify: `src/layouts/Slides.astro:211` (insert new media query block before the `#deck-preload.is-done` rule)

The change has two parts that ship together because they're interdependent: the new media query introduces `aspect-ratio`, `max-width`, `max-height`, `width: auto`, and `margin: auto` on `.slide`, and the overview rule needs explicit overrides so those properties don't leak into overview-mode rendering.

- [ ] **Step 1: Read the current state of the style block to confirm exact insertion points**

Run:

```bash
grep -n 'body.deck-overview .slide' src/layouts/Slides.astro
grep -n '#deck-preload.is-done' src/layouts/Slides.astro
```

Expected: `body.deck-overview .slide {` appears around line 200, `#deck-preload.is-done {` appears around line 211. If line numbers differ, use the actual numbers in the next steps.

- [ ] **Step 2: Extend the existing `body.deck-overview .slide` rule with five property overrides**

Find this rule:

```css
  body.deck-overview .slide {
    display: flex;
    position: relative;
    height: 180px;
    overflow: hidden;
    border-radius: 0.5rem;
    outline: 2px solid transparent;
    transform: none;
    cursor: pointer;
    transition: outline-color 0.15s;
  }
```

Replace with:

```css
  body.deck-overview .slide {
    display: flex;
    position: relative;
    height: 180px;
    overflow: hidden;
    border-radius: 0.5rem;
    outline: 2px solid transparent;
    transform: none;
    cursor: pointer;
    transition: outline-color 0.15s;
    /* Defeat the locked-aspect rules from the portrait media query so
       overview-mode thumbnails stay 320×180 regardless of viewport. */
    aspect-ratio: auto;
    max-width: none;
    max-height: none;
    width: auto;
    margin: 0;
  }
```

- [ ] **Step 3: Insert the locked-aspect media query before the `#deck-preload.is-done` rule**

Find this rule:

```css
  #deck-preload.is-done {
    opacity: 0;
    pointer-events: none;
  }
```

Insert this block immediately before it:

```css
  /* On portrait or square viewports (mostly phones held vertically),
     lock the slide to 16:9 with letterbox bars so landscape images and
     desktop-anchored title positioning render as designed instead of
     being cover-cropped to the phone's aspect ratio. Desktop, laptops,
     and rotated-landscape phones are unaffected. */
  @media (max-aspect-ratio: 1/1) {
    #deck {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide {
      aspect-ratio: 16 / 9;
      max-width: 100vw;
      max-height: 100svh;
      width: auto;
      height: auto;
      margin: auto;
    }
  }

```

- [ ] **Step 4: Run the build to verify CSS parses and the layout still type-checks**

Run:

```bash
npm run build
```

Expected: `astro check` reports `0 errors`, build completes with `Complete!`. If `astro check` flags an error, the syntax of the new CSS or the surrounding JSX is wrong — re-read the diff in context and fix before proceeding.

- [ ] **Step 5: Start dev server and manually verify layout across viewport classes**

Run:

```bash
npm run dev
```

Open Chrome, navigate to `http://localhost:4321/presentations/digital-futures-2026`, open DevTools, switch to device toolbar (Cmd/Ctrl+Shift+M), and verify each of the following:

| Viewport | Expected behavior |
| --- | --- |
| iPhone 14 (390×844, portrait) | Slide is a 16:9 box centered in viewport. Black letterbox bars top and bottom roughly 30% of viewport height each. Image is uncropped. Title overlay readable in top-left of the locked slide. |
| iPhone 14 rotated to landscape (844×390) | Slide fills viewport horizontally. No letterbox bars. (Same behavior as before this change.) |
| iPad portrait (820×1180) | Slide is a 16:9 box. Smaller letterbox bars (~25% of viewport). |
| Desktop default (1280×720 or larger) | Slide fills viewport. No letterbox. (Unchanged from today.) |
| iPhone 14 portrait, press `O` to enter overview | Grid of slide thumbnails, each 320×180, with the active slide outlined in green. Aspect-ratio lock should NOT apply here (the override in Step 2 ensures this). |
| iPhone 14 portrait, click ◫ or press `P` to open presenter window in another tab, also at portrait | Timer and "Next: …" hint visible in the top letterbox bar. Speaker notes pinned to bottom of viewport. Both windows stay synced via BroadcastChannel. |

If any viewport renders unexpectedly, re-read the spec and adjust before committing.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Slides.astro
git commit -m "$(cat <<'EOF'
feat(slides): lock slides to 16:9 letterbox on portrait viewports

When the viewport aspect ratio is at most 1:1 (portrait phones, tablets
in portrait, square viewports), wrap the slide in a 16:9 box centered
in the viewport with letterbox bars. Desktop laptops, ultrawides, and
rotated-landscape phones are unaffected.

The slides were designed for landscape canvases with title at top-left
and copyright at bottom-left; cover-cropping landscape images to a
9:19 phone-portrait viewport was losing two thirds of the image
content. Visual consistency with desktop is now the contract; viewers
who want more screen real-estate rotate the phone.

Overview-mode (O key) keeps its 320×180 thumbnail rendering on
portrait phones via explicit overrides for aspect-ratio, max-width,
max-height, width, and margin.

Spec: docs/superpowers/specs/2026-05-04-mobile-slide-layout-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds, `git status` is clean for the layout file.

---

## Verification gap

This plan does not add automated tests. Reasoning: the change is a single CSS media query and overview-mode override extension. The existing repo has no Playwright tests for slide rendering, and adding e2e infrastructure (fixtures, page-object, assertions on computed CSS values) is significant scope creep relative to the change. Layout regressions would be visible in seconds during the manual viewport sweep in Step 5.

If a future change adds slide-rendering e2e tests, the locked-aspect behavior should be captured then.
