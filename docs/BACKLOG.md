# Backlog

Non-critical ideas and improvements for the daniellocatelli portfolio repo. Use this as a place to capture quality-of-life work that isn't urgent enough to drop other work for, but is worth doing before the next major content push.

## How to use

- Add new items as `## Title` sections.
- Each item should describe the problem in 1-2 sentences and sketch a proposed fix.
- Note the trigger that makes the work worth doing (e.g. "when subject X appears in 3+ content collections").
- Remove items once they ship.

---

## Canonical folders for cross-referenced source material

**Problem.** When the same source image is reused across content, each consumer stores its own copy under `src/assets/content/<collection>/<slug>/`. For example, Ernst Haeckel's *Spumellaria* plate lives both inside the `image83` collage in `teaching/computational-architecture-in-germany-uft/deck/` and as the standalone `ernst-haeckel_spumellaria.png` in `research/architecture-biomimicry-algorithm/`. As the portfolio grows, the same image will keep showing up in more folders, sometimes under different names, occasionally with drifted credits.

**Sketch.** Introduce a folder organized by source identity (e.g. `src/assets/sources/ernst-haeckel/`, `frei-otto/`, `buckminster-fuller/`, `nasa-iss/`) and have content files import from there. Each canonical folder can carry a single attribution record (sidecar JSON, or a small central `attributions.ts` registry keyed by file) so credit, license, and source URL stay consistent across every consumer.

**Trigger.** When the same subject appears in 3+ content files, or when a filename rename (e.g. `buckminster-fuller_radiolarians.png`, which is actually a Haeckel illustration from the H.M.S. Challenger report) reveals attribution drift.

**Open questions.** Does Astro's image optimization play well with widely-shared imports? Do we want one sidecar JSON per file, or one registry per source identity? Migration path for existing duplicated assets?

## Deprecated markdown plugin config after Astro 7 upgrade

**Problem.** Astro 7 (upgraded 2026-08-12; this also fixed the previously broken dev server) logs on dev startup: "`markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` are deprecated. Pass them to `unified({...})` from `@astrojs/markdown-remark` directly instead." The site still builds and runs; the config in `astro.config.mts` keeps working for now.

**Sketch.** Migrate the markdown plugin configuration to the new `@astrojs/markdown-remark` `unified({...})` form per the Astro 7 migration guide. Note: `pnpm dev` in Astro 7 runs as a detached daemon (`astro dev stop` / `status` / `logs`), and `@iconify/utils` had to become a direct devDependency so vite can pre-bundle it for workerd (pnpm strict node_modules); keep it when touching deps.

**Trigger.** When Astro 8 approaches or the deprecation becomes a hard error; fold into the next dependency-update pass.

## Astro Island `<style>` injection inside body flow

**Problem.** Astro's `client:*` directive injects `<style>astro-island,astro-slot,astro-static-slot{display:contents}</style>` at the location of the first hydrated island. On the home page this lands inside the `<div class="w-full max-w-xl py-4">` wrapping `<HeroChat>`, which PowerMapper flags as "Element style not allowed as child element in this context." Per current HTML5 spec, `<style>` is metadata content and is only valid inside `<head>` (`scoped` was removed). Browsers tolerate it; strict validators do not.

**Sketch.** The rule is hardcoded in Astro 6's island runtime (`astro/runtime/server/render/component`). Options: (a) accept as Astro framework behavior, (b) move the same `display: contents` rule into `src/styles/global.css` and patch the Astro renderer to skip the inline injection when the global rule is detected, (c) wait for an upstream Astro fix.

**Trigger.** When a validator/accessibility audit is part of release criteria, or when Astro provides a config flag to disable the inline injection.

## PowerMapper view-transition CSS false positives

**Problem.** Astro injects per-page `<style>` blocks for view transitions when `transition:animate={fade({ duration: "0.15s" })}` is set on `<html>` in `src/layouts/Base.astro`. The generated CSS uses `::view-transition-old(...)` / `::view-transition-new(...)` pseudo-elements and `cubic-bezier(0.76, 0, 0.24, 1)`. The CSS is valid per spec, but PowerMapper's parser doesn't recognize the pseudo-elements and falls back to misinterpreting the rule body, flagging numeric values like `0.15s`, `0.76`, `0.24`, `1` as invalid identifiers.

**Sketch.** Two routes: (a) keep current behavior and accept this as a PowerMapper false positive (most likely correct read; CSS is valid per the View Transitions spec). (b) Remove the `transition:animate={...}` attribute on `<html>` and accept the default ClientRouter fade, simplifying the generated CSS at the cost of a longer transition duration.

**Trigger.** If the false positives clutter audits enough to obscure real issues, drop the explicit duration and revisit if the slower default fade hurts perceived UX.


## Listing-grid keyboard tab order runs column-wise

**Problem.** `layoutColumns()` in `src/pages/[...locale]/[...page].astro` distributes cards into column wrapper `<div>`s with `wrappers[i % cols].appendChild(card)`. DOM order (and therefore Tab order) becomes 0,3,6,... then 1,4,7,... while the visual order is row-major. Since the cards now show a focus ring, the jump down column 1 before column 2 is noticeable for keyboard users.

**Sketch.** Keep cards in a single flat container in chronological DOM order and achieve the column placement with CSS (`grid-auto-flow: row` with one card per cell, or `order` / `grid-column` per card) instead of moving DOM nodes; update `tests/e2e/tile-ordering.spec.ts` to assert visual positions rather than wrapper membership.

**Trigger.** Next accessibility pass, or if a keyboard user reports the ordering.

## Focus twins for bordered link cards

**Problem.** The subpage prev/next navigation (`src/pages/[...locale]/[...subpage].astro`, the two `<a class="group ... hover:border-green-500">` links) and `src/components/LinkPreview.astro` (`hover:border-green-600 hover:bg-zinc-900`) change on hover only. Their UA focus outline is visible (the `<a>` itself is the overflow-hidden element), so focus is not invisible, but it does not match the hover look.

**Sketch.** Add `focus-visible:border-green-500` / `focus-visible:border-green-600 focus-visible:bg-zinc-900` twins and, if desired, `focus-visible:outline-none` once the border change is the indicator. Consider a global `:focus-visible` baseline (2 px green outline, 2 px offset) in `src/styles/global.css` for header nav links at the same time.

**Trigger.** Next accessibility pass.

## Playwright reuses whatever dev server owns port 4321

**Problem.** `playwright.config.ts` hard-codes `baseURL` to `http://localhost:4321` with `reuseExistingServer: true` outside CI. When a dev server from another checkout (the main repo while working in a worktree, or vice versa) already holds that port, the e2e suite silently tests that other checkout's code and reports green or red against the wrong tree. Observed while verifying the card focus ring in a worktree: the suite kept failing against stale markup until the worktree server was started on a spare port with a temporary config.

**Sketch.** Read the port from an env var (`PW_PORT`, default 4321) in `playwright.config.ts` for both `baseURL` and `webServer`, or pick a free port per run, and have `webServer.command` pass `--port` through; optionally assert in a global setup that the served HTML comes from the current checkout (e.g. compare a build-time marker).

**Trigger.** Next time e2e is run from a worktree, or when adding CI matrix jobs that run several checkouts on one machine.
