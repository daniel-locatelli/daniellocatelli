URL: https://daniellocatelli.com/projects/portfolio-website

# Portfolio Website

Description: This website: an Astro site whose content lives as plain markdown so that Claude Code can act as the CMS, with a Claude-powered chat, a scroll-driven geodesic sphere, in-browser slide decks, and an agent-ready surface on Cloudflare.
Tags: Web Development, Astro, TypeScript, Claude, Three.js, Cloudflare
Category: Software
Organization: Daniel Locatelli
Place: Online
Date: April 2024
Link: https://daniellocatelli.com

This is the website you are reading right now. It started in April 2024 as a small Astro site pulling its pages from Notion, and it has since grown into a playground for the way I like to build things: fast static pages, content that is easy for both humans and AI tools to read, and a few interactive pieces where they add something.

## Tech Stack

- [**Astro**](https://astro.build/) with TypeScript for the site itself, [**React**](https://react.dev/) for the few islands that need interactivity, and [**Tailwind CSS**](https://tailwindcss.com/) for styling.
- [**Astro Content Collections**](https://docs.astro.build/en/guides/content-collections/) for all content, written as markdown and MDX with typed frontmatter and validated at build time.
- [**Claude**](https://www.anthropic.com/claude) (Anthropic) for the homepage chat, with [**Supabase**](https://supabase.com/) as a vector store for retrieval.
- [**Three.js**](https://threejs.org/) for the geodesic sphere.
- [**Cloudflare Workers**](https://workers.cloudflare.com/) with Static Assets for hosting, edge caching, and the agent-facing endpoints; prerendered pages are served straight from the edge, and the Worker only runs for the chat and MCP endpoints.

## From Notion to markdown, with Claude Code as CMS

The first version used the Notion API as a headless CMS, the same setup I had built for the [BuildSystems website](/projects/buildsystems-website). Notion is pleasant to write in, but every page had to travel through an API, a block-to-HTML converter, and an image cache before it became a web page. More importantly, the content was locked behind an API that AI coding tools could not simply open and read.

In early 2026 I migrated everything to plain markdown files inside the repository, organised as Astro Content Collections. Each project, research entry, publication, teaching item, and CV section is now a file with typed frontmatter and a markdown body, one folder per locale.

The point of the change was to make the content directly accessible to AI harnesses such as [Claude Code](https://claude.com/claude-code). Because the content is just files next to the code, Claude Code can read, edit, create, and cross-check entries the same way it works on source code. In practice this means I use Claude Code as the CMS: I describe a new project or a correction in a sentence, and it writes or updates the files, keeps the frontmatter consistent, and checks the related entries in the other languages. This very page was written that way. Everything on this site is co-created, from the code to the content.

The migration had a second payoff: with all the content sitting in the repository as plain text, it became straightforward to chunk it, embed it, and feed it to a language model. That is what made the AI chat on the homepage possible.

## Translation by Claude Code

The site is available in English, Portuguese, and German. There is no translation service in the pipeline: when a content file changes in one locale, Claude Code translates it and updates the corresponding files in the other two. Structural fields such as dates, links, and places are kept in sync, while translatable fields such as country and city names are localised. The same applies to the interface strings, which live as typed objects per locale.

## AI chat on the homepage

The homepage opens with a chat powered by Claude. Visitors can ask what I am working on, where I studied, which tools I use, or anything else covered by the site, and get an answer grounded in the actual content rather than a generic reply.

Under the hood, a knowledge pipeline turns the content collections into small text chunks per locale (individual pages, CV entries, a chronological timeline, and a set of pre-written FAQ answers for the most common visitor questions), embeds them with Voyage AI, and stores the vectors in Supabase. When a question comes in, the API endpoint retrieves the most similar chunks and passes them to Claude as context. Whenever content changes, a single command regenerates the knowledge files and uploads fresh embeddings, and a benchmark script runs a fixed set of common questions against the chat to make sure it still answers all of them correctly.

<div class="chat-pipeline-diagram" style="overflow-x:auto;margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 344" role="img" aria-labelledby="chat-pipeline-en-title chat-pipeline-en-desc" style="display:block;width:100%;min-width:600px;height:auto">
<title id="chat-pipeline-en-title">How the homepage chat answers a question</title>
<desc id="chat-pipeline-en-desc">Architecture diagram: at build time the site's markdown content is split into knowledge chunks, embedded with Voyage AI and stored in Supabase; at runtime a visitor's question is embedded, the nearest chunks are retrieved and passed to Claude, which streams a grounded answer back to the page.</desc>
<defs><marker id="chat-pipeline-en-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a1a1aa"/></marker></defs>
<rect width="100%" height="100%" fill="#000000"/>
<rect x="16" y="24" width="728" height="104" rx="8" fill="rgba(244,244,245,0.02)" stroke="rgba(244,244,245,0.10)" stroke-width="0.8"/>
<rect x="28" y="28" width="148" height="12" rx="2" fill="#000000"/>
<text x="32" y="37" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.14em">BUILD TIME · CONTENT SYNC</text>
<rect x="16" y="184" width="728" height="104" rx="8" fill="rgba(244,244,245,0.02)" stroke="rgba(244,244,245,0.10)" stroke-width="0.8"/>
<rect x="28" y="188" width="152" height="12" rx="2" fill="#000000"/>
<text x="32" y="197" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.14em">RUNTIME · VISITOR QUESTION</text>
<line x1="176" y1="84" x2="216" y2="84" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<line x1="360" y1="84" x2="400" y2="84" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<line x1="544" y1="84" x2="584" y2="84" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<line x1="176" y1="244" x2="216" y2="244" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<line x1="360" y1="244" x2="400" y2="244" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<line x1="544" y1="244" x2="584" y2="244" stroke="#a1a1aa" stroke-width="1.2" marker-end="url(#chat-pipeline-en-arrow)"/>
<path d="M656,112 V148 Q656,156 648,156 H296 Q288,156 288,164 V216" fill="none" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#chat-pipeline-en-arrow)"/>
<rect x="450" y="136" width="44" height="12" rx="2" fill="#000000"/>
<text x="472" y="145" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle" letter-spacing="0.06em">SEARCH</text>
<rect x="32" y="56" width="144" height="56" rx="6" fill="#000000"/>
<rect x="32" y="56" width="144" height="56" rx="6" fill="rgba(161,161,170,0.10)" stroke="#71717a" stroke-width="1"/>
<text x="104" y="82" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Content collections</text>
<text x="104" y="98" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">markdown, 3 locales</text>
<rect x="216" y="56" width="144" height="56" rx="6" fill="#000000"/>
<rect x="216" y="56" width="144" height="56" rx="6" fill="#18181b" stroke="#f4f4f5" stroke-width="1"/>
<text x="288" y="82" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Knowledge chunks</text>
<text x="288" y="98" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">pages, CV, FAQ</text>
<rect x="400" y="56" width="144" height="56" rx="6" fill="#000000"/>
<rect x="400" y="56" width="144" height="56" rx="6" fill="rgba(244,244,245,0.03)" stroke="rgba(244,244,245,0.30)" stroke-width="1"/>
<text x="472" y="82" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Voyage AI</text>
<text x="472" y="98" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">embeddings</text>
<rect x="584" y="56" width="144" height="56" rx="6" fill="#000000"/>
<rect x="584" y="56" width="144" height="56" rx="6" fill="rgba(244,244,245,0.05)" stroke="#a1a1aa" stroke-width="1"/>
<text x="656" y="82" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Supabase</text>
<text x="656" y="98" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">vector store</text>
<rect x="32" y="216" width="144" height="56" rx="6" fill="#000000"/>
<rect x="32" y="216" width="144" height="56" rx="6" fill="rgba(161,161,170,0.10)" stroke="#71717a" stroke-width="1"/>
<text x="104" y="242" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Visitor question</text>
<text x="104" y="258" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">homepage chat</text>
<rect x="216" y="216" width="144" height="56" rx="6" fill="#000000"/>
<rect x="216" y="216" width="144" height="56" rx="6" fill="#18181b" stroke="#f4f4f5" stroke-width="1"/>
<text x="288" y="242" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Retrieval</text>
<text x="288" y="258" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">embed, nearest chunks</text>
<rect x="400" y="216" width="144" height="56" rx="6" fill="#000000"/>
<rect x="400" y="216" width="144" height="56" rx="6" fill="rgba(34,197,94,0.10)" stroke="#22c55e" stroke-width="1"/>
<text x="472" y="242" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Claude</text>
<text x="472" y="258" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">answer from context</text>
<rect x="584" y="216" width="144" height="56" rx="6" fill="#000000"/>
<rect x="584" y="216" width="144" height="56" rx="6" fill="#18181b" stroke="#f4f4f5" stroke-width="1"/>
<text x="656" y="242" fill="#f4f4f5" font-size="12" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif" text-anchor="middle">Answer</text>
<text x="656" y="258" fill="#a1a1aa" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" text-anchor="middle">streamed to the page</text>
<line x1="16" y1="308" x2="744" y2="308" stroke="rgba(244,244,245,0.12)" stroke-width="0.8"/>
<rect x="16" y="321" width="12" height="8" rx="2" fill="rgba(161,161,170,0.10)" stroke="#71717a" stroke-width="1"/>
<text x="34" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">Input</text>
<rect x="84" y="321" width="12" height="8" rx="2" fill="#18181b" stroke="#f4f4f5" stroke-width="1"/>
<text x="102" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">Step</text>
<rect x="144" y="321" width="12" height="8" rx="2" fill="rgba(244,244,245,0.03)" stroke="rgba(244,244,245,0.30)" stroke-width="1"/>
<text x="162" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">External service</text>
<rect x="268" y="321" width="12" height="8" rx="2" fill="rgba(244,244,245,0.05)" stroke="#a1a1aa" stroke-width="1"/>
<text x="286" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">Data store</text>
<rect x="360" y="321" width="12" height="8" rx="2" fill="rgba(34,197,94,0.10)" stroke="#22c55e" stroke-width="1"/>
<text x="378" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">Focal</text>
<line x1="428" y1="325" x2="440" y2="325" stroke="#a1a1aa" stroke-width="1" stroke-dasharray="4,3"/>
<text x="446" y="328" fill="#71717a" font-size="8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" letter-spacing="0.06em">Read at query time</text>
</svg>
</div>

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
- an [Agent Skills](https://agentskills.io/) index under `/.well-known/agent-skills/` with two `SKILL.md` files that teach an agent how to query the site via MCP or read it as markdown.

Getting content negotiation to work on prerendered pages took some digging into how Cloudflare's request pipeline, Workers Static Assets, and Astro's build-time middleware interact; the solution is a zone-level Cloudflare Snippet that rewrites the URL before it reaches the Worker. On [isitagentready.com](https://isitagentready.com/), the checker that accompanies Cloudflare's [agent-readiness guide](https://blog.cloudflare.com/agent-readiness/), the site went from a 25% score to 71/100, "Level 5, Agent-Native", with full marks for discoverability, content, and bot access control. The remaining points sit in the API and auth category and are deliberately left open: OAuth discovery, protected-resource metadata, and an `auth.md` only make sense when there is something to log in to, an A2A agent card describes an agent that offers services to other agents, and WebMCP exposes in-page actions such as forms or checkouts. A read-only portfolio has none of these, so the checker keeps listing them and the site keeps declining them.

## Performance and Lighthouse

The site is mostly static HTML, which already gives it a head start. On top of that, images are served in responsive sizes with explicit widths so nothing shifts while loading, body images are lazy-loaded and preloaded just ahead of the viewport, fonts are subset and preloaded, and heavy scripts are deferred until they are actually needed: Three.js waits for an idle moment and then only redraws the sphere while it is actually moving, and the chat window (with its markdown renderer and animations) is fetched only when a visitor starts typing, so the hero input itself ships just a few kilobytes of JavaScript. The logos in the skills map are served as separate lazily loaded image files rather than inlined into the page, which cut the homepage HTML from roughly 350 KB to under 70 KB, so the first paint no longer waits on hundreds of kilobytes of vector paths. Together these changes pushed the Lighthouse scores for performance, accessibility, best practices, and SEO to the top of the scale.

## Smaller details

- **Link previews at build time.** External links listed on a page are rendered as preview cards. Their titles, descriptions, images, and favicons are fetched once and cached in the repository, so the build is reproducible and no third-party request happens at page load.
- **Footnotes with tooltips.** Markdown footnotes get a hover tooltip showing the note inline, so readers do not have to jump to the bottom of the page.
- **One source for every CV.** The short CV, the full CV, and the PhD-oriented CV are all rendered from the same content collections, so an experience or publication only ever needs to be entered once.
