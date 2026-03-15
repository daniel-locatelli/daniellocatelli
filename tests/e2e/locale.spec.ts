import { test, expect } from "@playwright/test";
import { LOCALES, LOCALE_PATHS, PAGE_NAMES, localeUrl } from "./fixtures/test-helpers";

test.describe("Internationalization", () => {
  test("default locale is English with lang=en", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("Portuguese locale renders with lang=pt", async ({ page }) => {
    await page.goto("/pt");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });

  test("German locale renders with lang=de", async ({ page }) => {
    await page.goto("/de");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("language picker exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#language-picker")).toBeVisible();
    await expect(page.locator("#language-picker-button")).toBeVisible();
  });

  for (const locale of LOCALES) {
    test(`${locale}: Projects page has correct heading`, async ({ page }) => {
      await page.goto(localeUrl(locale, "/projects"));
      await expect(page.locator("main h1").first()).toContainText(PAGE_NAMES[locale].projects);
    });
  }

  test("language picker navigates from /projects to /pt/projects", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("#language-picker").hover();
    await page.locator("#language-picker-menu a", { hasText: "Português" }).click();
    await page.waitForURL("**/pt/projects");
    await expect(page.locator("main h1").first()).toContainText("Projetos");
  });

  test("language picker navigates from /pt/projects to /de/projects", async ({ page }) => {
    await page.goto("/pt/projects");
    await page.locator("#language-picker").hover();
    await page.locator("#language-picker-menu a", { hasText: "Deutsch" }).click();
    await page.waitForURL("**/de/projects");
    await expect(page.locator("main h1").first()).toContainText("Projekte");
  });
});
