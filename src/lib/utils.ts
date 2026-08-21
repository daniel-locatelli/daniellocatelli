export const pathJoin = (path: string, subPath: string) => {
  return (
    "/" +
    path
      .split("/")
      .concat(subPath.split("/"))
      .filter((p) => p)
      .join("/")
  );
};

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return new Date(date).toLocaleDateString("en-DE", options);
}

/** BCP 47 tags used for date formatting per site locale. */
const DATE_LOCALE: Record<string, string> = {
  en: "en-GB",
  pt: "pt-BR",
  de: "de-DE",
};

/**
 * Format a content date string for display in the given site locale, keeping
 * the precision of the source value: "2019" -> "2019", "2019-03" -> "March
 * 2019", "2019-03-05" -> "5 March 2019", and full ISO timestamps (e.g. git
 * commit dates) -> "5 March 2019". Date-only inputs are interpreted as UTC so
 * the day never shifts with the build machine's timezone. Unparseable input is
 * returned unchanged.
 */
export function formatContentDate(value: string, locale: string): string {
  const tag = DATE_LOCALE[locale] ?? locale;
  const m = value
    .trim()
    .match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?(?:[T ].*)?$/);
  if (!m) return value;
  const [, y, mo, d] = m;
  const hasTime = /[T ]/.test(value);
  if (!mo) return y;
  const date = hasTime
    ? new Date(value)
    : new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d ?? 1)));
  if (Number.isNaN(date.getTime())) return value;
  const options: Intl.DateTimeFormatOptions =
    d || hasTime
      ? { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
      : { year: "numeric", month: "long", timeZone: "UTC" };
  return new Intl.DateTimeFormat(tag, options).format(date);
}

function removeDiacritics(string: string) {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function titleToSlug(string: string) {
  // Remove diacritics
  let stringWithoutDiacritics = removeDiacritics(string);

  // Remove special characters and replace spaces with hyphens
  let simplifiedString = stringWithoutDiacritics
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-");
  return simplifiedString;
}

// eslint-disable-next-line prettier/prettier
export const snakeToKebab = (s: string) => s.replaceAll("_", "-");
