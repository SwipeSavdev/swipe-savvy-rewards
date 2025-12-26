import {
  loginUser,
  takeScreenshot,
  waitForElement,
  fillForm,
} from '../support/helpers';

describe('PHASE 4: Behavioral Learning & Optimization Tests', () => {
  beforeEach(() => {
    loginUser();
  });

  // E2E-4.1: ML Model Training & Prediction
  describe('E2E-4.1: ML Model Training & Prediction', () => {
    it('should train ML models and generate predictions', () => {
      cy.visit('/ml-optimization');

      // Check historical data availability
      cy.contains('90+ days of data available').should('be.visible');

      // Start training
      cy.get('button:contains("Train Models")').click();
      cy.contains('Training in progress').should('be.visible');

      // Wait for training to complete
      cy.get('[data-testid="training-status"]', { timeout: 20000 }).should(
        'contain',
        'Training Complete'
      );

      // Verify model status
      cy.contains('Conversion Prediction Model').parent().should('contain', 'Trained');
      cy.contains('Send Time Optimization').parent().should('contain', 'Trained');
      cy.contains('Offer Optimization').parent().should('contain', 'Trained');
      cy.contains('Affinity Scoring').parent().should('contain', 'Trained');

      // Check metrics
      cy.contains('Accuracy').should('be.visible');
      cy.contains('Precision').should('be.visible');
      cy.contains('Recall').should('be.visible');

      // Verify training timestamp
      cy.contains('Last Training').parent().should('contain', new Date().toLocaleDateString());

      takeScreenshot('E2E-4.1-ml-training');
    });
  });

  // E2E-4.2: A/B Testing with Statistical Analysis
  describe('E2E-4.2: A/B Testing with Statistical Analysis', () => {
    it('should create A/B test and perform statistical analysis', () => {
      cy.visit('/ab-tests/create');

      // Create test
      fillForm({
        name: 'Offer Discount Test',
        description: '15% vs 20% discount',
        variantA: '15% discount',
        variantB: '20% discount',
      });

      // Set audience
      cy.get('input[name="sampleSize"]').type('200');
      cy.get('select[name="confidenceLevel"]').select('95%');
      cy.get('input[name="minimumEffect"]').type('10%');

      // Launch test
      cy.get('button:contains("Launch Test")').click();
      cy.contains('Test launched successfully').should('be.visible');

      // Monitor test progress
      cy.visit('/ab-tests/active');
      cy.contains('Offer Discount Test').click();

      // Wait for sufficient conversions
      cy.get('[data-testid="conversions-a"]', { timeout: 60000 }).should(
        'not.contain',
        '0'
      );
      cy.get('[data-testid="conversions-b"]').should('not.contain', '0');

      // Check statistical analysis
      cy.contains('Chi-squared Value').should('be.visible');
      cy.contains('P-value').should('be.visible');
      cy.contains('Confidence Level').should('be.visible');

      // Check conversion rates
      cy.get('[data-testid="conversion-rate-a"]').invoke('text').then((textA) => {
        expect(parseFloat(textA)).to.be.greaterThan(0);
      });

      cy.get('[data-testid="conversion-rate-b"]').invoke('text').then((textB) => {
        expect(parseFloat(textB)).to.be.greaterThan(0);
      });

      // Wait for significance
      cy.get('[data-testid="winner"]', { timeout: 120000 }).should('contain', 'Variant');

      takeScreenshot('E2E-4.2-ab-testing');
    });
  });

  // E2E-4.3: Optimization Recommendations
  describe('E2E-4.3: Optimization Recommendations', () => {
    it('should generate and apply optimization recommendations', () => {
      cy.visit('/optimization/recommendations');

      // View overview
      cy.contains('Total Recommendations').should('be.visible');
      cy.contains('High Confidence').should('be.visible');
      cy.contains('Estimated Improvement').should('be.visible');

      // Filter by type
      cy.contains('Offer Optimization').click();

      // View recommendations
      cy.get('[data-testid="recommendation-card"]').first().should('be.visible');

      // Click on recommendation
      cy.get('[data-testid="recommendation-card"]').first().click();

      // Check details
      cy.contains('Recommended Action').should('be.visible');
      cy.contains('Confidence Level').should('be.visible');
      cy.contains('Expected Impact').should('be.visible');
      cy.contains('Applied to').should('be.visible');

      // Apply recommendation
      cy.get('button:contains("Apply Recommendation")').click();
      cy.contains('Recommendation applied').should('be.visible');

      // Verify applied recommendations
      cy.visit('/optimization/recommendations');
      cy.contains('Applied').should('be.visible');

      takeScreenshot('E2E-4.3-recommendations');
    });
  });

  // E2E-4.4: Behavioral Segmentation
  describe('E2E-4.4: Behavioral Segmentation', () => {
    it('should create and use behavioral segments', () => {
      cy.visit('/segments');

      // View auto-generated segments
      cy.contains('High Value Customers').should('be.visible');
      cy.contains('At-Risk Customers').should('be.visible');
      cy.contains('New Customers').should('be.visible');
      cy.contains('Seasonal Buyers').should('be.visible');

      // Click on segment
      cy.contains('High Value Customers').click();

      // Check segment details
      cy.contains('Total Users').should('be.visible');
      cy.contains('Average Order Value').should('be.visible');
      cy.contains('Lifetime Value').should('be.visible');
      cy.contains('Churn Probability').should('be.visible');

      // Create campaign for segment
      cy.get('button:contains("Create Campaign")').click();
      cy.get('input[name="name"]').type('VIP Exclusive Offer');
      cy.get('input[name="offer"]').type('Free shipping + 20% off');

      cy.get('button:contains("Create")').click();
      cy.contains('Campaign created for segment').should('be.visible');

      // Compare performance
      cy.visit('/analytics');
      cy.get('select[name="view"]').select('by-segment');

      // Verify segment performance
      cy.contains('High Value').parent().should('contain', 'Click Rate');
      cy.get('[data-testid="segment-performance-chart"]').should('be.visible');

      takeScreenshot('E2E-4.4-segmentation');
    });
  });
});
