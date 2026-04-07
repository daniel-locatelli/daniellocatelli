import { test, expect } from "@playwright/test";
import { LOCALES, localeUrl } from "./fixtures/test-helpers";

// Each locale's homepage must be rendered by [...locale]/index.astro,
// NOT by [...locale]/[...page].astro. The wrong template still returns 200
// and has the right <html lang>, so we must assert on elements that ONLY
// the real homepage produces: hero chat (HeroChat React component) and
// the GeodesicDome <canvas>.
test.describe("Homepage", () => {
  for (const locale of LOCALES) {
    const url = localeUrl(locale);

    test(`${locale}: ${url} loads successfully`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
    });

    test(`${locale}: ${url} title is "Daniel Locatelli"`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveTitle(/Daniel Locatelli/);
    });

    test(`${locale}: ${url} renders the HeroChat input`, async ({ page }) => {
      await page.goto(url);
      await expect(
        page.locator("input[type='text'], textarea").first(),
      ).toBeVisible();
    });

    test(`${locale}: ${url} renders the GeodesicDome canvas`, async ({
      page,
    }) => {
      await page.goto(url);
      await expect(page.locator("main canvas")).toBeAttached();
    });

    test(`${locale}: ${url} renders 5 service cards`, async ({ page }) => {
      await page.goto(url);
      // The real homepage renders 5 service cards, each marked by a Phosphor
      // icon (ph:puzzle-piece, ph:cursor-click, ph:buildings, ph:chart-line-up,
      // ph:resize). The wrong [...page] template renders none of these.
      const serviceIcons = page.locator(
        "main [data-icon^='ph:puzzle-piece'], main [data-icon^='ph:cursor-click'], main [data-icon^='ph:buildings'], main [data-icon^='ph:chart-line-up'], main [data-icon^='ph:resize']",
      );
      expect(await serviceIcons.count()).toBe(5);
    });

    test(`${locale}: ${url} has contact buttons in main`, async ({ page }) => {
      await page.goto(url);
      // Both contact buttons sit inside #contact on the real homepage
      await expect(
        page.locator("main a[href*='wa.me']").first(),
      ).toBeAttached();
      await expect(
        page.locator("main a[href*='mailto:']").first(),
      ).toBeAttached();
    });
  }
});
