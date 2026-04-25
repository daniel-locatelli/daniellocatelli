# CLAUDE.md

## Project Overview

Personal portfolio website for Daniel Locatelli (AEC software engineer). Built with Astro, integrates Claude AI for an interactive chat, and deploys to Cloudflare Workers (Static Assets).

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
npm run dev       # Start dev server
npm run build     # Type-check then build (astro check && astro build)
npm run preview   # Preview production build
```

## Project Structure

```
src/
  assets/           # Images and icons
  components/       # Astro (.astro) and React (.tsx) components
  config/           # Site config (site.ts), env (server.ts), AI models (ai-models.ts)
  content/          # Astro Content Collections (projects, research, etc.)
  i18n/             # Translations by section (home/, cv/, meta/, subpage/) and locale (en, pt, de)
  layouts/          # Page layouts (Base.astro)
  lib/              # Blog helpers, route helpers
  pages/            # File-based routing with [...locale] dynamic segments
    api/            # Server API endpoints (chat.ts)
  scripts/          # Utility/migration scripts
  styles/           # Global CSS
```

## Key Patterns

- **Internationalization:** Three locales (en, pt, de). English is default. Translations are typed objects in `src/i18n/{section}/{locale}.ts`. Routes use `[...locale]` catch-all segments.
- **Content Collections:** Type-safe content for projects, research, publications, teaching, skills, and more in `src/content/`. **Heading levels in content files must start at h2 (`##`)**, since the page title is rendered as h1 by the layout. Never use `# ` (h1) in markdown/MDX content body. **Text content must not contain em dashes (`—`).** Use alternative punctuation instead (e.g., commas, colons, semicolons, or parentheses).
- **Multilingual content edits:** When editing a content file in one locale (e.g., `en/`), always check and update the corresponding files in the other locales (`pt/`, `de/`). Translatable fields (Country, Language, City names, etc.) must be localized. Structural fields (Link, DateStart, Place, Active, etc.) must be kept in sync.
- **Slug changes:** When changing a content file's slug (renaming a file under `src/content/` so its URL segment changes), always do all three of: (a) rename the matching asset folder under `src/assets/content/` plus any asset filenames that embed the old slug, and update every `Cover:` and inline image path in the content files to match; (b) add a redirect from each old locale URL to the new one in the `redirects` block of `astro.config.mts` (one entry per locale: `/`, `/pt/`, `/de/`); (c) apply the rename and redirect across all three locales in the same commit. This preserves inbound links, bookmarks, and SEO signals, and keeps the repo free of mismatched slug/asset-folder pairs.
- **Path aliases:** Use `@/components/*`, `@/assets/*`, `@/config/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config` (defined in tsconfig.json).
- **Components:** Astro components (`.astro`) for static content, React components (`.tsx`) for interactivity (e.g., `HeroChat.tsx`).

## Environment Variables

Required in `.env`:
- `ANTHROPIC_API_KEY` — Claude API key
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase vector store

## AI Chat Knowledge Pipeline

The HeroChat assistant is powered by vector embeddings in Supabase (Voyage AI, 1024-dim). **After any content change in `src/content/`, run `/sync-knowledge`** to regenerate knowledge files and upload fresh embeddings. This also checks whether AI model IDs in `src/config/ai.ts` are still current.

The knowledge pipeline generates:
- Individual content pages and CV entries (per locale)
- A chronological CV timeline (always injected as core context)
- **FAQ synthesis chunks** (`processFAQ()` in `src/scripts/generate-knowledge.ts`): 10 natural-language FAQ files per locale that pre-answer common visitor questions (current employment, skills, education, etc.). These bridge the semantic gap between user questions and structured data.

**Benchmark:** Run `npx tsx scripts/benchmark-chat.ts` (with dev server running) to test ~26 common questions against the chat API. Use `--retry-failures` to skip previously passed tests. Target: 100% pass rate.

## Code Style

- TypeScript strict mode
- Prettier with Astro and Tailwind plugins (see `.prettierrc`)
- Functional React components with hooks
- Async/await for all API calls
- Custom fonts: Montserrat, Poppins (configured in Tailwind)
