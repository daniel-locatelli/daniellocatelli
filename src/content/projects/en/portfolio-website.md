---
Cover: /assets/content/projects/portfolio-website/homepage-screenshot-laptop.png
CoverAlt: "The homepage of daniellocatelli.com displayed on a laptop."
Name: Portfolio Website
Description: "This website: an Astro site whose content lives as plain markdown so that Claude Code can act as the CMS, with a Claude-powered chat, a scroll-driven geodesic sphere, in-browser slide decks, and an agent-ready surface on Cloudflare."
DateStart: "2024-04-27"
Organization: "Daniel Locatelli"
Category: Software
Tags:
  - Web Development
  - Astro
  - TypeScript
  - Claude
  - Three.js
  - Cloudflare
Link:
  Text: daniellocatelli.com
  Href: "https://daniellocatelli.com"
OtherLinks:
  - Text: Source code on GitHub
    Href: "https://github.com/daniel-locatelli/daniellocatelli"
  - Text: Agent Readiness (Cloudflare Blog)
    Href: "https://blog.cloudflare.com/agent-readiness/"
  - Text: Is It Agent Ready?
    Href: "https://isitagentready.com/"
Place: Online
---

This is the website you are reading right now. It started in April 2024 as a small Astro site and has since grown into a playground for the way I like to build things: fast static pages, content that is easy for both humans and AI tools to read, and a few interactive pieces to spice things&nbsp;up.

## Tech Stack

- [**Astro**](https://astro.build/) with TypeScript for the site itself, [**React**](https://react.dev/) for the few islands that need interactivity, and [**Tailwind CSS**](https://tailwindcss.com/) for styling.
- [**Astro Content Collections**](https://docs.astro.build/en/guides/content-collections/) for all content, written as markdown and MDX with typed frontmatter and validated at build time.
- [**Claude**](https://www.anthropic.com/claude) (Anthropic) for the homepage chat, with [**Supabase**](https://supabase.com/) as a vector store for retrieval.
- [**Three.js**](https://threejs.org/) for the geodesic sphere.
- [**Cloudflare Workers**](https://workers.cloudflare.com/) with Static Assets for hosting, edge caching, and the agent-facing endpoints; prerendered pages are served straight from the edge, and the Worker only runs for the chat and MCP endpoints.

## Claude Code as content management system

All the content lives as plain text files (written in [markdown](https://commonmark.org/help/)) in the same place as the code, the [public repository on GitHub](https://github.com/daniel-locatelli/daniellocatelli): one small file per project, research entry, publication, teaching item, or CV section, with a short header that holds the facts (title, dates, tags) above the text of the page, and a copy in each of the three languages. There is no database and no separate content system behind the pages.

![The src/ folder of the repository: assets/ expanded down to the cover image of this page, content/ down to its markdown file, the other folders collapsed.](/assets/content/projects/portfolio-website/src-tree-en.svg)

The point of this setup is to make the content directly accessible to AI harnesses such as [Claude Code](https://claude.com/claude-code). Because the content is just files next to the code, Claude Code can read, edit, create, and cross-check entries the same way it works on source code. In practice this means I use Claude Code as the content management system (CMS), the tool you would normally log into to add a page or fix a typo: I describe a new project or a correction in a sentence, and it writes or updates the files, keeps the headers consistent, and checks the related entries in the other languages. This very page was written that way. Everything on this site is co-created, from the code to the content.

Keeping the content in the repository as plain text has a second payoff: it is straightforward to chunk it, embed it, and feed it to a language model. That is what makes the AI chat on the homepage possible (more on it below).

## Translation by Claude Code

The site is available in English, Portuguese, and German. There is no translation service in the pipeline: when a content file changes in one locale, Claude Code translates it and updates the corresponding files in the other two. Structural fields such as dates, links, and places are kept in sync, while translatable fields such as country and city names are localised. The same applies to the interface strings, which live as typed objects per locale.

![How a change in one language reaches the other two: Claude Code reads the repository rule and writes the matching files, keeping dates and links identical and translating names and text.](/assets/content/projects/portfolio-website/translation-en.svg)

## AI chat on the homepage

The homepage opens with a chat powered by Claude. Visitors can ask what I am working on, where I studied, which tools I use, or anything else covered by the site, and get an answer grounded in the actual content rather than a generic reply.

Under the hood, a knowledge pipeline turns the content collections into small text chunks per locale (individual pages, CV entries, a chronological timeline, and a set of pre-written FAQ answers for the most common visitor questions), embeds them with Voyage AI, and stores the vectors in Supabase. When a question comes in, the API endpoint retrieves the most similar chunks and passes them to Claude as context. Whenever content changes, a single command regenerates the knowledge files and uploads fresh embeddings, and a benchmark script runs a fixed set of common questions against the chat to make sure it still answers all of them correctly.

![Architecture diagram: at build time the site's markdown content is split into knowledge chunks, embedded with Voyage AI and stored in Supabase; at runtime a visitor's question is embedded, the nearest chunks are retrieved and passed to Claude, which streams a grounded answer back to the page.](/assets/content/projects/portfolio-website/chat-pipeline-en.svg)

## The geodesic sphere

Below the chat sits a geodesic sphere rendered with Three.js. It follows the construction Buckminster Fuller made famous: start from an icosahedron, subdivide each face, project the vertices onto a sphere, and take the dual, so that the twelve original vertices become pentagons and everything else becomes hexagons. The sphere rotates as you scroll, tying the motion of the page to the geometry.

It is also a nod to my own path: geodesic and lightweight structures are a recurring theme in the projects and research on this site, from [Common Sky](/projects/common-sky-by-artengineering-for-studio-other-spaces) to my doctoral work on timber structures. Three.js is fetched right after the first screen has painted, in an idle moment, so it never sits on the critical path of the initial page load but is ready by the time you scroll down to the sphere.

## Presentation mode

Content items can carry a slide deck that lives alongside the writeup, in the same folder and the same repository. Decks are authored in MDX with a small YAML shorthand for the common slide types (title, text, image, image row, video, overlays), and rendered in the browser with keyboard navigation, an overview of all slides, and a presenter window. I use this for teaching and talks, so that a lecture and its slides are published together, versioned together, and translated together.

## Agent-ready on Cloudflare

Since much of the traffic to a site like this will increasingly come from AI agents rather than browsers, the site exposes its content in the formats agents expect:

- an `llms.txt` index per locale, generated from the content collections at build time;
- a markdown companion for every content page (append `.md` to the URL), plus content negotiation so that a request with `Accept: text/markdown` receives markdown directly;
- a `robots.txt` that explicitly welcomes AI crawlers, a sitemap with image entries, and an API catalog under `/.well-known/`;
- a small read-only [MCP](https://modelcontextprotocol.io/) server, so that agents can query the site's content as tools;
- [DNS-AID](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) discovery records (`_mcp._agents` and `_index._agents` SVCB records, DNSSEC-signed), so that agents can find the MCP endpoint from the domain name alone;
- a skills index under `/.well-known/agent-skills/`, following Cloudflare's [Agent Skills discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc), with two `SKILL.md` files in the [Agent Skills](https://agentskills.io/specification) format that teach an agent how to query the site via MCP or read it as markdown.

Getting content negotiation to work on prerendered pages took some digging into how Cloudflare's request pipeline, Workers Static Assets, and Astro's build-time middleware interact; the solution is a zone-level Cloudflare Snippet that rewrites the URL before it reaches the Worker. On [isitagentready.com](https://isitagentready.com/), the checker that accompanies Cloudflare's [agent-readiness guide](https://blog.cloudflare.com/agent-readiness/), the site went from a 25% score to 71/100, "Level 5, Agent-Native", with full marks for discoverability, content, and bot access control. The remaining points sit in the API and auth category and are deliberately left open: OAuth discovery, protected-resource metadata, and an `auth.md` only make sense when there is something to log in to, an A2A agent card describes an agent that offers services to other agents, and WebMCP exposes in-page actions such as forms or checkouts. A read-only portfolio has none of these, so the checker keeps listing them and the site keeps declining them.

![Is It Agent Ready? result: 71/100, Level 5, Agent-Native](../../../assets/content/projects/portfolio-website/result-isitagentready.png)

## Performance and Lighthouse

The site is mostly static HTML, which already gives it a head start. On top of that, images are served in responsive sizes with explicit widths so nothing shifts while loading, body images are lazy-loaded and preloaded just ahead of the viewport, fonts are subset and preloaded, and heavy scripts are deferred until they are actually needed: Three.js waits for an idle moment and then only redraws the sphere while it is actually moving, and the chat window (with its markdown renderer and animations) is fetched only when a visitor starts typing, so the hero input itself ships just a few kilobytes of JavaScript. The logos in the skills map are served as separate lazily loaded image files rather than inlined into the page, which cut the homepage HTML from roughly 350 KB to under 70 KB, so the first paint no longer waits on hundreds of kilobytes of vector paths. Together these changes pushed the Lighthouse scores for performance, accessibility, best practices, and SEO to the top of the scale.

![Lighthouse result: 100 for performance, accessibility, best practices, and SEO](../../../assets/content/projects/portfolio-website/result-lighthouse.png)

## Smaller details

- **Link previews at build time.** External links listed on a page are rendered as preview cards. Their titles, descriptions, images, and favicons are fetched once and cached in the repository, so the build is reproducible and no third-party request happens at page load.
- **Footnotes with tooltips.** Markdown footnotes get a hover tooltip showing the note inline, so readers do not have to jump to the bottom of the page.
- **One source for every CV.** The short CV, the full CV, and the PhD-oriented CV are all rendered from the same content collections, so an experience or publication only ever needs to be entered once.
