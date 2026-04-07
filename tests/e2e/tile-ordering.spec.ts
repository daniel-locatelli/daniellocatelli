import { test, expect } from "@playwright/test";

test.describe("Tile ordering on listing pages", () => {
  test("desktop viewport places newest items in top row (3 cols)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/grid-cols-3/);
    await expect(container).toHaveClass(/\bgrid\b/);

    const wrappers = container.locator("> div");
    await expect(wrappers).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const firstCard = wrappers.nth(i).locator("article").first();
      await expect(firstCard).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("tablet viewport places newest items in top row (2 cols)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/grid-cols-2/);
    await expect(container).toHaveClass(/\bgrid\b/);

    const wrappers = container.locator("> div");
    await expect(wrappers).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      const firstCard = wrappers.nth(i).locator("article").first();
      await expect(firstCard).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("mobile viewport keeps flat chronological order (1 col)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/flex-col/);
    await expect(container).not.toHaveClass(/grid-cols/);

    const articles = container.locator("> article");
    await expect(articles.first()).toBeVisible();
    const count = await articles.count();

    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toHaveAttribute(
        "data-chron-index",
        String(i),
      );
    }
  });

  test("resizing desktop → mobile re-lays without reload", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toHaveClass(/grid-cols-3/);
    await expect(container).toHaveClass(/\bgrid\b/);

    await page.setViewportSize({ width: 400, height: 800 });
    await expect(container).toHaveClass(/flex-col/);
    await expect(container).not.toHaveClass(/grid-cols/);
    await expect(container.locator("> div")).toHaveCount(0);
  });

  test("resizing mobile → desktop re-lays without reload", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto("/projects");

    const container = page.locator("[data-subpage-container]");
    await expect(container).toHaveClass(/flex-col/);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(container).toHaveClass(/grid-cols-3/);
    await expect(container).toHaveClass(/\bgrid\b/);
  });
});
