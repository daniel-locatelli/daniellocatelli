---
{
  "Cover": "/assets/content/projects/buildsystems-website/multistory-timber-building.jpg",
  "CoverAlt": "Desktop screenshot of the BuildSystems website",
  "Description": "Developed the BuildSystems website using the Astro framework, leveraging the Notion API as a CMS.",
  "Name": "BuildSystems Website",
  "Slug": "projects/buildsystems-website",
  "Tags": [
    "Web Development",
    "Astro",
    "Notion API",
    "TypeScript"
  ],
  "Authors": [
    "BuildSystems GmbH"
  ],
  "Category": "Software",
  "City": [
    "Munich"
  ],
  "Client": "BuildSystems GmbH",
  "DateStart": "2023-08-01",
  "DateEnd": "2024-04-01",
  "Link": {
    "Text": "BuildSystems Website",
    "Href": "https://buildsystems.de"
  },
  "Place": "BuildSystems GmbH",
  "Director": ["Martin Bittmann"],
  "Manager": ["Julia Dorn"],
  "Team": ["Daniel Locatelli"]
}
---

I designed and developed the corporate website for [BuildSystems](https://buildsystems.de), a sustainability consultancy driving climate-neutral transformation in the building and real estate sector. The website serves as the company's digital presence, showcasing their services, portfolio of projects, team, and blog content — all managed through Notion as a headless CMS.

## Tech Stack

- [**Astro 5**](https://astro.build/): Static site generator with TypeScript, chosen for its performance-first approach and zero-JS-by-default philosophy.
- [**Tailwind CSS 4**](https://tailwindcss.com/): Utility-first styling with custom CSS variables for responsive typography across four breakpoints.
- [**Notion API**](https://developers.notion.com/): Headless CMS integration — the team manages all content (blog posts, team members, partners, portfolio) directly from Notion.
- [**Cloudflare Pages**](https://pages.cloudflare.com/): Deployment with edge caching, automatic HTTPS, and DDoS protection.
- [**Sharp**](https://sharp.pixelplumbing.com/): Image processing pipeline generating optimized avif/webp formats.

## Why Notion as a CMS?

BuildSystems already used Notion extensively for internal documentation and project management. Instead of introducing a separate CMS that would require the team to learn a new tool, I integrated the Notion API directly into the build pipeline. This means the team can write and publish blog posts, update team profiles, and manage portfolio content entirely from Notion — a tool they already use daily.

The integration fetches content at build time from multiple Notion databases (blog posts, team members, partners, organizations) and renders it using 30+ custom Notion block renderers that handle headings, paragraphs, images, code blocks, tables, embeds, and more.

![The homepage hero section with an animated cover and the company's mission statement.](../../../assets/content/projects/buildsystems-website/homepage-hero.jpg)

## Key Features

### CSS-First Animations
A deliberate decision was to use pure CSS `@keyframes` animations instead of JavaScript animation libraries. The homepage cover features a full-screen animated sequence, and the "Three Pillars" sections use CSS-only animations in both horizontal and vertical layouts. This keeps the page lightweight and performant.

### Interactive Orbit Animation
The services section features a custom orbit animation built with spring physics in vanilla JavaScript. Nine service topics orbit around a central point, with click-to-snap, hover-to-pause, and responsive resize handling. No animation library was used — just physics equations and `requestAnimationFrame`.

![The about section with the BuildSystems team and mission.](../../../assets/content/projects/buildsystems-website/homepage-orbit.jpg)

### Drag-to-Scroll Carousel
The blog post carousel implements a custom drag-to-scroll interaction with momentum physics and smooth scroll-snap. Users can drag the carousel with mouse or touch, and it smoothly snaps to the nearest card when released.

![Blog post carousel with drag-to-scroll interaction.](../../../assets/content/projects/buildsystems-website/homepage-blog-carousel.jpg)

### Blog Posts from Notion
Each blog post is authored in Notion and rendered on the website at build time. The custom Notion block renderer supports rich content including embedded media (Instagram, TikTok, YouTube, CodePen), LaTeX equations via KaTeX, code blocks with Prism.js syntax highlighting, and link previews via metascraper.

![A blog post page showing content fetched and rendered from Notion.](../../../assets/content/projects/buildsystems-website/blog-post-notion.jpg)

### Portfolio and "Our Work" Page
The portfolio page displays all projects, events, tools, and news articles with categorized cards. Each card links to a detailed Notion-rendered article page with author profiles, related posts, and image galleries.

![The Our Work page showing categorized project cards.](../../../assets/content/projects/buildsystems-website/ourwork-page.jpg)

## Architecture

The project follows a pure Astro approach — no React or other JavaScript frameworks. All interactivity is built with vanilla TypeScript and CSS, resulting in minimal client-side JavaScript. The codebase consists of 89 Astro components, 22 TypeScript utility files, and 4 layout variants.

A custom build pipeline handles Notion content caching. Running `npm run cache:fetch` downloads all content and images from Notion, processes images with Sharp (removing EXIF data and optimizing formats), and stores them locally. This ensures fast builds and prevents unnecessary API calls during development.

## Responsive Design

The site uses CSS custom properties for fluid typography that scales across four breakpoints: mobile, tablet, desktop, and ultra-wide. The dark theme (`#222` background with `#d9d9d9` text and `#24b54a` brand green) provides a professional and modern look that matches BuildSystems' brand identity.

Self-hosted ABC Diatype fonts are preloaded to prevent Flash of Unstyled Text (FOUT), and the site uses SVG sprites for icons to minimize HTTP requests.

![Mobile view of the BuildSystems website.](../../../assets/content/projects/buildsystems-website/mobile-screenshot.jpg)
