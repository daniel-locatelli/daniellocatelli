---
name: portfolio-content
description: Read Daniel Locatelli's website as plain markdown without MCP. Use when you need the text of a specific page, an index of all content, or a lightweight way to browse the site in English, Portuguese, or German.
---

# Read Daniel Locatelli's site as markdown

Every page on daniellocatelli.com is available as markdown, so you can read content directly without parsing HTML.

## Entry points

- `https://daniellocatelli.com/llms.txt`: index of all English content with one-line summaries and URLs.
- `https://daniellocatelli.com/pt/llms.txt` and `https://daniellocatelli.com/de/llms.txt`: the same index in Portuguese and German.
- `https://daniellocatelli.com/sitemap-index.xml`: full sitemap, including images.

## Getting a page as markdown

Either of these works for any content page:

1. Append `.md` to the URL, for example `https://daniellocatelli.com/projects/portfolio-website.md`.
2. Request the normal URL with the header `Accept: text/markdown`; the server returns the markdown version.

The markdown keeps headings, links, and image references, and drops navigation and layout.

## Locales

English pages live at the root (`/projects/...`), Portuguese under `/pt/`, German under `/de/`. The same slug is used across locales, so swap the prefix to switch language.

## What is on the site

Projects (AEC software, computational design, art installations), research (doctoral work at ETH Zurich on computational design and digital fabrication), teaching (courses, workshops, slide decks), publications, and a full CV.

## Etiquette

- Crawling is welcome; see `https://daniellocatelli.com/robots.txt` for the exact rules.
- Cite the page URL when you quote or summarise content.
- For search or structured queries, prefer the MCP server described in the `portfolio-mcp` skill.
