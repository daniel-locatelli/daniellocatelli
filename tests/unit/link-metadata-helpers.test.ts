import { test } from "node:test";
import assert from "node:assert/strict";
import { generateLinkKey } from "../../src/lib/link-metadata-helpers";

test("generateLinkKey: hostname prefix + 8-char sha", () => {
  const key = generateLinkKey("https://art-engineering.net/en/projekt/canyon/");
  // hostname stub + dash + 8 hex chars
  assert.match(key, /^art-engineering-net-[0-9a-f]{8}$/);
});

test("generateLinkKey: strips www.", () => {
  const key = generateLinkKey("https://www.example.com/foo");
  assert.match(key, /^example-com-[0-9a-f]{8}$/);
});

test("generateLinkKey: replaces dots in hostname", () => {
  const key = generateLinkKey("https://docs.astro.build/en/");
  assert.match(key, /^docs-astro-build-[0-9a-f]{8}$/);
});

test("generateLinkKey: deterministic for the same URL", () => {
  const a = generateLinkKey("https://example.com/x?a=1");
  const b = generateLinkKey("https://example.com/x?a=1");
  assert.equal(a, b);
});

test("generateLinkKey: differs for distinct URLs that would collide under the old scheme", () => {
  // Under archcompute's dots-to-hyphens scheme, "a.b.com" and "a-b.com" collide.
  const a = generateLinkKey("https://a.b.com/");
  const b = generateLinkKey("https://a-b.com/");
  assert.notEqual(a, b);
});

test("generateLinkKey: produces filenames under 80 chars even for deep URLs", () => {
  const key = generateLinkKey(
    "https://very-long-hostname.example.com/" +
      "really/deep/path/with/many/segments?utm_source=foo&utm_medium=bar"
  );
  assert.ok(key.length < 80);
});

test("generateLinkKey: throws on invalid URL", () => {
  assert.throws(() => generateLinkKey("not a url"));
});

test("generateLinkKey: case-insensitive hostname produces same key", () => {
  const upper = generateLinkKey("https://DOCS.ASTRO.BUILD/en/");
  const lower = generateLinkKey("https://docs.astro.build/en/");
  assert.equal(upper, lower);
});
