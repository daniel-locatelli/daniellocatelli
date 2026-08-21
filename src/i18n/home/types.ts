export type SkillsMapTool =
  | "autocad"
  | "civil3d"
  | "revit"
  | "dynamo"
  | "grasshopper"
  | "kangaroo"
  | "galapagos"
  | "weaverbird"
  | "ladybug"
  | "culebra"
  | "karamba"
  | "python"
  | "csharp"
  | "html"
  | "css"
  | "typescript"
  | "flask"
  | "tanstack"
  | "astro"
  | "react"
  | "mongodb"
  | "sqlite"
  | "postgresql";

export type I18nHome = {
  meta: {
    title: string;
    description: string;
    coverAlt: string;
  };

  hero: {
    id: string;
    hi: string;
    greeting: string;
    title: string;
    description: string;
    requestQuote: string;
    sendEmail: string;
    chat: {
      initialMessage: string;
      inputPlaceholder: string;
      headerTitle: string;
      poweredBy: string;
      errorMessage: string;
    };
  };
  service: {
    id: string;
    title: string;
    list: Service[];
  };
  about: {
    id: string;
    title: string;
    background: string;
    approach: string;
  };
  projects: {
    id: string;
    title: string;
    list: Project[];
    tech: string;
    viewFullArticle: string;
  };
  testimonials: {
    id: string;
    title: string;
    list: Recommendation[];
  };
  expertise: {
    id: string;
    title: string;
    description: string;
    /** One-sentence "where / how I use it" tooltip per tool in the Map of Knowledge. */
    tools: Record<SkillsMapTool, string>;
  };
  contact: {
    id: string;
    title: string;
    description: string;
    letsTalk: string;
    sendEmail: string;
  };
};

export type Service = {
  title: string;
  description: string;
  icon: string;
};

export type Project = {
  title: string;
  context: string;
  contextLink: string;
  description: string;
  technologies: string;
  imageUrl: ImageMetadata;
  /** Descriptive alt text; falls back to "Screenshot of {title}" when omitted. */
  imageAlt?: string;
  internalLink: string;
};

export type Recommendation = {
  text: string;
  author: string;
  context: string;
  position: string;
  contextLink: string;
};
