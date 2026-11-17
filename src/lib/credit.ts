/**
 * Shared rules for credit lines (Credit.astro, YouTube.astro).
 *
 * Credits are written without "©" (see `pnpm check:credits`); the components
 * add it, except for creators whose work is in the public domain, where a
 * copyright mark would claim a right that has expired. The image's caption
 * still names the work, so the credit reads as plain attribution.
 */

/**
 * Creators whose credited works on this site are in the public domain
 * (died more than 70 years ago). Matched against the start of a credit line,
 * so "Ernst Haeckel, engravings by Adolf Giltsch" counts. A line that mixes a
 * public-domain creator with a protected one must be split into two lines.
 */
export const PUBLIC_DOMAIN_CREATORS = [
  "Ernst Haeckel", // d. 1919
  "Adolf Giltsch", // d. 1911
  "Goethe", // d. 1832
] as const;

export function hasCopyrightPrefix(text: string): boolean {
  return /^\s*(©|\(c\))/i.test(text);
}

export function isPublicDomainCredit(text: string): boolean {
  const t = text.trim();
  if (t.includes(";")) return false;
  return PUBLIC_DOMAIN_CREATORS.some(
    (name) => t === name || t.startsWith(`${name},`) || t.startsWith(`${name}:`),
  );
}

/** The mark to print before a credit line: "© " or "". */
export function copyrightMark(text: string): string {
  return hasCopyrightPrefix(text) || isPublicDomainCredit(text) ? "" : "© ";
}
