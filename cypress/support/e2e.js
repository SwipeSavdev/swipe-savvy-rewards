import './commands';
import './helpers';

Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  return false;
});

beforeEach(() => {
  // Clear any previous auth
  cy.clearCookie('authToken');
  cy.clearLocalStorage();
});
