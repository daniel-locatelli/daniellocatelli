/**
 * Pure path helpers for the internal link checker.
 *
 * The built site emits every page as `<path>/index.html`, while links in the
 * markup are root-relative without a trailing slash. These helpers reconcile
 * the two, and parse the `_redirects` map Astro writes into dist/client so
 * that links to renamed slugs are not reported as broken.
 */

export interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

/**
 * Reduce a URL path to the canonical form used as a target-set key:
 * no query, no duplicate slashes, no trailing slash (except root), decoded.
 */
export function normalizePath(input: string): string {
  let path = input.split("?")[0];

  try {
    path = decodeURIComponent(path);
  } catch {
    // Malformed percent-encoding: keep the raw value so it fails loudly
    // as a missing target rather than throwing here.
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path === "" ? "/" : path;
}

/** Convert a dist-relative file path into the URL path that serves it. */
export function fileToUrlPath(relFile: string): string {
  const posix = relFile.replace(/\\/g, "/");
  const withoutIndex = posix.endsWith("/index.html")
    ? posix.slice(0, -"/index.html".length)
    : posix === "index.html"
      ? ""
      : posix;

  return normalizePath("/" + withoutIndex);
}

/** Build the set of every URL path the built site can serve. */
export function buildTargetSet(relFiles: string[]): Set<string> {
  return new Set(relFiles.map(fileToUrlPath));
}

/**
 * Parse `dist/client/_redirects`. Astro writes whitespace-aligned columns:
 * `<from>  <to>  <status>`. Blank lines and `#` comments are skipped, as are
 * lines that do not have exactly three fields.
 */
export function parseRedirects(text: string): RedirectRule[] {
  const rules: RedirectRule[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;

    const fields = line.split(/\s+/);
    if (fields.length !== 3) continue;

    const [from, to, statusText] = fields;
    const status = Number.parseInt(statusText, 10);
    if (!Number.isFinite(status)) continue;

    rules.push({ from: normalizePath(from), to, status });
  }

  return rules;
}

/** Index rules by their normalized source path. */
export function buildRedirectMap(
  rules: RedirectRule[],
): Map<string, RedirectRule> {
  const map = new Map<string, RedirectRule>();
  for (const rule of rules) {
    if (!map.has(rule.from)) map.set(rule.from, rule);
  }
  return map;
}

/**
 * Resolve a path through the redirect map, following at most `maxHops` hops.
 *
 * Returns the final internal path, or a null path when the chain leaves the
 * site (`external`, which lychee will cover) or cycles (`looped`, which is a
 * genuine configuration bug worth reporting).
 */
export function followRedirects(
  path: string,
  redirects: Map<string, RedirectRule>,
  maxHops = 3,
): { path: string | null; external: boolean; looped: boolean } {
  const seen = new Set<string>([path]);
  let current = path;

  for (let hop = 0; hop < maxHops; hop++) {
    const rule = redirects.get(current);
    if (!rule) return { path: current, external: false, looped: false };

    if (/^https?:\/\//i.test(rule.to)) {
      return { path: null, external: true, looped: false };
    }

    current = normalizePath(rule.to);
    if (seen.has(current)) {
      return { path: null, external: false, looped: true };
    }
    seen.add(current);
  }

  return { path: null, external: false, looped: true };
}
