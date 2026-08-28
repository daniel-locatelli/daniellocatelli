import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizePath,
  fileToUrlPath,
  buildTargetSet,
  buildTargetMap,
  parseRedirects,
  buildRedirectMap,
  followRedirects,
} from "../../src/lib/link-check/paths";

test("normalizePath: strips trailing slash except at root", () => {
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath("/projects/"), "/projects");
  assert.equal(normalizePath("/projects"), "/projects");
  assert.equal(normalizePath("/de/cv/"), "/de/cv");
});

test("normalizePath: strips query and collapses duplicate slashes", () => {
  assert.equal(normalizePath("/projects?utm=x"), "/projects");
  assert.equal(normalizePath("//projects//foo/"), "/projects/foo");
});

test("normalizePath: decodes percent-encoding", () => {
  assert.equal(normalizePath("/projects/a%20b"), "/projects/a b");
});

test("normalizePath: leaves a bare fragment-free relative value alone", () => {
  assert.equal(normalizePath("/foo.pdf"), "/foo.pdf");
});

test("fileToUrlPath: index.html files become directory paths", () => {
  assert.equal(fileToUrlPath("index.html"), "/");
  assert.equal(fileToUrlPath("projects/index.html"), "/projects");
  assert.equal(fileToUrlPath("de/cv/index.html"), "/de/cv");
});

test("fileToUrlPath: non-html assets keep their filename", () => {
  assert.equal(fileToUrlPath("documents/cv.pdf"), "/documents/cv.pdf");
  assert.equal(fileToUrlPath("favicon.ico"), "/favicon.ico");
});

test("fileToUrlPath: normalizes windows separators", () => {
  assert.equal(fileToUrlPath("de\\cv\\index.html"), "/de/cv");
});

test("buildTargetSet: contains every emitted path", () => {
  const set = buildTargetSet([
    "index.html",
    "projects/index.html",
    "documents/cv.pdf",
  ]);
  assert.ok(set.has("/"));
  assert.ok(set.has("/projects"));
  assert.ok(set.has("/documents/cv.pdf"));
  assert.equal(set.has("/missing"), false);
});

test("buildTargetMap: maps each served path to the file that serves it", () => {
  const map = buildTargetMap([
    "index.html",
    "projects/index.html",
    "documents/cv.pdf",
  ]);
  assert.equal(map.get("/"), "index.html");
  assert.equal(map.get("/projects"), "projects/index.html");
  assert.equal(map.get("/documents/cv.pdf"), "documents/cv.pdf");
  assert.equal(map.get("/missing"), undefined);
});

test("buildTargetMap: exposes non-HTML targets as non-HTML", () => {
  const map = buildTargetMap(["documents/cv.pdf", "research/index.html"]);
  assert.equal(map.get("/documents/cv.pdf")?.endsWith(".html"), false);
  assert.equal(map.get("/research")?.endsWith(".html"), true);
});

test("parseRedirects: parses the three-column astro format", () => {
  const text = [
    "/strategies/                    https://archcompute.com/en/strategies    301",
    "/research/old/                  /research/new                            301",
    "",
    "# a comment line",
  ].join("\n");
  const rules = parseRedirects(text);
  assert.equal(rules.length, 2);
  assert.deepEqual(rules[0], {
    from: "/strategies",
    to: "https://archcompute.com/en/strategies",
    status: 301,
  });
  assert.deepEqual(rules[1], {
    from: "/research/old",
    to: "/research/new",
    status: 301,
  });
});

test("parseRedirects: ignores malformed lines", () => {
  const rules = parseRedirects("/only-two-fields   /target\ngarbage\n");
  assert.equal(rules.length, 0);
});

test("buildRedirectMap: keys by normalized from-path", () => {
  const map = buildRedirectMap(
    parseRedirects("/research/old/   /research/new   301"),
  );
  assert.equal(map.get("/research/old")?.to, "/research/new");
  assert.equal(map.has("/research/old/"), false);
});

test("followRedirects: a path with no rule is returned unchanged", () => {
  const map = buildRedirectMap([]);
  assert.deepEqual(followRedirects("/projects", map), {
    path: "/projects",
    external: false,
    looped: false,
  });
});

test("followRedirects: resolves the real dokwood rename in one hop", () => {
  const map = buildRedirectMap(
    parseRedirects(
      "/research/dokwood-bsdd-data-dictionary/   /research/timber-buildup-data-model   301",
    ),
  );
  assert.deepEqual(
    followRedirects("/research/dokwood-bsdd-data-dictionary", map),
    {
      path: "/research/timber-buildup-data-model",
      external: false,
      looped: false,
    },
  );
});

test("followRedirects: an off-site target is reported as external", () => {
  const map = buildRedirectMap(
    parseRedirects(
      "/strategies/   https://archcompute.com/en/strategies   301",
    ),
  );
  assert.deepEqual(followRedirects("/strategies", map), {
    path: null,
    external: true,
    looped: false,
  });
});

test("followRedirects: a two-hop chain resolves to its final target", () => {
  const map = buildRedirectMap(
    parseRedirects(["/a   /b   301", "/b   /c   301"].join("\n")),
  );
  assert.equal(followRedirects("/a", map).path, "/c");
});

test("followRedirects: a cycle is reported as looped, not an infinite loop", () => {
  const map = buildRedirectMap(
    parseRedirects(["/a   /b   301", "/b   /a   301"].join("\n")),
  );
  const result = followRedirects("/a", map);
  assert.equal(result.looped, true);
  assert.equal(result.path, null);
});

test("followRedirects: a chain longer than maxHops is reported as looped", () => {
  const map = buildRedirectMap(
    parseRedirects(
      ["/a   /b   301", "/b   /c   301", "/c   /d   301"].join("\n"),
    ),
  );
  assert.equal(followRedirects("/a", map, 2).looped, true);
});
