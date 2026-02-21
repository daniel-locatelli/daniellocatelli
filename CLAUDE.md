# CLAUDE.md

## Project Overview

Personal portfolio website for Daniel Locatelli (AEC software engineer). Built with Astro, uses Notion as a CMS, integrates Claude AI for an interactive chat, and deploys to Cloudflare Pages.

## Tech Stack

- **Framework:** Astro 5 with TypeScript
- **UI:** React 19 (interactive components), Tailwind CSS 4
- **Deployment:** Cloudflare Pages (`@astrojs/cloudflare`)
- **CMS:** Notion API (`@notionhq/client`)
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
  assets/           # Images, icons, Notion-synced assets
  components/       # Astro (.astro) and React (.tsx) components
    Notion/         # Notion content rendering components
  config/           # Site config (site.ts), env (server.ts), AI models (ai-models.ts)
  i18n/             # Translations by section (home/, cv/, meta/, subpage/) and locale (en, pt, de)
  integrations/     # Astro build-time integrations (Notion file downloader)
  layouts/          # Page layouts (Base.astro)
  lib/              # Notion API client, blog helpers, route helpers
  pages/            # File-based routing with [...locale] dynamic segments
    api/            # Server API endpoints (chat.ts)
  scripts/          # Utility/migration scripts
  styles/           # Global CSS
```

## Key Patterns

- **Internationalization:** Three locales (en, pt, de). English is default. Translations are typed objects in `src/i18n/{section}/{locale}.ts`. Routes use `[...locale]` catch-all segments.
- **Notion integration:** Content is fetched from Notion databases at build time. Assets are downloaded via a custom Astro integration (`src/integrations/all-files-downloader.ts`).
- **Path aliases:** Use `@/components/*`, `@/assets/*`, `@/config/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config` (defined in tsconfig.json).
- **Components:** Astro components (`.astro`) for static content, React components (`.tsx`) for interactivity (e.g., `HeroChat.tsx`).

## Environment Variables

Required in `.env`:
- `NOTION_API_SECRET` — Notion API key
- `ANTHROPIC_API_KEY` — Claude API key
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase vector store

## Code Style

- TypeScript strict mode
- Prettier with Astro and Tailwind plugins (see `.prettierrc`)
- Functional React components with hooks
- Async/await for all API calls
- Custom fonts: Montserrat, Poppins (configured in Tailwind)
