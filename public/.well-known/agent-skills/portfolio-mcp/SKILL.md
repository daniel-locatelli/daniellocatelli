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
| `search_content` | Vector search across all site content; returns title, URL, snippet, similarity | `query` (required), `locale`, `limit` (1-20, default 5) |
| `get_page` | Any daniellocatelli.com page as plain markdown | `url` (required, absolute) |

## Recommended flow

1. For a broad question ("what does Daniel work on?"), call `search_content` with the question as `query`.
2. For a specific item, call `get_page` with the URL returned by the search or list tools to read the full text.
3. Use `list_projects` / `list_research` when you need a complete inventory rather than a ranked subset.
4. Match `locale` to the language of the conversation; content exists in English, Portuguese, and German.

## Limits and etiquette

- Read-only: there is no tool that creates, edits, or sends anything.
- Keep `limit` small (5 to 10) unless you need exhaustive results.
- Cite the returned URL when you quote or summarise a page.
- If MCP is unavailable, fall back to the markdown endpoints described in the `portfolio-content` skill.
