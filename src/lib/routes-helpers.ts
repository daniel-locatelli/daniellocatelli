import { siteConfig, SUPPORTED_LOCALES } from "@/site-config";
import type { SupportedLocale } from "@/types";
import { type GetStaticPaths } from "astro";

export const getStaticPaths = (() => {
  return [
    {
      params: { locale: undefined },
      props: { locale: siteConfig.defaultLocale },
    },
    ...SUPPORTED_LOCALES.filter(
      (locale) => locale !== siteConfig.defaultLocale,
    ).map((locale) => ({
      params: { locale },
      props: {
        locale,
      },
    })),
  ];
}) satisfies GetStaticPaths;


// Type guard to check if a string is a supported locale
const isSupportedLocale = (locale: string): locale is SupportedLocale => {
  return SUPPORTED_LOCALES.some(supportedLocale => supportedLocale === locale);
};

export const getLocale = (params: Record<string, string | undefined>): SupportedLocale => {
  const locale = params?.locale;
  
  // If locale is undefined, return the default
  if (!locale) {
    return siteConfig.defaultLocale;
  }
  
  // Use the type guard to validate
  if (isSupportedLocale(locale)) {
    return locale;
  }
  
  return siteConfig.defaultLocale;
};