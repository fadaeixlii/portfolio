import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Playwright's default testMatch also picks up *.test.ts, which collides
  // with the vitest unit suites under tests/unit/. Every Playwright spec in
  // this repo uses .spec.ts, so scope to that.
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Port 3100, not 3000: see docs/decisions.md. `reuseExistingServer`
    // (true outside CI) is only safe because nothing else has a reason to
    // be listening on this port — a dev server left on 3000 can no longer
    // be silently adopted as the build under test.
    command: "pnpm build && pnpm exec next start -p 3100",
    url: "http://localhost:3100/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
