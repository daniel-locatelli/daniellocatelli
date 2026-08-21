# Keyboard focus indicator for listing-grid cards

**Date:** 2026-08-21
**Status:** approved design, pending implementation

## Problem

On the projects, research and teaching listing pages, tabbing through the grid
gives no visible feedback. Each card is an `<article>` with `overflow-hidden
rounded-2xl` that wraps a full-size `<a>` (`src/pages/[...locale]/[...page].astro`,
card block around lines 146-203). The link receives focus, but the browser's
focus outline is drawn outside the link's border box, and because the link fills
the article that outline lies entirely outside the article and is clipped by its
`overflow-hidden`. On desktop (`lg+`) the card title is only shown in a
hover-only overlay, so a keyboard user sees neither a ring nor the card's name.

The homepage and other pages already show usable focus indicators; this change
is scoped to the listing-grid cards.

## Goal

When a card's link has keyboard focus, the card shows a clear ring and behaves
exactly as if hovered (image zoom, desktop title overlay, mobile gradient and
title colour), so keyboard users get the same information as mouse users.

## Design

### Scope

One template: `src/pages/[...locale]/[...page].astro`, the `<article>`/`<a>`
card block. It serves projects, research and teaching in all three locales.

### Markup changes

On the `<article>` (currently `group relative flex flex-col overflow-hidden
rounded-2xl bg-zinc-900 transition-all hover:shadow-2xl`):

- Replace `transition-all` with `transition-shadow` (shadow is the only property
  it ever transitions; keeps the ring from fading in slowly via unrelated
  transitions).
- Add `has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-green-400
  has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-black`.
  The ring is a box-shadow on the article itself, so the article's own
  `overflow-hidden` cannot clip it, it follows `rounded-2xl`, and the black
  offset gives a clean 2 px gap between the zinc-900 card and the green ring on
  the black page. `has-[a:focus-visible]` (not `focus-within`) means mouse
  clicks never trigger it. Tailwind v4 composes `ring-*` and `hover:shadow-2xl`
  through its `--tw-*-shadow` variables, so hover and focus can coexist.

Hover/focus parity, using `group-has-[a:focus-visible]:` twins (same predicate as
the ring; unlike `group-focus-within:` it does not stick after a ctrl/middle
click that leaves the link focused in the current tab):

| Element | Existing | Add |
| --- | --- | --- |
| cover `<img>` / `<Image>` (both branches) | `group-hover:scale-110` | `group-has-[a:focus-visible]:scale-110` |
| desktop overlay `div` (`hidden lg:flex`) | `group-hover:opacity-100` | `group-has-[a:focus-visible]:opacity-100` |
| mobile gradient `div` (`lg:hidden`) | `group-hover:opacity-40` | `group-has-[a:focus-visible]:opacity-40` |
| mobile title `<h2>` | `group-hover:text-primary-400` | replace with `group-hover:text-green-400 group-has-[a:focus-visible]:text-green-400` |

The `primary` colour palette does not exist in this project (no `primary` in
`tailwind.config.ts`, no `@theme` in `global.css`), so the existing
`group-hover:text-primary-400` is dead; `green-400` is the site accent used by
the header buttons and subpage navigation.

On the inner `<a>`: add `focus-visible:outline-none`, safe because the article
now carries the indicator; this removes any partially visible sliver of the UA
outline.

### Out of scope (deliberate)

- No global `:focus-visible` baseline in `global.css`; it would not fix this
  case and the rest of the site is acceptable today.
- No `motion-reduce:` guard on the image zoom; the repo has no such guards
  elsewhere, and the zoom already applies to hover.
- Focus twins for the subpage prev/next navigation (`hover:border-green-500`)
  and `LinkPreview` cards: their outlines are already visible; a consistent
  follow-up, noted in the backlog.
- Keyboard tab order on `sm+` follows DOM order, and `layoutColumns()` in the
  same file moves cards into column wrappers (`wrappers[i % cols]`), so Tab runs
  down column 1, then column 2, instead of row-major. Pre-existing, made more
  noticeable by a visible ring. Logged in `docs/BACKLOG.md`; the fix (CSS
  `order`/`grid-column` instead of DOM moves) is a separate change.

### Testing

New Playwright spec `tests/e2e/focus.spec.ts`, chromium project, dev server
via the existing `webServer` config:

1. **Desktop (default Desktop Chrome viewport):** open `/projects`; press Tab in a
   bounded loop (max 30) until `document.activeElement` is an `<a>` inside
   `main article`. Then assert:
   - the focused link's closest `article` has a computed `box-shadow` that is
     not `none` (ring present);
   - the desktop overlay div inside that article has `toHaveCSS("opacity", "1")`
     (polls through the 300 ms transition). `toBeVisible()` is not used because
     Playwright treats `opacity: 0` elements as visible.
2. **Mobile (`viewport: { width: 390, height: 844 }`):** same Tab loop; assert
   the article's `box-shadow` is not `none` and the mobile `<h2>`'s computed
   `color` differs from the value recorded before focusing (Tailwind v4 emits
   oklch colours, so the test compares before/after rather than hard-coding a
   colour string).
3. **Mouse does not trigger the ring:** hover the first card with the mouse
   (no click) and assert the article's `box-shadow` equals what hover alone
   produces (contains no green ring colour), guarding the `has-[a:focus-visible]`
   choice.

Manual check: `pnpm dev`, tab through `/projects`, `/research`, `/teaching` at
desktop and mobile widths, confirm ring plus hover state, and that mouse click
and hover look unchanged.

### Documentation

- `docs/BACKLOG.md`: add the column tab-order item and the prev/next +
  LinkPreview focus-twin follow-up.
- `portfolio-website.md` self-description: not updated (accessibility fix, not
  a stack or feature change).
- No `/sync-knowledge` needed (no content changes).
