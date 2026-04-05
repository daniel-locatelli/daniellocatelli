# Unify CV Content to Collections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Astro content collections the single source of truth for all CV data, removing structured content from the i18n TypeScript files.

**Architecture:** Add missing fields to the shared `pageSchema`, fill gaps in existing content files, rewrite `cv.astro` and `full-cv.astro` to query all sections from collections, and trim `src/i18n/cv/` to UI strings only. The existing helper functions (`extractName`, `extractLink`, `getMonthYear`, `createHtmlId`) remain unchanged.

**Tech Stack:** Astro 5 content collections, Zod schema, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-05-unify-cv-content-to-collections-design.md`

---

## File Map

**Modified files:**
- `src/content/config.ts` — add 5 optional schema fields
- `src/content/skills/en/*.md` (24 files) — add `Order`, fix `Level` discrepancies
- `src/content/experiences/{en,pt,de}/*.md` (27 files) — add `Country`
- `src/content/education/{en,pt,de}/*.md` (12 files) — add `Country`
- `src/content/scholarships/{en,pt,de}/*.md` (6 files) — add `Country`
- `src/content/courses-attended/{en,pt,de}/*.md` (48 files) — add `Country`
- `src/pages/[...locale]/cv.astro` — rewrite data fetching + template
- `src/pages/[...locale]/full-cv.astro` — rewrite data fetching + template
- `src/i18n/cv/types.ts` — trim to UI-only type
- `src/i18n/cv/en.ts` — remove content arrays
- `src/i18n/cv/pt.ts` — remove content arrays
- `src/i18n/cv/de.ts` — remove content arrays

**No new files created.**

---

## Task 1: Add schema fields to `pageSchema`

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Add 5 fields to `pageSchema`**

In `src/content/config.ts`, add these fields inside the `z.object({...})` block, after the existing `Locale` field (line 192):

```typescript
  Locale: z.string().optional(),
  // CV-specific fields
  Order: z.number().optional(),
  ValidUntil: z.string().optional(),
  CredentialID: z.string().optional(),
  Thesis: z.string().optional(),
  Country: z.string().optional(),
```

Note: `Instructor` is NOT needed — the existing `Authors` field already serves this purpose for courses-attended.

Note: `Thesis` was already used in education files but silently stripped by Zod. This makes it official.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors. Existing content files are unaffected since all new fields are optional.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "Add Order, ValidUntil, CredentialID, Thesis, Country to pageSchema"
```

---

## Task 2: Update skills content files — add Order, fix Level

**Files:**
- Modify: all 24 files in `src/content/skills/en/`

The current CV page hardcodes skill ordering as string arrays (e.g., `sortByOrder(["HTML", "CSS", "TypeScript", "Python", "C#"])`). Replace with an `Order` field per skill. Also fix Level values to match the i18n authoritative source — several skills show "Intermediate" in the collection but "Advanced" in the i18n.

- [ ] **Step 1: Update all 24 skill files**

Apply these changes to each file's YAML frontmatter. Files not listed below need no Level fix, only an Order addition.

**Programming** (Category: Programming):
| File | Order | Level fix |
|------|-------|-----------|
| `html.md` | 1 | — (already Advanced) |
| `css.md` | 2 | — (already Advanced) |
| `typescript.md` | 3 | Change to `Advanced` |
| `python.md` | 4 | — (already Intermediate) |
| `c-sharp.md` | 5 | — (already Intermediate) |

**Frameworks** (Category: Framework):
| File | Order | Level fix |
|------|-------|-----------|
| `astro.md` | 1 | Change to `Advanced` |
| `tailwind.md` | 2 | Change to `Advanced` |
| `react.md` | 3 | Change to `Advanced` |
| `tanstack-start.md` | 4 | — (already Intermediate) |
| `flask.md` | 5 | — (already Intermediate) |

**Databases** (Category: Database):
| File | Order | Level fix |
|------|-------|-----------|
| `postgresql.md` | 1 | Change to `Advanced` |
| `mongodb.md` | 2 | — (already Intermediate) |

**Design tools** (Category: Design tool):
| File | Order | Level fix |
|------|-------|-----------|
| `rhino.md` | 1 | — (already Advanced) |
| `grasshopper.md` | 2 | — (already Advanced) |
| `revit.md` | 3 | — (already Advanced) |
| `figma.md` | 4 | — (already Intermediate) |
| `adobe-creative-cloud.md` | 5 | — (already Advanced) |

**Specialization** (Category: Specialization):
| File | Order | Level fix |
|------|-------|-----------|
| `web-development.md` | 1 | — |
| `computational-design.md` | 2 | — |
| `ui-ux-design.md` | 3 | — |
| `digital-fabrication.md` | 4 | — |

**Languages** (Category: Language):
| File | Order | Level fix |
|------|-------|-----------|
| `english.md` | 1 | — (already Fluent) |
| `german.md` | 2 | — (already B1) |
| `portuguese.md` | 3 | Change to `Fluent` (capitalize to match English) |

**Example** — `src/content/skills/en/typescript.md` before:
```yaml
---
Name: TypeScript
Category: Programming
Level: Intermediate
---
```

After:
```yaml
---
Name: TypeScript
Category: Programming
Level: Advanced
Order: 3
---
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/content/skills/
git commit -m "Add Order field and fix Level values in skills content files"
```

---

## Task 3: Add Country to experience files

**Files:**
- Modify: all 27 files in `src/content/experiences/{en,pt,de}/`

Add `Country` field to each file's frontmatter. The Country value is locale-aware (translated).

- [ ] **Step 1: Add Country to all experience files**

**Country values per file (EN / PT / DE):**

| File slug | EN | PT | DE |
|-----------|----|----|-----|
| `research-associate` | Germany | Alemanha | Deutschland |
| `aec-software-engineer-buildsystems-gmbh` | Germany | Alemanha | Deutschland |
| `aec-software-engineer-urban-scale-timber-flugge-funding` | Germany | Alemanha | Deutschland |
| `computational-designer-artengineering-gmbh` | Germany | Alemanha | Deutschland |
| `computational-designer-alfred-rein-ingenieure-gmbh` | Germany | Alemanha | Deutschland |
| `research-assistant` | Germany | Alemanha | Deutschland |
| `computational-designer-atelier-marko-brajovic` | Brazil | Brasil | Brasilien |
| `on-the-job-training` | USA | EUA | USA |
| `graphic-designer` | Brazil | Brasil | Brasilien |

Add `Country: "<value>"` after the `City:` block in each file's frontmatter. Example for `experiences/en/research-associate.md`:

```yaml
---
Name: Research Associate
DateStart: "2025-02"
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
Category: Professional Experience
Link: "https://hm.edu/forschungsprojekte_de/forschungsprojekt_detail_9856.de.html"
---
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/content/experiences/
git commit -m "Add Country field to all experience content files"
```

---

## Task 4: Add Country to education files

**Files:**
- Modify: all 12 files in `src/content/education/{en,pt,de}/`

- [ ] **Step 1: Add Country to all education files**

| File slug | EN | PT | DE |
|-----------|----|----|-----|
| `master-of-sciences` | Germany | Alemanha | Deutschland |
| `bachelor-of-architecture-and-urbanism` | Brazil | Brasil | Brasilien |
| `architecture-exchange-student` | USA | EUA | USA |
| `intensive-english-program` | USA | EUA | USA |

Add `Country: "<value>"` after the `City:` block in each file.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/content/education/
git commit -m "Add Country field to all education content files"
```

---

## Task 5: Add Country to scholarship files

**Files:**
- Modify: all 6 files in `src/content/scholarships/{en,pt,de}/`

- [ ] **Step 1: Add Country to all scholarship files**

| File slug | EN | PT | DE |
|-----------|----|----|-----|
| `intcdc-master-s-thesis-grant-2021` | Germany | Alemanha | Deutschland |
| `science-without-borders` | USA | EUA | USA |

Add `Country: "<value>"` after the `City:` block in each file.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/content/scholarships/
git commit -m "Add Country field to all scholarship content files"
```

---

## Task 6: Add Country to courses-attended files

**Files:**
- Modify: all 48 files in `src/content/courses-attended/{en,pt,de}/`

- [ ] **Step 1: Add Country to all courses-attended files**

| File slug | EN | PT | DE |
|-----------|----|----|-----|
| `cs50-s-introduction-to-databases-with-sql` | — (Online) | — | — |
| `cs50-s-introduction-to-computer-science` | — (Online) | — | — |
| `compas-fofin-workshop` | Germany | Alemanha | Deutschland |
| `intelligence` | — (Online) | — | — |
| `wiki-house-generation-and-digital-material-construction` | Brazil | Brasil | Brasilien |
| `interfacing-architecture-engineering-and-mathematical-optimization` | Germany | Alemanha | Deutschland |
| `parametric-design-with-arduino-and-grasshopper` | Brazil | Brasil | Brasilien |
| `workshop-grasshopper-with-galapagos` | Brazil | Brasil | Brasilien |
| `digital-theremin-with-arduino` | Brazil | Brasil | Brasilien |
| `data-in-the-design-process` | Brazil | Brasil | Brasilien |
| `introduction-to-woodwork` | Brazil | Brasil | Brasilien |
| `arduino-leds` | Brazil | Brasil | Brasilien |
| `electronics-in-the-darkness` | Brazil | Brasil | Brasilien |
| `electronics-basic` | Brazil | Brasil | Brasilien |
| `interactivity-architecture-and-responsive-design` | Brazil | Brasil | Brasilien |
| `fundamentals-of-computation-with-processing` | Brazil | Brasil | Brasilien |

Skip `Country` for entries where `City` is "Online" — leave them without a Country field.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/content/courses-attended/
git commit -m "Add Country field to courses-attended content files"
```

---

## Task 7: Rewrite `cv.astro` — data fetching and template

**Files:**
- Modify: `src/pages/[...locale]/cv.astro`

This is the largest task. The page currently reads experiences, education, scholarships, and certifications from i18n. After this task, ALL sections come from content collections.

**Depends on:** Tasks 1-6 must be complete.

- [ ] **Step 1: Replace imports and data fetching in frontmatter**

Replace the frontmatter section (lines 1-139) with the following. Key changes:
- Remove i18n type imports (`Experience`, `Education`, `Scholarship`, `Certification`)
- Add collection queries for experiences, education, scholarships, certifications
- Replace `sortByOrder` helper with `Order`-based sorting
- Pre-render markdown bodies with `Promise.all` + `entry.render()`

```astro
---
import Base from "@/layouts/Base.astro";
import profilePhoto from "@/assets/avatars/daniel-locatelli-v1.png";
import { Image } from "astro:assets";
import Container from "@/components/Container.astro";
import { Icon } from "astro-icon/components";
import { siteConfig } from "@/config/site";
import type { I18nCV } from "src/i18n/cv/types.ts";
import type { I18nMeta } from "src/i18n/meta/types";
import { createHtmlId, getI18n, getMonthYear } from "src/i18n/utils";
import { getLocale } from "src/lib/routes-helpers";
export { getStaticPaths } from "src/lib/routes-helpers";
import { getCollection } from "astro:content";

const locale = getLocale(Astro.params);

const meta = await getI18n<I18nMeta>("meta", locale);
const cv = await getI18n<I18nCV>("cv", locale);

// Helper to extract name from string | { name: string }
const extractName = (item: any) => {
  if (!item) return "";
  return typeof item === "string" ? item : item.name;
};

// Helper to extract first name from array of string | { name: string }
const extractFirstName = (arr: any) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return extractName(arr[0]);
};

// Helper to extract link from string | array of objects | object
const extractLink = (linkProp: any) => {
  if (!linkProp) return "";
  if (typeof linkProp === "string") return linkProp;
  if (Array.isArray(linkProp)) return linkProp[0]?.Href || "";
  return linkProp.Href || "";
};

// Build location string from City + Country
const buildLocation = (data: any) => {
  const city = extractFirstName(data.City);
  return data.Country ? `${city}, ${data.Country}` : city;
};

// Build thesis link from slug and locale
const buildThesisLink = (thesis: string | undefined) => {
  if (!thesis) return undefined;
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/research/${thesis}`;
};

// --- Fetch all collections ---

// Publications (already from collection)
const publicationsCollection = await getCollection("publications", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const publications = publicationsCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  )
  .map((p) => ({
    title: p.data.Name,
    date: p.data.DateStart || "",
    link: extractLink(p.data.Link),
    publisher: p.data.Place || p.data.Event || "",
    location: extractFirstName(p.data.City),
    authors: p.data.Authors?.map((a: any) => extractName(a)) || [],
  }));

// Teaching (already from collection) — filtered to 2023+
const teachingCollection = await getCollection("teaching", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const engSelected = teachingCollection
  .filter((t) => {
    if (!t.data.DateStart) return false;
    return new Date(t.data.DateStart) >= new Date("2023-01-01");
  })
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  )
  .map((t) => ({
    title: t.data.Name,
    startDate: t.data.DateStart || "",
    endDate: t.data.DateEnd,
    link: extractLink(t.data.Link),
    organization: t.data.Event || t.data.Organization || "",
    location: extractFirstName(t.data.City),
    type: (t.data.Category || "talk").toLowerCase() as any,
    description: t.data.Description,
  }));

// Skills (already from collection) — now sorted by Order field
const skillsCollection = await getCollection("skills", ({ id }) =>
  id.startsWith(`${locale}/`) || id.startsWith("en/"),
);

const sortByOrder = (a: { data: { Order?: number } }, b: { data: { Order?: number } }) =>
  (a.data.Order ?? 999) - (b.data.Order ?? 999);

const skillsProgramming = skillsCollection
  .filter((s) => s.data.Category === "Programming").sort(sortByOrder);
const skillsFrameworks = skillsCollection
  .filter((s) => s.data.Category === "Framework").sort(sortByOrder);
const skillsDatabases = skillsCollection
  .filter((s) => s.data.Category === "Database").sort(sortByOrder);
const skillsDesign = skillsCollection
  .filter((s) => s.data.Category === "Design tool").sort(sortByOrder);
const skillsSpecialized = skillsCollection
  .filter((s) => s.data.Category === "Specialization").sort(sortByOrder)
  .map((s) => s.data.Name);
const skillsLanguages = skillsCollection
  .filter((s) => s.data.Category === "Language").sort(sortByOrder);

// --- NEW: Experiences from collection ---
const experiencesCollection = await getCollection("experiences", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const experiencesFiltered = experiencesCollection
  .filter((e) => new Date(e.data.DateStart || "") >= new Date("2015"))
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );
const experiences = await Promise.all(
  experiencesFiltered.map(async (entry) => ({
    data: entry.data,
    Content: (await entry.render()).Content,
  })),
);

// --- NEW: Education from collection ---
const educationCollection = await getCollection("education", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const educationFiltered = educationCollection
  .filter((e) => {
    if (!e.data.DateEnd) return true;
    return new Date(e.data.DateEnd) >= new Date("2014");
  })
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );
const educationEntries = await Promise.all(
  educationFiltered.map(async (entry) => ({
    data: entry.data,
    Content: (await entry.render()).Content,
  })),
);

// --- NEW: Scholarships from collection ---
const scholarshipsCollection = await getCollection("scholarships", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const scholarships = scholarshipsCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );

// --- NEW: Certifications from collection ---
const certificationsCollection = await getCollection("certifications", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const certifications = certificationsCollection
  .filter((c) => new Date(c.data.DateStart || "") >= new Date("2015"))
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );
---
```

- [ ] **Step 2: Replace the Professional Experience template section**

Find the `<section id={createHtmlId(cv.ui.professionalExperience)}>` section (around lines 293-381). Replace the content inside with:

```astro
    <section
      id={createHtmlId(cv.ui.professionalExperience)}
      class="[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300"
    >
      <h2>{cv.ui.professionalExperience}</h2>
      {
        experiences.map(({ data, Content }, index: number) => {
          const bgClass = index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
          const link = extractLink(data.Link);
          const location = buildLocation(data);

          return (
            <div
              class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
            >
              <div class="timeline-wrapper">
                <div class="timeline-top" />
                {data.DateEnd ? (
                  <time datetime={new Date(data.DateEnd).toDateString()}>
                    {getMonthYear(data.DateEnd)}
                  </time>
                ) : (
                  <span>{cv.ui.current}</span>
                )}
                <time datetime={new Date(data.DateStart || "").toDateString()}>
                  {getMonthYear(data.DateStart || "")}
                </time>
                <div class="timeline" />
              </div>

              {link ? (
                <a href={link} class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    <span class="grow">{data.Name}</span>
                    <Icon
                      name="mdi:external-link"
                      class="mt-2 size-3 shrink-0 print:hidden"
                    />
                  </h3>
                  <h4>
                    {data.Organization} | {location}
                  </h4>
                  <Content />
                </a>
              ) : (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0">{data.Name}</h3>
                  <h4>
                    {data.Organization} | {location}
                  </h4>
                  <Content />
                </div>
              )}
            </div>
          );
        })
      }
    </section>
```

Note: The i18n `titleNote` and `companyNote` fields (e.g., "Intern until December 2016", "Previously the startup Urban Scale Timber") are already in the markdown body as italic text. `<Content />` renders them naturally. The `⤷` prefix from the old template is removed — italic text serves the same purpose.

- [ ] **Step 3: Replace the Education template section**

Find the `<section id={createHtmlId(cv.ui.education)}>` section. Replace with:

```astro
    <section
      id={createHtmlId(cv.ui.education)}
      class="[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300"
    >
      <h2>{cv.ui.education}</h2>
      {
        educationEntries.map(({ data, Content }, index: number) => {
          const bgClass = index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
          const thesisLink = buildThesisLink(data.Thesis);
          const institutionLink = extractLink(data.Link);
          const location = buildLocation(data);

          return (
            <div
              class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
            >
              <div class="timeline-wrapper">
                <div class="timeline-top" />
                {data.DateEnd ? (
                  <time datetime={new Date(data.DateEnd).toDateString()}>
                    {getMonthYear(data.DateEnd)}
                  </time>
                ) : (
                  <span>{cv.ui.current}</span>
                )}
                <time datetime={new Date(data.DateStart || "").toDateString()}>
                  {getMonthYear(data.DateStart || "")}
                </time>
                <div class="timeline" />
              </div>

              {institutionLink ? (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    {thesisLink ? (
                      <a href={thesisLink} class="grow hover:text-emerald-400">
                        {data.Name}
                      </a>
                    ) : (
                      <span class="grow">{data.Name}</span>
                    )}
                  </h3>
                  <h4>
                    <a href={institutionLink} class="inline-flex items-center gap-1 hover:text-emerald-400">
                      {data.Organization}
                      <Icon
                        name="mdi:external-link"
                        class="size-3 shrink-0 print:hidden"
                      />
                    </a>
                     | {location}
                  </h4>

                  {data.Description && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>{data.Description}</p>
                    </div>
                  )}

                  {data.Supervisors && data.Supervisors.length > 0 && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>
                        {cv.ui.supervisors}:
                        {data.Supervisors.map((s, idx, arr) =>
                          idx === arr.length - 1 ? `${s}` : `${s}, `,
                        )}
                      </p>
                    </div>
                  )}

                  {data.Advisors && data.Advisors.length > 0 && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>
                        {cv.ui.advisors}:
                        {data.Advisors.map((a, idx, arr) =>
                          idx === arr.length - 1 ? `${a}` : `${a}, `,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ) : thesisLink ? (
                <a href={thesisLink} class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    <span class="grow">{data.Name}</span>
                    <Icon
                      name="mdi:external-link"
                      class="mt-2 size-3 shrink-0 print:hidden"
                    />
                  </h3>
                  <h4>
                    {data.Organization} | {location}
                  </h4>
                  {data.Description && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>{data.Description}</p>
                    </div>
                  )}
                  {data.Supervisors && data.Supervisors.length > 0 && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>
                        {cv.ui.supervisors}:
                        {data.Supervisors.map((s, idx, arr) =>
                          idx === arr.length - 1 ? `${s}` : `${s}, `,
                        )}
                      </p>
                    </div>
                  )}
                  {data.Advisors && data.Advisors.length > 0 && (
                    <div class="mb-1 ml-1 text-sm text-zinc-300">
                      <p>
                        {cv.ui.advisors}:
                        {data.Advisors.map((a, idx, arr) =>
                          idx === arr.length - 1 ? `${a}` : `${a}, `,
                        )}
                      </p>
                    </div>
                  )}
                </a>
              ) : (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0">{data.Name}</h3>
                  <h4>
                    {data.Organization} | {location}
                  </h4>
                  {data.Supervisors && data.Supervisors.length > 0 && (
                    <div class="mb-1 ml-1 text-xs text-zinc-300">
                      <p class="font-semibold">{cv.ui.supervisors}:</p>
                      <ul class="ml-2">
                        {data.Supervisors.map((s) => (
                          <li>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.Advisors && data.Advisors.length > 0 && (
                    <div class="mb-1 ml-1 text-xs text-zinc-300">
                      <p class="font-semibold">{cv.ui.advisors}:</p>
                      <ul class="ml-2">
                        {data.Advisors.map((a) => (
                          <li>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      }
    </section>
```

- [ ] **Step 4: Replace the Scholarships template section**

Find the `<section id={createHtmlId(cv.ui.scholarships)}>` section. Replace with:

```astro
    <section id={createHtmlId(cv.ui.scholarships)}>
      <h2>{cv.ui.scholarships}</h2>
      {
        scholarships.map((entry, index: number) => {
          const bgClass = index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
          const link = extractLink(entry.data.Link);
          const location = buildLocation(entry.data);

          return (
            <div
              class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
            >
              <div class="timeline-wrapper">
                <div class="timeline-top" />
                {entry.data.DateEnd ? (
                  <time datetime={new Date(entry.data.DateEnd).toDateString()}>
                    {getMonthYear(entry.data.DateEnd)}
                  </time>
                ) : (
                  <span>{cv.ui.current}</span>
                )}
                <time datetime={new Date(entry.data.DateStart || "").toDateString()}>
                  {getMonthYear(entry.data.DateStart || "")}
                </time>
                <div class="timeline" />
              </div>

              {link ? (
                <a href={link} class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    <span class="grow">{entry.data.Name}</span>
                    <Icon
                      name="mdi:external-link"
                      class="mt-2 size-3 shrink-0 print:hidden"
                    />
                  </h3>
                  <h4>
                    {entry.data.Organization} | {location}
                  </h4>
                  {entry.data.Description && (
                    <p class="text-sm text-pretty text-zinc-300">
                      {entry.data.Description}
                    </p>
                  )}
                </a>
              ) : (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0">{entry.data.Name}</h3>
                  <h4>
                    {entry.data.Organization} | {location}
                  </h4>
                  {entry.data.Description && (
                    <p class="text-sm text-pretty text-zinc-300">
                      {entry.data.Description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      }
    </section>
```

- [ ] **Step 5: Replace the Certifications template section**

Find the `<section id={createHtmlId(cv.ui.certifications)}>` section. Replace with:

```astro
    <section id={createHtmlId(cv.ui.certifications)}>
      <h2>{cv.ui.certifications}</h2>
      {
        certifications.map((entry, index: number) => {
          const bgClass = index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
          const link = extractLink(entry.data.Link);

          return (
            <div
              class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
            >
              <div class="timeline-wrapper">
                <div class="timeline-top" />
                <time datetime={new Date(entry.data.DateStart || "").toDateString()}>
                  {getMonthYear(entry.data.DateStart || "")}
                </time>
                <div class="timeline" />
              </div>

              {link ? (
                <a href={link} class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    <span class="grow">{entry.data.Name}</span>
                    <Icon
                      name="mdi:external-link"
                      class="mt-2 size-3 shrink-0 print:hidden"
                    />
                  </h3>
                  <h4>{entry.data.Organization}</h4>
                  {entry.data.ValidUntil && (
                    <p class="text-xs text-zinc-300">
                      {cv.ui.validUntil}: {getMonthYear(entry.data.ValidUntil)}
                    </p>
                  )}
                  {entry.data.CredentialID && (
                    <p class="text-xs text-zinc-300">
                      ID: {entry.data.CredentialID}
                    </p>
                  )}
                </a>
              ) : (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0">{entry.data.Name}</h3>
                  <h4>{entry.data.Organization}</h4>
                  {entry.data.ValidUntil && (
                    <p class="text-xs text-zinc-300">
                      {cv.ui.validUntil}: {getMonthYear(entry.data.ValidUntil)}
                    </p>
                  )}
                  {entry.data.CredentialID && (
                    <p class="text-xs text-zinc-300">
                      ID: {entry.data.CredentialID}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      }
    </section>
```

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/[...locale]/cv.astro
git commit -m "Rewrite cv.astro to read all sections from content collections"
```

---

## Task 8: Rewrite `full-cv.astro` — data fetching and template

**Files:**
- Modify: `src/pages/[...locale]/full-cv.astro`

**Depends on:** Tasks 1-6 must be complete.

Apply the same pattern as Task 7, with these differences:
- No date filters on experiences, education, certifications
- Includes courses-attended section
- Includes projects list section
- Uses `cv.ui.engagementFull` instead of `cv.ui.engagementSimple`

- [ ] **Step 1: Replace imports and data fetching in frontmatter**

Replace the frontmatter section with the same structure as Task 7 Step 1, but with these changes:

1. Remove i18n type imports (`Experience`, `Education`, `Scholarship`, `Publication`, `Certification`, `Engagement`, `CourseAttended`, `Work`)
2. Use the same helper functions (`extractName`, `extractFirstName`, `extractLink`, `buildLocation`, `buildThesisLink`)
3. Use the same collection queries BUT without date filters:

```typescript
// Experiences — NO date filter (show all)
const experiencesFiltered = experiencesCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );

// Education — NO date filter (show all)
const educationFiltered = educationCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );

// Certifications — NO date filter (show all)
const certifications = certificationsCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );

// Teaching — NO date filter (show all)
const engagements = teachingCollection
  .sort(/* ... */)
  .map(/* same mapping as cv.astro */);
```

4. Add courses-attended query:

```typescript
// Courses attended (full-cv only)
const coursesCollection = await getCollection("courses-attended", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const coursesAttended = coursesCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  );
```

5. Keep the existing projects query (already from collection):

```typescript
// Projects (Works) — already from collection
const projectsCollection = await getCollection("projects", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const works = projectsCollection
  .sort((a, b) =>
    new Date(b.data.DateStart || "").getTime() - new Date(a.data.DateStart || "").getTime()
  )
  .map((w) => ({
    title: w.data.Name,
    startDate: w.data.DateStart || "",
    endDate: w.data.DateEnd,
    link: extractLink(w.data.Link),
    company: w.data.Client || w.data.Organization || "",
    location: extractFirstName(w.data.City),
    category: w.data.Category || "",
    description: w.data.Description,
  }));
```

- [ ] **Step 2: Replace template sections**

Apply the same template changes as Task 7 Steps 2-5 for experiences, education, scholarships, certifications.

- [ ] **Step 3: Replace the Courses Attended template section**

Find the courses-attended section. Replace with:

```astro
    <section id={createHtmlId(cv.ui.coursesAttended)}>
      <h2>{cv.ui.coursesAttended}</h2>
      {
        coursesAttended.map((entry, index: number) => {
          const bgClass = index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
          const link = extractLink(entry.data.Link);
          const location = buildLocation(entry.data);
          const instructor = entry.data.Authors?.map((a: any) => extractName(a)).join(", ") || "";

          return (
            <div
              class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
            >
              <div class="timeline-wrapper">
                <div class="timeline-top" />
                {entry.data.DateEnd ? (
                  <time datetime={new Date(entry.data.DateEnd).toDateString()}>
                    {getMonthYear(entry.data.DateEnd)}
                  </time>
                ) : null}
                <time datetime={new Date(entry.data.DateStart || "").toDateString()}>
                  {getMonthYear(entry.data.DateStart || "")}
                </time>
                <div class="timeline" />
              </div>

              {link ? (
                <a href={link} class={`item-text ${bgClass}`}>
                  <h3 class="mb-0 flex">
                    <span class="grow">{entry.data.Name}</span>
                    <Icon
                      name="mdi:external-link"
                      class="mt-2 size-3 shrink-0 print:hidden"
                    />
                  </h3>
                  <h4>
                    {entry.data.Organization}{location ? ` | ${location}` : ""}
                  </h4>
                  {instructor && (
                    <p class="text-sm text-zinc-300">{instructor}</p>
                  )}
                  {entry.data.Description && (
                    <p class="text-sm text-pretty text-zinc-300">
                      {entry.data.Description}
                    </p>
                  )}
                </a>
              ) : (
                <div class={`item-text ${bgClass}`}>
                  <h3 class="mb-0">{entry.data.Name}</h3>
                  <h4>
                    {entry.data.Organization}{location ? ` | ${location}` : ""}
                  </h4>
                  {instructor && (
                    <p class="text-sm text-zinc-300">{instructor}</p>
                  )}
                  {entry.data.Description && (
                    <p class="text-sm text-pretty text-zinc-300">
                      {entry.data.Description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      }
    </section>
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/[...locale]/full-cv.astro
git commit -m "Rewrite full-cv.astro to read all sections from content collections"
```

---

## Task 9: Trim i18n cv/ files — remove content data

**Files:**
- Modify: `src/i18n/cv/types.ts`
- Modify: `src/i18n/cv/en.ts`
- Modify: `src/i18n/cv/pt.ts`
- Modify: `src/i18n/cv/de.ts`

**Depends on:** Tasks 7 and 8 must be complete (CV pages no longer reference i18n content types).

- [ ] **Step 1: Rewrite `src/i18n/cv/types.ts`**

Replace the entire file with:

```typescript
export type I18nCV = {
  meta: {
    titleSimple: string;
    descriptionSimple: string;
    titleFull: string;
    descriptionFull: string;
    coverAlt: string;
  };
  ui: {
    title: string;
    summary: string;
    skills: string;
    programming: string;
    frameworks: string;
    databases: string;
    designTools: string;
    specialization: string;
    languages: string;
    professionalExperience: string;
    education: string;
    scholarships: string;
    publications: string;
    certifications: string;
    engagementSimple: string;
    engagementFull: string;
    engagementTypes: {
      course: string;
      talk: string;
      workshop: string;
      seminar: string;
    };
    coursesAttended: string;
    projectsList: string;
    current: string;
    supervisors: string;
    advisors: string;
    validUntil: string;
  };
  quote: string;
  summary: string;
};
```

- [ ] **Step 2: Trim `src/i18n/cv/en.ts`**

Remove all content arrays. Keep only `meta`, `ui`, `quote`, and `summary`. The file should look like:

```typescript
import type { I18nCV } from "./types";

export const t: I18nCV = {
  meta: {
    titleSimple: "Daniel Locatelli - CV",
    descriptionSimple:
      "This is my simplified CV, including main work, education, lectures, publications, certificates and courses.",
    titleFull: "Daniel Locatelli - Full CV",
    descriptionFull:
      "This is my full CV, including work, education, lectures, publications, certificates, and more.",
    coverAlt: "Daniel Locatelli's profile photo.",
  },
  ui: {
    title: "AEC Software Engineer",
    summary: "Summary",
    skills: "Skills",
    programming: "Programming",
    frameworks: "Frameworks",
    databases: "Databases",
    designTools: "Design Tools",
    specialization: "Specialization",
    languages: "Languages",
    professionalExperience: "Professional Experience",
    education: "Education",
    scholarships: "Scholarships",
    publications: "Publications",
    certifications: "Certifications",
    engagementSimple: "Latest Teaching Experience",
    engagementFull: "Teaching Experience",
    engagementTypes: {
      course: "Course",
      talk: "Talk",
      workshop: "Workshop",
      seminar: "Seminar",
    },
    coursesAttended: "Courses Attended",
    projectsList: "Projects List",
    current: "Current",
    supervisors: "Supervisors",
    advisors: "Advisors",
    validUntil: "Valid until",
  },
  quote:
    '"Architecture is inherently transdisciplinary. Its future lies in the use of computational co-design with vernacular materials to create circular construction systems."',
  summary:
    "Software engineer and computational design researcher specializing in timber construction. Expertise in bridging design and engineering through C#, Python and web technologies. M.Sc. from ITECH (University of Stuttgart) with a focus on multi-scalar robotic systems for engineered timber. Trilingual professional (English, German, and Portuguese) dedicated to solving complex structural problems through scalable software and data-driven fabrication.",
};
```

- [ ] **Step 3: Trim `src/i18n/cv/pt.ts`**

Same pattern — keep only `meta`, `ui`, `quote`, and `summary` with Portuguese translations. Remove all content arrays.

Read the current file to get the exact Portuguese values for meta, ui, quote, and summary before trimming.

- [ ] **Step 4: Trim `src/i18n/cv/de.ts`**

Same pattern — keep only `meta`, `ui`, `quote`, and `summary` with German translations. Remove all content arrays.

Read the current file to get the exact German values for meta, ui, quote, and summary before trimming.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Clean build. The CV pages should render correctly using collection data.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/cv/
git commit -m "Trim i18n cv/ files to UI strings only, remove all content data"
```

---

## Task 10: Final build verification and visual check

**Depends on:** All previous tasks.

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Clean build, zero errors, zero warnings related to CV content.

- [ ] **Step 2: Visual verification with dev server**

Run: `npm run dev`

Check these pages in the browser:
- `/cv` — English simple CV
- `/pt/cv` — Portuguese simple CV
- `/de/cv` — German simple CV
- `/full-cv` — English full CV
- `/pt/full-cv` — Portuguese full CV
- `/de/full-cv` — German full CV

Verify for each page:
- All experiences, education, scholarships render with correct data
- Skills table shows correct names in correct order
- Publications, teaching, certifications display correctly
- Courses attended and projects list appear on full-cv pages
- Thesis links (Master, Bachelor) navigate to correct research pages
- Timeline dates display correctly
- Location format shows "City, Country"

- [ ] **Step 3: Commit any fixes if needed**

If visual verification reveals issues, fix and commit.
