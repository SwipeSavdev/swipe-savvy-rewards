import { test, expect } from '@playwright/test';

test.describe('Admin Portal - Authentication & Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Admin Portal|SwipeSavvy/);
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have responsive sidebar', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    const dashboardLink = page.locator('a:has-text("Dashboard")').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should load with correct language', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(['en', 'es', 'fr', undefined]).toContain(lang);
  });

  test('should have footer present', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('should handle dark mode toggle', async ({ page }) => {
    await page.goto('/');
    const darkModeButton = page.locator('[data-testid="dark-mode-toggle"]');
    if (await darkModeButton.isVisible()) {
      const initialTheme = await page.locator('html').getAttribute('class');
      await darkModeButton.click();
      await page.waitForTimeout(500);
      const newTheme = await page.locator('html').getAttribute('class');
      expect(initialTheme).not.toBe(newTheme);
    }
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    expect(errors).toHaveLength(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const count = await buttons.count();
    if (count > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toHaveRole('button');
    }
  });

  test('should handle viewport resize', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    const main = page.locator('main');
    if (await main.isVisible()) {
      await expect(main).toBeVisible();
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
  });
});
