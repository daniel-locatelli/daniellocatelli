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

export function figureCaption(alt: string | null | undefined, title: string | null | undefined): string | null {
  const t = title?.trim();
  if (t === NO_CAPTION) return null;
  if (t) return t;
  const a = alt?.trim();
  return a ? a : null;
}
