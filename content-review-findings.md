# Content Review: Live Site vs Repository

**Date:** 2026-03-12
**Live site:** https://daniellocatelli.com
**Branch:** `content-and-ui-updates` (same commit as `main`: `79752c1`)

## Summary

The live site and repository are **fully in sync** — both are at the same commit. All published content matches exactly. The only "non-live" content consists of **18 draft files** (underscore-prefixed) that Astro correctly excludes from the build.

---

## Missing Videos — Notion to Astro Migration

All videos from the Notion CMS were lost during the migration to Astro Content Collections.
None of the markdown files currently contain video embeds.

### Video Inventory

All 12 self-hosted videos have been copied from UUID directories to human-readable paths in `public/media/`.
The old UUID directories can be safely deleted.

#### Projects

**Radom Raisting by AR Ingenieure**
- Markdown: `src/content/projects/{locale}/radom-raisting-by-ar-ingenieure.md`
- Video: `/media/projects/radom-raisting-by-ar-ingenieure/deployment-sequence.mp4`
- Caption: "Deployment animation — scaffolding, inflatables around antenna, crane lifting and deploying the membrane, membrane inflating."
- Position in Notion: First content block (before text)
- Old UUID path: `public/media/4aedc02e-1b31-4cb9-902a-fe1544fa6359/`

**Life Lamp by Estúdio Guto Requena for Decimal**
- Markdown: `src/content/projects/{locale}/life-lamp-by-estudio-guto-requena-for-decimal.md`
- Video: `/media/projects/life-lamp-by-estudio-guto-requena-for-decimal/agent-based-system.webm`
- Caption: "Agent-based system controlled by three heart models and three real heart-beats."
- Position in Notion: First content block (before Concept heading)
- Old UUID path: `public/media/53fc712b-6483-4f1f-a4a5-b52e1d37450f/`

**O3 Pavilion by Atelier Marko Brajovic for Docol**
- Markdown: `src/content/projects/{locale}/o3-pavilion-by-atelier-marko-brajovic-for-docol.md`
- YouTube: `https://www.youtube.com/watch?v=MI3apyOKecs`
- Position in Notion: First content block (before text)

**Air Guitar by Atelier Marko Brajovic for Nike**
- Markdown: `src/content/projects/{locale}/air-guitar-by-atelier-marko-brajovic-for-nike.md`
- YouTube: `https://youtu.be/KucCxUmOM1o`
- Position in Notion: First content block (before text)
- Video: `/media/projects/air-guitar-by-atelier-marko-brajovic-for-nike/first-pickup-test.mp4`
- Caption: "First test: checking if a pickup would capture the steel cable vibration."
- Position in Notion: After "Development" section text, before "Interactivity" heading
- Old UUID path: `public/media/0defd699-4448-41d1-b45f-c7e485760ea4/`

#### Research

**Differential Growth in Corals**
- Markdown: `src/content/research/{locale}/differential-growth-in-corals.md`
- Video 1: `/media/research/differential-growth-in-corals/differential-growth.mp4`
- Caption: "Differential growth in action."
- Position in Notion: First content block (before text)
- Old UUID path: `public/media/ea987659-410b-4a7b-9174-b426bcab6e04/`
- Video 2: `/media/research/differential-growth-in-corals/morphogenetic_-design-system_720p.mp4`
- Caption: "A canopy generated using the complete morphogenetic design system."
- Position in Notion: After donut studies images, before team photo
- Old UUID path: `public/media/6768ec5f-23f3-4be0-9ff5-28169003dfcb/`

**Bending-active Bamboo**
- Markdown: `src/content/research/{locale}/bending-active-bamboo.md`
- Video: `/media/research/bending-active-bamboo/form-finding.mp4`
- Caption: "Video of the form-finding process."
- Position in Notion: First content block (before text)
- Old UUID path: `public/media/c68aa2c1-1cb6-4002-8018-c63d7c3d0798/`

#### Publications

**High-Low as Expression of The Brazilian Digital Fabrication**
- Markdown: `src/content/publications/{locale}/high-low-as-expression-of-the-brazilian-digital-fabrication.md`
- Video 1: `/media/publications/high-low-as-expression-of-the-brazilian-digital-fabrication/o3-pavilion-kangaroo-relaxation.mp4`
- Caption: "Parametric model after Kangaroo relaxation."
- Position in Notion: After grasshopper script image, before "removing cells" image
- Old UUID path: `public/media/7bef2fe9-0450-4585-b5cb-3c02aaa717dd/`
- Video 2: `/media/publications/high-low-as-expression-of-the-brazilian-digital-fabrication/o3-pavilion-assembly-sequence.mp4`
- Caption: "Panel assembly sequence."
- Position in Notion: After "removing cells" image, before "phases of construction" image
- Old UUID path: `public/media/aa7659db-38c0-4349-a62b-0be63e42b0fd/`

**Life Lamp: Connecting Design and People Through Emotion**
- Markdown: `src/content/publications/{locale}/life-lamp-connecting-design-and-people-through-emotion.md`
- Video 1: `/media/publications/life-lamp-connecting-design-and-people-through-emotion/life-lamp-animation-01.mp4`
- Caption: "Agents creating the structure using the heartbeat of a preborn."
- Position in Notion: After introductory text
- Old UUID path: `public/media/1547bf50-54ee-43b2-9e06-cabefa8c4e55/`
- Video 2: `/media/publications/life-lamp-connecting-design-and-people-through-emotion/life-lamp-animation-02.mp4`
- Caption: "Intermediate step: connecting the preborn shape with the adult shape."
- Position in Notion: After video 1
- Old UUID path: `public/media/6dfcb5af-d32d-404a-ac0e-5a22c77f2c6e/`
- Video 3: `/media/publications/life-lamp-connecting-design-and-people-through-emotion/life-lamp-animation-03.mp4`
- Caption: "Agents creating the structure using the heartbeat of an adult."
- Position in Notion: After video 2, before workflow diagram image
- Old UUID path: `public/media/444e351c-2f90-4b86-a6f3-8131525db66a/`

**Automatic Column Placement**
- Markdown: `src/content/publications/{locale}/automatic-column-placement.md`
- Video: `/media/publications/automatic-column-placement/parcticle-spring-system-column-placement.mp4`
- Caption: (none in Notion)
- Position in Notion: After description text, before first image
- Old UUID path: `public/media/9cdadb19-3d0f-4f78-9b18-2338e09bad08/`

### UUID Directories to Delete

These 12 directories contain the original videos and can be deleted now that copies exist in human-readable paths:

```
public/media/0defd699-4448-41d1-b45f-c7e485760ea4/
public/media/1547bf50-54ee-43b2-9e06-cabefa8c4e55/
public/media/444e351c-2f90-4b86-a6f3-8131525db66a/
public/media/4aedc02e-1b31-4cb9-902a-fe1544fa6359/
public/media/53fc712b-6483-4f1f-a4a5-b52e1d37450f/
public/media/6768ec5f-23f3-4be0-9ff5-28169003dfcb/
public/media/6dfcb5af-d32d-404a-ac0e-5a22c77f2c6e/
public/media/7bef2fe9-0450-4585-b5cb-3c02aaa717dd/
public/media/9cdadb19-3d0f-4f78-9b18-2338e09bad08/
public/media/aa7659db-38c0-4349-a62b-0be63e42b0fd/
public/media/c68aa2c1-1cb6-4002-8018-c63d7c3d0798/
public/media/ea987659-410b-4a7b-9174-b426bcab6e04/
```

### Next Steps

1. ~~Document missing videos~~ (this file)
2. ~~Move self-hosted videos to human-readable paths~~ (already done)
3. Delete UUID directories listed above
4. Add `<video>` embeds back into the markdown files (all locales: en, pt, de)
5. Add YouTube iframe embeds for O3 Pavilion and Air Guitar
6. Build and test: `npm run build`

---

## Published Content (Live)

### Projects — 12 items live

| # | Title | File |
|---|-------|------|
| 1 | BuildSystems plugin for Grasshopper | `buildsystems-plugin-for-grasshopper.md` |
| 2 | KfW Funding Calculator by BuildSystems | `kfw-funding-calculator-by-buildsystems.md` |
| 3 | BuildSystems Website | `buildsystems-website.md` |
| 4 | Breathing earth sphere by ArtEngineering for Olafur Eliasson | `breathing-earth-sphere-by-artengineering-for-olafur-eliasson.md` |
| 5 | Common Sky by ArtEngineering for Studio Other Spaces | `common-sky-by-artengineering-for-studio-other-spaces.md` |
| 6 | Canyon by ArtEngineering for Katharina Grosse | `canyon-by-artengineering-for-katharina-grosse.md` |
| 7 | Radom Raisting by AR Ingenieure | `radom-raisting-by-ar-ingenieure.md` |
| 8 | ICD Research Assistant as Computational Designer | `icd-research-assistant-as-computational-designer.md` |
| 9 | Life Lamp by Estudio Guto Requena for Decimal | `life-lamp-by-estudio-guto-requena-for-decimal.md` |
| 10 | Air Guitar by Atelier Marko Brajovic for Nike | `air-guitar-by-atelier-marko-brajovic-for-nike.md` |
| 11 | O3 Pavilion by Atelier Marko Brajovic for Docol | `o3-pavilion-by-atelier-marko-brajovic-for-docol.md` |
| 12 | Parada Coca-Cola by Atelier Marko Brajovic | `parada-coca-cola-by-atelier-marko-brajovic.md` |

### Research — 10 items live (5 research + 5 publications)

The `/research/` page aggregates both the `research` and `publications` collections (defined in `DATABASE_MAPPING` in `[...page].astro`).

| # | Title | Collection | File |
|---|-------|------------|------|
| 1 | Building Across Scales | research | `building-across-scales.md` |
| 2 | Automatic Column Placement | publications | `automatic-column-placement.md` |
| 3 | Acropora Pavilion | research | `acropora-pavilion.md` |
| 4 | Bending-active Bamboo | research | `bending-active-bamboo.md` |
| 5 | Differential growth in corals | research | `differential-growth-in-corals.md` |
| 6 | Life Lamp: Connecting Design and People Through Emotion | publications | `life-lamp-connecting-design-and-people-through-emotion.md` |
| 7 | Computational Design Strategies | publications | `computational-design-strategies.md` |
| 8 | High-Low as Expression of the Brazilian Digital Fabrication | publications | `high-low-as-expression-of-the-brazilian-digital-fabrication.md` |
| 9 | Algorithmic Design for Traditional Bobbin Lace Methods | publications | `algorithmic-design-for-traditional-bobbin-lace-methods.md` |
| 10 | Architecture + Biomimicry + Algorithm | research | `architecture-biomimicry-algorithm.md` |

### Teaching — 7 items live

| # | Title | File |
|---|-------|------|
| 1 | Feasibility of sustainable construction by BuildSystems at Siemens | `feasibility-of-sustainable-construction-by-buildsystems-at-siemens.md` |
| 2 | Nature and Digital at PUC | `nature-and-digital-reproducing-natural-processes-with-computational-design-at-puc.md` |
| 3 | Architecture + Biomimicry + Algorithm at IFRO | `architecture-biomimicry-algorithm-at-ifro.md` |
| 4 | Models byNature 1.0 | `models-bynature-10.md` |
| 5 | Parametric Design Inspired by Nature at Semana Design Rio | `parametric-design-inspired-by-nature-at-semana-design-rio.md` |
| 6 | Adaptive Grasshopper Workshop | `adaptive-grasshopper-workshop.md` |
| 7 | A Decade After UNEMAT | `a-decade-after-unemat.md` |

### Other Live Pages

- **CV** (`/cv/`) — compact one-page CV
- **Full CV** (`/full-cv/`) — extended CV with all details
- **Privacy Policy** (`/privacy-policy/`)
- **Terms and Conditions** (`/terms-and-conditions/`)
- **Impressum** (`/impressum/`)
- **CS50 Cover** (`/cs50-cover/`)
- **CS50 SQL Cover** (`/cs50-sql-cover/`)

### Skills — 36 items (English only, used in CV pages)

Programming, frameworks, databases, design tools, and languages.

---

## Draft Content (NOT Live)

These files use the underscore prefix (`_filename.md`) convention and are excluded by Astro's content collection system.

### Draft Projects — 3 items

| # | File | Likely Title |
|---|------|-------------|
| 1 | `_icd-research-assistant-for-coreless-filament-winding.md` | ICD Research Assistant for Coreless Filament Winding |
| 2 | `_icd-research-assistant-in-web-development.md` | ICD Research Assistant in Web Development |
| 3 | `_itke-research-assistant-for-coreless-filament-winding.md` | ITKE Research Assistant for Coreless Filament Winding |

### Draft Teaching — 15 items

| # | File | Likely Title |
|---|------|-------------|
| 1 | `_architecture-biomimetics-algorithm-at-ied.md` | Architecture Biomimetics Algorithm at IED |
| 2 | `_arquitetura-computacional-na-alemanha-uft.md` | Arquitetura Computacional na Alemanha (UFT) |
| 3 | `_bim-consultant.md` | BIM Consultant |
| 4 | `_biomimetic-geometries.md` | Biomimetic Geometries |
| 5 | `_building-across-scales-at-forum-holzbau.md` | Building Across Scales at Forum Holzbau |
| 6 | `_computational-design-strategies-at-unip.md` | Computational Design Strategies at UNIP |
| 7 | `_digital-futures-talk.md` | Digital Futures Talk |
| 8 | `_emotional-design-and-technology-at-sebrae.md` | Emotional Design and Technology at SEBRAE |
| 9 | `_form-finding-with-grasshopper.md` | Form-finding with Grasshopper |
| 10 | `_graphisoftx2023.md` | GraphisoftX 2023 |
| 11 | `_grasshopper-kangaroo-workshop.md` | Grasshopper Kangaroo Workshop |
| 12 | `_intcdc-masters-thesis-grant-2021.md` | IntCDC Masters Thesis Grant 2021 |
| 13 | `_models-bynature-20.md` | Models byNature 2.0 |
| 14 | `_round-table-debater.md` | Round Table Debater |
| 15 | `_tensegrity-workshop.md` | Tensegrity Workshop |

---

## Localization Status

| Locale | Projects | Research | Publications | Teaching |
|--------|----------|----------|--------------|----------|
| English (en) | 12 published + 3 draft | 5 | 5 | 7 published + 15 draft |
| Portuguese (pt) | 12 published + 3 draft | 5 | 5 | 7 published + 15 draft |
| German (de) | 12 published + 3 draft | 5 | 5 | 7 published + 15 draft |

All three locales have matching content files. The German locale (`/de/`) is defined in routes but the live navigation only shows EN/PT toggle.

---

## Redirects (Computational Design Strategies)

The ~30 computational design strategy pages previously hosted on this site now redirect to `archcompute.com`. These redirects are defined in `astro.config.mts` (lines 46-165).

---

## Conclusion

**No discrepancies found.** The live site accurately reflects the current repository state. The 18 draft items (3 projects + 15 teaching) are correctly hidden from the live site via Astro's underscore-prefix convention.
