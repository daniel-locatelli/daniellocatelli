export const LOCALES = ["en", "pt", "de"] as const;

export const LOCALE_PATHS: Record<string, string> = {
  en: "",
  pt: "/pt",
  de: "/de",
};

export const PAGE_NAMES: Record<string, Record<string, string>> = {
  en: { projects: "Projects", research: "Research", teaching: "Teaching" },
  pt: { projects: "Projetos", research: "Pesquisa", teaching: "Ensino" },
  de: { projects: "Projekte", research: "Forschung", teaching: "Lehre" },
};

export const KNOWN_SUBPAGE = {
  slug: "projects/buildsystems-website",
  title: "BuildSystems Website",
};

export function localeUrl(locale: string, path = "") {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${prefix}${path}` || "/";
}
