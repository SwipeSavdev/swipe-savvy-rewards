import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./deliverables/03-test-scaffolding/playwright/tests",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: 0,
  workers: 6,
  reporter: "list",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Smoke tests - API only
    {
      name: "smoke",
      testMatch: "**/smoke.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://54.224.8.14:8000",
      },
    },
    // Admin Portal tests
    {
      name: "admin",
      testMatch: "**/admin/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://admin.swipesavvy.com",
      },
    },
    // Wallet Web tests
    {
      name: "wallet",
      testMatch: "**/wallet/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://wallet.swipesavvy.com",
      },
    },
  ],
});
