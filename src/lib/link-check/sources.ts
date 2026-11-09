/**
 * Turns lychee's "source file" for a failing link into the live page URL a
 * reader can open, pointing at the spot on the page where the link sits.
 *
 * lychee reports sources as built files (`dist/client/research/foo/index.html`).
 * The report is read by a human fixing links, so it shows
 * `https://daniellocatelli.com/research/foo#fn-bar` instead.
 */

import { fileToUrlPath } from "./paths";

const DIST_ROOT = "dist/client/";

/** Map a lychee source path (relative or absolute) to the page's public URL. */
export function sourceToPageUrl(source: string, siteOrigin: string): string {
  const posix = source.replace(/\\/g, "/");
  const at = posix.lastIndexOf(DIST_ROOT);
  const rel = at >= 0 ? posix.slice(at + DIST_ROOT.length) : posix;
  const path = fileToUrlPath(rel);
  return siteOrigin.replace(/\/+$/, "") + (path === "/" ? "/" : path);
}

/**
 * Find the anchors nearest to each place `url` is linked in `html`: for every
 * occurrence of `href="url"`, the closest `id` that opens before it. Footnote
 * tooltips (`fn-x-tooltip`, a hidden popover) map to their footnote (`fn-x`),
 * so a citation reports one anchor rather than two.
 */
export function findLinkAnchors(html: string, url: string): string[] {
  const hrefs = new Set([url, url.replace(/&/g, "&amp;")]);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => ({
    id: m[1],
    at: m.index ?? 0,
  }));

  const anchors = new Set<string>();
  for (const href of hrefs) {
    const needle = `href="${href}"`;
    for (
      let pos = html.indexOf(needle);
      pos >= 0;
      pos = html.indexOf(needle, pos + 1)
    ) {
      let nearest: string | undefined;
      for (const { id, at } of ids) {
        if (at >= pos) break;
        nearest = id;
      }
      if (nearest) anchors.add(nearest.replace(/-tooltip$/, ""));
    }
  }
  return [...anchors];
}
