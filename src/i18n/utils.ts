import type { Folder } from "./types";
import { siteConfig } from "@/site-config";

// Helper function to format date
export const getMonthYear = (dateString: string): string => {
  const date = new Date(dateString);
  const month =
    date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}.${year}`;
};

export async function getI18n<T>(
  folder: Folder,
  locale: string | undefined,
): Promise<T> {
  try {
    const module = await import(`./${folder}/${locale}.ts`);
    return module["t"] as T;
  } catch (error) {
    console.error(
      `Failed to load translations for /${folder}/${locale}.ts`,
      error,
    );
    // Fallback to English
    const defaultModule = await import(
      `./${folder}/${siteConfig.defaultLocale}.ts`
    );
    return defaultModule.english as T;
  }
}

export function createHtmlId(input: string, separator: string = "-"): string {
  if (!input) return "";

  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator) // Replace non-alphanumeric with separator
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), ""); // Trim separators
}
