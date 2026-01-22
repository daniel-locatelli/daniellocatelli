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
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
};

export const getLocale = (params: { locale?: string }): SupportedLocale => {
  const { locale } = params;
  
  // If locale is undefined, return the default
  if (!locale) {
    return siteConfig.defaultLocale;
  }
  
  // Use the type guard to validate
  if (isSupportedLocale(locale)) {
    return locale;
  }
  
  // Log warning for unsupported locales
  if (import.meta.env.DEV) {
    console.warn(
      `[i18n] Unsupported locale: "${locale}". ` +
      `Supported locales are: ${SUPPORTED_LOCALES.join(', ')}. ` +
      `Falling back to: "${siteConfig.defaultLocale}"`
    );
  }
  
  return siteConfig.defaultLocale;
};