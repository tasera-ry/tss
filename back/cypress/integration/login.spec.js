
const supervisor = {
  name: 'Else_Kovacek',
  role: 'supervisor',
  password: '0Marilou36',
  email: 'Waldo.McDermott@Filomena.com'
}

const superuser = {
  name: 'Grover_Huel',
  role: 'superuser',
  password: '2Everette12',
  email: 'Sienna_Will@hotmail.com'
}

describe('Basic user management test suite', () => {
  describe('Login with incorrect and correct credentials', () => {
    beforeEach( () => {
      cy.visit('/')
      cy.contains('EN').click()
      cy.contains('Sign In').click()
    })

    it('Login form is shown', () => {
      cy.contains('Log in')
    })

    it('User can not log in with incorrect password', () => {
      cy.get('input[name=username]').type(supervisor.name)
      cy.get('input[name=password]').type('wrongPassword')
      cy.contains('Log in').click()
      cy.contains('Wrong username or password')
    })

    it('User can log in with correct credentials', () => {
      cy.get('input[name=username]').type(supervisor.name)
      cy.get('input[name=password]').type(supervisor.password)
      cy.contains('Log in').click()
      cy.contains(supervisor.name)  // When logged in, your username is shown in the nav bar
    })
  })

  describe('Superuser user management test', () => {
    beforeEach( () => {
      cy.visit('/')
      cy.contains('EN').click()
      cy.contains('Sign In').click()
      cy.get('input[name=username]').type(superuser.name)
      cy.get('input[name=password]').type(superuser.password)
      cy.contains('Log in').click()
      cy.contains(superuser.name)  // When logged in, your username is shown in the nav bar
    })

    it('Superuser can delete an user from the User Management menu', () => {
      cy.contains('Menu').click()
      cy.contains('User management').click()
      cy.contains('th', supervisor.name)      // gives you the cell in the table row
        .parent()                             // selects the row
        .contains('Delete profile').click()   // uses the delete button in the selected row

      cy.contains(`This action will permanently remove user ${supervisor.name}`)
      cy.contains('Confirm').click()
    })
  
    it('Superuser can log out', () => {
      cy.contains('Menu').click()
      cy.contains('Sign Out').click()
      cy.contains('Sign In')  // The sign in option is shown when logged out
    })
  })

  describe('Login test with deleted user', () => {
    it('Deleted user can not log in', () => {
      cy.visit('/')
      cy.contains('EN').click()
      cy.contains('Sign In').click()
      cy.get('input[name=username]').type(supervisor.name)
      cy.get('input[name=password]').type(supervisor.password)
      cy.contains('Log in').click()
      cy.contains('Wrong username or password')
    })
  })
})
