/**
 * Turns lychee's JSON output into a trustworthy markdown report.
 *
 * lychee nominates; this script convicts. Every URL lychee marked as failing
 * is retested through the verification ladder, so bot-walled hosts land in an
 * "unverifiable" section instead of being reported as broken.
 *
 * Usage:
 *   pnpm exec tsx src/scripts/verify-dead-links.ts <lychee.json> <report.md>
 */

import { appendFile, readFile, writeFile } from "node:fs/promises";
import { createProbe, verifyUrl, type Outcome } from "../lib/link-check/verify";

const CONCURRENCY = 4;
const PER_HOST_DELAY_MS = 500;

interface LycheeEntry {
  url: string;
  status?: { text?: string; code?: number };
}

/** lychee writes `fail_map` as { sourceFile: [ { url, status }, ... ] }. */
function collectFailures(json: unknown): Map<string, Set<string>> {
  const sources = new Map<string, Set<string>>();
  const failMap =
    (json as { fail_map?: Record<string, LycheeEntry[]> })?.fail_map ?? {};

  for (const [source, entries] of Object.entries(failMap)) {
    for (const entry of entries) {
      if (!entry?.url) continue;
      const set = sources.get(entry.url) ?? new Set<string>();
      set.add(source);
      sources.set(entry.url, set);
    }
  }

  return sources;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runPool(urls: string[]): Promise<Outcome[]> {
  const probe = createProbe();
  const results: Outcome[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      results.push(await verifyUrl(url, probe));
      // Space out requests so we do not trip the rate limiting we are trying
      // to distinguish from real breakage.
      await sleep(PER_HOST_DELAY_MS);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker),
  );

  return results;
}

function renderSection(
  title: string,
  outcomes: Outcome[],
  sources: Map<string, Set<string>>,
): string {
  if (outcomes.length === 0) return "";

  const lines = [`## ${title}`, ""];
  for (const o of outcomes.sort((a, b) => a.url.localeCompare(b.url))) {
    lines.push(`- ${o.url}`);
    lines.push(`  - ${o.reason}`);
    if (o.finalUrl && o.finalUrl !== o.url) {
      lines.push(`  - resolved to: ${o.finalUrl}`);
    }
    const files = [...(sources.get(o.url) ?? [])].sort();
    if (files.length > 0) {
      lines.push(`  - linked from: ${files.join(", ")}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error(
      "usage: tsx src/scripts/verify-dead-links.ts <lychee.json> <report.md>",
    );
    process.exit(2);
  }

  const sources = collectFailures(
    JSON.parse(await readFile(inputPath, "utf8")),
  );
  const urls = [...sources.keys()];

  console.log(`lychee nominated ${urls.length} URLs; verifying each one.`);
  const outcomes = await runPool(urls);

  const broken = outcomes.filter((o) => o.verdict === "confirmed-broken");
  const unknown = outcomes.filter((o) => o.verdict === "unverifiable");
  const alive = outcomes.filter((o) => o.verdict === "alive");

  const body = [
    `Verified ${urls.length} URLs nominated by lychee.`,
    "",
    `- ${broken.length} confirmed broken`,
    `- ${unknown.length} unverifiable (bot-walled or host down)`,
    `- ${alive.length} false alarms, alive on retest`,
    "",
    renderSection("Confirmed broken", broken, sources),
    renderSection("Unverifiable, needs a manual look", unknown, sources),
    "These hosts refused the checker on both the page and their own homepage,",
    "so CI cannot tell a dead page from a blocked request. Open them in a",
    "browser to decide.",
    "",
  ].join("\n");

  await writeFile(outputPath, body, "utf8");
  console.log(body);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `LINKS_CONFIRMED_BROKEN=${broken.length}\n`,
      "utf8",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
