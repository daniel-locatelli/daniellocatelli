import { ENTITIES, type EntitySlug } from "@/config/entities";

const ENTITY_PATH = /assets\/content\/entities\/([a-z0-9-]+)\/([^)"'`\s]+)/g;

/** Every entity image a content body references, as `{ entity, file }`, deduplicated. */
export function findEntityImages(body: string): { entity: string; file: string }[] {
  const seen = new Set<string>();
  const out: { entity: string; file: string }[] = [];
  for (const [, entity, file] of body.matchAll(ENTITY_PATH)) {
    const key = `${entity}/${file}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ entity, file });
  }
  return out;
}

/** The entity a credit line names, if it starts with an entity's name. */
export function entityForCredit(text: string): EntitySlug | undefined {
  const t = text.trim();
  return (Object.keys(ENTITIES) as EntitySlug[]).find((slug) => {
    const name = ENTITIES[slug].name;
    return t === name || t.startsWith(`${name},`) || t.startsWith(`${name}:`);
  });
}

/** Locale-prefixed URL of an entity's sources page, or of the index when `slug` is empty. */
export function sourcesHref(slug: string, locale: string, defaultLocale: string): string {
  const base = `${locale === defaultLocale ? "" : `/${locale}`}/sources`;
  return slug ? `${base}/${slug}` : base;
}
