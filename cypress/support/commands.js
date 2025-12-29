// Custom Cypress commands

Cypress.Commands.add('login', (email = 'admin@test.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createCampaign', (campaignData = {}) => {
  const defaults = {
    name: 'Test Campaign',
    description: 'Test Description',
    offer: '20% off',
  };
  const campaign = { ...defaults, ...campaignData };

  cy.visit('/campaigns/create');
  cy.get('input[name="name"]').type(campaign.name);
  cy.get('textarea[name="description"]').type(campaign.description);
  cy.get('input[name="offer"]').type(campaign.offer);
  cy.get('button[type="submit"]').click();

  return cy.wrap(campaign);
});

Cypress.Commands.add('sendNotification', (data = {}) => {
  const defaults = {
    title: 'Test Notification',
    body: 'Test message',
  };
  const notification = { ...defaults, ...data };

  cy.visit('/notifications/create');
  cy.get('input[name="title"]').type(notification.title);
  cy.get('textarea[name="body"]').type(notification.body);
  cy.get('button[type="submit"]').click();

  return cy.wrap(notification);
});

Cypress.Commands.add('checkAnalytics', (campaignId, metrics = {}) => {
  cy.visit(`/analytics/${campaignId}`);

  if (metrics.impressions) {
    cy.contains('Impressions').parent().should('contain', metrics.impressions);
  }
  if (metrics.clicks) {
    cy.contains('Clicks').parent().should('contain', metrics.clicks);
  }
  if (metrics.conversions) {
    cy.contains('Conversions').parent().should('contain', metrics.conversions);
  }
});

Cypress.Commands.add('verifyPerformance', (maxTime = 2000) => {
  cy.window().then((win) => {
    const perfData = win.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    expect(pageLoadTime).to.be.lessThan(maxTime);
  });
});

Cypress.Commands.add('takeScreenshot', (name) => {
  const timestamp = new Date().getTime();
  cy.screenshot(`${name}-${timestamp}`);
});
