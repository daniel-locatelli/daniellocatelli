import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "scripts",
  "check-links-internal.ts",
);

/** Run the real checker against a fixture directory. */
function runChecker(
  distDir: string,
): Promise<{ code: number; stdout: string }> {
  return new Promise((settle, reject) => {
    // No shell. `shell: true` concatenates argv without escaping, so a
    // fixture path containing a space is split apart, and the OS temp dir
    // carries the account name. Reaching the script through the Node binary
    // and tsx's loader also skips the pnpm shim that made a shell look
    // necessary on Windows.
    const child = spawn(
      process.execPath,
      ["--import", "tsx", SCRIPT, "--dist", distDir],
      { signal: AbortSignal.timeout(60_000) },
    );
    let stdout = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stdout += chunk));
    // Without the abort above, a hung child would leave this promise
    // unsettled: the fixture would never be cleaned up and the suite would
    // hang rather than fail.
    child.on("error", reject);
    child.on("close", (code) => settle({ code: code ?? 0, stdout }));
  });
}

/** Build a throwaway dist/client containing the given files. */
async function fixture(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const dir = await mkdtemp(join(tmpdir(), "link-check-"));
  for (const [name, content] of Object.entries(files)) {
    const full = join(dir, name);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
  }
  return { dir, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

test("runner: a clean fixture exits zero", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="/about/">About</a>
</body></html>`,
    "about/index.html": `<!doctype html><html><body><p>About</p></body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 0, stdout);
    assert.match(stdout, /0 errors, 0 warnings/);
  } finally {
    await cleanup();
  }
});

test("runner: a link to a missing page exits non-zero", async () => {
  const { dir, cleanup } = await fixture({
    "index.html": `<!doctype html><html><body>
<a href="/nowhere/">Nowhere</a>
</body></html>`,
  });
  try {
    const { code, stdout } = await runChecker(dir);
    assert.equal(code, 1, stdout);
    assert.match(stdout, /no page or asset at \/nowhere/);
  } finally {
    await cleanup();
  }
});
