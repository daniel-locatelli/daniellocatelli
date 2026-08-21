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

  test("lightbox pinch gesture does not navigate to another image", async ({ page }) => {
    await page.goto(`/${KNOWN_SUBPAGE.slug}`);
    const lightbox = page.locator("#lightbox");
    const counter = page.locator("#lightbox-counter");
    await page.locator(".prose img").first().click();
    await expect(lightbox).not.toHaveClass(/hidden/);
    await expect(counter).toHaveText(/^1 \/ \d+$/);

    // Two-finger pinch-out: both fingers move apart, then lift one at a time.
    await page.evaluate(() => {
      const el = document.getElementById("lightbox")!;
      const touch = (id: number, x: number) =>
        new Touch({ identifier: id, target: el, clientX: x, clientY: 300 });
      const fire = (type: string, touches: Touch[], changed: Touch[]) =>
        el.dispatchEvent(
          new TouchEvent(type, { touches, changedTouches: changed, bubbles: true, cancelable: true }),
        );
      const a0 = touch(1, 180), b0 = touch(2, 220);
      fire("touchstart", [a0], [a0]);
      fire("touchstart", [a0, b0], [b0]);
      const a1 = touch(1, 60), b1 = touch(2, 340);
      fire("touchmove", [a1, b1], [a1, b1]);
      fire("touchend", [b1], [a1]);
      fire("touchend", [], [b1]);
    });
    await expect(counter).toHaveText(/^1 \/ \d+$/);
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

  for (const path of ["/research/agent-skills", "/projects/portfolio-website"]) {
    test(`lightbox renders SVG diagrams without intrinsic size on ${path}`, async ({ page }) => {
      // Vector diagrams only carry a viewBox, so the <img> has no intrinsic
      // size and would otherwise collapse to 0x0 inside the lightbox.
      await page.goto(path);
      await page.locator('.prose img[src$=".svg"]').first().click();
      await expect(page.locator("#lightbox")).not.toHaveClass(/hidden/);
      const box = await page.locator("#lightbox-img").boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(300);
      expect(box!.height).toBeGreaterThan(200);
    });
  }

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
