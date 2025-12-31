import {
  loginUser,
  createCampaign,
  sendNotification,
  waitForAPI,
  checkAnalyticsMetrics,
  takeScreenshot,
  waitForElement,
} from '../support/helpers';

describe('PHASE 1: Notification Delivery Tests', () => {
  beforeEach(() => {
    loginUser();
  });

  // E2E-1.1: Basic Notification Send
  describe('E2E-1.1: Basic Notification Send', () => {
    it('should send notification and verify delivery', () => {
      const notification = {
        title: 'Exclusive Offer',
        body: 'Get 20% off today',
      };

      cy.visit('/notifications/create');
      cy.get('input[name="title"]').type(notification.title);
      cy.get('textarea[name="body"]').type(notification.body);
      cy.get('button[aria-label="Send"]').click();

      // Verify notification sent
      cy.contains('Notification sent successfully').should('be.visible');
      takeScreenshot('E2E-1.1-notification-sent');

      // Verify campaign shows sent status
      cy.visit('/campaigns');
      cy.contains(notification.title).parent().should('contain', 'Sent');
    });
  });

  // E2E-1.2: Scheduled Notification Delivery
  describe('E2E-1.2: Scheduled Notification Delivery', () => {
    it('should schedule notification for future delivery', () => {
      cy.visit('/notifications/create');
      cy.get('input[name="title"]').type('Scheduled Offer');
      cy.get('textarea[name="body"]').type('This will be sent in 10 minutes');

      // Select schedule option
      cy.get('label:contains("Schedule")').click();
      cy.get('input[type="datetime-local"]').invoke('val').then((currentVal) => {
        const futureTime = new Date(currentVal);
        futureTime.setMinutes(futureTime.getMinutes() + 10);
        cy.get('input[type="datetime-local"]').type(futureTime.toISOString().slice(0, 16));
      });

      cy.get('button[type="submit"]').click();
      cy.contains('Notification scheduled').should('be.visible');
    });
  });

  // E2E-1.3: Multi-User Broadcast
  describe('E2E-1.3: Multi-User Broadcast', () => {
    it('should send notification to multiple users', () => {
      cy.visit('/notifications/create');
      cy.get('input[name="title"]').type('Broadcast Test');
      cy.get('textarea[name="body"]').type('Testing multi-user broadcast');

      // Select audience
      cy.get('select[name="audience"]').select('Test Group A');
      cy.get('button[type="submit"]').click();

      // Verify broadcast metrics
      cy.visit('/analytics/last-campaign');
      cy.contains('Sent:').parent().should('contain', '10'); // 10 users in test group
      cy.contains('Click Rate:').should('be.visible');
    });
  });

  // E2E-1.4: Notification Analytics Tracking
  describe('E2E-1.4: Notification Analytics Tracking', () => {
    it('should track impression, click, and conversion', () => {
      // Create and send campaign
      createCampaign({
        name: 'Analytics Test Campaign',
        offer: '15% discount',
      });

      // Verify analytics tracking
      cy.visit('/analytics');
      cy.contains('Analytics Test Campaign').click();

      // Check metrics exist
      cy.contains('Impressions').should('be.visible');
      cy.contains('Clicks').should('be.visible');
      cy.contains('Conversions').should('be.visible');
      cy.contains('ROI').should('be.visible');

      takeScreenshot('E2E-1.4-analytics');
    });
  });

  // E2E-1.5: Error Handling - Failed Delivery
  describe('E2E-1.5: Error Handling - Failed Delivery', () => {
    it('should handle and display delivery errors', () => {
      // Attempt to send with invalid data
      cy.visit('/notifications/create');
      cy.get('input[name="title"]').type('');
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.contains('Title is required').should('be.visible');

      // Fill correctly and retry
      cy.get('input[name="title"]').type('Valid Title');
      cy.get('textarea[name="body"]').type('Valid body');
      cy.get('button[type="submit"]').click();

      cy.contains('Notification sent').should('be.visible');
    });
  });
});
