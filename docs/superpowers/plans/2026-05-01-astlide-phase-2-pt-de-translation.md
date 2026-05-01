# Astlide adoption — Phase 2 (pt + de translation porting) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Status:** SKELETON. This plan is to be sharpened after Phase 1 ships, since the exact slide MDX patterns settle during Phase 1 and the translation work is dictated by them.

**Goal:** Port the 33 slides of `digital-futures-2026` from English to Portuguese (`decks/pt/`) and German (`decks/de/`) with translatable text swapped to each locale, all structural fields and image references identical to English. Both locales reachable at `/{locale}/{slug}/{N}`.

**Architecture:** Mechanical translation. Each English slide is copied to `decks/pt/{slug}/` then `decks/de/{slug}/`, then translatable strings (`title`, body prose, alt text, `<Notes>` body) are swapped using existing translations in `src/content/presentations/{pt,de}/digital-futures-2026.mdx`.

**Tech Stack:** No new tooling; Phase 1's content collection and routing already support multilingual slides.

**Spec:** `docs/superpowers/specs/2026-05-01-astlide-adoption-design.md` (Phase 2 section)

**Phase 1 must be merged before this plan starts.**

---

## File map

### New files

- `src/content/decks/pt/digital-futures-2026/001-cover.mdx` through `033-*.mdx` (33 files)
- `src/content/decks/de/digital-futures-2026/001-cover.mdx` through `033-*.mdx` (33 files)

### Modified files

None.

### NOT touched

- `src/content/presentations/{pt,de}/digital-futures-2026.mdx` — old translations stay as the *string source* until Phase 3.
- All Phase 1 routing/layout/theme files — unchanged.

---

## Tasks

### Task 1: Port slide 1 (cover) to pt and de

**Files:**
- Create: `src/content/decks/pt/digital-futures-2026/001-cover.mdx`
- Create: `src/content/decks/de/digital-futures-2026/001-cover.mdx`

- [ ] **Step 1: Read the existing pt and de translations of slide 1**

```bash
head -10 src/content/presentations/pt/digital-futures-2026.mdx
head -10 src/content/presentations/de/digital-futures-2026.mdx
```

(The first slide-defining `<TitleSlide>` block has the localized title, subtitle, author, institution.)

- [ ] **Step 2: Copy the English cover to pt and translate**

Copy `src/content/decks/en/digital-futures-2026/001-cover.mdx` to `src/content/decks/pt/digital-futures-2026/001-cover.mdx`. Translate **only**:
- `title:` frontmatter
- `notes:` frontmatter
- `alt=` on `<Image>`
- Body text (`<h1>`, `<p>` content)

Keep identical: `slideLayout`, all imports, image `src=`, all Tailwind classes, component structure.

- [ ] **Step 3: Repeat for de**

Same operation, different locale.

- [ ] **Step 4: Verify in dev server**

```bash
npm run dev
```

- Visit `http://localhost:4321/pt/digital-futures-2026/1` — verify Portuguese.
- Visit `http://localhost:4321/de/digital-futures-2026/1` — verify German.
- Visit `http://localhost:4321/digital-futures-2026/1` — verify English unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/content/decks/{pt,de}/digital-futures-2026/001-cover.mdx
git commit -m "feat(decks): port slide 1 (cover) to pt + de"
```

---

### Task 2: Port slides 2-10 to pt

For each English slide in `src/content/decks/en/digital-futures-2026/00{2..9}-*.mdx` and `010-*.mdx`:
1. Copy file to the matching pt path.
2. Translate the same fields as Task 1 Step 2.
3. Use the existing pt translation in `src/content/presentations/pt/digital-futures-2026.mdx` as the string source.

- [ ] **Step 1: Port slides 2-10 to pt**

For slides 2-10, copy from `decks/en/...` to `decks/pt/...` with the same filename, then translate text using the existing pt translation file.

- [ ] **Step 2: Verify in dev server**

Visit `http://localhost:4321/pt/digital-futures-2026/{2..10}` and check each slide.

- [ ] **Step 3: Commit**

```bash
git add src/content/decks/pt/digital-futures-2026/00{2,3,4,5,6,7,8,9}-*.mdx src/content/decks/pt/digital-futures-2026/010-*.mdx
git commit -m "feat(decks): port slides 2-10 to pt"
```

---

### Task 3: Port slides 11-20 to pt

Same pattern as Task 2.

- [ ] **Step 1: Port slides 11-20 to pt**
- [ ] **Step 2: Verify each in dev server**
- [ ] **Step 3: Commit**

```bash
git add src/content/decks/pt/digital-futures-2026/0{11..20}-*.mdx
git commit -m "feat(decks): port slides 11-20 to pt"
```

---

### Task 4: Port slides 21-33 to pt

- [ ] **Step 1: Port slides 21-33 to pt**
- [ ] **Step 2: Verify each in dev server**
- [ ] **Step 3: Commit**

```bash
git add src/content/decks/pt/digital-futures-2026/0{21..33}-*.mdx
git commit -m "feat(decks): port slides 21-33 to pt"
```

---

### Task 5: Smoke-test pt deck end-to-end

- [ ] **Step 1: Build production**

```bash
npm run build
```

- [ ] **Step 2: Run preview**

```bash
npm run preview
```

- [ ] **Step 3: Navigate full pt deck**

Visit `http://localhost:4321/pt/digital-futures-2026/1`. Press `→` 32 times. Verify each slide renders, indicator shows `N / 33`, structural elements identical to English.

- [ ] **Step 4: Test pt presenter mode**

From any pt slide, press `P` or click "Presenter". The notes window opens at `/pt/digital-futures-2026/N/notes`. Verify Portuguese notes render. Verify BroadcastChannel sync works (it should — the channel name `deck-{slug}-{locale}` includes the locale, so pt/de/en presenter windows are isolated).

- [ ] **Step 5: Test pt PDF export**

```bash
npm run export-deck -- --locale pt --slug digital-futures-2026 --format pdf --out exports
```

Verify `exports/digital-futures-2026-pt.pdf` is 33 pages and matches pt content.

---

### Task 6: Port all 33 slides to de

Repeat Tasks 2-5 for German. Source: `src/content/presentations/de/digital-futures-2026.mdx`.

- [ ] **Step 1: Port slides 2-10 to de**
- [ ] **Step 2: Port slides 11-20 to de**
- [ ] **Step 3: Port slides 21-33 to de**
- [ ] **Step 4: Smoke-test de deck end-to-end**
- [ ] **Step 5: Test de PDF export**

```bash
npm run export-deck -- --locale de --slug digital-futures-2026 --format pdf --out exports
```

---

## Phase 2 acceptance check

- [ ] 99 slide files total exist (33 × 3 locales).
- [ ] `npm run build` passes.
- [ ] `/{locale}/digital-futures-2026/N` works for all three locales for N ∈ [1, 33].
- [ ] Visual fidelity is consistent across locales (only text differs).
- [ ] Speaker notes localized in all three.
- [ ] PDF exports work for all three locales.
- [ ] Old `presentations` collection still intact and reachable at old URLs.
- [ ] No console errors on any slide in any locale.

If all check, Phase 2 is shippable. Next plan is Phase 3 (redirects + cleanup).
