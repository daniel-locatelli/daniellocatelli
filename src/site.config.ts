import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
  author: "Daniel Locatelli",
  // Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
  title: "Daniel Locatelli",
  // Meta property used as the default description meta property
  description: "An opinionated starter theme for Astro",
  // HTML lang property, found in src/layouts/Base.astro L:18
  lang: "en-DE",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_DE",
  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  date: {
    locale: "en-DE",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  webmentions: {
    // Webmention.io API endpoint. Get your own here: https://webmention.io/, and follow this blog post: https://astro-cactus.chriswilliams.dev/posts/webmentions/
    link: "https://webmention.io/astro-cactus.chriswilliams.dev/webmention",
  },
};
