import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('home page accessibility', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
