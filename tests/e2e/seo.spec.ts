import { test, expect } from "@playwright/test";

test.describe("SEO and metadata", () => {
  test("homepage has title and meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Daniel Locatelli/);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /.+/);
  });

  test("homepage has Open Graph tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
  });

  test("subpage has correct title", async ({ page }) => {
    await page.goto("/projects/buildsystems-website");
    await expect(page).toHaveTitle(/BuildSystems Website/);
  });

  test("Portuguese page has lang=pt", async ({ page }) => {
    await page.goto("/pt/projects");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });

  test("German page has lang=de", async ({ page }) => {
    await page.goto("/de/projects");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });
});
