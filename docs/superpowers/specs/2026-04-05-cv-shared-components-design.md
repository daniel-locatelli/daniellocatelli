# CV Shared Components — Design Spec

**Date:** 2026-04-05
**Goal:** Extract shared Astro components from `cv.astro` and `full-cv.astro` to eliminate code duplication and style drift. Style source of truth: `cv.astro`.

## Problem

`cv.astro` (925 lines) and `full-cv.astro` (1076 lines) share ~90% identical rendering code. They've already drifted in padding, gap, timeline height, heading styles, and print layout. Each future CV variant would copy-paste the drift.

## Solution: Section-Level Component Extraction

Extract shared rendering into Astro components. Pages become thin orchestrators that fetch data (with per-variant filters) and compose section components.

## File Structure

```
src/
  lib/
    cv-helpers.ts                  # Shared utility functions
  components/
    cv/
      CvContainer.astro            # Container + unified class string + print styles
      CvHeader.astro               # Profile photo, name, contact, social links
      CvSkills.astro               # Skills table (6 category rows)
      CvExperiences.astro          # Professional experience timeline entries
      CvEducation.astro            # Education entries (3-branch link logic)
      CvScholarships.astro         # Scholarship timeline entries
      CvPublications.astro         # Publication timeline entries
      CvCertifications.astro       # Certification timeline entries
      CvEngagements.astro          # Teaching/engagement timeline entries
      CvCoursesAttended.astro      # Courses attended timeline entries
      CvProjects.astro             # Projects/works timeline entries
  pages/
    [...locale]/
      cv.astro                     # ~80 lines: fetch with date filters, compose 8 sections
      full-cv.astro                # ~100 lines: fetch all, compose 10 sections
```

11 new files (1 helper + 10 components). Both page files rewritten from ~925/1076 lines to ~80-100 lines.

## Shared Utilities: `src/lib/cv-helpers.ts`

Pure functions extracted from the duplicated frontmatter in both pages:

- `extractName(item: any): string` — gets name from `string | { name: string }`
- `extractFirstName(arr: any): string` — gets first name from array of the above
- `extractLink(linkProp: any): string` — gets URL from `string | array | { Href: string }`
- `buildLocation(data: any): string` — combines City + Country into `"City, Country"`
- `buildThesisLink(thesis: string | undefined, locale: string, defaultLocale: string): string | undefined` — builds `/research/{thesis}` path with locale prefix
- `sortByOrder(a, b): number` — sorts by `Order` field ascending

## CvContainer.astro

Wraps `Container` component with the unified class string and print styles.

**Props:**
- `footerUrl: string` — text for `@bottom-left` in print footer

**Unified class string** (cv.astro source of truth):
```
font-body relative flex flex-col gap-5 text-base print:text-sm print:text-black
[&_.item-text]:px-6 [&_.item-text]:py-2
[&_.item-text]:print:break-inside-avoid [&_.item-text]:print:px-2 [&_.item-text]:print:py-2
[&_.timeline]:shrink-0 [&_.timeline]:grow [&_.timeline]:border-r [&_.timeline]:print:h-2
[&_.timeline-top]:h-2 [&_.timeline-top]:border-r [&_.timeline-top]:print:h-2
[&_.timeline-wrapper]:mx-3 [&_.timeline-wrapper]:flex [&_.timeline-wrapper]:shrink-0
[&_.timeline-wrapper]:flex-col [&_.timeline-wrapper]:items-center
[&_.timeline-wrapper]:font-sans [&_.timeline-wrapper]:sm:mx-6
[&_a:hover]:text-emerald-400
[&_h2]:mb-3 [&_h2]:border-b [&_h2]:pb-1 [&_h2]:text-3xl
[&_h2]:print:mb-1 [&_h2]:print:break-after-avoid
[&_h3]:text-lg/6 [&_h3]:print:font-bold
[&_h4]:text-zinc-300
```

**Print styles** (cv.astro source of truth):
```css
@page {
  margin-top: 2cm;
  margin-bottom: 2cm;
  margin-left: 1.2cm;
  margin-right: 1.2cm;
  @bottom-left {
    content: "daniellocatelli.com/cv"; /* default; overridden per-page via define:vars */
    font-size: 9pt;
    padding-bottom: 0.5cm;
    color: #666;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-size: 9pt;
    padding-bottom: 0.5cm;
    color: #999;
  }
}
@media print {
  :root, :root[data-theme="light"], :root[data-theme="dark"] {
    color-scheme: light !important;
    --theme-bg: white !important;
  }
  * { background-color: white !important; color: black !important; }
  body { padding: 0; }
  body * { visibility: visible; }
}
```

The `footerUrl` prop is injected into the `<style>` block via Astro's `define:vars` directive. Since `@page` `content` has limited browser support for `var()`, the implementation will use `<style is:inline>` with direct string interpolation of the prop value into the CSS, ensuring reliable cross-browser rendering.

## Section Components

All section components follow the same contract:
- Receive pre-processed data as props and the `cv: I18nCV` i18n object for labels
- Own zero data-fetching logic
- Render their own `<section>` with `<h2>` heading
- Self-contain the alternating row background and timeline grid markup

### CvHeader.astro
**Props:** `cv: I18nCV`, `meta: I18nMeta`
Imports `siteConfig` and `profilePhoto` internally. Renders profile photo, name, title, quote, contact info, social links.

### CvSkills.astro
**Props:** `cv: I18nCV`, `skills: { programming, frameworks, databases, design, specialized: string[], languages }`
Each skill category array comes pre-filtered and sorted from the page. `specialized` is pre-mapped to `string[]`.

### CvExperiences.astro
**Props:** `cv: I18nCV`, `items: Array<{ data, Content }>`
`Content` is the rendered Astro content component. Renders timeline grid with link-or-div pattern.
Section class includes: `[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300`

### CvEducation.astro
**Props:** `cv: I18nCV`, `items: education collection entries`, `locale: string`
Needs `locale` for `buildThesisLink`. 3-branch rendering:
1. Both `institutionLink` AND `thesisLink` — div wrapper, thesis link on name, institution link on org
2. Only `thesisLink` — whole item is an anchor
3. No links — plain div
Plus optional supervisors/advisors lists.
Section class includes: `[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300`

### CvScholarships.astro
**Props:** `cv: I18nCV`, `items: scholarship collection entries`
Timeline + optional link. Name, organization, location, description.

### CvPublications.astro
**Props:** `cv: I18nCV`, `items: Array<{ title, date, link, publisher, location, authors: string[] }>`
Pre-mapped data. Timeline + authors list with nowrap spans.

### CvCertifications.astro
**Props:** `cv: I18nCV`, `items: certification collection entries`
Timeline + credential ID, valid-until date, organization, description.

### CvEngagements.astro
**Props:** `cv: I18nCV`, `items: Array<{ title, startDate, endDate, link, organization, location, type, description }>`, `heading: string`
`heading` prop controls section title (e.g. `cv.ui.engagementSimple` vs `cv.ui.engagementFull`).

### CvCoursesAttended.astro
**Props:** `cv: I18nCV`, `items: courses-attended collection entries`
Timeline + instructor(s), organization, location, description.

### CvProjects.astro
**Props:** `cv: I18nCV`, `items: Array<{ title, startDate, endDate, link, company, location, category, description }>`
Timeline + category (italic), company, location, description.

## Page Files After Refactoring

### cv.astro (~80 lines)
- Fetches collections WITH date filters:
  - experiences: `DateStart >= 2015`
  - education: `DateEnd >= 2014`
  - certifications: `DateStart >= 2015`
  - engagements: `DateStart >= 2023-01-01`
  - publications, scholarships, skills: no filter
- Meta: `cv.meta.titleSimple`, `cv.meta.descriptionSimple`
- Footer: `"daniellocatelli.com/cv"`
- Sections: Header, Skills, Experiences, Education, Scholarships, Publications, Certifications, Engagements

### full-cv.astro (~100 lines)
- Fetches all collections WITHOUT date filters, plus courses-attended and projects
- Meta: `cv.meta.titleFull`, `cv.meta.descriptionFull`
- Footer: `"daniellocatelli.com/full-cv"`
- Sections: same 8 as cv.astro + CoursesAttended + Projects

### Future CV variants
Same pattern: pick your sections, pick your filters, ~80 lines. All rendering is single-sourced in the shared components.

## Design Principle

**All rendering decisions live in shared components. All data decisions live in pages.**
