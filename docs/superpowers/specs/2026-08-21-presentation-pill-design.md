# Presentation pill and slide-deck pill

Date: 2026-08-21

## Goal

Give content pages two clearly distinct call-to-action pills below the title: one for a recorded video presentation (opens YouTube in a new tab, play icon) and one for the in-repo slide deck (opens the deck route, slides icon). Today only the deck pill exists and it wrongly uses a play icon; video links hide inside the generic `Link` field.

## Decisions

- No `SlideDeck` frontmatter. The deck stays auto-detected from `teaching/<locale>/<slug>/deck.mdx`.
- New dedicated `Presentation` frontmatter field (plain URL string). It replaces `Link` on entries whose link was the YouTube recording; `Link` returns to meaning "event page / article".
- Two labelled pills side by side (same green style as the current pill); no icon-only buttons.

## Changes

### Schema (`src/content.config.ts`)

Add `Presentation: z.string().url().optional()` to the shared frontmatter schema used by all collections.

### Content migration (en, pt, de in the same commit)

Move the YouTube URL from `Link` to `Presentation` and delete `Link` in:

- `teaching/*/digital-futures-2023.mdx`
- `teaching/*/digital-futures-2026/index.md`
- `teaching/*/nature-and-digital-reproducing-natural-processes-with-computational-design-at-puc.mdx`
- `teaching/*/_graphisoft-x-2023.md`

Body `<YouTube>` embeds stay untouched. No `Updated:` bump (metadata-only change).

Consequence: these pages lose the "Link" row in the metadata table (the video moves to the pill). The DF2026 body sentence "available on YouTube via the link above" stays accurate because the pill sits above the table; no rewording needed.

### UI (`src/pages/[...locale]/[...subpage].astro`)

Replace the single deck pill with a `flex flex-wrap gap-2` row rendered only when `Presentation` or `deckHref` exists. The row carries the current `mx-4 mb-8 sm:mx-0` margins; the pills do not (avoids double margins on mobile).

- Presentation pill: inline SVG play triangle, label `t.watchPresentation`, `href={Presentation}`, `target="_blank" rel="noopener noreferrer"`, and `aria-label={`${t.watchPresentation} (${meta.openNewTab})`}` following the site convention for new-tab links (`Footer.astro`, `SkillsMap.astro`).
- Deck pill: inline SVG "slides" glyph (front rectangle with an offset rectangle behind it), label `t.openSlideDeck`, `href={deckHref}`, same tab.

Both reuse the existing pill classes. Icons are `aria-hidden`; labels carry the meaning.

### i18n (`src/i18n/subpage/{type,en,pt,de}.ts`)

Add `watchPresentation`: "Watch presentation" / "Assistir apresentação" / "Präsentation ansehen".

### Knowledge pipeline (`src/scripts/generate-knowledge.ts`)

- In `processContentCollections` (~line 154), where `Link` is emitted, also emit `Presentation: <url>` when present so the chat keeps the video URL after migration. (Line ~248 is the CV collections, which never carry `Presentation`; leave it.)
- Fix `readContentFiles` (~lines 88-104) to also pick up `<slug>/index.md(x)` subfolder entries; today it is non-recursive, so `digital-futures-2026` is never indexed at all. Keep the existing `_` draft handling for subfolder entries identical to flat files.

### Agent markdown variant (`src/pages/[...path].md.ts`)

Where the structured fallback emits `**Link:**` (~lines 61-64), also emit `**Presentation:** <url>` when present. While there, render the object form of `Link` as `Text (Href)` instead of `[object Object]`.

### CV pages

`extractLink` takes only the link value, so the fallback goes at the three teaching call sites: `src/pages/[...locale]/cv.astro:62`, `full-cv.astro:60`, `phd-cv.astro:56` become `extractLink(t.data.Link) || t.data.Presentation || ""`. CV pages include `_` drafts, so `_graphisoft-x-2023` keeps its YouTube link via this fallback.

## Out of scope

- External (non-repo) slide decks.
- Changes to `portfolio-website.md` or `docs/slides/AUTHORING.md`.
- A chat benchmark question for "where can I watch the talk" (added to `docs/BACKLOG.md` instead).

## Verification

- `pnpm build` passes (astro check + build), plus `pnpm test:unit` and `pnpm test:e2e`.
- `pnpm exec tsx src/scripts/generate-knowledge.ts` (or the `/sync-knowledge` dry step) produces `knowledge/teaching-digital-futures-2026-*.md` containing the `Presentation` URL.
- Agent markdown variant (`/teaching/digital-futures-2026.md`) shows the `Presentation` line.
- Dev server: DF2026 shows both pills; DF2023 shows only the presentation pill; a page with neither shows no row.
- Offer `/sync-knowledge` afterwards (content metadata changed).
