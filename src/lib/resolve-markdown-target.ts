const SKIP_PREFIXES = ["/api/", "/_", "/.well-known/"];

/**
 * Given a request pathname and Accept header, returns the `.md` rewrite target
 * when the caller prefers `text/markdown`, or `null` if no rewrite should occur.
 *
 * Exported as a pure function so it can be unit-tested independently of Astro's
 * middleware runtime.
 */
export function resolveMarkdownTarget(input: {
  pathname: string;
  accept: string | null | undefined;
}): string | null {
  const { pathname, accept } = input;
  if (!accept || !/text\/markdown/i.test(accept)) return null;
  if (pathname.endsWith(".md")) return null;
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  // Skip anything that already has a file extension (e.g., .txt, .xml, .ico,
  // .webmanifest) — Astro routes for content pages have no extension.
  const lastSegment = pathname.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return null;
  const trimmed = pathname.replace(/\/$/u, "");
  return `${trimmed}.md`;
}
