import { test, expect } from "@playwright/test";

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
