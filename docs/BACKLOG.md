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

## SlideMarkdown font sizes need tuning

**Problem.** After the unified-slide-type migration (2026-05-14), some slides render with text that feels too large or too small versus the previous TextSlide/TitleSlide rendering. The `clamp()` scale picked for `SlideMarkdown` in `src/components/slides/SlideMarkdown.astro` was an approximation of the old TextSlide's `text-{4xl,5xl,6xl,7xl}` Tailwind tiers, not an exact match.

**Sketch.** Walk through the migrated decks visually, note which heading levels feel off in which contexts, and adjust the `clamp(min, vw, max)` values per element. Likely candidates: h1 (currently `clamp(2.5rem, 7vw, 6rem)`), p (currently `clamp(1rem, 1.8vw, 1.5rem)`).

**Trigger.** Before the next public-facing deck delivery, or sooner if a specific slide reads badly in a presentation rehearsal.
