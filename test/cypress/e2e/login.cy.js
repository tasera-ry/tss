const superuser = {
  name: 'DevSuperuser',
  role: 'superuser',
  password: '2Gordon62',
  email: 'DevSuperuser@email.com',
};

const rangemaster = {
  name: 'Ruthie_Leuschke',
  role: 'rangemaster',
  password: '3Katelynn54',
  email: 'Pauline.Schulist@Kozey.name',
};

const rangeofficer = {
  name: 'DevRangeOfficer1',
  role: 'rangeofficer',
  password: '4Jaron49',
  phone: '788-709-3147',
  email: 'DevRangeOfficer1@hotmail.com',
};

const association = {
  name: 'DevAssociation',
  role: 'association',
  password: '5Effie38',
  phone: '905-680-0458',
  email: 'DevAssociation@yahoo.com',
};

const tempUser = {
  name: 'CypressUser',
  role: '',
  password: '0Marilou36',
  email: 'CypressUser@email.com',
};

describe('Basic user management test suite', () => {
  // Head to the login page
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
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type(superuser.password);
      cy.contains('Log in').click();
      cy.get('nav').contains(superuser.name).should('be.visible');
    });

    it('Rangemaster can log in', () => {
      cy.get('input[name=username]').type(rangemaster.name);
      cy.get('input[name=password]').type(rangemaster.password);
      cy.contains('Log in').click();
      cy.get('nav').contains(rangemaster.name).should('be.visible');
    });

    it('Rangeofficer can log in', () => {
      cy.get('input[name=username]').type(rangeofficer.name);
      cy.get('input[name=password]').type(rangeofficer.password);
      cy.contains('Log in').click();
      cy.get('nav').contains(rangeofficer.name).should('be.visible');
    });

    it('Association can log in', () => {
      cy.get('input[name=username]').type(association.name);
      cy.get('input[name=password]').type(association.password);
      cy.contains('Log in').click();
      cy.get('nav').contains(association.name).should('be.visible');
    });
  });

  context('Logout', () => {
    it('Superuser can log out', () => {
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type(superuser.password);
      cy.contains('Log in').click();

      cy.contains('Menu').click();
      cy.contains('Sign Out').click();
      cy.contains('Sign In');
    });
  });

  context('Login with invalid credentials', () => {
    it('can not log in with incorrect password', () => {
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type('wrongPassword');
      cy.contains('Log in').click();
      cy.contains('Wrong username or password');
    });
  });

  // TODO: Fix user management and enable tests
  describe.skip('Superuser manages users', () => {
    // Delete user after each test
    afterEach(() => {
      cy.contains('th', tempUser.name).should('be.visible');
      cy.contains('th', tempUser.name) // gives you the cell in the table row
        .parent() // selects the row
        .contains('Delete profile')
        .click(); // uses the delete button in the selected row
      cy.contains(`This action will permanently remove user ${tempUser.name}`);
      cy.contains('Confirm').click();
      cy.contains('th', tempUser.name).should('not.exist');
    });

    it('Add and delete an association user from the User Management menu', () => {
      // Log in as superuser
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type(superuser.password);
      cy.contains('Log in').click();
      cy.contains('Menu').click();
      cy.contains('User management').click();
      cy.wait(1000);

      // cy.contains('th', tempUser.name).should('not.exist');
      cy.contains('button', 'Create new user').click();
      cy.get('#name').type(tempUser.name, { force: true });
      cy.get('#passwordField').type(tempUser.password, { force: true });
      cy.get('#sposti').type(tempUser.email, { force: true });
      cy.get('#role').select('Association');
      cy.contains('Save changes').click({ force: true });
      // Here we should check if as notification of success is shown, but adding the
      // user doesn't work correctly yet, so we need to reload the page to see the user
      cy.reload();
      cy.contains('th', tempUser.name).should('be.visible');
    });

    it('Add and delete a rangemaster user from the User Management menu', () => {
      // Log in as superuser
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type(superuser.password);
      cy.contains('Log in').click();
      cy.contains('Menu').click();
      cy.contains('User management').click();
      cy.wait(1000);

      cy.contains('th', tempUser.name).should('not.exist');
      cy.contains('button', 'Create new user').click();
      cy.get('#name').type(tempUser.name, { force: true });
      cy.get('#passwordField').type(tempUser.password, { force: true });
      cy.get('#sposti').type(tempUser.email, { force: true });

      cy.get('#role').select('Range officer');
      cy.get('#associationSelect')
        .should('be.visible')
        .select('DevAssociation');

      cy.contains('Save changes').click({ force: true });
      // Here we should check if as notification of success is shown, but adding the
      // user doesn't work correctly yet, so we need to reload the page to see the user
      cy.reload();
      cy.contains('th', tempUser.name).should('be.visible');
    });

    it('Add and delete a superuser user from the User Management menu', () => {
      // Log in as superuser
      cy.get('input[name=username]').type(superuser.name);
      cy.get('input[name=password]').type(superuser.password);
      cy.contains('Log in').click();
      cy.contains('Menu').click();
      cy.contains('User management').click();
      cy.wait(1000);

      cy.contains('th', tempUser.name).should('not.exist');
      cy.contains('button', 'Create new user').click();
      cy.get('#name').type(tempUser.name, { force: true });
      cy.get('#passwordField').type(tempUser.password, { force: true });
      cy.get('#sposti').type(tempUser.email, { force: true });

      cy.get('#role').select('Superuser');

      cy.contains('Save changes').click({ force: true });
      // Here we should check if as notification of success is shown, but adding the
      // user doesn't work correctly yet, so we need to reload the page to see the user
      cy.reload();
      cy.contains('th', tempUser.name).should('be.visible');
    });
  });

  context('Deleted user testing', () => {
    it('Deleted user can not log in', () => {
      cy.get('input[name=username]').type(tempUser.name);
      cy.get('input[name=password]').type(tempUser.password);
      cy.contains('Log in').click();
      cy.contains('Wrong username or password');
    });
  });
});

