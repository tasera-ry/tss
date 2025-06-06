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
    cy.login('superuser');
  });

  const pages = [
    { path: '/#/', name: 'Home', expectedText: 'Week' },
    { path: '/#/scheduling', name: 'Scheduling', expectedText: 'Schedules' },
    { path: '/#/dayview', name: 'Day View', expectedText: 'Back to weekview' },
    { path: '/#/tablet', name: 'Tablet', expectedText: 'Devices' },
		{ path: '/#/usermanagement', name: 'User management', expectedText: 'User management' },
		{ path: '/#/tracks', name: 'Tracks', expectedText: 'Tracks' },
		{ path: '/#/email-settings', name: 'Email settings', expectedText: 'Email settings' },
		{ path: '/#/statistics', name: 'Statistics', expectedText: 'Visitors per track' },
		{ path: '/#/supervisor-raffle', name: 'Supervisor raffle', expectedText: 'Raffle supervisors' },
		{ path: '/#/info', name: 'Info', expectedText: 'Add info' },
  ];

  pages.forEach(({ path, name, expectedText }) => {
    it(`should navigate to the ${name} page`, () => {
      cy.visit(path);
      cy.wait(1000);
      cy.contains(expectedText).should('be.visible');
    })
  });
});