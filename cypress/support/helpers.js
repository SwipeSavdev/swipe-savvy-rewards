// Test utilities and helpers

export const API_BASE_URL = 'http://localhost:8000/api';
export const APP_BASE_URL = 'http://localhost:3000';

// Helper: Wait for API response
export function waitForAPI(method, path, options = {}) {
  return cy.intercept(method, `${API_BASE_URL}${path}`, (req) => {
    if (options.statusCode) {
      req.reply((res) => {
        res.statusCode = options.statusCode;
      });
    }
  }).as(`api_${method.toLowerCase()}_${path.replace(/\//g, '_')}`);
}

// Helper: Login user
export function loginUser(email = 'admin@test.com', password = 'password123') {
  cy.visit(`${APP_BASE_URL}/login`);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
}

// Helper: Create campaign
export function createCampaign(campaignData = {}) {
  const defaults = {
    name: 'Test Campaign',
    description: 'Test Description',
    offer: '20% off',
    audience: 'All users',
  };
  const campaign = { ...defaults, ...campaignData };

  cy.visit(`${APP_BASE_URL}/campaigns/create`);
  cy.get('input[name="name"]').type(campaign.name);
  cy.get('textarea[name="description"]').type(campaign.description);
  cy.get('input[name="offer"]').type(campaign.offer);
  cy.get('button[type="submit"]').click();

  return campaign;
}

// Helper: Send notification
export function sendNotification(notificationData = {}) {
  const defaults = {
    title: 'Test Notification',
    body: 'Test message',
    audience: 'All users',
  };
  const notification = { ...defaults, ...notificationData };

  cy.visit(`${APP_BASE_URL}/notifications/create`);
  cy.get('input[name="title"]').type(notification.title);
  cy.get('textarea[name="body"]').type(notification.body);
  cy.get('button[aria-label="Send"]').click();

  return notification;
}

// Helper: Verify API response
export function verifyAPIResponse(path, expectedStatus = 200) {
  cy.request({
    method: 'GET',
    url: `${API_BASE_URL}${path}`,
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.equal(expectedStatus);
  });
}

// Helper: Check analytics metrics
export function checkAnalyticsMetrics(campaignId, expectedMetrics = {}) {
  cy.visit(`${APP_BASE_URL}/analytics/${campaignId}`);

  if (expectedMetrics.impressions) {
    cy.contains('Impressions').parent().should('contain', expectedMetrics.impressions);
  }
  if (expectedMetrics.clicks) {
    cy.contains('Clicks').parent().should('contain', expectedMetrics.clicks);
  }
  if (expectedMetrics.conversions) {
    cy.contains('Conversions').parent().should('contain', expectedMetrics.conversions);
  }

  return cy;
}

// Helper: Create A/B test
export function createABTest(testData = {}) {
  const defaults = {
    name: 'Test A/B',
    variantA: '20% off',
    variantB: '25% off',
    sampleSize: 1000,
  };
  const test = { ...defaults, ...testData };

  cy.visit(`${APP_BASE_URL}/ab-tests/create`);
  cy.get('input[name="name"]').type(test.name);
  cy.get('input[name="variantA"]').type(test.variantA);
  cy.get('input[name="variantB"]').type(test.variantB);
  cy.get('input[name="sampleSize"]').clear().type(test.sampleSize);
  cy.get('button[type="submit"]').click();

  return test;
}

// Helper: Check performance metrics
export function checkPerformanceMetrics(expectedMetrics = {}) {
  cy.window().then((win) => {
    const perfData = win.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    if (expectedMetrics.maxLoadTime) {
      expect(pageLoadTime).to.be.lessThan(expectedMetrics.maxLoadTime);
    }
  });
}

// Helper: Take screenshot with timestamp
export function takeScreenshot(name) {
  const timestamp = new Date().getTime();
  cy.screenshot(`${name}-${timestamp}`);
}

// Helper: Mock API response
export function mockAPIResponse(method, path, response, statusCode = 200) {
  cy.intercept(method, `${API_BASE_URL}${path}`, {
    statusCode,
    body: response,
  }).as(`mock_${method}_${path}`);
}

// Helper: Wait for element visibility
export function waitForElement(selector, timeout = 5000) {
  cy.get(selector, { timeout }).should('be.visible');
}

// Helper: Fill form dynamically
export function fillForm(formData) {
  Object.keys(formData).forEach((key) => {
    const selector = `input[name="${key}"], textarea[name="${key}"], select[name="${key}"]`;
    cy.get(selector).first().clear().type(formData[key]);
  });
}

export default {
  waitForAPI,
  loginUser,
  createCampaign,
  sendNotification,
  verifyAPIResponse,
  checkAnalyticsMetrics,
  createABTest,
  checkPerformanceMetrics,
  takeScreenshot,
  mockAPIResponse,
  waitForElement,
  fillForm,
};
