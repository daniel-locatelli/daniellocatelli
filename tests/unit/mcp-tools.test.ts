import { test } from "node:test";
import assert from "node:assert/strict";
import { searchContent, getPage } from "../../src/lib/mcp/tools";

test("searchContent: returns matches from vector-search endpoint", async () => {
  const fakeFetch: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    assert.match(url, /functions\/v1\/vector-search$/);
    const body = JSON.parse(String((init as RequestInit).body));
    assert.equal(body.query, "domes");
    assert.equal(body.match_count, 3);
    return new Response(
      JSON.stringify({
        documents: [
          { id: 1, title: "Geodesic Domes", url: "https://daniellocatelli.com/projects/geodesic", content: "snippet", similarity: 0.91 },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const out = await searchContent(
    { query: "domes", limit: 3, locale: "en" },
    {
      env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "anon" } as any,
      fetch: fakeFetch,
    },
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].title, "Geodesic Domes");
  assert.equal(out[0].url, "https://daniellocatelli.com/projects/geodesic");
});

test("searchContent: throws on non-200 response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response("nope", { status: 500 });
  await assert.rejects(
    searchContent(
      { query: "x", limit: 5, locale: "en" },
      { env: { SUPABASE_URL: "u", SUPABASE_ANON_KEY: "k" } as any, fetch: fakeFetch },
    ),
    /vector-search failed/,
  );
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
