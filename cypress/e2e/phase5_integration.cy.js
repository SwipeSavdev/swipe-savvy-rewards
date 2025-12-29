import {
  loginUser,
  takeScreenshot,
  fillForm,
} from '../support/helpers';

describe('PHASE 5: Integration Tests - Cross-Phase Workflows', () => {
  beforeEach(() => {
    loginUser();
  });

  // E2E-5.1: Complete Customer Journey
  describe('E2E-5.1: Complete Customer Journey (All Phases Integrated)', () => {
    it('should complete full workflow from campaign to conversion attribution', () => {
      // STEP 1: Campaign Creation (Phase 2)
      cy.visit('/campaigns/create');
      fillForm({
        name: 'Spring Menu Launch',
        description: 'Full integration test campaign',
        layout: 'Card',
      });
      cy.get('input[name="offer"]').type('20% off');
      cy.get('button:contains("Create Campaign")').click();
      cy.contains('Campaign created').should('be.visible');

      // STEP 2: Get ML Recommendations (Phase 4)
      cy.visit('/ml-optimization');
      cy.contains('Get Recommendations').click();
      cy.get('[data-testid="recommendation"]')
        .first()
        .within(() => {
          cy.contains('Confidence').should('be.visible');
        });

      // STEP 3: Schedule Notification (Phase 1)
      cy.visit('/notifications/create');
      fillForm({
        title: 'Spring Menu Launch - Get 20% off',
        body: 'Limited time offer',
      });
      cy.get('input[name="sendTime"]').type('2025-12-27T14:00');
      cy.get('button:contains("Schedule")').click();
      cy.contains('Notification scheduled').should('be.visible');

      // STEP 4: Verify Multi-Merchant Deployment (Phase 3)
      cy.visit('/network/campaigns');
      cy.contains('Spring Menu Launch').should('be.visible');
      cy.get('select[name="filterByMerchant"]').select('All Merchants');
      cy.get('[data-testid="campaign-card"]').should('have.length.greaterThan', 0);

      // STEP 5: Check Analytics (Phase 1)
      cy.visit('/analytics');
      cy.contains('Spring Menu Launch').should('be.visible');

      // Simulate user engagement
      cy.get('[data-testid="simulate-impression"]').click();
      cy.contains('Impression recorded').should('be.visible');

      cy.get('[data-testid="simulate-click"]').click();
      cy.contains('Click recorded').should('be.visible');

      cy.get('[data-testid="simulate-conversion"]').click();
      cy.contains('Conversion recorded').should('be.visible');

      // STEP 6: Verify Attribution (Phase 1, 3, 4)
      cy.visit('/analytics/spring-menu-launch');
      cy.contains('Impressions:').should('be.visible');
      cy.contains('Clicks:').should('be.visible');
      cy.contains('Conversions:').should('be.visible');
      cy.contains('ROI:').should('be.visible');

      // Verify merchant attribution (Phase 3)
      cy.contains('Merchant Attribution').click();
      cy.get('[data-testid="merchant-metric"]').should('have.length.greaterThan', 0);

      // STEP 7: Verify ML Learning (Phase 4)
      cy.visit('/ml-optimization');
      cy.contains('Models Updated').should('be.visible');

      // STEP 8: Check Segment Performance (Phase 4)
      cy.visit('/segments');
      cy.contains('High Value').parent().should('contain', 'Updated Today');

      takeScreenshot('E2E-5.1-complete-journey');
    });
  });

  // E2E-5.2: A/B Test with Network-Wide Winners
  describe('E2E-5.2: A/B Test with Network-Wide Winners', () => {
    it('should run network-wide A/B test and apply winners across merchants', () => {
      // STEP 1: Create Network Campaign (Phase 3)
      cy.visit('/network/campaigns/create');
      fillForm({
        name: 'Network A/B Test Campaign',
        description: 'Testing network-wide offer variations',
      });

      cy.get('label:contains("Merchant A")').click();
      cy.get('label:contains("Merchant B")').click();

      // STEP 2: Setup A/B Test (Phase 4)
      cy.contains('Setup A/B Test').click();
      fillForm({
        variantA: '20% discount',
        variantB: 'Buy 2 get 1 free',
        sampleSize: '500',
      });

      cy.get('button:contains("Create A/B Test")').click();
      cy.contains('A/B test created').should('be.visible');

      // STEP 3: Send Notifications (Phase 1, 2)
      cy.contains('Send Campaign').click();
      cy.get('select[name="schedule"]').select('Immediate');
      cy.get('button:contains("Send")').click();
      cy.contains('Campaign sent').should('be.visible');

      // STEP 4: Monitor Test Progress (Phase 4)
      cy.visit('/ab-tests/active');
      cy.contains('Network A/B Test Campaign').click();

      // Wait for results
      cy.get('[data-testid="variant-a-conversions"]', { timeout: 120000 }).should(
        ($el) => {
          expect(parseInt($el.text())).to.be.greaterThan(0);
        }
      );

      // STEP 5: Determine Winner (Phase 4)
      cy.get('[data-testid="test-status"]').should('contain', 'Significant');
      cy.get('[data-testid="winner"]').should('contain', 'Variant');

      // Get winner name
      cy.get('[data-testid="winner"]')
        .invoke('text')
        .then((winnerText) => {
          expect(['Variant A', 'Variant B']).to.include(winnerText.trim());
        });

      // STEP 6: Apply Winner Across Network (Phase 3, 4)
      cy.get('button:contains("Apply Winner")').click();
      cy.contains('Winner applied').should('be.visible');

      // Verify both merchants received winner
      cy.visit('/network/merchants/merchant-a/dashboard');
      cy.contains('Updated with winning offer').should('be.visible');

      cy.visit('/network/merchants/merchant-b/dashboard');
      cy.contains('Updated with winning offer').should('be.visible');

      // STEP 7: Verify Impact (Phase 1, 3, 4)
      cy.visit('/network/analytics');
      cy.get('[data-testid="post-winner-metrics"]').should('be.visible');

      cy.get('[data-testid="metric-improvement"]')
        .invoke('text')
        .then((improvement) => {
          const value = parseFloat(improvement);
          expect(value).to.be.greaterThan(0);
        });

      // STEP 8: Update ML Models (Phase 4)
      cy.visit('/ml-optimization');
      cy.contains('Models Retrained').should('be.visible');

      takeScreenshot('E2E-5.2-network-ab-test');
    });
  });
});
