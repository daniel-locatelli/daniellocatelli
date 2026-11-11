import { test } from "node:test";
import assert from "node:assert/strict";
import {
  searchContent,
  getPage,
  getProfile,
  parseProfile,
} from "../../src/lib/mcp/tools";

const PROFILE = `# Daniel Locatelli: profile

## About me

I am a doctoral researcher in Zürich.

## Work experience

### Research Associate
Munich University of Applied Sciences | Munich, Germany | February 2025 – June 2026 | https://hm.edu/
- Research associate on the [DOKwood](/projects/dokwood) project.
- Revit plugin (C#/.NET) importing DOKwood buildups.

## Projects

### DOKwood
Software Development | Munich University of Applied Sciences | February 2025 | /projects/dokwood
Tags: Timber construction, BIM
A web platform for multilayer timber buildups.

### Geodesic Domes
Research | Daniel Locatelli | 2019 | /pt/projects/geodesic-domes
Tags: Geometry
Domes built from triangles.

## Teaching, workshops and talks

### Working with Geographic Data in Grasshopper
Workshop | Munich University of Applied Sciences | May 2025 | /teaching/geodata
Tags: Grasshopper
A one-day workshop.

## Timeline (most recent first)

February 2025 – June 2026 | [Work] | Research Associate | Munich University of Applied Sciences
`;

test("parseProfile: one entry per ### heading, section-only entries, no timeline", () => {
  const entries = parseProfile(PROFILE);
  assert.deepEqual(
    entries.map((e) => [e.section, e.title]),
    [
      ["About me", "About me"],
      ["Work experience", "Research Associate"],
      ["Projects", "DOKwood"],
      ["Projects", "Geodesic Domes"],
      ["Teaching, workshops and talks", "Working with Geographic Data in Grasshopper"],
    ],
  );
  assert.equal(entries[1].link, "https://hm.edu/");
  assert.equal(entries[2].link, "/projects/dokwood");
});

test("searchContent: title matches outrank body matches", () => {
  const out = searchContent({ query: "DOKwood" }, { profile: PROFILE });
  assert.equal(out[0].title, "DOKwood");
  assert.ok(out[0].score > 0.5);
  assert.equal(out[0].url, "https://daniellocatelli.com/projects/dokwood");
  assert.equal(out[1].title, "Research Associate");
  assert.ok(out[1].score < out[0].score);
});

test("searchContent: CV entries point at the localized CV page", () => {
  const out = searchContent(
    { query: "Revit plugin", locale: "de" },
    { profile: PROFILE },
  );
  assert.equal(out[0].title, "Research Associate");
  assert.equal(out[0].url, "https://daniellocatelli.com/de/full-cv");
});

test("searchContent: folds plurals, diacritics and case; skips stopwords", () => {
  assert.equal(
    searchContent({ query: "what about DOMES?" }, { profile: PROFILE })[0].title,
    "Geodesic Domes",
  );
  assert.equal(
    searchContent({ query: "zurich" }, { profile: PROFILE })[0].title,
    "About me",
  );
  assert.deepEqual(searchContent({ query: "what is the" }, { profile: PROFILE }), []);
});

test("searchContent: matches at word starts only", () => {
  // "ild" occurs inside "build" and "Geodesic" but never at a word start.
  assert.deepEqual(searchContent({ query: "ild" }, { profile: PROFILE }), []);
});

test("searchContent: clamps limit to 1..20", () => {
  assert.equal(searchContent({ query: "munich", limit: 1 }, { profile: PROFILE }).length, 1);
  assert.equal(searchContent({ query: "munich", limit: 0 }, { profile: PROFILE }).length, 1);
  assert.equal(searchContent({ query: "munich", limit: 99 }, { profile: PROFILE }).length, 3);
});

test("getProfile: returns the locale's profile, English by default", () => {
  const profiles = { en: "EN", pt: "PT", de: "DE" };
  assert.deepEqual(getProfile({ locale: "pt" }, { profiles }), { locale: "pt", markdown: "PT" });
  assert.deepEqual(getProfile({ locale: "fr" as any }, { profiles }), { locale: "en", markdown: "EN" });
});

test("getPage: fetches the .md companion and returns its body", async () => {
  const fakeFetch: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    assert.equal(url, "https://daniellocatelli.com/projects/foo.md");
    return new Response("# Foo\n\nBody.", {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  };
  const out = await getPage(
    { url: "https://daniellocatelli.com/projects/foo" },
    { fetch: fakeFetch },
  );
  assert.equal(out.url, "https://daniellocatelli.com/projects/foo.md");
  assert.ok(out.markdown.startsWith("# Foo"));
});

test("getPage: rejects URLs not on daniellocatelli.com", async () => {
  await assert.rejects(
    getPage({ url: "https://evil.example.com/foo" }, { fetch }),
    /not on this site/i,
  );
});

test("getPage: appends .md when URL does not already end in .md", async () => {
  let calledUrl = "";
  const fakeFetch: typeof fetch = async (input) => {
    calledUrl = typeof input === "string" ? input : (input as URL).toString();
    return new Response("ok", { status: 200, headers: { "Content-Type": "text/markdown" } });
  };
  await getPage(
    { url: "https://daniellocatelli.com/projects/foo/" },
    { fetch: fakeFetch },
  );
  assert.equal(calledUrl, "https://daniellocatelli.com/projects/foo.md");
});
