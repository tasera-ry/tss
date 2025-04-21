/// <reference types="cypress" />

declare global {
  namespace Cypress {
      interface Chainable<Subject> {
          login(user: Username): void
      }
  }
}

import { Username, users } from "../fixtures/users";


Cypress.Commands.add('login', (user: Username) => {
  const { name, password } = users[user];
  cy.visit('/#/signin');
  cy.get('input[name=username]').type(name);
  cy.get('input[name=password]').type(password);
  cy.contains('Log in').click();
  cy.get('nav').contains(name).should('be.visible');
});
