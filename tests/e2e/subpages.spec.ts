import { test, expect } from "@playwright/test";
import { KNOWN_SUBPAGE, localeUrl } from "./fixtures/test-helpers";

test.describe("Subpages", () => {
  test("subpage loads with correct title", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator("main h1").first()).toContainText(KNOWN_SUBPAGE.title);
  });

  test("hero image renders", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator(".hero-image")).toBeVisible();
    await expect(page.locator(".hero-image img").first()).toBeAttached();
  });

  test("scroll chevron visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator(".scroll-chevron")).toBeAttached();
  });

  test("scroll chevron hidden on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator(".scroll-chevron")).toBeHidden();
  });

  test("metadata table renders", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator("main table")).toBeVisible();
  });

  test("prose content renders", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    const prose = page.locator(".prose");
    await expect(prose).toBeVisible();
    const text = await prose.textContent();
    expect(text?.length).toBeGreaterThan(100);
  });

  test("Video component renders video element", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator("main video").first()).toBeAttached();
    await expect(page.locator("main video source").first()).toHaveAttribute("src", /\.mp4$/);
  });

  test("images have figcaptions", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    const figures = page.locator(".prose figure");
    expect(await figures.count()).toBeGreaterThan(0);
    await expect(figures.first().locator("figcaption")).toBeVisible();
  });

  test("lightbox opens on image click", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    const lightbox = page.locator("#lightbox");
    await expect(lightbox).toHaveClass(/hidden/);
    const proseImg = page.locator(".prose img").first();
    await proseImg.click();
    await expect(lightbox).not.toHaveClass(/hidden/);
  });

  test("lightbox closes on Escape", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await page.locator(".prose img").first().click();
    await expect(page.locator("#lightbox")).not.toHaveClass(/hidden/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#lightbox")).toHaveClass(/hidden/);
  });

  test("lightbox image click toggles zoom", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    const lightbox = page.locator("#lightbox");
    const lightboxImg = page.locator("#lightbox-img");

    await page.locator(".prose img").first().click();
    await expect(lightbox).not.toHaveClass(/hidden/);
    await expect(lightbox).toHaveAttribute("data-zoomed", "false");

    // Wait for the upgraded image to load so naturalWidth is available.
    await page.waitForFunction(() => {
      const img = document.getElementById("lightbox-img") as HTMLImageElement | null;
      return !!img && img.complete && img.naturalWidth > 0;
    });

    // Only large-enough images toggle to zoomed; KNOWN_SUBPAGE has full-bleed
    // body images that always exceed 90vw of the test viewport.
    await lightboxImg.click();
    await expect(lightbox).toHaveAttribute("data-zoomed", "true");

    await lightboxImg.click();
    await expect(lightbox).toHaveAttribute("data-zoomed", "false");
  });

  test("Portuguese subpage renders", async ({ page }) => {
    await page.goto(localeUrl("pt", `/${KNOWN_SUBPAGE.slug}`));
    await expect(page.locator("main h1").first()).toContainText(KNOWN_SUBPAGE.title);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });

  test("language picker works on subpage", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    await page.locator("#language-picker").hover();
    await page.locator("#language-picker-menu a", { hasText: "Deutsch" }).click();
    await page.waitForURL(`**/de/${KNOWN_SUBPAGE.slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });
});
