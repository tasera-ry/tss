const superuser = {
  name: 'DevSuperuser',
  role: 'superuser',
  password: '2Gordon62',
  email: 'DevSuperuser@email.com',
};

describe('Basic scheduling test suite', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('EN').click();
    cy.contains('Sign In').click();
    cy.get('input[name=username]').type(superuser.name);
    cy.get('input[name=password]').type(superuser.password);
    cy.contains('Log in').click();
    cy.contains('Menu').click();
    cy.contains('Schedules').click();
    // Give time for the page to load
    cy.wait(1000);
  });

  it('Open the center', () => {
    // Check if the center is not open and then open it
    cy.get('[name="available"]').then(($checkbox) => {
      if (!$checkbox.prop('checked')) {
        cy.get('[name="available"]').check();
      }
    });

    cy.contains('Save changes').click();
    cy.contains('Update successful!').should('be.visible');
    cy.get('[name="available"]').should('be.checked');
  });

  it('Close the center', () => {
    // Check if the center is open and then close it
    cy.get('[name="available"]').then(($checkbox) => {
      if ($checkbox.prop('checked')) {
        cy.get('[name="available"]').uncheck();
      }
    });

    cy.contains('Save changes').click();
    cy.contains('Update successful!').should('be.visible');
    cy.get('[name="available"]').should('not.be.checked');
  });

  it('Set range officer', () => {
    // Check if the center is not open and then open it
    cy.get('[name="available"]').then(($checkbox) => {
      if (!$checkbox.prop('checked')) {
        cy.get('[name="available"]').check();
      }
    });

    // Check if the range officer is not set and then set it
    cy.get('[name="rangeSupervisorSwitch"]').then(($checkbox) => {
      if (!$checkbox.prop('checked')) {
        cy.get('[name="rangeSupervisorSwitch"]').check();
      }
    });

    // Select the range officer
    cy.get('#mui-component-select-rangeSupervisorId').click();
    cy.contains('.MuiMenuItem-root', 'DevAssociation').click();
    cy.contains('Save changes').click();

    cy.contains('Update successful!').should('be.visible');
    cy.get('#mui-component-select-rangeSupervisorId').should(
      'have.text',
      'DevAssociation'
    );
  });
});