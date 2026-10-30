import { test, expect } from "@playwright/test";
import { LOCALES, localeUrl } from "./fixtures/test-helpers";

const SUGGESTIONS: Record<string, string[]> = {
  en: ["What is your PhD about?", "Skills or plugins?", "What did you build before?"],
  pt: ["Sobre o que é seu doutorado?", "Skills ou plugins?", "O que você construiu antes?"],
  de: ["Worum geht es in deiner Promotion?", "Skills oder Plugins?", "Was hast du vorher gebaut?"],
};

// Each locale's homepage must be rendered by [...locale]/index.astro, not by
// [...locale]/[...page].astro. The wrong template still returns 200 with the
// right <html lang>, so assert on what only the real homepage renders: the
// h1 name, the chat input and its starter questions.
test.describe("Homepage", () => {
  for (const locale of LOCALES) {
    const url = localeUrl(locale);

    test(`${locale}: ${url} loads with the name as h1`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Daniel Locatelli/);
      await expect(page.locator("main h1")).toHaveText("Daniel Locatelli");
    });

    test(`${locale}: ${url} renders the chat input and starter questions`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("#hero-chat-input")).toBeVisible();
      for (const question of SUGGESTIONS[locale]) {
        await expect(page.getByRole("button", { name: question })).toBeVisible();
      }
    });

    test(`${locale}: ${url} has no old portfolio sections`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("main canvas")).toHaveCount(0);
      await expect(page.locator("#services, #testimonials, #expertise, #contact")).toHaveCount(0);
    });

    test(`${locale}: ${url} lists no draft essays`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("main a[href*='/essays/_']")).toHaveCount(0);
    });

    test(`${locale}: ${url} does not scroll sideways on a phone`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("a starter question opens the chat and shows the answer", async ({ page }) => {
    await page.route("**/api/ai", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ answer: "Mocked answer about the PhD." }),
      }),
    );
    await page.goto("/");
    // The chips are server-rendered; a click before React hydrates does nothing.
    await page.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
    await page.getByRole("button", { name: "What is your PhD about?" }).click();
    await expect(page.getByText("Mocked answer about the PhD.")).toBeVisible();
  });
});
