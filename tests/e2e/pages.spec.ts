import { test, expect } from "@playwright/test";

test.describe("Category listing pages", () => {
  test("Projects page renders with subpage cards", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("main h1").first()).toContainText("Projects");
    const cards = page.locator("main article");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("project cards have images and links", async ({ page }) => {
    await page.goto("/projects");
    const firstCard = page.locator("main article").first();
    await expect(firstCard.locator("img")).toBeAttached();
    const link = firstCard.locator("a").first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/projects\//);
  });

  test("Research page renders with subpage cards", async ({ page }) => {
    await page.goto("/research");
    await expect(page.locator("main h1").first()).toContainText("Research");
    const cards = page.locator("main article");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("Teaching page renders with subpage cards", async ({ page }) => {
    await page.goto("/teaching");
    await expect(page.locator("main h1").first()).toContainText("Teaching");
    const cards = page.locator("main article");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("clicking a project card navigates to the subpage", async ({ page }) => {
    await page.goto("/projects");
    const firstLink = page.locator("main article a").first();
    const href = await firstLink.getAttribute("href");
    await firstLink.click();
    await page.waitForURL(`**${href}`);
    await expect(page.locator("main h1").first()).toBeVisible();
  });

  test("Portuguese projects page shows localized cards", async ({ page }) => {
    await page.goto("/pt/projects");
    await expect(page.locator("main h1").first()).toContainText("Projetos");
    const cards = page.locator("main article");
    expect(await cards.count()).toBeGreaterThan(0);
    const firstLink = page.locator("main article a").first();
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/pt\/projects\//);
  });
});
