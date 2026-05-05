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

export const getLocale = (
  params: Record<string, string | undefined>,
): SupportedLocale => {
  const locale = params?.locale;

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
