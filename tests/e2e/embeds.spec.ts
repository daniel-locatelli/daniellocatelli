import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression guard for third-party embeds under the production CSP.
 *
 * The dev server never applies `public/_headers`, so a plain page visit can
 * not catch a Content-Security-Policy that blocks an iframe (that is exactly
 * how the YouTube embeds silently broke after the 2026-08-21 hardening).
 * These tests read the real CSP from `public/_headers`, attach it to the
 * document response, and let Chromium enforce it for real.
 */

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";
const PAGE_WITH_YOUTUBE =
  "/projects/air-guitar-by-atelier-marko-brajovic-for-nike";

function productionCsp(): string {
  const raw = readFileSync(resolve("public/_headers"), "utf8");
  const match = raw.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  if (!match)
    throw new Error("No Content-Security-Policy found in public/_headers");
  return match[1].trim();
}

async function applyProductionCsp(page: Page, csp: string) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    // fallback() hands non-document requests to the other route handlers.
    if (request.resourceType() !== "document") return route.fallback();
    if (!request.url().startsWith("http://localhost")) return route.fallback();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
}

/** Stub YouTube so the test proves the CSP allows framing, not that YouTube is up. */
async function stubYouTube(page: Page) {
  await page.route(`${YOUTUBE_ORIGIN}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body><p id='stub'>youtube stub</p></body></html>",
    }),
  );
}

test.describe("Embeds under the production Content-Security-Policy", () => {
  test("YouTube iframe loads on a project page", async ({ page }) => {
    const csp = productionCsp();
    const blocked: string[] = [];
    page.on("console", (msg) => {
      if (/refused to frame/i.test(msg.text())) blocked.push(msg.text());
    });

    await stubYouTube(page);
    await applyProductionCsp(page, csp);
    await page.goto(PAGE_WITH_YOUTUBE);

    const iframe = page
      .locator(`iframe[src^="${YOUTUBE_ORIGIN}/embed/"]`)
      .first();
    await expect(iframe).toBeAttached();
    await iframe.scrollIntoViewIfNeeded(); // iframes are loading="lazy"

    // A CSP-blocked frame stays at chrome-error://chromewebdata/ and never
    // renders the stub document.
    const stub = iframe.contentFrame().locator("#stub");
    await expect(stub, "iframe rendered the YouTube document").toHaveText(
      "youtube stub",
    );

    expect(blocked, `CSP blocked the embed:\n${blocked.join("\n")}`).toEqual(
      [],
    );
  });
});
