# Shared tooltips (Map of Knowledge, footer, footnotes)

Date: 2026-08-21

## Goal

Give visitors a hover/focus tooltip on every Map of Knowledge icon that says where or how Daniel uses that tool, using a custom shadcn-style tooltip rather than the native `title` one. Reuse the same tooltip for the footer social icons (which used native `title`) and for the existing markdown footnote tooltips, so the site has one tooltip look and one implementation.

## Design

**Primitive.** A trigger carries `data-tooltip="<id>"`; the panel is `<span id class="tooltip" popover="manual">…<span class="tooltip-arrow"/></span>` (rendered by `src/components/Tooltip.astro`, or by the footnote rehype plugin). `src/lib/tooltips-client.ts`, wired in `Base.astro`, binds pointer/focus events, shows the panel through the Popover API (top layer, no clipping), positions it centred above the trigger, flips below when there is no room, clamps to the viewport, and aligns the arrow with the trigger centre. Touch pointers do not open it; Escape, scroll and resize close it. Chrome (dark zinc panel, border, arrow, 150 ms fade/zoom via `@starting-style`) lives in `global.css` under `.tooltip`; `.tooltip--footnote` widens and left-aligns it for prose.

**Map of Knowledge.** `SkillsMap.astro` is refactored onto `SkillsMapItem.astro` (logo, label, link, tooltip). Tooltip sentences are typed i18n data: `home.expertise.tools: Record<SkillsMapTool, string>` in `src/i18n/home/{en,pt,de}.ts`. Triggers use `aria-describedby` so the text is announced.

**Footer.** Social links drop `title` and get a `Tooltip` with `describes={false}` (content repeats the `aria-label`).

**Footnotes.** `rehype-footnote-tooltips.ts` emits the shared markup (`tooltip tooltip--footnote`, `data-tooltip` on the ref, arrow child). The subpage-only positioning script is removed.

**Content.** `portfolio-website.md` (en/pt/de) describes the tooltip system; the backlog entry "Skills map: custom tooltips per tool" is removed.

## Out of scope

Touch-tap tooltips on the icons (the icon is a link; a tap navigates), per-tool links to projects inside the tooltip.
