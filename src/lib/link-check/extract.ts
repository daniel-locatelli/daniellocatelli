/**
 * Pull link references out of built HTML and decide what each one is.
 *
 * Only three reference kinds matter for internal link checking: `<a href>`,
 * the canonical link, and hreflang alternates. Broken hreflang between the
 * en, pt and de trees is invisible without the last of those.
 */

import { parseHTML } from "linkedom";
import { normalizePath } from "./paths";

export type RefKind = "anchor" | "canonical" | "alternate";

export interface Ref {
  kind: RefKind;
  href: string;
}

export type Classified =
  | { type: "skip" }
  | { type: "external" }
  | {
      type: "internal";
      path: string;
      fragment: string | null;
      absoluteSelfLink: boolean;
    };

const SKIP_SCHEMES = ["mailto:", "tel:", "javascript:", "data:"];

/**
 * Split a srcset candidate list into its URLs, discarding `2x` / `640w`
 * descriptors.
 *
 * Follows the WHATWG candidate-parsing shape rather than splitting on commas:
 * a URL is a run of non-whitespace characters, so a `data:` URI containing
 * commas survives as one candidate instead of being torn into phantom paths.
 */
export function parseSrcset(value: string): string[] {
  const urls: string[] = [];
  let i = 0;

  while (i < value.length) {
    while (i < value.length && /[\s,]/.test(value[i])) i++;
    if (i >= value.length) break;

    const start = i;
    while (i < value.length && !/\s/.test(value[i])) i++;
    const token = value.slice(start, i);

    if (token.endsWith(",")) {
      // No descriptor: the comma terminated the candidate directly.
      const url = token.replace(/,+$/, "");
      if (url !== "") urls.push(url);
      continue;
    }

    if (token !== "") urls.push(token);

    // Skip the descriptor, which never contains a comma.
    while (i < value.length && value[i] !== ",") i++;
  }

  return urls;
}

export function extractRefs(html: string): Ref[] {
  const { document } = parseHTML(html);
  const refs: Ref[] = [];

  const canonical = document.querySelector("link[rel=canonical]");
  const canonicalHref = canonical?.getAttribute("href");
  if (canonicalHref) refs.push({ kind: "canonical", href: canonicalHref });

  for (const el of document.querySelectorAll("link[rel=alternate][hreflang]")) {
    const href = el.getAttribute("href");
    if (href) refs.push({ kind: "alternate", href });
  }

  for (const el of document.querySelectorAll("a[href]")) {
    const href = el.getAttribute("href");
    if (href !== null) refs.push({ kind: "anchor", href });
  }

  return refs;
}

export function classifyRef(ref: Ref, siteOrigin: string): Classified {
  const href = ref.href.trim();

  if (href === "" || href.startsWith("#")) return { type: "skip" };
  if (SKIP_SCHEMES.some((scheme) => href.toLowerCase().startsWith(scheme))) {
    return { type: "skip" };
  }

  let pathAndFragment = href;
  let absoluteSelfLink = false;

  if (/^https?:\/\//i.test(href) || href.startsWith("//")) {
    let url: URL;
    try {
      url = new URL(href, siteOrigin);
    } catch {
      return { type: "skip" };
    }

    if (url.origin !== new URL(siteOrigin).origin) return { type: "external" };

    // Absolute self-origin URLs are correct for canonical and alternate tags,
    // so only an <a> earns the "should be relative" flag.
    absoluteSelfLink = ref.kind === "anchor";
    pathAndFragment = url.pathname + url.hash;
  }

  const hashIndex = pathAndFragment.indexOf("#");
  const rawPath =
    hashIndex === -1 ? pathAndFragment : pathAndFragment.slice(0, hashIndex);
  const fragment =
    hashIndex === -1 ? null : pathAndFragment.slice(hashIndex + 1) || null;

  return {
    type: "internal",
    path: normalizePath(rawPath),
    fragment,
    absoluteSelfLink,
  };
}

export function collectIds(html: string): Set<string> {
  const { document } = parseHTML(html);
  const ids = new Set<string>();
  for (const el of document.querySelectorAll("[id]")) {
    const id = el.getAttribute("id");
    if (id) ids.add(id);
  }
  return ids;
}
