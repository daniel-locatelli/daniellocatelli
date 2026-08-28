/**
 * Validates every internal link in the built site.
 *
 * Reads dist/client, resolves each internal reference against the set of
 * emitted pages and assets, falls back to the _redirects map for renamed
 * slugs, and verifies #fragments against the target document's ids.
 *
 * Usage:
 *   pnpm exec tsx src/scripts/check-links-internal.ts [--dist dir] [--json report.json]
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import {
  buildRedirectMap,
  buildTargetMap,
  followRedirects,
  parseRedirects,
} from "../lib/link-check/paths";
import {
  classifyRef,
  collectIds,
  extractRefs,
  type Ref,
} from "../lib/link-check/extract";

const DEFAULT_DIST = join(import.meta.dirname, "..", "..", "dist", "client");
const ORIGIN = "https://daniellocatelli.com";

/**
 * `--dist` lets the checker run against a fixture tree rather than only the
 * real build, which is what makes its failure modes testable.
 */
function resolveDist(argv: string[]): string {
  const index = argv.indexOf("--dist");
  if (index === -1) return DEFAULT_DIST;
  const value = argv[index + 1];
  if (value === undefined) throw new Error("--dist requires a path");
  return resolve(value);
}

/** Served by the Worker, not by a file in dist/client. */
const DYNAMIC_ROUTES = ["/api", "/404"];

const isDynamicRoute = (path: string): boolean =>
  DYNAMIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

interface Problem {
  file: string;
  href: string;
  kind: string;
  reason: string;
  severity: "error" | "warning";
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  const jsonFlagIndex = process.argv.indexOf("--json");
  const jsonPath =
    jsonFlagIndex === -1 ? null : process.argv[jsonFlagIndex + 1];
  const DIST = resolveDist(process.argv);

  const allFiles = await walk(DIST);
  const relFiles = allFiles.map((f) => relative(DIST, f).split(sep).join("/"));
  const targets = buildTargetMap(relFiles);

  const redirectsFile = relFiles.includes("_redirects")
    ? await readFile(join(DIST, "_redirects"), "utf8")
    : "";
  const redirects = buildRedirectMap(parseRedirects(redirectsFile));

  const htmlFiles = relFiles.filter((f) => f.endsWith(".html"));
  const idCache = new Map<string, Set<string>>();

  async function idsFor(relFile: string): Promise<Set<string>> {
    const cached = idCache.get(relFile);
    if (cached) return cached;

    let ids = new Set<string>();
    try {
      ids = collectIds(await readFile(join(DIST, relFile), "utf8"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `failed to read ${relFile} for id collection: ${message}`,
      );
    }
    idCache.set(relFile, ids);
    return ids;
  }

  const problems: Problem[] = [];
  const rowCounts = new Map<string, number>();
  let refCount = 0;

  for (const file of htmlFiles) {
    let refs: Ref[];
    try {
      const html = await readFile(join(DIST, file), "utf8");
      const extracted = extractRefs(html);
      refs = extracted.refs;
      for (const [label, n] of extracted.counts) {
        rowCounts.set(label, (rowCounts.get(label) ?? 0) + n);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      problems.push({
        file,
        href: "",
        kind: "file",
        reason: `failed to read or parse: ${message}`,
        severity: "error",
      });
      continue;
    }

    refCount += refs.length;

    for (const ref of refs) {
      const result = classifyRef(ref, ORIGIN);

      if (result.type === "same-page") {
        // A <use> naming an absent symbol renders nothing at all, with no
        // console error and no fallback, so it has to be caught here.
        const ids = await idsFor(file);
        if (!ids.has(result.fragment)) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: `no element with id "${result.fragment}" on this page`,
            severity: "error",
          });
        }
        continue;
      }

      if (result.type !== "internal") continue;

      if (result.absoluteSelfLink) {
        problems.push({
          file,
          href: ref.href,
          kind: ref.kind,
          reason: "absolute link to our own origin, should be root-relative",
          severity: "warning",
        });
      }

      let resolved = result.path;

      if (isDynamicRoute(resolved)) {
        continue;
      }

      if (!targets.has(resolved)) {
        const hop = followRedirects(resolved, redirects);

        if (hop.looped) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: "redirect chain loops or exceeds 3 hops",
            severity: "error",
          });
          continue;
        }

        if (hop.external) continue; // redirects off-site, lychee's problem

        if (hop.path === null || !targets.has(hop.path)) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: `no page or asset at ${resolved}`,
            severity: "error",
          });
          continue;
        }

        resolved = hop.path;
      }

      // A fragment can only be resolved against HTML. Anything else (a PDF
      // with #page=2, an image, a download) has no ids to match, so the
      // fragment is the target format's business, not ours.
      const targetFile = targets.get(resolved);
      if (result.fragment && targetFile?.endsWith(".html")) {
        const ids = await idsFor(targetFile);
        if (!ids.has(result.fragment)) {
          problems.push({
            file,
            href: ref.href,
            kind: ref.kind,
            reason: `no element with id "${result.fragment}" on ${resolved}`,
            severity: "error",
          });
        }
      }
    }
  }

  const errors = problems.filter((p) => p.severity === "error");
  const warnings = problems.filter((p) => p.severity === "warning");

  const byFile = new Map<string, Problem[]>();
  for (const p of problems) {
    const list = byFile.get(p.file) ?? [];
    list.push(p);
    byFile.set(p.file, list);
  }

  for (const [file, list] of [...byFile].sort()) {
    console.log(`\n${file}`);
    for (const p of list) {
      const label = p.severity === "error" ? "ERROR" : "warn ";
      console.log(`  ${label} [${p.kind}] ${p.href}\n         ${p.reason}`);
    }
  }

  console.log(
    `\nChecked ${refCount} distinct references across ${htmlFiles.length} ` +
      `pages: ${errors.length} errors, ${warnings.length} warnings.`,
  );

  const rows = [...rowCounts].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const width = Math.max(...rows.map(([label]) => label.length));

  console.log("\nSelector row matches (before dedupe):");
  for (const [label, n] of rows) {
    console.log(`  ${label.padEnd(width)}  ${String(n).padStart(6)}`);
  }

  // A row at zero is expected for the speculative rows and never fails the
  // run. It is called out so a row that dies after a dependency bump is
  // noticed rather than absorbed into the total.
  const dead = rows.filter(([, n]) => n === 0).map(([label]) => label);
  if (dead.length > 0) {
    console.log(
      `\n${dead.length} selector rows matched nothing: ${dead.join(", ")}`,
    );
  }

  if (jsonPath) {
    await writeFile(
      jsonPath,
      JSON.stringify(
        { problems, rowCounts: Object.fromEntries(rowCounts) },
        null,
        2,
      ),
      "utf8",
    );
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
