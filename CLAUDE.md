# CLAUDE.md

## Project Overview

Personal portfolio website for Daniel Locatelli (doctoral researcher at ETH Zurich, formerly AEC software engineer). Built with Astro, integrates Claude AI for an interactive chat, and deploys to Cloudflare Workers (Static Assets).

## Security

- Always validate and sanitize user input, both client-side and server-side.
- Add .env and .mcp files to .gitignore to prevent secrets from being committed.
- Use environment variables for all secrets and configuration.
- Regularly review and update dependencies to patch security vulnerabilities.

## Tech Stack

- **Framework:** Astro 6 with TypeScript
- **UI:** React 19 (interactive components), Tailwind CSS 4
- **Deployment:** Cloudflare Workers with Static Assets (`@astrojs/cloudflare`)
- **Content:** Astro Content Collections
- **AI:** Anthropic Claude SDK with Supabase vector embeddings
- **3D:** Three.js (geodesic dome component)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check then build (astro check && astro build)
pnpm preview      # Preview production build
```

## Project Structure

```
src/
  assets/           # Images and icons
  components/       # Astro (.astro) and React (.tsx) components
  config/           # Site config (site.ts), env (server.ts), AI models (ai.ts)
  content/          # Astro Content Collections (projects, research, etc.)
  i18n/             # Translations by section (home/, cv/, meta/, subpage/) and locale (en, pt, de)
  layouts/          # Page layouts (Base.astro)
  lib/              # Blog helpers, route helpers
  pages/            # File-based routing with [...locale] dynamic segments
    api/            # Server API endpoints (ai.ts)
  scripts/          # Utility/migration scripts
  styles/           # Global CSS
```

## Key Patterns

- **Internationalization:** Three locales (en, pt, de). English is default. Translations are typed objects in `src/i18n/{section}/{locale}.ts`. Routes use `[...locale]` catch-all segments.
- **Content Collections:** Type-safe content for projects, research, publications, teaching, skills, and more in `src/content/`. **Heading levels in content files must start at h2 (`##`)**, since the page title is rendered as h1 by the layout. Never use `# ` (h1) in markdown/MDX content body. **Text content must not contain em dashes (`—`).** Use alternative punctuation instead (e.g., commas, colons, semicolons, or parentheses). **Image captions:** a markdown image's alt text is rendered as its visible caption by default. For diagrams and screenshots, keep the full description in the alt (for screen readers) and give the image a short title, which becomes the visible caption instead (`![long alt](path "Short caption")`); a title of `-` suppresses the visible caption entirely.
- **Multilingual content edits:** When editing a content file in one locale (e.g., `en/`), always check and update the corresponding files in the other locales (`pt/`, `de/`). Translatable fields (Country, Language, City names, etc.) must be localized. Structural fields (Link, DateStart, Place, Active, etc.) must be kept in sync.
- **Slug changes:** When changing a content file's slug (renaming a file under `src/content/` so its URL segment changes), always do all three of: (a) rename the matching asset folder under `src/assets/content/` plus any asset filenames that embed the old slug, and update every `Cover:` and inline image path in the content files to match; (b) add a redirect from each old locale URL to the new one in the `redirects` block of `astro.config.mts` (one entry per locale: `/`, `/pt/`, `/de/`); (c) apply the rename and redirect across all three locales in the same commit. This preserves inbound links, bookmarks, and SEO signals, and keeps the repo free of mismatched slug/asset-folder pairs.
- **Path aliases:** Use `@/components/*`, `@/assets/*`, `@/config/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config` (defined in tsconfig.json).
- **Components:** Astro components (`.astro`) for static content, React components (`.tsx`) for interactivity (e.g., `HeroChat.tsx`).
- **Slide authoring:** Decks live at `src/content/teaching/<locale>/<slug>/deck.mdx`. See `docs/slides/AUTHORING.md` for the full schema. **Default to YAML fences for simple slides; drop to JSX (`<Slide>`/`<SlideImage>`/`<SlideVideo>`/`<SlideImageRow>`) only for overlays, multiple positioned children, or custom layouts.** Background image (full-bleed) is the top-level `image:` field; foreground positioned content currently requires JSX. The YAML plugin lives at `src/lib/vite-presentation-slides.ts`.

## Agent Skills

Public agent skills live in `public/.well-known/agent-skills/<name>/SKILL.md` and are listed in `index.json` next to them (with sha256 digests). **After adding or editing any SKILL.md, run `pnpm build:skills`** to regenerate the index; the e2e suite (`tests/e2e/agent-readiness.spec.ts`) checks that every listed skill resolves.

## Website Self-Description

The site describes its own technology in `src/content/projects/{en,pt,de}/portfolio-website.md`. **After any meaningful change to the website itself (adding or removing a feature, changing the stack, hosting, AI pipeline, performance work, etc.), update that content in all three locales** so the page stays an accurate account of how the site is built. Then ask whether to run `/sync-knowledge`, as with any content change.

## Environment Variables

Required in `.env`:
- `ANTHROPIC_API_KEY` — Claude API key
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase vector store

## AI Chat Knowledge Pipeline

The HeroChat assistant is powered by vector embeddings in Supabase (Voyage AI, 1024-dim). **After any content change in `src/content/`, ask the user whether to run `/sync-knowledge`** (it regenerates knowledge files and re-embeds all entries, which takes several minutes; batch small edits and skip it for changes that do not alter prose, such as images or alt text). This also checks whether AI model IDs in `src/config/ai.ts` are still current.

The knowledge pipeline generates:
- Individual content pages and CV entries (per locale)
- A chronological CV timeline (always injected as core context)
- **FAQ synthesis chunks** (`processFAQ()` in `src/scripts/generate-knowledge.ts`): 10 natural-language FAQ files per locale that pre-answer common visitor questions (current employment, skills, education, etc.). These bridge the semantic gap between user questions and structured data.

**Benchmark:** Run `pnpm exec tsx scripts/benchmark-chat.ts` (with a local server running via `pnpm dev`; note Astro 7's dev server runs detached, manage it with `astro dev stop`/`status`/`logs`) to test ~26 common questions against the chat API. Use `--retry-failures` to skip previously passed tests. Target: 100% pass rate.

## Backlog

Non-critical improvement ideas, structural refactors, and quality-of-life cleanups live in [`docs/BACKLOG.md`](docs/BACKLOG.md). When you notice something worth doing but not urgent enough to interrupt current work, add it there rather than implementing it inline or letting the thought disappear.

## Code Style

- TypeScript strict mode
- Prettier with Astro and Tailwind plugins (see `.prettierrc`)
- Functional React components with hooks
- Async/await for all API calls
- Custom fonts: Montserrat, Poppins (configured in Tailwind)
