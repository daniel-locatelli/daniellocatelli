# Agent Readiness — Design

**Status:** Approved (revised after review), pending implementation plan
**Date:** 2026-05-20
**Owner:** Daniel Locatelli
**Motivation:** Improve the daniellocatelli.com score on https://isitagentready.com (currently 25%) by addressing the checks that genuinely matter for a personal portfolio. The score is a vanity metric; the goal is to make the site actually useful to AI agents (LLM clients, MCP-capable agents, AI search) while keeping operational cost near zero.

## Goals

1. Make the site discoverable and parseable by AI agents: explicit AI bot rules, a curated `llms.txt`, a `Link` header pointing at the sitemap, and Content Signals metadata.
2. Serve a clean markdown variant of every content page at the same URL (via content negotiation) **and** at a `.md` suffix URL, both returning `200 OK text/markdown` directly (no redirect chains).
3. Publish a read-only MCP server card that exposes the portfolio as agent-queryable tools (`list_projects`, `search_content`, `get_cv`, etc.) at near-zero recurring cost.
4. Use idiomatic Astro patterns (File Endpoints, middleware `rewrite()`) rather than fighting the framework with prebuild scripts.
5. Avoid functionality that costs money per request (no exposing the paid Anthropic-backed chat as a free MCP tool).

## Non-goals

- OAuth discovery (`/.well-known/oauth-*`): no user accounts on this site.
- Web Bot Auth: meant for paid or rate-limited APIs; irrelevant here.
- Commerce protocols (x402, MPP, UCP, ACP): no commerce on this site.
- Full agent skills / WebMCP discovery beyond a static MCP card.
- Server-side rewriting of the existing `/api/ai` chat (paid, stays as-is, NOT exposed via MCP).
- A shared `content-index` walker. The Content Collections API (`getCollection`) does the walking. `generate-knowledge.ts` keeps its own filesystem walker because it runs outside the Astro lifecycle.

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

Four workstreams. All artifacts live inside Astro's lifecycle — no prebuild scripts beyond the existing knowledge-sync pipeline.

```
src/pages/llms.txt.ts                 ← File Endpoint (English, root)
src/pages/[locale]/llms.txt.ts        ← File Endpoint (pt, de)
src/pages/[...path].md.ts             ← File Endpoint for markdown variants
src/pages/api/mcp.ts                  ← MCP JSON-RPC handler
src/middleware.ts                     ← Accept: text/markdown negotiation
public/.well-known/mcp.json           ← Static MCP manifest
public/robots.txt                     ← Rewritten
public/_headers                       ← New, Cloudflare Static Assets
```

All four endpoints call `getCollection()` from `astro:content`. No custom walker, no parallel content-discovery code.

### Section 1 — Discoverability & Bot Access Control

**Files changed:**
- `public/robots.txt` (rewritten)
- `public/_headers` (new)

**robots.txt structure:**
- Default `User-agent: * / Allow: /`
- Explicit `Allow: /` blocks for: GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider, Applebot-Extended, Cohere-ai, Diffbot, Amazonbot, FacebookBot
- `Content-Signal: search=yes, ai-train=yes, ai-input=yes` (Cloudflare 2024 proposal; signals the user welcomes all three uses)
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

### Section 2 — `llms.txt` via Astro File Endpoints

**Files:**
- `src/pages/llms.txt.ts` — emits the English root `llms.txt`
- `src/pages/[locale]/llms.txt.ts` — emits `pt/llms.txt` and `de/llms.txt` via `getStaticPaths`

**Implementation pattern (sketch):**
```ts
// src/pages/llms.txt.ts
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects", e => e.id.startsWith("en/"));
  const research = await getCollection("research", e => e.id.startsWith("en/"));
  // ... build markdown
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
```

**Output format (per llmstxt.org):**
```
# Daniel Locatelli
> AEC software engineer based in Berlin. Architecture × Computation × AI.

## About
- [Homepage](https://daniellocatelli.com/): bio, current role, contact
- [CV](https://daniellocatelli.com/cv): experience, education, skills

## Projects
- [<title>](https://daniellocatelli.com/projects/<slug>): <summary>
- ...

## Research / Teaching / Publications
- ...

## Optional
- [Portuguese index](https://daniellocatelli.com/pt/llms.txt)
- [German index](https://daniellocatelli.com/de/llms.txt)
```

No prebuild script. No shared walker. Astro emits the static files at build time.

### Section 3 — Markdown content negotiation

**Strategy:** emit `.md` companions at build time via a File Endpoint + use Astro middleware `rewrite()` to internally serve the `.md` body when `Accept: text/markdown` is requested at the canonical URL.

**Files:**
- `src/pages/[...path].md.ts` — File Endpoint emitting `.md` for every content-collection page (uses `getStaticPaths()`)
- `src/middleware.ts` — Astro middleware, inspects `Accept` header, rewrites internally to the corresponding `.md` URL when applicable

**Endpoint pattern (sketch):**
```ts
// src/pages/[...path].md.ts
import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const collections = ["projects", "research", "teaching", "publications"];
  const entries = (await Promise.all(collections.map(c => getCollection(c)))).flat();
  return entries.map(entry => ({
    params: { path: entry.id.replace(/\.(md|mdx)$/, "") },
    props: { entry },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const md = renderEntryAsPlainMarkdown(props.entry);
  return new Response(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
```

**Middleware behavior (using `rewrite()`, NOT `redirect()`):**
```ts
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const accept = ctx.request.headers.get("accept") ?? "";
  const wantsMarkdown =
    /text\/markdown/i.test(accept) && !ctx.url.pathname.endsWith(".md");
  if (wantsMarkdown) {
    const target = ctx.url.pathname.replace(/\/$/, "") + ".md";
    return ctx.rewrite(target); // internal rewrite; client sees 200 at original URL
  }
  return next();
});
```

**Result:** an agent requesting `GET /projects/foo` with `Accept: text/markdown` receives `200 OK Content-Type: text/markdown` with the markdown body, at the original URL. No redirect chain. Strict clients work.

**MDX→markdown stripping:** AST-based, not regex. Pass the raw body through a small remark transform that removes `mdxJsxFlowElement` and `mdxJsxTextElement` nodes, then `mdast-util-to-markdown` to stringify. For pages dominated by JSX (some teaching deck MDX files), the endpoint falls back to a structured rendering of front-matter fields (title, summary, dates, links) so output is always meaningful markdown.

**Edge cases:**
- 404 protection: `getStaticPaths` only emits `.md` for entries that exist. Routes without a content-collection backing return 404 — middleware skips rewrite if the corresponding `.md` doesn't exist (caught by Astro's natural 404).
- Caching: static assets, cached identically to HTML pages.

### Section 4 — Read-only MCP server

**Files:**
- `public/.well-known/mcp.json` (new static manifest)
- `src/pages/api/mcp.ts` (new API route — JSON-RPC handler implementing MCP streamable-HTTP transport)

**Tools exposed in v1 (read-only, lean core):**

| Tool | Backend | Cost per call |
|---|---|---|
| `list_projects(locale="en")` | `getCollection("projects")` | $0 |
| `list_research(locale="en")` | `getCollection("research")` | $0 |
| `search_content(query, locale="en", limit=5)` | Voyage embed + Supabase RPC `match_knowledge` | ~$0.0001 |
| `get_page(url)` | Fetches the corresponding `.md` | $0 |

**Tools deliberately out of scope for v1:** `list_teaching`, `list_publications`, `get_cv`. Since `get_page` ships in v1 and returns clean markdown from any URL (Section 3), structured tools for teaching/publications/CV are redundant — an agent that knows a URL (via `llms.txt` or `search_content`) can read it via `get_page` and extract structure from the markdown directly. Avoids bikeshedding JSON schemas for content that already has a stable markdown representation.

**Rate limiting — final:**

Only `search_content` costs money. Protect it with a **single boring layer**: a global daily budget in KV.

A single key (`mcp:budget:YYYY-MM-DD`) tracks total `search_content` calls today. Hard cap: 5,000/day (≈ $0.50/day worst case). The handler reads the counter on every call (1 KV read, free) and writes via a **stochastic counter pattern**: increment locally by 1, but write to KV with probability 1/N (N=10). Expected writes/day ≈ 500, well within the 1k/day free tier. If reading shows the counter past cap, return a JSON-RPC error (`-32004`, "rate limit exceeded") until midnight UTC.

**Workers Rate Limit binding rejected:** it lives under `unsafe.bindings` in `wrangler.toml`, which is explicitly beta and unstable. Depending on a beta configuration surface to protect against $0.50/day of exposure is a poor trade — if Cloudflare reshapes the namespace, CI breaks for no good reason. The stochastic budget alone is sufficient.

The other three tools (`list_projects`, `list_research`, `get_page`) cost $0 and are unrate-limited.

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
    { "name": "list_projects", "description": "List portfolio projects", "inputSchema": { "type": "object", "properties": { "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" } } } },
    { "name": "list_research", "description": "List research entries", "inputSchema": { "type": "object", "properties": { "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" } } } },
    { "name": "search_content", "description": "Vector search across all portfolio content", "inputSchema": { "type": "object", "required": ["query"], "properties": { "query": { "type": "string" }, "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" }, "limit": { "type": "integer", "default": 5, "maximum": 20 } } } },
    { "name": "get_page", "description": "Fetch a portfolio page as plain markdown", "inputSchema": { "type": "object", "required": ["url"], "properties": { "url": { "type": "string", "format": "uri" } } } }
  ]
}
```
Tool schemas in the manifest mirror the handler.

**Why not Cloudflare's `McpAgent` (Durable Objects):** McpAgent is the right choice for stateful sessions but adds a DO binding, billing surface, and infrastructure complexity. This server is stateless (every call independent), so a plain Astro API route handling JSON-RPC is sufficient and matches the rest of the site's architecture.

### Section 5 — Verification

**File:** `src/scripts/verify-agent-readiness.ts` (new)

Runs the same checks the scanner does, against a configurable origin (default: production):
- `GET /robots.txt` — asserts AI bot rules, sitemap directive, content signals
- `GET /llms.txt` — asserts present and well-formed (English root + pt + de variants)
- `GET /sitemap-index.xml` — asserts 200
- `HEAD /` — asserts `Link` and `X-Robots-Tag` headers
- `GET /projects/<slug>` with `Accept: text/markdown` — asserts **200 OK with `Content-Type: text/markdown`** (no redirect; verifies the middleware `rewrite()` path)
- `GET /projects/<slug>.md` — asserts 200 and `Content-Type: text/markdown`
- `GET /.well-known/mcp.json` — asserts 200 and parseable
- `POST /api/mcp` with a `tools/list` JSON-RPC body — asserts the expected tool names appear

Runs locally with `--origin http://localhost:4321` for dev verification.

## Estimated effort

| Workstream | Estimated effort |
|---|---|
| robots.txt + _headers | 30 min |
| `llms.txt` File Endpoints (root + locale) | 1-2 hr |
| `.md` File Endpoint + middleware rewrite + remark JSX-strip | 3-4 hr |
| MCP route + manifest + stochastic KV budget (4 tools) | 2-3 hr |
| Verification script + manual re-score | 1 hr |
| **Total** | **~8-11 hr** |

## Open questions resolved

1. ~~**Locale URL convention**~~ — resolved: Astro `getStaticPaths()` mirrors the live router automatically. The File Endpoint produces correct paths regardless of `prefixDefaultLocale`.
2. ~~**MDX → markdown stripping**~~ — resolved: AST-based via a remark transform removing `mdxJsxFlowElement` / `mdxJsxTextElement` nodes; structured-fields fallback for JSX-dominated pages.
3. ~~**Sitemap inclusion of `.md` URLs**~~ — resolved: NO. Sitemap is for search engines; `.md` variants are for agents. Keep them separate.
