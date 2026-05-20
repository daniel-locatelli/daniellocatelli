import { test, expect } from "@playwright/test";

test.describe("Agent readiness — llms.txt (English)", () => {
  test("/llms.txt returns text/plain with portfolio sections", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
    const body = await res.text();
    expect(body).toMatch(/^# Daniel Locatelli\n/);
    expect(body).toContain("\n## Projects\n");
    expect(body).toContain("\n## Research\n");
    expect(body).toContain("\n## Teaching\n");
    expect(body).toContain("\n## Publications\n");
    expect(body).toContain("https://daniellocatelli.com/projects/");
  });
});

test.describe("Agent readiness — discoverability", () => {
  test("robots.txt advertises sitemap and welcomes AI crawlers", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sitemap: https://daniellocatelli.com/sitemap-index.xml");
    expect(body).toContain("Content-Signal:");
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"]) {
      expect(body, `expected User-agent: ${bot}`).toContain(`User-agent: ${bot}`);
    }
  });

  test("root response includes Link header pointing at sitemap", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const link = res.headers()["link"];
    expect(link, "Link header present").toBeDefined();
    expect(link).toContain("</sitemap-index.xml>");
    expect(link).toContain(`rel="sitemap"`);
  });

  test("root response includes X-Robots-Tag", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-robots-tag"]).toBe("all");
  });
});

test.describe("Agent readiness — llms.txt (locales)", () => {
  for (const locale of ["pt", "de"]) {
    test(`/${locale}/llms.txt returns localized content`, async ({ request }) => {
      const res = await request.get(`/${locale}/llms.txt`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
      const body = await res.text();
      expect(body).toMatch(/^# Daniel Locatelli\n/);
      expect(body).toContain(`https://daniellocatelli.com/${locale}/projects/`);
    });
  }
});

test.describe("Agent readiness — markdown variants", () => {
  test("project page is reachable at .md and returns text/markdown", async ({ request }) => {
    const res = await request.get("/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body).toContain("# ");
    expect(body).toContain("BuildSystems");
  });

  test("portuguese project .md is reachable", async ({ request }) => {
    const res = await request.get("/pt/projects/buildsystems-website.md");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^text\/markdown/);
  });
});
