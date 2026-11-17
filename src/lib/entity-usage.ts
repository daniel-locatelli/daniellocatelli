/**
 * Which published pages use which entity images, per locale. Built at build
 * time by scanning content bodies for `assets/content/entities/<slug>/...`
 * paths, so the sources pages never need maintaining by hand.
 *
 * A slide deck counts as its teaching page: the list links to the page, and
 * marks it as a deck when only the deck uses the image.
 */
import { getCollection } from "astro:content";
import { siteConfig } from "@/config/site";
import {
  getDeckParentSlug,
  getEntryLocale,
  getFileSlug,
  isPublishedId,
} from "@/lib/routes-helpers";
import { findEntityImages } from "@/lib/entities";

const PAGE_COLLECTIONS = ["projects", "research", "teaching", "publications", "essays"] as const;

export type EntityUse = {
  href: string;
  title: string;
  description?: string;
  /** True when only the page's slide deck uses the entity's images. */
  deckOnly: boolean;
  /** Asset paths as `/src/assets/content/entities/<slug>/<file>`. */
  images: string[];
  date?: string;
};

type Entry = { id: string; collection: string; body?: string; data: Record<string, any> };

export async function getEntityUses(locale: string): Promise<Map<string, EntityUse[]>> {
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  const pages = (
    await Promise.all(PAGE_COLLECTIONS.map((c) => getCollection(c as any)))
  ).flat() as Entry[];
  const decks = (await getCollection("decks")) as Entry[];

  const inLocale = (e: Entry) => getEntryLocale(e.id) === locale && isPublishedId(e.id);
  const teachingBySlug = new Map(
    pages.filter((p) => p.collection === "teaching" && inLocale(p)).map((p) => [getFileSlug(p.id), p]),
  );

  // entity -> href -> use
  const byEntity = new Map<string, Map<string, EntityUse>>();
  const add = (page: Entry, body: string, fromDeck: boolean) => {
    for (const { entity, file } of findEntityImages(body)) {
      const href = `${prefix}/${page.collection}/${getFileSlug(page.id)}`;
      const uses = byEntity.get(entity) ?? new Map<string, EntityUse>();
      byEntity.set(entity, uses);
      const use: EntityUse = uses.get(href) ?? {
        href,
        title: page.data.Name,
        description: page.data.Description,
        deckOnly: fromDeck,
        images: [],
        date: page.data.DateStart,
      };
      if (!fromDeck) use.deckOnly = false;
      const path = `/src/assets/content/entities/${entity}/${file}`;
      if (!use.images.includes(path)) use.images.push(path);
      uses.set(href, use);
    }
  };

  for (const page of pages.filter(inLocale)) add(page, page.body ?? "", false);
  for (const deck of decks) {
    if (getEntryLocale(deck.id) !== locale) continue;
    const parent = teachingBySlug.get(getDeckParentSlug(deck.id));
    if (parent) add(parent, deck.body ?? "", true);
  }

  const result = new Map<string, EntityUse[]>();
  for (const [entity, uses] of byEntity) {
    result.set(
      entity,
      [...uses.values()].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
    );
  }
  return result;
}
