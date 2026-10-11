# Architectural Program deck: design

**Date:** 2026-10-11. **For:** the Jour-Fixe with the supervisors, Monday 2026-10-12, about 15 minutes, about 12 slides.

## Identity

- **Title:** Architectural Program. **Subtitle:** An agentic workflow for architectural design.
- The title plays on "program": the architectural program (the brief) and the computer program. The pun is not announced; slide 5 reveals it.
- **Slug:** `architectural-program-2026-10`.

## Pattern

Unlisted deck, the same pattern as `phd-progress-2026-09`:

- `src/content/teaching/en/architectural-program-2026-10/deck.mdx`, English only, no `index.md` in any locale.
- Assets in `src/assets/content/teaching/architectural-program-2026-10/`.
- Reuse the phd-progress deck-local theme (warm near-black, amber accent, Poppins), copied into this deck's `<style>`, and the components in `src/components/decks/phd-progress/` (`PhdGanttStrip`, `Pipeline` if it fits the run slide).
- YAML fences by default; JSX only for multi-image or custom layouts (per `docs/slides/AUTHORING.md`).
- Content rules: headings from h2, no em dashes.

## Message

1. **The program is the prompt.** The architectural program (briefing) is plain text describing what the building must have, its constraints and its site. That is already the shape of a prompt, so the design process converges on writing the program.
2. **The designer defines "done".** The architect's work moves to rules and constraints, from simple checks to complex algorithms; the modelling is done by the LLM. Evidence: the rules (C1) are the largest lever, and all four passing runs had `rules.md`. Where no check existed (IFC information, BTLx validity, cuttability) the agents met only the letter of the delivery.
3. **Hypothesis (to validate):** a domain-specific language whose checks are fast enough to live inside the language, Lean-style, so the harness gets feedback through plain CLI tooling. Sources: `phd/workstreams/thesis-claim/plan-objections-2026-08-27.md` (T1, D1, D2) and `phd/notes/lean-vs-verilog-vs-urform.md`.

## Slides

| # | Slide | Content | Source |
|---|---|---|---|
| 1 | Title | Architectural Program, subtitle; a design render as background | best-run `birdseye.jpg` |
| 2 | Where this sits | `PhdGanttStrip` placing the benchmark in the PhD timeline | `gantt-data.ts` (add a benchmark row if missing) |
| 3 | The question | What does an agentic workflow look like for a real architectural design study? | study README |
| 4 | The inputs | Two labelled renders: `existing.ifc` (survey of the existing building, geometry only) and `limits.ifc` (envelope, support points at the cores, wall zone along the roof edge) | rendered with the study viewer's `--layers` (existing / envelope,wallzone,supports) |
| 5 | Finding 1: the program is the prompt | `program.md` excerpt (task, use, mandatory constraints) beside the task text the agent receives | `package/program.md`, `brief.md` §3 |
| 6 | The experiment | Factors: task P / H / F, tools py / compas / blender, context C0 to C3 (cumulative), workflow W0 / W1, harness cc / codex; how to read a run id | study README, `results/levels.json` |
| 7 | What a run delivers | `design.ifc`, `statement.md`, `references.md`, transcript; then checker scores and three renders | study README "Scoring", one run folder |
| 8 | Results | 4 passes in 223 runs; per-check pass counts (planarity 223, coverage 207, envelope 202, connectivity 193, plate size 154, bearing 5); context C1 is the biggest lever, W1 about triples the cost | `results.jsonl`, tier-1 contrast table |
| 9 | Finding 2: the designer defines "done" | The ladder from simple checks (envelope, bearing) to complex ones (planarity, hypar criteria); the architect writes the ladder, the LLM models | `scoring.md`, checker |
| 10 | Where "done" was not defined | IFC as a geometry container (quantity sets 0/221, styles 3, property sets 91, material 150, storeys 202); BTLx relabelled 2.0.0 to 2.3.1, 4/10 validated; schema-valid is not cuttable | findings drafts in `%TEMP%/btlx-2026-10-11/` |
| 11 | Hypothesis: a DSL with fast checks | `panel = TimberPanel(length=4.8)`; checks inside the language like Lean; severities like TypeScript errors / warnings; marked "to validate" | Daniel's notes above |
| 12 | Next | New measures (IFC literacy, BTLx validity, fabrication plausibility), codex unblock, tier 3 from Wed 14 Oct | study README, findings drafts |

Charts (slides 8 and 10) follow the `dataviz` skill and the deck theme. Every number on a slide is recomputed from `results.jsonl` or the findings drafts at build time of the slide, and Daniel approves the finding wording before it goes in.

## Constraints

- Do not edit the phd repo's `viewer/` (another session is rewriting it); running its render script read-only is fine. Ask before any benchmark run.
- No secrets, tokens or wholesale transcripts on slides.
- Do not touch the repo's two unrelated uncommitted changes.
- After the deck: update `portfolio-website.md` only if the site itself changed (it does not, beyond a new unlisted deck); ask about `/sync-knowledge`.

## Done when

`pnpm build` passes, the deck opens at `/teaching/architectural-program-2026-10/deck/` in the dev server, every slide renders at 16:9 without overflow, and Daniel has seen it.
