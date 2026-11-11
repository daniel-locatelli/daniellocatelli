import { test, expect } from "@playwright/test";
import { LOCALES, localeUrl } from "./fixtures/test-helpers";

const SUGGESTIONS: Record<string, string[]> = {
  en: ["What is your PhD about?", "AI agent skills for architecture?", "What did you build before?"],
  pt: ["Sobre o que é seu doutorado?", "Quais skills de agentes de IA você já criou?", "Em quais projetos você já trabalhou?"],
  de: ["Worum geht es in deiner Promotion?", "KI-Agent-Skills für Architektur?", "Was hast du vorher gebaut?"],
};

// Each locale's homepage must be rendered by [...locale]/index.astro, not by
// [...locale]/[...page].astro. The wrong template still returns 200 with the
// right <html lang>, so assert on what only the real homepage renders: the
// h1 name, the chat input and its starter questions.
test.describe("Homepage", () => {
  for (const locale of LOCALES) {
    const url = localeUrl(locale);

    test(`${locale}: ${url} loads with the name as h1`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Daniel Locatelli/);
      await expect(page.locator("main h1")).toHaveText("Daniel Locatelli");
    });

    test(`${locale}: ${url} renders the chat input and starter questions`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("#hero-chat-input")).toBeVisible();
      for (const question of SUGGESTIONS[locale]) {
        await expect(page.getByRole("button", { name: question })).toBeVisible();
      }
    });

    test(`${locale}: ${url} has no old portfolio sections`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("main canvas")).toHaveCount(0);
      await expect(page.locator("#services, #testimonials, #expertise, #contact")).toHaveCount(0);
    });

    test(`${locale}: ${url} lists no draft essays`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("main a[href*='/essays/_']")).toHaveCount(0);
    });

    test(`${locale}: ${url} does not scroll sideways on a phone`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("a starter question opens the chat and shows the answer", async ({ page }) => {
    await page.route("**/api/ai", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ answer: "Mocked answer about the PhD." }),
      }),
    );
    await page.goto("/");
    // The chips are server-rendered; a click before React hydrates does nothing.
    await page.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
    await page.getByRole("button", { name: "What is your PhD about?" }).click();
    await expect(page.getByText("Mocked answer about the PhD.")).toBeVisible();
    // No greeting opens the conversation; the disclaimer follows the answer.
    await expect(page.getByText("Ask me anything")).toHaveCount(0);
    await expect(page.locator("p", { hasText: "may contain mistakes" })).toBeVisible();
  });

  test("the answer's large image expands, its caption and the cards link", async ({ page }) => {
    await page.route("**/api/ai", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          answer:
            "See [Agent skills](/research/agent-skills) and [this site](/projects/portfolio-website).",
        }),
      }),
    );
    await page.goto("/");
    await page.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
    await page.getByRole("button", { name: "What is your PhD about?" }).click();

    const figure = page.locator("figure", { has: page.locator("figcaption") });
    const enlarge = figure.getByRole("button", { name: /Enlarge image: Agent skills/ });
    await expect(enlarge).toBeVisible();
    await expect(enlarge).toHaveCSS("border-top-width", "0px");
    // The title sits under the image as a link, not over it.
    await expect(figure.locator("figcaption a")).toHaveAttribute("href", "/research/agent-skills");
    await expect(figure.locator("figcaption")).toHaveText("Cover of the research project Agent skills");
    await expect(figure.locator("figcaption")).toHaveCSS("text-align", "center");

    await enlarge.click();
    const dialog = page.getByRole("dialog", { name: "Agent skills" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL("/");

    // The other linked pages stay plain link cards, their titles shown on hover.
    const card = page.locator('a[href="/projects/portfolio-website"]').last();
    await expect(card).toBeVisible();
    const cardTitle = card.locator("span");
    await expect(cardTitle).toHaveCSS("opacity", "0");
    await card.hover();
    await expect(cardTitle).toHaveCSS("opacity", "1");
  });

  test("many link cards page through a carousel instead of a scrollbar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const slugs = [
      "research/agent-skills",
      "projects/portfolio-website",
      "projects/dokwood",
      "research/acropora-pavilion",
      "research/bending-active-bamboo",
      "research/timber-buildup-data-model",
      "projects/buildsystems-website",
      "projects/kfw-funding-calculator-by-buildsystems",
    ];
    await page.route("**/api/ai", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ answer: slugs.map((s) => `[${s}](/${s})`).join(", ") }),
      }),
    );
    await page.goto("/");
    await page.locator("astro-island:not([ssr])").first().waitFor({ state: "attached" });
    await page.getByRole("button", { name: "What is your PhD about?" }).click();

    const next = page.getByRole("button", { name: "Next links" });
    const previous = page.getByRole("button", { name: "Previous links" });
    await expect(next).toBeVisible();
    await expect(previous).toHaveCount(0);

    await next.click();
    await expect(previous).toBeVisible();
    // Pages to the end: the forward arrow goes away there.
    for (let i = 0; i < 6 && (await next.count()); i++) await next.click();
    await expect(next).toHaveCount(0);
  });
});
