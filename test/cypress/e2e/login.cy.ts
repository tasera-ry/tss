import { users } from "../fixtures/users";


describe('Basic user management test suite', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.contains('EN').click();
    cy.contains('Sign In').click();
  });

  it('Login form is shown', () => {
    cy.contains('Log in');
  });

  context('Login when the user provides valid credentials', () => {
    it('Superuser can log in', () => {
      cy.login('superuser');
    });

    it('Rangemaster can log in', () => {
      cy.login('rangemaster');
    });

    it('Rangeofficer can log in', () => {
      cy.login('rangeofficer');
    });

    it('Association can log in', () => {
      cy.login('association');
    });
  });

  context('Logout', () => {
    it('Superuser can log out', () => {
      cy.login('superuser');

      cy.contains('Menu').click();
      cy.contains('Sign Out').click();
      cy.contains('Sign In');
    });
  });

  context('Login with invalid credentials', () => {
    it('can not log in with incorrect password', () => {
      const superuser = users.superuser;
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type('wrongPassword');
      cy.contains('Log in').click();
      cy.contains('Wrong username or password');
    });
  });

});

