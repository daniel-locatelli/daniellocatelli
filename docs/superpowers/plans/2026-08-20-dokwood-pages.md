# DOKwood Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one `projects/dokwood` hub page and two research spokes (`timber-construction-standards`, `dokwood-bsdd-data-dictionary`) in en, pt and de, with figures and three generated SVG diagrams.

**Architecture:** Pure content work in Astro content collections. Raster figures live in `src/assets/content/...` and are referenced relatively from markdown; covers and SVG diagrams live in `public/assets/content/...` and are referenced by absolute `/assets/...` path (same split as the `agent-skills` research page). Diagrams are produced by small Node scripts kept next to the assets (`generate-*.mjs`), matching the existing dark zinc style.

**Tech Stack:** Astro 6 content collections, Markdown, Node (for SVG generators), pnpm.

## Global Constraints

- Headings in content bodies start at `##`; never `#`.
- No em dashes (`—`) anywhere in content text.
- Every content file exists in `en/`, `pt/`, `de/`; translatable fields localised, structural fields (Link, DateStart, DateEnd, Cover path, CoverFit) identical.
- Organization field: en `Munich University of Applied Sciences`, pt `Universidade de Ciências Aplicadas de Munique`, de `Hochschule München` (matches `experiences/*/research-associate.md`).
- Source material (read-only): `C:\Users\nunesd\My Drive\gitlab.ti.bfh.ch_2026-06\` (folders `01-2-standards`, `02-1-digital-interfaces-bsdd`, `02-2-digital-interfaces-revit`, `02-3-digital-interfaces-cadwork`, `02-4-digital-interfaces-mcp`), `C:\repos\gitlab\daniellocatelli\paper_dokwood-dms\images\dokwood-buildup.png`.
- Internal links: en pages link `/projects/dokwood`, `/research/...`; pt and de pages prefix `/pt/` and `/de/`.
- Dates: `DateStart: "2025-02-01"`, `DateEnd: "2026-06-30"` on all three pages.

---

### Task 1: Copy raster assets

**Files:**
- Create: `src/assets/content/projects/dokwood/dokwood-logo.png`
- Create: `public/assets/content/projects/dokwood/dokwood-cover.png`
- Create: `src/assets/content/research/timber-construction-standards/figure-1-german-standard-designation.png` (and figures 2 to 6, same kebab pattern)
- Create: `public/assets/content/research/timber-construction-standards/timber-construction-standards-cover.png` (copy of figure 3)

- [ ] **Step 1: Copy files** (PowerShell)

```powershell
$src = "C:\Users\nunesd\My Drive\gitlab.ti.bfh.ch_2026-06"
New-Item -ItemType Directory -Force src\assets\content\projects\dokwood, public\assets\content\projects\dokwood, src\assets\content\research\timber-construction-standards, public\assets\content\research\timber-construction-standards, public\assets\content\research\dokwood-bsdd-data-dictionary, src\assets\content\research\dokwood-bsdd-data-dictionary | Out-Null
Copy-Item "$src\02-2-digital-interfaces-revit\docs\proposal-assets\assets\DOKwood_Logo-big.png" src\assets\content\projects\dokwood\dokwood-logo.png
Copy-Item "C:\repos\gitlab\daniellocatelli\paper_dokwood-dms\images\dokwood-buildup.png" public\assets\content\projects\dokwood\dokwood-cover.png
Get-ChildItem "$src\01-2-standards\images\*.png" | ForEach-Object { Copy-Item $_.FullName ("src\assets\content\research\timber-construction-standards\" + ($_.Name -replace '_','-')) }
Copy-Item "$src\01-2-standards\images\figure_3_cpr_2024_timeframe.png" public\assets\content\research\timber-construction-standards\timber-construction-standards-cover.png
```

- [ ] **Step 2: Verify** `Get-ChildItem -Recurse src\assets\content\research\timber-construction-standards` lists 6 PNGs.
- [ ] **Step 3: Commit** `git add src/assets public/assets && git commit -m "assets(dokwood): figures, logo and covers for the DOKwood pages"`

### Task 2: Generate the three SVG diagrams

**Files:**
- Create: `src/assets/content/projects/dokwood/generate-architecture.mjs` writing `public/assets/content/projects/dokwood/dokwood-architecture.svg`
- Create: `src/assets/content/research/dokwood-bsdd-data-dictionary/generate-two-plane.mjs` writing `public/assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg` (also the page cover)
- Create: `src/assets/content/research/dokwood-bsdd-data-dictionary/generate-data-templates.mjs` writing `public/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg`

Style (copy from `src/assets/content/research/agent-skills/generate-diagram.mjs`): `viewBox 0 0 1600 H`, background `#000000`, boxes `fill #18181b stroke #f4f4f5 1.5`, group frames `rgba(244,244,245,0.02)` fill and `rgba(244,244,245,0.10)` stroke, labels mono `#71717a` with `letter-spacing 0.16em`, body text `#f4f4f5` sans, arrows `#a1a1aa`. Each SVG carries `<title>` with a one-sentence description.

- [ ] **Step 1: Architecture diagram.** Content: bottom band "STANDARDS" (ISO 12006-3, ISO 23386, ISO 23387, EN/DIN/SIA, CPR-2024 DPP); above it "bSDD hm/dokwood" vocabulary box; centre "DOKwood platform" box (GraphQL API, buildups / layers / products); right column three interface boxes (Revit add-in, Cadwork plugin, MCP server) with arrows from the platform; partners as small mono labels under Revit (Gumpp & Maier) and Cadwork (Schärholzbau).
- [ ] **Step 2: Two-plane diagram.** Plane 1 "bSDD (public)": classes Buildup / Wall / Roof / Slab, Product, Groups of Properties, Properties. Plane 2 "DOKwood platform (tenant)": System Data Template, Product Data Template, Requirement sheet, Data sheet, with "references" arrows from plane 2 to plane 1 and HasPart between SDT and PDT.
- [ ] **Step 3: Data templates diagram.** Left to right: PDT (product properties) and SDT (layers HasPart products) feed a Requirement sheet (required values) which, once the buildup is specified and verified, becomes a Data sheet (actual values), annotated "JSON-LD, DPP-ready".
- [ ] **Step 4: Run** `node <each script>` and open the SVGs (Read tool) to check layout.
- [ ] **Step 5: Commit** `git commit -m "assets(dokwood): generated architecture, ISO 23387 and data-template diagrams"`

### Task 3: DOKwood project page (en, pt, de)

**Files:**
- Create: `src/content/projects/en/dokwood.md`, `src/content/projects/pt/dokwood.md`, `src/content/projects/de/dokwood.md`

Frontmatter (en; localise Name/CoverAlt/Description/Tags/City/Country/Organization/Link.Text/OtherLinks.Text in pt and de):

```yaml
---
Cover: /assets/content/projects/dokwood/dokwood-cover.png
CoverAlt: "Layer-structure view of a 320 mm timber wall buildup in the DOKwood platform: seven layers, section drawing and table."
CoverFit: contain
Description: "DOKwood is a web platform for defining, verifying, versioning and exchanging multilayer timber buildups. As research associate at Hochschule München I worked on its standards foundation, its bSDD data dictionary, and its Revit, Cadwork and MCP interfaces."
Name: DOKwood
Tags:
  - Timber construction
  - Software Development
  - BIM
Category: Software Development
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Team:
  - Daniel Nunes Locatelli
Link:
  Text: DOKwood at Hochschule München
  Href: https://hm.edu/forschungsprojekte_de/forschungsprojekt_detail_9856.de.html
OtherLinks:
  - Text: Standards for timber construction specifications
    Href: /research/timber-construction-standards
  - Text: DOKwood bSDD data dictionary
    Href: /research/dokwood-bsdd-data-dictionary
---
```

Body outline (about 500 words): intro paragraph (IraSME project, ZIM + Innosuisse, HM + BFH + Gumpp & Maier + Schärholzbau, what the platform does, buildup as the decision carrier across tender, planning, execution, as-built); logo image inline (`![DOKwood logo](../../../assets/content/projects/dokwood/dokwood-logo.png)`); architecture SVG; `## Standards review`, `## bSDD data dictionary`, `## Revit add-in`, `## Cadwork plugin`, `## MCP server proposal`, each one paragraph with the facts listed in the spec and links to the research pages from the first two.

- [ ] **Step 1: Write en.** 
- [ ] **Step 2: Write pt and de** as faithful translations (not summaries); keep links locale-prefixed.
- [ ] **Step 3: Check** `grep -n "—" src/content/projects/*/dokwood.md` returns nothing; `grep -n "^# " ...` returns nothing.
- [ ] **Step 4: Commit** `git commit -m "content(projects): DOKwood hub page in en, pt, de"`

### Task 4: Standards research page (en, pt, de)

**Files:**
- Create: `src/content/research/{en,pt,de}/timber-construction-standards.md`

Frontmatter (en):

```yaml
---
Cover: /assets/content/research/timber-construction-standards/timber-construction-standards-cover.png
CoverAlt: "Timeline of the 2024 Construction Products Regulation: transition from CPR 2011 to CPR 2024 and the digital product passport."
CoverFit: contain
Description: "A systematic review of the ISO, CEN, DIN, SIA, KBOB and GS1 standards that govern how materials and multilayer buildups are specified in timber construction, from fire and building physics to BIM data templates and the digital product passport. Work package 1.2 of the DOKwood project."
Name: Standards for timber construction specifications
Tags:
  - Standards
  - Timber construction
  - Digital Product Passport
Authors:
  - Daniel Nunes Locatelli
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: DOKwood project page
  Href: /projects/dokwood
---
```

Body outline (about 700 words, from `01-2-standards/report.md`): `## Why a standards review`, `## Method` (ICS catalogues, application and process baseline, keyword families, regional regulations), `## Organisations` (ISO/IEC, GS1, CEN and harmonised standards, DIN, SIA/KBOB, ÖNORM) with figures 1 and 2 (German and Swiss designations), `## Standards by domain` (materials and products; structural and fire design; buildup physics; technical drawings; digitalisation: BIM, ISO 12006-3/23386/23387, DPP with figures 3 to 6), `## Findings` (terminology mapping, proposed internal vocabulary, CPR-2024 timeline), closing link to the bSDD page. Figures referenced as `../../../assets/content/research/timber-construction-standards/figure-N-....png`.

- [ ] **Step 1: Write en.** Read `report.md` sections named above for facts; paraphrase, do not copy.
- [ ] **Step 2: Write pt and de.**
- [ ] **Step 3: Check** em dash and h1 greps as in Task 3.
- [ ] **Step 4: Commit** `git commit -m "content(research): timber construction standards review (DOKwood WP 1.2)"`

### Task 5: bSDD research page (en, pt, de)

**Files:**
- Create: `src/content/research/{en,pt,de}/dokwood-bsdd-data-dictionary.md`

Frontmatter (en):

```yaml
---
Cover: /assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg
CoverAlt: "Two planes: the public bSDD dictionary with classes and properties above, the DOKwood platform with data templates, requirement sheets and data sheets below."
CoverFit: contain
Description: "The hm/dokwood buildingSMART Data Dictionary: a versioned, machine-readable vocabulary for timber buildups and products, built on ISO 23387 data templates, published through bSDD, and designed as the semantic backbone for DOKwood's Revit, Cadwork and MCP interfaces and a future digital product passport."
Name: DOKwood bSDD data dictionary
Tags:
  - bSDD
  - ISO 23387
  - Data templates
  - Timber construction
Authors:
  - Daniel Nunes Locatelli
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood on buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: DOKwood project page
    Href: /projects/dokwood
---
```

Body outline (about 800 words, from `02-1-digital-interfaces-bsdd/REPORT.md`, `README.md`, `docs/iso-23387_mermaid-diagrams.md`, `docs/dpp-readiness.md`): `## What bSDD is and why DOKwood needs it`, `## The hm/dokwood dictionary` (v0.1 to v0.13, Excel to JSON pipeline, build scripts as change logs, v0.13 numbers), `## ISO 23387 data templates` with two-plane and data-templates SVGs, `## Serving the interfaces` (v0.12 Revit surface, v0.13 Cadwork surface, groups of properties), `## Where it goes next` (v0.14 decisions, core plus tenant catalogs, DPP and JSON-LD). SVGs referenced by absolute `/assets/...` path.

- [ ] **Step 1: Write en.**
- [ ] **Step 2: Write pt and de.**
- [ ] **Step 3: Check** em dash and h1 greps.
- [ ] **Step 4: Commit** `git commit -m "content(research): DOKwood bSDD data dictionary page"`

### Task 6: Link the experience entry

**Files:**
- Modify: `src/content/experiences/{en,pt,de}/research-associate.md`

- [ ] **Step 1:** Prepend a bullet in each locale linking to the project page, e.g. en: `- Research associate on the [DOKwood](/projects/dokwood) project: a web platform for documenting multilayer timber buildups.` (pt/de translated, locale-prefixed link).
- [ ] **Step 2: Commit** `git commit -m "content(experiences): link the research associate entry to the DOKwood page"`

### Task 7: Verify, sync, finish

- [ ] **Step 1:** `pnpm build` passes (type check + build).
- [ ] **Step 2:** `pnpm preview` (or `pnpm dev`) and open `/projects/dokwood`, `/research/timber-construction-standards`, `/research/dokwood-bsdd-data-dictionary` plus `/pt/...` and `/de/...`; confirm covers, inline images and SVGs render and links resolve.
- [ ] **Step 3:** Run `/sync-knowledge`.
- [ ] **Step 4:** Final commit of anything left; report.
