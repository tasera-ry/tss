const superuser = {
    name: 'DevSuperuser',
    role: 'superuser',
    password: '2Gordon62',
    email: 'DevSuperuser@email.com',
};

const rangemaster = {
  name: "Ruthie_Leuschke",
  role: "rangemaster",
  password: "3Katelynn54",
  email: "Pauline.Schulist@Kozey.name"
};


describe('Tablet view actions as superuser', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.contains('EN').click();
        cy.contains('Sign In').click();
        cy.get('input[name=username]').type(superuser.name);
        cy.get('input[name=password]').type(superuser.password);
        cy.contains('Log in').click();
        cy.contains('Menu').click();
        cy.contains('Tablet view').click();
        cy.wait(1000);
    });
    
    it('Close and open the center in tablet view', () => {
        cy.get('[dataid=rangeOfficerStatus]').invoke('text')
            .then((text) => {
                if (text !== 'Closed') {
                    cy.get('[data-testid="tracksupervisorClosed"]').click();
                }
            });
        cy.get('[dataid=rangeOfficerStatus]').invoke('text').should('eq', 'Closed');
        
        cy.get('[dataid=rangeOfficerStatus]').invoke('text')
            .then((text) => {
                if (text === 'Closed') {
                    cy.get('[data-testid="tracksupervisorPresent"]').click();
                }
            });
        cy.get('[dataid=rangeOfficerStatus]').invoke('text').should('eq', 'Range officer present');
        cy.get('[data-testid="trackSupervisorButton"]').first().should('not.be.disabled');
    });

    it('Make sure track number 0 range officer is present', () => {
        cy.get('[data-testid="trackSupervisorButton"]').first()
            .then(($element) => {
                if ($element.text() === 'No track officer') {
                    cy.wrap($element).click();
                }
            });
        cy.get('[data-testid="trackSupervisorButton"]').first().invoke('text').should('not.eq', 'Closed');
    });

    it('Add a visitor', () => {
        // Range officer should be present or track closed
        cy.get('[data-testid="trackSupervisorButton"]').first().invoke('text')
            .then((text) => {
                expect(text === 'Present' || text === 'Closed').to.be.true;
            });
        // Get the current amount of visitors
        let amountOfVisitors;
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((text) => {
                amountOfVisitors = parseInt(text.trim());
            });
        // Add a visitor
        cy.get('button[name="increase-visitors"]').first().click();
        // Check if the amount of visitors has increased by 1
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((newText) => {
                expect(parseInt(newText.trim())).to.equal(amountOfVisitors + 1);
            });
    });

    it('Remove a visitor', () => {
        // Range officer should be present or track closed
        cy.get('[data-testid="trackSupervisorButton"]').first().invoke('text')
            .then((text) => {
                expect(text === 'Present' || text === 'Closed').to.be.true;
            });
        // Get the current amount of visitors
        let amountOfVisitors;
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((text) => {
                amountOfVisitors = parseInt(text.trim());
            });
        // Remove a visitor
        cy.get('button[name="decrease-visitors"]').first().click();
        cy.contains('Warning!').should('be.visible');
        cy.contains('Yes').click();
        // Check if the amount of visitors has decreased by 1
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((newText) => {
                expect(parseInt(newText.trim())).to.equal(amountOfVisitors - 1);
            });
    });

    it('Cancel removing a visitor', () => {
        // Range officer should be present or track closed
        cy.get('[data-testid="trackSupervisorButton"]').first().invoke('text')
            .then((text) => {
                expect(text === 'Present' || text === 'Closed').to.be.true;
            });
        // Get the current amount of visitors
        let amountOfVisitors;
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((text) => {
                amountOfVisitors = parseInt(text.trim());
            });
        // Remove a visitor
        cy.get('button[name="decrease-visitors"]').first().click();
        cy.contains('Warning!').should('be.visible');
        cy.get('.TrackStatistics_trackContainer__zyk0J').contains('No').click();
        // Check if the amount of visitors is the same
        cy.get('[name="amount-of-visitors"]').first().invoke('text')
            .then((newText) => {
                expect(parseInt(newText.trim())).to.equal(amountOfVisitors);
            });
    });

    it('If track officer is not present, visitor buttons should be disabled', () => {
        // Ensure there is no track officer
        cy.get('[data-testid="trackSupervisorButton"]').first().
            then(($element) => {
                if ($element.text() !== 'No track officer') {
                    cy.wrap($element).click();
                    cy.wait(1000);
                    
                    // Recheck if still not 'No track officer', click again
                    cy.get('[data-testid="trackSupervisorButton"]').first().invoke('text')
                        .then((text) => {
                            if (text !== 'No track officer') {
                                cy.wrap($element).click();
                            }
                        });
                }
            });
        // cy.get('[data-testid="trackSupervisorButton"]').first().should('eq', 'No track officer');
        cy.get('button[name="increase-visitors"]').first().should('be.disabled');
        cy.get('button[name="decrease-visitors"]').first().should('be.disabled');
    });
});