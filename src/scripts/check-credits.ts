/**
 * Finds image credits in `src/content/` that start with a copyright mark
 * ("©" or "(c)"). `Credit.astro` adds "© " itself, so a credit written with
 * the mark is redundant; keeping the mark out of the content means the
 * component alone decides how a credit is labelled.
 *
 * Checked: deck slide `copyright:` values (a string, a `name:` inside a
 * `copyright:` block, or a list item under it) and `credit=` props
 * (`<Figure credit="...">`, `<YouTube credit={{ name: "..." }}>`).
 * Body text is not touched.
 *
 * Usage:
 *   pnpm check:credits         report and exit 1 if any are found
 *   pnpm check:credits --fix   remove the marks in place
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const CONTENT_DIR = join(ROOT, "src", "content");
const FIX = process.argv.includes("--fix");

const MARK = String.raw`(?:©|\(c\))\s*`;
/** `copyright: © X` / `copyright: "© X"` */
const COPYRIGHT_VALUE = new RegExp(String.raw`^(\s*copyright:\s*["']?)${MARK}`, "i");
/** `credit="© X"` / `credit={"© X"}` / `credit={{ name: "© X", ... }}` */
const FIGURE_CREDIT = new RegExp(String.raw`(credit=(?:\{\{\s*name:\s*|\{)?["'\x60])${MARK}`, "gi");
/** inside a `copyright:` block: `name: © X` or `- © X` */
const BLOCK_LINE = new RegExp(String.raw`^(\s*(?:-\s+)?(?:name:\s*)?["']?)${MARK}`, "i");

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.mdx?$/.test(entry.name)) yield path;
  }
}

const indentOf = (line: string) => line.length - line.trimStart().length;

export function stripCreditMarks(text: string): { text: string; lines: number[] } {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const hits: number[] = [];
  let blockIndent = -1; // indent of an open `copyright:` key with a nested block

  lines.forEach((line, i) => {
    let next = line;
    if (blockIndent >= 0) {
      if (line.trim() === "" || indentOf(line) > blockIndent) {
        next = next.replace(BLOCK_LINE, "$1");
      } else {
        blockIndent = -1;
      }
    }
    if (/^\s*copyright:\s*$/.test(line)) blockIndent = indentOf(line);
    next = next.replace(COPYRIGHT_VALUE, "$1").replace(FIGURE_CREDIT, "$1");
    if (next !== line) {
      hits.push(i + 1);
      lines[i] = next;
    }
  });
  return { text: lines.join(eol), lines: hits };
}

async function main() {
  let total = 0;
  for await (const file of walk(CONTENT_DIR)) {
    const original = await readFile(file, "utf8");
    const { text, lines } = stripCreditMarks(original);
    if (lines.length === 0) continue;
    total += lines.length;
    const rel = relative(ROOT, file).replaceAll("\\", "/");
    for (const n of lines) console.log(`${rel}:${n}  credit starts with a copyright mark`);
    if (FIX) await writeFile(file, text, "utf8");
  }
  if (total === 0) {
    console.log("check:credits: no credits carry a copyright mark.");
    return;
  }
  if (FIX) {
    console.log(`check:credits: removed ${total} mark(s).`);
  } else {
    console.log(`check:credits: ${total} credit(s) carry a copyright mark; Credit.astro adds it. Run \`pnpm check:credits --fix\`.`);
    process.exitCode = 1;
  }
}

if (import.meta.main ?? process.argv[1]?.endsWith("check-credits.ts")) await main();
