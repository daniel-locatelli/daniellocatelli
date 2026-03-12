# CLAUDE.md

## Project Overview

Personal portfolio website for Daniel Locatelli (AEC software engineer). Built with Astro, integrates Claude AI for an interactive chat, and deploys to Cloudflare Pages.

## Security

- Always validate and sanitize user input, both client-side and server-side.
- Add .env and .mcp files to .gitignore to prevent secrets from being committed.
- Use environment variables for all secrets and configuration.
- Regularly review and update dependencies to patch security vulnerabilities.

## Tech Stack

- **Framework:** Astro 5 with TypeScript
- **UI:** React 19 (interactive components), Tailwind CSS 4
- **Deployment:** Cloudflare Pages (`@astrojs/cloudflare`)
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
- **Content Collections:** Type-safe content for projects, research, publications, teaching, skills, and more in `src/content/`.
- **Path aliases:** Use `@/components/*`, `@/assets/*`, `@/config/*`, `@/layouts/*`, `@/utils`, `@/types`, `@/site-config` (defined in tsconfig.json).
- **Components:** Astro components (`.astro`) for static content, React components (`.tsx`) for interactivity (e.g., `HeroChat.tsx`).

## Environment Variables

Required in `.env`:
- `ANTHROPIC_API_KEY` — Claude API key
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase vector store

## Code Style

- TypeScript strict mode
- Prettier with Astro and Tailwind plugins (see `.prettierrc`)
- Functional React components with hooks
- Async/await for all API calls
- Custom fonts: Montserrat, Poppins (configured in Tailwind)
