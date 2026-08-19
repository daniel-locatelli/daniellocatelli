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

## Skills map: custom tooltips per tool

**Problem.** The homepage skills map (`src/components/SkillsMap.astro`) shows only logos and names. A visitor cannot tell where or how each tool is actually used (which projects, research, or jobs).

**Sketch.** On hover/focus (and tap on touch devices) show a custom shadcn-style tooltip, not the native `title` one: dark popover with arrow, short fade/zoom, positioned via a small floating-position helper or CSS anchor positioning. One short sentence per tool, localized in en/pt/de (draft from CV/projects content, then review). Keep the existing external link on the icon.

**Trigger.** When there is time to write ~25 sentences x 3 locales; the mechanism itself is a small component.
