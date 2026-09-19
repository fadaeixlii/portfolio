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
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
