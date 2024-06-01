import type { BundledLanguage } from "../../node_modules/shiki/dist/langs.d.mts";

type SpecialLanguage = "text" | "txt" | "ansi";

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
  // const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day: 'numeric'};

  return new Date(date).toLocaleDateString("en-DE", options);
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

export function notionLangToShiki(
  lang: any
): BundledLanguage | SpecialLanguage {
  switch (lang) {
    case "arduino":
      return "cpp";
    case "flow":
      return "javascript";
    case "fortran":
      return "fortran-fixed-form";
    case "livescript":
      return "javascript";
    case "markup":
      return "markdown";
    case "plain text":
      return "text";
    case "protobuf":
      return "proto";
    case "reason":
      return "javascript";
    case "vb.net":
      return "vb";
    case "visual basic":
      return "vb";
    case "webassembly":
      return "wasm";
    case "java/c/c++/c#":
      return "c";
  }
  return lang;
}
