import { siteConfig } from "@/config/site";

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
  return data.Country ? `${city}, ${data.Country}` : city;
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

/** Sorts collection entries by Order field ascending */
export const sortByOrder = (
  a: { data: { Order?: number } },
  b: { data: { Order?: number } },
): number => (a.data.Order ?? 999) - (b.data.Order ?? 999);
