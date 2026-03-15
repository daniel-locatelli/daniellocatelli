---
Cover: /assets/content/projects/buildsystems-website/multistory-timber-building.jpg
CoverAlt: Desktop screenshot of the BuildSystems website
Description: "Developed the BuildSystems website using the Astro framework, leveraging the Notion API as a CMS."
Name: BuildSystems Website
Tags:
  - Web Development
  - Astro
  - Notion API
  - TypeScript
Category: Software
City:
  - Munich
Client: BuildSystems GmbH
DateStart: "2023-08-01"
DateEnd: "2024-04-01"
Link:
  Text: BuildSystems Website
  Href: "https://buildsystems.de"
Place: BuildSystems GmbH
Director:
  - Martin Bittmann
Manager:
  - Julia Dorn
Team:
  - Daniel Nunes Locatelli
---

I developed the corporate website for [BuildSystems](https://buildsystems.de), a sustainability consultancy driving climate-neutral transformation in the building and real estate sector. The website serves as the company's digital presence, showcasing their services, portfolio of projects, team, and blog content. All managed through Notion as CMS.

The design was created by an external agency. My role was to implement the design and functionality using a cutting-edge tech stack focused on performance, to give great SEO.

## Tech Stack

- [**Astro**](https://astro.build/): Static site generator with TypeScript, chosen for its performance-first approach and zero-JS-by-default philosophy.
- [**Tailwind CSS**](https://tailwindcss.com/): Utility-first styling with custom CSS variables for responsive typography across four breakpoints.
- [**Notion API**](https://developers.notion.com/): Headless CMS integration — the team manages all content (blog posts, team members, partners, portfolio) directly from Notion.
- [**Cloudflare Pages**](https://pages.cloudflare.com/): Deployment with edge caching, automatic HTTPS, and DDoS protection.

## Why Notion as a CMS?

BuildSystems already used Notion extensively for internal documentation and project management. Instead of introducing a separate CMS that would require the team to learn a new tool, I integrated the Notion API directly into the build pipeline. This means the team can write and publish blog posts, update team profiles, and manage portfolio content entirely from Notion.

The integration fetches content at build time from multiple Notion databases (blog posts, team members, partners, organizations) and renders it using 30+ custom Notion components that handle headings, paragraphs, images, code blocks, tables, embeds, etc.

![The homepage hero section.](../../../assets/content/projects/buildsystems-website/homepage-hero.jpg)

## Key Features

### CSS-First Animations
A deliberate decision was to use pure CSS <code>@keyframes</code> animations instead of Lottie animations to avoid bloating the page with too much content, which would have impacted performance. The homepage cover features a full-screen animated sequence, and the "Three Pillars" sections use CSS-only animations in both horizontal and vertical layouts. This keeps the page lightweight and performant.

<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
<video autoplay loop muted playsinline preload="metadata" style="height: 60svh; align-items: center; justify-content: center; border-radius: 0.5rem;">
  <source src="/media/projects/buildsystems-website/three-pillars-animation.mp4" type="video/mp4" />
</video>
<p style="font-size: 0.875rem; color: #a1a1aa; margin-top: 0.5rem;">Homepage animation</p>
</div>

### Drag-to-Scroll Carousel
The blog post carousel implements a custom drag-to-scroll interaction with momentum physics and smooth scroll-snap. Users can drag the carousel with mouse or touch, and it smoothly snaps to the nearest card when released.

<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
<video autoplay loop muted playsinline preload="metadata" style="height: 60svh; align-items: center; justify-content: center; border-radius: 0.5rem;">
  <source src="/media/projects/buildsystems-website/drag-to-scroll-carousel.mp4" type="video/mp4" />
</video>
<p style="font-size: 0.875rem; color: #a1a1aa; margin-top: 0.5rem;">Drag-to-scroll carousel</p>
</div>

### Blog Posts from Notion
Each blog post is authored in Notion and rendered on the website at build time. It supports rich content including embedded media (Instagram, TikTok, YouTube, CodePen), LaTeX equations via KaTeX, code blocks with Prism.js syntax highlighting, and link previews via metascraper.

![A blog post page showing content fetched and rendered from Notion.](../../../assets/content/projects/buildsystems-website/blog-post-notion.jpg)

## Architecture

The project follows a pure Astro approach — no React or other JavaScript frameworks. All interactivity is built with vanilla TypeScript and CSS, resulting in minimal client-side JavaScript.

A custom build pipeline handles Notion content caching. Running <code>npm run cache:fetch</code> downloads all content and images from Notion, processes images with Sharp (removing EXIF data and optimizing formats), and stores them locally. This ensures fast builds and prevents unnecessary API calls during development.

## Responsive Design

The site uses CSS custom properties for fluid typography that scales across four breakpoints: mobile, tablet, desktop, and ultra-wide.

Self-hosted ABC Diatype fonts are preloaded to prevent Flash of Unstyled Text (FOUT), and the site uses SVG sprites for icons to minimize HTTP requests.
