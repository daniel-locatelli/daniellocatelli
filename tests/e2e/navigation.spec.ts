import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header is visible with logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#main-header")).toBeVisible();
    await expect(page.locator("#main-header a").first()).toHaveAttribute("href", "/");
  });

  test("nav links render for projects, research, teaching", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#navigation-menu");
    await expect(nav.locator("a[href='/projects']")).toBeAttached();
    await expect(nav.locator("a[href='/research']")).toBeAttached();
    await expect(nav.locator("a[href='/teaching']")).toBeAttached();
  });

  test("clicking Projects navigates to /projects", async ({ page }) => {
    await page.goto("/");
    await page.locator("#navigation-menu a[href='/projects']").click();
    await page.waitForURL("**/projects");
    await expect(page.locator("main h1").first()).toContainText("Projects");
  });

  test("clicking Research navigates to /research", async ({ page }) => {
    await page.goto("/");
    await page.locator("#navigation-menu a[href='/research']").click();
    await page.waitForURL("**/research");
    await expect(page.locator("main h1").first()).toContainText("Research");
  });

  test("clicking Teaching navigates to /teaching", async ({ page }) => {
    await page.goto("/");
    await page.locator("#navigation-menu a[href='/teaching']").click();
    await page.waitForURL("**/teaching");
    await expect(page.locator("main h1").first()).toContainText("Teaching");
  });

  test("logo navigates back to homepage", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("#main-header a").first().click();
    await page.waitForURL("/");
  });

  test("mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menuButton = page.locator("#toggle-navigation-menu");
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("nav links have prefetch attribute", async ({ page }) => {
    await page.goto("/");
    const navLinks = page.locator("#navigation-menu a[data-astro-prefetch]");
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
