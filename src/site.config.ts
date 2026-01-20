import type { SiteConfig } from "@/types";

export const SUPPORTED_LOCALES = ["en", "pt"] as const;

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
  
  // Social Links
  github: "https://github.com/daniel-locatelli",
  linkedin: "https://www.linkedin.com/in/daniel-locatelli",
  instagram: "https://www.instagram.com/architectlocatelli",
  whatsapp: "https://wa.me/message/MFRZO3U7RABUM1",
};