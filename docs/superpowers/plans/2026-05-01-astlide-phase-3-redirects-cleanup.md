# Astlide adoption — Phase 3 (redirects + cleanup) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Status:** SKELETON. Tasks here may need adjustment if Phase 1/2 surfaces files that depend on the old presentations system not yet identified.

**Goal:** Retire the old `presentations` collection, custom `Slides.astro` layout, custom slide components, and old route. Add 301 redirects from old URLs to new URLs. Update the parent-page "View presentation" link. Regenerate the AI-chat knowledge pipeline.

**Architecture:** Eight small commits, each independently revertable. Final state: a single deck system on astlide-as-component-library, no remnants of the old custom system.

**Tech Stack:** Astro 6 redirects config, file deletions, content config edit, knowledge-pipeline rerun via `/sync-knowledge`.

**Spec:** `docs/superpowers/specs/2026-05-01-astlide-adoption-design.md` (Phase 3 section)

**Phases 1 and 2 must be merged before this plan starts.**

---

## File map

### Modified files

- `astro.config.mts` — add three legacy redirects
- `src/pages/[...locale]/[...subpage].astro` — line ~88: link to new URL pattern
- `src/content.config.ts` — remove `presentations` collection

### Deleted files

- `src/pages/[...locale]/presentations/[...deck].astro`
- `src/layouts/Slides.astro`
- `src/components/slides/Slide.astro`
- `src/components/slides/SlideColumns.astro`
- `src/components/slides/SlideImage.astro`
- `src/components/slides/SlideNotes.astro`
- `src/components/slides/TextSlide.astro`
- `src/components/slides/TitleSlide.astro`
- `src/content/presentations/en/digital-futures-2026.mdx`
- `src/content/presentations/pt/digital-futures-2026.mdx`
- `src/content/presentations/de/digital-futures-2026.mdx`

(`src/components/slides/SlideVideo.astro` was lifted to `src/components/decks/` in Phase 1; the original is also deleted here.)

---

## Tasks

### Task 1: Add legacy redirects

**Files:**
- Modify: `astro.config.mts`

- [ ] **Step 1: Locate the `redirects` block in `astro.config.mts`**

```bash
grep -n "redirects" astro.config.mts
```

- [ ] **Step 2: Add three redirects** (one per locale)

```ts
redirects: {
  // ... existing redirects unchanged ...
  "/presentations/digital-futures-2026":     "/digital-futures-2026/1",
  "/pt/presentations/digital-futures-2026":  "/pt/digital-futures-2026/1",
  "/de/presentations/digital-futures-2026":  "/de/digital-futures-2026/1",
},
```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

- [ ] **Step 4: Verify the redirects resolve**

```bash
npm run preview
```

In a browser, hit each old URL:
- `http://localhost:4321/presentations/digital-futures-2026` → 301 → `/digital-futures-2026/1`
- `http://localhost:4321/pt/presentations/digital-futures-2026` → 301 → `/pt/digital-futures-2026/1`
- `http://localhost:4321/de/presentations/digital-futures-2026` → 301 → `/de/digital-futures-2026/1`

- [ ] **Step 5: Commit**

```bash
git add astro.config.mts
git commit -m "feat(decks): redirect old /presentations/digital-futures-2026 URLs to new"
```

---

### Task 2: Update parent-page presentation link

**Files:**
- Modify: `src/pages/[...locale]/[...subpage].astro`

- [ ] **Step 1: Find line 88 (the deck link)**

```bash
grep -n 'presentations/' src/pages/\[...locale\]/\[...subpage\].astro
```

- [ ] **Step 2: Change the URL pattern**

```diff
- ? `${deckBasePath}/presentations/${fileSlug}`
+ ? `${basePath}/${fileSlug}/1`
```

(Adjust the variable name if `deckBasePath` and `basePath` differ in this file. The intent: link to slide 1 of the deck under `/{locale}/{slug}/1`.)

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

- [ ] **Step 4: Verify the link**

In dev preview, navigate to `http://localhost:4321/digital-futures-2026` (the parent teaching page). Click the "View presentation" / "Open presentation" button. Should open `/digital-futures-2026/1`.

- [ ] **Step 5: Commit**

```bash
git add "src/pages/[...locale]/[...subpage].astro"
git commit -m "feat(decks): point parent-page deck link at new /{locale}/{slug}/1 URL"
```

---

### Task 3: Delete old route file

**Files:**
- Delete: `src/pages/[...locale]/presentations/[...deck].astro`

- [ ] **Step 1: Delete the file**

```bash
git rm "src/pages/[...locale]/presentations/[...deck].astro"
```

- [ ] **Step 2: Remove the now-empty `presentations/` folder if any**

```bash
rmdir "src/pages/[...locale]/presentations" 2>/dev/null || true
```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

- [ ] **Step 4: Verify old URL still works (via redirect)**

In preview, hit `/presentations/digital-futures-2026` — should still 301 to `/digital-futures-2026/1`. (The redirect from Task 1 is what makes the URL work; the deleted route was the *original* implementation.)

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(decks): delete old presentations route"
```

---

### Task 4: Delete old layout

**Files:**
- Delete: `src/layouts/Slides.astro`

- [ ] **Step 1: Verify nothing else still imports from Slides.astro**

```bash
grep -rn "layouts/Slides" src/
```

Expected: no matches (the old `[...deck].astro` was the only consumer, deleted in Task 3).

- [ ] **Step 2: Delete the file**

```bash
git rm src/layouts/Slides.astro
```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(decks): delete old Slides.astro layout"
```

---

### Task 5: Delete old slide components

**Files:**
- Delete: 6 files in `src/components/slides/`

- [ ] **Step 1: Verify nothing still imports from `src/components/slides/`**

```bash
grep -rn "components/slides/" src/
```

Expected: no matches (Phase 1 lifted `SlideVideo` to `src/components/decks/SlideVideo.astro` and migrated all slide consumers to use astlide components).

- [ ] **Step 2: Delete the components**

```bash
git rm src/components/slides/Slide.astro \
       src/components/slides/SlideColumns.astro \
       src/components/slides/SlideImage.astro \
       src/components/slides/SlideNotes.astro \
       src/components/slides/SlideVideo.astro \
       src/components/slides/TextSlide.astro \
       src/components/slides/TitleSlide.astro
```

- [ ] **Step 3: Remove the empty folder**

```bash
rmdir src/components/slides 2>/dev/null || true
```

- [ ] **Step 4: Verify the build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(decks): delete old slide components (replaced by astlide + decks/)"
```

---

### Task 6: Delete old `presentations` content files

**Files:**
- Delete: 3 MDX files

- [ ] **Step 1: Delete the files**

```bash
git rm src/content/presentations/en/digital-futures-2026.mdx \
       src/content/presentations/pt/digital-futures-2026.mdx \
       src/content/presentations/de/digital-futures-2026.mdx
```

- [ ] **Step 2: Remove now-empty locale folders if any**

```bash
rmdir src/content/presentations/en src/content/presentations/pt src/content/presentations/de 2>/dev/null || true
rmdir src/content/presentations 2>/dev/null || true
```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```

Expected: build passes. The `presentations` collection is now empty but still defined in `content.config.ts` (we remove it next).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(decks): delete old presentations MDX files (en/pt/de)"
```

---

### Task 7: Remove `presentations` from content config

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Remove the `presentations` line**

```diff
- presentations: contentCollection("./src/content/presentations"),
```

- [ ] **Step 2: Verify the build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "chore(decks): remove obsolete presentations collection from content config"
```

---

### Task 8: Final smoke test + sitemap verification

**Files:** none modified.

- [ ] **Step 1: Build production**

```bash
npm run build
```

- [ ] **Step 2: Run preview**

```bash
npm run preview
```

- [ ] **Step 3: Verify each old URL still redirects**

For each of the three legacy URLs, hit them in the browser. Confirm 301 to the new URL.

- [ ] **Step 4: Verify sitemap includes new URLs**

```bash
cat dist/sitemap-*.xml | grep -E 'digital-futures-2026'
```

Expected: 99 URLs (33 slides × 3 locales) for the deck. Each URL is `/{locale}/digital-futures-2026/{N}`. Plus the parent teaching pages.

- [ ] **Step 5: Spot-check 5 random slides per locale**

In preview, visit:
- `http://localhost:4321/digital-futures-2026/{1,7,15,23,33}`
- `http://localhost:4321/pt/digital-futures-2026/{1,7,15,23,33}`
- `http://localhost:4321/de/digital-futures-2026/{1,7,15,23,33}`

Each should render. Keyboard nav, presenter mode, exit link all functional.

- [ ] **Step 6: Verify no dangling references**

```bash
grep -rn "presentations/" src/ --include="*.astro" --include="*.ts" --include="*.tsx" --include="*.mdx" --include="*.md"
```

Expected: no matches except possibly in `astro.config.mts` (the redirects), in which case those are correct.

```bash
grep -rn "components/slides/" src/
grep -rn "layouts/Slides" src/
```

Expected: no matches anywhere.

- [ ] **Step 7: Commit a marker** (optional)

If everything passes and you want a clean "Phase 3 complete" marker:

```bash
git commit --allow-empty -m "chore(decks): Phase 3 complete — old slide system fully retired"
```

---

### Task 9: Regenerate the AI chat knowledge pipeline

**Files:**
- Possibly modify: `src/scripts/generate-knowledge.ts` (if it referenced the old `presentations` collection)
- Generated: knowledge files + Supabase embeddings

- [ ] **Step 1: Check whether `generate-knowledge.ts` references the deleted collection**

```bash
grep -n "presentations" src/scripts/generate-knowledge.ts
```

If matches exist, the script needs updating to use the `decks` collection (or to skip per-slide indexing if that's the simpler call). Per spec Open Questions, the default is "skip indexing slides into RAG; index at deck level only" — meaning the script may not need slide-level changes, only collection-name changes.

- [ ] **Step 2: Update the script if needed**

Replace any `getCollection("presentations")` with the appropriate new behavior. Make sure all per-locale processing is preserved.

- [ ] **Step 3: Run the sync command**

```
/sync-knowledge
```

(This is the project-defined slash command per CLAUDE.md.)

Expected: knowledge files regenerated; Supabase embeddings refreshed; HeroChat continues to answer questions about the talk content.

- [ ] **Step 4: Smoke-test the chat assistant**

Open `http://localhost:4321/`. Ask the chat: "Tell me about the Digital Futures 2026 talk." Verify the response references the talk via the parent teaching entry's content.

- [ ] **Step 5: Commit (if script was modified)**

```bash
git add src/scripts/generate-knowledge.ts
git commit -m "fix(knowledge): adapt generate-knowledge to decks collection (post-migration)"
```

If the sync command produced new knowledge artifact files in tracked locations, commit those too.

---

## Phase 3 acceptance check

- [ ] All three old URLs (en/pt/de) redirect with 301 to their new equivalents.
- [ ] Parent teaching page links to `/{locale}/digital-futures-2026/1`.
- [ ] No dangling references to `presentations/`, `Slides.astro`, or `components/slides/` anywhere in `src/`.
- [ ] `presentations` no longer appears in `content.config.ts`.
- [ ] `src/content/presentations/`, `src/components/slides/`, `src/layouts/Slides.astro`, and `src/pages/[...locale]/presentations/` no longer exist.
- [ ] Build passes with no warnings.
- [ ] Sitemap reflects new URLs (99 deck URLs across 3 locales).
- [ ] Knowledge pipeline regenerated; HeroChat answers about the talk.

If all check, the migration is complete. The codebase has fewer net lines, all three locales of the deck are live on astlide-as-component-library at clean URLs, and the OSS contribution roadmap (per spec Section 8) can begin.
