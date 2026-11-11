import { createHash } from "node:crypto";
import type { OtherLinkEntry } from "../types/link-preview";

/**
 * One list of link cards for a page: the `Link` frontmatter (a string, a
 * `{ Text, Href }` object, or an array of either) first, then `OtherLinks`,
 * dropping any `OtherLinks` entry whose Href repeats a `Link`. The CV keeps
 * reading `Link` on its own; this is only how a page lists its links.
 */
export function pageLinks(link: unknown, otherLinks?: OtherLinkEntry[]): OtherLinkEntry[] {
  const items = Array.isArray(link) ? link : link == null ? [] : [link];
  const primary: OtherLinkEntry[] = [];
  for (const item of items) {
    if (typeof item === "string" && item) primary.push({ Href: item });
    else if (item && typeof item === "object" && typeof (item as any).Href === "string") {
      const { Href, Text } = item as { Href: string; Text?: string };
      primary.push(Text ? { Href, Text } : { Href });
    }
  }
  const seen = new Set(primary.map((l) => l.Href));
  return [...primary, ...(otherLinks ?? []).filter((l) => !seen.has(l.Href))];
}

/**
 * Generate a stable, collision-safe filesystem key for a URL.
 * Format: <hostname-with-dots-replaced>-<8-char-sha256>
 *
 * The hostname prefix keeps `ls src/assets/links-cache/metadata/` readable.
 * The hash suffix guarantees uniqueness even when distinct URLs would
 * otherwise collide under a naive character-substitution scheme
 * (e.g. `a.b.com` vs `a-b.com`).
 */
export function generateLinkKey(href: string): string {
  const url = new URL(href);
  const hostStub = url.hostname.replace(/^www\./, "").replace(/\./g, "-").toLowerCase();
  const hash = createHash("sha256").update(url.href).digest("hex").slice(0, 8);
  return `${hostStub}-${hash}`;
}
