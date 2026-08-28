/**
 * Pull link references out of built HTML and decide what each one is.
 *
 * Two families are collected. Navigational references (`<a href>`, the
 * canonical link, hreflang alternates) tell us where a visitor can go, and
 * broken hreflang between the en, pt and de trees is invisible without them.
 * Loading references (images, scripts, stylesheets, icons, manifests,
 * preloads, media, posters, iframes) are what the browser fetches to render
 * the page; a 404 among them breaks the page silently.
 */

import { parseHTML } from "linkedom";
import { normalizePath } from "./paths";

export type RefKind =
  | "anchor"
  | "canonical"
  | "alternate"
  | "img"
  | "script"
  | "stylesheet"
  | "icon"
  | "manifest"
  | "preload"
  | "media"
  | "poster"
  | "iframe";

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
 * Kinds for which an absolute self-origin URL is correct rather than a smell.
 * Search engines want a fully-qualified canonical and hreflang; everything
 * else should be root-relative so preview deploys resolve.
 */
const ABSOLUTE_OK: ReadonlySet<RefKind> = new Set(["canonical", "alternate"]);

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

interface Source {
  /**
   * Stable name for this row in the summary. Kept separate from `selector`
   * so editing a selector for an unrelated reason does not silently rename
   * a line of output a human reads.
   */
  label: string;
  selector: string;
  attribute: string;
  kind: RefKind;
  /** The attribute holds a srcset candidate list, not a single URL. */
  list?: boolean;
}

/**
 * Ordered because `extractRefs` returns refs grouped by row, and the report
 * reads better with navigation before assets.
 *
 * `rel~=` matches one token of a space-separated rel list, which is what
 * `rel="shortcut icon"` needs. `apple-touch-icon` is a single token and so
 * needs its own selector rather than matching the icon one.
 *
 * `<source>` appears twice on purpose: inside `<picture>` it carries srcset
 * and is an image, inside `<video>`/`<audio>` it carries src and is media.
 * The attribute decides the kind, not the parent element.
 */
const SOURCES: Source[] = [
  {
    label: "link[rel=canonical]",
    selector: "link[rel=canonical]",
    attribute: "href",
    kind: "canonical",
  },
  {
    label: "link[rel=alternate][hreflang]",
    selector: "link[rel=alternate][hreflang]",
    attribute: "href",
    kind: "alternate",
  },
  { label: "a[href]", selector: "a[href]", attribute: "href", kind: "anchor" },
  { label: "img[src]", selector: "img[src]", attribute: "src", kind: "img" },
  {
    label: "img/source[srcset]",
    selector: "img[srcset], source[srcset]",
    attribute: "srcset",
    kind: "img",
    list: true,
  },
  {
    label: "script[src]",
    selector: "script[src]",
    attribute: "src",
    kind: "script",
  },
  {
    label: "link[rel=stylesheet]",
    selector: "link[rel~=stylesheet]",
    attribute: "href",
    kind: "stylesheet",
  },
  {
    label: "link[rel=icon]",
    selector: "link[rel~=icon], link[rel~=apple-touch-icon]",
    attribute: "href",
    kind: "icon",
  },
  {
    label: "link[rel=manifest]",
    selector: "link[rel=manifest]",
    attribute: "href",
    kind: "manifest",
  },
  {
    label: "link[rel=preload]",
    selector: "link[rel=preload]",
    attribute: "href",
    kind: "preload",
  },
  {
    label: "link[rel=preload][imagesrcset]",
    selector: "link[rel=preload][imagesrcset]",
    attribute: "imagesrcset",
    kind: "preload",
    list: true,
  },
  {
    label: "video/audio/source[src]",
    selector: "video[src], audio[src], source[src]",
    attribute: "src",
    kind: "media",
  },
  {
    label: "video[poster]",
    selector: "video[poster]",
    attribute: "poster",
    kind: "poster",
  },
  {
    label: "iframe[src]",
    selector: "iframe[src]",
    attribute: "src",
    kind: "iframe",
  },
];

export interface ExtractResult {
  refs: Ref[];
  /**
   * Raw matches per source row, counted before dedupe. Post-dedupe counts
   * would let a row whose references are all absorbed by an earlier row
   * read as zero while being perfectly alive, which is exactly the false
   * negative this tally exists to prevent.
   */
  counts: Map<string, number>;
}

export function extractRefs(html: string): ExtractResult {
  const { document } = parseHTML(html);
  const refs: Ref[] = [];
  const seen = new Set<string>();
  // Seeded so a row that matches nothing is reported at zero rather than
  // going missing from the map.
  const counts = new Map<string, number>(SOURCES.map((s) => [s.label, 0]));

  const add = (kind: RefKind, href: string) => {
    if (href.trim() === "") return;
    // One missing asset should be one report line, not one per srcset slot.
    const key = `${kind} ${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ kind, href });
  };

  const tally = (label: string, n: number) => {
    counts.set(label, (counts.get(label) ?? 0) + n);
  };

  for (const source of SOURCES) {
    for (const el of document.querySelectorAll(source.selector)) {
      const value = el.getAttribute(source.attribute);
      if (value === null) continue;

      if (source.list) {
        const urls = parseSrcset(value);
        tally(source.label, urls.length);
        for (const url of urls) add(source.kind, url);
      } else {
        // An empty attribute is a matched element but not a reference, so
        // it must not prop up the count of a row that is otherwise dead.
        if (value.trim() !== "") tally(source.label, 1);
        add(source.kind, value);
      }
    }
  }

  return { refs, counts };
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

    absoluteSelfLink = !ABSOLUTE_OK.has(ref.kind);
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
