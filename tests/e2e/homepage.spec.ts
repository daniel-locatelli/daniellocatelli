import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully with correct title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Daniel Locatelli/);
  });

  test("renders hero section with heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("renders chat input", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("input[type='text'], textarea").first()).toBeVisible();
  });

  test("renders canvas for 3D component", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toBeAttached();
  });

  test("has contact links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[href*='wa.me']").first()).toBeAttached();
    await expect(page.locator("a[href*='mailto:']").first()).toBeAttached();
  });
});
