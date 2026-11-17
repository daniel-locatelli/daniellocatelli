# Entities: shared third-party images

An **entity** is a recurring third-party subject (a person or an archive, e.g. Ernst Haeckel) whose images two or more pages use. Its images live once, in `src/assets/content/entities/<entity-slug>/`, and every page, deck and locale references that one file.

## Using an image that already exists

1. Look in `src/assets/content/entities/` first, then search the other asset folders for the same picture (`git grep -i <creator>` over `src/content/`, and the filenames under `src/assets/content/`).
2. Reference the entity file; never copy it into the page's own folder.
   - Markdown: a relative path, `../../../assets/content/entities/ernst-haeckel/hexacoralla.jpg`.
   - MDX and decks: `import hexacoralla from "@/assets/content/entities/ernst-haeckel/hexacoralla.jpg";`
3. Write the alt text and caption at the use site, in each locale. The entity folder holds only the files.
4. Credit the creator by the exact `name` in `src/config/entities.ts`, without "©" (`credit="Ernst Haeckel"`, `copyright: Ernst Haeckel`). A plain credit that starts with that name links to `/sources/<entity-slug>` automatically; a `{ name, href }` credit keeps its external link instead.

The build scans content bodies for `assets/content/entities/<slug>/` paths and lists the page on `/[locale]/sources/<slug>`. Nothing to register per page. A deck counts as its teaching page; a deck without one is not listed.

## Promoting a creator to an entity (rule of two)

A creator gets an entity folder when a **second** page uses their imagery. Until then the image stays in the page's own folder.

1. `git mv` every copy into `src/assets/content/entities/<entity-slug>/` (kebab-case creator name; descriptive filenames, no page or slide numbers). Identical files become one; different crops of the same plate both stay, under distinct names.
2. Repoint every reference in all three locales, including decks.
3. Add the entity to `ENTITIES` in `src/config/entities.ts`, with `name` spelled as the credits spell it (names are not translated).
4. If the creator's work is public domain (died more than 70 years ago), add the name to `PUBLIC_DOMAIN_CREATORS` in `src/lib/credit.ts` so credits drop the "©". Only when the image has a caption.
5. `pnpm build`, then check `/sources/<entity-slug>` lists every page.

## Credits

- Write credits without "©"; `Credit.astro` adds it. `pnpm check:credits` (in CI) flags any that carry it; `pnpm check:credits --fix` removes them.
- Put one creator per line. A line containing ";" is never treated as public domain, so a mixed credit must be a list.
- Video credits go in the `credit` prop of `<YouTube>`, not in the body text.

## Deliberately out of scope

Entity bio pages, schema.org data for entities, entity sections in the chat profile, per-folder `_sources.yaml` sidecars, an entities content collection, and Daniel's own project images (decks import those straight from the project folder).
