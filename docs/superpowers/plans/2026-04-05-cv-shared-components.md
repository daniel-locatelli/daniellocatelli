# CV Shared Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract shared Astro components from `cv.astro` and `full-cv.astro` to eliminate ~90% code duplication and prevent style drift.

**Architecture:** Extract rendering into 10 reusable Astro components under `src/components/cv/`, shared utilities into `src/lib/cv-helpers.ts`. Both page files become thin orchestrators (~80-100 lines) that fetch data with per-variant filters and compose section components. Style source of truth: `cv.astro`.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS 4

---

## File Structure

```
src/
  lib/
    cv-helpers.ts                    # NEW — shared utility functions
  components/
    cv/
      CvContainer.astro              # NEW — Container wrapper + unified styles + print CSS
      CvHeader.astro                 # NEW — profile photo, name, contact, social links
      CvSkills.astro                 # NEW — skills table (6 rows)
      CvExperiences.astro            # NEW — professional experience timeline
      CvEducation.astro              # NEW — education entries (3-branch link logic)
      CvScholarships.astro           # NEW — scholarship timeline
      CvPublications.astro           # NEW — publication timeline
      CvCertifications.astro         # NEW — certification timeline
      CvEngagements.astro            # NEW — teaching/engagement timeline
      CvCoursesAttended.astro        # NEW — courses attended timeline
      CvProjects.astro               # NEW — projects/works timeline
  pages/
    [...locale]/
      cv.astro                       # REWRITE — thin orchestrator with date filters
      full-cv.astro                  # REWRITE — thin orchestrator without date filters
```

---

### Task 1: Create shared utility functions

**Files:**
- Create: `src/lib/cv-helpers.ts`

- [ ] **Step 1: Create `src/lib/cv-helpers.ts`**

```typescript
import { siteConfig } from "@/config/site";

/** Gets name from `string | { name: string }` */
export const extractName = (item: any): string => {
  if (!item) return "";
  return typeof item === "string" ? item : item.name;
};

/** Gets first name from array of `string | { name: string }` */
export const extractFirstName = (arr: any): string => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return extractName(arr[0]);
};

/** Gets URL from `string | array of { Href } | { Href }` */
export const extractLink = (linkProp: any): string => {
  if (!linkProp) return "";
  if (typeof linkProp === "string") return linkProp;
  if (Array.isArray(linkProp)) return linkProp[0]?.Href || "";
  return linkProp.Href || "";
};

/** Combines City + Country into "City, Country" */
export const buildLocation = (data: any): string => {
  const city = extractFirstName(data.City);
  return data.Country ? `${city}, ${data.Country}` : city;
};

/** Builds `/research/{thesis}` path with locale prefix */
export const buildThesisLink = (
  thesis: string | undefined,
  locale: string,
): string | undefined => {
  if (!thesis) return undefined;
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/research/${thesis}`;
};

/** Sorts collection entries by Order field ascending */
export const sortByOrder = (
  a: { data: { Order?: number } },
  b: { data: { Order?: number } },
): number => (a.data.Order ?? 999) - (b.data.Order ?? 999);
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx astro check 2>&1 | head -20`
Expected: No errors related to `cv-helpers.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/cv-helpers.ts
git commit -m "Extract shared CV utility functions to src/lib/cv-helpers.ts"
```

---

### Task 2: Create CvContainer component

**Files:**
- Create: `src/components/cv/CvContainer.astro`

- [ ] **Step 1: Create `src/components/cv/CvContainer.astro`**

```astro
---
import Container from "@/components/Container.astro";

interface Props {
  footerUrl: string;
}

const { footerUrl } = Astro.props;
---

<Container
  class="font-body relative flex flex-col gap-5 text-base print:text-sm print:text-black [&_.item-text]:px-6 [&_.item-text]:py-2 [&_.item-text]:print:break-inside-avoid [&_.item-text]:print:px-2 [&_.item-text]:print:py-2 [&_.timeline]:shrink-0 [&_.timeline]:grow [&_.timeline]:border-r [&_.timeline]:print:h-2 [&_.timeline-top]:h-2 [&_.timeline-top]:border-r [&_.timeline-top]:print:h-2 [&_.timeline-wrapper]:mx-3 [&_.timeline-wrapper]:flex [&_.timeline-wrapper]:shrink-0 [&_.timeline-wrapper]:flex-col [&_.timeline-wrapper]:items-center [&_.timeline-wrapper]:font-sans [&_.timeline-wrapper]:sm:mx-6 [&_a:hover]:text-emerald-400 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:pb-1 [&_h2]:text-3xl [&_h2]:print:mb-1 [&_h2]:print:break-after-avoid [&_h3]:text-lg/6 [&_h3]:print:font-bold [&_h4]:text-zinc-300"
>
  <slot />
</Container>

<style is:inline define:vars={{ footerUrl: `"${footerUrl}"` }}>
  @page {
    margin-top: 2cm;
    margin-bottom: 2cm;
    margin-left: 1.2cm;
    margin-right: 1.2cm;

    @bottom-left {
      content: var(--footerUrl);
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
    :root,
    :root[data-theme="light"],
    :root[data-theme="dark"] {
      color-scheme: light !important;
      --theme-bg: white !important;
    }
    * {
      background-color: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color: black !important;
    }
    body {
      padding: 0;
    }
    body * {
      visibility: visible;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvContainer.astro
git commit -m "Add CvContainer component with unified CV styles and print CSS"
```

---

### Task 3: Create CvHeader component

**Files:**
- Create: `src/components/cv/CvHeader.astro`

- [ ] **Step 1: Create `src/components/cv/CvHeader.astro`**

```astro
---
import profilePhoto from "@/assets/avatars/daniel-locatelli-v1.png";
import { Image } from "astro:assets";
import { Icon } from "astro-icon/components";
import { siteConfig } from "@/config/site";
import type { I18nCV } from "src/i18n/cv/types";
import type { I18nMeta } from "src/i18n/meta/types";

interface Props {
  cv: I18nCV;
  meta: I18nMeta;
}

const { cv, meta } = Astro.props;
---

<div class="flex flex-col gap-6 pt-20 sm:flex-row sm:pt-28 print:pt-2">
  <Image
    src={profilePhoto}
    alt="Daniel Locatelli's profile photo."
    class="rounded-full p-8 sm:size-38 sm:p-0"
  />
  <div class="flex flex-col justify-center gap-1">
    <div class="flex flex-col gap-1">
      <h1 class="font-title text-5xl">{siteConfig.author}</h1>
      <p class="text-lg">{cv.ui.title}</p>
    </div>
    <div class="flex flex-col gap-4 text-sm sm:flex-row sm:gap-7">
      <p class="text-pretty sm:text-xs sm:text-balance">
        {cv.quote}
      </p>
      <div>
        <address class="flex flex-col sm:text-xs">
          <a href={"mailto:" + siteConfig.email}>{siteConfig.email}</a>
          <span> {siteConfig.phone} </span>
          <span> {meta.city}, {meta.country} </span>
        </address>
        <div class="flex h-full grow gap-3">
          <a
            href={siteConfig.website}
            class="h-min"
            title="Check my Website"
          >
            <Icon
              name="mdi:globe"
              class="inline-block size-5 align-middle sm:size-3.5"
            />
          </a>
          <a
            href={siteConfig.linkedin}
            class="h-min"
            title="Connect on LinkedIn"
          >
            <Icon
              name="mdi:linkedin"
              class="inline-block size-5 align-middle sm:size-3.5"
            />
          </a>
          <a href={siteConfig.github} class="h-min" title="Check my GitHub">
            <Icon
              name="mdi:github"
              class="inline-block size-5 align-middle sm:size-3.5"
            />
          </a>
          <a href={siteConfig.gitlab} class="h-min" title="Check my GitLab">
            <Icon
              name="mdi:gitlab"
              class="inline-block size-5 align-middle sm:size-3.5"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvHeader.astro
git commit -m "Add CvHeader component"
```

---

### Task 4: Create CvSkills component

**Files:**
- Create: `src/components/cv/CvSkills.astro`

- [ ] **Step 1: Create `src/components/cv/CvSkills.astro`**

```astro
---
import type { I18nCV } from "src/i18n/cv/types";

interface Props {
  cv: I18nCV;
  skills: {
    programming: Array<{ data: { Name: string } }>;
    frameworks: Array<{ data: { Name: string } }>;
    databases: Array<{ data: { Name: string } }>;
    design: Array<{ data: { Name: string } }>;
    specialized: string[];
    languages: Array<{ data: { Name: string; Level?: string } }>;
  };
}

const { cv, skills } = Astro.props;
---

<section id="technical-skills">
  <h2>{cv.ui.skills}</h2>
  <table
    class="table-auto [&_td]:leading-5 [&_th]:pr-2 [&_th]:text-right [&_th]:align-top [&_th]:font-thin sm:[&_th]:pr-4"
  >
    <tr>
      <th>{cv.ui.programming}</th>
      <td>
        {
          skills.programming.map((skill, idx, arr) =>
            idx === arr.length - 1
              ? skill.data.Name
              : skill.data.Name + ", ",
          )
        }
      </td>
    </tr>
    <tr>
      <th>{cv.ui.frameworks}</th>
      <td>
        {
          skills.frameworks.map((skill, idx, arr) =>
            idx === arr.length - 1
              ? skill.data.Name
              : skill.data.Name + ", ",
          )
        }
      </td>
    </tr>
    <tr>
      <th>{cv.ui.databases}</th>
      <td>
        {
          skills.databases.map((skill, idx, arr) =>
            idx === arr.length - 1
              ? skill.data.Name
              : skill.data.Name + ", ",
          )
        }
      </td>
    </tr>
    <tr>
      <th>{cv.ui.designTools}</th>
      <td>
        {
          skills.design.map((skill, idx, arr) =>
            idx === arr.length - 1
              ? skill.data.Name
              : skill.data.Name + ", ",
          )
        }
      </td>
    </tr>
    <tr>
      <th>{cv.ui.specialization}</th>
      <td>
        {
          skills.specialized.map((skill, idx, arr) =>
            idx === arr.length - 1 ? skill : skill + ", ",
          )
        }
      </td>
    </tr>
    <tr>
      <th>{cv.ui.languages}</th>
      <td>
        {
          skills.languages.map((skill, idx, arr) =>
            idx === arr.length - 1
              ? `${skill.data.Name} (${skill.data.Level})`
              : `${skill.data.Name} (${skill.data.Level}), `,
          )
        }
      </td>
    </tr>
  </table>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvSkills.astro
git commit -m "Add CvSkills component"
```

---

### Task 5: Create CvExperiences component

**Files:**
- Create: `src/components/cv/CvExperiences.astro`

- [ ] **Step 1: Create `src/components/cv/CvExperiences.astro`**

The `items` prop receives an array of `{ data, Content }` where `Content` is a pre-rendered Astro content component from `entry.render()`. The `data` shape comes from `pageSchema` in `src/content/config.ts`.

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";
import { extractLink, buildLocation } from "src/lib/cv-helpers";

interface Props {
  cv: I18nCV;
  items: Array<{
    data: any;
    Content: any;
  }>;
}

const { cv, items } = Astro.props;
---

<section
  id={createHtmlId(cv.ui.professionalExperience)}
  class="[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300"
>
  <h2>{cv.ui.professionalExperience}</h2>
  {
    items.map(({ data, Content }, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
      const link = extractLink(data.Link);

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
                {data.Organization} | {buildLocation(data)}
              </h4>
              <Content />
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">{data.Name}</h3>
              <h4>
                {data.Organization} | {buildLocation(data)}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvExperiences.astro
git commit -m "Add CvExperiences component"
```

---

### Task 6: Create CvEducation component

**Files:**
- Create: `src/components/cv/CvEducation.astro`

- [ ] **Step 1: Create `src/components/cv/CvEducation.astro`**

This is the most complex section — 3-branch rendering logic based on whether the entry has an institution link, a thesis link, both, or neither.

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";
import { extractLink, buildLocation, buildThesisLink } from "src/lib/cv-helpers";

interface Props {
  cv: I18nCV;
  items: Array<{ data: any }>;
  locale: string;
}

const { cv, items, locale } = Astro.props;
---

<section
  id={createHtmlId(cv.ui.education)}
  class="[&_li]:text-pretty [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:text-sm [&_ul]:text-zinc-300"
>
  <h2>{cv.ui.education}</h2>
  {
    items.map((entry, index: number) => {
      const data = entry.data;
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
      const institutionLink = extractLink(data.Link);
      const thesisLink = buildThesisLink(data.Thesis, locale);

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

          {institutionLink && thesisLink ? (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0 flex">
                <a href={thesisLink} class="grow hover:text-emerald-400">
                  {data.Name}
                </a>
              </h3>
              <h4>
                <a
                  href={institutionLink}
                  class="inline-flex items-center gap-1 hover:text-emerald-400"
                >
                  {data.Organization}
                  <Icon
                    name="mdi:external-link"
                    class="size-3 shrink-0 print:hidden"
                  />
                </a>
                 | {buildLocation(data)}
              </h4>

              {data.Description && data.Description.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>{data.Description}</p>
                </div>
              )}

              {data.Supervisors && data.Supervisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.supervisors}:
                    {data.Supervisors.map(
                      (supervisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${supervisor}`
                          : `${supervisor}, `,
                    )}
                  </p>
                </div>
              )}

              {data.Advisors && data.Advisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.advisors}:
                    {data.Advisors.map(
                      (advisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${advisor}`
                          : `${advisor}, `,
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
                {data.Organization} | {buildLocation(data)}
              </h4>

              {data.Description && data.Description.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>{data.Description}</p>
                </div>
              )}

              {data.Supervisors && data.Supervisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.supervisors}:
                    {data.Supervisors.map(
                      (supervisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${supervisor}`
                          : `${supervisor}, `,
                    )}
                  </p>
                </div>
              )}

              {data.Advisors && data.Advisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.advisors}:
                    {data.Advisors.map(
                      (advisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${advisor}`
                          : `${advisor}, `,
                    )}
                  </p>
                </div>
              )}
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">{data.Name}</h3>
              <h4>
                {data.Organization} | {buildLocation(data)}
              </h4>

              {data.Description && data.Description.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>{data.Description}</p>
                </div>
              )}

              {data.Supervisors && data.Supervisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.supervisors}:
                    {data.Supervisors.map(
                      (supervisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${supervisor}`
                          : `${supervisor}, `,
                    )}
                  </p>
                </div>
              )}

              {data.Advisors && data.Advisors.length > 0 && (
                <div class="mb-1 ml-1 text-sm text-zinc-300">
                  <p>
                    {cv.ui.advisors}:
                    {data.Advisors.map(
                      (advisor: string, idx: number, arr: string[]) =>
                        idx === arr.length - 1
                          ? `${advisor}`
                          : `${advisor}, `,
                    )}
                  </p>
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvEducation.astro
git commit -m "Add CvEducation component"
```

---

### Task 7: Create CvScholarships component

**Files:**
- Create: `src/components/cv/CvScholarships.astro`

- [ ] **Step 1: Create `src/components/cv/CvScholarships.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";
import { extractLink, buildLocation } from "src/lib/cv-helpers";

interface Props {
  cv: I18nCV;
  items: Array<{ data: any }>;
}

const { cv, items } = Astro.props;
---

<section id={createHtmlId(cv.ui.scholarships)}>
  <h2>{cv.ui.scholarships}</h2>
  {
    items.map((entry, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
      const link = extractLink(entry.data.Link);

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
            <time
              datetime={new Date(entry.data.DateStart || "").toDateString()}
            >
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
                {entry.data.Organization} | {buildLocation(entry.data)}
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
                {entry.data.Organization} | {buildLocation(entry.data)}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvScholarships.astro
git commit -m "Add CvScholarships component"
```

---

### Task 8: Create CvPublications component

**Files:**
- Create: `src/components/cv/CvPublications.astro`

- [ ] **Step 1: Create `src/components/cv/CvPublications.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";

interface Props {
  cv: I18nCV;
  items: Array<{
    title: string;
    date: string;
    link: string;
    publisher: string;
    location: string;
    authors: string[];
  }>;
}

const { cv, items } = Astro.props;
---

<section id={createHtmlId(cv.ui.publications)}>
  <h2>{cv.ui.publications}</h2>
  {
    items.map((publication, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";

      return (
        <div
          class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
        >
          <div class="timeline-wrapper">
            <div class="timeline-top" />
            <time datetime={new Date(publication.date).toDateString()}>
              {getMonthYear(publication.date)}
            </time>
            <div class="timeline" />
          </div>

          {publication.link ? (
            <a href={publication.link} class={`item-text ${bgClass}`}>
              <h3 class="mb-0 flex">
                <span class="grow">{publication.title}</span>
                <Icon
                  name="mdi:external-link"
                  class="mt-2 size-3 shrink-0 print:hidden"
                />
              </h3>
              <h4>
                {publication.publisher}
                {publication.location ? ` | ${publication.location}` : ""}
              </h4>
              <p class="flex flex-wrap text-sm text-zinc-300">
                {publication.authors.map((author, authorIndex, array) => (
                  <span class="mr-1 text-nowrap">
                    {authorIndex + 1 === array.length
                      ? author
                      : `${author}, `}
                  </span>
                ))}
              </p>
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">{publication.title}</h3>
              <h4>
                {publication.publisher}
                {publication.location ? ` | ${publication.location}` : ""}
              </h4>
              <p class="flex flex-wrap text-sm text-zinc-300">
                {publication.authors.map((author, authorIndex, array) => (
                  <span class="mr-1 text-nowrap">
                    {authorIndex + 1 === array.length
                      ? author
                      : `${author}, `}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      );
    })
  }
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvPublications.astro
git commit -m "Add CvPublications component"
```

---

### Task 9: Create CvCertifications component

**Files:**
- Create: `src/components/cv/CvCertifications.astro`

- [ ] **Step 1: Create `src/components/cv/CvCertifications.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";
import { extractLink } from "src/lib/cv-helpers";

interface Props {
  cv: I18nCV;
  items: Array<{ data: any }>;
}

const { cv, items } = Astro.props;
---

<section id={createHtmlId(cv.ui.certifications)}>
  <h2>{cv.ui.certifications}</h2>
  {
    items.map((entry, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
      const link = extractLink(entry.data.Link);

      return (
        <div
          class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
        >
          <div class="timeline-wrapper">
            <div class="timeline-top" />
            <time
              datetime={new Date(entry.data.DateStart || "").toDateString()}
            >
              {getMonthYear(entry.data.DateStart || "")}
            </time>
            <div class="timeline" />
          </div>

          {link ? (
            <a href={link} class={`item-text ${bgClass}`}>
              <h3 class="mb-0 flex">
                <span class="grow">
                  {entry.data.Name}
                  {entry.data.CredentialID && (
                    <span class="ml-1 text-xs text-zinc-300">
                      ({entry.data.CredentialID})
                    </span>
                  )}
                </span>
                <Icon
                  name="mdi:external-link"
                  class="mt-2 size-3 shrink-0 print:hidden"
                />
              </h3>
              <h4>
                {entry.data.Organization}
                {entry.data.ValidUntil && (
                  <span class="ml-1 text-xs text-zinc-300">
                    | {cv.ui.validUntil}:{" "}
                    {getMonthYear(entry.data.ValidUntil)}
                  </span>
                )}
              </h4>
              {entry.data.Description && (
                <p class="text-sm text-pretty text-zinc-300">
                  {entry.data.Description}
                </p>
              )}
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">
                {entry.data.Name}
                {entry.data.CredentialID && (
                  <span class="ml-1 text-xs text-zinc-300">
                    ({entry.data.CredentialID})
                  </span>
                )}
              </h3>
              <h4>
                {entry.data.Organization}
                {entry.data.ValidUntil && (
                  <span class="ml-1 text-xs text-zinc-300">
                    | {cv.ui.validUntil}:{" "}
                    {getMonthYear(entry.data.ValidUntil)}
                  </span>
                )}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvCertifications.astro
git commit -m "Add CvCertifications component"
```

---

### Task 10: Create CvEngagements component

**Files:**
- Create: `src/components/cv/CvEngagements.astro`

- [ ] **Step 1: Create `src/components/cv/CvEngagements.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";

interface Props {
  cv: I18nCV;
  heading: string;
  items: Array<{
    title: string;
    startDate: string;
    endDate?: string;
    link: string;
    organization: string;
    location: string;
    type: string;
    description?: string;
  }>;
}

const { cv, heading, items } = Astro.props;
---

<section id={createHtmlId(heading)}>
  <h2>{heading}</h2>
  {
    items.map((engagement, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";

      return (
        <div
          class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
        >
          <div class="timeline-wrapper">
            <div class="timeline-top" />
            {engagement.endDate ? (
              <time datetime={new Date(engagement.endDate).toDateString()}>
                {getMonthYear(engagement.endDate)}
              </time>
            ) : (
              ""
            )}
            <time datetime={new Date(engagement.startDate).toDateString()}>
              {getMonthYear(engagement.startDate)}
            </time>
            <div class="timeline" />
          </div>

          {engagement.link ? (
            <a href={engagement.link} class={`item-text ${bgClass}`}>
              <h3 class="mb-0 flex">
                <span class="grow">{engagement.title}</span>
                <Icon
                  name="mdi:external-link"
                  class="mt-2 size-3 shrink-0 print:hidden"
                />
              </h3>
              <h4>
                {engagement.organization}
                {engagement.location ? ` | ${engagement.location}` : ""}
              </h4>
              {
                <p class="text-sm text-pretty text-zinc-300 italic">
                  {
                    cv.ui.engagementTypes[
                      engagement.type as keyof typeof cv.ui.engagementTypes
                    ]
                  }
                </p>
              }
              {engagement.description && (
                <p class="text-sm text-pretty text-zinc-300">
                  {engagement.description}
                </p>
              )}
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">{engagement.title}</h3>
              <h4>
                {engagement.organization}
                {engagement.location ? ` | ${engagement.location}` : ""}
              </h4>
              {
                <p class="text-sm text-pretty text-zinc-300 italic">
                  {
                    cv.ui.engagementTypes[
                      engagement.type as keyof typeof cv.ui.engagementTypes
                    ]
                  }
                </p>
              }
              {engagement.description && (
                <p class="text-sm text-pretty text-zinc-300">
                  {engagement.description}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvEngagements.astro
git commit -m "Add CvEngagements component"
```

---

### Task 11: Create CvCoursesAttended component

**Files:**
- Create: `src/components/cv/CvCoursesAttended.astro`

- [ ] **Step 1: Create `src/components/cv/CvCoursesAttended.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";
import { extractLink, extractName, buildLocation } from "src/lib/cv-helpers";

interface Props {
  cv: I18nCV;
  items: Array<{ data: any }>;
}

const { cv, items } = Astro.props;
---

<section id={createHtmlId(cv.ui.coursesAttended)}>
  <h2>{cv.ui.coursesAttended}</h2>
  {
    items.map((entry, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";
      const link = extractLink(entry.data.Link);
      const instructor = entry.data.Authors?.map((a: any) =>
        extractName(a),
      ).join(", ");

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
              ""
            )}
            <time
              datetime={new Date(entry.data.DateStart || "").toDateString()}
            >
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
                {entry.data.Organization}
                {buildLocation(entry.data)
                  ? ` | ${buildLocation(entry.data)}`
                  : ""}
              </h4>
              {instructor && (
                <p class="text-sm text-pretty text-zinc-300">{instructor}</p>
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
                {entry.data.Organization}
                {buildLocation(entry.data)
                  ? ` | ${buildLocation(entry.data)}`
                  : ""}
              </h4>
              {instructor && (
                <p class="text-sm text-pretty text-zinc-300">{instructor}</p>
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvCoursesAttended.astro
git commit -m "Add CvCoursesAttended component"
```

---

### Task 12: Create CvProjects component

**Files:**
- Create: `src/components/cv/CvProjects.astro`

- [ ] **Step 1: Create `src/components/cv/CvProjects.astro`**

```astro
---
import { Icon } from "astro-icon/components";
import type { I18nCV } from "src/i18n/cv/types";
import { createHtmlId, getMonthYear } from "src/i18n/utils";

interface Props {
  cv: I18nCV;
  items: Array<{
    title: string;
    startDate: string;
    endDate?: string;
    link: string;
    company: string;
    location: string;
    category: string;
    description?: string;
  }>;
}

const { cv, items } = Astro.props;
---

<section id={createHtmlId(cv.ui.projectsList)}>
  <h2>{cv.ui.projectsList}</h2>
  {
    items.map((work, index: number) => {
      const bgClass =
        index % 2 === 0 ? "bg-[rgb(25,25,25)]" : "bg-[rgb(21,21,21)]";

      return (
        <div
          class={`group grid grid-cols-[100px_minmax(100px,1fr)] ${index % 2 === 0 ? "group-odd" : "group-even"}`}
        >
          <div class="timeline-wrapper">
            <div class="timeline-top" />
            {work.endDate ? (
              <time datetime={new Date(work.endDate).toDateString()}>
                {getMonthYear(work.endDate)}
              </time>
            ) : (
              ""
            )}
            <time datetime={new Date(work.startDate).toDateString()}>
              {getMonthYear(work.startDate)}
            </time>
            <div class="timeline" />
          </div>

          {work.link ? (
            <a href={work.link} class={`item-text ${bgClass}`}>
              <h3 class="mb-0 flex">
                <span class="grow">{work.title}</span>
                <Icon
                  name="mdi:external-link"
                  class="mt-2 size-3 shrink-0 print:hidden"
                />
              </h3>
              <h4>
                {work.company}
                {work.location ? ` | ${work.location}` : ""}
              </h4>
              {work.category && (
                <p class="text-sm text-pretty text-zinc-300 italic">
                  {work.category}
                </p>
              )}
              {work.description && (
                <p class="text-sm text-pretty text-zinc-300">
                  {work.description}
                </p>
              )}
            </a>
          ) : (
            <div class={`item-text ${bgClass}`}>
              <h3 class="mb-0">{work.title}</h3>
              <h4>
                {work.company}
                {work.location ? ` | ${work.location}` : ""}
              </h4>
              {work.category && (
                <p class="text-sm text-pretty text-zinc-300 italic">
                  {work.category}
                </p>
              )}
              {work.description && (
                <p class="text-sm text-pretty text-zinc-300">
                  {work.description}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/cv/CvProjects.astro
git commit -m "Add CvProjects component"
```

---

### Task 13: Rewrite cv.astro as thin orchestrator

**Files:**
- Modify: `src/pages/[...locale]/cv.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/[...locale]/cv.astro`**

Replace the entire file with:

```astro
---
import Base from "@/layouts/Base.astro";
import CvContainer from "@/components/cv/CvContainer.astro";
import CvHeader from "@/components/cv/CvHeader.astro";
import CvSkills from "@/components/cv/CvSkills.astro";
import CvExperiences from "@/components/cv/CvExperiences.astro";
import CvEducation from "@/components/cv/CvEducation.astro";
import CvScholarships from "@/components/cv/CvScholarships.astro";
import CvPublications from "@/components/cv/CvPublications.astro";
import CvCertifications from "@/components/cv/CvCertifications.astro";
import CvEngagements from "@/components/cv/CvEngagements.astro";
import type { I18nCV } from "src/i18n/cv/types";
import type { I18nMeta } from "src/i18n/meta/types";
import { getI18n } from "src/i18n/utils";
import { getLocale } from "src/lib/routes-helpers";
export { getStaticPaths } from "src/lib/routes-helpers";
import { getCollection } from "astro:content";
import { extractName, extractFirstName, extractLink, sortByOrder } from "src/lib/cv-helpers";

const locale = getLocale(Astro.params);

const meta = await getI18n<I18nMeta>("meta", locale);
const cv = await getI18n<I18nCV>("cv", locale);

// Publications (all)
const publicationsCollection = await getCollection("publications", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const publications = publicationsCollection
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
  )
  .map((p) => ({
    title: p.data.Name,
    date: p.data.DateStart || "",
    link: extractLink(p.data.Link),
    publisher: p.data.Place || p.data.Event || "",
    location: extractFirstName(p.data.City),
    authors: p.data.Authors?.map((a: any) => extractName(a)) || [],
  }));

// Engagements (>= 2023)
const teachingCollection = await getCollection("teaching", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const engagements = teachingCollection
  .filter((t) => {
    if (!t.data.DateStart) return false;
    return new Date(t.data.DateStart) >= new Date("2023-01-01");
  })
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
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

// Skills (all)
const skillsCollection = await getCollection("skills", ({ id }) =>
  id.startsWith(`${locale}/`) || id.startsWith("en/"),
);
const skills = {
  programming: skillsCollection.filter((s) => s.data.Category === "Programming").sort(sortByOrder),
  frameworks: skillsCollection.filter((s) => s.data.Category === "Framework").sort(sortByOrder),
  databases: skillsCollection.filter((s) => s.data.Category === "Database").sort(sortByOrder),
  design: skillsCollection.filter((s) => s.data.Category === "Design tool").sort(sortByOrder),
  specialized: skillsCollection
    .filter((s) => s.data.Category === "Specialization")
    .sort(sortByOrder)
    .map((s) => s.data.Name),
  languages: skillsCollection.filter((s) => s.data.Category === "Language").sort(sortByOrder),
};

// Experiences (>= 2015)
const experiencesCollection = await getCollection("experiences", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const experiences = await Promise.all(
  experiencesCollection
    .filter((e) => {
      if (!e.data.DateStart) return false;
      return new Date(e.data.DateStart) >= new Date("2015");
    })
    .sort(
      (a, b) =>
        new Date(b.data.DateStart || "").getTime() -
        new Date(a.data.DateStart || "").getTime(),
    )
    .map(async (entry) => ({
      data: entry.data,
      Content: (await entry.render()).Content,
    })),
);

// Education (DateEnd >= 2014)
const educationCollection = await getCollection("education", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const education = educationCollection
  .filter((e) => {
    if (e.data.DateEnd === undefined) return true;
    return new Date(e.data.DateEnd) >= new Date("2014");
  })
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
  );

// Scholarships (all)
const scholarships = (
  await getCollection("scholarships", ({ id }) => id.startsWith(`${locale}/`))
).sort(
  (a, b) =>
    new Date(b.data.DateStart || "").getTime() -
    new Date(a.data.DateStart || "").getTime(),
);

// Certifications (>= 2015)
const certifications = (
  await getCollection("certifications", ({ id }) => id.startsWith(`${locale}/`))
)
  .filter((c) => {
    if (!c.data.DateStart) return false;
    return new Date(c.data.DateStart) >= new Date("2015");
  })
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
  );
---

<Base
  meta={{
    title: cv.meta.titleSimple,
    description: cv.meta.descriptionSimple,
    coverAlt: cv.meta.coverAlt,
    coverImage: "@/assets/avatars/daniel-locatelli-v1.png",
    slug: "cv",
  }}
>
  <CvContainer footerUrl="daniellocatelli.com/cv">
    <CvHeader cv={cv} meta={meta} />
    <section id="summary">
      <h2>{cv.ui.summary}</h2>
      <p class="text-pretty">{cv.summary}</p>
    </section>
    <CvSkills cv={cv} skills={skills} />
    <CvExperiences cv={cv} items={experiences} />
    <CvEducation cv={cv} items={education} locale={locale} />
    <CvScholarships cv={cv} items={scholarships} />
    <CvPublications cv={cv} items={publications} />
    <CvCertifications cv={cv} items={certifications} />
    <CvEngagements cv={cv} items={engagements} heading={cv.ui.engagementSimple} />
  </CvContainer>
</Base>
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/\[...locale\]/cv.astro
git commit -m "Rewrite cv.astro to use shared CV components"
```

---

### Task 14: Rewrite full-cv.astro as thin orchestrator

**Files:**
- Modify: `src/pages/[...locale]/full-cv.astro` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/[...locale]/full-cv.astro`**

Replace the entire file with:

```astro
---
import Base from "@/layouts/Base.astro";
import CvContainer from "@/components/cv/CvContainer.astro";
import CvHeader from "@/components/cv/CvHeader.astro";
import CvSkills from "@/components/cv/CvSkills.astro";
import CvExperiences from "@/components/cv/CvExperiences.astro";
import CvEducation from "@/components/cv/CvEducation.astro";
import CvScholarships from "@/components/cv/CvScholarships.astro";
import CvPublications from "@/components/cv/CvPublications.astro";
import CvCertifications from "@/components/cv/CvCertifications.astro";
import CvEngagements from "@/components/cv/CvEngagements.astro";
import CvCoursesAttended from "@/components/cv/CvCoursesAttended.astro";
import CvProjects from "@/components/cv/CvProjects.astro";
import type { I18nCV } from "src/i18n/cv/types";
import type { I18nMeta } from "src/i18n/meta/types";
import { getI18n } from "src/i18n/utils";
import { getLocale } from "src/lib/routes-helpers";
export { getStaticPaths } from "src/lib/routes-helpers";
import { getCollection } from "astro:content";
import { extractName, extractFirstName, extractLink, sortByOrder } from "src/lib/cv-helpers";

const locale = getLocale(Astro.params);

const meta = await getI18n<I18nMeta>("meta", locale);
const cv = await getI18n<I18nCV>("cv", locale);

// Publications (all, no filter)
const publicationsCollection = await getCollection("publications", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const publications = publicationsCollection
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
  )
  .map((p) => ({
    title: p.data.Name,
    date: p.data.DateStart || "",
    link: extractLink(p.data.Link),
    publisher: p.data.Place || p.data.Event || "",
    location: extractFirstName(p.data.City),
    authors: p.data.Authors?.map((a: any) => extractName(a)) || [],
  }));

// Engagements (all, no date filter)
const teachingCollection = await getCollection("teaching", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const engagements = teachingCollection
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
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

// Skills (all)
const skillsCollection = await getCollection("skills", ({ id }) =>
  id.startsWith(`${locale}/`) || id.startsWith("en/"),
);
const skills = {
  programming: skillsCollection.filter((s) => s.data.Category === "Programming").sort(sortByOrder),
  frameworks: skillsCollection.filter((s) => s.data.Category === "Framework").sort(sortByOrder),
  databases: skillsCollection.filter((s) => s.data.Category === "Database").sort(sortByOrder),
  design: skillsCollection.filter((s) => s.data.Category === "Design tool").sort(sortByOrder),
  specialized: skillsCollection
    .filter((s) => s.data.Category === "Specialization")
    .sort(sortByOrder)
    .map((s) => s.data.Name),
  languages: skillsCollection.filter((s) => s.data.Category === "Language").sort(sortByOrder),
};

// Experiences (all, no date filter)
const experiencesCollection = await getCollection("experiences", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const experiences = await Promise.all(
  experiencesCollection
    .sort(
      (a, b) =>
        new Date(b.data.DateStart || "").getTime() -
        new Date(a.data.DateStart || "").getTime(),
    )
    .map(async (entry) => ({
      data: entry.data,
      Content: (await entry.render()).Content,
    })),
);

// Education (all, no date filter)
const educationCollection = await getCollection("education", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const education = educationCollection.sort(
  (a, b) =>
    new Date(b.data.DateStart || "").getTime() -
    new Date(a.data.DateStart || "").getTime(),
);

// Scholarships (all)
const scholarships = (
  await getCollection("scholarships", ({ id }) => id.startsWith(`${locale}/`))
).sort(
  (a, b) =>
    new Date(b.data.DateStart || "").getTime() -
    new Date(a.data.DateStart || "").getTime(),
);

// Certifications (all, no date filter)
const certifications = (
  await getCollection("certifications", ({ id }) => id.startsWith(`${locale}/`))
).sort(
  (a, b) =>
    new Date(b.data.DateStart || "").getTime() -
    new Date(a.data.DateStart || "").getTime(),
);

// Courses Attended (all)
const coursesAttended = (
  await getCollection("courses-attended", ({ id }) => id.startsWith(`${locale}/`))
).sort(
  (a, b) =>
    new Date(b.data.DateStart || "").getTime() -
    new Date(a.data.DateStart || "").getTime(),
);

// Projects / Works (all)
const projectsCollection = await getCollection("projects", ({ id }) =>
  id.startsWith(`${locale}/`),
);
const works = projectsCollection
  .sort(
    (a, b) =>
      new Date(b.data.DateStart || "").getTime() -
      new Date(a.data.DateStart || "").getTime(),
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
---

<Base
  meta={{
    title: cv.meta.titleFull,
    description: cv.meta.descriptionFull,
    coverAlt: cv.meta.coverAlt,
    coverImage: "@/assets/avatars/daniel-locatelli-v1.png",
    slug: "full-cv",
  }}
>
  <CvContainer footerUrl="daniellocatelli.com/full-cv">
    <CvHeader cv={cv} meta={meta} />
    <section id="summary">
      <h2>{cv.ui.summary}</h2>
      <p class="text-pretty">{cv.summary}</p>
    </section>
    <CvSkills cv={cv} skills={skills} />
    <CvExperiences cv={cv} items={experiences} />
    <CvEducation cv={cv} items={education} locale={locale} />
    <CvScholarships cv={cv} items={scholarships} />
    <CvPublications cv={cv} items={publications} />
    <CvCertifications cv={cv} items={certifications} />
    <CvEngagements cv={cv} items={engagements} heading={cv.ui.engagementFull} />
    <CvCoursesAttended cv={cv} items={coursesAttended} />
    <CvProjects cv={cv} items={works} />
  </CvContainer>
</Base>
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/\[...locale\]/full-cv.astro
git commit -m "Rewrite full-cv.astro to use shared CV components"
```

---

### Task 15: Final build verification and cleanup commit

**Files:**
- None new — verification only

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: `astro check` passes, then `astro build` completes with all pages generated including `/cv`, `/full-cv`, `/pt/cv`, `/pt/full-cv`, `/de/cv`, `/de/full-cv`.

- [ ] **Step 2: Verify generated pages exist**

Run: `find dist -path "*cv*" -name "index.html" | sort`
Expected: 6 HTML files (3 locales x 2 variants)

- [ ] **Step 3: Spot-check HTML output matches**

Run a quick diff of the cv page body to ensure no rendering changes were introduced:
```bash
# Build the old version from git for comparison (optional manual step)
# Or visually compare by running npm run preview and checking /cv and /full-cv
```

- [ ] **Step 4: Final commit if any fixups needed**

If any issues were found and fixed in earlier steps, create a final cleanup commit.
