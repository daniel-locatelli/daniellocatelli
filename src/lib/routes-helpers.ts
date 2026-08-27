import { siteConfig, SUPPORTED_LOCALES } from "@/config/site";
import type { SupportedLocale } from "@/config/site";
import { type GetStaticPaths } from "astro";

// Type guard to check if a string is a supported locale
const isSupportedLocale = (locale: string): locale is SupportedLocale => {
  return SUPPORTED_LOCALES.some(
    (supportedLocale) => supportedLocale === locale,
  );
};

/**
 * Get the file-name slug from a content entry id.
 * Strips the locale prefix and optional .md/.mdx extension.
 * e.g. "en/air-guitar-by-atelier-marko-brajovic" → "air-guitar-by-atelier-marko-brajovic"
 *
 * Astro's glob() loader collapses `<dir>/index.md` to id `<dir>` (using the
 * directory name as the slug). For locale-only ids (e.g. `pt` from
 * `pages/pt/index.md`), we must explicitly map back to "index" so the homepage
 * filter in [...page].astro works correctly.
 */
export function getFileSlug(id: string): string {
  if (isSupportedLocale(id)) {
    return "index";
  }
  const parts = id.split("/");
  const filePath = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
  return filePath.replace(/\.mdx?$/, "");
}

/**
 * Get the full URL-ready slug for a content entry.
 * Combines collection name with the file slug.
 * e.g. collection="projects", id="en/air-guitar" → "projects/air-guitar"
 */
export function getEntrySlug(entry: {
  collection: string;
  id: string;
}): string {
  return `${entry.collection}/${getFileSlug(entry.id)}`;
}

/**
 * Get the parent-folder slug from a deck entry id.
 * Deck files live as `<locale>/<parent-slug>/deck.mdx`, giving an id ending
 * in "<parent-slug>/deck". This returns the parent-slug.
 * e.g. "en/digital-futures-2026/deck" → "digital-futures-2026"
 */
export function getDeckParentSlug(id: string): string {
  const parts = id.split("/");
  return parts[parts.length - 2] ?? "";
}

/**
 * Locales in which a content entry actually exists, in SUPPORTED_LOCALES
 * order. Pass the ids of every entry in the same collection, plus the slug to
 * look for; ids are matched with `slugOf` (getFileSlug by default, or
 * getDeckParentSlug for decks).
 *
 * Routes hand the result to BaseHead as `alternateLocales` so hreflang only
 * ever advertises locales that were actually built. Without it BaseHead falls
 * back to all SUPPORTED_LOCALES, which makes a single-locale entry point
 * search engines at two 404s.
 */
export function getAlternateLocales(
  ids: readonly string[],
  slug: string,
  slugOf: (id: string) => string = getFileSlug,
): SupportedLocale[] {
  return SUPPORTED_LOCALES.filter((locale) =>
    ids.some((id) => getEntryLocale(id) === locale && slugOf(id) === slug),
  );
}

/**
 * Get the locale from a content entry ID.
 * e.g. "en/air-guitar" → "en", "projects" → defaultLocale
 *
 * Locale-only ids (e.g. `pt`, produced by Astro's glob loader for
 * `pages/pt/index.md`) must return that locale, not the default.
 */
export function getEntryLocale(id: string): SupportedLocale {
  if (isSupportedLocale(id)) {
    return id;
  }
  const parts = id.split("/");
  if (parts.length > 1 && isSupportedLocale(parts[0])) {
    return parts[0];
  }
  return siteConfig.defaultLocale;
}

export const getStaticPaths = (() => {
  return [
    {
      params: { locale: undefined },
      props: { locale: siteConfig.defaultLocale },
    },
    ...SUPPORTED_LOCALES.filter(
      (locale) => locale !== siteConfig.defaultLocale,
    ).map((locale) => ({
      params: { locale },
      props: {
        locale,
      },
    })),
  ];
}) satisfies GetStaticPaths;

/**
 * Resolve the current locale from route params, falling back to the first
 * URL path segment when the route has no `locale` param (e.g. the on-demand
 * `src/pages/404.astro`, which is rendered for any missing URL and must
 * still localize itself for `/pt/...` and `/de/...` requests).
 */
export const getLocale = (
  params: Record<string, string | undefined>,
  url?: URL,
): SupportedLocale => {
  const locale = params?.locale ?? getLocaleFromPathname(url?.pathname);

  // If locale is undefined, return the default
  if (!locale) {
    return siteConfig.defaultLocale;
  }

  // Use the type guard to validate
  if (isSupportedLocale(locale)) {
    return locale;
  }

  return siteConfig.defaultLocale;
};

/**
 * Extract a supported locale from the first segment of a pathname.
 * e.g. "/pt/projects/x" -> "pt"; "/projects/x" -> undefined
 */
export const getLocaleFromPathname = (
  pathname: string | undefined,
): SupportedLocale | undefined => {
  const first = pathname?.split("/").find(Boolean);
  return first && isSupportedLocale(first) ? first : undefined;
};
