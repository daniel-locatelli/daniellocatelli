import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const pageSchema = z.object({
  PageId: z.string().optional(),
  Name: z.string(),
  Slug: z.string().optional(),
  DateStart: z.string().optional(),
  DateEnd: z.string().optional(),
  Description: z.string().optional(),
  Description_de: z.string().optional(),
  Description_pt: z.string().optional(),
  Name_de: z.string().optional(),
  Name_pt: z.string().optional(),
  ShortDescription: z.string().optional().nullable(),
  ShortDescription_de: z.string().optional().nullable(),
  ShortDescription_pt: z.string().optional().nullable(),
  Cover: z
    .union([
      z.object({
        Url: z.string(),
      }),
      z.string(),
    ])
    .optional()
    .nullable(),
  Thumbnail: z
    .union([
      z.object({
        Url: z.string(),
      }),
      z.string(),
    ])
    .optional()
    .nullable(),
  CoverAlt: z.string().optional().nullable(),
  CoverAlt_de: z.string().optional().nullable(),
  CoverAlt_pt: z.string().optional().nullable(),
  CoverFocal: z.string().optional().nullable(),
  CoverFit: z.enum(["cover", "contain"]).optional().nullable(),
  CoverCredit: z
    .union([
      z.string(),
      z.object({ name: z.string(), href: z.string() }),
      z.array(
        z.union([
          z.string(),
          z.object({ name: z.string(), href: z.string() }),
        ]),
      ),
    ])
    .optional()
    .nullable(),
  Icon: z
    .union([
      z.object({
        Type: z.string(),
        Emoji: z.string().optional(),
        Url: z.string().optional(),
      }),
      z.string(),
    ])
    .optional()
    .nullable(),
  Tags: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional(),
  Authors: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Apps: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Client: z.string().optional(),
  Director: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Manager: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Team: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Development: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  City: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string().optional(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional(),
  // A single organization or several; normalised to one comma-separated string
  // so every consumer keeps treating it as text.
  Organization: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (Array.isArray(v) ? v.join(", ") : v)),
  Event: z.string().optional(),
  Place: z.string().optional(),
  Language: z
    .union([
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          color: z.string(),
        }),
      ),
      z.array(z.string()),
      z.string(),
    ])
    .optional()
    .nullable(),
  Link: z
    .union([
      z.string(),
      z.array(z.any()),
      z.object({ Text: z.string(), Href: z.string() }),
    ])
    .optional(),
  OtherLinks: z
    .array(
      z.object({
        Href: z.string().url(),
        Text: z.string().optional(),
        Description: z.string().optional(),
        Image: z.string().optional(),
        HideMedia: z.boolean().optional(),
      }),
    )
    .optional(),
  References: z.array(z.any()).optional(),
  Supervisors: z.array(z.string()).optional(),
  Advisors: z.array(z.string()).optional(),
  Coordinators: z
    .union([
      z.array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
        }),
      ),
      z.array(z.string()),
    ])
    .optional()
    .nullable(),
  Active: z.boolean().optional(),
  Disclosed: z.boolean().optional().nullable(),
  Category: z.string().optional(),
  Level: z.string().optional(),
  Locale: z.string().optional(),
  Order: z.number().optional(),
  ValidUntil: z.string().optional(),
  CredentialID: z.string().optional(),
  Thesis: z.string().optional(),
  Country: z.string().optional(),
});

const contentCollection = (base: string) =>
  defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base }),
    schema: pageSchema,
  });

const deckSchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
  DateStart: z.string().optional(),
  Event: z.string().optional(),
  Language: z.string().optional(),
  Cover: z
    .union([z.object({ Url: z.string() }), z.string()])
    .optional()
    .nullable(),
  CoverAlt: z.string().optional().nullable(),
  CoverFit: z.enum(["cover", "contain"]).optional().nullable(),
});

export const collections = {
  projects: contentCollection("./src/content/projects"),
  research: contentCollection("./src/content/research"),
  // Decks live alongside their teaching writeups (e.g. teaching/en/<slug>/{index.md, deck.mdx}),
  // so the teaching glob excludes deck.mdx and the decks collection picks it up separately.
  // Two collections, one base directory: unusual but deliberate, to keep all material for one
  // talk co-located on disk while giving decks their own minimal schema.
  teaching: defineCollection({
    loader: glob({
      pattern: ["**/*.{md,mdx}", "!**/deck.mdx"],
      base: "./src/content/teaching",
    }),
    schema: pageSchema,
  }),
  decks: defineCollection({
    loader: glob({
      pattern: "**/deck.mdx",
      base: "./src/content/teaching",
    }),
    schema: deckSchema,
  }),
  pages: contentCollection("./src/content/pages"),
  publications: contentCollection("./src/content/publications"),
  skills: contentCollection("./src/content/skills"),
  experiences: contentCollection("./src/content/experiences"),
  education: contentCollection("./src/content/education"),
  scholarships: contentCollection("./src/content/scholarships"),
  certifications: contentCollection("./src/content/certifications"),
  "courses-attended": contentCollection("./src/content/courses-attended"),
};
