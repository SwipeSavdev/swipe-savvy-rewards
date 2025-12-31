const { chromium } = require('playwright');
const { injectAxe, checkA11y } = require('axe-playwright');
const fs = require('fs');

async function scanAccessibility() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  const pages = [
    { url: 'http://localhost:5173', name: 'home' },
  ];

  for (const pageInfo of pages) {
    try {
      console.log(`\n🔍 Scanning ${pageInfo.name}...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      
      // Inject axe
      await injectAxe(page);
      
      // Run axe
      const violations = await page.evaluate(async () => {
        return new Promise((resolve) => {
          window.axe.run({
            runOnly: { type: 'wcag2aa' }
          }, (error, result) => {
            if (error) throw error;
            resolve(result);
          });
        });
      });

      console.log(`✅ ${pageInfo.name}: ${violations.violations.length} violations found`);
      results.push({
        page: pageInfo.name,
        violations: violations.violations
      });
    } catch (error) {
      console.error(`❌ Error scanning ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();
  
  // Save results
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
  console.log('\n📊 Results saved to audit-results.json');
}

scanAccessibility().catch(console.error);
