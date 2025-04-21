import { users } from "../fixtures/users";


describe('User Management Test Suite', () => {
  // Head to the login page
  beforeEach(() => {
    cy.visit('/');
    cy.contains('EN').click();
    cy.login('superuser');
    cy.visit('/#/usermanagement');
  });

  it('User management page is shown with correct title', () => {
    cy.contains('h1', 'User management').should('be.visible');
  });

  it('Current user card is displayed with correct information', () => {
    cy.contains('You are logged in as:').should('be.visible');
    cy.contains(users.superuser.name).should('be.visible');
    cy.contains('button', 'Change email address').should('be.visible');
    cy.contains('button', 'Change password').should('be.visible');
  });

  it('Add User dialog can be opened and closed', () => {
    cy.contains('button', 'Create new user').click();
    cy.contains('h2', 'Create new user').should('be.visible');
    cy.get('[data-testid="AddUserDialog-Cancel"]').click();
    cy.contains('h2', 'Create new user').should('not.be.visible');
  });

  it('Edit User dialog can be opened and closed', () => {
    cy.get('table tbody tr').first().find('button').click();
    cy.contains('h2', /^Edit user: /).should('be.visible');
    cy.get('[data-testid="CloseIcon"]').click();
    cy.contains('h2', /^Edit user: /).should('not.be.visible');
  });

  it('Current user email change dialog can be opened and closed', () => {
    cy.contains('button', 'Change email address').click();
    cy.contains('h2', 'Change email address').should('be.visible');
    cy.get('[data-testid="ChangeEmailSelfDialog-Cancel"]').click();
    cy.contains('h2', 'Change email address').should('not.exist');
  });

  it('Current user password change dialog can be opened and closed', () => {
    cy.contains('button', 'Change password').click();
    cy.contains('h2', 'Change password').should('be.visible');
    cy.get('[data-testid="ChangePasswordSelfDialog-Cancel"]').click();
    cy.contains('h2', 'Change password').should('not.exist');
  });

});
