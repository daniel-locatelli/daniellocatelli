/**
 * Visible caption for a markdown image, derived from its alt and title.
 *
 * - No title: the alt doubles as the caption (site default; hundreds of
 *   content images rely on it).
 * - Title "-": no visible caption. The alt still describes the image for
 *   screen readers; use this for diagrams whose alt is a long verbal
 *   transcription that sighted readers do not need repeated under the figure.
 * - Any other title: the title is the visible caption, the alt stays
 *   descriptive.
 */
export const NO_CAPTION = "-";

export function figureCaption(
  alt: string | null | undefined,
  title: string | null | undefined,
): string | null {
  const t = title?.trim();
  if (t === NO_CAPTION) return null;
  if (t) return t;
  const a = alt?.trim();
  return a ? a : null;
}

/**
 * Caption for the first <img> in a rendered HTML fragment, for components
 * that receive the image through a slot (Figure, ImageRow). The remark image
 * plugin encodes the markdown title as `data-caption` on nested images
 * (empty string = suppressed), so that attribute wins; otherwise the alt
 * doubles as the caption.
 */
export function captionFromImgHtml(html: string): string | null {
  const img = html.match(/<img[^>]*>/i)?.[0];
  if (!img) return null;
  const attrs = new Map<string, string>();
  for (const m of img.matchAll(/\s([\w-]+)=(?:"([^"]*)"|'([^']*)')/g)) {
    attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? "");
  }
  const alt = attrs.get("alt") ?? null;
  const caption = attrs.get("data-caption") ?? null;
  // An empty data-caption is the "-" directive: alt only, no visible caption.
  if (caption !== null) return figureCaption(alt, caption || NO_CAPTION);
  return figureCaption(alt, null);
}
