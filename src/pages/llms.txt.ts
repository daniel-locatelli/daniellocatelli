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
    tagline: "AEC software engineer based in Berlin. Architecture x Computation x AI.",
    sections,
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
