# Agent Readiness — Design

**Status:** Approved, pending implementation plan
**Date:** 2026-05-20
**Owner:** Daniel Locatelli
**Motivation:** Improve the daniellocatelli.com score on https://isitagentready.com (currently 25%) by addressing the checks that genuinely matter for a personal portfolio. The score is a vanity metric; the goal is to make the site actually useful to AI agents (LLM clients, MCP-capable agents, AI search) while keeping operational cost near zero.

## Goals

1. Make the site discoverable and parseable by AI agents: explicit AI bot rules, a curated `llms.txt`, a `Link` header pointing at the sitemap, and Content Signals metadata.
2. Serve a clean markdown variant of every content page so agents can consume the source without HTML stripping.
3. Publish a read-only MCP server card that exposes the portfolio as agent-queryable tools (`list_projects`, `search_content`, `get_cv`, etc.) at near-zero recurring cost.
4. Avoid functionality that costs money per request (no exposing the paid Anthropic-backed chat as a free MCP tool).

## Non-goals

- OAuth discovery (`/.well-known/oauth-*`): no user accounts on this site.
- Web Bot Auth: meant for paid or rate-limited APIs; irrelevant here.
- Commerce protocols (x402, MPP, UCP, ACP): no commerce on this site.
- Full agent skills / WebMCP discovery beyond a static MCP card.
- Server-side rewriting of the existing `/api/ai` chat (paid, stays as-is, NOT exposed via MCP).

## Expected score impact

| Category | Before | After (target) |
|---|---|---|
| Discoverability | partial | full |
| Content Accessibility | none | full |
| Bot Access Control | minimal | mostly addressed (Web Bot Auth excluded) |
| Protocol Discovery | none | partial (MCP card + tools; OAuth/WebMCP excluded) |
| Commerce | none | none (N/A) |
| **Overall** | 25% | ~60-70% |

## Architecture

Four workstreams, all shippable as a single PR. They share one underlying refactor: a `content-index` module that walks `src/content/` once and feeds three consumers (existing knowledge generator, new `llms.txt` generator, new MCP `list_*` tools).

```
src/scripts/lib/content-index.ts   ← new shared walker
   │
   ├─→ src/scripts/generate-knowledge.ts     (existing, refactored to consume the walker)
   ├─→ src/scripts/generate-llms-txt.ts      (new)
   ├─→ src/scripts/generate-markdown-pages.ts (new)
   └─→ src/pages/api/mcp.ts                  (new MCP route, imports walker)
```

### Section 1 — Discoverability & Bot Access Control

**Files changed:**
- `public/robots.txt` (rewritten)
- `public/_headers` (new)

**robots.txt structure:**
- Default `User-agent: * / Allow: /`
- Explicit `Allow: /` blocks for: GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider, Applebot-Extended, Cohere-ai, Diffbot, Amazonbot, FacebookBot
- `Content-Signal: search=yes, ai-train=yes, ai-input=yes` line (Cloudflare 2024 proposal, signals the user welcomes all three uses)
- `Sitemap: https://daniellocatelli.com/sitemap-index.xml`

**_headers content (Cloudflare Workers Static Assets honors this file the same way Pages does):**
```
/*
  Link: </sitemap-index.xml>; rel="sitemap"
  X-Robots-Tag: all
```

**Verification:**
- `curl -I https://daniellocatelli.com/` shows the `Link` header.
- `curl https://daniellocatelli.com/robots.txt` shows the expanded content.

### Section 2 — `llms.txt` auto-generation

**Files:**
- `src/scripts/lib/content-index.ts` (new shared walker, extracted from `generate-knowledge.ts`)
- `src/scripts/generate-llms-txt.ts` (new)
- `package.json` — add a `prebuild` script chaining the new generators. Decision: keep them as two scripts (`generate-llms-txt.ts` and `generate-markdown-pages.ts`) so each has a single responsibility and can be re-run independently; chain them with `&&` in `prebuild`.

**Outputs:**
- `public/llms.txt` (English, default)
- `public/pt/llms.txt`
- `public/de/llms.txt`

**Format (per llmstxt.org):**
```
# Daniel Locatelli
> AEC software engineer based in Berlin. Architecture × Computation × AI.

## About
- [Homepage](https://daniellocatelli.com/): bio, current role, contact
- [CV](https://daniellocatelli.com/cv): experience, education, skills

## Projects
- [<title>](https://daniellocatelli.com/projects/<slug>): <summary>
- ...

## Research
- ...

## Teaching
- ...

## Publications
- ...

## Optional
- [Portuguese index](https://daniellocatelli.com/pt/llms.txt)
- [German index](https://daniellocatelli.com/de/llms.txt)
```

**Refactor risk:** `generate-knowledge.ts` is a critical input to the existing chat embeddings pipeline. The refactor must preserve identical output. Mitigated by running `npx tsx src/scripts/generate-knowledge.ts` before and after and diffing `knowledge/` to confirm zero changes.

### Section 3 — Markdown content negotiation

**Strategy:** emit `.md` companions at build time AND honor `Accept: text/markdown` via middleware.

**Files:**
- `src/scripts/generate-markdown-pages.ts` (new; consumes the shared walker)
- `src/middleware.ts` (new)

**Build-time output:**
For every content-collection page, emit `public/<route>.md`. Examples:
- `public/en/projects/<slug>.md` (or `public/projects/<slug>.md` if the default locale path has no `/en/` prefix — must match the actual route)
- `public/pt/projects/<slug>.md`
- `public/de/projects/<slug>.md`
- Same for `research`, `teaching`, `publications`.
- For the homepage and CV: `public/index.md`, `public/cv.md` (and locale variants).

Each `.md` file contains:
- A short front-matter block (canonical URL, locale, last-modified)
- The raw source markdown body (no Astro components, no JSX, no React)
- For MDX content that contains JSX, the script strips components and falls back to the structured fields (title, summary, dates, etc.) so the output is always plain markdown.

**Middleware behavior:** When the request `Accept` header includes `text/markdown` and the request path does NOT already end in `.md`, respond with a 302 to `<path>.md`. No suffix-stripping logic on the way back — clients that need markdown either request it via header or follow the redirect.

**Edge cases documented:**
- Trailing-slash routes: middleware redirects `/projects/foo/` to `/projects/foo.md` (drops the slash).
- 404 protection: if the corresponding `.md` doesn't exist (e.g., a dynamic route), middleware falls through and serves HTML.
- Caching: `.md` files are static assets, cached the same as everything else.

### Section 4 — Read-only MCP server

**Files:**
- `public/.well-known/mcp.json` (new static manifest)
- `src/pages/api/mcp.ts` (new API route — JSON-RPC handler implementing MCP streamable-HTTP transport)

**Tools exposed (all read-only, no Anthropic calls):**

| Tool | Backend | Cost per call |
|---|---|---|
| `list_projects(locale="en")` | Built-in JSON snapshot from content collections at build time | $0 |
| `list_research(locale="en")` | Same | $0 |
| `list_teaching(locale="en")` | Same | $0 |
| `list_publications(locale="en")` | Same | $0 |
| `get_cv(locale="en")` | Same (experiences, education, certifications, scholarships) | $0 |
| `search_content(query, locale="en", limit=5)` | Voyage embed + Supabase RPC `match_knowledge` (existing) | ~$0.0001 |
| `get_page(url)` | Fetches the corresponding `.md` from the same site | $0 |

**Rate limit:** Cloudflare KV (`AI_HEALTH_KV` is already bound) counts IP→hourly hits on `search_content`. Cap: 30 calls / IP / hour. Returns a JSON-RPC error past the cap. Other tools are unlimited (they hit no upstream).

**Manifest sketch (`/.well-known/mcp.json`):**
```json
{
  "schemaVersion": "2025-06-18",
  "name": "daniel-locatelli-portfolio",
  "description": "Read-only access to Daniel Locatelli's portfolio: projects, research, teaching, publications, CV.",
  "version": "1.0.0",
  "transport": {
    "type": "streamable-http",
    "url": "https://daniellocatelli.com/api/mcp"
  },
  "tools": [
    { "name": "list_projects", "description": "List portfolio projects", "inputSchema": { ... } },
    ...
  ]
}
```

**Why not Cloudflare's `McpAgent` (Durable Objects):** McpAgent is the "right" way for stateful sessions but adds a DO binding, billing surface, and infrastructure complexity. This server is stateless (every call independent), so a plain Astro API route handling JSON-RPC is sufficient and matches the rest of the site's architecture.

### Section 5 — Verification

**File:** `src/scripts/verify-agent-readiness.ts` (new)

Runs the same checks the scanner does, against a configurable origin (default: production):
- `GET /robots.txt` — asserts AI bot rules, sitemap directive, content signals
- `GET /llms.txt` — asserts present and well-formed
- `GET /sitemap-index.xml` — asserts 200
- `HEAD /` — asserts `Link` and `X-Robots-Tag` headers
- `GET /` with `Accept: text/markdown` — asserts 302 to `/index.md`
- `GET /<some>.md` — asserts 200 and `Content-Type: text/markdown`
- `GET /.well-known/mcp.json` — asserts 200 and parseable
- `POST /api/mcp` with a `tools/list` JSON-RPC body — asserts the tool list contains the expected names

Runs in CI on push to main (post-deploy) and locally with `--origin http://localhost:4321` for dev verification.

## Estimated effort

| Workstream | Estimated effort |
|---|---|
| robots.txt + _headers | 30 min |
| content-index refactor + llms.txt generator | 2-3 hr |
| Markdown variants + middleware | 2-3 hr |
| MCP route + manifest + KV rate limit | 3-4 hr |
| Verification script + manual re-score | 1 hr |
| **Total** | **~9-12 hr** |

## Open questions for implementation

1. **Locale URL convention:** Does the default English locale use `/projects/<slug>` or `/en/projects/<slug>`? The markdown-pages generator must mirror whatever the live router produces. Verify against `astro build` output before writing the generator.
2. **MDX → markdown stripping:** Some teaching deck pages are MDX with `<Slide>` JSX. For those, the markdown variant should fall back to title + summary + structured fields rather than failing. Confirm the stripping pass produces sensible output for one MDX-heavy page before assuming it works everywhere.
3. **Sitemap inclusion of `.md` URLs:** Probably NO (would bloat the sitemap and confuse search engines). Decision: keep `.md` URLs out of the sitemap; they're discoverable via the `Accept` header or by suffix convention.
