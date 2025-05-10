import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
  author: "Daniel Locatelli",
  // Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
  title: "Daniel Locatelli",
  // Meta property used as the default description meta property
  description: "An opinionated starter theme for Astro",
  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  email: "architect.locatelli@gmail.com",
  github: "https://github.com/daniel-locatelli",
  linkedin: "https://www.linkedin.com/in/daniellocatelli",
  whatsapp: "https://wa.me/message/MFRZO3U7RABUM1",
};
