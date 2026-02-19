export const SUPPORTED_LOCALES = ["en", "pt"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type SiteConfig = {
  title: string;
  description: string;
  defaultLocale: SupportedLocale;

  // Author Information
  author: string;
  authorFirstName: string;
  authorLastName: string;
  email: string;
  phone: string;
  website: string;

  // Social Links
  bluesky: string;
  github: string;
  gitlab: string;
  instagram: string;
  linkedin: string;
  orcid: string;
  whatsapp: string;
};

export const siteConfig: SiteConfig = {
  // Site Metadata
  title: "Daniel Locatelli",
  description: "A place to record my most important work.",
  defaultLocale: "en",

  // Author Information
  author: "Daniel Nunes Locatelli",
  authorFirstName: "Daniel",
  authorLastName: "Nunes Locatelli",
  email: "contact@daniellocatelli.com",
  phone: "+49 178 324-0834",
  website: "https://daniellocatelli.com",

  // Social Links
  bluesky: "did:plc:crjzvrnutaxdyfy3thsibcd7",
  github: "https://github.com/daniel-locatelli",
  gitlab: "https://gitlab.com/daniellocatelli",
  instagram: "https://www.instagram.com/architectlocatelli",
  linkedin: "https://www.linkedin.com/in/daniel-locatelli",
  orcid: "0009-0001-6384-5401",
  whatsapp: "https://wa.me/message/MFRZO3U7RABUM1",
};
