import { test, expect, type Locator, type Page } from "@playwright/test";

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

/** Tailwind's ring colour variable. It is set on the article only while the
 *  `has-[a:focus-visible]:ring-*` variant applies, so a non-empty value proves
 *  the focus-visible predicate matched and an empty one proves it did not. */
function ringColor(article: Locator): Promise<string> {
  return article.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--tw-ring-color").trim(),
  );
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

    // The ring predicate matched and the ring (a box-shadow on the article
    // itself, so not clipped by overflow-hidden) is painted.
    await expect.poll(() => ringColor(article)).not.toBe("");
    await expect(article).not.toHaveCSS("box-shadow", "none");

    // Desktop hover overlay (hidden lg:flex, opacity-0 at rest) becomes opaque.
    const overlay = article.locator("div.lg\\:flex");
    await expect(overlay).toHaveCSS("opacity", "1");
  });

  test("narrow viewport: focused card shows a ring and highlights the title", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects");
    await expect(page.locator("[data-subpage-container]")).toBeVisible();

    // Below lg the visible title is the one inside the lg:hidden text block;
    // the overlay h2 is display:none so its computed colour is irrelevant.
    const restingColor = await page
      .locator("[data-subpage-container] article div.lg\\:hidden h2")
      .first()
      .evaluate((el) => getComputedStyle(el).color);

    await tabToFirstCard(page);

    const focusedLink = page.locator(`${CARD_LINK}:focus`);
    await expect(focusedLink).toHaveCount(1);
    const article = focusedLink.locator("xpath=ancestor::article[1]");
    await expect.poll(() => ringColor(article)).not.toBe("");
    await expect(article).not.toHaveCSS("box-shadow", "none");

    const title = article.locator("div.lg\\:hidden h2");
    await expect
      .poll(async () => title.evaluate((el) => getComputedStyle(el).color))
      .not.toBe(restingColor);
  });

  test("mouse press focuses the link without drawing the focus ring", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");
    const link = page.locator(CARD_LINK).first();
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    if (!box) throw new Error("card link has no bounding box");

    // Press without releasing: Chromium focuses the anchor on mousedown, and
    // not releasing avoids navigating away.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Guard that the test exercised mouse focus at all.
    await expect(link).toBeFocused();

    // Mouse focus is :focus but not :focus-visible, so the
    // has-[a:focus-visible] ring predicate must not match.
    const article = link.locator("xpath=ancestor::article[1]");
    await expect.poll(() => ringColor(article)).toBe("");
    await page.mouse.up();
  });
});
