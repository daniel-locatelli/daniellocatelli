import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFileDateMap,
  getFileLastModified,
  contentFileToPathname,
} from "../../src/lib/sitemap-lastmod";

test("buildFileDateMap returns ISO dates keyed by repo-relative path", () => {
  const map = buildFileDateMap();
  // This test file's own module is tracked, so it must have a commit date
  // (unless running in a shallow/no-git environment, where the map is empty).
  if (map.size === 0) return;
  const date = map.get("src/lib/sitemap-lastmod.ts");
  assert.ok(date, "sitemap-lastmod.ts should have a commit date");
  assert.match(date!, /^\d{4}-\d{2}-\d{2}T/);
});

test("getFileLastModified accepts relative, absolute and Windows paths", () => {
  const rel = getFileLastModified("src/lib/sitemap-lastmod.ts");
  if (!rel) return; // no git history available
  assert.equal(
    getFileLastModified(
      "C:/repos/x/daniellocatelli/src/lib/sitemap-lastmod.ts",
    ),
    rel,
  );
  assert.equal(
    getFileLastModified(
      String.raw`C:\repos\x\daniellocatelli\src\lib\sitemap-lastmod.ts`,
    ),
    rel,
  );
  assert.equal(getFileLastModified("src/does/not/exist.md"), undefined);
});

test("contentFileToPathname maps content files to URLs", () => {
  assert.equal(
    contentFileToPathname("src/content/projects/en/portfolio-website.md"),
    "/projects/portfolio-website/",
  );
  assert.equal(
    contentFileToPathname("src/content/projects/pt/portfolio-website.md"),
    "/pt/projects/portfolio-website/",
  );
  assert.equal(
    contentFileToPathname("src/content/projects/en/_draft.md"),
    null,
  );
});
