const superuser = {
  name: 'DevSuperuser',
  role: 'superuser',
  password: '2Gordon62',
  email: 'DevSuperuser@email.com',
};

describe('Navigation Tests', () => {
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

  const pages = [
    { path: '/#/', name: 'Home', expectedText: 'Viikko' },
    { path: '/#/scheduling', name: 'Scheduling', expectedText: 'Aikataulut' },
    { path: '/#/dayview', name: 'Day View', expectedText: 'Aukioloaika' },
    { path: '/#/tablet', name: 'Tablet', expectedText: 'Laitteet' },
		{ path: '/#/usermanagement', name: 'User management', expectedText: 'Käyttäjienhallinta' },
		{ path: '/#/tracks', name: 'Tracks', expectedText: 'Radat' },
		{ path: '/#/email-settings', name: 'Email settings', expectedText: 'Sähköpostiasetukset' },
		{ path: '/#/statistics', name: 'Statistics', expectedText: 'Vieraita radoittain' },
		{ path: '/#/supervisor-raffle', name: 'Supervisor raffle', expectedText: 'Arvro valvojat' },
		{ path: '/#/info', name: 'Info', expectedText: 'Lisää viesti' },
  ];

  pages.forEach(({ path, name, expectedText }) => {
    it(`should navigate to the ${name} page`, () => {
      cy.visit(path); 
      cy.contains(expectedText).should('be.visible');
    })
  });
});