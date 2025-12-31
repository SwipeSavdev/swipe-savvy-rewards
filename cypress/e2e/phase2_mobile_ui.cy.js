import {
  loginUser,
  createCampaign,
  takeScreenshot,
  waitForElement,
  checkPerformanceMetrics,
} from '../support/helpers';

describe('PHASE 2: Mobile Campaign UI Tests', () => {
  beforeEach(() => {
    loginUser();
  });

  // E2E-2.1: Campaign Creation with Mobile Preview
  describe('E2E-2.1: Campaign Creation with Mobile Preview', () => {
    it('should create campaign and preview on mobile', () => {
      cy.visit('/campaigns/create');

      // Fill campaign details
      cy.get('input[name="name"]').type('Mobile UI Test Campaign');
      cy.get('textarea[name="description"]').type('Testing mobile preview');
      cy.get('select[name="layout"]').select('Card');

      // Upload image
      cy.get('input[type="file"]').attachFile('test-banner.png');

      // Add content
      cy.get('input[name="headline"]').type('Spring Sale');
      cy.get('textarea[name="description"]').type('Up to 50% off');
      cy.get('input[name="ctaText"]').type('Shop Now');
      cy.get('select[name="ctaColor"]').select('green');

      // Preview
      cy.get('button:contains("Preview")').click();
      waitForElement('.mobile-preview');

      // Verify preview content
      cy.get('.mobile-preview').should('contain', 'Spring Sale');
      cy.get('.mobile-preview').should('contain', 'Up to 50% off');
      cy.get('.mobile-preview').should('contain', 'Shop Now');

      // Save campaign
      cy.get('button:contains("Save")').click();
      cy.contains('Campaign saved').should('be.visible');

      takeScreenshot('E2E-2.1-mobile-preview');
    });
  });

  // E2E-2.2: Cross-Device Responsive Layout
  describe('E2E-2.2: Cross-Device Responsive Layout', () => {
    const devices = [
      { name: 'iPhone-12', width: 390, height: 844 },
      { name: 'iPhone-14-ProMax', width: 430, height: 932 },
      { name: 'Samsung-S21', width: 360, height: 800 },
    ];

    devices.forEach((device) => {
      it(`should display correctly on ${device.name}`, () => {
        cy.viewport(device.width, device.height);
        cy.visit('/campaigns/1');

        // Verify layout
        cy.get('.campaign-card').should('be.visible');
        cy.get('img').should('be.visible');
        cy.get('button[aria-label="CTA"]').should('be.visible');

        // Verify text readability
        cy.get('.campaign-card').should(($el) => {
          const fontSize = window.getComputedStyle($el.find('h2')[0]).fontSize;
          const size = parseInt(fontSize);
          expect(size).to.be.greaterThan(14); // Minimum 14px for readability
        });

        takeScreenshot(`E2E-2.2-responsive-${device.name}`);
      });
    });
  });

  // E2E-2.3: Campaign Performance Optimization
  describe('E2E-2.3: Campaign Performance Optimization', () => {
    it('should load campaign within performance targets', () => {
      cy.visit('/campaigns/1');

      // Check page load time
      checkPerformanceMetrics({ maxLoadTime: 2000 });

      // Verify images are optimized
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'src');
      });

      // Check for performance issues
      cy.window().then((win) => {
        const perfData = win.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        expect(pageLoadTime).to.be.lessThan(2000);
      });

      takeScreenshot('E2E-2.3-performance');
    });
  });

  // E2E-2.4: Deep Linking & Navigation
  describe('E2E-2.4: Deep Linking & Navigation', () => {
    it('should handle deep links and navigation correctly', () => {
      // Test deep link
      cy.visit('/campaigns/spring-sale-2025');
      cy.url().should('include', '/campaigns/spring-sale-2025');
      cy.contains('Spring Sale').should('be.visible');

      // Test navigation
      cy.get('button:contains("Shop Now")').click();
      cy.url().should('include', '/products');

      // Test back button
      cy.go('back');
      cy.url().should('include', '/campaigns/spring-sale-2025');

      // Test forward button
      cy.go('forward');
      cy.url().should('include', '/products');

      takeScreenshot('E2E-2.4-deep-linking');
    });
  });
});
