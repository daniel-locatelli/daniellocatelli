import type { CachedLinkMetadata } from "../types/link-preview";

/**
 * Module-level lazy loaders for cache files. `import.meta.glob` is statically
 * resolved at build time, so these records are built once and the per-render
 * cost in `LinkPreview.astro` is an O(1) map lookup + one dynamic import per hit.
 *
 * Paths must be project-root-relative (leading `/src/...`), per Vite/Astro rules.
 */
export const metadataCache = import.meta.glob<{ default: CachedLinkMetadata }>(
  "/src/assets/links-cache/metadata/*.json",
  { eager: false },
);

export const imageCache = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/links-cache/images/*.{jpeg,jpg,png,webp,gif,svg,avif}",
  { eager: false },
);

let userAssetsCache:
  | Record<string, () => Promise<{ default: ImageMetadata }>>
  | null = null;

/**
 * Lazily-initialized glob over user-provided assets, for manual `Image:`
 * overrides in `OtherLinks` frontmatter. Built only on first access so the
 * heavier glob doesn't run for every page.
 */
export function getUserAssets() {
  if (!userAssetsCache) {
    userAssetsCache = import.meta.glob<{ default: ImageMetadata }>(
      "/src/assets/**/*.{jpeg,jpg,png,webp,gif,svg,avif}",
      { eager: false },
    );
  }
  return userAssetsCache;
}

/**
 * Locally cached favicons (one per hostname), written by the
 * `link-metadata-cache` integration into `src/assets/links-cache/favicons/`.
 * Imported as URLs (not via astro:assets) because `.ico` is not a processable
 * image format; the files are still hashed and served from `/_astro/`.
 */
export const faviconCache = import.meta.glob<string>(
  "/src/assets/links-cache/favicons/*.{ico,png,svg,jpg,gif,webp}",
  { eager: false, query: "?url", import: "default" },
);

export const faviconIndex = import.meta.glob<{
  default: Record<string, { file: string }>;
}>("/src/assets/links-cache/favicons/index.json", { eager: false });
