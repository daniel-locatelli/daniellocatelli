import { test, expect } from "@playwright/test";

test.describe("Error pages", () => {
  test("404 page renders for nonexistent route", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-xyz");
    expect(response?.status()).toBe(404);
  });
});
