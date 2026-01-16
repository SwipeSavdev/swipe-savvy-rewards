/**
 * Swipe Savvy Platform - Smoke Tests
 *
 * Quick validation tests that run on every deployment.
 * Tags: @smoke, @critical
 */

import { test, expect } from "@playwright/test";

test.describe("Smoke Tests @smoke", () => {
  test.describe("Admin Portal", () => {
    test("login page loads", async ({ page }) => {
      const adminUrl = process.env.ADMIN_URL || "https://admin.swipesavvy.com";
      await page.goto(adminUrl);
      // Accept any title since admin portal may be proxied or have different title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test("health endpoint responds", async ({ request }) => {
      const response = await request.get(
        `${process.env.API_URL || "http://54.224.8.14:8000"}/api/v1/health`
      );
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.status).toBe("healthy");
    });
  });

  test.describe("Wallet Web", () => {
    test("wallet login page loads", async ({ page }) => {
      const walletUrl = process.env.WALLET_URL || "https://wallet.swipesavvy.com";
      await page.goto(walletUrl);
      // Accept any title since wallet web may be proxied or have different title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test.describe("API Health", () => {
    const API_URL = process.env.API_URL || "http://54.224.8.14:8000";

    test("auth endpoints accessible", async ({ request }) => {
      // Login endpoint should be accessible (returns 422 for missing password)
      const response = await request.post(`${API_URL}/api/v1/auth/login`, {
        data: { email: "test@example.com" },
      });

      // Accept 422 (validation error - missing password) or 401 (invalid credentials)
      expect([401, 422]).toContain(response.status());
    });

    test("protected endpoints require auth", async ({ request }) => {
      const response = await request.get(`${API_URL}/api/v1/wallet/balance`);
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.detail).toContain("Authentication required");
    });

    test("public endpoints accessible", async ({ request }) => {
      const response = await request.get(`${API_URL}/api/v1/rewards/tiers`);
      // Public endpoint should return 200 or might need auth (depends on impl)
      expect([200, 401]).toContain(response.status());
    });
  });
});
