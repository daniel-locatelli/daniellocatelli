import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { formatLlmsTxt, type LlmsTxtSection } from "@/lib/llms-txt-format";

export const prerender = true;

const SITE = "https://daniellocatelli.com";
const LOCALES = ["pt", "de"] as const;
type Locale = (typeof LOCALES)[number];

const TAGLINES: Record<Locale, string> = {
  pt: "Doutorando no Gramazio Kohler Research, ETH Zurique. Do design computacional à fabricação em madeira. Arquitetura × Computação × IA.",
  de: "Doktorand bei Gramazio Kohler Research, ETH Zürich. Computational Design-to-Fabrication für den Holzbau. Architektur × Computation × KI.",
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
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
