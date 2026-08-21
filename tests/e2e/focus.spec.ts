import { test, expect, type Page } from "@playwright/test";

/**
 * Keyboard focus on listing-grid cards (projects / research / teaching).
 * The card <article> wraps a full-size <a> with overflow-hidden, which clips
 * the UA focus outline, so the article must draw its own ring and mirror the
 * hover state while the link has keyboard focus.
 */

const CARD_LINK = "[data-subpage-container] article a";

/** Press Tab until a listing card link is focused. Bounded so a regression
 *  fails fast instead of hanging. */
async function tabToFirstCard(page: Page): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const onCard = await page.evaluate((sel) => {
      const el = document.activeElement;
      return el instanceof HTMLAnchorElement && el.matches(sel);
    }, CARD_LINK);
    if (onCard) return;
  }
  throw new Error("Tab never reached a listing card link");
}

test.describe("Keyboard focus on listing cards", () => {
  test("desktop: focused card shows a ring and reveals the title overlay", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");
    await expect(page.locator("[data-subpage-container]")).toBeVisible();

    await tabToFirstCard(page);

    const focusedLink = page.locator(`${CARD_LINK}:focus`);
    await expect(focusedLink).toHaveCount(1);
    const article = focusedLink.locator("xpath=ancestor::article[1]");

    // Ring is a box-shadow on the article itself (not clipped by overflow-hidden).
    await expect(article).not.toHaveCSS("box-shadow", "none");

    // Desktop hover overlay (hidden lg:flex, opacity-0 at rest) becomes opaque.
    const overlay = article.locator("div.lg\\:flex");
    await expect(overlay).toHaveCSS("opacity", "1");
  });

  test("mobile: focused card shows a ring and highlights the title", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects");
    await expect(page.locator("[data-subpage-container]")).toBeVisible();

    // On mobile the visible title is the one inside the lg:hidden text block;
    // the overlay h2 is display:none so its computed colour is irrelevant.
    const restingColor = await page
      .locator("[data-subpage-container] article div.lg\\:hidden h2")
      .first()
      .evaluate((el) => getComputedStyle(el).color);

    await tabToFirstCard(page);

    const focusedLink = page.locator(`${CARD_LINK}:focus`);
    await expect(focusedLink).toHaveCount(1);
    const article = focusedLink.locator("xpath=ancestor::article[1]");
    await expect(article).not.toHaveCSS("box-shadow", "none");

    const title = article.locator("div.lg\\:hidden h2");
    await expect
      .poll(async () => title.evaluate((el) => getComputedStyle(el).color))
      .not.toBe(restingColor);
  });

  test("mouse hover alone does not draw the focus ring", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");
    const article = page.locator("[data-subpage-container] article").first();
    await expect(article).toBeVisible();

    await article.hover();
    // hover:shadow-2xl is present but no ring colour: Tailwind's ring uses
    // the --tw-ring-color, which stays transparent/unset without focus.
    const ringColor = await article.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--tw-ring-color").trim(),
    );
    expect(ringColor).toBe("");
  });
});
