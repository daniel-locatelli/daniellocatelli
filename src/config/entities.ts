/**
 * Entities: recurring third-party subjects whose images several pages share
 * (see CLAUDE.md, "Shared third-party images"). Each key is the folder name
 * under `src/assets/content/entities/`; `name` is written the way credits
 * spell it, so a credit line that starts with it links to the entity's
 * sources page. Names are not translated.
 *
 * Adding an entity: create the folder, add it here. The sources pages
 * (`/sources/<slug>`) and the credit links follow automatically.
 */
export const ENTITIES = {
  "ernst-haeckel": { name: "Ernst Haeckel" },
} as const satisfies Record<string, { name: string }>;

export type EntitySlug = keyof typeof ENTITIES;

export const ENTITY_SLUGS = Object.keys(ENTITIES) as EntitySlug[];
