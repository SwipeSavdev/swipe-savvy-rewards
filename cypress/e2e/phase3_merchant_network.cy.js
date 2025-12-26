import {
  loginUser,
  takeScreenshot,
  waitForElement,
  fillForm,
} from '../support/helpers';

describe('PHASE 3: Merchant Network Tests', () => {
  beforeEach(() => {
    loginUser('admin@network.com', 'password123');
  });

  // E2E-3.1: Multi-Merchant Campaign Launch
  describe('E2E-3.1: Multi-Merchant Campaign Launch', () => {
    it('should create and launch campaign across multiple merchants', () => {
      cy.visit('/network/campaigns/create');

      // Fill campaign details
      fillForm({
        name: 'Spring Menu Launch',
        description: 'Testing multi-merchant campaign',
        type: 'Network-wide promotion',
      });

      // Select merchants
      cy.get('input[name="merchants"]').click();
      cy.get('label:contains("Merchant A")').click();
      cy.get('label:contains("Merchant B")').click();
      cy.get('label:contains("Merchant C")').click();

      // Configure merchant-specific offers
      cy.get('input[name="merchantA_discount"]').type('15');
      cy.get('input[name="merchantB_offer"]').type('Buy 2 get 1 free');
      cy.get('input[name="merchantC_offer"]').type('Free appetizer');

      // Set audience
      cy.get('select[name="audience"]').select('All loyalty members');

      // Review and launch
      cy.get('button:contains("Review")').click();
      cy.get('button:contains("Launch Campaign")').click();

      cy.contains('Campaign launched successfully').should('be.visible');

      // Verify on merchant dashboards
      cy.visit('/network/merchants/merchant-a/dashboard');
      cy.contains('Spring Menu Launch').should('be.visible');
      cy.contains('15% discount').should('be.visible');

      takeScreenshot('E2E-3.1-multi-merchant');
    });
  });

  // E2E-3.2: Merchant Collaboration & Approval
  describe('E2E-3.2: Merchant Collaboration & Approval', () => {
    it('should support merchant collaboration workflow', () => {
      cy.visit('/network/campaigns/create');

      // Create draft campaign
      fillForm({
        name: 'Summer Promotion',
        description: 'For merchant collaboration',
      });

      cy.get('select[name="status"]').select('Draft');
      cy.get('button:contains("Save Draft")').click();

      // Share with merchant
      cy.get('button:contains("Share")').click();
      cy.get('input[name="merchantEmail"]').type('merchant@test.com');
      cy.get('button:contains("Share")').click();

      cy.contains('Campaign shared').should('be.visible');

      // Simulate merchant feedback
      cy.visit('/network/merchants/merchant-b');
      cy.contains('Summer Promotion').click();
      cy.get('textarea[name="feedback"]').type('Can we adjust the discount to 20%?');
      cy.get('button:contains("Submit Feedback")').click();

      // Admin reviews feedback
      cy.visit('/network/campaigns/summer-promotion');
      cy.contains('Feedback from merchant').should('be.visible');
      cy.contains('Can we adjust the discount to 20%?').should('be.visible');

      // Update campaign
      cy.get('input[name="discount"]').clear().type('20');
      cy.get('button:contains("Save Changes")').click();

      // Merchant approves
      cy.contains('Changes updated').should('be.visible');

      takeScreenshot('E2E-3.2-collaboration');
    });
  });

  // E2E-3.3: Network Analytics Aggregation
  describe('E2E-3.3: Network Analytics Aggregation', () => {
    it('should aggregate analytics across network', () => {
      cy.visit('/network/analytics');

      // Check portfolio overview
      cy.contains('Portfolio Overview').should('be.visible');
      cy.contains('Total campaigns:').should('be.visible');
      cy.contains('Total sent:').should('be.visible');
      cy.contains('Total clicks:').should('be.visible');
      cy.contains('Overall click rate:').should('be.visible');

      // Verify merchant breakdown
      cy.contains('By Merchant').click();
      cy.contains('Merchant A').should('be.visible');
      cy.contains('Merchant B').should('be.visible');
      cy.contains('Merchant C').should('be.visible');

      // Check metrics add up
      cy.get('[data-testid="merchant-a-sent"]').then(($el) => {
        const merchantASent = parseInt($el.text());
        cy.get('[data-testid="merchant-b-sent"]').then(($el2) => {
          const merchantBSent = parseInt($el2.text());
          cy.get('[data-testid="merchant-c-sent"]').then(($el3) => {
            const merchantCSent = parseInt($el3.text());
            const total = merchantASent + merchantBSent + merchantCSent;
            cy.get('[data-testid="total-sent"]').should('contain', total.toString());
          });
        });
      });

      // View trends
      cy.contains('Trends').click();
      cy.get('[data-testid="trends-chart"]').should('be.visible');

      // View top merchants
      cy.contains('Top Merchants').click();
      cy.get('[data-testid="top-merchants-list"]').should('be.visible');

      takeScreenshot('E2E-3.3-network-analytics');
    });
  });
});
