# Architectural Program Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 12-slide unlisted deck, "Architectural Program", for the Jour-Fixe on 2026-10-12, presenting the agent-design benchmark.

**Architecture:** One MDX deck under `src/content/teaching/en/architectural-program-2026-10/`, reusing the phd-progress deck theme (its `<style>` block copied) and its components. Images are renders from the phd repo's study viewer (run read-only) and run renders already in the results register. Charts are plain HTML bars styled in the deck's `<style>`, like the September deck's `.pi-bar`.

**Tech Stack:** Astro 6 MDX slides (`@/components/slides/*`), Tailwind-free deck CSS, the phd study viewer (`npm run render`, Vite + Playwright).

**Spec:** `docs/superpowers/specs/2026-10-11-architectural-program-deck-design.md`.

## Global Constraints

- Slug `architectural-program-2026-10`; English only; no `index.md` in any locale.
- Title "Architectural Program", subtitle "An agentic workflow for architectural design".
- No em dashes (`—`) anywhere in the deck text or notes.
- Headings: markdown slides start at h2; JSX slides use `.pp-head` (h3 kicker + h2 statement).
- Do not edit anything under `C:\repos\gitlab\daniellocatelli\phd\studies\2026-10-agent-design-benchmark\viewer\` (another session owns it); running `npm run render` there is allowed.
- Do not stage or commit `src/assets/content/projects/common-sky-by-artengineering-for-studio-other-spaces/test-module-before-fabrication.jpg` or `docs/superpowers/specs/2026-09-14-phd-status-deck-design.md`. Stage explicit paths only.
- No secrets, tokens or transcript excerpts on slides.
- Finding wording on slides 8 to 10 is shown to Daniel before commit (Task 5 checkpoint).
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Do not push.

Paths used below:
- `WEB` = `C:\repos\github\daniel-locatelli\daniellocatelli`
- `STUDY` = `C:\repos\gitlab\daniellocatelli\phd\studies\2026-10-agent-design-benchmark`
- `ASSETS` = `WEB\src\assets\content\teaching\architectural-program-2026-10`
- `DECK` = `WEB\src\content\teaching\en\architectural-program-2026-10\deck.mdx`

---

### Task 1: Images

**Files:**
- Create: `ASSETS/package-existing.jpg`, `ASSETS/package-limits.jpg` (renders of the two input files)
- Create: `ASSETS/run-birdseye.jpg`, `ASSETS/run-interior.jpg`, `ASSETS/run-roof-closeup.jpg` (copied from a passing run)

**Interfaces:**
- Produces: the five files above, imported by name in Task 3 and Task 4.

- [ ] **Step 1: Render the package layers with the study viewer (read-only use)**

The render script needs some `design` path even when the design layer is off; any delivered `design.ifc` works. Write the jobs file in the session scratchpad, not in the viewer folder.

```bash
SCR="$TEMP/claude-deck"; mkdir -p "$SCR/existing" "$SCR/limits"
cat > "$SCR/jobs.json" <<'EOF'
[{"design": "C:/bench/matrix/H-compas-C3-W0-cc/r03/work/out/design.ifc", "brief": "C:/bench/matrix/package", "out": "PLACEHOLDER"}]
EOF
cd /c/repos/gitlab/daniellocatelli/phd/studies/2026-10-agent-design-benchmark/viewer
sed "s#PLACEHOLDER#$SCR/existing#" "$SCR/jobs.json" > "$SCR/jobs-existing.json"
sed "s#PLACEHOLDER#$SCR/limits#" "$SCR/jobs.json" > "$SCR/jobs-limits.json"
npm run render -- --jobs "$SCR/jobs-existing.json" --layers existing
npm run render -- --jobs "$SCR/jobs-limits.json" --layers existing,envelope,wallzone,supports
```

Expected: `wrote …/birdseye.jpg`, `interior.jpg`, `roof-closeup.jpg` in each folder, exit code 0. If `C:/bench/matrix/H-compas-C3-W0-cc/r03/work/out/design.ifc` does not exist, use `ls C:/bench/matrix/H-compas-C3-W0-cc/r03/work/out/` to find the design file and adjust the path.

The limits render keeps the existing building as context (faint), so the limits read in place. If the existing layer dominates the limits shot, re-run the limits job with `--layers envelope,wallzone,supports` and compare.

- [ ] **Step 2: Look at both bird's-eye renders and copy them**

Open `$SCR/existing/birdseye.jpg` and `$SCR/limits/birdseye.jpg` with the Read tool. Confirm: the first shows only the existing building; the second shows the envelope solid, the wall-zone band and the support points. Then:

```bash
A=/c/repos/github/daniel-locatelli/daniellocatelli/src/assets/content/teaching/architectural-program-2026-10
mkdir -p "$A"
cp "$SCR/existing/birdseye.jpg" "$A/package-existing.jpg"
cp "$SCR/limits/birdseye.jpg" "$A/package-limits.jpg"
```

- [ ] **Step 3: Copy the three renders of the passing run H-compas-C3-W0-cc r03**

```bash
R=/c/repos/gitlab/daniellocatelli/phd/studies/2026-10-agent-design-benchmark/results/H-compas-C3-W0-cc/r03
cp "$R/birdseye.jpg" "$A/run-birdseye.jpg"
cp "$R/interior.jpg" "$A/run-interior.jpg"
cp "$R/roof-closeup.jpg" "$A/run-roof-closeup.jpg"
ls -la "$A"
```

Expected: five `.jpg` files, each over 20 KB.

- [ ] **Step 4: Commit**

```bash
cd /c/repos/github/daniel-locatelli/daniellocatelli
git add src/assets/content/teaching/architectural-program-2026-10
git commit -m "feat(teaching): images for the architectural-program deck

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Gantt "now" prop and benchmark rows

**Files:**
- Modify: `WEB/src/components/decks/phd-progress/PhdGantt.astro` (Props and the two `pct(NOW)` uses)
- Modify: `WEB/src/components/decks/phd-progress/gantt-data.ts` (append exports)

**Interfaces:**
- Produces: `PhdGantt` accepts `now?: string` (YYYY-MM-DD, default `NOW`); `gantt-data.ts` exports `BENCHMARK_ROWS: GanttRow[]` and `BENCHMARK_MILESTONES: { date: string; label: string }[]`.

- [ ] **Step 1: Add the `now` prop to PhdGantt**

In `PhdGantt.astro`, add to `interface Props`:

```ts
  /** Date of the "now" line; defaults to the September deck's NOW. */
  now?: string;
```

Add `now = NOW,` to the destructuring of `Astro.props`, and replace both `pct(NOW)` occurrences (lines 48 and 57) with `pct(now)`.

- [ ] **Step 2: Append the benchmark rows to gantt-data.ts**

```ts
/**
 * The architectural-program deck: the September sections, condensed, with
 * the agent-design benchmark as the current row.
 */
export const BENCHMARK_ROWS: GanttRow[] = [
  { id: "compas", label: "COMPAS study · PRs", start: "2026-07-09", end: "2026-09-07", kind: "done", acts: [] },
  { id: "plates", label: "Planar meshing algorithms", start: "2026-08-12", end: "2026-09-26", kind: "done", acts: [] },
  { id: "structure", label: "Structural analysis", start: "2026-09-10", end: "2026-09-27", kind: "done", acts: [] },
  { id: "hil", label: "HIL case study", start: "2026-09-14", end: "2026-10-14", kind: "ongoing", acts: [] },
  { id: "benchmark", label: "Agent-design benchmark", start: "2026-10-02", end: "2026-10-31", kind: "now", acts: [] },
  { id: "acoustics", label: "Acoustics · assembly", start: "2026-10-14", end: "2026-12-15", kind: "planned", acts: [] },
  { id: "coursework", label: "Coursework", start: "2026-09-27", end: "2026-12-20", kind: "planned", acts: [] },
];

export const BENCHMARK_MILESTONES = [
  { date: "2026-10-12", label: "Jour-Fixe" },
  { date: "2026-10-14", label: "Technical meeting" },
];
```

- [ ] **Step 3: Type-check**

Run: `cd WEB && pnpm exec astro check 2>&1 | tail -5`
Expected: `0 errors`. The September deck still renders its now line at 2026-09-28 because the default is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/decks/phd-progress/PhdGantt.astro src/components/decks/phd-progress/gantt-data.ts
git commit -m "feat(teaching): now prop on PhdGantt, benchmark rows for the architectural-program deck

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Deck scaffold, theme and slides 1 to 4

**Files:**
- Create: `DECK`

**Interfaces:**
- Consumes: Task 1 images; Task 2 `BENCHMARK_ROWS`, `BENCHMARK_MILESTONES`, `now` prop.
- Produces: the deck file with its `<style>` block at the end; later tasks insert slides above the `{/* ── style ── */}` marker and append CSS inside the same `<style>` block, below the line `/* ── architectural-program additions ── */`.

- [ ] **Step 1: Write the deck with frontmatter, imports and slides 1 to 4**

```mdx
---
Name: "Architectural Program: An Agentic Workflow for Architectural Design"
Description: "Unlisted deck for the Jour-Fixe on 2026-10-12: the agent-design benchmark, its inputs and factors, what a run delivers, and the findings that the program becomes the prompt and the designer defines done."
DateStart: "2026-10-12"
Event: Jour-Fixe
Language: English
---

import { Image } from "astro:assets";
import Slide from "@/components/slides/Slide.astro";
import SlideNotes from "@/components/slides/SlideNotes.astro";

import PhdGantt from "@/components/decks/phd-progress/PhdGantt.astro";
import { BENCHMARK_ROWS, BENCHMARK_MILESTONES } from "@/components/decks/phd-progress/gantt-data";

import packageExisting from "@/assets/content/teaching/architectural-program-2026-10/package-existing.jpg";
import packageLimits from "@/assets/content/teaching/architectural-program-2026-10/package-limits.jpg";
import runBirdseye from "@/assets/content/teaching/architectural-program-2026-10/run-birdseye.jpg";
import runInterior from "@/assets/content/teaching/architectural-program-2026-10/run-interior.jpg";
import runRoof from "@/assets/content/teaching/architectural-program-2026-10/run-roof-closeup.jpg";

{/* ───────────────────────────── Cover ───────────────────────────── */}

<Slide image={runBirdseye} imageAlt="Bird's-eye render of an agent's design: a timber plate roof with a glass facade on top of the existing teaching building" overlay="black/45">
  <div class="pp-cover">
    <h3>Jour-Fixe · 12 October 2026</h3>
    <h1>Architectural<br />Program</h1>
    <h2>An agentic workflow for architectural design</h2>
  </div>
  <SlideNotes>Program, in both senses. In architecture, the program is the brief: what the building must hold, where, under which constraints. In computing, a program is what a machine runs. This talk is about the two becoming the same text. The render is run H-compas-C3-W0-cc r03, one of the four runs that passed every check.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>Where this sits</h3>
    <h2>Two weeks of <em>benchmark</em></h2>
  </div>
  <PhdGantt rows={BENCHMARK_ROWS} milestones={BENCHMARK_MILESTONES} now="2026-10-12" labelWidth="19rem" />
  <SlideNotes>The benchmark started on 2 October with one fixed condition and became a matrix of conditions on 8 October. It grows out of the HIL case study: the same building, the same roof task, now given to coding agents instead of designed by hand.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>The question</h3>
    <h2>What does an agentic workflow look like for a <em>real architectural design study?</em></h2>
  </div>
  <p class="pp-foot">A real building, a real program, a design an architect could hand on. And what makes the agents better at it.</p>
  <SlideNotes>Not a component in isolation: the agent receives what an architect receives at the start of a study (a program, a survey of the existing building, the limits) and must deliver a design as IFC. A checker scores every design against the same rules.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>The inputs</h3>
    <h2>Two IFC files: <em>what exists</em>, and <em>what is allowed</em></h2>
  </div>
  <div class="pp-courses">
    <figure>
      <Image src={packageExisting} loading="eager" alt="Render of existing.ifc: the existing teaching building as plain geometry, seen from above" widths={[800, 1200]} sizes="40vw" />
      <figcaption><b>existing.ifc</b><span>The survey: the existing building, geometry only, no BIM metadata</span></figcaption>
    </figure>
    <figure>
      <Image src={packageLimits} loading="eager" alt="Render of limits.ifc on the existing building: the height envelope as a translucent solid, the wall zone as a band along the roof edge, and the support points at the cores" widths={[800, 1200]} sizes="40vw" />
      <figcaption><b>limits.ifc</b><span>The envelope, the wall zone along the roof edge, the support points at the cores</span></figcaption>
    </figure>
  </div>
  <SlideNotes>existing.ifc is a pure survey, IFC 4.3 in local metres, with a .3dm of the same content for Rhino. limits.ifc holds every limit in one file: the envelope and the wall zone as IfcSpatialZone, the support points as IfcStructuralPointConnection in an IfcStructuralAnalysisModel, the same entity the agent uses for its own bearings, so checking is a matching. The roof's load goes to the existing building only at the support points, each within 5 mm; the walls may also bear in the wall zone. Where the program text and limits.ifc differ, limits.ifc governs.</SlideNotes>
</Slide>

{/* ── style ── */}
```

Then append the whole `{/* … Deck-local theme … */}` comment and the `<style>{`…`}</style>` block from `WEB/src/content/teaching/en/phd-progress-2026-09/deck.mdx` (from the line `{/*` above `Deck-local theme` to the end of the file) verbatim, and insert this line just before the closing `` `}</style> ``:

```css
  /* ── architectural-program additions ── */
```

- [ ] **Step 2: Check for em dashes and h1 in markdown**

Run: `grep -n "—" DECK; echo "exit $?"`
Expected: no lines, `exit 1`.

- [ ] **Step 3: Start the dev server and open the deck**

Run: `cd WEB && pnpm dev` (Astro 7 runs detached; `pnpm exec astro dev status` shows the URL). Open `http://localhost:4321/teaching/architectural-program-2026-10/deck/` in Chrome (claude-in-chrome) at 1920×1080 and screenshot slides 1 to 4.
Expected: cover with the run render behind the title; the Gantt with the "now" line at 12 October and the benchmark row highlighted; slide 4 with the two renders side by side, no overflow.

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching/en/architectural-program-2026-10/deck.mdx
git commit -m "feat(teaching): architectural-program deck, cover to inputs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Slides 5 to 7 (the program as prompt, the experiment, a run)

**Files:**
- Modify: `DECK` (insert above `{/* ── style ── */}`; CSS below `/* ── architectural-program additions ── */`)

**Interfaces:**
- Consumes: `runBirdseye`, `runInterior`, `runRoof` imports from Task 3.
- Produces: CSS classes `.ap-cols`, `.ap-doc`, `.ap-factors` used again in Tasks 5 and 6.

- [ ] **Step 1: Insert slides 5 to 7**

```mdx
<Slide>
  <div class="pp-head">
    <h3>Finding 1</h3>
    <h2>The program is <em>already a prompt</em></h2>
  </div>
  <div class="ap-cols">
    <div class="ap-doc">
      <span class="ap-doc-name">program.md · the architect's brief</span>
      <p><b>Task.</b> Design the enclosure of the extension: roof and walls. The interior must stay free of supports.</p>
      <p><b>Use.</b> Classrooms and presentation halls for university teaching.</p>
      <p><b>Constraints.</b> Inside the envelope. The roof bears only at the support points at the cores, within 0.005 m. Clear height at least 3.0 m. Planar CLT plates, 140 mm.</p>
      <p><b>Documents.</b> existing.ifc, limits.ifc, site plan, photos.</p>
    </div>
    <div class="ap-doc">
      <span class="ap-doc-name">task.md · what the agent receives</span>
      <p>You are the designer of a roof structure for an existing building. The program, the 3D model of the existing building, the site, photos and drawings are in /work/brief/. Read all of it before you start.</p>
      <p>Deliver, in /work/out/: design.ifc, references.md, statement.md.</p>
    </div>
  </div>
  <p class="pp-foot">Plain text: what the building should have, its constraints, its site. The design process converges on writing the program.</p>
  <SlideNotes>An architectural program is plain text where the architect states what the building should have, the constraints and the location. That is the shape of a prompt. The task text the agent receives is short; almost everything that matters is in the program and the two IFC files. So the architect's craft moves toward writing the program well.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>The experiment</h3>
    <h2>One factor changed at a time, <em>ten repeats each</em></h2>
  </div>
  <div class="ap-factors">
    <div><b>Task</b><span><i>P</i> plate roof with a glass facade</span><span><i>H</i> P, roof formed of hyperbolic paraboloids</span><span><i>F</i> H, and a BTLx file for the CNC</span></div>
    <div><b>Tools</b><span><i>py</i> Python, numpy, ifcopenshell</span><span><i>compas</i> the COMPAS ecosystem</span><span><i>blender</i> Blender with ifcopenshell</span></div>
    <div><b>Context</b><span><i>C0</i> the task text</span><span><i>C1</i> + rules.md, every check and threshold</span><span><i>C2</i> + 19 papers on meshes</span><span><i>C3</i> + a skills library</span></div>
    <div><b>Workflow</b><span><i>W0</i> one designer, 60 min</span><span><i>W1</i> designer, three reviewers, revision</span></div>
    <div><b>Harness</b><span><i>cc</i> Claude Code</span><span><i>codex</i> Codex (blocked)</span></div>
  </div>
  <p class="pp-foot">Run id: <code>H-compas-C0-W0-cc-r01</code> reads task, tools, context, workflow, harness, repeat. Baseline: H-compas-C0-W0-cc.</p>
  <SlideNotes>3 tasks, 3 tool stacks, 4 context levels, 2 workflows, 2 harnesses: 144 cells, 10 repeats each. Tier 1 is the baseline plus one factor changed at a time: 100 of 110 runs done, the codex cell is blocked on its identity check. Tier 2 crosses all tools, context levels and workflows on H: 121 of 160. Tier 3 has its first 2 runs. Each factor level changes exactly one passage of the task text. The model is the same throughout. W1: the designer works 60 minutes, then three reviewers in parallel (compliance, structure and fabrication, architectural quality, 10 minutes each), then the designer revises for 20 minutes.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>What a run delivers</h3>
    <h2>A design as IFC, <em>scored the same way every time</em></h2>
  </div>
  <div class="pln-shots">
    <figure><Image src={runBirdseye} loading="eager" alt="Bird's-eye render of the design on the existing building" widths={[640, 1200]} sizes="30vw" /><figcaption>Bird's-eye</figcaption></figure>
    <figure><Image src={runInterior} loading="eager" alt="Interior render under the timber plate roof, looking toward the glass facade" widths={[640, 1200]} sizes="30vw" /><figcaption>Interior</figcaption></figure>
    <figure><Image src={runRoof} loading="eager" alt="Close-up render of the roof plates where they meet" widths={[640, 1200]} sizes="30vw" /><figcaption>Roof close-up</figcaption></figure>
  </div>
  <p class="pp-foot">The agent writes design.ifc, statement.md and references.md. The checker scores the IFC; the viewer renders it from three fixed cameras; the register keeps time, turns and cost.</p>
  <SlideNotes>Every run is one Docker container with the package mounted, a proxy that keeps the API token away from the agent, and a 60-minute cap. Afterwards the checker scores design.ifc, the hypar scorer adds its criteria for H and F, and the viewer renders the same three shots for every design so they can be compared. In W1 the designer's first draft is scored too. Agents may not render; the evaluation renders everything the same way. Shown: H-compas-C3-W0-cc r03.</SlideNotes>
</Slide>
```

- [ ] **Step 2: Add the CSS for slides 5 and 6**

Below `/* ── architectural-program additions ── */`:

```css
  #deck .ap-cols {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: clamp(1rem, 2.5vw, 2.5rem);
    width: min(88%, 92rem);
    margin: clamp(1rem, 3vh, 2rem) auto 0;
  }
  #deck .ap-doc {
    border: 1px solid color-mix(in srgb, var(--pp-dim) 35%, transparent);
    border-radius: 0.4rem;
    padding: clamp(0.8rem, 2vh, 1.4rem) clamp(1rem, 1.6vw, 1.6rem);
    font-size: clamp(0.8rem, 1.05vw, 1.15rem);
    line-height: 1.45;
    color: var(--pp-dim);
    text-align: left;
  }
  #deck .ap-doc b { color: var(--pp-ink); }
  #deck .ap-doc p { margin: 0 0 0.6em; }
  #deck .ap-doc-name {
    display: block;
    margin-bottom: 0.8em;
    font-size: 0.8em;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--pp-amber);
  }
  #deck .ap-factors {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: clamp(0.6rem, 1.4vw, 1.4rem);
    width: min(90%, 96rem);
    margin: clamp(1rem, 3vh, 2rem) auto 0;
    text-align: left;
    font-size: clamp(0.75rem, 0.95vw, 1.05rem);
  }
  #deck .ap-factors > div { display: flex; flex-direction: column; gap: 0.55em; }
  #deck .ap-factors b { color: var(--pp-amber); font-size: 1.1em; margin-bottom: 0.2em; }
  #deck .ap-factors span { color: var(--pp-dim); line-height: 1.35; }
  #deck .ap-factors i { font-style: normal; color: var(--pp-ink); font-weight: 600; margin-right: 0.35em; }
```

- [ ] **Step 3: Em-dash check and visual check**

Run: `grep -n "—" DECK; echo "exit $?"` → `exit 1`.
Reload the deck, screenshot slides 5 to 7 at 1920×1080 and at 1280×720. Expected: both columns on slide 5 fit above the footer line; the five factor columns on slide 6 fit without wrapping off the slide; three renders in one row on slide 7.

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching/en/architectural-program-2026-10/deck.mdx
git commit -m "feat(teaching): architectural-program deck, program as prompt, experiment, run

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Slides 8 to 10 (results and Finding 2), with Daniel's approval

**Files:**
- Modify: `DECK`

**Interfaces:**
- Consumes: `.ap-cols` from Task 4.
- Produces: CSS classes `.ap-bars` (horizontal count bars, `--n` and `--of` custom properties) and `.ap-ladder`.

- [ ] **Step 1: Recompute every number from the register**

```bash
cd /c/repos/gitlab/daniellocatelli/phd/studies/2026-10-agent-design-benchmark/results
python -I -c "
import json
rs=[json.loads(l) for l in open('results.jsonl')]
d=[r for r in rs if r['design']]
print('runs',len(rs),'designs',len(d))
print('pass',[r['run_id'] for r in rs if r['rules_pass']])
for k in ['planarity','coverage','envelope','connectivity','plate_size','bearing']:
  print(k, sum(bool(r[k+'_pass']) for r in d))
h=[r for r in d if r['task']!='P']
print('hypar', sum(bool(r['hypar_success']) for r in h), 'of', len(h))
"
```

Expected on 2026-10-12 (the scheduler is stopped until 14 Oct, so it should not move): runs 223, designs 223; pass = H-compas-C3-W0-cc-r03, H-blender-C1-W0-cc-r01, H-blender-C3-W1-cc-r03, H-py-C1-W0-cc-r06; planarity 223, coverage 207, envelope 202, connectivity 193, plate_size 154, bearing 5; hypar 108 of 213. If any number differs, use the new number in Step 2.

- [ ] **Step 2: Insert slides 8 to 10**

```mdx
<Slide>
  <div class="pp-head">
    <h3>Results · 223 runs</h3>
    <h2>Four designs pass. <em>All four had the rules.</em></h2>
  </div>
  <div class="ap-bars" style="--of:223">
    <div><b>Planarity ≤ 1 mm</b><i style="--n:223"></i><span>223</span></div>
    <div><b>Coverage ≥ 95 %</b><i style="--n:207"></i><span>207</span></div>
    <div><b>Envelope</b><i style="--n:202"></i><span>202</span></div>
    <div><b>Connectivity</b><i style="--n:193"></i><span>193</span></div>
    <div><b>Plate size ≤ 3.0 × 13.0 m</b><i style="--n:154"></i><span>154</span></div>
    <div><b>Bearing within 5 mm</b><i class="is-low" style="--n:5"></i><span>5</span></div>
  </div>
  <p class="pp-foot">Designs passing each check, of 223. The four passes (two at C1, two at C3) all received rules.md. In tier 1, giving the rules (C1) is the largest lever; the review workflow (W1) about triples the cost.</p>
  <SlideNotes>Pass means every check passes and, for H and F, the hypar criteria too. Planarity is free: every design extrudes planar profiles. Bearing is the bottleneck: the roof must land within 5 mm of the given support points, which tests snapping to the points, not landing on the column (the columns are 40 by 40 cm). Tier-1 contrasts against the baseline, as Cliff's delta: C1 raises checks passed by +0.46 and cuts wall time by 0.58; W1 raises cost by +1.00 (every W1 run costs more than every baseline run) with no gain in checks. Passing runs: H-compas-C3-W0-cc r03, H-blender-C1-W0-cc r01, H-blender-C3-W1-cc r03, H-py-C1-W0-cc r06. Context is cumulative, so C3 includes rules.md.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>Finding 2</h3>
    <h2>The designer now defines <em>what "done" means</em></h2>
  </div>
  <div class="ap-cols">
    <ol class="ap-ladder">
      <li><b>Envelope</b><span>containment in a solid</span></li>
      <li><b>Bearing</b><span>snap to given points, 5 mm</span></li>
      <li><b>Coverage, plate size</b><span>areas and extents</span></li>
      <li><b>Connectivity, planarity</b><span>a graph, a fit per plate</span></li>
      <li><b>Hypar criteria</b><span>90 % of plates on a hyperbolic paraboloid within 10 mm, at most 4 plates per corner</span></li>
    </ol>
    <div class="ap-doc">
      <span class="ap-doc-name">Who does what</span>
      <p><b>The architect</b> writes the program and the rules, from simple checks to complex algorithms.</p>
      <p><b>The agent</b> does the modelling: every plate, every IFC entity, every line of geometry code.</p>
    </div>
  </div>
  <SlideNotes>The checks run from simple to complex, top to bottom. Writing them is now the design work that stays with the architect: deciding what counts as done. The modelling itself is done by the LLM in every run. The results support it: handing the agent the rules is the single largest improvement, larger than the tools, the papers or the reviewers.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>Finding 2 · where "done" was not defined</h3>
    <h2>Unchecked means <em>undelivered</em></h2>
  </div>
  <div class="ap-cols">
    <div>
      <span class="ap-doc-name">IFC as a geometry container · designs carrying each, of 221</span>
      <div class="ap-bars" style="--of:221">
        <div><b>Building storey</b><i style="--n:202"></i><span>202</span></div>
        <div><b>Material</b><i style="--n:150"></i><span>150</span></div>
        <div><b>Property sets</b><i style="--n:91"></i><span>91</span></div>
        <div><b>Surface styles</b><i class="is-low" style="--n:3"></i><span>3</span></div>
        <div><b>Quantity sets</b><i class="is-low" style="--n:0"></i><span>0</span></div>
      </div>
    </div>
    <div class="ap-doc">
      <span class="ap-doc-name">BTLx · task F, compas, 10 runs</span>
      <p><b>The version is relabelled, not checked.</b> compas_timber writes 2.0.0; all 10 runs replaced it with 2.3.1 as a string; 4 validated against the schema.</p>
      <p><b>Schema-valid is not cuttable.</b> Every part is one square-cut FreeContour: no bevel at the folds, no joints, and slivers down to 0.083 mm.</p>
    </div>
  </div>
  <SlideNotes>IFC: every delivered design opened in IfcOpenShell; the counts say whether the entity exists, not whether it is right. 71 designs name no material although the brief fixes 140 mm CLT. The agents meet the delivery format in its letter (valid IFC, the right element classes) and miss what it is for: quantities, costs, checks. BTLx: the content compas_timber writes happens to be valid under both versions, so the relabel was enough here; six of ten agents shipped without knowing. All six said so in their final message. The parts: in all 10 runs one FreeContour with inclination 0, so the folded edges would neither close nor carry; r09 ships 62 parts under 0.01 square metres. A hint at n = 1 each: without compas_timber (F-blender, F-py), both agents fetched the XSD first, wrote 2.3.1 by hand and validated to zero errors. With compas_timber they trusted the writer.</SlideNotes>
</Slide>
```

- [ ] **Step 3: Add the CSS for bars and ladder**

```css
  #deck .ap-bars {
    display: grid;
    gap: clamp(0.35rem, 1vh, 0.7rem);
    width: min(80%, 80rem);
    margin: clamp(1rem, 3vh, 2rem) auto 0;
    font-size: clamp(0.8rem, 1.05vw, 1.15rem);
  }
  #deck .ap-cols .ap-bars { width: 100%; margin-top: 0.4rem; }
  #deck .ap-bars > div {
    display: grid;
    grid-template-columns: minmax(9rem, 34%) 1fr 3rem;
    align-items: center;
    gap: 0.8rem;
  }
  #deck .ap-bars b { color: var(--pp-ink); font-weight: 500; text-align: left; }
  #deck .ap-bars i {
    display: block;
    height: 0.9em;
    width: calc(var(--n) / var(--of) * 100%);
    min-width: 2px;
    background: var(--pp-amber);
    border-radius: 2px;
  }
  #deck .ap-bars i.is-low { background: var(--pp-silicon); }
  #deck .ap-bars span { color: var(--pp-dim); font-variant-numeric: tabular-nums; text-align: right; }
  #deck .ap-ladder {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(0.4rem, 1.2vh, 0.8rem);
    text-align: left;
    font-size: clamp(0.8rem, 1.05vw, 1.15rem);
  }
  #deck .ap-ladder li {
    border-left: 2px solid var(--pp-amber);
    padding: 0.2em 0 0.2em 0.8em;
  }
  #deck .ap-ladder li:nth-child(2) { margin-left: 1.2rem; }
  #deck .ap-ladder li:nth-child(3) { margin-left: 2.4rem; }
  #deck .ap-ladder li:nth-child(4) { margin-left: 3.6rem; }
  #deck .ap-ladder li:nth-child(5) { margin-left: 4.8rem; }
  #deck .ap-ladder b { display: block; color: var(--pp-ink); }
  #deck .ap-ladder span { color: var(--pp-dim); font-size: 0.9em; }
```

- [ ] **Step 4: Visual check, then the approval checkpoint**

Em-dash check as before. Reload and screenshot slides 8 to 10 at 1920×1080. Expected: the bearing bar is a sliver in silicon blue, quantity sets a 2 px line; nothing overflows.

**Checkpoint:** show Daniel the three screenshots and the slide text of slides 8 to 10 verbatim, and ask whether the wording of the findings may stand. Apply his changes before committing.

- [ ] **Step 5: Commit**

```bash
git add src/content/teaching/en/architectural-program-2026-10/deck.mdx
git commit -m "feat(teaching): architectural-program deck, results and the designer defines done

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Slides 11 and 12 (hypothesis, next)

**Files:**
- Modify: `DECK`

**Interfaces:**
- Consumes: `.ap-cols`, `.ap-doc` from Task 4.
- Produces: CSS class `.ap-code`.

- [ ] **Step 1: Insert slides 11 and 12**

```mdx
<Slide>
  <div class="pp-head">
    <h3>Hypothesis · to validate</h3>
    <h2>If the rules are the design, <em>make checking them instant</em></h2>
  </div>
  <div class="ap-cols">
    <pre class="ap-code"><code>{`panel = TimberPanel(length=4.8)
roof  = Hypar(panels, supports=limits.points)

$ check roof
error    bearing: plate 12 is 31 mm off support S2
warning  plate 7: span near the CLT limit
ok       planarity, envelope, coverage`}</code></pre>
    <div class="ap-doc">
      <span class="ap-doc-name">A domain-specific language</span>
      <p>The model is written in the language; the checks live <b>inside</b> it, like Lean's type checker, so the agent gets feedback from a plain command line, no extra software.</p>
      <p>Severities like TypeScript's: <b>errors, warnings, suggestions</b>. Measured rules with variance map onto that gradient.</p>
    </div>
  </div>
  <p class="pp-foot">Illustrative syntax. Whether this beats checking IFC after the fact is the open question.</p>
  <SlideNotes>This is the hypothesis the benchmark points at, not a result. If the architect's work is defining done, then done should be cheap to test while the agent works, not only after the run. The idea: a DSL for timber plate construction where checks are part of the language, the way Lean checks proofs as part of compiling them. Where a check is expensive (structure), a fast surrogate trained on synthetic data can stand in, with a warning that asks for a full FEA in the grey zone; an engineer can override a warning, and the override is logged. Still to validate, against the plain IFC-plus-checker loop this benchmark already runs.</SlideNotes>
</Slide>

<Slide>
  <div class="pp-head">
    <h3>Next</h3>
    <h2>Measure what was not checked</h2>
  </div>
  <div class="ap-doc ap-next">
    <p><b>New measures.</b> IFC literacy per run, BTLx validity against the 2.3.1 schema, fabrication plausibility (minimum part size, bevels at folds, material set).</p>
    <p><b>Skills.</b> An IFC-authoring skill; a note that compas_timber writes BTLx 2.0.0 and how to validate offline.</p>
    <p><b>Runs.</b> Tier 2 to completion and tier 3 from Wednesday 14 October; Codex once its identity check passes.</p>
    <p><b>The DSL question.</b> A first probe of fast in-language checks against the IFC checker.</p>
  </div>
  <SlideNotes>The scheduler is stopped until Wednesday evening, when the weekly allowance resets. The new measures are read-only additions to the results register, so every run done so far gets rescored. The steep-facet classification in the checker (roof plates tilted 45 to 52 degrees counted as wall) is a scoring question to settle before the rescore.</SlideNotes>
</Slide>
```

- [ ] **Step 2: Add the CSS**

```css
  #deck .ap-code {
    margin: 0;
    padding: clamp(0.8rem, 2vh, 1.4rem) clamp(1rem, 1.6vw, 1.6rem);
    background: #090806;
    border: 1px solid color-mix(in srgb, var(--pp-dim) 25%, transparent);
    border-radius: 0.4rem;
    font-size: clamp(0.7rem, 0.95vw, 1.05rem);
    line-height: 1.55;
    color: var(--pp-ink);
    text-align: left;
    white-space: pre;
    overflow: hidden;
  }
  #deck .ap-next { width: min(70%, 70rem); margin: clamp(1rem, 3vh, 2rem) auto 0; font-size: clamp(0.9rem, 1.2vw, 1.3rem); }
```

- [ ] **Step 3: Em-dash and visual check**

`grep -n "—" DECK; echo "exit $?"` → `exit 1`. Screenshot slides 11 and 12 at 1920×1080 and 1280×720. Expected: the code block does not clip its longest line at 1280×720; if it does, lower the `.ap-code` font clamp minimum to `0.62rem`.

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching/en/architectural-program-2026-10/deck.mdx
git commit -m "feat(teaching): architectural-program deck, DSL hypothesis and next steps

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Verify

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full build**

Run: `cd WEB && pnpm build 2>&1 | tail -20`
Expected: `astro check` with 0 errors, build completes, and `dist` contains `teaching/architectural-program-2026-10/deck/index.html`:

```bash
find dist -path "*architectural-program-2026-10*" -name "*.html" | head
```

- [ ] **Step 2: Unlisted checks**

```bash
ls src/content/teaching/*/architectural-program-2026-10* -d
grep -c "architectural-program" dist/client/sitemap*.xml 2>/dev/null || grep -rc "architectural-program" dist/sitemap*.xml
grep -o 'noindex' $(find dist -path "*architectural-program-2026-10/deck/index.html") | head -1
```

Expected: only `src/content/teaching/en/architectural-program-2026-10`; sitemap count 0; `noindex` present.

- [ ] **Step 3: Click through all 12 slides in the dev server**

Screenshot each slide at 1920×1080; check speaker notes open (the deck's notes key) on two slides. Expected: 12 slides, no overflow, no broken images.

- [ ] **Step 4: Wrap-up questions to Daniel**

- The site itself did not change beyond a new unlisted deck and a component prop, so `portfolio-website.md` stays as it is.
- Ask whether to run `/sync-knowledge` (content under `teaching/` changed). Do not push or deploy without his say.
