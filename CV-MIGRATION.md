# CV Content Migration

Migration of CV data from `src/i18n/cv/{en,pt,de}.ts` translation files to Astro Content Collections.

**Date:** 2026-03-14
**Script:** `scripts/generate-cv-content.mjs`

## What was migrated

The following CV sections were extracted from the i18n TypeScript files and converted into Astro Content Collection markdown files, each with proper YAML frontmatter using the existing `pageSchema`.

| Collection | EN | PT | DE | Source field |
|---|---|---|---|---|
| `experiences` | 9 | 9 | 9 | `experiences[]` |
| `education` | 4 | 4 | 4 | `education[]` |
| `scholarships` | 2 | 2 | 2 | `scholarships[]` |
| `certifications` | 5 | 5 | 5 | `certifications[]` |
| `engagements` | 21 | 21 | 21 | `engagements[]` |
| `courses-attended` | 16 | 16 | 16 | `coursesAttended[]` |
| `works` | 55 | 55 | 32 | `works[]` |
| **Total** | **112** | **112** | **89** | |

**Total files generated: 313**

### Directory structure

```
src/content/
  experiences/{en,pt,de}/*.md      # Professional work experience
  education/{en,pt,de}/*.md        # Academic degrees
  scholarships/{en,pt,de}/*.md     # Grants and scholarships
  certifications/{en,pt,de}/*.md   # Professional certifications
  engagements/{en,pt,de}/*.md      # Teaching: talks, workshops, courses, seminars
  courses-attended/{en,pt,de}/*.md # Courses and workshops attended
  works/{en,pt,de}/*.md            # Individual project works
```

### Frontmatter mapping

Each markdown file uses the project's unified `pageSchema` from `src/content/config.ts`. Fields are mapped as follows:

| CV field | Frontmatter field | Notes |
|---|---|---|
| `title` | `Name` | Translated per locale |
| generated | `Slug` | `{collection}/{kebab-case-slug}`, shared across locales |
| `description` | `Description` | When available |
| `startDate` | `DateStart` | ISO date string |
| `endDate` | `DateEnd` | When available |
| `company` / `institution` / `organization` / `issuer` | `Organization` | Context-dependent |
| `location` (city part) | `City` | Array, extracted from "City, Country" format |
| `link` | `Link` | When available |
| `type` / `category` | `Category` | Capitalized |
| `supervisors` + `advisors` / `instructor` / `authors` | `Authors` | When available |

### Body content

- **experiences**: Bullet list of work items; company/title notes as italicized text
- **education**: Supervisors and advisors listed in bold
- **All others**: Empty body (data is fully in frontmatter)

### Slug disambiguation

Entries with duplicate English titles receive a unique slug by appending a differentiating suffix:

- **experiences**: company name (e.g., `aec-software-engineer-buildsystems-gmbh`)
- **engagements**: organization + date (e.g., `computational-design-strategies-unip-sorocaba-2020-11`)
- **works**: company name (e.g., `grasshopper-c-plugin-buildsystems-gmbh`)

## What was NOT migrated

### Publications (already in `publications` collection)

The 6 publications listed in the CV already exist in the `publications` content collection (which has 15 entries across en/pt/de). No new publication files were created to avoid duplication.

### Skills (already in `skills` collection)

The CV skills (programming, frameworks, databases, design tools, specialization, languages) are already partially covered by the `skills` collection (36 files). The CV skills include proficiency `level` data (Advanced/Intermediate) that the current skills schema doesn't explicitly expose. Consider extending the `skills` collection or keeping levels in the i18n files.

### UI labels and metadata

The following remain in `src/i18n/cv/{locale}.ts` as they are UI/presentation concerns, not content entries:

- `meta` (page titles, descriptions)
- `ui` (section headings, labels like "Supervisors", "Current", etc.)
- `quote` (personal quote)
- `summary` (professional summary)
- `skillsLanguages` (spoken languages with proficiency levels)

### German works gap

The German translation file (`de.ts`) only had 32 of 55 works entries translated (missing the Atelier Marko Brajovic and freelance entries from the Brazilian period). German markdown files were only created where translations existed.

## Config changes

The following collections were registered in `src/content/config.ts`:

- `experiences`
- `education`
- `scholarships`
- `certifications`
- `engagements`
- `courses-attended`
- `works`

All use the existing `pageSchema` definition.

## Next steps

1. **Update CV pages** (`src/pages/[...locale]/cv.astro`, `full-cv.astro`) to query from content collections instead of importing from `src/i18n/cv/`
2. **Translate missing German works** (23 entries from the Brazilian period)
3. **Consider merging** overlapping collections:
   - `engagements` entries that have detailed pages could reference the `teaching` collection
   - `works` entries that have detailed pages could reference the `projects` collection
4. **Deprecate** the data arrays in `src/i18n/cv/{locale}.ts` once CV pages are updated (keep UI labels)
