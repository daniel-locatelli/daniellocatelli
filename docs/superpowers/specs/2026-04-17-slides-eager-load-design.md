# Slides: eager-load images to eliminate first-visit flash

## Problem

Presentation decks (`src/layouts/Slides.astro` + `src/components/slides/*`) render every slide into one document and navigate by toggling `display: none ↔ flex`. Images inside slide components use Astro's `<Image>` helper or plain `<img>`, both of which default to `loading="lazy"`. Browsers treat `display: none` descendants as offscreen, so lazy images inside inactive slides never start fetching. The first time the viewer advances to a slide, its image begins downloading at that moment, producing a visible flash of empty background before the image appears.

## Goal

Each slide shows its final content immediately on first visit, with no blank-frame flash.

## Non-goals

- No change to overview mode, speaker notes, keyboard navigation, HUD, or any existing deck behavior.
- No change to content files under `src/content/presentations/`.
- No new build-time or runtime dependencies.
- No JavaScript preloading logic (deferred — revisit only if deck scale grows).

## Design

Set `loading="eager"` and `decoding="async"` on every image rendered by the slide component library. This opts every slide image out of lazy loading so the browser begins fetching all of them as soon as the deck page's HTML is parsed, and decodes them off the main thread so the decoded bitmap is ready in memory when the slide flips visible.

### Files touched

- `src/components/slides/Slide.astro` — background image, both the string-`src` `<img>` branch and the `ImageMetadata` `<Image>` branch.
- `src/components/slides/SlideImage.astro` — content image, both branches.
- `src/components/slides/TitleSlide.astro` — background image, both branches.

Six attribute additions total. No structural, styling, or script changes.

### Why both attributes

- `loading="eager"` defeats the lazy-loading deferral that `display: none` interacts badly with.
- `decoding="async"` lets the browser decode the image on a background thread. Without it, the decode can happen synchronously when the slide becomes visible and briefly block paint — effectively the same flash via a different mechanism.

## Trade-off

All slide images start loading on page open rather than on demand. Current decks are small enough (well under 50 images) that the upfront cost is negligible on any reasonable connection. If a future deck pushes image counts or payload significantly higher, migrate to an adjacent-preload strategy: keep lazy loading as the default and use a small script in `Slides.astro` to force-load the current slide and its immediate neighbors on every index change.

## Testing

Manual: open a presentation with a cold browser cache, advance through every slide, and confirm no slide shows a blank frame before its image appears. Check both locales that have a presentation and a deck with plain-string image paths (the `<img>` branch) and one with imported assets (the `<Image>` branch) so both code paths are exercised.
