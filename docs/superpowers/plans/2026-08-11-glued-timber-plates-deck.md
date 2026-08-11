# Unlisted Glued-Timber-Plates Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an unlisted, non-indexed 16-slide deck at `/teaching/glued-timber-plates-2026-08/deck` for the 2026-08-12 13:00 meeting, deployed today.

**Architecture:** A deck-only content folder (no `index.md`) makes the deck route build while staying out of every listing; the sitemap already excludes `/deck/` URLs; one `noindex` meta in the shared Slides layout covers search engines. Spec: `docs/superpowers/specs/2026-08-11-glued-timber-plates-deck-design.md`.

**Tech Stack:** Astro 6 content collections, YAML-fence slide authoring (`src/lib/vite-presentation-slides.ts`), pnpm, wrangler.

## Global Constraints

- No em dashes anywhere in slide text (project rule, `CLAUDE.md`).
- YAML fences only; no JSX slides needed.
- Quote any YAML scalar containing `: ` (colon-space).
- English only; deliberately no pt/de counterpart (spec-approved deviation).
- Do not run `/sync-knowledge` (deck folders are invisible to the knowledge pipeline; verified in spec).
- Never attribute a cause of death to SEED in slide text (probe correction); the hand-authoring cost is supported by Lottaz's SpaceSolver, named only in presenter notes.
- `pnpm dev` is broken (see `docs/BACKLOG.md`); verify with `pnpm build && pnpm preview`.

---

### Task 1: noindex meta on all deck pages

**Files:**
- Modify: `src/layouts/Slides.astro:29-38` (head block)

**Interfaces:**
- Produces: every page rendered through `Slides.astro` carries `<meta name="robots" content="noindex">`. Task 3 greps for it in the built HTML.

- [ ] **Step 1: Add the meta tag**

In `src/layouts/Slides.astro`, immediately after the `<BaseHead ... />` component (before `<slot name="after-head" />`), add:

```html
    <meta name="robots" content="noindex" />
```

The head block becomes:

```astro
  <head>
    <BaseHead
      articleDate={articleDate}
      description={description}
      coverImage={coverImage}
      coverAlt={coverAlt}
      title={title}
      viewTransition={false}
      slug={slug}
    />
    <meta name="robots" content="noindex" />
    <slot name="after-head" />
  </head>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Slides.astro
git commit -m "feat(slides): noindex meta on deck pages, matching sitemap exclusion intent"
```

### Task 2: assets and deck content

**Files:**
- Create: `src/assets/content/teaching/glued-timber-plates-2026-08/admissible-region-diagram.png` (copy of `C:/repos/gitlab/daniellocatelli/phd/workstreams/thesis-claim/antonia-framing-diagram.png`)
- Create: `src/content/teaching/en/glued-timber-plates-2026-08/deck.mdx`

**Interfaces:**
- Consumes: existing photos under `src/assets/content/research/building-across-scales/` (cross-collection import, established pattern).
- Produces: deck entry the `decks` collection loader picks up; route `/teaching/glued-timber-plates-2026-08/deck`.

- [ ] **Step 1: Copy the diagram asset**

```pwsh
New-Item -ItemType Directory -Force C:\repos\github\daniel-locatelli\daniellocatelli\src\assets\content\teaching\glued-timber-plates-2026-08
Copy-Item C:\repos\gitlab\daniellocatelli\phd\workstreams\thesis-claim\antonia-framing-diagram.png C:\repos\github\daniel-locatelli\daniellocatelli\src\assets\content\teaching\glued-timber-plates-2026-08\admissible-region-diagram.png
```

- [ ] **Step 2: Write `deck.mdx`**

Full content (16 slides; frontmatter first, then imports, then one YAML fence per slide):

````mdx
---
Name: "Glued Timber Plates: From Structural Tests to the Set of Designs That Work"
Description: "Daniel's segment for the small-group technical meeting on 2026-08-12, framing the computational side of the glued timber plates project."
DateStart: "2026-08-12"
Event: Small-group technical meeting
Language: English
---

import Slide from "@/components/slides/Slide.astro";
import SlideMarkdown from "@/components/slides/SlideMarkdown.astro";
import SlideNotes from "@/components/slides/SlideNotes.astro";
import SlideImage from "@/components/slides/SlideImage.astro";
import SlideVideo from "@/components/slides/SlideVideo.astro";

import demonstratorAtNight from "@/assets/content/research/building-across-scales/the-demonstrator-at-night-the-holes-for-the-clamping-robots-are-now-used-for-01.jpg";
import pressureRobots from "@/assets/content/research/building-across-scales/the-pressure-robots-on-the-demonstrator-clamping-robots-on-the-demonstrator-01.jpg";
import admissibleRegionDiagram from "@/assets/content/teaching/glued-timber-plates-2026-08/admissible-region-diagram.png";

---
title: Small-group technical meeting
subtitle: 2026-08-12
image: demonstratorAtNight
imageAlt: The master thesis demonstrator at night, with the clamping-robot holes used as light fixtures
overlay: black/40
copyright: Daniel Locatelli
text: |
  # Glued Timber Plates

  ## From structural tests to the set of designs that work
notes: "My segment: the computational side of the project, and one question I need this room to answer."
---

---
text: |
  ## Checking a building design takes weeks

  It moves between specialists, each with their own models and tools.

  Because checking is slow, it happens once or twice per project.

  Design stops at the first version that passes, not the best one that could.
notes: "This is the general problem. Nothing controversial here; every project in the room has lived it."
---

---
text: |
  ## Our loop is slower still

  The standards do not cover side-by-side plate gluing.

  That is why it needs physical testing and special approval.

  The tests close that gap. They are also the opening for the thesis.
notes: "Connect directly to Antonia's part: the test programme is not a side quest, it is the ground this whole idea stands on."
---

---
text: |
  ## If checking were nearly free, the question changes

  "Does this design pass?"

  # "What is the full set of designs that would pass?"
notes: "Pause here. This flip is the whole thesis in one line."
---

---
text: |
  ## Another industry already made checking nearly free

  Chip design: billions of components on a single chip.

  Every module states its interface. Design rules are checked continuously.

  Designers explore freely inside a space the tools guarantee is manufacturable.
notes: "No chip vocabulary needed: the point is the workflow shape. Checking runs all the time, so exploring is safe."
---

---
text: |
  ## Chips are nothing like buildings

  Different scale. Different materials. Their aim is to control electricity flow.

  But one thing is the same, and it is the thing that matters:

  # Both need to take a final physical shape.
notes: "This framing convinced both the CS and the non-CS readers of the PhD application. Physicality is the bridge."
---

---
title: The claim
subtitle: Requirement modules, one solver
image: admissibleRegionDiagram
imageAlt: "Diagram: requirement modules for structural, fabrication, cost, and carbon feed one solver, which returns the admissible region and, for an excluded design, the named requirements that rule it out"
fit: contain
notes: "Structural holds capacity checks. Fabrication holds press, stock, and glue limits. Cost and carbon likewise. The solver holds every module at once."
---

---
text: |
  ## The answer stops being a verdict

  The result is the set of all designs that work.

  When a design is not possible: a named list of exactly which requirements exclude it.

  An engineer can trace which limit bound which decision.
notes: "This is the slide for whoever signs. Traceability, not a black box."
---

---
title: What is a coupling?
subtitle: "Master thesis: on-site gluing of timber panels"
image: pressureRobots
imageAlt: Clamping robots applying pressure on the master thesis demonstrator
overlay: black/55
copyright: Daniel Locatelli
text: |
  The structural checks took fabrication variables as inputs.

  Press force. Glue area. Stock thickness.

  How the panel is made decides what it can carry.
notes: "Concrete before abstract: in the master thesis we called this a material-robotic system. Same material, same predicament as our plates."
---

---
text: |
  ## A coupling is declared when it travels as data

  A shared variable both modules read: glue area, press force, stock thickness.

  Chip design rules are exactly this: written-down limits that every module respects.
notes: "Now the abstract term is safe to use: declared means written down as data, nothing more mysterious."
---

---
text: |
  ## The risk

  Some couplings may not travel as data.

  If pressing or gluing changes load-bearing in ways only tests can reveal,

  the modules collapse into one entangled model: a one-off, built for this system only.
notes: "Honest failure mode. A one-off checker would still be worth building, but the broader claim would not survive it."
---

---
text: |
  ## Chips declare their couplings.

  # Can we declare ours?

  That is precisely what the test programme establishes.
notes: "This is the question for this room. Where does the shared-variable picture break? Their fabrication and testing experience answers it, not my code."
---

---
text: |
  ## Why now? The idea is decades old.

  Earlier attempts stayed prototypes. Every constraint was written and simplified by hand.

  What changed: when the design is code, LLMs excel at it.

  Constraint modules drafted from test protocols and documentation, iterated in minutes.
notes: "If asked for names: SpaceSolver at EPFL around 2000 documents the hand-written-inequalities problem; SEED in the 1990s is the other reference point. Do not attribute a cause of death to SEED; the record does not support one."
---

---
text: |
  ## What AI does not do

  It cannot make a constraint true.

  Limit values and their uncertainty come from one place only: the physical tests.

  Every drafted constraint is checked against them before it counts.

  The work shifts from writing to reviewing.
notes: "The guardrail, and the onboarding move: the test programme is the ground truth that makes any of the AI usable."
---

---
text: |
  ## How this fits our SNF project

  compas_timber is already building the paths.

  The connection to fabrication exists today. Connecting structural analysis is the goal.

  Together they are the playground where this hypothesis gets tested.
notes: "Instrument, not subject: the thesis is the claim about declared couplings and the admissible region; compas_timber is where it runs."
---

---
text: |
  ## Next steps, and three questions

  Encode the test-programme requirements as constraints. Measure what fraction a machine can check. That number is a result either way.

  - Where should the structural and fabrication modules split?
  - Which couplings resist being declared as shared data?
  - Constraint authoring is shared work, currently unassigned. Who writes, who reviews?
notes: "End on the assignment question deliberately: better to name the shared work now than discover it in year three."
---
````

- [ ] **Step 3: Validate the deck schema**

Run: `pnpm run check:decks`
Expected: PASS, zero errors, deck count includes the new file.

- [ ] **Step 4: Commit**

```bash
git add src/assets/content/teaching/glued-timber-plates-2026-08 src/content/teaching/en/glued-timber-plates-2026-08
git commit -m "feat(teaching): unlisted glued-timber-plates-2026-08 deck for the 2026-08-12 technical meeting"
```

### Task 3: build and verify unlisted + non-indexed

**Files:**
- No new files; verification only (build output in `dist/`).

**Interfaces:**
- Consumes: Task 1's meta tag, Task 2's deck entry.
- Produces: verified local build; Daniel's preview approval gates Task 4.

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: astro check passes; build completes; route `/teaching/glued-timber-plates-2026-08/deck/index.html` present in `dist/`.

- [ ] **Step 2: Verify the four properties in `dist/`**

```pwsh
Test-Path dist/teaching/glued-timber-plates-2026-08/deck/index.html                     # True: route exists
Select-String -Path dist/teaching/glued-timber-plates-2026-08/deck/index.html -Pattern 'name="robots" content="noindex"' -Quiet   # True: noindex
Select-String -Path dist/sitemap-0.xml -Pattern 'glued-timber-plates' -Quiet            # False: not in sitemap
Select-String -Path dist/teaching/index.html -Pattern 'glued-timber-plates' -Quiet      # False: not in listing
```

Expected: True, True, False, False. (Adjust sitemap filename if the build emits a different shard name; check `dist/sitemap-index.xml`.)

- [ ] **Step 3: Preview for Daniel**

Run: `pnpm preview` (background), then Daniel reviews `http://localhost:4321/teaching/glued-timber-plates-2026-08/deck` and approves or requests slide edits. Iterate edits + `pnpm run check:decks` + `pnpm build` until approved.

### Task 4: deploy and hand off

**Files:**
- No file changes; `wrangler deploy` of the built site. Push commits to origin.

**Interfaces:**
- Consumes: Daniel's preview approval (hard gate; do not deploy before it).

- [ ] **Step 1: Deploy**

Run: `pnpm exec wrangler deploy`
Expected: upload succeeds, deployment URL printed for the production Worker.

- [ ] **Step 2: Verify live**

```pwsh
(Invoke-WebRequest https://daniellocatelli.com/teaching/glued-timber-plates-2026-08/deck -UseBasicParsing).StatusCode   # 200
```

Also confirm the noindex meta in the live response body.

- [ ] **Step 3: Push and hand off**

```bash
git push
```

Give Daniel the live URL to send to Antonia (he sends it himself). Then close the day's session record per the phd skill (the commitment's "link with Antonia by end of day" is scored there).
