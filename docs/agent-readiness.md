# Agent Readiness

How this site exposes its content to AI agents and crawlers, and the architectural decisions that got us there. Origin: the site scored 25% on [isitagentready.com](https://isitagentready.com/) at the start of this work; after the changes documented here, all listed capabilities pass.

## What ships

| Capability | URL / Mechanism |
|---|---|
| Crawler welcome | `public/robots.txt` (16 AI bot allow-lists + `Content-Signal: search=yes, ai-train=yes, ai-input=yes`) |
| Index discovery | `public/robots.txt` `Sitemap:` directive + `Link: rel="sitemap"` HTTP header |
| llms.txt index | `/llms.txt`, `/pt/llms.txt`, `/de/llms.txt` (auto-generated from Content Collections at build time) |
| `.md` companions | Every project / research / teaching / publication page also serves at `<url>.md` via `src/pages/[...path].md.ts` File Endpoint |
| Accept-header negotiation | Cloudflare Snippet rewrites `Accept: text/markdown` requests to the `.md` companion (or `/llms.txt` for the homepage) |
| API catalog | `/.well-known/api-catalog` (RFC 9727 linkset) + `Link: rel="api-catalog"` HTTP header |
| MCP server | `/.well-known/mcp.json` manifest + `/api/mcp` JSON-RPC endpoint (4 read-only tools, no LLM cost) |

## The hard parts

### Workers Static Assets has its own cache layer

The Astro Cloudflare adapter compiles content collection pages to static files in `dist/client/` and serves them via Workers Static Assets. That subsystem has its **own internal cache below the Zone CDN**. Cache Rules (which we configured at one point to bypass cache on `Accept: text/markdown`) operate on the Zone CDN cache, not the Static Assets cache. Result: we saw `CF-Cache-Status: HIT` regardless of the Cache Rule, even after Cloudflare Trace confirmed the rule matched and the Worker was invoked.

### Astro middleware doesn't run at request time for prerendered routes

From the [Astro docs](https://docs.astro.build/en/guides/middleware/#_top): "This rendering occurs **at build time for all prerendered pages**, but occurs when the route is requested for pages rendered on demand." Our content collection pages are prerendered, so middleware runs once during `npm run build` with no real `Accept` header — making request-time content negotiation via `src/middleware.ts` impossible without making every page dynamic (perf hit).

### Cloudflare's traffic pipeline runs Snippets *before* Workers

The Cloudflare zone request pipeline (visible in the dashboard's Traffic Sequence diagram) runs **Snippets at step 16, before Workers at step 18**. A Snippet can rewrite the URL before Workers Static Assets dispatches the request, sidestepping both the cache layer and the middleware-doesn't-run-on-prerendered-routes problem. This is the chosen architecture.

### Prerendered endpoint Content-Type is determined by file extension

Setting `Content-Type` in an Astro File Endpoint's `Response` only affects what is captured *during prerendering*. At runtime Workers Static Assets serves the static file with a MIME derived from the extension (`.txt` → `text/plain`, `.md` → `text/markdown`). To override, use the `public/_headers` file — same mechanism that overrides `Content-Type` for `/.well-known/api-catalog`.

## The Cloudflare Snippet

Zone-level snippet `markdown_accept_negotiation`, gated by the rule expression `any(http.request.headers["accept"][*] contains "text/markdown")`:

```js
export default {
  async fetch(request) {
    const accept = request.headers.get("Accept") || "";
    if (!accept.includes("text/markdown")) return fetch(request);

    const url = new URL(request.url);
    if (url.pathname.endsWith(".md")) return fetch(request);
    if (url.pathname.startsWith("/api/")) return fetch(request);
    if (url.pathname.startsWith("/.well-known/")) return fetch(request);

    // Homepage → locale llms.txt
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/llms.txt";
      return fetch(new Request(url, request));
    }
    const localeRoot = url.pathname.match(/^\/(pt|de)\/?$/u);
    if (localeRoot) {
      url.pathname = "/" + localeRoot[1] + "/llms.txt";
      return fetch(new Request(url, request));
    }

    // Skip static assets
    const last = url.pathname.split("/").pop() || "";
    if (last.includes(".")) return fetch(request);

    // Append .md companion suffix
    url.pathname = url.pathname.replace(/\/$/u, "") + ".md";
    return fetch(new Request(url, request));
  },
};
```

This snippet lives in Cloudflare's zone config, not in this repo. Edit via dashboard → daniellocatelli.com zone → Rules → Snippets, or via the Rulesets API at `/zones/{zone_id}/snippets/markdown_accept_negotiation`.

## What the `_headers` file does

```
/*
  Link: </sitemap-index.xml>; rel="sitemap", </.well-known/api-catalog>; rel="api-catalog"
  X-Robots-Tag: all

/.well-known/api-catalog
  Content-Type: application/linkset+json

/llms.txt
  Content-Type: text/markdown; charset=utf-8

/pt/llms.txt
  Content-Type: text/markdown; charset=utf-8

/de/llms.txt
  Content-Type: text/markdown; charset=utf-8
```

The `Link` header on `/*` advertises the sitemap and api-catalog to any agent inspecting response headers (RFC 8288 / RFC 9727). The `Content-Type` overrides on `*.txt` paths force the right MIME for content negotiation (since the snippet routes `Accept: text/markdown` requests on `/` to `/llms.txt`).

## Verifying

```sh
# llms.txt direct, returns text/markdown
curl -I https://daniellocatelli.com/llms.txt

# Homepage with Accept negotiation, returns text/markdown (snippet routes to llms.txt)
curl -H "Accept: text/markdown" -I https://daniellocatelli.com/

# Content collection page with Accept, returns text/markdown via .md companion
curl -H "Accept: text/markdown" -I "https://daniellocatelli.com/projects/circular-component-creator-by-buildsystems/"

# Direct .md companion (also fine)
curl -I https://daniellocatelli.com/projects/circular-component-creator-by-buildsystems.md

# api-catalog discovery
curl -I https://daniellocatelli.com/
# Look for: Link: ...; rel="api-catalog"

curl -I https://daniellocatelli.com/.well-known/api-catalog
# Look for: Content-Type: application/linkset+json

# MCP manifest
curl https://daniellocatelli.com/.well-known/mcp.json
```

## Known limitations

- The snippet's homepage-to-llms.txt routing replaces the homepage with the structured index. An agent asking for the "homepage as markdown" gets a directory listing, not a prose summary. If a curated `/index.md` would serve agents better, add a static file at `public/index.md` and route the homepage to that instead.
- The MCP server's `search_content` tool uses a per-day stochastic-write counter capped at 5000 (KV namespace `AI_HEALTH_KV`, key `mcp:budget:YYYY-MM-DD`, 36h TTL). Exceeded budget returns JSON-RPC error code `-32004`. Tune in `src/lib/mcp/budget.ts` if usage patterns change.
- Cloudflare Snippets are zone-level config not checked into this repo. If you migrate hosting, the snippet must be recreated. The canonical source is preserved in this document.

## Implementation references

- Design spec: `docs/superpowers/specs/2026-05-20-agent-readiness-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-20-agent-readiness.md`
- llms.txt generation: `src/pages/llms.txt.ts`, `src/pages/[locale]/llms.txt.ts`, `src/lib/llms-txt-format.ts`
- `.md` companion endpoint: `src/pages/[...path].md.ts`, `src/lib/mdx-to-plain-markdown.ts`
- Middleware (no-op at runtime for prerendered routes, kept for completeness): `src/middleware.ts`, `src/lib/resolve-markdown-target.ts`
- MCP: `src/pages/api/mcp.ts`, `src/lib/mcp/*`
- Tests: `tests/unit/llms-txt-format.test.ts`, `tests/unit/mdx-to-plain-markdown.test.ts`, `tests/unit/mcp-*.test.ts`, `tests/e2e/agent-readiness.spec.ts`
