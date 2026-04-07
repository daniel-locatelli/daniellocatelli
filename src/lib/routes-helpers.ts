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
 * Astro 5's glob() loader collapses `<locale>/index.md` to id `<locale>`
 * (using the directory name as the slug). We must explicitly map those back
 * to "index" so that the homepage filter in [...page].astro works correctly.
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
