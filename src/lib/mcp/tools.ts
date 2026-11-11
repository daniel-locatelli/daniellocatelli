// ── list_projects / list_research ─────────────────────────────────────
// These functions call getCollection from astro:content, which is a virtual
// module only available in the Astro build environment. The import is
// deferred (dynamic) so that this file can be loaded in Node unit tests
// without crashing at import time. Unit tests only call the functions below,
// which have no Astro dependencies.

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
  const { isPublishedId } = await import("../routes-helpers");
  const entries = await getCollection(
    collection,
    (e: any) => e.id.startsWith(`${locale}/`) && isPublishedId(e.id),
  );
  return entries.map((e: any) => entryToItem(e, locale, collection));
}

export const listProjects = (input: ListInput) =>
  listCollection("projects", input);
export const listResearch = (input: ListInput) =>
  listCollection("research", input);

// ── search_content / get_profile ──────────────────────────────────────
// Both read the per-locale chat profile (src/generated/chat-profile/*.md,
// written by generate-knowledge.ts), the same text the homepage chat sends
// to Claude. The caller passes the profile in, so these stay pure and
// testable without Vite's ?raw imports.

export interface SearchInput {
  query: string;
  limit?: number;
  locale?: Locale;
}

export interface SearchHit {
  title: string;
  /** Profile section the entry sits in, e.g. "Projects" or "Work experience". */
  section: string;
  url: string;
  snippet: string;
  /** 0..1: the share of query terms the entry matches, weighted by field. */
  score: number;
}

export interface ProfileEntry {
  title: string;
  section: string;
  /** The meta line, tags and summary under the heading. */
  body: string;
  /** The entry's link as written in the profile (relative or absolute). */
  link?: string;
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

/**
 * Split a chat profile into searchable entries: every `###` heading is one
 * entry; a `##` section without `###` headings (About me, Skills,
 * Certifications, Courses) is one entry of its own. The timeline is left out
 * because it only repeats the entries above it.
 */
export function parseProfile(profile: string): ProfileEntry[] {
  const entries: ProfileEntry[] = [];
  let section = "";
  let current: { title: string; lines: string[] } | null = null;
  let sectionLines: string[] = [];
  let sectionHasEntries = false;

  const flushEntry = () => {
    if (!current) return;
    const lines = current.lines.map((l) => l.trim()).filter(Boolean);
    const metaFields = (lines[0] ?? "").split(" | ");
    const last = metaFields[metaFields.length - 1]?.trim() ?? "";
    entries.push({
      title: current.title,
      section,
      body: lines.join("\n"),
      link: /^(\/|https?:\/\/)\S*$/u.test(last) ? last : undefined,
    });
    current = null;
  };
  const flushSection = () => {
    flushEntry();
    const body = sectionLines.join("\n").trim();
    // The timeline heading is localized, so it is recognized by its lines.
    if (section && !sectionHasEntries && body && !isTimeline(body)) {
      entries.push({ title: section, section, body });
    }
    sectionLines = [];
    sectionHasEntries = false;
  };

  for (const line of profile.replace(/\r\n/gu, "\n").split("\n")) {
    if (line.startsWith("### ")) {
      flushEntry();
      sectionHasEntries = true;
      current = { title: line.slice(4).trim(), lines: [] };
    } else if (line.startsWith("## ")) {
      flushSection();
      section = line.slice(3).trim();
    } else if (line.startsWith("# ")) {
      continue;
    } else if (current) {
      current.lines.push(line);
    } else {
      sectionLines.push(line);
    }
  }
  flushSection();
  return entries;
}

/** Timeline lines look like "July 2026 | [Work] | PhD Candidate | ...". */
function isTimeline(body: string): boolean {
  const lines = body.split("\n").filter(Boolean);
  return lines.length > 0 && lines.every((l) => /\| \[[^\]]+\] \|/u.test(l));
}

const STOPWORDS = new Set(
  (
    "a about an and are as at be by can did do does for from has have he his how i in is it its me my of on or " +
    "the to was what when where which who why with you your daniel locatelli " +
    "o os um uma ja de do da dos das em no na nos nas que qual quais com por para sobre voce seu sua " +
    "der die das den dem des ein eine einen und ist im mit von zu fur auf uber wie wo welche du dein"
  ).split(" "),
);

/** Lowercase and strip diacritics, so "Zürich" matches "zurich". */
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function queryTerms(query: string): string[] {
  const terms = normalize(query)
    .split(/[^\p{L}\p{N}#+.]+/u)
    .map((t) => t.replace(/^\.+|\.+$/gu, ""))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    // Crude plural folding so "domes" finds "dome" and "plugins" finds "plugin".
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
  return [...new Set(terms)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const TITLE_WEIGHT = 3;
const TAGS_WEIGHT = 2;
const BODY_WEIGHT = 1;

function entryUrl(entry: ProfileEntry, locale: Locale): string {
  if (entry.link?.startsWith("/")) return `${SITE}${entry.link}`;
  // CV entries link to the employer or school; their page here is the CV.
  return `${SITE}${localePrefix(locale)}/full-cv`;
}

/** Bonus, as a share of the best possible score, when the query's terms appear as a phrase. */
const PHRASE_BONUS = 0.5;

/**
 * Keyword search over the profile. Each query term scores by where it first
 * appears in an entry (title > tags > body, matched at a word start), weighted
 * by how rare the term is across the profile, so "Revit" counts for more than
 * "university". An entry that holds the whole query as a phrase gets a bonus.
 * The score is the share of the best possible score (every term in the
 * title, as a phrase), so it runs from 0 to 1.
 */
export function searchContent(
  input: SearchInput,
  ctx: { profile: string },
): SearchHit[] {
  const requested = Math.trunc(Number(input.limit ?? 5));
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), 20)
    : 5;
  const locale: Locale = isLocale(input.locale) ? input.locale : "en";
  const terms = queryTerms(input.query);
  if (terms.length === 0) return [];
  // Terms match at a word start: "art" finds "Artist" but not "start".
  const WORD_START = String.raw`(?:^|[^\p{L}\p{N}])`;
  const patterns = terms.map(
    (t) => new RegExp(WORD_START + escapeRegExp(t), "u"),
  );
  // The terms in order, each finishing its word, with up to two words
  // (stopwords like "of") between them: "university applied" finds
  // "University of Applied".
  const GAP = String.raw`\p{L}*[^\p{L}\p{N}]+(?:[\p{L}\p{N}]+[^\p{L}\p{N}]+){0,2}`;
  const phrase =
    terms.length > 1
      ? new RegExp(WORD_START + terms.map(escapeRegExp).join(GAP), "u")
      : null;

  const docs = parseProfile(ctx.profile).map((entry) => {
    const tagsLine = entry.body.split("\n").find((l) => l.startsWith("Tags:"));
    return {
      entry,
      title: normalize(entry.title),
      tags: normalize(tagsLine ?? ""),
      body: normalize(entry.body),
    };
  });
  // Inverse document frequency: log(1 + N / df), so a term found in every
  // entry still counts a little and a term found in one entry counts most.
  const idf = patterns.map((re) => {
    const df = docs.filter(
      (d) => re.test(d.title) || re.test(d.body),
    ).length;
    return Math.log(1 + docs.length / Math.max(df, 1));
  });
  const best = TITLE_WEIGHT * idf.reduce((sum, w) => sum + w, 0);

  const hits: SearchHit[] = [];
  for (const d of docs) {
    let points = 0;
    patterns.forEach((re, i) => {
      if (re.test(d.title)) points += TITLE_WEIGHT * idf[i];
      else if (re.test(d.tags)) points += TAGS_WEIGHT * idf[i];
      else if (re.test(d.body)) points += BODY_WEIGHT * idf[i];
    });
    if (points === 0) continue;
    if (phrase && (phrase.test(d.title) || phrase.test(d.body))) {
      points += PHRASE_BONUS * best;
    }
    hits.push({
      title: d.entry.title,
      section: d.entry.section,
      url: entryUrl(d.entry, locale),
      snippet: d.entry.body.slice(0, 500),
      score: Math.round((points / (best * (1 + PHRASE_BONUS))) * 1000) / 1000,
    });
  }
  // Array.sort is stable, so ties keep profile order (newest first in a section).
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export interface GetProfileOutput {
  locale: Locale;
  markdown: string;
}

export function getProfile(
  input: { locale?: Locale },
  ctx: { profiles: Record<Locale, string> },
): GetProfileOutput {
  const locale: Locale = isLocale(input.locale) ? input.locale : "en";
  return { locale, markdown: ctx.profiles[locale] };
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
