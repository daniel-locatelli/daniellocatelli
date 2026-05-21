import { createHash } from "node:crypto";

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
