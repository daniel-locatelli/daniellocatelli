/**
 * Validates every `deck.mdx` file in `src/content/` against the YAML slide
 * schema defined by `src/lib/vite-presentation-slides.ts`.
 *
 * Catches unknown fields, missing required fields, missing `imageAlt` when
 * `image` is set, dropped-silently `notes` on title/text slides, invalid
 * enum values, and type mismatches (number where string expected).
 *
 * Runs without spinning up Astro or Vite; pure YAML parsing plus schema
 * checks. Target runtime under one second on the full content tree.
 *
 * Usage:
 *   npm run check:decks
 *   tsx src/scripts/check-decks.ts
 *
 * Exits 0 if all decks validate, 1 otherwise.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  extractSlidesFromMdx,
  validateSlide,
  type SlideValidationError,
} from "../lib/vite-presentation-slides.ts";

const ROOT = join(import.meta.dirname, "..", "..");
const CONTENT_DIR = join(ROOT, "src", "content");

async function* walkDecks(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDecks(path);
    } else if (entry.isFile() && entry.name === "deck.mdx") {
      yield path;
    }
  }
}

function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

async function main(): Promise<void> {
  const start = Date.now();
  const allErrors: SlideValidationError[] = [];
  let fileCount = 0;
  let slideCount = 0;

  for await (const file of walkDecks(CONTENT_DIR)) {
    fileCount++;
    const code = await readFile(file, "utf8");
    const relPath = toPosix(relative(ROOT, file));
    const { slides, parseErrors } = extractSlidesFromMdx(code, relPath);
    slideCount += slides.length;
    allErrors.push(...parseErrors);
    for (const slide of slides) {
      allErrors.push(
        ...validateSlide(slide.config, {
          file: slide.file,
          line: slide.line,
        }),
      );
    }
  }

  const elapsed = Date.now() - start;

  if (allErrors.length === 0) {
    console.log(
      `OK: ${slideCount} slides across ${fileCount} deck${fileCount === 1 ? "" : "s"} validated (${elapsed}ms).`,
    );
    return;
  }

  for (const err of allErrors) {
    console.error(`${err.file}:${err.line}`);
    console.error(`  ${err.message}`);
    console.error();
  }
  console.error(
    `FAIL: ${allErrors.length} validation error${allErrors.length === 1 ? "" : "s"} across ${fileCount} deck${fileCount === 1 ? "" : "s"} (${elapsed}ms).`,
  );
  process.exit(1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
