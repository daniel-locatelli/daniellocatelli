# Unify CV Content: Migrate i18n Data to Astro Content Collections

**Date:** 2026-04-05
**Status:** Approved
**Scope:** Migrate all CV structured content from `src/i18n/cv/` into Astro content collections, making content collections the single source of truth for CV data. Keep i18n only for UI strings.

## Problem

The website has two parallel content systems with significant overlap:

1. **Custom i18n** (`src/i18n/cv/{locale}.ts`) — TypeScript objects containing full CV content: experiences, education, scholarships, certifications, skills tables, publications, courses attended, and project works.
2. **Astro Content Collections** (`src/content/`) — Markdown files with YAML frontmatter for the same data across 11 collections.

The CV pages (`cv.astro`, `full-cv.astro`) read from **both** systems: i18n for experiences/education/scholarships/certifications/courses/works, and collections for publications/teaching/skills. This duplication means:

- Editing CV content requires knowing which system holds which data.
- Adding a new entry risks updating only one source.
- Three locales (en, pt, de) multiply the maintenance burden.

## Goal

One place to edit all CV content: Astro content collections. The i18n system remains for UI strings only (section headings, labels, meta descriptions).

## Design

### 1. Schema Changes

Add 6 optional fields to `pageSchema` in `src/content/config.ts`:

```typescript
Order: z.number().optional(),           // Display order within a group (replaces hardcoded sort arrays)
ValidUntil: z.string().optional(),      // Expiry date for certifications
CredentialID: z.string().optional(),    // Credential identifier string
Thesis: z.string().optional(),          // Slug reference to a research page
Country: z.string().optional(),         // Country for location display (complements City)
Instructor: z.array(z.string()).optional(), // Instructor(s) for courses attended
```

**Why these fields:**

- `Order` — The CV page currently hardcodes skill display order as string arrays (e.g., `sortByOrder(["HTML", "CSS", "TypeScript", "Python", "C#"])`). An `Order` field makes each content entry self-describing.
- `ValidUntil` / `CredentialID` — The i18n certification type has these but the content files don't. Needed for full CV rendering.
- `Thesis` — Already used in `education/en/master-of-sciences.md` but silently stripped by Zod because it's missing from the schema. This field enables the dual-link pattern: `Link` points to the institution, `Thesis` slug constructs the link to `/research/{thesis}`.
- `Country` — The i18n has `location: "Munich, Germany"` but collections only have `City: [Munich]`. Needed to compose full location strings.
- `Instructor` — The i18n `CourseAttended` type has an `instructor` field not represented in the collection schema.

**Field mapping from i18n types to pageSchema:**

| i18n field | pageSchema field | Notes |
|---|---|---|
| `experience.title` | `Name` | Already exists |
| `experience.company` | `Organization` | Already exists |
| `experience.startDate` / `endDate` | `DateStart` / `DateEnd` | Already exists |
| `experience.link` | `Link` | Already exists |
| `experience.location` | `City` + `Country` | Split into two fields |
| `experience.titleNote` | Markdown body | Already the pattern (italic text in body) |
| `experience.companyNote` | Markdown body | Already the pattern (italic text in body) |
| `experience.items` | Markdown body | Bullet list in body, rendered via `entry.render()` |
| `education.institution` | `Organization` | Already exists |
| `education.institutionLink` | `Link` | Primary link is institution; thesis uses `Thesis` slug |
| `education.link` (thesis) | `Thesis` | Slug reference, URL constructed as `/research/{Thesis}` |
| `education.supervisors` | `Supervisors` | Already exists |
| `education.advisors` | `Advisors` | Already exists |
| `scholarship.institution` | `Organization` | Already exists |
| `certification.issuer` | `Organization` | Already exists |
| `certification.date` | `DateStart` | Already exists |
| `certification.validUntil` | `ValidUntil` | New field |
| `certification.credentialID` | `CredentialID` | New field |
| `courseAttended.instructor` | `Instructor` | New field |
| `courseAttended.organization` | `Organization` | Already exists |

### 2. Content File Audit

The content collection files already exist and are mostly complete. Gaps to fill:

**Experiences (9 files x 3 locales = 27 files):**
- Add `Country` to all files
- Verify markdown body has bullet items matching i18n `items[]`

**Education (4 files x 3 locales = 12 files):**
- Add `Country` to all files
- Verify `Thesis` field is present where applicable (master, bachelor)

**Scholarships (2 files x 3 locales = 6 files):**
- Add `Country` to all files
- Add `Description` if missing

**Certifications (5 files x 3 locales = 15 files):**
- Add `ValidUntil` and `CredentialID` where applicable

**Courses Attended (16 files x 3 locales = 48 files):**
- Add `Instructor` field where applicable
- Add `Country` where applicable

**Skills (24 files, EN only):**
- Add `Order` field to each file per category group

**Total: ~132 files to audit/update.** Primarily adding missing frontmatter fields; the actual text content is already present.

### 3. CV Page Rewrite

**Before (data sources):**
```
i18n:        experiences, education, scholarships, certifications, coursesAttended, works
collections: publications, teaching, skills
```

**After (data sources):**
```
i18n:        meta, ui (labels only), quote, summary
collections: experiences, education, scholarships, certifications, courses-attended,
             publications, teaching, skills, projects
```

**Query pattern** — same as already used for publications/teaching/skills:
```typescript
const experiencesCollection = await getCollection("experiences", ({ id }) =>
  id.startsWith(`${locale}/`)
);
```

**Skills ordering changes from hardcoded arrays to the Order field:**
```typescript
// Before: hardcoded name arrays
.sort(sortByOrder(["HTML", "CSS", "TypeScript", "Python", "C#"]));

// After: Order field from content
.sort((a, b) => (a.data.Order ?? 999) - (b.data.Order ?? 999));
```

**Template field name changes:**
- `experience.title` becomes `entry.data.Name`
- `experience.company` becomes `entry.data.Organization`
- `experience.location` becomes `` `${extractFirstName(entry.data.City)}, ${entry.data.Country}` ``
- Bullet items: `experience.items.map(...)` becomes `<Content />` from `entry.render()`

**Rendering markdown body content:**
The i18n `items: string[]` rendered as individual `<li>` elements. The collection markdown body already contains `- item` bullet lists. Using `<Content />` from `entry.render()` produces the same `<ul><li>` output natively.

**Date filtering stays the same:**
- `cv.astro` — experiences >= 2015, education >= 2014, certifications >= 2015, teaching >= 2023; omits courses-attended and projects
- `full-cv.astro` — shows all entries; includes courses-attended and projects list

### 4. i18n Trimming

**What stays in `src/i18n/cv/{locale}.ts`:**

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
    engagementTypes: { course: string; talk: string; workshop: string; seminar: string };
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

**What gets removed:**
- All data arrays: `skillsProgramming`, `skillsFrameworks`, `skillsDatabases`, `skillsDesign`, `skillsSpecialized`, `skillsLanguages`, `experiences`, `education`, `scholarships`, `publications`, `certifications`, `engagements`, `coursesAttended`, `works`
- All data types from `types.ts`: `Skill`, `Experience`, `Education`, `Scholarship`, `Publication`, `Certification`, `Engagement`, `CourseAttended`, `Work`

**Untouched i18n folders:** `footer/`, `home/`, `legal/`, `meta/`, `subpage/` — these contain only UI strings and remain as-is.

**Utilities:** `src/i18n/utils.ts` stays unchanged (`getI18n`, `getMonthYear`, `createHtmlId` are still used).

## Out of Scope

- **Component extraction:** Extracting reusable Astro components from the CV page templates (experience timeline, education timeline, etc.) to reduce duplication between `cv.astro` and `full-cv.astro`. This is valuable but should be a separate follow-up to keep the data migration focused.
- **Other i18n folders:** The `footer/`, `home/`, `legal/`, `meta/`, `subpage/` i18n folders are not part of this migration.
- **Localization of skills:** Skills currently only have English content files. Adding pt/de skill files is not in scope.

## Verification

- `npm run build` passes with no type errors
- CV page (`/cv` and `/full-cv`) renders identically in all 3 locales before and after migration
- Adding a new experience entry to `src/content/experiences/en/` automatically appears on the CV
- Skills display in the correct order using the `Order` field
- The `Thesis` field correctly generates links to `/research/{slug}`
- i18n CV files contain only UI strings, no content data
