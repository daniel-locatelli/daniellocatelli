# Mobile slide layout — letterbox lock at portrait viewports

## Problem

On portrait phones, slides currently render with the image set as `object-cover` over a `h-svh w-full` container. Landscape images (the dominant aspect in `digital-futures-2026`) get cover-cropped to phone-portrait aspect (~9:19), losing roughly two-thirds of the horizontal image content. The slide composition designed for landscape (title at top-left, max 60% width, copyright at bottom-left) is also distorted because positions are anchored to a portrait viewport rather than the original landscape canvas.

The user's goal is **visual consistency with the desktop deck**, not a mobile-optimized reflow. A viewer who wants more screen real-estate is expected to rotate the phone to landscape.

## Decision

Lock slides to **16:9 aspect ratio with letterbox bars** when the viewport aspect ratio is **portrait or square** (`max-aspect-ratio: 1/1`). Desktop laptops, ultrawide monitors, and rotated-landscape phones are unaffected.

### Threshold: `max-aspect-ratio: 1/1`

| Viewport | Aspect ratio | Behavior |
| --- | --- | --- |
| Phone portrait (e.g. 390×844) | ~0.46 | Locked 16:9 box, large letterbox bars top/bottom |
| Tablet portrait (e.g. iPad 820×1180) | ~0.69 | Locked 16:9 box, moderate letterbox bars top/bottom |
| Phone landscape | ~1.78–2.0 | Unchanged (slide fills viewport) |
| MacBook 16:10 | ~1.6 | Unchanged |
| Laptop 16:9 | ~1.78 | Unchanged |
| Ultrawide 21:9 | ~2.33 | Unchanged (slide fills viewport at 21:9) |

The 1:1 threshold cleanly separates "portrait-shaped viewports where landscape images would be heavily cropped" from "anything wider where the existing layout works." Stricter thresholds (4:3, 16:10) were rejected because they would unnecessarily letterbox laptops the user is happy with.

### Locked aspect: 16:9

The slides were designed for landscape laptops and the chrome (title positioning, copyright corner) assumes a wide canvas. 16:9 is the de-facto standard and matches what most laptop screens render today, so locked-mode rendering looks identical to a small desktop window. 16:10 was considered (slightly more vertical content on portrait phones) but rejected for less consistency with what the deck looks like to most viewers.

### Letterbox color: `zinc-950`

Matches the existing `bg-zinc-950` deck background. Bars are visually invisible against the deck chrome — they read as continuation of the page background rather than a "border."

### HUD placement: viewport-anchored

Exit, ?, fullscreen, presenter button, slide indicator, timer, next-hint, preload pill all stay anchored to viewport corners. On a portrait phone they appear in the letterbox region (above and below the locked slide). This matches the convention of presentation tools (Reveal.js, Keynote, PowerPoint) where chrome lives outside the slide canvas, not inside it. It also keeps controls accessible without the user having to tap into the slide content area.

### Touch and click navigation: unchanged

Swipe and tap-to-navigate continue to work over the entire viewport (including the letterbox bars), because the input handlers attach to `document` / `#deck` which spans the full viewport.

## Implementation

A single media query in the existing `<style is:global>` block of `src/layouts/Slides.astro`:

```css
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

The browser auto-picks the constraining dimension: on a portrait phone, `max-width: 100vw` constrains, so the slide is `100vw × (100vw × 9/16)` with vertical letterbox bars. On a square viewport (1:1), `max-height: 100svh` and `max-width: 100vw` both clamp, and the result is a 16:9 box centered.

### Overview-mode override

`body.deck-overview .slide` (the grid view triggered by `O`) currently overrides `.slide` with `position: relative; height: 180px`. By selector specificity (0,2,1 vs the media query's 0,1,0), the overview rule wins for `height`, but the new `aspect-ratio: 16/9`, `max-width`, and `max-height` declarations would still apply because the overview rule doesn't set them. The result on portrait phones could be unexpected thumbnail sizing.

Fix: extend the existing `body.deck-overview .slide` rule with explicit overrides for the locked-mode declarations:

```css
body.deck-overview .slide {
  /* existing rules: display: flex; position: relative; height: 180px; etc. */
  aspect-ratio: auto;
  max-width: none;
  max-height: none;
  width: auto;
  margin: 0;
}
```

This keeps overview-mode behavior identical to today regardless of viewport orientation.

### No JS changes required

All slide components (`<Slide>`, `<TitleSlide>`, `<TextSlide>`, `<SlideImage>`, `<SlideVideo>`, `<SlideColumns>`, JSX overlay slides) render correctly inside the locked 16:9 box because their internals use `absolute inset-0` / `flex` positioning relative to the slide bounds. The slide bounds change shape on portrait, and everything inside reflows naturally.

Tailwind responsive prefixes (`sm:text-2xl`, etc.) continue to govern text sizing based on viewport width. Inside a 100vw-wide locked slide on a phone, `sm:` (640px breakpoint) won't activate, so text uses the smaller default sizes — a graceful degradation that's already designed for narrow viewports.

## Out of scope

- Pixel-perfect canvas + transform-scale (Reveal.js style). Considered as A2 alternative but rejected for blast radius.
- Mobile-optimized reflow (image stacked above text, etc.). Rejected by user — visual consistency with desktop is the priority.
- Custom mobile chrome. HUD stays as-is.

## Risk surface

Small. The change is one CSS media query and one overview-mode override. No JS, no component edits, no content edits. Worst case: the media query is wrong and renders something ugly on one device class — fixable in seconds.

The primary thing to verify in-browser:

1. Portrait phone (Chrome devtools mobile emulation, e.g., iPhone 14): slide is a 16:9 box, letterbox bars are visible, image is uncropped, title overlay is readable.
2. Tablet portrait (iPad emulation): same shape, smaller bars.
3. Phone in landscape: no lock, fills viewport.
4. Laptop 16:10 (MacBook): no lock, fills viewport.
5. Overview mode on portrait phone: thumbnails still grid-tile correctly.
6. Presenter mode on portrait phone: timer + next-hint visible in top letterbox bar; speaker notes overlay still pins to bottom of viewport (its existing positioning is viewport-relative, not slide-relative, which is correct).
