# DOKwood pages: one project hub, two research spokes

Date: 2026-08-20

## Goal

Publish the work Daniel did at Hochschule München (Feb 2025 to Jun 2026) on the DOKwood project as three cross-linked content pages, in all three locales, with the source reports summarised openly (partners named, figures and workflow details reused).

## Pages

| Page | Collection / slug | Cover | Role |
|---|---|---|---|
| DOKwood | `projects/dokwood.md` | `dokwood-buildup.png` platform screenshot (layer-structure view) | Hub: intro plus one paragraph per development |
| Standards for timber construction specifications | `research/timber-construction-standards.md` | Figure 3 (CPR-2024 timeframe), `CoverFit: contain` | Spoke: WP 1.2 standards review |
| DOKwood bSDD data dictionary | `research/dokwood-bsdd-data-dictionary.md` | Redrawn ISO 23387 two-plane SVG, `CoverFit: contain` | Spoke: WP 06 dictionary |

Sources (read-only, outside the repo):

- `C:\Users\nunesd\My Drive\gitlab.ti.bfh.ch_2026-06\01-2-standards\{report.md,annexes.md,images/}`
- `C:\Users\nunesd\My Drive\gitlab.ti.bfh.ch_2026-06\02-1-digital-interfaces-bsdd\{REPORT.md,README.md,docs/}`
- `...\02-2-digital-interfaces-revit\REPORT.md`, `...\02-3-digital-interfaces-cadwork\REPORT.md`, `...\02-4-digital-interfaces-mcp\REPORT.md`
- `...\02-2-digital-interfaces-revit\docs\proposal-assets\assets\DOKwood_Logo-big.png`
- `C:\repos\gitlab\daniellocatelli\paper_dokwood-dms\images\dokwood-buildup.png` and the paper draft for intro framing

## Frontmatter

Follow existing patterns. Common fields: `Name`, `Cover`, `CoverAlt`, `Description`, `Tags`, `Organization: Munich University of Applied Sciences`, `City: [Munich]`, `Country`, `DateStart: "2025-02-01"`, `DateEnd: "2026-06-30"`, `Authors: [Daniel Nunes Locatelli]`, `Link`.

- Project page `Link`: HM project page (same URL as the Research Associate experience entry). `Category: Software Development`. `OtherLinks`: the two research pages.
- Standards page `Link`: the DOKwood project page. Tags: Standards, Timber construction, Digital Product Passport.
- bSDD page `Link`: `https://identifier.buildingsmart.org/uri/hm/dokwood/0.13`. `OtherLinks`: DOKwood project page. Tags: bSDD, ISO 23387, Data templates, Timber construction.

## Body content

### DOKwood (about 500 words)

1. Intro: IraSME project funded by ZIM (Germany) and Innosuisse (Switzerland); consortium of Hochschule München, Berner Fachhochschule, Gumpp & Maier, Schärholzbau; SaaS platform for defining, verifying, versioning and exchanging multilayer timber buildups from early design through tender, execution and as-built documentation; Daniel's role as research associate.
2. Hub diagram (SVG): platform in the centre, bSDD as the vocabulary layer, Revit / Cadwork / MCP as interfaces, standards as the foundation.
3. Five sections, one paragraph each:
   - Standards review (WP 1.2), links to the standards page.
   - bSDD dictionary (WP 06), links to the bSDD page.
   - Revit add-in (WP 6.1, Gumpp & Maier): C#/.NET 8, Revit 2026, imports bSDD v0.13 buildups as System Family Types through the CompoundStructure API; the partner's Revit template to GAEB to Nevaris cost pipeline and the material-name alignment constraint.
   - Cadwork plugin (WP 6.2, Schärholzbau): Python 3.12 on cwapi3d, material-catalogue sync plus part tagging and validation; pivot after learning the partner models buildups part by part.
   - MCP server proposal (WP 6.4): thin stateless adapter over the GraphQL API, one universal interface instead of N ERP connectors; proposal stage.
4. Logo inline near the intro.

### Standards research page (about 700 words)

Abstract-level summary of `report.md`: scope and organisations (ISO/IEC, GS1, CEN, DIN, SIA, KBOB, Austrian level); method (ICS-based systematic identification, application and process baseline review, terminology mapping); standards by domain (materials and products; structural and fire design; buildup physics: fire, acoustic, thermal/hygrothermal; technical drawings; digitalisation: BIM, ISO 12006-3 / 23386 / 23387, DPP and CPR-2024); findings and the proposed internal vocabulary. Reuse the 6 PNG figures with captions. Closing paragraph bridges to the bSDD page.

### bSDD research page (about 800 words)

What bSDD is; the `hm/dokwood` dictionary lineage v0.1 to v0.13 (Excel authoring, buildingSMART `Excel2bSDD_converter.py`, per-version `build-v{n}.py`); v0.13 figures (32 classes, 129 properties); ISO 23387 model (System Data Template, Product Data Template, HasPart, Groups of Properties); v0.12 Revit and v0.13 Cadwork property surfaces; v0.14 decisions (one class per IFC entity, Environment model, Document and Project classes) and the core-plus-tenant-catalog pivot; DPP readiness (CPR-2024, JSON-LD per CIRPASS-2). Two SVGs: two-plane ISO/bSDD architecture; PDT/SDT composition with requirement sheet and data sheet.

## Assets

- Covers must live under `src/assets/content/...` (the subpage layout resolves them through `import.meta.glob`; a `public/` path only feeds meta tags). Inline SVG diagrams live in `public/assets/content/...` and are referenced by absolute path; inline rasters live in `src/assets/` and are referenced relatively.
- `src/assets/content/projects/dokwood/`: `dokwood-cover.png` (platform screenshot), `dokwood-logo-dark.png` (logo inverted for the dark theme), `generate-architecture.mjs` writing `public/.../dokwood-architecture.svg`.
- `src/assets/content/research/timber-construction-standards/`: the 6 report figures in kebab-case plus `generate-cover.mjs` writing the SVG cover.
- `src/assets/content/research/dokwood-bsdd-data-dictionary/`: `generate-two-plane.mjs` (SVG cover, written next to it) and `generate-data-templates.mjs` (writes `public/.../data-templates.svg`).
- Generators share `src/assets/content/svg-kit.mjs` and follow the site's dark zinc style (the site is dark-only).

## Other changes

- Research Associate experience entry (3 locales): add a link to the DOKwood project page in the bullets.
- Run `/sync-knowledge` after content lands.
- No change to `portfolio-website.md` (no site feature change).

## Constraints

- Content rules from CLAUDE.md: headings start at h2, no em dashes, all three locales, translatable fields localised, structural fields in sync.
- Verification: `pnpm build` passes; the three pages render with covers and images in each locale.
