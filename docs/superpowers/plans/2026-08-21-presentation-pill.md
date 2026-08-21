# Presentation Pill and Slide-Deck Pill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Content pages get two distinct CTA pills below the title: "Watch presentation" (play icon, YouTube in a new tab, driven by a new `Presentation` frontmatter URL) and "Open slide deck" (slides icon, auto-detected in-repo deck).

**Architecture:** One new optional `Presentation` field in the shared Zod `pageSchema`; the subpage layout renders a flex row of up to two pills; four YouTube talk entries migrate their URL from `Link` to `Presentation` (en/pt/de); every `Link` consumer (CV pages, agent markdown variant, knowledge generator) learns about `Presentation`, and the knowledge generator also starts reading `<slug>/index.md` subfolder entries.

**Tech Stack:** Astro 6, TypeScript strict, Zod content schema, Tailwind 4, Playwright e2e, `node:test` unit tests, pnpm. Spec: `docs/superpowers/specs/2026-08-21-presentation-pill-design.md`.

## Global Constraints

- Three locales (en, pt, de): every content and i18n change lands in all three in the same commit.
- No em dashes in content text. Content headings start at h2.
- Use `pnpm`, never `npm`.
- Do not bump `Updated:` in migrated entries (metadata-only change).
- Do not commit regenerated `knowledge/*.md` files in this feature; `/sync-knowledge` owns them.
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Schema, i18n string, and the two-pill row

**Files:**
- Modify: `src/content.config.ts:199-205` (add `Presentation` next to `Link`)
- Modify: `src/i18n/subpage/type.ts:29`, `src/i18n/subpage/en.ts:31`, `src/i18n/subpage/pt.ts:31`, `src/i18n/subpage/de.ts:31`
- Modify: `src/pages/[...locale]/[...subpage].astro:20-34` (import meta i18n) and `:308-326` (pill markup)
- Test: `tests/e2e/subpages.spec.ts`

**Interfaces:**
- Produces: `entry.data.Presentation?: string` (validated URL) on every non-deck collection; i18n key `watchPresentation`.

- [ ] **Step 1: Write the failing e2e test**

Append to `tests/e2e/subpages.spec.ts` inside `test.describe("Subpages", ...)`:

```ts
  test("talk with video and deck shows both pills", async ({ page }) => {
    await page.goto("/teaching/digital-futures-2026");
    const watch = page.getByRole("link", { name: /Watch presentation/ });
    await expect(watch).toBeVisible();
    await expect(watch).toHaveAttribute("href", /youtube\.com/);
    await expect(watch).toHaveAttribute("target", "_blank");
    const deck = page.getByRole("link", { name: "Open slide deck" });
    await expect(deck).toBeVisible();
    await expect(deck).toHaveAttribute("href", /\/teaching\/digital-futures-2026\/deck$/);
  });

  test("talk with video only shows no deck pill", async ({ page }) => {
    await page.goto("/teaching/digital-futures-2023");
    await expect(page.getByRole("link", { name: /Watch presentation/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open slide deck" })).toHaveCount(0);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec playwright test tests/e2e/subpages.spec.ts -g "pills|deck pill"`
Expected: FAIL (no "Watch presentation" link exists yet). Playwright starts the dev server itself.

- [ ] **Step 3: Add `Presentation` to the schema**

In `src/content.config.ts`, directly after the `Link:` union (ends at line ~205 with `.optional(),`), add:

```ts
  Presentation: z.string().url().optional(),
```

- [ ] **Step 4: Add the i18n key**

`src/i18n/subpage/type.ts`: after `openSlideDeck: string,` add `watchPresentation: string,`.

`src/i18n/subpage/en.ts`: after `openSlideDeck: "Open slide deck",` add `watchPresentation: "Watch presentation",`.

`src/i18n/subpage/pt.ts`: after `openSlideDeck: "Abrir slides",` add `watchPresentation: "Assistir apresentação",`.

`src/i18n/subpage/de.ts`: after `openSlideDeck: "Folien öffnen",` add `watchPresentation: "Präsentation ansehen",`.

- [ ] **Step 5: Import the meta i18n in the subpage layout**

In `src/pages/[...locale]/[...subpage].astro` frontmatter, next to the existing `import type { I18nSubpage } from "src/i18n/subpage/type";` add:

```ts
import type { I18nMeta } from "src/i18n/meta/types";
```

and after `const t = await getI18n<I18nSubpage>("subpage", locale);` add:

```ts
const meta = await getI18n<I18nMeta>("meta", locale);
const presentationHref = subpage.data.Presentation;
```

- [ ] **Step 6: Replace the single pill with the two-pill row**

Replace the whole block from `{` / `deckHref && (` through its closing `)` / `}` (currently lines ~308-326, the `<a href={deckHref} ...>` with the `M8 5v14l11-7z` path) with:

```astro
      {
        (presentationHref || deckHref) && (
          <div class="mx-4 mb-8 flex flex-wrap gap-2 sm:mx-0">
            {presentationHref && (
              <a
                href={presentationHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.watchPresentation} (${meta.openNewTab})`}
                class="inline-flex w-fit items-center gap-2 rounded-full border border-green-600 bg-green-600/10 px-4 py-2 text-sm font-medium text-green-400 transition hover:bg-green-600/20 hover:text-green-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t.watchPresentation}
              </a>
            )}
            {deckHref && (
              <a
                href={deckHref}
                class="inline-flex w-fit items-center gap-2 rounded-full border border-green-600 bg-green-600/10 px-4 py-2 text-sm font-medium text-green-400 transition hover:bg-green-600/20 hover:text-green-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="7" width="15" height="12" rx="1.5" />
                  <path d="M7 4h14v12" />
                </svg>
                {t.openSlideDeck}
              </a>
            )}
          </div>
        )
      }
```

(The deck glyph is a front rectangle with a second slide offset behind it: a "stacked slides" icon.)

- [ ] **Step 7: Type-check**

Run: `pnpm exec astro check`
Expected: 0 errors (the `watchPresentation` key is required by `I18nSubpage`, so a missing locale would fail here).

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/i18n/subpage/ "src/pages/[...locale]/[...subpage].astro" tests/e2e/subpages.spec.ts
git commit -m "feat(subpage): Presentation frontmatter field and two-pill CTA row (video + deck)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

The e2e test still fails until Task 2 migrates the content; that is expected.

---

### Task 2: Migrate the four YouTube talks from `Link` to `Presentation` (en, pt, de)

**Files:**
- Modify (12 files):
  - `src/content/teaching/{en,pt,de}/digital-futures-2023.mdx:11-13`
  - `src/content/teaching/{en,pt,de}/digital-futures-2026/index.md:23-25`
  - `src/content/teaching/{en,pt,de}/nature-and-digital-reproducing-natural-processes-with-computational-design-at-puc.mdx:14-16`
  - `src/content/teaching/{en,pt,de}/_graphisoft-x-2023.md:9`

**Interfaces:**
- Consumes: `Presentation` schema field from Task 1.

- [ ] **Step 1: Replace the `Link` blocks**

In each of the 9 object-form files, replace the three lines

```yaml
Link:
  Text: "<any localized text>"
  Href: "<youtube url>"
```

with a single line keeping the same URL:

```yaml
Presentation: "<youtube url>"
```

URLs: DF2023 `https://www.youtube.com/watch?v=s-hKf0NhooA`; DF2026 `https://www.youtube.com/watch?v=E0wMJIbP9r8`; PUC `https://youtu.be/J303rzg7y0U`.

In the 3 `_graphisoft-x-2023.md` files replace `Link: "https://www.youtube.com/watch?v=baVNIbWtMQo"` with `Presentation: "https://www.youtube.com/watch?v=baVNIbWtMQo"`.

Do not touch body `<YouTube .../>` embeds or any other frontmatter.

- [ ] **Step 2: Verify nothing else still points a YouTube URL through `Link`**

Run: `grep -rn "Link:" -A2 src/content/teaching | grep -i "youtu"`
Expected: no output.

- [ ] **Step 3: Run the e2e tests from Task 1**

Run: `pnpm exec playwright test tests/e2e/subpages.spec.ts -g "pills|deck pill"`
Expected: 2 passed.

- [ ] **Step 4: Commit**

```bash
git add src/content/teaching
git commit -m "content(teaching): move YouTube talk links from Link to Presentation (en, pt, de)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: CV pages fall back to `Presentation` for the external link

**Files:**
- Modify: `src/pages/[...locale]/cv.astro:62`, `src/pages/[...locale]/full-cv.astro:60`, `src/pages/[...locale]/phd-cv.astro:56`

**Interfaces:**
- Consumes: `extractLink(linkProp: any): string` and `localizeLink(link: string, locale: string): string` from `src/lib/cv-helpers.ts` (unchanged).

- [ ] **Step 1: Change the three call sites**

In each file, the teaching `.map((t) => ({ ... }))` has the line

```ts
    link: localizeLink(extractLink(t.data.Link), locale),
```

Replace with:

```ts
    link: localizeLink(extractLink(t.data.Link) || t.data.Presentation || "", locale),
```

- [ ] **Step 2: Verify in the browser**

Run: `pnpm dev` (detached; use `pnpm exec astro dev status` / `logs` if needed), then `curl -s http://localhost:4321/full-cv | grep -o 'href="https://www.youtube.com/watch?v=baVNIbWtMQo"'`
Expected: one match (Graphisoft X 2023, a draft entry that only appears on the CV pages). Also `curl -s http://localhost:4321/full-cv | grep -c "E0wMJIbP9r8"` returns at least 1.

- [ ] **Step 3: Type-check and commit**

Run: `pnpm exec astro check` (expected 0 errors), then:

```bash
git add "src/pages/[...locale]/cv.astro" "src/pages/[...locale]/full-cv.astro" "src/pages/[...locale]/phd-cv.astro"
git commit -m "fix(cv): keep talk links by falling back to Presentation when Link is absent

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Agent markdown variant emits `Presentation`

**Files:**
- Modify: `src/pages/[...path].md.ts:61-64`

- [ ] **Step 1: Replace the `Link` block in the structured fallback**

Replace

```ts
  if (data.Link) {
    lines.push("");
    lines.push(`**Link:** ${data.Link}`);
  }
```

with

```ts
  if (data.Link) {
    const link =
      typeof data.Link === "string"
        ? data.Link
        : Array.isArray(data.Link)
          ? data.Link
              .map((l: any) => (typeof l === "string" ? l : `${l.Text ?? l.Href} (${l.Href})`))
              .join(", ")
          : `${data.Link.Text} (${data.Link.Href})`;
    lines.push("");
    lines.push(`**Link:** ${link}`);
  }
  if (data.Presentation) {
    lines.push("");
    lines.push(`**Presentation:** ${data.Presentation}`);
  }
```

- [ ] **Step 2: Verify**

With the dev server running: `curl -s http://localhost:4321/teaching/digital-futures-2026.md | grep -n "Presentation"`
Expected: a line `**Presentation:** https://www.youtube.com/watch?v=E0wMJIbP9r8` only if the structured fallback is used; if the page has a markdown body the main path is used instead and the grep may be empty. In that case confirm the fallback by checking a deck-only page: `curl -s http://localhost:4321/teaching/glued-timber-plates-2026-08.md` renders without `[object Object]`. Either way `pnpm exec astro check` must pass.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[...path].md.ts"
git commit -m "feat(md-variant): emit Presentation and render object-form Link in structured fallback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Knowledge generator emits `Presentation` and reads subfolder entries

**Files:**
- Modify: `src/scripts/generate-knowledge.ts:88-104` (`readContentFiles`) and `:154-160` (`Link` emit in `processContentCollections`)

- [ ] **Step 1: Make `readContentFiles` pick up `<slug>/index.md(x)`**

Replace the function body with:

```ts
function readContentFiles(
  collection: string,
  locale: string,
): { data: Record<string, any>; body: string; filename: string }[] {
  const dir = path.join(CONTENT_DIR, collection, locale);
  if (!fs.existsSync(dir)) return [];

  const sources: { file: string; filename: string }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      // Folder entries: teaching/<locale>/<slug>/index.md(x) next to deck.mdx.
      // Expose them under "<slug>.md" so downstream slug/URL logic is unchanged.
      const idx = ["index.md", "index.mdx"]
        .map((f) => path.join(full, f))
        .find((f) => fs.existsSync(f));
      if (idx) sources.push({ file: idx, filename: `${name}.md` });
    } else if (name.endsWith(".md") || name.endsWith(".mdx")) {
      sources.push({ file: full, filename: name });
    }
  }

  return sources
    .map(({ file, filename }) => {
      const raw = fs.readFileSync(file, "utf-8");
      const { data, body } = parseFrontmatter(raw);
      return { data, body, filename };
    })
    .filter((entry) => entry.data.Name);
}
```

Note: `processHomepage` looks for `filename === "index.md"` inside `pages/<locale>/`; that is a flat file, unaffected.

- [ ] **Step 2: Emit `Presentation` next to `Link`**

After the `if (data.Link) { ... }` block (~line 154-160), add:

```ts
        if (data.Presentation) metaParts.push(`Presentation: ${data.Presentation}`);
```

- [ ] **Step 3: Run the generator and verify**

Run: `pnpm exec tsx src/scripts/generate-knowledge.ts`
Then: `ls knowledge | grep digital-futures-2026` (expected: `teaching-digital-futures-2026-en.md`, `-pt.md`, `-de.md`) and `grep -l "Presentation: https://www.youtube.com/watch?v=E0wMJIbP9r8" knowledge/teaching-digital-futures-2026-*.md` (expected: 3 files). Also `grep -c "Presentation:" knowledge/teaching-digital-futures-2023-en.md` returns 1.

- [ ] **Step 4: Commit the script only**

```bash
git add src/scripts/generate-knowledge.ts
git commit -m "fix(knowledge): index folder entries (<slug>/index.md) and emit Presentation URLs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Leave `knowledge/*.md` changes uncommitted; `/sync-knowledge` handles them.

---

### Task 6: Full verification

- [ ] **Step 1: Build and tests**

Run: `pnpm build` (expected: astro check 0 errors, build succeeds), `pnpm test:unit` (expected: all pass), `pnpm test:e2e` (expected: all pass, including the two new subpage tests).

- [ ] **Step 2: Visual check**

Open `http://localhost:4321/teaching/digital-futures-2026` (both pills, side by side, wrap on a 375px viewport), `/pt/teaching/digital-futures-2023` (only "Assistir apresentação"), `/projects/buildsystems-website` (no pill row).

- [ ] **Step 3: Hand off**

Ask the user whether to run `/sync-knowledge` (content metadata changed and the generator now indexes DF2026).
