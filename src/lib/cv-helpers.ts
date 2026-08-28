import { siteConfig, SUPPORTED_LOCALES } from "@/config/site";

/** Gets name from `string | { name: string }` */
export const extractName = (item: any): string => {
  if (!item) return "";
  return typeof item === "string" ? item : item.name;
};

/** Gets first name from array of `string | { name: string }` */
export const extractFirstName = (arr: any): string => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return extractName(arr[0]);
};

/** Gets URL from `string | array of { Href } | { Href }` */
export const extractLink = (linkProp: any): string => {
  if (!linkProp) return "";
  if (typeof linkProp === "string") return linkProp;
  if (Array.isArray(linkProp)) return linkProp[0]?.Href || "";
  return linkProp.Href || "";
};

/** Combines City + Country into "City, Country" */
export const buildLocation = (data: any): string => {
  const city = extractFirstName(data.City);
  if (city && data.Country) return `${city}, ${data.Country}`;
  return city || data.Country || "";
};

const LOCALE_PREFIXED = new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})(/|$)`);

/**
 * Prepends the locale prefix to a bare internal path (`/projects/x`), leaves
 * external URLs unchanged, and leaves alone the two kinds of internal link
 * that must not be prefixed: paths that already carry a locale (`/pt/...`,
 * written that way in content) and locale-neutral static files
 * (`/documents/thesis.pdf`).
 */
export const localizeLink = (link: string, locale: string): string => {
  if (!link || !link.startsWith("/")) return link;
  if (LOCALE_PREFIXED.test(link)) return link;
  if (/\.[a-z0-9]+$/i.test(link.split(/[?#]/)[0])) return link;
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${link}`;
};

/** Builds `/research/{thesis}` path with locale prefix */
export const buildThesisLink = (
  thesis: string | undefined,
  locale: string,
): string | undefined => {
  if (!thesis) return undefined;
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/research/${thesis}`;
};

/** Resolves the best link for a project entry: external Link field, internal page, or empty */
export const resolveProjectLink = (
  entry: { id: string; data: { Link?: any } },
  locale: string,
): string => {
  const external = extractLink(entry.data.Link);
  if (external) return localizeLink(external, locale);
  const slug = entry.id.replace(/^[^/]+\//, "").replace(/\.mdx?$/, "");
  if (slug.startsWith("_")) return "";
  return localizeLink(`/projects/${slug}`, locale);
};

/** Sorts collection entries by Order field ascending */
export const sortByOrder = (
  a: { data: { Order?: number } },
  b: { data: { Order?: number } },
): number => (a.data.Order ?? 999) - (b.data.Order ?? 999);
