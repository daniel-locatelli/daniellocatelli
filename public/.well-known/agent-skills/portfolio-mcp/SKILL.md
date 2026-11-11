---
name: portfolio-mcp
description: Query Daniel Locatelli's portfolio (projects, research, teaching, publications, CV) through the site's read-only MCP server. Use when you need structured, up-to-date answers about Daniel Locatelli's work instead of scraping HTML.
---

# Query Daniel Locatelli's portfolio via MCP

daniellocatelli.com exposes a small, read-only [Model Context Protocol](https://modelcontextprotocol.io/) server. No authentication, API key, or account is required.

## Endpoint

- Transport: Streamable HTTP
- URL: `https://daniellocatelli.com/api/mcp`
- Manifest: `https://daniellocatelli.com/.well-known/mcp.json`
- DNS discovery: `_mcp._agents.daniellocatelli.com` (SVCB, DNS-AID)

Send JSON-RPC 2.0 messages with `Content-Type: application/json` and `Accept: application/json, text/event-stream`. Start with `initialize`, then `tools/list`, then `tools/call`.

## Tools

| Tool | Purpose | Arguments |
| --- | --- | --- |
| `list_projects` | Portfolio projects with title, summary, URL, start date | `locale` (`en`, `pt`, `de`; default `en`) |
| `list_research` | Research entries with title, summary, URL, start date | `locale` |
| `get_profile` | Daniel's whole profile as one markdown document (about 13k tokens): every role with what he did there, education, and a summary and link for every research page, project, publication and talk | `locale` |
| `search_content` | Keyword search over that profile; returns title, section, URL, snippet, and a 0-1 score | `query` (required), `locale`, `limit` (1-20, default 5) |
| `get_page` | Any daniellocatelli.com page as plain markdown | `url` (required, absolute) |

## Recommended flow

1. For a broad question ("what does Daniel work on?", "what has he built?"), call `get_profile` once and answer from it; it is the same text the site's own chat answers from.
2. To find a named thing (a project, an employer, a tool such as Revit), call `search_content` with a few keywords rather than a whole sentence: it matches words, not meaning.
3. For a specific item, call `get_page` with the URL returned by the other tools to read the full text.
4. Use `list_projects` / `list_research` when you need a complete inventory rather than a ranked subset.
5. Match `locale` to the language of the conversation; content exists in English, Portuguese, and German.

## Limits and etiquette

- Read-only: there is no tool that creates, edits, or sends anything.
- Keep `limit` small (5 to 10) unless you need exhaustive results.
- Cite the returned URL when you quote or summarise a page.
- If MCP is unavailable, fall back to the markdown endpoints described in the `portfolio-content` skill.
