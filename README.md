<h1 align="center">
  <img src="https://github.com/daniel-locatelli/daniellocatelli/blob/main/public/android-chrome-512x512.png" width="150px"/><br/>
  Daniel Locatelli
</h1>
<h3 align="center">
  Personal portfolio &amp; blog built with Astro, React, and Claude AI
</h3>

<p align="center">
  <a href="https://daniellocatelli.com"><img src="https://img.shields.io/badge/https://-daniellocatelli.com-white" alt="website"></a>
  <a href="https://www.linkedin.com/in/daniel-locatelli/"><img src="https://img.shields.io/badge/Connect-Daniel%20Locatelli-blue?logo=linkedin" alt="Connect with me on LinkedIn"></a>
</p>

## About

Portfolio website for **Daniel Locatelli**, an AEC (Architecture, Engineering & Construction) software engineer based in Germany. The site showcases projects, research, publications, teaching, and a full CV — all managed through Astro Content Collections. Visitors can interact with an AI-powered chat assistant that answers questions about Daniel's work.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Astro 6](https://astro.build/) with TypeScript |
| **UI** | [React 19](https://react.dev/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Framer Motion](https://www.framer.com/motion/) |
| **Content** | Astro Content Collections |
| **AI Chat** | [Anthropic Claude SDK](https://docs.anthropic.com/) · [Supabase](https://supabase.com/) vector embeddings (RAG) |
| **3D** | [Three.js](https://threejs.org/) (geodesic dome visualization) |
| **Deployment** | [Cloudflare Workers](https://workers.cloudflare.com/) (Static Assets) |
| **Icons** | [Phosphor Icons](https://phosphoricons.com/) · [Lucide React](https://lucide.dev/) |
| **Markdown** | react-markdown · remark-gfm · KaTeX (math) · Mermaid (diagrams) |

## Features

- **Internationalization** — Full i18n support for English, Portuguese, and German using `[...locale]` dynamic route segments and typed translation files.
- **AI Chat Assistant** — Interactive chat powered by Claude with retrieval-augmented generation (RAG) via Supabase vector embeddings. Responds as Daniel in the visitor's language.
- **Content Collections** — Type-safe content for projects, research, publications, teaching, skills, people, organizations, and more.
- **3D Visualization** — Three.js geodesic dome on the homepage.
- **Responsive Design** — Dark-themed UI with Montserrat/Poppins custom fonts, mobile-friendly layout, and print-optimized CV page.
- **Legal Pages** — Privacy Policy, Terms & Conditions, and Impressum (noindexed).
- **SEO** — Sitemap generation, Open Graph metadata, and view transitions.

## Project Structure

```
src/
├── assets/              # Images and icons
├── components/          # Astro (.astro) and React (.tsx) components
├── config/              # Site config, env variables, AI model settings
├── content/             # Astro Content Collections (projects, research, etc.)
├── i18n/                # Translations by section and locale (en, pt, de)
├── layouts/             # Page layouts (Base.astro)
├── lib/                 # Blog helpers, route utilities
├── pages/
│   ├── [...locale]/     # All locale-aware pages (home, cv, legal, etc.)
│   └── api/             # Server endpoints (AI chat, page preview)
├── scripts/             # Utility and migration scripts
└── styles/              # Global CSS
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Environment Variables

Create a `.env` file with:

```env
ANTHROPIC_API_KEY=       # Claude API key
SUPABASE_URL=            # Supabase project URL
SUPABASE_ANON_KEY=       # Supabase anonymous key
```

### Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:4321)
npm run build            # Type-check and build for production
npm run preview          # Preview production build locally
```

## License

[MIT](LICENSE)
