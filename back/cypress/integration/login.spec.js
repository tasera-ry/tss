
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

    it('Superuser can delete a user from the User Management menu', () => {
      cy.contains('Menu').click()
      cy.contains('User management').click()
    //   cy.contains('tr', supervisor.name)  // gives you the cell of the table row that contains the name
    //   cy.siblings().contains('Delete profile').click()
    //   cy.contains('Confirm').click()
    })
  
    it('Superuser can log out', () => {
      cy.contains('Menu').click()
      cy.contains('Sign Out').click()
      cy.contains('Sign In')  // The sign in option is shown when logged out
    })
  })

  // describe('After supervisor user has been deleted', () => {
  //   it('Deleted user can not log in', () => {
  //     cy.visit('/')
  //     cy.contains('EN').click()
  //     cy.contains('Sign In').click()
  //     cy.get('input[name=username]').type(supervisor.name)
  //     cy.get('input[name=password]').type(supervisor.password)
  //     cy.contains('Log in').click()
  //     cy.contains('Wrong username or password')
  //   })
  // })
})
