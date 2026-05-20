# Agent Readiness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the daniellocatelli.com score on https://isitagentready.com from 25% to ≥60% by shipping: explicit AI bot rules in robots.txt + Content Signals, a `Link` header pointing at the sitemap, an auto-generated `llms.txt` per locale, markdown variants of every content page at `.md` URLs and via `Accept: text/markdown` negotiation, and a read-only MCP server with 4 tools.

**Architecture:** All artifacts live inside Astro's lifecycle — no prebuild scripts. Two static files (`public/robots.txt`, `public/_headers`), four Astro File Endpoints (`llms.txt.ts`, `[locale]/llms.txt.ts`, `[...path].md.ts`, `api/mcp.ts`), one middleware (`src/middleware.ts`), one static manifest (`public/.well-known/mcp.json`), and two small `src/lib/` modules (formatter + MDX→markdown transform + budget counter). The MCP `search_content` tool reuses the existing Supabase `vector-search` Edge Function (already used by `/api/ai`). Rate limiting for `search_content` is a single stochastic-write daily budget in KV (no per-IP tracking, no Workers Rate Limit binding).

**Tech Stack:** Astro 6.1.9, TypeScript, `astro:content` Content Collections, `@astrojs/cloudflare` adapter, Cloudflare Workers Static Assets, Cloudflare KV (existing `AI_HEALTH_KV` binding), Supabase (existing), `remark`/`mdast-util-to-markdown` (for JSX-stripping), Playwright (existing e2e), `node:test` (existing unit).

---

## File Structure

**New files:**
- `public/_headers` — Cloudflare Static Assets headers (`Link`, `X-Robots-Tag`)
- `public/.well-known/mcp.json` — static MCP server manifest
- `src/lib/llms-txt-format.ts` — pure formatter, turns content-collection entries into llmstxt.org-format text
- `src/lib/mdx-to-plain-markdown.ts` — remark transform stripping `mdxJsxFlowElement`/`mdxJsxTextElement` nodes, with structured-fields fallback when output is empty
- `src/lib/mcp/budget.ts` — stochastic KV daily budget counter
- `src/lib/mcp/tools.ts` — implementations of the four MCP tools
- `src/pages/llms.txt.ts` — File Endpoint emitting English llms.txt at root
- `src/pages/[locale]/llms.txt.ts` — File Endpoint emitting `pt/llms.txt` and `de/llms.txt`
- `src/pages/[...path].md.ts` — File Endpoint emitting `.md` for every content-collection page
- `src/pages/api/mcp.ts` — JSON-RPC dispatcher for the four MCP tools
- `src/middleware.ts` — Astro middleware, rewrites `Accept: text/markdown` to `.md` companion
- `tests/unit/llms-txt-format.test.ts`
- `tests/unit/mdx-to-plain-markdown.test.ts`
- `tests/unit/mcp-budget.test.ts`
- `tests/unit/mcp-tools.test.ts`
- `tests/e2e/agent-readiness.spec.ts` — Playwright suite exercising all live endpoints

**Modified files:**
- `public/robots.txt` — full rewrite

**Untouched (intentionally):**
- `src/scripts/generate-knowledge.ts` — separate Supabase upload pipeline, outside the build artifact set; no refactor
- `src/pages/api/ai.ts` — paid chat endpoint, NOT exposed via MCP
- `wrangler.toml` — `AI_HEALTH_KV` binding already exists and is reused

---

## Conventions used in this plan

- All file paths are repo-relative from `C:\repos\daniellocatelli`.
- Unit tests use `node:test` + `node:assert/strict` (matches existing `tests/unit/`).
- E2E tests use Playwright (matches existing `tests/e2e/`). All e2e tests assume `npm run dev` is running on `http://localhost:4321`; the Playwright config already handles webServer startup.
- After each task, commit with a Conventional Commits message including the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.
- The branch `feat/agent-readiness` is already created and contains the spec commits.

---

## Task 1: robots.txt rewrite + _headers

**Files:**
- Modify: `public/robots.txt`
- Create: `public/_headers`
- Create: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing e2e tests**

Create `tests/e2e/agent-readiness.spec.ts` with this exact content:

```ts
import { test, expect } from "@playwright/test";

test.describe("Agent readiness — discoverability", () => {
  test("robots.txt advertises sitemap and welcomes AI crawlers", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sitemap: https://daniellocatelli.com/sitemap-index.xml");
    expect(body).toContain("Content-Signal:");
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"]) {
      expect(body, `expected User-agent: ${bot}`).toContain(`User-agent: ${bot}`);
    }
  });

  test("root response includes Link header pointing at sitemap", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const link = res.headers()["link"];
    expect(link, "Link header present").toBeDefined();
    expect(link).toContain("</sitemap-index.xml>");
    expect(link).toContain(`rel="sitemap"`);
  });

  test("root response includes X-Robots-Tag", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-robots-tag"]).toBe("all");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test agent-readiness --reporter=list`
Expected: 3 failures — robots.txt missing the new content, no `Link` header, no `X-Robots-Tag`.

- [ ] **Step 3: Rewrite `public/robots.txt`**

Replace the entire file with:

```
# Default: everyone is welcome
User-agent: *
Allow: /

# Explicit allow for known AI crawlers
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Cohere-ai
Allow: /
User-agent: Diffbot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: FacebookBot
Allow: /

# Content Signals (Cloudflare 2024 proposal)
Content-Signal: search=yes, ai-train=yes, ai-input=yes

Sitemap: https://daniellocatelli.com/sitemap-index.xml
```

- [ ] **Step 4: Create `public/_headers`**

Create the file with this exact content:

```
/*
  Link: </sitemap-index.xml>; rel="sitemap"
  X-Robots-Tag: all
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx playwright test agent-readiness --reporter=list`
Expected: 3 passes.

- [ ] **Step 6: Commit**

```bash
git add public/robots.txt public/_headers tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(seo): welcome AI crawlers + advertise sitemap via Link header

robots.txt now lists explicit Allow rules for major AI bots (GPTBot,
ClaudeBot, PerplexityBot, Google-Extended, CCBot, etc.), advertises
Content Signals, and points at the sitemap. _headers adds Link and
X-Robots-Tag on every response via Cloudflare Static Assets.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: llms.txt formatter (pure logic)

**Files:**
- Create: `src/lib/llms-txt-format.ts`
- Create: `tests/unit/llms-txt-format.test.ts`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/llms-txt-format.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatLlmsTxt, type LlmsTxtEntry } from "../../src/lib/llms-txt-format";

const sample: { sections: { title: string; entries: LlmsTxtEntry[] }[] } = {
  sections: [
    {
      title: "Projects",
      entries: [
        { title: "BuildSystems Website", url: "https://daniellocatelli.com/projects/buildsystems-website", summary: "Astro + Notion CMS portfolio site." },
        { title: "Air Guitar", url: "https://daniellocatelli.com/projects/air-guitar-by-atelier-marko-brajovic-for-nike", summary: "" },
      ],
    },
  ],
};

test("formatLlmsTxt: title + tagline + section headers", () => {
  const out = formatLlmsTxt({
    title: "Daniel Locatelli",
    tagline: "AEC software engineer based in Berlin.",
    sections: sample.sections,
  });
  assert.ok(out.startsWith("# Daniel Locatelli\n"));
  assert.ok(out.includes("> AEC software engineer based in Berlin.\n"));
  assert.ok(out.includes("\n## Projects\n"));
});

test("formatLlmsTxt: each entry is a markdown link, summary appended after colon", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: sample.sections,
  });
  assert.ok(
    out.includes(
      "- [BuildSystems Website](https://daniellocatelli.com/projects/buildsystems-website): Astro + Notion CMS portfolio site.",
    ),
  );
});

test("formatLlmsTxt: omits colon when summary is empty", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: sample.sections,
  });
  assert.ok(
    out.includes(
      "- [Air Guitar](https://daniellocatelli.com/projects/air-guitar-by-atelier-marko-brajovic-for-nike)\n",
    ),
  );
  assert.ok(!out.includes("Air Guitar](...): "));
});

test("formatLlmsTxt: trims trailing whitespace per line and ends with single newline", () => {
  const out = formatLlmsTxt({
    title: "x",
    tagline: "y",
    sections: [],
  });
  assert.equal(out.endsWith("\n"), true);
  assert.equal(out.endsWith("\n\n"), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -- --test-name-pattern=formatLlmsTxt`
Expected: FAIL — `Cannot find module ../../src/lib/llms-txt-format`.

- [ ] **Step 3: Implement the formatter**

Create `src/lib/llms-txt-format.ts`:

```ts
export interface LlmsTxtEntry {
  title: string;
  url: string;
  summary?: string;
}

export interface LlmsTxtSection {
  title: string;
  entries: LlmsTxtEntry[];
}

export interface LlmsTxtInput {
  title: string;
  tagline: string;
  sections: LlmsTxtSection[];
}

export function formatLlmsTxt(input: LlmsTxtInput): string {
  const lines: string[] = [];
  lines.push(`# ${input.title}`);
  lines.push(`> ${input.tagline}`);
  for (const section of input.sections) {
    lines.push("");
    lines.push(`## ${section.title}`);
    for (const entry of section.entries) {
      const summary = entry.summary?.trim();
      const link = `- [${entry.title}](${entry.url})`;
      lines.push(summary ? `${link}: ${summary}` : link);
    }
  }
  return lines.map((l) => l.replace(/\s+$/u, "")).join("\n") + "\n";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -- --test-name-pattern=formatLlmsTxt`
Expected: 4 passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/llms-txt-format.ts tests/unit/llms-txt-format.test.ts
git commit -m "$(cat <<'EOF'
feat(llms-txt): add pure formatter for llmstxt.org output

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: llms.txt File Endpoint (English root)

**Files:**
- Create: `src/pages/llms.txt.ts`
- Modify: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

Append to `tests/e2e/agent-readiness.spec.ts`:

```ts
test.describe("Agent readiness — llms.txt (English)", () => {
  test("/llms.txt returns text/plain with portfolio sections", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
    const body = await res.text();
    expect(body).toMatch(/^# Daniel Locatelli\n/);
    expect(body).toContain("\n## Projects\n");
    expect(body).toContain("\n## Research\n");
    expect(body).toContain("\n## Teaching\n");
    expect(body).toContain("\n## Publications\n");
    expect(body).toContain("https://daniellocatelli.com/projects/");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test agent-readiness -g "llms.txt (English)" --reporter=list`
Expected: FAIL — 404 on /llms.txt.

- [ ] **Step 3: Implement the endpoint**

Create `src/pages/llms.txt.ts`:

```ts
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { formatLlmsTxt, type LlmsTxtSection } from "@/lib/llms-txt-format";

export const prerender = true;

const SITE = "https://daniellocatelli.com";
const LOCALE = "en";

function urlFor(collection: string, slug: string): string {
  return `${SITE}/${collection}/${slug}`;
}

function entryToLink<T extends "projects" | "research" | "teaching" | "publications">(
  collection: T,
  e: CollectionEntry<T>,
) {
  const slug = e.id.replace(new RegExp(`^${LOCALE}/`), "");
  const data: any = e.data;
  const title = data.Name ?? data.title ?? slug;
  const summary = data.ShortDescription ?? data.Description ?? "";
  return { title, url: urlFor(collection, slug), summary };
}

async function sectionFor<T extends "projects" | "research" | "teaching" | "publications">(
  collection: T,
  title: string,
): Promise<LlmsTxtSection> {
  const entries = await getCollection(collection, (e) => e.id.startsWith(`${LOCALE}/`));
  return {
    title,
    entries: entries.map((e) => entryToLink(collection, e)),
  };
}

export const GET: APIRoute = async () => {
  const sections: LlmsTxtSection[] = [
    {
      title: "About",
      entries: [
        { title: "Homepage", url: `${SITE}/`, summary: "Bio, current role, contact." },
        { title: "CV", url: `${SITE}/cv`, summary: "Experience, education, skills." },
      ],
    },
    await sectionFor("projects", "Projects"),
    await sectionFor("research", "Research"),
    await sectionFor("teaching", "Teaching"),
    await sectionFor("publications", "Publications"),
    {
      title: "Optional",
      entries: [
        { title: "Portuguese index", url: `${SITE}/pt/llms.txt`, summary: "" },
        { title: "German index", url: `${SITE}/de/llms.txt`, summary: "" },
      ],
    },
  ];

  const body = formatLlmsTxt({
    title: "Daniel Locatelli",
    tagline: "AEC software engineer based in Berlin. Architecture × Computation × AI.",
    sections,
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test agent-readiness -g "llms.txt (English)" --reporter=list`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/llms.txt.ts tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(llms-txt): add /llms.txt endpoint generated from content collections

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: llms.txt locale variants (pt, de)

**Files:**
- Create: `src/pages/[locale]/llms.txt.ts`
- Modify: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing e2e tests**

Append to `tests/e2e/agent-readiness.spec.ts`:

```ts
test.describe("Agent readiness — llms.txt (locales)", () => {
  for (const locale of ["pt", "de"]) {
    test(`/${locale}/llms.txt returns localized content`, async ({ request }) => {
      const res = await request.get(`/${locale}/llms.txt`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
      const body = await res.text();
      expect(body).toMatch(/^# Daniel Locatelli\n/);
      expect(body).toContain(`https://daniellocatelli.com/${locale}/projects/`);
    });
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test agent-readiness -g "llms.txt \(locales\)" --reporter=list`
Expected: 2 failures (404 on both).

- [ ] **Step 3: Implement the endpoint**

Create `src/pages/[locale]/llms.txt.ts`:

```ts
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { formatLlmsTxt, type LlmsTxtSection } from "@/lib/llms-txt-format";

export const prerender = true;

const SITE = "https://daniellocatelli.com";
const LOCALES = ["pt", "de"] as const;
type Locale = (typeof LOCALES)[number];

const TAGLINES: Record<Locale, string> = {
  pt: "Engenheiro de software em AEC, baseado em Berlim. Arquitetura × Computação × IA.",
  de: "AEC-Softwareingenieur in Berlin. Architektur × Computation × KI.",
};

const ABOUT_LABELS: Record<Locale, { home: string; cv: string }> = {
  pt: { home: "Página inicial", cv: "Currículo" },
  de: { home: "Startseite", cv: "Lebenslauf" },
};

export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((locale) => ({ params: { locale } }));

function urlFor(locale: Locale, collection: string, slug: string): string {
  return `${SITE}/${locale}/${collection}/${slug}`;
}

function entryToLink<T extends "projects" | "research" | "teaching" | "publications">(
  locale: Locale,
  collection: T,
  e: CollectionEntry<T>,
) {
  const slug = e.id.replace(new RegExp(`^${locale}/`), "");
  const data: any = e.data;
  const title =
    data[`Name_${locale}`] ?? data.Name ?? data.title ?? slug;
  const summary =
    data[`ShortDescription_${locale}`] ??
    data.ShortDescription ??
    data[`Description_${locale}`] ??
    data.Description ??
    "";
  return { title, url: urlFor(locale, collection, slug), summary };
}

async function sectionFor<T extends "projects" | "research" | "teaching" | "publications">(
  locale: Locale,
  collection: T,
  title: string,
): Promise<LlmsTxtSection> {
  const entries = await getCollection(collection, (e) =>
    e.id.startsWith(`${locale}/`),
  );
  return {
    title,
    entries: entries.map((e) => entryToLink(locale, collection, e)),
  };
}

export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale as Locale;
  if (!LOCALES.includes(locale)) {
    return new Response("Not found", { status: 404 });
  }
  const labels = ABOUT_LABELS[locale];
  const sections: LlmsTxtSection[] = [
    {
      title: "About",
      entries: [
        { title: labels.home, url: `${SITE}/${locale}/`, summary: "" },
        { title: labels.cv, url: `${SITE}/${locale}/cv`, summary: "" },
      ],
    },
    await sectionFor(locale, "projects", "Projects"),
    await sectionFor(locale, "research", "Research"),
    await sectionFor(locale, "teaching", "Teaching"),
    await sectionFor(locale, "publications", "Publications"),
    {
      title: "Optional",
      entries: [
        { title: "English index", url: `${SITE}/llms.txt`, summary: "" },
        ...LOCALES.filter((l) => l !== locale).map((l) => ({
          title: l === "pt" ? "Portuguese index" : "German index",
          url: `${SITE}/${l}/llms.txt`,
          summary: "",
        })),
      ],
    },
  ];

  const body = formatLlmsTxt({
    title: "Daniel Locatelli",
    tagline: TAGLINES[locale],
    sections,
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx playwright test agent-readiness -g "llms.txt \(locales\)" --reporter=list`
Expected: 2 passes.

- [ ] **Step 5: Commit**

```bash
git add "src/pages/[locale]/llms.txt.ts" tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(llms-txt): add localized /pt/llms.txt and /de/llms.txt endpoints

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: MDX → plain markdown utility

**Files:**
- Create: `src/lib/mdx-to-plain-markdown.ts`
- Create: `tests/unit/mdx-to-plain-markdown.test.ts`

- [ ] **Step 1: Install dependencies**

Run: `npm install --save-dev remark-parse remark-stringify remark-mdx unified unist-util-visit`

(These are dev deps because they only run at build time inside the `.md` File Endpoint, never in the deployed Worker.)

- [ ] **Step 2: Write the failing unit tests**

Create `tests/unit/mdx-to-plain-markdown.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mdxToPlainMarkdown } from "../../src/lib/mdx-to-plain-markdown";

test("strips inline JSX components but keeps surrounding markdown", async () => {
  const input = `# Title

Some paragraph.

<Slide image="foo.jpg" />

Another paragraph with <Tooltip text="hi">inline</Tooltip> text.
`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Title"));
  assert.ok(out.includes("Some paragraph."));
  assert.ok(out.includes("Another paragraph"));
  assert.ok(!out.includes("<Slide"));
  assert.ok(!out.includes("<Tooltip"));
  assert.ok(out.includes("inline"));
});

test("strips nested multi-line JSX blocks", async () => {
  const input = `# Deck

<Slide title="One">
  <SlideMarkdown text="hello" />
</Slide>

Paragraph after.
`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Deck"));
  assert.ok(out.includes("Paragraph after."));
  assert.ok(!out.includes("<Slide"));
  assert.ok(!out.includes("<SlideMarkdown"));
});

test("returns empty string for body that is only JSX", async () => {
  const input = `<Slide image="foo.jpg" />\n<Slide image="bar.jpg" />\n`;
  const out = await mdxToPlainMarkdown(input);
  assert.equal(out.trim(), "");
});

test("preserves import statements as stripped (no leak)", async () => {
  const input = `import Foo from "@/components/Foo";\n\n# Title\n\nText.`;
  const out = await mdxToPlainMarkdown(input);
  assert.ok(out.includes("# Title"));
  assert.ok(out.includes("Text."));
  assert.ok(!out.includes("import Foo"));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test:unit -- --test-name-pattern="JSX|markdown|JSX-only"`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the transform**

Create `src/lib/mdx-to-plain-markdown.ts`:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkMdx from "remark-mdx";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

function stripMdxNodes() {
  return (tree: Root) => {
    // Replace JSX flow/text elements and ESM imports/exports with empty paragraphs;
    // a later pass removes the empty nodes so the markdown stays clean.
    const removeTypes = new Set([
      "mdxJsxFlowElement",
      "mdxJsxTextElement",
      "mdxFlowExpression",
      "mdxTextExpression",
      "mdxjsEsm",
    ]);
    visit(tree, (node, index, parent) => {
      if (parent && typeof index === "number" && removeTypes.has(node.type)) {
        (parent.children as any[]).splice(index, 1);
        return [visit.SKIP, index] as any;
      }
    });
  };
}

export async function mdxToPlainMarkdown(input: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(stripMdxNodes)
    .use(remarkStringify, { bullet: "-", fences: true })
    .process(input);
  return String(file).replace(/\n{3,}/g, "\n\n");
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit -- --test-name-pattern="JSX|markdown|JSX-only"`
Expected: 4 passes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/mdx-to-plain-markdown.ts tests/unit/mdx-to-plain-markdown.test.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat(md): add AST-based MDX-to-plain-markdown transform

Uses remark-mdx to parse MDX, strips mdxJsxFlowElement, mdxJsxTextElement,
mdxFlowExpression, mdxTextExpression, and ESM nodes, then stringifies back
to portable markdown. Used by the .md File Endpoint to serve content-
collection pages as plain markdown for AI agents.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `.md` File Endpoint for content-collection pages

**Files:**
- Create: `src/pages/[...path].md.ts`
- Modify: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing e2e tests**

Append to `tests/e2e/agent-readiness.spec.ts`:

```ts
test.describe("Agent readiness — markdown variants", () => {
  test("project page is reachable at .md and returns text/markdown", async ({ request }) => {
    const res = await request.get("/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toContain("# ");
    expect(body).toContain("BuildSystems");
  });

  test("portuguese project .md is reachable", async ({ request }) => {
    const res = await request.get("/pt/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test agent-readiness -g "markdown variants" --reporter=list`
Expected: 2 failures (404).

- [ ] **Step 3: Implement the endpoint**

Create `src/pages/[...path].md.ts`:

```ts
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { mdxToPlainMarkdown } from "@/lib/mdx-to-plain-markdown";

export const prerender = true;

type Coll = "projects" | "research" | "teaching" | "publications";
const COLLECTIONS: Coll[] = ["projects", "research", "teaching", "publications"];
const LOCALES = ["en", "pt", "de"] as const;
type Locale = (typeof LOCALES)[number];

const SITE = "https://daniellocatelli.com";

interface PathProps {
  entry: CollectionEntry<Coll>;
  collection: Coll;
  locale: Locale;
  slug: string;
}

function pathFor(locale: Locale, collection: Coll, slug: string): string {
  // English (default) routes have no locale prefix; pt/de do.
  return locale === "en" ? `${collection}/${slug}` : `${locale}/${collection}/${slug}`;
}

function canonicalUrl(locale: Locale, collection: Coll, slug: string): string {
  return `${SITE}/${pathFor(locale, collection, slug)}`;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { path: string }; props: PathProps }[] = [];
  for (const collection of COLLECTIONS) {
    const entries = await getCollection(collection);
    for (const entry of entries) {
      // entry.id is e.g. "en/buildsystems-website" or "pt/some-slug"
      const [locale, ...slugParts] = entry.id.split("/");
      if (!LOCALES.includes(locale as Locale) || slugParts.length === 0) continue;
      const slug = slugParts.join("/");
      paths.push({
        params: { path: pathFor(locale as Locale, collection, slug) },
        props: { entry, collection, locale: locale as Locale, slug },
      });
    }
  }
  return paths;
};

function renderStructuredFallback(entry: CollectionEntry<Coll>, props: PathProps): string {
  const data: any = entry.data;
  const lines: string[] = [];
  lines.push(`# ${data.Name ?? props.slug}`);
  if (data.ShortDescription || data.Description) {
    lines.push("");
    lines.push(data.ShortDescription ?? data.Description);
  }
  if (data.DateStart || data.DateEnd) {
    lines.push("");
    lines.push(`**Date:** ${data.DateStart ?? ""}${data.DateEnd ? ` – ${data.DateEnd}` : ""}`);
  }
  if (data.Link) {
    lines.push("");
    lines.push(`**Link:** ${data.Link}`);
  }
  return lines.join("\n") + "\n";
}

export const GET: APIRoute = async ({ props }) => {
  const { entry, collection, locale, slug } = props as PathProps;
  const data: any = entry.data;
  const url = canonicalUrl(locale, collection, slug);

  // Astro 5+ glob loader stores raw body on entry.body (markdown/mdx source).
  // For pages that are mostly JSX (decks), the stripped output may be empty;
  // fall back to structured fields in that case.
  const rawBody = (entry as any).body ?? "";
  let plain = "";
  try {
    plain = (await mdxToPlainMarkdown(rawBody)).trim();
  } catch {
    plain = "";
  }
  if (!plain) {
    plain = renderStructuredFallback(entry, props as PathProps).trim();
  }

  const title = data.Name ?? slug;
  const frontmatter = [
    "---",
    `canonical: ${url}`,
    `locale: ${locale}`,
    `title: ${JSON.stringify(title)}`,
    "---",
    "",
  ].join("\n");

  return new Response(frontmatter + plain + "\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx playwright test agent-readiness -g "markdown variants" --reporter=list`
Expected: 2 passes.

- [ ] **Step 5: Commit**

```bash
git add "src/pages/[...path].md.ts" tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(md): serve .md variants of every content-collection page

Adds src/pages/[...path].md.ts as a File Endpoint that emits a markdown
companion for every projects/research/teaching/publications entry across
all three locales, with front-matter and a structured-fields fallback
when MDX-to-plain-markdown stripping yields empty output.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Middleware for `Accept: text/markdown` negotiation

**Files:**
- Create: `src/middleware.ts`
- Create: `tests/unit/middleware.test.ts`
- Modify: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/middleware.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMarkdownTarget } from "../../src/middleware";

test("resolveMarkdownTarget: returns null when Accept lacks text/markdown", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo", accept: "text/html" }),
    null,
  );
});

test("resolveMarkdownTarget: returns null when path already ends in .md", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo.md", accept: "text/markdown" }),
    null,
  );
});

test("resolveMarkdownTarget: returns .md path when Accept includes text/markdown", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo", accept: "text/markdown" }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: drops trailing slash", () => {
  assert.equal(
    resolveMarkdownTarget({ pathname: "/projects/foo/", accept: "text/markdown" }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: handles complex Accept with q-values", () => {
  assert.equal(
    resolveMarkdownTarget({
      pathname: "/projects/foo",
      accept: "text/html;q=0.8,text/markdown;q=1.0,*/*;q=0.5",
    }),
    "/projects/foo.md",
  );
});

test("resolveMarkdownTarget: skips known non-content paths", () => {
  for (const p of [
    "/api/foo",
    "/_image",
    "/sitemap-index.xml",
    "/robots.txt",
    "/.well-known/mcp.json",
    "/llms.txt",
    "/pt/llms.txt",
    "/de/llms.txt",
    "/manifest.webmanifest",
    "/favicon.ico",
  ]) {
    assert.equal(
      resolveMarkdownTarget({ pathname: p, accept: "text/markdown" }),
      null,
      `expected null for ${p}`,
    );
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -- --test-name-pattern="resolveMarkdownTarget"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the middleware**

Create `src/middleware.ts`:

```ts
import { defineMiddleware } from "astro:middleware";

const SKIP_PREFIXES = ["/api/", "/_", "/.well-known/"];

export function resolveMarkdownTarget(input: {
  pathname: string;
  accept: string | null | undefined;
}): string | null {
  const { pathname, accept } = input;
  if (!accept || !/text\/markdown/i.test(accept)) return null;
  if (pathname.endsWith(".md")) return null;
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  // Skip anything that already has a file extension (e.g., .txt, .xml, .ico,
  // .webmanifest) — Astro routes for content pages have no extension.
  const lastSegment = pathname.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return null;
  const trimmed = pathname.replace(/\/$/u, "");
  return `${trimmed}.md`;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const target = resolveMarkdownTarget({
    pathname: ctx.url.pathname,
    accept: ctx.request.headers.get("accept"),
  });
  if (target) {
    return ctx.rewrite(target);
  }
  return next();
});
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `npm run test:unit -- --test-name-pattern="resolveMarkdownTarget"`
Expected: 6 passes.

- [ ] **Step 5: Write the failing e2e test**

Append to `tests/e2e/agent-readiness.spec.ts`:

```ts
test.describe("Agent readiness — Accept: text/markdown negotiation", () => {
  test("project page with Accept: text/markdown returns markdown at canonical URL", async ({ request }) => {
    const res = await request.get("/projects/buildsystems-website", {
      headers: { Accept: "text/markdown" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toContain("BuildSystems");
  });

  test("project page with Accept: text/html stays HTML", async ({ request }) => {
    const res = await request.get("/projects/buildsystems-website", {
      headers: { Accept: "text/html" },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/html/);
  });
});
```

- [ ] **Step 6: Run e2e tests to verify they pass**

Run: `npx playwright test agent-readiness -g "Accept: text/markdown" --reporter=list`
Expected: 2 passes.

- [ ] **Step 7: Commit**

```bash
git add src/middleware.ts tests/unit/middleware.test.ts tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(md): Accept: text/markdown negotiation via middleware rewrite

Adds src/middleware.ts so a request to /projects/foo with
Accept: text/markdown receives a 200 OK with text/markdown body at
the canonical URL, by internally rewriting to /projects/foo.md.
Uses ctx.rewrite() (Astro 4.13+), not 302 redirect, so strict
clients work and there is no redirect chain.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: MCP stochastic budget counter (pure logic)

**Files:**
- Create: `src/lib/mcp/budget.ts`
- Create: `tests/unit/mcp-budget.test.ts`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/mcp-budget.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAndIncrementBudget, todayKey, type KVNamespaceLike } from "../../src/lib/mcp/budget";

class FakeKV implements KVNamespaceLike {
  store = new Map<string, string>();
  reads = 0;
  writes = 0;
  async get(k: string) {
    this.reads++;
    return this.store.get(k) ?? null;
  }
  async put(k: string, v: string) {
    this.writes++;
    this.store.set(k, v);
  }
}

test("todayKey: yields mcp:budget:YYYY-MM-DD", () => {
  const key = todayKey(new Date("2026-05-20T12:34:56Z"));
  assert.equal(key, "mcp:budget:2026-05-20");
});

test("budget allows when counter is zero", async () => {
  const kv = new FakeKV();
  const r = await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.5 });
  assert.equal(r.allowed, true);
  assert.equal(r.remaining, 4999);
});

test("budget denies when counter reaches cap", async () => {
  const kv = new FakeKV();
  await kv.put(todayKey(new Date("2026-05-20T00:00:00Z")), "5000");
  const r = await checkAndIncrementBudget({
    kv,
    cap: 5000,
    now: new Date("2026-05-20T12:00:00Z"),
    random: () => 0.5,
  });
  assert.equal(r.allowed, false);
});

test("budget writes to KV with stochastic probability 1/N (writes when random < 1/N)", async () => {
  const kv = new FakeKV();
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.05, writeProbability: 0.1 });
  assert.equal(kv.writes, 1, "writes when random < probability");
});

test("budget skips writing when random >= probability", async () => {
  const kv = new FakeKV();
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.5, writeProbability: 0.1 });
  assert.equal(kv.writes, 0, "no write when random >= probability");
});

test("budget always writes the first hit of the day to seed the key", async () => {
  const kv = new FakeKV();
  await checkAndIncrementBudget({ kv, cap: 5000, now: new Date(), random: () => 0.99, writeProbability: 0.1 });
  assert.equal(kv.writes, 1, "first hit always seeds");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -- --test-name-pattern="budget|todayKey"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the counter**

Create `src/lib/mcp/budget.ts`:

```ts
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export function todayKey(now: Date = new Date()): string {
  const iso = now.toISOString();
  return `mcp:budget:${iso.slice(0, 10)}`;
}

export interface BudgetInput {
  kv: KVNamespaceLike;
  cap: number;
  now?: Date;
  random?: () => number;
  /** Probability of writing the increment back to KV. Default 0.1 (≈ 1 write per 10 calls). */
  writeProbability?: number;
}

export interface BudgetResult {
  allowed: boolean;
  remaining: number;
}

export async function checkAndIncrementBudget(input: BudgetInput): Promise<BudgetResult> {
  const now = input.now ?? new Date();
  const random = input.random ?? Math.random;
  const writeProbability = input.writeProbability ?? 0.1;
  const key = todayKey(now);

  const raw = await input.kv.get(key);
  const current = raw == null ? null : Number(raw);
  const counter = Number.isFinite(current as number) ? (current as number) : 0;

  if (counter >= input.cap) {
    return { allowed: false, remaining: 0 };
  }

  const next = counter + 1;
  // Always seed the first hit; afterwards write only stochastically.
  const shouldWrite = raw == null || random() < writeProbability;
  if (shouldWrite) {
    // 36 h TTL ensures the key expires safely after the next UTC day rollover.
    await input.kv.put(key, String(next), { expirationTtl: 60 * 60 * 36 });
  }
  return { allowed: true, remaining: Math.max(0, input.cap - next) };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -- --test-name-pattern="budget|todayKey"`
Expected: 6 passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mcp/budget.ts tests/unit/mcp-budget.test.ts
git commit -m "$(cat <<'EOF'
feat(mcp): add stochastic-write daily budget counter

A single KV key per day; reads on every call (free); writes only with
probability 1/N (default 1/10). First hit of the day always seeds.
Caps the worst-case daily spend on search_content embeds at ~$0.50.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: MCP tool implementations (list_projects, list_research, get_page, search_content)

**Files:**
- Create: `src/lib/mcp/tools.ts`
- Create: `tests/unit/mcp-tools.test.ts`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/unit/mcp-tools.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { searchContent, getPage } from "../../src/lib/mcp/tools";

test("searchContent: returns matches from vector-search endpoint", async () => {
  const fakeFetch: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    assert.match(url, /functions\/v1\/vector-search$/);
    const body = JSON.parse(String((init as RequestInit).body));
    assert.equal(body.query, "domes");
    assert.equal(body.match_count, 3);
    return new Response(
      JSON.stringify({
        documents: [
          { id: 1, title: "Geodesic Domes", url: "https://daniellocatelli.com/projects/geodesic", content: "snippet", similarity: 0.91 },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const out = await searchContent(
    { query: "domes", limit: 3, locale: "en" },
    {
      env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "anon" } as any,
      fetch: fakeFetch,
    },
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].title, "Geodesic Domes");
  assert.equal(out[0].url, "https://daniellocatelli.com/projects/geodesic");
});

test("searchContent: throws on non-200 response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response("nope", { status: 500 });
  await assert.rejects(
    searchContent(
      { query: "x", limit: 5, locale: "en" },
      { env: { SUPABASE_URL: "u", SUPABASE_ANON_KEY: "k" } as any, fetch: fakeFetch },
    ),
    /vector-search failed/,
  );
});

test("getPage: fetches the .md companion and returns its body", async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    assert.equal(url, "https://daniellocatelli.com/projects/foo.md");
    return new Response("# Foo\n\nBody.", {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  };
  const out = await getPage(
    { url: "https://daniellocatelli.com/projects/foo" },
    { fetch: fakeFetch },
  );
  assert.equal(out.url, "https://daniellocatelli.com/projects/foo.md");
  assert.ok(out.markdown.startsWith("# Foo"));
});

test("getPage: rejects URLs not on daniellocatelli.com", async () => {
  await assert.rejects(
    getPage({ url: "https://evil.example.com/foo" }, { fetch }),
    /not on this site/i,
  );
});

test("getPage: appends .md when URL does not already end in .md", async () => {
  let calledUrl = "";
  const fakeFetch: typeof fetch = async (input) => {
    calledUrl = typeof input === "string" ? input : (input as URL).toString();
    return new Response("ok", { status: 200, headers: { "Content-Type": "text/markdown" } });
  };
  await getPage(
    { url: "https://daniellocatelli.com/projects/foo/" },
    { fetch: fakeFetch },
  );
  assert.equal(calledUrl, "https://daniellocatelli.com/projects/foo.md");
});
```

(Note: `listProjects` and `listResearch` call `getCollection()` which needs the Astro runtime. They are exercised by e2e tests in Task 10, not unit tests here.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -- --test-name-pattern="searchContent|getPage"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the tools**

Create `src/lib/mcp/tools.ts`:

```ts
import { getCollection, type CollectionEntry } from "astro:content";

type Coll = "projects" | "research";

const SITE = "https://daniellocatelli.com";
const LOCALES = ["en", "pt", "de"] as const;
type Locale = (typeof LOCALES)[number];

export interface ListItem {
  slug: string;
  title: string;
  summary: string;
  url: string;
  date?: string;
}

export interface ListInput {
  locale?: Locale;
}

function pathFor(locale: Locale, collection: Coll, slug: string): string {
  return locale === "en" ? `${collection}/${slug}` : `${locale}/${collection}/${slug}`;
}

function entryToItem<T extends Coll>(
  e: CollectionEntry<T>,
  locale: Locale,
  collection: Coll,
): ListItem {
  const slug = e.id.replace(new RegExp(`^${locale}/`), "");
  const data: any = e.data;
  return {
    slug,
    title: data[`Name_${locale}`] ?? data.Name ?? slug,
    summary:
      data[`ShortDescription_${locale}`] ??
      data.ShortDescription ??
      data.Description ??
      "",
    url: `${SITE}/${pathFor(locale, collection, slug)}`,
    date: data.DateStart ?? undefined,
  };
}

export async function listCollection(
  collection: Coll,
  input: ListInput,
): Promise<ListItem[]> {
  const locale = (input.locale ?? "en") as Locale;
  const entries = await getCollection(collection, (e: any) =>
    e.id.startsWith(`${locale}/`),
  );
  return entries.map((e) => entryToItem(e, locale, collection));
}

export const listProjects = (input: ListInput) => listCollection("projects", input);
export const listResearch = (input: ListInput) => listCollection("research", input);

// ── search_content ────────────────────────────────────────────────────

export interface SearchInput {
  query: string;
  limit?: number;
  locale?: Locale;
}

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface SearchEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export async function searchContent(
  input: SearchInput,
  ctx: { env: SearchEnv; fetch: typeof fetch },
): Promise<SearchHit[]> {
  const limit = Math.min(Math.max(input.limit ?? 5, 1), 20);
  const url = `${ctx.env.SUPABASE_URL}/functions/v1/vector-search`;
  const res = await ctx.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ctx.env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      query: input.query,
      match_threshold: 0.4,
      match_count: limit,
    }),
  });
  if (!res.ok) {
    throw new Error(`vector-search failed: ${res.status}`);
  }
  const { documents } = (await res.json()) as { documents: any[] };
  return documents.map((d) => ({
    title: d.title ?? "",
    url: d.url ?? "",
    snippet: typeof d.content === "string" ? d.content.slice(0, 500) : "",
    score: typeof d.similarity === "number" ? d.similarity : 0,
  }));
}

// ── get_page ──────────────────────────────────────────────────────────

export interface GetPageInput {
  url: string;
}

export interface GetPageOutput {
  url: string;
  markdown: string;
}

export async function getPage(
  input: GetPageInput,
  ctx: { fetch: typeof fetch },
): Promise<GetPageOutput> {
  const u = new URL(input.url);
  if (u.host !== "daniellocatelli.com") {
    throw new Error("URL is not on this site (daniellocatelli.com)");
  }
  // Normalize: strip trailing slash, append .md if needed.
  let pathname = u.pathname.replace(/\/$/u, "");
  if (!pathname.endsWith(".md")) pathname += ".md";
  const fetchUrl = `${u.origin}${pathname}`;
  const res = await ctx.fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`get_page failed: ${res.status} for ${fetchUrl}`);
  }
  return { url: fetchUrl, markdown: await res.text() };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:unit -- --test-name-pattern="searchContent|getPage"`
Expected: 5 passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mcp/tools.ts tests/unit/mcp-tools.test.ts
git commit -m "$(cat <<'EOF'
feat(mcp): add four read-only tool implementations

list_projects / list_research read content collections (locale-aware).
search_content reuses the existing Supabase vector-search edge function.
get_page fetches the .md companion of any daniellocatelli.com URL,
rejecting off-site URLs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: MCP JSON-RPC route + manifest

**Files:**
- Create: `src/pages/api/mcp.ts`
- Create: `public/.well-known/mcp.json`
- Modify: `tests/e2e/agent-readiness.spec.ts`

- [ ] **Step 1: Write the failing e2e tests**

Append to `tests/e2e/agent-readiness.spec.ts`:

```ts
test.describe("Agent readiness — MCP", () => {
  test("/.well-known/mcp.json declares streamable-http transport and four tools", async ({ request }) => {
    const res = await request.get("/.well-known/mcp.json");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBe("daniel-locatelli-portfolio");
    expect(json.transport?.type).toBe("streamable-http");
    expect(json.transport?.url).toBe("https://daniellocatelli.com/api/mcp");
    const names = (json.tools as any[]).map((t) => t.name).sort();
    expect(names).toEqual(["get_page", "list_projects", "list_research", "search_content"]);
  });

  test("MCP tools/list returns four tools", async ({ request }) => {
    const res = await request.post("/api/mcp", {
      data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(1);
    const names = (json.result.tools as any[]).map((t) => t.name).sort();
    expect(names).toEqual(["get_page", "list_projects", "list_research", "search_content"]);
  });

  test("MCP tools/call list_projects returns project items", async ({ request }) => {
    const res = await request.post("/api/mcp", {
      data: {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "list_projects", arguments: { locale: "en" } },
      },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    const content = json.result.content;
    expect(Array.isArray(content)).toBe(true);
    const text = content[0].text;
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("title");
    expect(parsed[0]).toHaveProperty("url");
  });

  test("MCP returns JSON-RPC error for unknown method", async ({ request }) => {
    const res = await request.post("/api/mcp", {
      data: { jsonrpc: "2.0", id: 3, method: "does/not/exist" },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.error?.code).toBe(-32601);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test agent-readiness -g "MCP" --reporter=list`
Expected: 4 failures (404).

- [ ] **Step 3: Create the static manifest**

Create `public/.well-known/mcp.json`:

```json
{
  "schemaVersion": "2025-06-18",
  "name": "daniel-locatelli-portfolio",
  "description": "Read-only access to Daniel Locatelli's portfolio: projects, research, and full-text search.",
  "version": "1.0.0",
  "transport": {
    "type": "streamable-http",
    "url": "https://daniellocatelli.com/api/mcp"
  },
  "tools": [
    {
      "name": "list_projects",
      "description": "List portfolio projects with title, summary, URL, and start date.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" }
        }
      }
    },
    {
      "name": "list_research",
      "description": "List research entries with title, summary, URL, and start date.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" }
        }
      }
    },
    {
      "name": "search_content",
      "description": "Vector search across all portfolio content. Returns up to 20 matches with title, URL, snippet, and similarity score.",
      "inputSchema": {
        "type": "object",
        "required": ["query"],
        "properties": {
          "query": { "type": "string" },
          "locale": { "type": "string", "enum": ["en", "pt", "de"], "default": "en" },
          "limit": { "type": "integer", "default": 5, "minimum": 1, "maximum": 20 }
        }
      }
    },
    {
      "name": "get_page",
      "description": "Fetch any daniellocatelli.com page as plain markdown.",
      "inputSchema": {
        "type": "object",
        "required": ["url"],
        "properties": { "url": { "type": "string", "format": "uri" } }
      }
    }
  ]
}
```

- [ ] **Step 4: Implement the JSON-RPC route**

Create `src/pages/api/mcp.ts`:

```ts
import type { APIRoute } from "astro";
import { env as cfEnv } from "cloudflare:workers";
import {
  listProjects,
  listResearch,
  searchContent,
  getPage,
  type SearchEnv,
} from "@/lib/mcp/tools";
import { checkAndIncrementBudget, type KVNamespaceLike } from "@/lib/mcp/budget";

export const prerender = false;

const SEARCH_DAILY_CAP = 5000;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: any;
}

interface JsonRpcResult {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

const TOOLS = {
  list_projects: { description: "List portfolio projects." },
  list_research: { description: "List research entries." },
  search_content: { description: "Vector search across all portfolio content." },
  get_page: { description: "Fetch any daniellocatelli.com page as plain markdown." },
} as const;

function ok(id: JsonRpcRequest["id"], result: any): Response {
  const payload: JsonRpcResult = { jsonrpc: "2.0", id, result };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function err(id: JsonRpcRequest["id"], code: number, message: string): Response {
  const payload: JsonRpcResult = { jsonrpc: "2.0", id, error: { code, message } };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function asContent(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

export const POST: APIRoute = async ({ request }) => {
  let req: JsonRpcRequest;
  try {
    req = (await request.json()) as JsonRpcRequest;
  } catch {
    return err(null, -32700, "Parse error");
  }
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return err(req?.id ?? null, -32600, "Invalid Request");
  }

  const env: any = cfEnv ?? process.env;

  if (req.method === "tools/list") {
    return ok(req.id, {
      tools: Object.entries(TOOLS).map(([name, meta]) => ({
        name,
        description: meta.description,
      })),
    });
  }

  if (req.method !== "tools/call") {
    return err(req.id, -32601, `Method not found: ${req.method}`);
  }

  const name = req.params?.name as keyof typeof TOOLS | undefined;
  const args = (req.params?.arguments ?? {}) as any;
  if (!name || !(name in TOOLS)) {
    return err(req.id, -32602, `Unknown tool: ${String(name)}`);
  }

  try {
    if (name === "list_projects") {
      return ok(req.id, asContent(await listProjects({ locale: args.locale })));
    }
    if (name === "list_research") {
      return ok(req.id, asContent(await listResearch({ locale: args.locale })));
    }
    if (name === "get_page") {
      return ok(req.id, asContent(await getPage({ url: args.url }, { fetch })));
    }
    if (name === "search_content") {
      const kv: KVNamespaceLike | undefined = env?.AI_HEALTH_KV;
      if (!kv) {
        return err(req.id, -32004, "Budget storage unavailable");
      }
      const budget = await checkAndIncrementBudget({ kv, cap: SEARCH_DAILY_CAP });
      if (!budget.allowed) {
        return err(req.id, -32004, "Daily search budget exhausted; try again tomorrow.");
      }
      const searchEnv: SearchEnv = {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
      };
      const out = await searchContent(
        { query: args.query, limit: args.limit, locale: args.locale },
        { env: searchEnv, fetch },
      );
      return ok(req.id, asContent(out));
    }
  } catch (e) {
    return err(req.id, -32000, `Tool error: ${(e as Error).message}`);
  }

  return err(req.id, -32601, "Unhandled tool");
};
```

- [ ] **Step 5: Run e2e tests to verify they pass**

Run: `npx playwright test agent-readiness -g "MCP" --reporter=list`
Expected: 4 passes.

- [ ] **Step 6: Commit**

```bash
git add public/.well-known/mcp.json src/pages/api/mcp.ts tests/e2e/agent-readiness.spec.ts
git commit -m "$(cat <<'EOF'
feat(mcp): add read-only MCP server with four tools

/.well-known/mcp.json advertises a streamable-http MCP server at
/api/mcp. The handler dispatches JSON-RPC 2.0 tools/list and
tools/call for list_projects, list_research, get_page, and
search_content. search_content is protected by a stochastic-write
daily KV budget capped at 5000 calls/day (~\$0.50/day worst case).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Full suite + deploy + score verification

- [ ] **Step 1: Run the full e2e suite locally**

Run: `npx playwright test agent-readiness --reporter=list`
Expected: all tests in the file pass (15+ tests across 6 describes).

- [ ] **Step 2: Run the full unit suite**

Run: `npm run test:unit`
Expected: all existing tests + the new ones pass.

- [ ] **Step 3: Run the production build to verify no compilation errors**

Run: `npm run build`
Expected: successful build. `astro check` passes (no TS errors). The build emits `dist/llms.txt`, `dist/pt/llms.txt`, `dist/de/llms.txt`, and `.md` files under `dist/projects/`, `dist/research/`, etc.

- [ ] **Step 4: Verify built static assets shape**

```bash
ls dist/llms.txt dist/pt/llms.txt dist/de/llms.txt
ls dist/projects/buildsystems-website.md
ls dist/.well-known/mcp.json
```
Expected: all five files exist.

- [ ] **Step 5: Push the branch and open a PR**

```bash
git push -u origin feat/agent-readiness
gh pr create --title "feat: agent-ready endpoints (llms.txt, .md variants, MCP)" --body "$(cat <<'EOF'
## Summary
- robots.txt welcomes 16 known AI crawlers + Content Signals + Sitemap directive
- `_headers` adds Link/X-Robots-Tag on every response
- `/llms.txt` + locale variants generated from content collections (Astro File Endpoints)
- `.md` companion at every content-collection URL, plus Accept: text/markdown rewrite via middleware
- `/.well-known/mcp.json` + `/api/mcp` JSON-RPC server with four tools (list_projects, list_research, search_content, get_page)
- search_content protected by stochastic daily KV budget (cap 5000/day)

Spec: docs/superpowers/specs/2026-05-20-agent-readiness-design.md
Plan: docs/superpowers/plans/2026-05-20-agent-readiness.md

## Test plan
- [x] Unit: formatter, MDX-to-plain-markdown, middleware, budget, tools
- [x] E2E (Playwright): robots.txt, _headers, llms.txt (en/pt/de), .md variants, Accept negotiation, MCP manifest, MCP tools/list, MCP tools/call
- [ ] Post-deploy: re-run https://isitagentready.com/daniellocatelli.com — target ≥60%

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: After PR merges and deploys: re-run isitagentready.com**

Visit `https://isitagentready.com/daniellocatelli.com` and record the new score.

- [ ] **Step 7: If score < 60%, investigate the failing categories**

The scanner's published categories are: Discoverability, Content Accessibility, Bot Access Control, Protocol Discovery, Commerce. Map the failing checks back to the spec's "After (target)" table and decide whether the gap is something this PR should have caught (file an issue) or out-of-scope (Web Bot Auth, OAuth, commerce — these are documented non-goals).

- [ ] **Step 8: Final commit — update spec status if needed**

If the score landed in the target range, edit the spec header status from "Approved (revised after review), pending implementation plan" to "Shipped 2026-MM-DD, score: NN%". Commit and merge.

---

## Self-Review Notes

Spec coverage:
- Section 1 (robots.txt + _headers) → Task 1 ✅
- Section 2 (llms.txt File Endpoints) → Tasks 2, 3, 4 ✅
- Section 3 (.md File Endpoint + middleware) → Tasks 5, 6, 7 ✅
- Section 4 (MCP server) → Tasks 8, 9, 10 ✅
- Section 5 (Verification) → tests/e2e/agent-readiness.spec.ts built incrementally across all tasks + Task 11 ✅

Type consistency: `KVNamespaceLike`, `LlmsTxtSection`, `LlmsTxtEntry`, `ListItem`, `SearchHit`, `GetPageOutput` defined once and reused — no drift between tasks.

Placeholders: none.

Out-of-scope confirmations: `list_teaching`, `list_publications`, `get_cv` not added (spec calls them v1-redundant given `get_page`); Workers Rate Limit binding not added (spec rejected `unsafe.bindings`); shared `content-index` walker not added (spec dropped it in favor of `getCollection()` per endpoint).
