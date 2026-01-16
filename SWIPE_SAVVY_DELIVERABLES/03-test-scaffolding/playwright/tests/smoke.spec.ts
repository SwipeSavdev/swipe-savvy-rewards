import { test, expect } from "@playwright/test";

test("healthcheck page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.*/);
});
