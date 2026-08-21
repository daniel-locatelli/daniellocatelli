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
  [key: string]: unknown;
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
    lines.push(`**Date:** ${data.DateStart ?? ""}${data.DateEnd ? ` - ${data.DateEnd}` : ""}`);
  }
  if (data.Link) {
    const link =
      typeof data.Link === "string"
        ? data.Link
        : Array.isArray(data.Link)
          ? data.Link
              .map((l: any) => (typeof l === "string" ? l : `${l.Text ?? l.Href} (${l.Href})`))
              .join(", ")
          : `${data.Link.Text} (${data.Link.Href})`;
    lines.push("");
    lines.push(`**Link:** ${link}`);
  }
  if (data.Presentation) {
    lines.push("");
    lines.push(`**Presentation:** ${data.Presentation}`);
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
