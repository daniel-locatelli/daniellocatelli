import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { importCoverImage } from "src/lib/blog-helpers";
import { getEntrySlug } from "src/lib/routes-helpers";

export const prerender = false;

const COLLECTIONS = [
  "projects",
  "research",
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

  for (const collectionName of COLLECTIONS) {
    const collection = await getCollection(collectionName);
    const entry = collection.find((e) => getEntrySlug(e) === slug);
    if (!entry) continue;

    const image = await importCoverImage(entry, images);
    return new Response(
      JSON.stringify({
        title: entry.data.Name,
        coverUrl: image?.src ?? "",
        slug: getEntrySlug(entry),
      }),
      { headers: { "content-type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
};
