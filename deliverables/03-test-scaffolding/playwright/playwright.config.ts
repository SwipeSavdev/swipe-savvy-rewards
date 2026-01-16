/**
 * Swipe Savvy Platform - Playwright Configuration
 *
 * Configures E2E testing for:
 * - Admin Portal (https://admin.swipesavvy.com)
 * - Wallet Web (https://wallet.swipesavvy.com)
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  // Run tests in parallel
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results.json" }],
    ["junit", { outputFile: "junit-results.xml" }],
  ],

  use: {
    // Base URL configured per project
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Default headers for all requests
    extraHTTPHeaders: {
      "X-Test-Run-Id": process.env.TEST_RUN_ID || `playwright-${Date.now()}`,
    },
  },

  // Project configurations
  projects: [
    // Admin Portal Tests
    {
      name: "admin-chromium",
      testDir: "./tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.ADMIN_URL || "http://localhost:3000",
      },
    },
    {
      name: "admin-firefox",
      testDir: "./tests/admin",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: process.env.ADMIN_URL || "http://localhost:3000",
      },
    },

    // Wallet Web Tests
    {
      name: "wallet-chromium",
      testDir: "./tests/wallet",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.WALLET_URL || "http://localhost:3001",
      },
    },
    {
      name: "wallet-mobile",
      testDir: "./tests/wallet",
      use: {
        ...devices["iPhone 14"],
        baseURL: process.env.WALLET_URL || "http://localhost:3001",
      },
    },

    // Smoke Tests (quick validation)
    {
      name: "smoke",
      testDir: "./tests/smoke",
      testMatch: "**/*.smoke.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
      },
    },

    // Visual Regression Tests
    {
      name: "visual",
      testDir: "./tests/visual",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
      },
    },
  ],

  // Web server configuration for local development
  webServer: [
    {
      command: "npm run dev",
      cwd: "../../../swipesavvy-admin-portal",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      cwd: "../../../swipesavvy-wallet-web",
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
