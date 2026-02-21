import { defineCollection, z } from "astro:content";

const pageSchema = z.object({
  PageId: z.string().optional(),
  Name: z.string(),
  Slug: z.string(),
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
  CoverAlt: z.string().optional().nullable(),
  CoverAlt_de: z.string().optional().nullable(),
  CoverAlt_pt: z.string().optional().nullable(),
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
  Organization: z.string().optional(),
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
    .optional(), // Allow simple string links or simplified link objects
  OtherLinks: z
    .array(
      z.object({
        Text: z.string(),
        Href: z.string(),
        Description: z.string().optional(),
      }),
    )
    .optional(),
  References: z.array(z.any()).optional(),
  Active: z.boolean().optional(),
  Disclosed: z.boolean().optional().nullable(),
  Category: z.string().optional(),
  Level: z.string().optional(),
  Locale: z.string().optional(),
});

export const collections = {
  projects: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  research: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  teaching: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  pages: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  tools: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  prizes: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  people: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  organizations: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  cities: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  publications: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
  skills: defineCollection({
    type: "content",
    schema: pageSchema,
  }),
};
