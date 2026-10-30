import { siteConfig } from "@/config/site";
import { getEntryLocale, getFileSlug, isPublishedId } from "./routes-helpers";

/** The fields of an essays-collection entry the homepage list needs. */
export interface EssayEntry {
  id: string;
  data: { Name: string; Description?: string; DateStart?: string };
}

/** Published essays of one locale, newest first. Undated entries are skipped. */
export function publishedEssays<T extends EssayEntry>(
  entries: T[],
  locale: string,
): T[] {
  return entries
    .filter(
      (e) =>
        getEntryLocale(e.id) === locale &&
        isPublishedId(e.id) &&
        Boolean(e.data.DateStart),
    )
    .sort((a, b) => b.data.DateStart!.localeCompare(a.data.DateStart!));
}

export function essayHref(entry: { id: string }, locale: string): string {
  const prefix = locale === siteConfig.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/essays/${getFileSlug(entry.id)}`;
}

/** "2026-11-30" → "November 2026" (en), "novembro de 2026" (pt). */
export function formatEssayMonth(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
