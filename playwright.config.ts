import { defineConfig, devices } from "@playwright/test";

// Outside CI an already running server on this port is reused, whichever
// checkout it serves. From a worktree, pick a free one: PW_PORT=4322 pnpm test:e2e
// PW_BASE_URL runs the suite against a deployed site instead, with no local
// server; only then do the deploy-only checks run (Cloudflare _headers and
// the .well-known files, which `astro dev` does not serve):
// PW_BASE_URL=https://daniellocatelli.com pnpm test:e2e
const port = Number(process.env.PW_PORT) || 4321;
const external = process.env.PW_BASE_URL;
const baseURL = external || `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: external
    ? undefined
    : {
        // Astro 7 sends `astro dev` to the background when an AI agent runs it,
        // and Playwright then sees its process exit. ASTRO_DEV_BACKGROUND turns
        // that detection off; --ignore-lock lets it run next to another server
        // of this checkout. Playwright stops it after the run.
        command: `pnpm exec astro dev --port ${port} --ignore-lock`,
        env: { ASTRO_DEV_BACKGROUND: "1" },
        url: baseURL,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
