// ── list_projects / list_research ─────────────────────────────────────
// These functions call getCollection from astro:content, which is a virtual
// module only available in the Astro build environment. The import is
// deferred (dynamic) so that this file can be loaded in Node unit tests
// without crashing at import time. Unit tests only call searchContent and
// getPage, which live below and have no Astro dependencies.

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
  return locale === "en"
    ? `${collection}/${slug}`
    : `${locale}/${collection}/${slug}`;
}

function entryToItem(
  e: { id: string; data: Record<string, any> },
  locale: Locale,
  collection: Coll,
): ListItem {
  const slug = e.id.replace(new RegExp(`^${locale}/`), "");
  const data = e.data;
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
  // Dynamic import keeps astro:content out of the top-level module graph so
  // that node:test can load this file without hitting the virtual module.
  const { getCollection } = await import("astro:content");
  const entries = await getCollection(collection, (e: any) =>
    e.id.startsWith(`${locale}/`),
  );
  return entries.map((e: any) => entryToItem(e, locale, collection));
}

export const listProjects = (input: ListInput) =>
  listCollection("projects", input);
export const listResearch = (input: ListInput) =>
  listCollection("research", input);

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
