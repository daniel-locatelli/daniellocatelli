/**
 * Validates every internal link in the built site.
 *
 * Reads dist/client, resolves each internal reference against the set of
 * emitted pages and assets, falls back to the _redirects map for renamed
 * slugs, and verifies #fragments against the target document's ids.
 *
 * Usage:
 *   pnpm exec tsx src/scripts/check-links-internal.ts [--json report.json]
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import {
  buildRedirectMap,
  buildTargetSet,
  followRedirects,
  parseRedirects,
} from "../lib/link-check/paths";
import {
  classifyRef,
  collectIds,
  extractRefs,
} from "../lib/link-check/extract";

const DIST = join(import.meta.dirname, "..", "..", "dist", "client");
const ORIGIN = "https://daniellocatelli.com";

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

  const allFiles = await walk(DIST);
  const relFiles = allFiles.map((f) => relative(DIST, f).split(sep).join("/"));
  const targets = buildTargetSet(relFiles);

  const redirectsFile = relFiles.includes("_redirects")
    ? await readFile(join(DIST, "_redirects"), "utf8")
    : "";
  const redirects = buildRedirectMap(parseRedirects(redirectsFile));

  const htmlFiles = relFiles.filter((f) => f.endsWith(".html"));
  const idCache = new Map<string, Set<string>>();

  async function idsFor(urlPath: string): Promise<Set<string>> {
    const cached = idCache.get(urlPath);
    if (cached) return cached;

    const rel =
      urlPath === "/" ? "index.html" : `${urlPath.slice(1)}/index.html`;
    let ids = new Set<string>();
    try {
      ids = collectIds(await readFile(join(DIST, rel), "utf8"));
    } catch {
      // Target is not an HTML page (an asset, say). No ids to offer.
    }
    idCache.set(urlPath, ids);
    return ids;
  }

  const problems: Problem[] = [];

  for (const file of htmlFiles) {
    const html = await readFile(join(DIST, file), "utf8");

    for (const ref of extractRefs(html)) {
      const result = classifyRef(ref, ORIGIN);
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

      if (result.fragment) {
        const ids = await idsFor(resolved);
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
    `\nChecked ${htmlFiles.length} pages: ${errors.length} errors, ${warnings.length} warnings.`,
  );

  if (jsonPath) {
    await writeFile(jsonPath, JSON.stringify({ problems }, null, 2), "utf8");
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
