# Unlisted deck: glued-timber-plates-2026-08

**Date:** 2026-08-11. **Deadline:** deployed today; presented 2026-08-12 13:00
at the small-group technical meeting (design/planning with structural
assessment). Antonia Schoch carries the bulk of the meeting; this deck is
Daniel's segment, built to move the discussion from purely structural topics
into the PhD framing.

## Goal

A slide deck reachable at `/teaching/glued-timber-plates-2026-08/deck`,
appearing nowhere on the site and excluded from search indexing. English only.

## Mechanism

- `src/content/teaching/en/glued-timber-plates-2026-08/deck.mdx`, with **no
  `index.md`**. The decks collection picks it up and the deck route builds; the
  teaching collection never sees the folder, so no listing shows it.
- The sitemap already filters `/deck/` URLs (see `astro.config.mts`).
- The knowledge pipeline (`generate-knowledge.ts`) reads only top-level files
  per locale (non-recursive `readdirSync`), so the deck cannot enter the AI
  chat knowledge. No `/sync-knowledge` run needed.
- One shared change: add `<meta name="robots" content="noindex" />` to the
  head of `src/layouts/Slides.astro`. This applies to all decks and matches
  the stated intent in `astro.config.mts` that deck viewers are not meant to
  be indexed or surfaced in search.
- Deviation from the all-locales rule: en only. There is nothing to list or
  translate for an internal meeting deck; pt/de routes simply do not exist.
- Known trade-off, accepted by Daniel: unlisted and non-indexed is not
  private. Anyone with the URL can read the deck.
- The exit button (`exitHref`) points to `/teaching/glued-timber-plates-2026-08`,
  which 404s because there is no parent entry. Accepted: the button is chrome
  in the corner of an internal deck; the 404 page exists and navigates home.

## Content (16 slides, English)

Source material: `antonia-framing.md` (phd repo, v2) plus corrections from
`prior-art-probe.md`. Two content rules from that probe: never attribute the
solver-speed death to SEED's documented record, and support the hand-authoring
cost via Lottaz's SpaceSolver (hand-written, hand-simplified inequalities)
rather than SEED. The deck names no contested history on any slide.

1. **Title** over the master-thesis demonstrator night photo: "Glued timber
   plates: from structural tests to the set of designs that work"; subtitle
   names the meeting and date.
2. **The loop today.** Checking a design takes weeks across specialists, so it
   happens once or twice per project; design stops at the first version that
   passes.
3. **Our loop is slower still.** No standard covers side-by-side plate gluing;
   physical tests and special approval fill the gap. The tests are the gap,
   and the opening.
4. **The flip.** "Does this design pass?" becomes "what is the full set of
   designs that would pass?"
5. **The precedent.** Chip design: billions of components, checking continuous
   and nearly free, designers explore inside a space the tools guarantee is
   manufacturable.
6. **Why it transfers.** Chips have a completely different set of
   requirements: scale, the aim of controlling electricity flow, materials.
   One strong thing in common: they need to take a final physical shape.
7. **The claim.** Requirement modules (structural, fabrication, cost, carbon)
   held by one solver; output is the admissible region, plus named excluding
   requirements for any design outside it. Uses the framing diagram.
8. **Whoever signs.** An engineer can trace which limit bound which decision,
   instead of receiving a verdict.
9. **What a coupling is, concretely.** Master thesis: structural checks took
   fabrication variables as inputs (press force, glue area, stock thickness).
   Fabrication decides what the structure can carry. Demonstrator photo doubles
   as credibility grounding.
10. **What "declared" means.** A coupling is declared when it travels as data
    both modules can read. Chip design rules are exactly this: written-down
    limits every module respects.
11. **The risk.** Some couplings may not travel as data. If pressing or gluing
    changes load-bearing in ways only physical tests reveal, the modules
    collapse into one entangled, one-off model.
12. **The question for this room.** "Chips declare their couplings. Can we
    declare ours?" That is precisely what the test programme establishes.
13. **Why now.** The idea is decades old; earlier attempts stayed prototypes,
    partly because every constraint was written and simplified by hand. What
    changed: when the design is code, LLMs excel at it; constraint modules can
    be drafted from test protocols and documentation and iterated quickly.
14. **What AI does not do.** It cannot make a constraint true. Limit values and
    their uncertainty come only from the physical tests; every drafted
    constraint is checked against them before it counts. The work shifts from
    writing to reviewing. The tests are the ground truth of the pipeline.
15. **Fit with the SNF project.** compas_timber is already building the paths:
    the connection to fabrication exists today; connecting structural analysis
    is the goal. Those two are already enough of a playground to test the
    hypothesis. Framed as instrument, not subject.
16. **Next steps and discussion.** Encode the test-programme requirements as
    constraints; measure the machine-checkable fraction (a result either way).
    The constraint-authoring work is shared and currently unassigned. Prompts:
    where should the structural/fabrication module splits run; which couplings
    resist declaration; who authors and who reviews constraints.

## Assets

New folder `src/assets/content/teaching/glued-timber-plates-2026-08/`:

- `admissible-region-diagram.png` copied from the phd repo
  (`workstreams/thesis-claim/antonia-framing-diagram.png`); verify legibility
  on the dark slide background, regenerate with dark styling only if illegible.
- Demonstrator photos imported cross-collection from
  `src/assets/content/research/building-across-scales/` (existing pattern, used
  by the UFT deck).
- No chip imagery: slides 5-6 are text slides. Avoids copyright hunting.

## Style rules

YAML fences only (no JSX needed). No em dashes anywhere. Slides 2-6 and 10-14
are text slides in the existing markdown idiom; `notes:` fields carry the
speaking cues.

## Validation and deploy

1. `pnpm run check:decks` for the YAML schema.
2. `pnpm build` (dev server is broken per `docs/BACKLOG.md`; astro check runs
   inside build).
3. `pnpm preview`, Daniel eyeballs the deck locally.
4. Deploy via wrangler (no CI in the repo; manual deploy is the norm), then
   verify the live URL and send it to Antonia. Deploy happens only after
   Daniel approves the previewed deck.
