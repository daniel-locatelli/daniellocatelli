/**
 * Cached metadata scraped from a remote URL referenced in `OtherLinks`.
 * Written to `src/assets/links-cache/metadata/<key>.json` by the
 * `link-metadata-cache` integration; consumed by `LinkPreview.astro`.
 */
export interface CachedLinkMetadata {
  /** The original URL — the `<key>` is sha-derived, so this is the human-readable identifier. */
  url: string;
  title?: string;
  description?: string;
  /** Remote URL of the scraped OG image, before download. */
  image?: string;
  /** Filename inside `src/assets/links-cache/images/`, if download succeeded. */
  localImagePath?: string;
  /** Epoch ms; entries older than the TTL are re-scraped. */
  timestamp: number;
}

/** A single entry in the `OtherLinks` frontmatter array (after Zod validation). */
export interface OtherLinkEntry {
  Href: string;
  Text?: string;
  Description?: string;
  Image?: string;
  HideMedia?: boolean;
}
