import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getFileSlug,
  getEntrySlug,
  getEntryLocale,
  getLocale,
  getAlternateLocales,
  getDeckParentSlug,
} from "../../src/lib/routes-helpers";

// IMPORTANT: Astro 5's glob() loader collapses `pt/index.md` to id `pt`
// (using the directory name as the slug). The route helpers must recognize
// this so that locale homepage entries are correctly identified as "index"
// and not treated as page slugs. Regression: this caused /pt/ and /de/ to
// be hijacked by [...page].astro instead of [...locale]/index.astro.

test("getFileSlug: regular subpage entries", () => {
  assert.equal(getFileSlug("en/projects"), "projects");
  assert.equal(getFileSlug("pt/projects"), "projects");
  assert.equal(getFileSlug("de/projects"), "projects");
  assert.equal(getFileSlug("en/research"), "research");
  assert.equal(getFileSlug("pt/teaching"), "teaching");
});

test("getFileSlug: locale-only ids (index files normalized by glob loader)", () => {
  // pages/en/index.md → glob loader id is "en"
  assert.equal(getFileSlug("en"), "index");
  assert.equal(getFileSlug("pt"), "index");
  assert.equal(getFileSlug("de"), "index");
});

test("getFileSlug: strips .md and .mdx extensions", () => {
  assert.equal(getFileSlug("en/projects.md"), "projects");
  assert.equal(getFileSlug("en/projects.mdx"), "projects");
});

test("getFileSlug: handles ids without locale prefix", () => {
  assert.equal(getFileSlug("standalone"), "standalone");
});

test("getEntryLocale: extracts locale from prefixed ids", () => {
  assert.equal(getEntryLocale("en/projects"), "en");
  assert.equal(getEntryLocale("pt/projects"), "pt");
  assert.equal(getEntryLocale("de/projects"), "de");
});

test("getEntryLocale: locale-only ids return that locale (not default)", () => {
  // pages/pt/index.md → glob loader id is "pt".
  // Must return "pt", not the default "en".
  assert.equal(getEntryLocale("en"), "en");
  assert.equal(getEntryLocale("pt"), "pt");
  assert.equal(getEntryLocale("de"), "de");
});

test("getEntryLocale: unknown ids fall back to default locale", () => {
  assert.equal(getEntryLocale("standalone"), "en");
  assert.equal(getEntryLocale("xx/something"), "en");
});

test("getEntrySlug: combines collection name and slug", () => {
  assert.equal(
    getEntrySlug({ collection: "projects", id: "en/buildsystems-website" }),
    "projects/buildsystems-website",
  );
  assert.equal(
    getEntrySlug({ collection: "projects", id: "pt/buildsystems-website" }),
    "projects/buildsystems-website",
  );
});

test("getLocale: undefined params returns default locale", () => {
  assert.equal(getLocale({}), "en");
  assert.equal(getLocale({ locale: undefined }), "en");
});

test("getLocale: returns supported locale from params", () => {
  assert.equal(getLocale({ locale: "pt" }), "pt");
  assert.equal(getLocale({ locale: "de" }), "de");
  assert.equal(getLocale({ locale: "en" }), "en");
});

test("getLocale: unknown locale falls back to default", () => {
  assert.equal(getLocale({ locale: "fr" }), "en");
});

// Regression: the deck `en/glued-timber-plates-2026-08/deck` exists only in
// English, yet BaseHead defaulted hreflang to all SUPPORTED_LOCALES, so every
// page advertised /pt/ and /de/ alternates that 404. getAlternateLocales
// narrows the list to the locales an entry actually has.

test("getAlternateLocales: entry present in every locale", () => {
  const ids = [
    "en/adaptive-grasshopper-workshop",
    "pt/adaptive-grasshopper-workshop",
    "de/adaptive-grasshopper-workshop",
  ];
  assert.deepEqual(getAlternateLocales(ids, "adaptive-grasshopper-workshop"), [
    "en",
    "pt",
    "de",
  ]);
});

test("getAlternateLocales: entry present in one locale only", () => {
  const ids = [
    "en/a-decade-after-unemat",
    "pt/a-decade-after-unemat",
    "de/a-decade-after-unemat",
  ];
  assert.deepEqual(getAlternateLocales(ids, "english-only-entry"), []);
  assert.deepEqual(
    getAlternateLocales(
      [...ids, "en/english-only-entry"],
      "english-only-entry",
    ),
    ["en"],
  );
});

test("getAlternateLocales: result follows SUPPORTED_LOCALES order, not input order", () => {
  const ids = ["de/x", "en/x"];
  assert.deepEqual(getAlternateLocales(ids, "x"), ["en", "de"]);
});

test("getAlternateLocales: honours a custom slug extractor (decks)", () => {
  const deckIds = [
    "en/digital-futures-2026/deck",
    "pt/digital-futures-2026/deck",
    "de/digital-futures-2026/deck",
    "en/glued-timber-plates-2026-08/deck",
  ];
  assert.deepEqual(
    getAlternateLocales(
      deckIds,
      "glued-timber-plates-2026-08",
      getDeckParentSlug,
    ),
    ["en"],
  );
  assert.deepEqual(
    getAlternateLocales(deckIds, "digital-futures-2026", getDeckParentSlug),
    ["en", "pt", "de"],
  );
});
