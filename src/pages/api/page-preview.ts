import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { importCoverImage } from "src/lib/blog-helpers";
import {
  getEntryLocale,
  getEntrySlug,
  isPublishedId,
} from "src/lib/routes-helpers";
import { siteConfig, SUPPORTED_LOCALES } from "@/config/site";
import type { SupportedLocale } from "@/config/site";

export const prerender = false;

const COLLECTIONS = [
  "projects",
  "research",
  "essays",
  "teaching",
  "publications",
] as const;

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/content/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,avif}",
);

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return new Response(JSON.stringify({ error: "slug is required" }), {
      status: 400,
    });
  }
  // Every locale shares the slug, so match the visitor's locale (falling
  // back to the default one) to get the right title and link.
  const requested = url.searchParams.get("locale") ?? "";
  const locale: SupportedLocale = (
    SUPPORTED_LOCALES as readonly string[]
  ).includes(requested)
    ? (requested as SupportedLocale)
    : siteConfig.defaultLocale;

  for (const collectionName of COLLECTIONS) {
    const collection = await getCollection(collectionName);
    const matches = collection.filter(
      (e) => isPublishedId(e.id) && getEntrySlug(e) === slug,
    );
    const entry =
      matches.find((e) => getEntryLocale(e.id) === locale) ??
      matches.find((e) => getEntryLocale(e.id) === siteConfig.defaultLocale) ??
      matches[0];
    if (!entry) continue;
    const entryLocale = getEntryLocale(entry.id);
    const prefix =
      entryLocale === siteConfig.defaultLocale ? "" : `/${entryLocale}`;

    const image = await importCoverImage(entry, images);
    return new Response(
      JSON.stringify({
        title: entry.data.Name,
        coverUrl: image?.src ?? "",
        width: image?.width,
        height: image?.height,
        slug: getEntrySlug(entry),
        href: `${prefix}/${getEntrySlug(entry)}`,
      }),
      { headers: { "content-type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
};
